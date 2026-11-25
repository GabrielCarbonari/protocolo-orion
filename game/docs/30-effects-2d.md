# Sprite effects

Per-object effects for any sprite: give it an `fx` bag — glow, outline, blur,
flash, tint, pixelate, wobble, glitch, dissolve, reveal, shine — and it is drawn
through the effects shader in its normal sorted place, so a glowing player still
walks behind the bridge and a dissolving enemy still stands on its tile. This
pack is the runtime: the shader, the glow pre-pass and the drawer the backend
hands bagged objects to, and every effect is built in: compose this one pack.

## When to use it

Whenever one object needs a look the rest of the scene does not share: the
selected unit, the hit enemy, the dissolving corpse, the neon sign, the glinting
logo. Every key is built in; a key that is not one of them (a typo) is refused
with the list of keys. 2D only. An object without a bag costs nothing.

When not:

- **A look over the whole frame** (pixelate, wave, chromatic split, CRT): `post`
  and the `post-*` effects.
- **A shader of your own on one sprite** (a hologram, embers, gold): `sprite-shaders`,
  custom WGSL a sprite. A sprite has ONE drawer, so it carries either an `fx` bag or
  a sprite shader, whichever was set last.
- **A plain colour multiply**: the roster's `tint` column, which costs nothing.
- **Crisp edges under a glow or outline on a smoothed sprite**: add `sprite-cutout`;
  this pack reads its threshold, so the body is cut and the halo stays soft.

## Requires

A 2D world and a WebGPU or WebGL2 backend (`render-auto`, `render-webgpu` or `render-webgl2`): the backend's
`drawBy` hand-off is what keeps bagged objects in sorted order. On WebGL2 a custom
deform is translated by `wgsl-glsl`'s `wgslSnippetToGLSL`, which comes with this pack. Headless, the bags exist and the
timed flashes run; nothing draws.

## API

### `game.fx`

```ts
const h = game.spawn({ id: 'gem', frame, fx: { glow: { color: '#ffd147', size: 14 } } });   // at spawn
const fx = game.fx.of(h);          // the live bag (created empty if there was none); mutate it
fx.outline = { size: 2 };
fx.flash = { color: '#ffffff', duration: 0.15 };   // decays and clears itself
delete fx.outline;
game.fx.set(h, { dissolve: { t: 0 } });   // replace the bag; throws on a key that is not an effect
game.fx.has(h);                    // true
game.fx.clear(h);                  // back to the plain sprite path
game.fx.available;                 // ['glow', 'outline', 'flash', …]: every key the bag takes
game.fx.drawn;                     // objects drawn through the effects shader last frame
```

- `of(h)` — the live bag, created if needed; the object's `drawBy` becomes this pack's drawer id (1).
  A key written straight into it (`fx.blur = …`) is checked only at draw and only in dev mode; in
  production a misspelt key is simply not drawn. Use `set` (or the spawn key) to have a bag checked
  at once.
- `set(h, bag)` — replace it; throws `effects-2d: there is no effect "<key>"`, listing the keys.
- `clear(h)` — drop it; safe on an object without one. A killed object's bag is dropped for it.
- `has(h)`, `available`, `drawn` — as above.
- Spawn key `fx: FxBag` — the same as `set` at spawn.
- `REVEAL_SHAPES` — `['circle', 'wipe', 'rect']`, and `FX_EFFECTS`, every key with a line saying what it
  does: helpers a menu or a check imports (`import { FX_EFFECTS } from '@phaser-ae/effects-2d'`).

Animate `dissolve.t`, `reveal.t` or a manual `shine.t` with a tween; a timed flash
(`flash: { duration }`) fades linearly on the sim clock and removes itself, and
assigning a new flash object restarts it. Each effect has its section below.

### `FxBag`

