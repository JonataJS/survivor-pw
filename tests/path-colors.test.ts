import { describe, expect, it } from 'vitest';
import { effectColor, GOD_COLOR, EVIL_COLOR } from '../src/skills/pathColors';

describe('effectColor', () => {
  it('usa a cor do elemento quando nenhum caminho foi escolhido', () => {
    expect(effectColor(undefined, 0x3388ff)).toBe(0x3388ff);
  });

  it('usa a cor do God quando o caminho é god', () => {
    expect(effectColor('god', 0x3388ff)).toBe(GOD_COLOR);
  });

  it('usa a cor do Evil quando o caminho é evil', () => {
    expect(effectColor('evil', 0x3388ff)).toBe(EVIL_COLOR);
  });
});
