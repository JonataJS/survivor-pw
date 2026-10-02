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
  calculateStats,
  CONTACT_DAMAGE_INTERVAL_SECONDS,
  CRIT_MULTIPLIER,
  type EquippedPassive,
} from '../systems/CombatSystem';
import { FireMarkSkill } from '../skills/FireMark';
import { SuddenSpringSkill } from '../skills/SuddenSpring';
import { StoneRainSkill } from '../skills/StoneRain';
import { PhoenixWingsSkill } from '../skills/PhoenixWings';
import { FlamingStormSkill } from '../skills/FlamingStorm';
import { SandStormSkill } from '../skills/SandStorm';
import { createTextButton } from '../ui/textButton';
import { createRng, pickOne, type Rng } from '../core/rng';
import {
  fireMastery,
  waterMastery,
  earthMastery,
  earthShield,
  fireShield,
  serenity,
  passives,
} from '../data/passives';
import { attackSkills, fireMark, movingEarth } from '../data/skills';
import type { Element, PassiveDef, Path, SkillDef } from '../data/types';
import type { Enemy } from '../entities/Enemy';
import type { DamageEffects, Skill } from '../skills/Skill';
import {
  rollUpgradeOptions,
  type EquippedSkillState,
  type UpgradeOption,
} from '../systems/UpgradeSystem';
import { CultivationSystem } from '../systems/CultivationSystem';
import { DamageNumberSystem } from '../systems/DamageNumberSystem';
import { ElementHitEffectSystem } from '../systems/ElementHitEffectSystem';
import { GOD_COLOR, EVIL_COLOR } from '../skills/pathColors';
import type { LevelUpSceneData } from './LevelUpScene';
import type { CultivationSceneData } from './CultivationScene';
import type { HudSceneData } from './HudScene';
import { EventBus } from '../core/EventBus';
import { StatsTracker } from '../systems/StatsTracker';
import { findNearestVisibleTarget } from '../systems/targetLogic';
import { playerClasses } from '../data/classes';
import { resolveRunSetup, type RunSetup } from '../systems/runSetup';

const SKILL_ELEMENTS = new Map<string, Element>(attackSkills.map((skill) => [skill.id, skill.element]));

// Debug-only max level while there's no UI for it yet — lets T030's
// passives be toggled on/off to verify their effect manually.
const DEBUG_PASSIVE_LEVEL = 5;