| key | fields | what it does |
|---|---|---|
| `glow` | `color` (white), `size` (world units, 12) | soft additive halo: a half-res blurred stamp, composited behind opaque sprite bodies; world-space objects only |
| `outline` | `color` (white), `size` (2) | solid rim under the anti-aliased edge |
| `blur` | `size` (4) | 32-tap blur of the sprite's own texels |
| `flash` | `color` (white), `amount` (1), `duration` (seconds) | colour over the pixels; with `duration` it fades linearly and removes itself |
| `tint` | `color` or `colors` [TL, TR, BL, BR], `amount` (0.4) | standing colour overlay, flat or a bilinear gradient |
| `pixelate` | `size` (4) | snap to cells of `size` world units |
| `wobble` | `size` (3) | horizontal band ripple (a hologram's shimmer) |
| `glitch` | `amount` (6) | slice jumps plus RGB split |
| `dissolve` | `t` 0..1, `seed`, `color` (ember) | organic noise dissolve with a burning edge |
| `reveal` | `t` 0..1, `invert`, `shape` (`'circle'`, `'wipe'`, `'rect'`), `angle` (0°, wipe), `soft` (0.06 of the diagonal) | a clip that opens the sprite: a circle from the centre, a soft straight wipe at an angle, or a box from the centre (`REVEAL_SHAPES`) |
| `shine` | `color` (white), `width` (0.18 of the diagonal), `angle` (20°), `period` (4 s), `sweep` (0.8 s), `intensity` (0.85), `phase` (0), `t` | a bright band sweeping across the opaque pixels on the game clock, or at a `t` you drive; additive, never changes alpha |

### The effects

Every field is optional except where a table says so. Sizes are world units, colours any CSS colour, and the
bag is live: mutate it and the next frame draws it.

#### Glow and outline

A soft luminous halo around one sprite, a crisp rim, or both. Glow stamps the tinted silhouette into a
half-resolution target, blurs it with a separable gaussian and adds it back over the lit scene, so it is wide and
smooth, overlapping glows sum, and a bloom post effect blooms it further: magic, lava, neon, the thing the player
must notice. Outline samples the silhouette in 32 jittered taps and fills a rim under the anti-aliased edge: the
selection look, the item on the floor. Glow costs a pre-pass when anything glows and nothing when nothing does.

```ts
const h = game.spawn({ id: 'gem', frame: 3, fx: { glow: { color: '#ffd147', size: 14 } } });
const fx = game.fx.of(h);
fx.outline = { color: '#ffffff', size: 2 };   // a rim too
delete fx.glow;                               // and drop the glow
```

The blur spread follows the largest glow on screen that frame, so one huge glow softens every other. Glow is
world-space only (a HUD object ignores it); outline works in both spaces.

#### Flash

The hit flash: a colour (white by default) over every pixel of one sprite, at an amount that fades to nothing over
`duration` seconds and then removes itself, so the game sets it on impact and forgets it. Without a duration it
stays until cleared, the frozen or poisoned look with a stronger hand than tint. It is the object's own flash;
`feel.flash` washes the whole screen. Pair it with `feel`'s hit-stop and shake on the same impact.

```ts
game.fx.of(enemy).flash = { color: '#ffffff', duration: 0.15 };   // fades out and clears itself
game.fx.of(boss).flash = { color: '#ff2020', amount: 0.6 };        // stays until deleted
```

`amount` is clamped 0..1. The decay runs on the sim clock, so a paused game holds the flash.

#### Tint and gradient

A colour washed over one sprite and left there: the status look (poisoned green, frozen blue), the team colour, or
a four-corner gradient (top-left, top-right, bottom-left, bottom-right, blended bilinearly) that makes a flat card
glossy or a banner sunlit from one side. Unlike the roster's `tint` column, which multiplies the texture, this
mixes a colour over it by `amount`, so dark pixels take the colour too.

```ts
game.fx.of(h).tint = { color: '#3dd6ff', amount: 0.5 };
game.fx.of(card).tint = { colors: ['#ffffff', '#ffd147', '#ff6a3d', '#7a5cff'], amount: 0.8 };   // a gradient
```

`amount` defaults to 0.4, clamped 0..1; each corner colour's own alpha scales it.

#### Blur

One sprite goes soft: the out-of-focus prop, the ghost, the thing moving too fast to read, the menu behind a dialog.
It is a 32-tap jittered blur over the sprite's own texels, with the quad grown by the blur size so the edges soften
outward rather than clipping. The rest of the scene stays sharp; for the whole frame use `post`.

```ts
game.fx.of(h).blur = { size: 6 };
```

`size` defaults to 4. The taps are fixed at 32, so a very large size shows rings rather than a smooth blur. Blur
shares its taps with outline, so the two together cost nothing extra.

#### Pixelate

One sprite snaps to a coarse grid of cells: the retro disguise, the censored face, a de-rez on death. Tween `size`
from large to one for a materialise. For the whole frame, `post-looks`' `pixelate`.

```ts
game.fx.of(h).pixelate = { size: 6 };   // 6-unit cells
```

Cells are at least 2 across the sprite whatever the size.

#### Wobble

The sprite's rows slide left and right in a travelling sine: a hologram, heat haze on one object, a reflection in
water. It runs on the sim clock, so it pauses with the game; the shape is fixed (14 bands, 1.4 cycles a second),
which keeps it one number. For the whole frame, `post-looks`' `wave`; for a stronger break-up, glitch.

```ts
game.fx.of(h).wobble = { size: 3 };
```

The ripple follows the sprite's own rows, so a rotated sprite ripples along them, not the screen's.

#### Glitch

Horizontal slices of one sprite jump sideways at random ticks while its red and blue channels split: the corrupted
hologram, the boss losing coherence, the teleport. The randomness is hashed from the sim time, so it replays the
same. `amount` is the slice jump; the colour split follows it. Pair it with flash for an impact, or with dissolve
to glitch out of existence.

```ts
game.fx.of(h).glitch = { amount: 8 };
```

Fourteen ticks a second and twelve bands, fixed, to keep it one number.

#### Dissolve

One sprite burns away: two-octave value noise decides which pixels survive as `t` rises from 0 to 1, and the
boundary glows in the edge colour (ember orange by default), so it reads as fire, acid or magic rather than a pixel
scatter. Tween `t` for a death, reverse it for a summon; `seed` gives each object its own pattern, so a crowd does
not dissolve in lockstep.

```ts
const fx = game.fx.of(h);
fx.dissolve = { t: 0, seed: 3, color: '#ff9a3d' };
game.tween.to(fx.dissolve, { t: 1 }, { duration: 0.8, ease: 'easeInQuad' });
```

`t` is clamped 0..1 and overshoots inside, so 1 is fully gone. With an outline, the outline's colour takes the edge.

#### Reveal

One sprite appears through a clip that opens as `t` goes from 0 to 1: a soft circle growing from the centre (the
iris, the portal arrival), a straight soft-edged wipe at any angle (a logo wiping in, a hero rising from behind a
line), or a box in the sprite's shape opening from the centre (a panel, a title card). The clip lives in the
sprite's own space, true to its aspect, and follows its rotation and mirroring. `invert` runs it the other way, so
the same clip is the exit without reversing the tween.

```ts
const fx = game.fx.of(hero);
fx.reveal = { t: 0 };                                                   // the circle
game.tween.to(fx.reveal, { t: 1 }, { duration: 0.5, ease: 'easeOutCubic' });

game.fx.of(logo).reveal = { t: 0, shape: 'wipe' };                     // in from the left
game.fx.of(logo).reveal = { t: 0, shape: 'wipe', angle: 90, soft: 0 }; // down from the top, a hard edge
game.fx.of(card).reveal = { t: 0, shape: 'rect', soft: 0.1 };          // a box from the centre
game.fx.of(enemy).reveal = { t: 0, shape: 'wipe', angle: 180, invert: true };   // gone, from the right
```

| field | default | meaning |
|---|---|---|
| `t` | (required) | progress 0..1: 0 hidden, 1 shown, exactly, whatever the shape |
| `invert` | `false` | run it the other way: 0 shown, 1 hidden, the edge moving the same way |
| `shape` | `'circle'` | `'circle'`, `'wipe'` or `'rect'` (`REVEAL_SHAPES`); anything else is refused |
| `angle` | `0` | wipe only: the direction the edge travels, degrees on screen (0 left to right, 90 top to bottom, 180 from the right, 270 from the bottom) |
| `soft` | `0.06` | wipe and rect: the soft edge's width as a fraction of the sprite's diagonal, 0.001..1; `0` is a hard, anti-aliased edge |

`t` maps linearly onto the sprite: the middle of the soft edge crosses the centre at 0.5 and just clears the far
side at 1, so a sprite rising by its own height from behind a line pairs with a wipe from the top (`angle: 90`) on
the same progress. The rect keeps the sprite's proportions as it opens. The circle has a fixed thin edge (`soft` and
`angle` are ignored), grows faster on a wide sprite so its rim reaches the corners by 1, and keeps a thin soft rim
at the bottom of its range: set `visible = false` for a sprite that must be truly gone. The clip is the sprite's own
rectangle, so a wipe cannot follow a line in the world while the sprite moves.

