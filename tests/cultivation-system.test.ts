import { describe, expect, it } from 'vitest';
import { CultivationSystem } from '../src/systems/CultivationSystem';
import { calculateStats } from '../src/systems/CombatSystem';
import { fireMark } from '../src/data/skills';
import { EventBus } from '../src/core/EventBus';

describe('CultivationSystem', () => {
  it('começa sem caminho escolhido', () => {
    const system = new CultivationSystem();
    expect(system.path).toBeUndefined();
  });

  it('guarda o caminho escolhido e avisa via EventBus', () => {
    const system = new CultivationSystem();
    const chosen: string[] = [];
    const onChosen = (path: string) => chosen.push(path);
    EventBus.on('cultivation-chosen', onChosen);

    system.choosePath('god');

    EventBus.off('cultivation-chosen', onChosen);
    expect(system.path).toBe('god');
    expect(chosen).toEqual(['god']);
  });

  it('skill pega depois da escolha já recebe o aditivo do caminho', () => {
    const system = new CultivationSystem();
    system.choosePath('god');

    // Marca do Fogo God: 30% de chance de roubar vida — a skill nem
    // existia quando o jogador escolheu o caminho, mas calculateStats lê
    // system.path a cada chamada, então o aditivo já vem aplicado.
    const stats = calculateStats(fireMark, 1, [], system.path);
    expect(stats.lifesteal).toEqual({ chance: 0.3, percentage: 0.2 });
  });

  it('sem caminho escolhido, nenhum aditivo é aplicado', () => {
    const system = new CultivationSystem();
    const stats = calculateStats(fireMark, 1, [], system.path);
    expect(stats.lifesteal).toBeUndefined();
  });
});
