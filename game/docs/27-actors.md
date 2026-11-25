# Actor movement chips

The movement chips an arcade game is made of: seek, flee, orbit, home, approach,
converge, avoid-aim, evade, carry, patrol and wander. Each is one step of one
behaviour on a plain object with a position and a velocity, so several can run
on one mover and they work on whatever the game already has. `integrate`,
`splitInto`, `Timer` and `hyperspace` complete the kit.

## When to use it

Any game with things that chase, flee, patrol, orbit or home in: a shooter's
enemies, a missile, a mine, a thief that carries cargo away. For a whole flock
or a crowd avoiding each other, use `steering`; for a player's controls, use
`control-feels`; for "what happens when X meets Y", use `interaction-rules`.

## Requires

Nothing to compose. Pure and headless; it imports `maths` for angles.

## API

`game.actors`, or import the helpers. A mover is `{ x, y, vx, vy, rot? }` (`rot` in screen-clockwise radians), and every
chip takes the mover, its target, its numbers, and `dt` last.

- `chips.drift(a, dt, o?)` — constant velocity, spinning by `a.spin`. The asteroid.
- `chips.seek(a, to, { accel, standoff?, drag?, gravity?, maxSpeed? }, dt)` — accelerate toward a point; pair with
  `drag` or it never settles. `chips.flee(a, from, o, dt)` — away.
- `chips.orbit(a, centre, { radius, rate, pull? }, dt)` — circle a point by steering, so it keeps momentum when released.
- `chips.home(a, to, { speed, turn }, dt)` — constant speed, limited turn rate: a dodgeable missile.
- `chips.approach(a, to, speed, dt, arrive?)` — straight at it with no momentum; true once arrived.
- `chips.converge(a, centre, rate, dt)` — close in at a fixed rate; returns the distance left.
- `chips.avoidAim(a, player, { accel, arc?, retreat? }, dt)` — come on only while the player is not aiming at it
  (Bedlam); true while aimed at.
- `chips.evade(a, threats, range, o, dt)` — flee the nearest threat in range; returns it, or null.
- `chips.carry(cargo, carrier, offset?)` — place the cargo on its carrier.
- `chips.patrol(a, points, speed, dt)` — walk waypoints in a loop; returns the index it is heading for.
- `chips.wander(a, speed, turn, rng, dt)` — nudge the heading at random.
- `chips.aimAt(a, b)`, `chips.aligned(a, b, arc)`, `chips.inRange(a, b, r)` — the tests the chips use.
- `integrate(a, dt, { drag?, gravity?, maxSpeed? })` — one step of motion; `drag` is per second, so the feel does not
  change with the frame rate. `speedOf(a)`, `faceVelocity(a)`.
- `splitInto(parent, { count, speed, spread, inherit, angle, rng })` — children at the parent, keeping its momentum
  plus an outward fan: one rock breaking, not two appearing.
- `createTimer(period, { repeat, start, ready })` / `Timer` — `update(dt)` is true on the step it fires; `ready` asks
  without spending; `use()` spends once and re-arms, the reload gate; `frac`, `done`, `reset(period?)`, `stop()`.
- `hyperspace(a, area, rng, { danger, clear, avoid, tries })` — jump somewhere random, `clear` units from everything
  in `avoid`; `ok` is false at the `danger` rate.

```ts
import { chips, splitInto, createTimer, integrate } from '@phaser-ae/actors';
const reload = createTimer(0.25, { ready: true });
game.step('enemies', dt => {
  for (const m of mines) chips.seek(m, ship, { accel: 120, drag: 0.4, maxSpeed: 160 }, dt);
  for (const b of bombs) chips.home(b, ship, { speed: 140, turn: 2 }, dt);
  if (fire && reload.use()) shoot();
  reload.update(dt);
});
const pieces = splitInto(rock, { count: 2, speed: 50, rng: () => game.rng.next() });
```

## Options

None: the pack factory takes no options. Each chip takes its own numbers.

## Limits

- A mover is a duck: anything with `x`, `y`, `vx` and `vy`. That is deliberate: the chips work on a kernel object, on a
  plain object in a test, and on something a physics body drives. They move it themselves, so do not also let physics
  move the same object in the same step.
- Chips are one agent at a time: no flocking, separation or crowd avoidance (`steering` has those).
- `hyperspace` gives up looking for a clear spot after `tries` (default 20) and lands where the last try fell.