#### Shine

The glint across a title-screen logo, a gold coin, a chrome badge or a gem: a soft band of light with a bright
centre line, swept across one sprite at an angle and masked by its own pixels, so it never lights the space around
it. By default it repeats on the game clock, crossing in a fraction of a second every few seconds; a `phase` per
object keeps a row of coins from shining in lockstep. Set `t` instead and the game drives the band.

```ts
const logo = game.spawn({ id: 'logo', frame, fx: { shine: {} } });          // white, every 4 s, 0.8 s to cross
game.fx.of(coin).shine = { color: '#fff4c8', period: 2.5, phase: i * 0.15 };   // a row that ripples, not blinks
game.fx.of(gem).shine = { angle: -30, width: 0.3, intensity: 1.4 };            // wider, brighter, leaning the other way
const once = game.fx.of(card).shine = { t: 0 };                                // drive it yourself
game.tween.to(once, { t: 1 }, { duration: 0.6, ease: 'easeInOutQuad' });
```

| field | default | meaning |
|---|---|---|
| `color` | `'#ffffff'` | band colour, added over the pixels; its alpha scales the band |
| `width` | `0.18` | band width as a fraction of the sprite's diagonal |
| `angle` | `20` | direction the band travels, degrees on screen (0 left to right, 90 top to bottom); the band is perpendicular |
| `period` | `4` | seconds between the starts of two sweeps (never less than `sweep`) |
| `sweep` | `0.8` | seconds one sweep takes to cross |
| `intensity` | `0.85` | 0..2, how bright |
| `phase` | `0` | seconds added to the clock before timing, so two sprites do not shine together |
| `t` | unset | manual position 0..1 (0 before the sprite, 1 past it); when set, `period`, `sweep` and `phase` are ignored |

