import { describe, expect, it } from 'vitest';
import { DEFAULT_RUN_SETUP, resolveRunSetup, validateRunSetup } from '../src/systems/runSetup';

describe('run setup selection', () => {
  it('defaults to the implemented class and map', () => {
    expect(resolveRunSetup()).toEqual(DEFAULT_RUN_SETUP);
  });

  it('accepts the available class and map', () => {
    expect(validateRunSetup({ classId: 'mage', mapId: 'wolves-den' })).toEqual({
      classId: 'mage',
      mapId: 'wolves-den',
    });
  });

  it.each([
    { classId: 'warrior', mapId: 'wolves-den' },
    { classId: 'mage', mapId: 'fire-cave' },
    { classId: 'unknown', mapId: 'wolves-den' },
    { classId: 'mage', mapId: 'unknown' },
  ])('rejects unavailable or invalid setup $classId/$mapId', (setup) => {
    expect(validateRunSetup(setup)).toBeNull();
  });
});
