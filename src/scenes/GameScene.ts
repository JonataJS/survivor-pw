import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT, MATCH_DURATION_SECONDS, debug } from '../config';
import { Player } from '../entities/Player';
import { SpawnSystem } from '../systems/SpawnSystem';
import { SkillSystem } from '../systems/SkillSystem';
import { ProjectileSystem } from '../systems/ProjectileSystem';
import { GemSystem } from '../systems/GemSystem';
import { AreaEffectSystem } from '../systems/AreaEffectSystem';
import {
  calculateDamage,
  calculatePhysicalDamage,
  CONTACT_DAMAGE_INTERVAL_SECONDS,
} from '../systems/CombatSystem';
import { FireMarkSkill } from '../skills/FireMark';
import { SuddenSpringSkill } from '../skills/SuddenSpring';
import { createTextButton } from '../ui/textButton';
import type { Enemy } from '../entities/Enemy';

const GRID_SIZE = 100;
const CONTACT_QUERY_RADIUS = 64;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private spawnSystem!: SpawnSystem;
  private projectileSystem!: ProjectileSystem;
  private gemSystem!: GemSystem;
  private areaEffectSystem!: AreaEffectSystem;
  private matchEnded = false;
  private timerText!: Phaser.GameObjects.Text;
  private fastForwardKey!: Phaser.Input.Keyboard.Key;
  private debugActive = false;
  private debugText!: Phaser.GameObjects.Text;
  private debugGridGraphics!: Phaser.GameObjects.Graphics;
  private skillSystem!: SkillSystem;
  matchElapsedSeconds = 0;

  constructor() {
    super('Game');
  }

  create(): void {
    const { width, height } = this.scale;

    this.matchElapsedSeconds = 0;
    this.matchEnded = false;
    this.cameras.main.setBackgroundColor('#0a2a12');
    this.drawWorldGrid();

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.spawnSystem = new SpawnSystem(this, WORLD_WIDTH, WORLD_HEIGHT);
    this.projectileSystem = new ProjectileSystem(this);
    this.gemSystem = new GemSystem(this);
    this.areaEffectSystem = new AreaEffectSystem(this);

    this.skillSystem = new SkillSystem();
    this.skillSystem.add(new FireMarkSkill(this.projectileSystem));
    this.skillSystem.add(new SuddenSpringSkill(this.areaEffectSystem));

    const keyboard = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
    this.fastForwardKey = keyboard.addKey('F');

    this.debugActive = false;
    keyboard.on('keydown-F1', () => {
      this.debugActive = !this.debugActive;
      this.debugText.setVisible(this.debugActive);
      if (!this.debugActive) this.debugGridGraphics.clear();
    });
    keyboard.on('keydown-F2', () => {
      this.spawnSystem.spawnBurst(debug.stressTestEnemyCount, this.cameras.main.worldView);
    });

    this.add.text(width / 2, 40, 'Game (placeholder)', { fontSize: '24px' }).setOrigin(0.5).setScrollFactor(0);
    this.timerText = this.add
      .text(width - 16, 16, this.formatTime(0), { fontSize: '20px' })
      .setOrigin(1, 0)
      .setScrollFactor(0);
    this.debugText = this.add
      .text(16, 44, '', { fontSize: '16px', color: '#ffdd55', backgroundColor: '#00000088' })
      .setScrollFactor(0)
      .setVisible(false);
    this.debugGridGraphics = this.add.graphics();

    createTextButton(this, width / 2 - 220, height - 100, 'Pausar', () => {
      this.scene.pause();
      this.scene.launch('Pause');
    }).setScrollFactor(0);

    createTextButton(this, width / 2 - 70, height - 100, 'Level Up', () => {
      this.scene.pause();
      this.scene.launch('LevelUp');
    }).setScrollFactor(0);

    createTextButton(this, width / 2 + 100, height - 100, 'Cultivo', () => {
      this.scene.pause();
      this.scene.launch('Cultivation');
    }).setScrollFactor(0);

    createTextButton(this, width / 2, height - 40, 'Terminar partida', () => {
      this.endMatch(false);
    }).setScrollFactor(0);
  }

  update(_time: number, delta: number): void {
    if (this.matchEnded) return;

    this.player.update();

    const fastForwarding = this.fastForwardKey.isDown;
    const timeScale = fastForwarding ? debug.fastForwardTimeScale : 1;
    this.matchElapsedSeconds += (delta / 1000) * timeScale;
    this.timerText.setText(this.formatTime(this.matchElapsedSeconds));

    if (this.matchElapsedSeconds >= MATCH_DURATION_SECONDS) {
      this.endMatch(true);
      return;
    }

    this.spawnSystem.update(delta * timeScale, this.matchElapsedSeconds, this.cameras.main.worldView);
    this.spawnSystem.chaseAll(this.player.x, this.player.y);
    this.skillSystem.update(delta / 1000, {
      casterX: this.player.x,
      casterY: this.player.y,
      equippedPassives: [],
      path: undefined,
      findNearestEnemy: (exclude) =>
        this.spawnSystem.grid.findNearest(
          this.player.x,
          this.player.y,
          (enemy) => enemy.active && !exclude?.has(enemy),
        ),
      dealDamage: (enemy, damage) => this.dealDamageToEnemy(enemy, damage),
    });
    this.projectileSystem.update(delta, (enemy, damage) => this.dealDamageToEnemy(enemy, damage));
    this.gemSystem.update(
      this.player.x,
      this.player.y,
      this.player.pickupRadius,
      this.player.width / 2,
      (value) => this.player.addXp(value),
    );

    // The debug fast-forward is meant to skip time safely to reach the
    // victory condition; contact damage is paused while it's held so
    // testers aren't killed by the side effect of also speeding up combat.
    if (!fastForwarding) {
      this.handleContactDamage();
    }

    if (this.debugActive) {
      this.updateDebugOverlay();
    }
  }

  private updateDebugOverlay(): void {
    const fps = this.game.loop.actualFps;
    const totalEntities = this.spawnSystem.activeEnemies.size + 1;
    const cellCount = this.spawnSystem.grid.populatedCellCount;
    this.debugText.setText(
      [
        `FPS: ${fps.toFixed(0)}`,
        `Entidades: ${totalEntities}`,
        `Células ocupadas: ${cellCount}`,
        `XP: ${this.player.xp}   Gemas ativas: ${this.gemSystem.activeGems.size}`,
        '[F1] fechar debug   [F2] +300 inimigos',
      ].join('\n'),
    );

    this.debugGridGraphics.clear();
    this.debugGridGraphics.lineStyle(1, 0xffaa00, 0.5);
    const cellSize = this.spawnSystem.grid.cellSize;
    this.spawnSystem.grid.forEachPopulatedCell((cx, cy) => {
      this.debugGridGraphics.strokeRect(cx * cellSize, cy * cellSize, cellSize, cellSize);
    });
  }

  private dealDamageToEnemy(enemy: Enemy, damage: number): void {
    enemy.hp -= calculateDamage(damage);
    if (enemy.hp <= 0) {
      this.gemSystem.spawn(enemy.x, enemy.y, enemy.def.xp);
      this.spawnSystem.release(enemy);
    }
  }

  private handleContactDamage(): void {
    const playerRadius = this.player.width / 2;
    const nearby = this.spawnSystem.grid.queryNeighbors(
      this.player.x,
      this.player.y,
      CONTACT_QUERY_RADIUS,
    );

    for (const enemy of nearby) {
      if (enemy.contactCooldown > 0) continue;

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance > playerRadius + enemy.contactRadius) continue;

      const damage = calculatePhysicalDamage(enemy.def.contactDamage, this.player.physicalDefense);
      this.player.takeDamage(damage);
      enemy.contactCooldown = CONTACT_DAMAGE_INTERVAL_SECONDS;

      if (this.player.hp <= 0) {
        this.endMatch(false);
        return;
      }
    }
  }

  private endMatch(victory: boolean): void {
    if (this.matchEnded) return;
    this.matchEnded = true;
    this.scene.stop('Hud');
    this.scene.start('Result', { victory });
  }

  private formatTime(totalSeconds: number): string {
    const clamped = Math.min(totalSeconds, MATCH_DURATION_SECONDS);
    const minutes = Math.floor(clamped / 60);
    const seconds = Math.floor(clamped % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  private drawWorldGrid(): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x1f4a2a, 1);

    for (let x = 0; x <= WORLD_WIDTH; x += GRID_SIZE) {
      graphics.lineBetween(x, 0, x, WORLD_HEIGHT);
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += GRID_SIZE) {
      graphics.lineBetween(0, y, WORLD_WIDTH, y);
    }
  }
}
