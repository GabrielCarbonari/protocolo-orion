# Projectile Patterns

Aimed, fan, ring, spiral, burst and staged volleys of projectiles, with swept hits, piercing, ricochet, homing and
graze events. It schedules every shot of a volley, moves the shots, tests their paths against circular targets and
rectangular walls, and reports what happened. Your game draws the projectiles and decides what a hit costs. The state
is plain data, so it runs headless, replays exactly and saves completely.

## When to use it

- The bullets of a 2D shooter: enemy volleys to weave through in a bullet-pattern game, a player's spread gun,
  bolts that ricochet round a room, homing missiles.
- Any game that wants projectile hits without a physics engine: hits are swept, so a fast shot cannot pass through a
  target or a wall between frames.
- Pair it with `combat-rules` (or your own health rules) to apply the damage each `hit` event carries. `maze-rooms`
  and `wave-arena` fire every bolt and missile through it, and `scrolling-shooter` and `road-combat` use its patterns.
- Not for 3D, and not for bodies that bounce, stack or push: use `physics-2d` for those.

2D only.

## Requires

`actors`, composed before it: homing shots steer with its `chips.home`. Swept hits use `maths`' `geom.segmentHitsCircle`,
imported as a package. No renderer, world or browser is needed. `game.projectilePatterns` holds every export, and each
can also be imported from `@phaser-ae/projectile-patterns`.

## API

```ts
const { createProjectiles } = game.projectilePatterns;
const shots = createProjectiles();
const walls = [{ x: 0, y: 0, w: 640, h: 16 }];                // x, y is the top-left corner

// A fan of five shots from a turret, aimed at the hero, each carrying 10 damage.
shots.emit({ kind: 'fan', count: 5, spread: 1, speed: 180, life: 4, pierce: 1 },
  { x: turret.x, y: turret.y }, Math.atan2(hero.y - turret.y, hero.x - turret.x), 'enemy', 10);

game.step('shots', dt => {
  shots.tick(dt, [{ id: 'hero', team: 'hero', x: hero.x, y: hero.y, r: 12, alive: true }], walls);
  for (const e of shots.drain()) {
    if (e.kind === 'hit') hurt(e.target, e.damage);
    else if (e.kind === 'graze') score += 10;
  }
  drawShots(shots.shots);                                      // x, y, rot and r of every shot in flight
});
```

**Volleys**

- `createProjectiles()` — an empty projectile system (a `Projectiles`).
- `emit(pattern, origin, aim, team, damage = 1)` — schedule a volley from `origin` along `aim` (radians; 0 points
  along +x) for `team`. Shots with no delay launch at once; the rest wait on the system's own clock. Returns the id of
  every projectile it schedules. Throws on a pattern value outside its bounds, or a negative or non-finite `damage`.
- `patternShots(pattern, aim = 0)` — the same schedule as plain data, one `{ at, angle }` per shot, `at` in seconds
  after emission. Use it to drive bullets of your own; it checks the pattern exactly as `emit` does.

How each kind arranges its `count` shots:

- `aimed` — all at once, all along the aim.
- `fan` — all at once, spread evenly across `spread` radians centred on the aim; the outer shots sit on the arc's ends.
- `ring` — all at once, evenly round a full circle, starting at the aim.
- `burst` — one every `interval` seconds, each along the aim.
- `spiral` — one every `interval` seconds, each turned `rotation` radians from the last.
- `staged` — `stages` rings of `count` shots, one ring every `interval` seconds, each turned `rotation` from the last.

**Moving and hitting**

- `tick(dt, targets = [], walls = [], graze = 8)` — advance `dt` seconds (0 to 10) in substeps of at most 1/120 s,
  launching shots as they fall due. A shot flies straight, or turns towards the nearest living target of another team
  at its `homing` rate. Its swept path is tested against `targets` (circles: `id`, `team`, `x`, `y`, `r`, `alive`) and
  `walls` (rectangles: `x`, `y`, `w`, `h`). It ignores targets of its own team and dead ones, hits and grazes each
  target at most once, passes through `pierce` further targets after its first hit, and bounces off walls while it
  has `ricochet` left, one per bounce. Otherwise a hit or a wall stops it. A near miss within `graze` world units of a
  target's edge is a graze.
- `drain()` — take the events since the last drain, oldest first: `{ kind, projectile, target, damage, time }`, where
  `kind` is `spawn`, `hit` (with the shot's damage), `graze`, `bounce` or `expired`. A shot stopped by a hit or a wall
  reports `expired` too.
- `shots` — the projectiles in flight (`id`, `team`, `x`, `y`, `vx`, `vy`, `rot`, `r`, `life`, `damage`, `pierce`,
  `ricochet`, `homing`, `hits`, `grazed`); shots still waiting to launch are not listed. `events` holds the undrained
  events and `time` the system's clock in seconds.
- `clear()` — remove every shot, pending launch and event; the clock and the id counter keep their values.
- `snapshot()` / `restore(snapshot)` — a plain copy of the clock, the id counter, the shots and the pending launches.
  `restore` checks times, positions and lives, throws on a bad value and clears the events.

The pack never changes anyone's health: a `hit` event carries damage for your combat rules to apply.

## Options

None: the pack factory takes no options. Each volley is a `ProjectilePattern`:

| Field | Default | What it sets |
|---|---|---|
| `kind` | — | `aimed`, `fan`, `ring`, `spiral`, `burst` or `staged` |
| `count` | — | shots per volley, or per ring for `ring` and `staged`; a whole number from 1 to 256 |
| `speed` | — | world units a second; above 0 |
| `spread` | 0.7 | `fan` only: the arc in radians, 0 to 2π |
| `interval` | 0.12 | seconds between shots (`burst`, `spiral`) or between rings (`staged`); 0 or more |
| `stages` | 3 | `staged` only: the number of rings, 1 to 32 |
| `rotation` | 0.4 (`spiral`), 0.24 (`staged`) | radians each shot or ring turns from the last |
| `radius` | 4 | collision radius of each shot, world units, at least 0.01 |
| `life` | 5 | seconds a shot lives, 0.001 to 60 |
| `pierce` | 0 | further targets a shot passes through after its first hit, 0 to 100 |
| `ricochet` | 0 | wall bounces, 0 to 100 |
| `homing` | 0 | turn rate towards the nearest enemy target, radians a second; 0 flies straight |

The team and the damage go with each `emit`, the graze distance with each `tick`. Nothing is random: a volley fired
from the same place at the same time is the same volley.

## Limits

- 2D only: shots and targets are circles and walls are axis-aligned rectangles. There is no polygon, mesh or 3D
  collision, and shots never collide with each other.
- There is no cap on shots in flight (a volley holds up to 256, or 256 per ring for `staged`): bound your own
  population, and drain events every frame or they pile up.
- `aimed` puts every shot of a volley on one line; use `burst` to space them in time or `fan` to spread them.
- Homing re-picks the nearest living target of another team every substep and turns at a limited rate, so it can be
  outrun; with no such target a shot flies straight.
- A ricochet reflects the velocity off the face it struck and resumes travel on the next substep; a corner reflects
  on one axis only.
- Each `tick` takes at most 10 seconds and always works in 1/120 s substeps, so a long `dt` costs proportionally more.
