import Phaser from 'phaser';
import { MATCH_DURATION_SECONDS } from '../config';
import { xpToNextLevel } from '../systems/XpSystem';
import { EventBus } from '../core/EventBus';
import { TouchControls } from '../ui/TouchControls';
import { GOD_COLOR, EVIL_COLOR } from '../skills/pathColors';
import { skillIconTextureKey } from './BootScene';
import { movingEarth } from '../data/skills';
import type { Player } from '../entities/Player';
import type { EquippedSkillState } from '../systems/UpgradeSystem';
import type { Skill } from '../skills/Skill';
import type { Element, Path } from '../data/types';

export interface HudSceneData {
  player: Player;
  equippedSkills: EquippedSkillState[];
  skillInstances: ReadonlyMap<string, Skill>;
}

const ELEMENT_COLORS: Record<Element, number> = {
  fire: 0xff5522,
  water: 0x3388ff,
  earth: 0x8a5a2b,
};

const HP_BAR_WIDTH = 220;
const HP_BAR_HEIGHT = 18;
const XP_BAR_WIDTH = 220;
const XP_BAR_HEIGHT = 8;
const BAR_X = 16;
const HP_BAR_Y = 16;
const XP_BAR_Y = HP_BAR_Y + HP_BAR_HEIGHT + 8;

const SKILL_ICON_SIZE = 36;
const SKILL_ICON_GAP = 8;

// plan.md §"EventBus": HudScene só lê o estado do jogo pelo EventBus (ou
// pela referência do Player passada em `HudSceneData`) — nunca o modifica.
export class HudScene extends Phaser.Scene {
  private hpBarFill!: Phaser.GameObjects.Rectangle;
  private hpText!: Phaser.GameObjects.Text;
  private xpBarFill!: Phaser.GameObjects.Rectangle;
  private levelText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private killsText!: Phaser.GameObjects.Text;
  private dashFill!: Phaser.GameObjects.Rectangle;
  private dashText!: Phaser.GameObjects.Text;
  private pathIcon!: Phaser.GameObjects.Arc;
  private pathText!: Phaser.GameObjects.Text;
  private skillIcons = new Map<
    string,
    {
      cooldownOverlay: Phaser.GameObjects.Graphics;
      cooldownText: Phaser.GameObjects.Text;
      levelText: Phaser.GameObjects.Text;
    }
  >();
  private skillIconsRow!: Phaser.GameObjects.Container;
  private touchEnabled = false;

  private player!: Player;
  private equippedSkills!: EquippedSkillState[];
  private skillInstances!: ReadonlyMap<string, Skill>;
  private path: Path | undefined;

  private readonly onHpChanged = (hp: number, maxHp: number): void => this.updateHpBar(hp, maxHp);
  private readonly onXpChanged = (xp: number, xpToNext: number): void =>
    this.updateXpBar(xp, xpToNext);
  private readonly onLevelUp = (level: number): void => {
    this.levelText.setText(`Nível ${level}`);
  };
  private readonly onEnemyKilled = (count: number): void => {
    this.killsText.setText(`Mortes: ${count}`);
  };
  private readonly onMatchTimeChanged = (elapsedSeconds: number): void => {
    this.timerText.setText(this.formatTime(elapsedSeconds));
  };
  private readonly onSkillLeveled = (): void => this.rebuildSkillIcons();
  private readonly onCultivationChosen = (path: Path): void => {
    this.path = path;
    this.updatePathIndicator();
  };

  constructor() {
    super('Hud');
  }

