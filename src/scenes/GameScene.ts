import Phaser from 'phaser';
import { WORLD_WIDTH, WORLD_HEIGHT } from '../config';
import { Player } from '../entities/Player';
import { SpawnSystem } from '../systems/SpawnSystem';
import { createTextButton } from '../ui/textButton';

const GRID_SIZE = 100;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private spawnSystem!: SpawnSystem;
  matchElapsedSeconds = 0;

  constructor() {
    super('Game');
  }

  create(): void {
    const { width, height } = this.scale;

    this.matchElapsedSeconds = 0;
    this.cameras.main.setBackgroundColor('#0a2a12');
    this.drawWorldGrid();

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.spawnSystem = new SpawnSystem(this, WORLD_WIDTH, WORLD_HEIGHT);

    this.add.text(width / 2, 40, 'Game (placeholder)', { fontSize: '24px' }).setOrigin(0.5).setScrollFactor(0);

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
      this.scene.stop('Hud');
      this.scene.start('Result');
    }).setScrollFactor(0);
  }

  update(_time: number, delta: number): void {
    this.player.update();

    this.matchElapsedSeconds += delta / 1000;
    this.spawnSystem.update(delta, this.matchElapsedSeconds, this.cameras.main.worldView);
    this.spawnSystem.chaseAll(this.player.x, this.player.y);
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
