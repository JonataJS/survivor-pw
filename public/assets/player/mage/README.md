# Mage player sprite

Pixel-art sprite for the playable Mage, generated with [PixelLab](https://pixellab.ai) (`mcp__pixellab__create_character` + `animate_character`, standard/template mode, chibi proportions), guided by a reference screenshot of the Perfect World Wizard class (`docs/art/refs/mago-reference.png`) and a text description — not a pixel-exact conversion of the reference, per the project's stylized direction (see `docs/art/direction.md`).

- Character id: `288acc8b-6a43-4b07-a588-1e3530113d39` (PixelLab)
- Cell size: 92×92 px, 4 columns × 9 rows, uniform grid, pivot at cell-center
- Directions: south, west, east, north (column order, per row)
- Rows: 0 = static rotations; 1-4 = `idle` animation (4 frames) for south/west/east/north; 5-8 = `walk` animation (4 frames) for south/west/east/north
- Full layout: `mage-spritesheet.json`

Not yet wired into Phaser — `BootScene`/`Player.ts` still use the placeholder graphics until the later art integration task. The JSON layout is PixelLab's own export format, not a Phaser atlas; it needs to be converted (or re-sliced) when integration happens.

No claim of ownership is made over the Perfect World character design that inspired this sprite's colors and theme.