  create(data: HudSceneData): void {
    this.player = data.player;
    this.equippedSkills = data.equippedSkills;
    this.skillInstances = data.skillInstances;
    this.path = undefined;
    this.touchEnabled = this.sys.game.device.input.touch;

    // HP bar
    this.add.rectangle(
      BAR_X + HP_BAR_WIDTH / 2,
      HP_BAR_Y + HP_BAR_HEIGHT / 2,
      HP_BAR_WIDTH,
      HP_BAR_HEIGHT,
      0x220000,
    ).setOrigin(0.5).setScrollFactor(0).setStrokeStyle(2, 0x000000);
    this.hpBarFill = this.add
      .rectangle(BAR_X, HP_BAR_Y, HP_BAR_WIDTH, HP_BAR_HEIGHT, 0x33cc55)
      .setOrigin(0, 0)
      .setScrollFactor(0);
    this.hpText = this.add
      .text(BAR_X + HP_BAR_WIDTH / 2, HP_BAR_Y + HP_BAR_HEIGHT / 2, '', {
        fontSize: '13px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // XP bar + level
    this.add.rectangle(
      BAR_X + XP_BAR_WIDTH / 2,
      XP_BAR_Y + XP_BAR_HEIGHT / 2,
      XP_BAR_WIDTH,
      XP_BAR_HEIGHT,
      0x111133,
    ).setOrigin(0.5).setScrollFactor(0).setStrokeStyle(1, 0x000000);
    this.xpBarFill = this.add
      .rectangle(BAR_X, XP_BAR_Y, 0, XP_BAR_HEIGHT, 0x3388ff)
      .setOrigin(0, 0)
      .setScrollFactor(0);
    this.levelText = this.add
      .text(BAR_X, XP_BAR_Y + XP_BAR_HEIGHT + 4, 'Nível 1', {
        fontSize: '14px',
        color: '#dddddd',
      })
      .setScrollFactor(0);

    // Timer + kills (top-right)
    const { width } = this.scale;
    this.timerText = this.add
      .text(width - 16, 16, this.formatTime(0), { fontSize: '20px' })
      .setOrigin(1, 0)
      .setScrollFactor(0);
    this.killsText = this.add
      .text(width - 16, 44, 'Mortes: 0', { fontSize: '16px', color: '#dddddd' })
      .setOrigin(1, 0)
      .setScrollFactor(0);

    // Dash cooldown (below timer/kills)
    this.add
      .rectangle(width - 16 - 90, 72, 90, 18, 0x222222)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setStrokeStyle(1, 0x8a5a2b);
    this.dashFill = this.add
      .rectangle(width - 16 - 90, 72, 90, 18, 0x8a5a2b, 0.6)
      .setOrigin(0, 0)
      .setScrollFactor(0);
    this.dashText = this.add
      .text(width - 16 - 45, 81, 'Dash', { fontSize: '13px', color: '#ffffff' })
      .setOrigin(0.5)
      .setScrollFactor(0);

    // Cultivation path icon (hidden until chosen)
    this.pathIcon = this.add
      .circle(width - 16 - 8, 104, 8, 0xffffff)
      .setScrollFactor(0)
      .setVisible(false);
    this.pathText = this.add
      .text(width - 16 - 20, 104, '', { fontSize: '14px', color: '#ffffff' })
      .setOrigin(1, 0.5)
      .setScrollFactor(0);

    // Skill icons row (bottom-left)
    this.skillIconsRow = this.add.container(16, this.scale.height - SKILL_ICON_SIZE - 16);
    this.skillIconsRow.setScrollFactor(0);
    if (this.touchEnabled) {
      this.input.addPointer(1);
      new TouchControls(this, this.player);
    }

    this.updateHpBar(this.player.hp, this.player.maxHp);
    this.updateXpBar(this.player.xp, xpToNextLevel(this.player.level));
    this.levelText.setText(`Nível ${this.player.level}`);
    this.rebuildSkillIcons();

    EventBus.on('hp-changed', this.onHpChanged);
    EventBus.on('xp-changed', this.onXpChanged);
    EventBus.on('level-up', this.onLevelUp);
    EventBus.on('enemy-killed', this.onEnemyKilled);
    EventBus.on('match-time-changed', this.onMatchTimeChanged);
    EventBus.on('skill-leveled', this.onSkillLeveled);
    EventBus.on('cultivation-chosen', this.onCultivationChosen);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off('hp-changed', this.onHpChanged);
      EventBus.off('xp-changed', this.onXpChanged);
      EventBus.off('level-up', this.onLevelUp);
      EventBus.off('enemy-killed', this.onEnemyKilled);
      EventBus.off('match-time-changed', this.onMatchTimeChanged);
      EventBus.off('skill-leveled', this.onSkillLeveled);
      EventBus.off('cultivation-chosen', this.onCultivationChosen);
    });
  }

  update(): void {
    // Recarga do dash muda a cada frame do próprio jogo, então é lida
    // direto da referência do Player em vez de emitir um evento por frame.
    const remaining = this.player.dashCooldownRemaining;
    const total = this.player.dashCooldownDuration;
    const ready = remaining <= 0;
    this.dashFill.setDisplaySize(ready ? 90 : 90 * (1 - remaining / Math.max(total, 0.001)), 18);
    this.dashText.setText(ready ? 'Dash: pronto' : `Dash: ${remaining.toFixed(1)}s`);

    this.updateSkillCooldowns();
  }