Each sweep eases in and out; a manual `t` is linear, so a tween supplies its own ease. Shine is additive light on
the sprite's own pixels: it never changes alpha, a dark colour adds nothing, and the colour clamps at white, so
`intensity` above 1 widens the white-hot centre rather than brightening it. Between sweeps the band waits off the
sprite, but the object is still drawn through the effects shader: clear the key when the shine is done.

### With a deform

An object's vertex deform (`h.deform`: wave, sway, flip, jelly, or a composed `deform-*` pack's kind)
stays on when it carries a bag. The backend hands the drawer a deformed run as it would its own grid
pipeline, and the effects shader bends the same 24×64 mesh the same way: the four built-in kinds are
the backends' code (`test/deform.test.ts` fails if theirs moves on), every registered `DeformDef` is
spliced in as kind 16, 17, … with its fragment snippet, and the body takes the fold shading. The
outline, blur and halo margin bend with the sprite, and a glow's stamp is bent the same way, so a
waving flag's glow waves with it.

```ts
const flag = game.spawn({ id: 'flag', frame, deform: { kind: 'wave', amount: 7, speed: 0.7 }, fx: { outline: { color: '#000000' } } });
game.fx.of(flag).glow = { color: '#ffd147' };   // the wave stays, and the glow follows it
```

Exclusions, the same as the look they come from: ONE uv distortion applies
(pixelate over glitch over wobble), ONE alpha gate (reveal over dissolve),
glow and outline share the halo colour slot (outline's colour wins and the
dissolve edge takes it), flash and tint share the colour slot (flash wins while
it lasts). Shine excludes nothing: it stacks with every other key, adding its
light after the colour slot, inside whatever alpha the gate left.

### Passes and steps

`effects-glow` (after `begin`, before `sprites`): stamps every world-space
glowing object into a half-resolution target and blurs it.
`effects-glow-composite` (after `effects-glow`, `backdrops` and `lighting-under`,
before `sprites`, `post` and `screen`) adds the halo over the background and
under the sprite bodies, whatever order the manifest composes lighting, backdrops
and post in, so an opaque body keeps its own pixels. The drawer runs inside the
backend's `sprites` and `screen` passes. Simulate step `effects-2d.decay` counts
timed flashes down on the sim clock.

### The registry

At attach the pack lists an `FxDef` (`{ name, description }`) for each key under the kernel registry's `'fx'` kind,
so a pack that draws through this one asks `k.registry.list('fx')` what is there (`title-screen` does). The effects
are the shader's; nothing adds one.

## Options

None.

## Limits

- 32 texture taps per pixel per bagged object, whatever the bag holds; fine for
  dozens to hundreds, not for a particle system. Clear bags when effects end.
- A deformed bagged object is drawn on the grid: 9,216 vertices instead of 6,
  and its glow stamp the same.
- Glow is world-space only and its blur spread follows the largest glow on
  screen that frame. A HUD object's glow is ignored.
- Each run of bagged objects is one draw with its own small storage buffer,
  built that frame: interleaving many single bagged objects between plain ones
  costs a draw each, exactly as blend-mode changes do.
- A bagged object's frame may be on any atlas page or in a picture's own
  texture. A run splits where its frames' textures change, a draw each, and the
  glow stamps are drawn texture by texture; a texture not uploaded yet draws
  nothing that frame.
- The bag is a plain object, so a wrong key is caught at `set`, at spawn, and at
  draw in dev mode; in production a misspelt key written straight into a live bag
  is not checked, and draws nothing.
- One drawer per sprite: an `fx` bag and a `sprite-shaders` shader on the same
  sprite do not combine; the one set last draws it.
- The texel margin for outline and blur extends the quad by the size; a sprite
  at the edge of its atlas frame samples the frame clamped, never its
  neighbour.
- Shake and squash from the old bag are transforms: `feel.shake` and a `tween`
  on `sx`/`sy`.
