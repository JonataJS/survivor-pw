import { describe, expect, it } from 'vitest';
import { findNearestVisibleTarget } from '../src/systems/targetLogic';

describe('findNearestVisibleTarget', () => {
  const view = { x: 0, y: 0, width: 100, height: 100 };

  it('picks the nearest active target inside the camera view', () => {
    const visible = { x: 45, y: 50, active: true };
    const targets = [
      { x: 110, y: 50, active: true },
      visible,
      { x: 20, y: 20, active: false },
    ];

    expect(findNearestVisibleTarget(targets, 50, 50, view)).toBe(visible);
  });

  it('does not target active enemies outside the camera view', () => {
    const outside = { x: 101, y: 50, active: true };

    expect(findNearestVisibleTarget([outside], 50, 50, view)).toBeUndefined();
  });

  it('skips excluded targets and finds the next visible enemy', () => {
    const closest = { x: 52, y: 50, active: true };
    const next = { x: 62, y: 50, active: true };

    expect(findNearestVisibleTarget([closest, next], 50, 50, view, new Set([closest]))).toBe(next);
  });
});
