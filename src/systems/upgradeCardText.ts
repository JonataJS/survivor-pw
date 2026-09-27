import type { Element, SkillLevelStats } from '../data/types';
import type { UpgradeOption } from './UpgradeSystem';

export interface UpgradeCardText {
  title: string;
  element?: Element;
  levelLabel: string;
  description: string;
}

type FieldFormat = 'flat' | 'percent' | 'seconds' | 'per-second';

interface FieldMeta {
  label: string;
  format: FieldFormat;
}

// Portuguese labels for every numeric field used across skills.ts/passives.ts
// (spec.md §5) — the level-up cards read from this, not raw field names, per
// CLAUDE.md's "texto exibido ao jogador em português".
const FIELD_META: Record<string, FieldMeta> = {
  damage: { label: 'Dano', format: 'flat' },
  cooldown: { label: 'Recarga', format: 'seconds' },
  projectiles: { label: 'Projéteis', format: 'flat' },
  slowPercentage: { label: 'Lentidão', format: 'percent' },
  slowDuration: { label: 'Duração da lentidão', format: 'seconds' },
  spouts: { label: 'Colunas', format: 'flat' },
  rocks: { label: 'Pedras', format: 'flat' },
  knockback: { label: 'Força do empurrão', format: 'flat' },
  range: { label: 'Alcance', format: 'flat' },
  phoenixCount: { label: 'Fênix', format: 'flat' },
  radius: { label: 'Raio', format: 'flat' },
  damageReduction: { label: 'Redução de dano do alvo', format: 'percent' },
  debuffDuration: { label: 'Duração do efeito', format: 'seconds' },
  distance: { label: 'Distância do dash', format: 'flat' },
  elementDamageBonus: { label: 'Dano do elemento', format: 'percent' },
  physicalDefenseBonus: { label: 'Defesa física', format: 'flat' },
  regenPerSecond: { label: 'Regeneração', format: 'per-second' },
  cooldownReduction: { label: 'Redução de espera', format: 'percent' },
};

function formatValue(field: string, value: number): string {
  const meta = FIELD_META[field];
  switch (meta?.format) {
    case 'percent':
      return `${Math.round(value * 100)}%`;
    case 'seconds':
      return `${value.toFixed(1)}s`;
    case 'per-second':
      return `${value.toFixed(1)}/s`;
    default:
      return Number.isInteger(value) ? `${value}` : value.toFixed(1);
  }
}

function fieldLabel(field: string): string {
  return FIELD_META[field]?.label ?? field;
}

// Lists every numeric field, showing "antes → depois" when it changed
// between levels, or just the level-1 value for a brand new skill/passive.
function describeLevelStats(
  levels: SkillLevelStats[],
  fromLevel: number | undefined,
  toLevel: number,
): string {
  const toStats = levels[toLevel - 1] ?? {};
  const fromStats = fromLevel !== undefined ? (levels[fromLevel - 1] ?? {}) : undefined;

  const lines: string[] = [];
  for (const [field, value] of Object.entries(toStats)) {
    const label = fieldLabel(field);
    const previous = fromStats?.[field];
    if (previous === value) continue;
    lines.push(
      previous === undefined
        ? `${label}: ${formatValue(field, value)}`
        : `${label}: ${formatValue(field, previous)} → ${formatValue(field, value)}`,
    );
  }
  return lines.join('\n');
}

export function describeUpgradeOption(option: UpgradeOption): UpgradeCardText {
  switch (option.kind) {
    case 'new-skill':
      return {
        title: option.skill.name,
        element: option.skill.element,
        levelLabel: 'Nova skill — nível 1',
        description: describeLevelStats(option.skill.levels, undefined, 1),
      };
    case 'improve-skill':
      return {
        title: option.skill.name,
        element: option.skill.element,
        levelLabel: `Nível ${option.fromLevel} → ${option.toLevel}`,
        description: describeLevelStats(option.skill.levels, option.fromLevel, option.toLevel),
      };
    case 'new-passive':
      return {
        title: option.passive.name,
        element: option.passive.element,
        levelLabel: 'Novo passivo — nível 1',
        description: describeLevelStats(option.passive.levels, undefined, 1),
      };
    case 'improve-passive':
      return {
        title: option.passive.name,
        element: option.passive.element,
        levelLabel: `Nível ${option.fromLevel} → ${option.toLevel}`,
        description: describeLevelStats(option.passive.levels, option.fromLevel, option.toLevel),
      };
    case 'flat-hp':
      return {
        title: 'Vitalidade',
        levelLabel: '',
        description: `+${option.amount} HP máximo`,
      };
  }
}
