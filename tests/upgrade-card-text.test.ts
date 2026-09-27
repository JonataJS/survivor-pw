import { describe, expect, it } from 'vitest';
import { describeUpgradeOption } from '../src/systems/upgradeCardText';
import { fireMark } from '../src/data/skills';
import { earthShield } from '../src/data/passives';
import type { UpgradeOption } from '../src/systems/UpgradeSystem';

describe('describeUpgradeOption', () => {
  it('nova skill: título, elemento e valores do nível 1', () => {
    const option: UpgradeOption = { kind: 'new-skill', skill: fireMark };
    const card = describeUpgradeOption(option);

    expect(card.title).toBe('Marca do Fogo');
    expect(card.element).toBe('fire');
    expect(card.levelLabel).toContain('1');
    expect(card.description).toContain('Dano: 10');
    expect(card.description).toContain('Recarga: 1.5s');
  });

  it('melhorar skill: mostra nível atual → próximo e só os campos que mudaram', () => {
    const option: UpgradeOption = {
      kind: 'improve-skill',
      skill: fireMark,
      fromLevel: 1,
      toLevel: 2,
    };
    const card = describeUpgradeOption(option);

    expect(card.levelLabel).toBe('Nível 1 → 2');
    expect(card.description).toContain('Dano: 10 → 14');
    // cooldown doesn't change between level 1 and 2 (1.5s both) — should be omitted
    expect(card.description).not.toContain('Recarga');
  });

  it('melhorar passivo com formato percentual', () => {
    const option: UpgradeOption = {
      kind: 'improve-passive',
      passive: earthShield,
      fromLevel: 1,
      toLevel: 2,
    };
    const card = describeUpgradeOption(option);

    expect(card.description).toContain('Defesa física: 2 → 4');
  });

  it('bônus de HP', () => {
    const option: UpgradeOption = { kind: 'flat-hp', amount: 20 };
    const card = describeUpgradeOption(option);

    expect(card.title).toBe('Vitalidade');
    expect(card.description).toBe('+20 HP máximo');
  });
});
