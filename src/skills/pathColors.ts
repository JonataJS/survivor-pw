import type { Path } from '../data/types';

// T046: uma vez escolhido o caminho, os efeitos das skills e a aura do
// mago trocam para a cor do caminho em vez da cor do elemento — assim o
// jogador identifica o caminho olhando qualquer skill em ação.
export const GOD_COLOR = 0xffd700;
export const EVIL_COLOR = 0x8800ff;

export function effectColor(path: Path | undefined, elementColor: number): number {
  if (path === 'god') return GOD_COLOR;
  if (path === 'evil') return EVIL_COLOR;
  return elementColor;
}