  // Lê a recarga de cada skill equipada direto da instância viva (ou do
  // Player, para Terra Móvel) a cada frame — mesmo padrão do dash acima —
  // e desenha o "ponteiro de relógio" como um setor escuro que encolhe
  // sobre o ícone até a skill ficar pronta.
  private updateSkillCooldowns(): void {
    for (const equipped of this.equippedSkills) {
      const icon = this.skillIcons.get(equipped.def.id);
      if (!icon) continue;

      const { remaining, total } = this.getSkillCooldown(equipped.def.id);
      const ratio = total > 0 ? Phaser.Math.Clamp(remaining / total, 0, 1) : 0;

      icon.cooldownOverlay.clear();
      if (ratio > 0) {
        const center = SKILL_ICON_SIZE / 2;
        const radius = SKILL_ICON_SIZE / 2 - 2;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + ratio * Math.PI * 2;
        icon.cooldownOverlay.fillStyle(0x000000, 0.7);
        icon.cooldownOverlay.beginPath();
        icon.cooldownOverlay.moveTo(center, center);
        icon.cooldownOverlay.slice(center, center, radius, startAngle, endAngle, false);
        icon.cooldownOverlay.closePath();
        icon.cooldownOverlay.fillPath();
      }
      icon.cooldownText.setText(remaining >= 0.95 ? `${Math.ceil(remaining)}` : '');
    }
  }

  private getSkillCooldown(skillId: string): { remaining: number; total: number } {
    if (skillId === movingEarth.id) {
      return { remaining: this.player.dashCooldownRemaining, total: this.player.dashCooldownDuration };
    }
    const skill = this.skillInstances.get(skillId);
    if (!skill) return { remaining: 0, total: 0 };
    return { remaining: skill.cooldownRemaining, total: skill.cooldownDuration };
  }

  private updateHpBar(hp: number, maxHp: number): void {
    const ratio = maxHp > 0 ? Phaser.Math.Clamp(hp / maxHp, 0, 1) : 0;
    this.hpBarFill.setDisplaySize(HP_BAR_WIDTH * ratio, HP_BAR_HEIGHT);
    this.hpBarFill.setFillStyle(ratio <= 0.3 ? 0xcc3333 : 0x33cc55);
    this.hpText.setText(`${Math.ceil(hp)} / ${Math.ceil(maxHp)}`);
  }

  private updateXpBar(xp: number, xpToNext: number): void {
    const ratio = xpToNext > 0 ? Phaser.Math.Clamp(xp / xpToNext, 0, 1) : 0;
    this.xpBarFill.setDisplaySize(XP_BAR_WIDTH * ratio, XP_BAR_HEIGHT);
  }

  private updatePathIndicator(): void {
    if (!this.path) return;
    const color = this.path === 'god' ? GOD_COLOR : EVIL_COLOR;
    this.pathIcon.setFillStyle(color).setVisible(true);
    this.pathText
      .setText(this.path === 'god' ? 'God' : 'Evil')
      .setColor(this.path === 'god' ? '#ffd700' : '#cc66ff');
  }

  private rebuildSkillIcons(): void {
    this.skillIconsRow.removeAll(true);
    this.skillIcons.clear();

    const rowWidth = this.equippedSkills.length * (SKILL_ICON_SIZE + SKILL_ICON_GAP) - SKILL_ICON_GAP;
    const rowX = this.touchEnabled ? (this.scale.width - rowWidth) / 2 : 16;
    this.skillIconsRow.setPosition(rowX, this.scale.height - SKILL_ICON_SIZE - 16);

    this.equippedSkills.forEach((equipped, index) => {
      const slot = this.add.container(index * (SKILL_ICON_SIZE + SKILL_ICON_GAP), 0);
      const center = SKILL_ICON_SIZE / 2;
      const color = ELEMENT_COLORS[equipped.def.element];

      const bg = this.add
        .rectangle(0, 0, SKILL_ICON_SIZE, SKILL_ICON_SIZE, 0x111111)
        .setOrigin(0, 0)
        .setStrokeStyle(2, color);
      const icon = this.add
        .image(center, center, skillIconTextureKey(equipped.def.id))
        .setDisplaySize(SKILL_ICON_SIZE - 6, SKILL_ICON_SIZE - 6);
      const cooldownOverlay = this.add.graphics();
      const cooldownText = this.add
        .text(center, center, '', { fontSize: '15px', color: '#ffffff', fontStyle: 'bold' })
        .setOrigin(0.5);
      const levelText = this.add
        .text(SKILL_ICON_SIZE - 4, SKILL_ICON_SIZE - 4, `${equipped.level}`, {
          fontSize: '13px',
          color: '#ffffff',
          backgroundColor: '#000000aa',
        })
        .setOrigin(1, 1);

      slot.add([bg, icon, cooldownOverlay, cooldownText, levelText]);
      this.skillIconsRow.add(slot);
      this.skillIcons.set(equipped.def.id, { cooldownOverlay, cooldownText, levelText });
    });
  }

  private formatTime(totalSeconds: number): string {
    const clamped = Math.min(totalSeconds, MATCH_DURATION_SECONDS);
    const minutes = Math.floor(clamped / 60);
    const seconds = Math.floor(clamped % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
