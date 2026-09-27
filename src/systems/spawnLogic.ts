import type { Rng } from '../core/rng';
import { randomInt, randomRange } from '../core/rng';
import type { WaveDef } from '../data/types';

export interface ViewRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

// waves must be sorted ascending by timeSeconds (as data/waves.ts is).
export function pickWaveForTime(waves: WaveDef[], elapsedSeconds: number): WaveDef {
  let current = waves[0];
  for (const wave of waves) {
    if (wave.timeSeconds > elapsedSeconds) break;
    current = wave;
  }
  return current;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Picks a random point just outside the camera's view, on one of its four
// edges, clamped to the playable world so it never lands off the map.
export function pickSpawnPoint(
  rng: Rng,
  view: ViewRect,
  margin: number,
  worldWidth: number,
  worldHeight: number,
): Point {
  const edge = randomInt(rng, 0, 3);
  let x: number;
  let y: number;

  switch (edge) {
    case 0: // top
      x = randomRange(rng, view.x, view.x + view.width);
      y = view.y - margin;
      break;
    case 1: // right
      x = view.x + view.width + margin;
      y = randomRange(rng, view.y, view.y + view.height);
      break;
    case 2: // bottom
      x = randomRange(rng, view.x, view.x + view.width);
      y = view.y + view.height + margin;
      break;
    default: // left
      x = view.x - margin;
      y = randomRange(rng, view.y, view.y + view.height);
  }

  return {
    x: clamp(x, 0, worldWidth),
    y: clamp(y, 0, worldHeight),
  };
}
