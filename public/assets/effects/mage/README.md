# Mage skill effect animations

Animated VFX frames for the Mage's seven skills, generated with [PixelLab](https://pixellab.ai) (`animate_image`), using each skill's existing icon from `../../skills/mage/` as the first frame and a short text description of the motion. Not a pixel-exact match to any Perfect World effect — a stylized interpretation guided by the skill's element and the icon's shape, per the project's visual direction (`docs/art/direction.md`).

| Folder | Project skill | Motion prompt |
| --- | --- | --- |
| `fire-mark/` | Marca do Fogo | small fire glyph flickering and pulsing with embers drifting up |
| `sudden-spring/` | Fonte Repentina | water spout surging upward then splashing down in a ripple |
| `stone-rain/` | Chuva de Pedra | jagged stone fragment falling and spinning, then impacting with dust |
| `phoenix-wings/` | Asas da Fênix | fiery phoenix wing flapping and igniting, flames trailing behind |
| `flaming-storm/` | Tempestade Flamejante | ring of fire pulsing and expanding outward from the center |
| `sand-storm/` | Tempestade de Areia | sand particles swirling and gusting horizontally |

`moving-earth/` (Terra Móvel) was intentionally left out of this batch — see the project's PixelLab trial credit limit at the time of generation.

Each folder has 9 loose PNG frames, `frame-00.png` (the unmodified source icon) through `frame-08.png` (8 generated frames), all 32×32 px RGBA. These are raw frames, not a Phaser spritesheet/atlas yet — assembling them into an atlas JSON and wiring them into `AreaEffectSystem`/`ProjectileSystem` is later integration work (project tasks T073+), not done here.

No claim of ownership is made over the Perfect World skill designs that inspired the source icons.
