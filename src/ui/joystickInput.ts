const JOYSTICK_DEAD_ZONE = 8;

export function calculateJoystickInput(
  deltaX: number,
  deltaY: number,
  radius: number,
): { x: number; y: number } {
  const distance = Math.hypot(deltaX, deltaY);
  if (distance <= JOYSTICK_DEAD_ZONE || radius <= JOYSTICK_DEAD_ZONE) {
    return { x: 0, y: 0 };
  }

  const magnitude = Math.max(
    0,
    Math.min(1, (distance - JOYSTICK_DEAD_ZONE) / (radius - JOYSTICK_DEAD_ZONE)),
  );
  return {
    x: (deltaX / distance) * magnitude,
    y: (deltaY / distance) * magnitude,
  };
}
