import { describe, expect, it } from 'vitest';
import { calculateJoystickInput } from '../src/ui/joystickInput';

describe('calculateJoystickInput', () => {
  it('returns zero within the dead zone', () => {
    expect(calculateJoystickInput(4, 4, 66)).toEqual({ x: 0, y: 0 });
  });

  it('preserves direction and clamps input to the joystick radius', () => {
    const diagonal = calculateJoystickInput(100, 100, 66);
    expect(diagonal.x).toBeCloseTo(Math.SQRT1_2);
    expect(diagonal.y).toBeCloseTo(Math.SQRT1_2);
    expect(Math.hypot(diagonal.x, diagonal.y)).toBeCloseTo(1);

    const half = calculateJoystickInput(0, 37, 66);
    expect(half.x).toBe(0);
    expect(half.y).toBeGreaterThan(0);
    expect(half.y).toBeLessThan(1);
  });
});