const GRID_SIZE = 100;
// Independent of the player's combat hitbox (Player.ts' 96x96 setSize) on
// purpose: it used to equal half that hitbox when the hitbox was 32px, and
// just carrying that growth over to 48px would nearly swallow the 60px
// attraction radius (pickupRadius), making gems snap up almost on contact
// instead of visibly flying in. Kept at the original value instead.
const GEM_INSTANT_COLLECT_RADIUS = 16;
// Must stay above the largest possible playerRadius + enemy.contactRadius
// (48 + 16 = 64 for the tank, since the player hitbox grew to 96px — see
// Player.ts) with margin for movement between frames, or handleContactDamage
// can miss enemies that are already in contact range.
const CONTACT_QUERY_RADIUS = 100;

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private spawnSystem!: SpawnSystem;
  private projectileSystem!: ProjectileSystem;
  private gemSystem!: GemSystem;
  private areaEffectSystem!: AreaEffectSystem;
  private damageNumberSystem!: DamageNumberSystem;
  private elementHitEffectSystem!: ElementHitEffectSystem;
  private playerAura!: Phaser.GameObjects.Arc;
  private matchEnded = false;
  private killCount = 0;
  private fastForwardKey!: Phaser.Input.Keyboard.Key;
  private pauseKeyHandler!: (event: KeyboardEvent) => void;
  private debugActive = false;
  private debugText!: Phaser.GameObjects.Text;
  private debugGridGraphics!: Phaser.GameObjects.Graphics;
  private skillSystem!: SkillSystem;
  private skillRng!: Rng;
  private equippedPassives: EquippedPassive[] = [];
  private equippedSkills: EquippedSkillState[] = [];
  private skillInstances = new Map<string, Skill>();
  private statsTracker = new StatsTracker();
  private skillFactories!: Record<string, () => Skill>;
  private pendingLevelUps = 0;
  private levelUpActive = false;
  private onLevelUp = (): void => {
    this.pendingLevelUps += 1;
  };
  private cultivationSystem = new CultivationSystem();
  private pendingCultivation = 0;
  private cultivationActive = false;
  private onCultivationRequired = (): void => {
    this.pendingCultivation += 1;
  };
  // Serenidade god: a cada `interval` segundos, +`damageBonus` de dano por
  // `duration` segundos — global, então fica fora do ciclo de recarga de
  // qualquer skill (calculateDamage's periodicBuffActive é lido daqui).
  private periodicBuffTimer = 0;
  private periodicBuffActiveRemaining = 0;
  private periodicBuffBonus = 0;
  private runSetup!: RunSetup;
  matchElapsedSeconds = 0;

  constructor() {
    super('Game');
  }

  create(data?: RunSetup): void {
    const { width, height } = this.scale;

    this.runSetup = resolveRunSetup(data) ?? resolveRunSetup()!;

    this.matchElapsedSeconds = 0;
    this.matchEnded = false;
    this.killCount = 0;
    this.cameras.main.setBackgroundColor('#0a2a12');
    this.drawWorldGrid();

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    const selectedClass = playerClasses.find((entry) => entry.id === this.runSetup.classId);
    if (!selectedClass) throw new Error(`Playable class not found: ${this.runSetup.classId}`);
    this.player = new Player(this, WORLD_WIDTH / 2, WORLD_HEIGHT / 2, selectedClass);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.spawnSystem = new SpawnSystem(this, WORLD_WIDTH, WORLD_HEIGHT);
    this.projectileSystem = new ProjectileSystem(this);
    this.gemSystem = new GemSystem(this);
    this.areaEffectSystem = new AreaEffectSystem(this);
    this.damageNumberSystem = new DamageNumberSystem(this);
    this.elementHitEffectSystem = new ElementHitEffectSystem(this);
    // T046: aura ao redor do mago, oculta até o Cultivo ser escolhido —
    // troca de cor conforme o caminho (mesma paleta dos efeitos de skill).
    this.playerAura = this.add
      .circle(this.player.x, this.player.y, 22, 0xffffff, 0.25)
      .setVisible(false)
      .setDepth(this.player.depth - 1);

    this.skillRng = createRng(Date.now());
    this.skillSystem = new SkillSystem();
    this.skillFactories = {
      'fire-mark': () => new FireMarkSkill(this.projectileSystem),
      'sudden-spring': () => new SuddenSpringSkill(this.areaEffectSystem),
      'stone-rain': () => new StoneRainSkill(this.areaEffectSystem),
      'phoenix-wings': () => new PhoenixWingsSkill(this.areaEffectSystem),
      'flaming-storm': () => new FlamingStormSkill(this.areaEffectSystem),
      'sand-storm': () => new SandStormSkill(this.areaEffectSystem),
    };
    this.equippedSkills = [];
    this.skillInstances = new Map();
    this.statsTracker = new StatsTracker();
    // spec.md §2: começa apenas com Marca do Fogo; Terra Móvel (dash) já vem
    // desbloqueada mas não ocupa slot de ataque — ver UpgradeSystem.ts.
    this.equippedSkills.push({ def: fireMark, level: 1 });
    this.equipNewSkill(fireMark, 1);
    this.equippedSkills.push({ def: movingEarth, level: 1 });

    this.pendingLevelUps = 0;
    this.levelUpActive = false;
    this.cultivationSystem = new CultivationSystem();
    this.pendingCultivation = 0;
    this.cultivationActive = false;
    EventBus.on('level-up', this.onLevelUp);
    EventBus.on('cultivation-required', this.onCultivationRequired);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off('level-up', this.onLevelUp);
      EventBus.off('cultivation-required', this.onCultivationRequired);
    });

    const hudData: HudSceneData = { player: this.player, equippedSkills: this.equippedSkills };
    this.scene.launch('Hud', hudData);

    const keyboard = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
    this.fastForwardKey = keyboard.addKey('F');
    this.pauseKeyHandler = (event) => {
      if (event.repeat || this.matchEnded || this.levelUpActive || this.cultivationActive) return;
      if (event.code === 'Escape' || event.code === 'KeyP') {
        this.scene.pause();
        this.scene.launch('Pause');
      }
    };
    keyboard.on('keydown', this.pauseKeyHandler);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      keyboard.off('keydown', this.pauseKeyHandler);
    });

    this.debugActive = false;
    keyboard.on('keydown-F1', () => {
      this.debugActive = !this.debugActive;
      this.debugText.setVisible(this.debugActive);
      if (!this.debugActive) this.debugGridGraphics.clear();
    });
    keyboard.on('keydown-F2', () => {
      this.spawnSystem.spawnBurst(debug.stressTestEnemyCount, this.cameras.main.worldView);
    });
    keyboard.on('keydown-F3', () => this.togglePassive(fireMastery));
    keyboard.on('keydown-F4', () => this.togglePassive(waterMastery));
    keyboard.on('keydown-F5', () => this.togglePassive(earthMastery));
    keyboard.on('keydown-F6', () => this.togglePassive(earthShield));
    keyboard.on('keydown-F7', () => this.togglePassive(fireShield));
    keyboard.on('keydown-F8', () => this.togglePassive(serenity));
    keyboard.on('keydown-F9', () => this.forcePath('god'));
    keyboard.on('keydown-F10', () => this.forcePath('evil'));

    this.debugText = this.add
      .text(16, 44, '', { fontSize: '16px', color: '#ffdd55', backgroundColor: '#00000088' })
      .setScrollFactor(0)
      .setVisible(false);
    this.debugGridGraphics = this.add.graphics();

    createTextButton(this, width / 2 - 220, height - 100, 'Pausar', () => {
      this.scene.pause();
      this.scene.launch('Pause');
    }).setScrollFactor(0);
  }

  update(_time: number, delta: number): void {
    if (this.matchEnded) return;

    this.player.setCultivationContext(this.equippedPassives, this.cultivationSystem.path);
    this.player.update(delta / 1000);
    this.updatePeriodicBuff(delta / 1000);
    this.playerAura.setPosition(this.player.x, this.player.y);

    const fastForwarding = this.fastForwardKey.isDown;
    const timeScale = fastForwarding ? debug.fastForwardTimeScale : 1;
    this.matchElapsedSeconds += (delta / 1000) * timeScale;
    EventBus.emit('match-time-changed', Math.min(this.matchElapsedSeconds, MATCH_DURATION_SECONDS));

    if (this.matchElapsedSeconds >= MATCH_DURATION_SECONDS) {
      this.endMatch(true);
      return;
    }

    const regenPerSecond = this.totalRegenPerSecond();
    if (regenPerSecond > 0) {
      this.player.heal(regenPerSecond * (delta / 1000));
    }

    this.spawnSystem.update(delta * timeScale, this.matchElapsedSeconds, this.cameras.main.worldView);
    this.spawnSystem.chaseAll(this.player.x, this.player.y);
    this.skillSystem.update(delta / 1000, {
      casterX: this.player.x,
      casterY: this.player.y,
      facingX: this.player.facingX,
      facingY: this.player.facingY,
      equippedPassives: this.equippedPassives,
      path: this.cultivationSystem.path,
      findNearestVisibleEnemy: (exclude) => {
        const view = this.cameras.main.worldView;
        const searchRadius = Math.hypot(view.width, view.height);
        const candidates = this.spawnSystem.grid.queryNeighbors(
          this.player.x,
          this.player.y,
          searchRadius,
        );
        return findNearestVisibleTarget(
          candidates,
          this.player.x,
          this.player.y,
          view,
          exclude,
        );
      },
      findRandomVisibleEnemy: (exclude) => this.findRandomVisibleEnemy(exclude),
      findStrongestEnemyNearby: (radius, exclude) =>
        this.findStrongestEnemyNearby(radius, exclude),
      findEnemiesInLine: (dirX, dirY, range, halfWidth) =>
        this.findEnemiesInLine(dirX, dirY, range, halfWidth),
      findEnemiesInRadius: (centerX, centerY, radius) =>
        this.findEnemiesInRadius(centerX, centerY, radius),
      dealDamage: (enemy, damage, effects, skillId) =>
        this.dealDamageToEnemy(enemy, damage, effects, skillId),
      healPlayer: (amount) => this.healPlayer(amount),
      rng: this.skillRng,
    });
    this.projectileSystem.update(delta, (enemy, damage, effects, skillId) =>
      this.dealDamageToEnemy(enemy, damage, effects, skillId),
    );
    this.gemSystem.update(
      this.player.x,
      this.player.y,
      this.player.pickupRadius,
      GEM_INSTANT_COLLECT_RADIUS,
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

    // Fila de level-ups e Cultivo (T043): o Cultivo do nível 20 sempre
    // resolve antes de qualquer level-up pendente, inclusive o desse
    // mesmo nível — depois disso a fila de level-ups segue normalmente.
    if (!this.levelUpActive && !this.cultivationActive && this.pendingCultivation > 0) {
      this.pendingCultivation -= 1;
      this.openCultivation();
    } else if (!this.levelUpActive && !this.cultivationActive && this.pendingLevelUps > 0) {
      this.pendingLevelUps -= 1;
      this.openLevelUp();
    }
  }

  private openCultivation(): void {
    this.cultivationActive = true;
    const data: CultivationSceneData = {
      equippedSkills: this.equippedSkills,
      equippedPassives: this.equippedPassives,
      onChoose: (path) => this.handleCultivationChosen(path),
    };
    this.scene.pause();
    this.scene.launch('Cultivation', data);
  }

  private handleCultivationChosen(path: Path): void {
    this.cultivationSystem.choosePath(path);
    this.cultivationActive = false;
    this.updatePathIndicator();
    this.scene.resume();
  }

  private updatePathIndicator(): void {
    const path = this.cultivationSystem.path;
    if (!path) return;
    const color = path === 'god' ? GOD_COLOR : EVIL_COLOR;
    this.playerAura.setFillStyle(color, 0.25).setVisible(true);
  }

  private openLevelUp(): void {
    this.levelUpActive = true;
    const options = rollUpgradeOptions(
      this.skillRng,
      this.equippedSkills,
      this.equippedPassives,
      attackSkills,
      passives,
    );
    const data: LevelUpSceneData = {
      options,
      onChoose: (option) => this.handleUpgradeChosen(option),
    };
    this.scene.pause();
    this.scene.launch('LevelUp', data);
  }

  private handleUpgradeChosen(option: UpgradeOption): void {
    this.applyUpgrade(option);
    this.levelUpActive = false;
    this.scene.resume();
  }

  private applyUpgrade(option: UpgradeOption): void {
    switch (option.kind) {
      case 'new-skill':
        this.equippedSkills.push({ def: option.skill, level: 1 });
        this.equipNewSkill(option.skill, 1);
        EventBus.emit('skill-leveled', option.skill.id, 1);
        break;
      case 'improve-skill': {
        const equipped = this.equippedSkills.find((s) => s.def.id === option.skill.id);
        if (equipped) equipped.level = option.toLevel;
        if (option.skill.id === movingEarth.id) {
          this.player.setDashLevel(option.toLevel);
        } else {
          const instance = this.skillInstances.get(option.skill.id);
          if (instance) instance.level = option.toLevel;
        }
        EventBus.emit('skill-leveled', option.skill.id, option.toLevel);
        break;
      }
      case 'new-passive':
        this.equippedPassives.push({ def: option.passive, level: 1 });
        break;
      case 'improve-passive': {
        const equipped = this.equippedPassives.find((p) => p.def.id === option.passive.id);
        if (equipped) equipped.level = option.toLevel;
        break;
      }
      case 'flat-hp':
        this.player.increaseMaxHp(option.amount);
        break;
    }
  }

  private equipNewSkill(def: SkillDef, level: number): void {
    this.statsTracker.registerSkill(def);
    const factory = this.skillFactories[def.id];
    if (!factory) return;
    const skill = factory();
    skill.level = level;
    this.skillInstances.set(def.id, skill);
    this.skillSystem.add(skill);
  }

  private updateDebugOverlay(): void {
    const fps = this.game.loop.actualFps;
    const totalEntities = this.spawnSystem.activeEnemies.size + 1;
    const cellCount = this.spawnSystem.grid.populatedCellCount;
    const passiveNames = this.equippedPassives.map((p) => p.def.name).join(', ') || 'nenhum';
    this.debugText.setText(
      [
        `FPS: ${fps.toFixed(0)}`,
        `Entidades: ${totalEntities}`,
        `Células ocupadas: ${cellCount}`,
        `XP: ${this.player.xp}   Gemas ativas: ${this.gemSystem.activeGems.size}`,
        `Caminho: ${this.cultivationSystem.path ?? 'nenhum'}`,
        `Passivos: ${passiveNames}`,
        `Defesa física: ${(this.player.physicalDefense + this.totalPhysicalDefenseBonus()).toFixed(1)}` +
          `   Redução de dano: ${(this.totalDamageTakenReduction() * 100).toFixed(0)}%` +
          `   Regen: ${this.totalRegenPerSecond().toFixed(1)}/s`,
        `Buff periódico (Serenidade god): ${this.periodicBuffActiveRemaining > 0 ? `ativo (${this.periodicBuffActiveRemaining.toFixed(1)}s)` : 'inativo'}`,
        '[F1] fechar debug   [F2] +300 inimigos',
        '[F3] Maestria Fogo [F4] Água [F5] Terra [F6] Escudo Terra [F7] Escudo Fogo [F8] Serenidade',
        '[F9] Forçar God   [F10] Forçar Evil',
      ].join('\n'),
    );

    this.debugGridGraphics.clear();
    this.debugGridGraphics.lineStyle(1, 0xffaa00, 0.5);
    const cellSize = this.spawnSystem.grid.cellSize;
    this.spawnSystem.grid.forEachPopulatedCell((cx, cy) => {
      this.debugGridGraphics.strokeRect(cx * cellSize, cy * cellSize, cellSize, cellSize);
    });
  }

  private togglePassive(def: PassiveDef): void {
    const index = this.equippedPassives.findIndex((equipped) => equipped.def.id === def.id);
    if (index !== -1) {
      this.equippedPassives.splice(index, 1);
    } else {
      this.equippedPassives.push({ def, level: DEBUG_PASSIVE_LEVEL });
    }
  }

  private forcePath(path: Path): void {
    this.cultivationSystem.choosePath(path);
    this.updatePathIndicator();
  }

  private updatePeriodicBuff(deltaSeconds: number): void {
    const path = this.cultivationSystem.path;
    const equippedSerenity = this.equippedPassives.find((p) => p.def.id === serenity.id);
    if (!path || !equippedSerenity) {
      this.periodicBuffTimer = 0;
      this.periodicBuffActiveRemaining = 0;
      return;
    }

    const buff = calculateStats(serenity, equippedSerenity.level, [], path).periodicBuff;
    if (!buff) {
      this.periodicBuffActiveRemaining = 0;
      return;
    }

    this.periodicBuffTimer += deltaSeconds;
    if (this.periodicBuffTimer >= buff.interval) {
      this.periodicBuffTimer -= buff.interval;
      this.periodicBuffActiveRemaining = buff.duration;
    }
    this.periodicBuffBonus = buff.damageBonus;
    if (this.periodicBuffActiveRemaining > 0) {
      this.periodicBuffActiveRemaining = Math.max(0, this.periodicBuffActiveRemaining - deltaSeconds);
    }
  }

  private healPlayer(amount: number): void {
    this.player.heal(amount);
  }

  private totalPhysicalDefenseBonus(): number {
    const path = this.cultivationSystem.path;
    let total = 0;
    for (const equipped of this.equippedPassives) {
      if (equipped.def.id !== earthShield.id) continue;
      total += calculateStats(equipped.def, equipped.level, [], path).values.physicalDefenseBonus ?? 0;
    }
    return total;
  }

  private totalRegenPerSecond(): number {
    const path = this.cultivationSystem.path;
    let total = 0;
    for (const equipped of this.equippedPassives) {
      if (equipped.def.id !== fireShield.id) continue;
      total += calculateStats(equipped.def, equipped.level, [], path).values.regenPerSecond ?? 0;
    }
    return total;
  }

  // Escudo de Terra/Fogo god: −15% de dano recebido cada, lido via
  // calculateStats como qualquer outro aditivo; capado pra não zerar o
  // dano de contato por completo se ambos forem equipados no god.
  private totalDamageTakenReduction(): number {
    const path = this.cultivationSystem.path;
    if (!path) return 0;
    let total = 0;
    for (const equipped of this.equippedPassives) {
      if (equipped.def.id !== earthShield.id && equipped.def.id !== fireShield.id) continue;
      total += calculateStats(equipped.def, equipped.level, [], path).damageTakenReduction;
    }
    return Math.min(total, 0.9);
  }

  private findRandomVisibleEnemy(exclude?: Set<Enemy>): Enemy | undefined {
    const view = this.cameras.main.worldView;
    const candidates: Enemy[] = [];
    for (const enemy of this.spawnSystem.activeEnemies) {
      if (!enemy.active || exclude?.has(enemy)) continue;
      if (!Phaser.Geom.Rectangle.Contains(view, enemy.x, enemy.y)) continue;
      candidates.push(enemy);
    }
    if (candidates.length === 0) return undefined;
    return pickOne(this.skillRng, candidates);
  }

  private findStrongestEnemyNearby(radius: number, exclude?: Set<Enemy>): Enemy | undefined {
    const candidates = this.spawnSystem.grid.queryNeighbors(this.player.x, this.player.y, radius);
    let strongest: Enemy | undefined;
    for (const enemy of candidates) {
      if (!enemy.active || exclude?.has(enemy)) continue;
      if (!strongest || enemy.hp > strongest.hp) strongest = enemy;
    }
    return strongest;
  }

  private findEnemiesInLine(
    dirX: number,
    dirY: number,
    range: number,
    halfWidth: number,
  ): Enemy[] {
    const originX = this.player.x;
    const originY = this.player.y;
    const candidates = this.spawnSystem.grid.queryNeighbors(originX, originY, range);
    const result: Enemy[] = [];

    for (const enemy of candidates) {
      if (!enemy.active) continue;

      const dx = enemy.x - originX;
      const dy = enemy.y - originY;
      const along = dx * dirX + dy * dirY;
      if (along < 0 || along > range) continue;

      const perpX = dx - along * dirX;
      const perpY = dy - along * dirY;
      if (Math.hypot(perpX, perpY) > halfWidth + enemy.contactRadius) continue;

      result.push(enemy);
    }
    return result;
  }

  private findEnemiesInRadius(centerX: number, centerY: number, radius: number): Enemy[] {
    const candidates = this.spawnSystem.grid.queryNeighbors(centerX, centerY, radius);
    return candidates.filter((enemy) => enemy.active);
  }

  // Shared hit resolution for every skill (T045): rolls crítico, aplica o
  // buff periódico da Serenidade god, e resolve os aditivos por acerto
  // (roubo de vida, atordoar/paralisar) antes do dano cair no HP.
  private dealDamageToEnemy(
    enemy: Enemy,
    damage: number,
    effects?: DamageEffects,
    skillId?: string,
  ): number {
    const critChance = effects?.critChance ?? 0;
    const isCrit = critChance > 0 && this.skillRng() < critChance;
    const finalDamage = calculateDamage(damage, {
      isCrit,
      critMultiplier: CRIT_MULTIPLIER,
      periodicBuffActive: this.periodicBuffActiveRemaining > 0,
      periodicBuffBonus: this.periodicBuffBonus,
    });

    const previousHp = Math.max(0, enemy.hp);
    enemy.hp -= finalDamage;
    this.statsTracker.recordDamage(skillId, Math.min(previousHp, finalDamage));
    if (isCrit) {
      this.damageNumberSystem.playCrit(enemy.x, enemy.y, finalDamage);
    } else {
      this.damageNumberSystem.playDamage(enemy.x, enemy.y, finalDamage);
    }
    const element = skillId ? SKILL_ELEMENTS.get(skillId) : undefined;
    if (element) this.elementHitEffectSystem.playHit(element, enemy.x, enemy.y);

    for (const status of effects?.statusChances ?? []) {
      if (this.skillRng() >= status.chance) continue;
      if (status.status === 'stun') enemy.applyStun(status.duration);
      if (status.status === 'paralyze') enemy.applyParalyze(status.duration);
    }

    if (effects?.lifesteal && this.skillRng() < effects.lifesteal.chance) {
      this.healPlayer(finalDamage * effects.lifesteal.percentage);
    }

    if (enemy.hp <= 0) {
      this.gemSystem.spawn(enemy.x, enemy.y, enemy.def.xp);
      this.spawnSystem.release(enemy);
      this.killCount += 1;
      EventBus.emit('enemy-killed', this.killCount);
    }

    return finalDamage;
  }

  private handleContactDamage(): void {
    if (this.player.invulnerable) return;

    const playerRadius = this.player.width / 2;
    const nearby = this.spawnSystem.grid.queryNeighbors(
      this.player.x,
      this.player.y,
      CONTACT_QUERY_RADIUS,
    );
    const damageTakenReduction = this.totalDamageTakenReduction();

    for (const enemy of nearby) {
      if (enemy.contactCooldown > 0) continue;
      // Atordoado/paralisado: sem outra ação no MVP, o inimigo também não
      // consegue causar dano de contato enquanto isso durar.
      if (enemy.isStunned || enemy.isParalyzed) continue;

      const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y);
      if (distance > playerRadius + enemy.contactRadius) continue;

      const rawDamage = calculatePhysicalDamage(
        enemy.def.contactDamage * enemy.damageDealtMultiplier,
        this.player.physicalDefense + this.totalPhysicalDefenseBonus(),
      );
      this.player.takeDamage(rawDamage * (1 - damageTakenReduction));
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
    this.scene.start('Result', {
      ...this.statsTracker.createRunResult(
        victory,
        this.matchElapsedSeconds,
        this.player.level,
        this.cultivationSystem.path,
        this.killCount,
      ),
      setup: this.runSetup,
    });
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
