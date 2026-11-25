## How to build it well

Guides for games of this kind, and for every game. The design above decides what this game is; these say how games of its kind are made to play and look well. They are guidance, not rules: where the design asks for something different, build what it asks.

### Shoot 'em up (this kind of game)

#### What it is
A shmup puts the player's ship in a hostile screen and asks for two skills at once: threading through enemy fire and spending attention on killing things. Enemy waves are hand-scripted, so the player learns them by repetition. Runs are short, lives are scarce, and mastery shows up as cleaner routes and higher scores.

#### How a session plays
The player launches with a weak weapon and a few lives. Waves enter in formations, and the player positions, shoots, and dodges. Clearing a whole formation, or killing quickly, pays out pickups and score. Pickups are the growth curve: weapon power, bombs, shields, speed. The stage builds to a boss with distinct phases, each with its own bullet pattern and a moment where it is vulnerable. A hit costs a life and usually sets the weapon back, so pressure rises after a mistake. The run ends in a boss kill with a score tally, or in game over and an immediate retry. Some forms (Asteroids-likes, Robotron-likes, Geometry Wars) skip stages and ramp waves on one arena until the player falls.

#### Screen and layout
- The play area is one fixed-size field. Vertical shooters use a portrait field, often with side borders for the HUD. Horizontal ones use a landscape field. Arena shooters fit the whole arena on screen.
- The background scrolls continuously to convey motion, while the player moves freely inside the frame. Ground turrets and terrain scroll with it.
- The HUD stays at the edges and out of the bullet space: score, lives, bombs, weapon level, and a boss health bar when a boss is present. Add a chain or multiplier readout if the game scores that way.
- The player's ship is always the most legible object. Its hitbox sits near the center and is visibly smaller than the sprite, especially in bullet-hell games. Enemy bullets contrast strongly with the background.

#### Common forms
- **Vertical and horizontal scrollers** (1942, Raiden, Gradius, R-Type): scripted waves, pickups that upgrade the weapon, a boss per stage. Horizontal versions often add terrain.
- **Bullet hell** (Touhou, DoDonPachi, Mushihimesama): slow, dense, patterned bullets, a tiny hitbox, grazing for score, and a focus or slow-move mode. Bombs cancel bullets.
- **Fixed shooter** (Space Invaders, Galaga): movement on one axis against formations that descend or dive.
- **Twin-stick and arena** (Robotron, Geometry Wars, Bullet Candy): movement and aim are decoupled. Enemies swarm from the edges, and survival time and multipliers are the goal.
- **Euroshmup / shop variants** (Tyrian, Raptor): health bars, coins from kills, and an upgrade shop between stages.
- **Score-attack and caravan runs**: short runs built around chains and combo windows.
- **Gimmick shmups**: one distinctive mechanic defines the game, such as switchable fire direction, absorbing matching-color bullets, slow time, or pods with aimable fire. Build that mechanic as the main idea.

#### What makes it satisfying
- Dodging through a gap by a hair, then answering with a kill.
- Fair, readable patterns: each death feels like the player's own mistake, and the next try is faster.
- Escalating firepower, where the ship visibly becomes a storm by mid-stage.
- Bosses that can be learned: phases that change the dance, and a clear opening to punish.
- Risk that pays: grazing, close kills, chains, and bombs held for emergencies all trade safety for score.
- The instant restart.

#### Building it well
- Make input tight. Movement should respond immediately with no drift or sluggishness, and fire should hold or auto-fire so the player's attention stays on positioning.
- When the game uses one-hit deaths, give a short invulnerable respawn. When it uses shield pips, flash the ship during the invulnerability window so the player can see it.
- Build waves from a small set of reusable movement paths and bullet patterns (aimed, ring, spread, spiral, stream) and combine them. Introduce one new element at a time, and raise density only after the player has seen the basics.
- Use the hitbox generously in the player's favor. Collision on the ship's core should feel slightly forgiving. Make enemy bullets clearly visible and never spawn them on top of the player.
- When a weapon upgrades, the change in the shots must be instantly visible and audible. When a hit downgrades it, keep the penalty meaningful but not run-ending.
- Give bosses two or three phases, each with a telegraph before it begins and a readable health bar. Clear leftover bullets when a boss dies or a phase changes.
- When bombs exist, limit them, and make them clear bullets, damage enemies, and grant a moment of safety.
- When scoring uses chains or grazing, show the multiplier on screen and give a visible reason when it breaks.
- Pace the run to its form: a stage of a few minutes suits most, and arena games ramp continuously. Put a rest beat between waves and a pause before each boss.
- Juice suits the genre well: hit flashes, explosions, particles, brief screen shake on big kills, and a satisfying boss death. Keep the bullet layer clear of effects that hide threats.
- Include a title or start screen, a pause key, a clear game-over and victory screen with the final score, and a one-key retry. Store a local high score.
- The game's own brief decides form, view, and scope. Use this guide to make what it specifies feel like a real shmup.

### What every small game gets right

- **Every input answers.** Each action gets an immediate, visible response, and a sound when the game has sound. The player sees what they did and learns from it.
- **Readable at a glance.** From one screenshot, a stranger can tell what they control and what they are trying to do: one familiar verb, one clear goal.
- **One idea of its own.** The best small games take a familiar shape and change one thing — a rule, a constraint, a relationship between two things on screen — that can be said in a sentence. The brief says what that idea is; build around it.
- **Teach by playing.** The opening moments are safe and teach the main verb through play, with at most a line or two of text.
- **Fair challenge.** Threats are telegraphed before they land, and randomness sets up situations the player can read. Losses feel like the player's own mistake, which makes them want another go.
- **Something grows.** Speed, score, board, count or stakes rise through a session, so tension builds toward a clear ending.
- **Quick to try again.** Failure leads to a new attempt in a moment, with one input. The result shows beside the best result.
- **Tuned by playing.** Keep gameplay values together in one named config object, choose starting values from the feel the brief describes, and adjust them by playing. The juice, balance and difficulty guides cover each layer.

### Pressure and losing

A game is tense only when something pushes back. Decide what that is before building, make sure a careless player meets it, and make it rise as the player gets better.

#### Know what pushes back

Every game has one or two of these at its heart. Name them.

- **Threats that come for the player:** enemies, traffic, projectiles, hazards that move. The player loses by being caught or hit. Shooters, platformers, road-crossers, brawlers.
- **The clock:** a countdown, a rising tide, a closing wall. The player loses by running out of time. Arcade timers, races, survival.
- **Running out:** health, lives, ammo, money, moves, oxygen, tiles. The player loses when something they spend is gone. Tower defense, roguelikes, puzzle games with move limits.
- **An opponent:** a player or AI with the same goal. The player loses by being outscored or outplayed. Card, board, sports and fighting games.
- **The board filling up:** pieces stacking, a queue overflowing, a screen crowding. The player loses when there is no room. Tetris, match-3 with a limit, time management.

#### Make the threat real

- **Threats reach the player.** Enemies that never come close, or never shoot, are scenery. In a shooter something fires back; in a defense game something gets through an undefended path.
- **A careless player loses.** Someone who stands still, taps at random or ignores the main threat should lose, and soon enough to learn from it. If they can't, the game has no tension.
- **A good player is tested.** A strong run should come close to losing at least once. If the best players never feel danger, the top end needs more.
- **Losing is the player's own doing.** Threats are visible and telegraphed, hit areas match what is drawn, and nothing spawns on top of the player. A death the player didn't cause feels like a bug.

#### Make it rise

- **Raise one thing at a time:** speed, how many, how often, how many kinds at once, how little room is left. The player should be able to tell what changed.
- **Introduce, then combine.** A new threat appears alone and safely first, then alongside the others.
- **Rise and ease.** A hard stretch, then a breather: a calm after a boss, a slower wave, a bonus. Then higher than before.
- **The player grows too.** Upgrades, new moves and better routes let them meet the rising pressure. If the pressure rises and the player can't, the game becomes a wall; if the player grows and the pressure doesn't, it becomes a stroll.

#### Losing well

- **Show why.** A clear moment of loss: what hit them, what ran out. A short pause before the end screen, not an instant cut.
- **Partial losses first.** Lives, health or a shield give the player a warning before the end, where the form allows it.
- **The way back is quick.** One input to try again. The longer the retry, the gentler the game must be.
- **The end screen says how far they got:** the score, the wave, the level, the best so far.

#### Games without losing

Toys, sandboxes, cosy, idle and some puzzle games have no way to lose, and that is fine. Their tension comes from somewhere else: a goal to reach, a score to beat, a choice with a cost, a puzzle that resists. Name it, and make it rise in the same way.

#### Checking it by playing

Play three ways and watch what happens:
- **Do nothing,** or tap at random. Does the game end, or put the player in clear danger, in a reasonable time?
- **Play carelessly,** ignoring the main threat. Does the player lose a life or the round early on?
- **Play well.** Does the run come close to losing at least once, and does it feel fair when it does?

Remember that an agent playing step by step, reading every position and stopping time, finds every game easier than a person does. Judge the pressure as a person would meet it.

### Difficulty ramps

#### Choose what grows

Pick the one or two things that make this game harder, and raise those:

- **Action:** speed, spawn rate, enemy count, enemy types, fewer safe spaces.
- **Puzzle:** more pieces, more colors, more constraints, more steps to a solution.
- **Strategy and management:** stronger opponents, tighter resources, more things to watch at once.

Raise one axis at a time so the player can tell what changed.

#### Shape the curve like a sawtooth

Challenge rises, then eases briefly, then rises higher: a calm stretch after a boss, a new area that opens gently, a bonus round. The breathers let the player enjoy their new skill.

#### Introduce, then combine

Show each new element on its own, in a safe situation, before it appears alongside the others. The first time the player meets a new enemy or rule, they learn it; later they are tested on it.

#### Open with a win

The opening is easy enough that a newcomer succeeds and learns the one main verb by doing it. Challenge starts to build once they have it.

#### Fit the ramp to the structure

- **Endless games** ramp continuously toward a ceiling that stays humanly playable, so a great run is long and score keeps rising.
- **Level-based games** order levels from easy to hard; each level teaches or tests one idea.
- **Puzzle games** get harder through more complex setups. Add a timer when the genre is about speed.
- **Games against opponents** make the opponent stronger or smarter as the player improves.

#### Close the session clearly

Every session ends with a clear result — a win screen, or game over showing the score and the best score — and a new attempt starts with one input.

### Balance

#### Start from the experience, then derive values

Decide what the player should feel first, then work out values from it:

- "A round lasts about a minute" gives the spawn rate and the score target.
- "A jump clears three tiles" gives jump speed and gravity together.
- "The player can cross the screen in two seconds" gives movement speed.

Express values relative to the screen and the player: speeds in screens per second, sizes relative to the player sprite, timings relative to human reaction time. Relationships survive a change of resolution; raw numbers do not.

#### Treat every value as a starting guess

- Keep all tuning values together in one named config object, so they are easy to find and change.
- Tune by playing. The first values are a guess; the right values are the ones that make play feel as intended.
- Change one value at a time, then play again.

#### Make choices matter

- Riskier actions earn bigger rewards: getting close to danger, chaining, spending a scarce resource.
- In games with options (weapons, units, upgrades, cards), give each one a situation where it is the best choice.
- Upgrades change how the player plays — a new ability or a new trade-off — as well as making numbers bigger.

#### Be generous to the player

In action games, tolerance favors the player:

- Hitboxes are generous for things the player wants to touch (pickups, targets) and slightly smaller than the art for things that hurt.
- A jump still works for a moment after walking off a ledge, and a jump pressed just before landing still happens.
- Warnings come before damage.

#### Shape randomness

- Use a shuffled bag for spawn and piece sequences, so every option appears regularly and droughts stay short.
- Generated boards, deals and levels are checked to be solvable.
- Randomness sets up situations; the player's skill resolves them.

#### Economies

When the game has currency or resources, give every source a matching sink. Prices rise with what they unlock, so the player is always saving toward something.

#### Scoring

Score rewards skill: speed, precision, chains, risk. Show the current score beside the best score.

### Juice

Juice is feedback beyond what the rules need: motion, particles, shake, sound. It is a pass applied after the core loop works, and each game decides how much it wants.

#### Decide how much the game wants

- **Full juice** suits real-time action: shooters, platformers, brawlers, arcade scoring, destruction, chain reactions. Speed and impact are the reward.
- **Light juice** suits puzzles where the player thinks between moves: one clean, satisfying response per move — a piece settles with a small bounce, a cleared line flashes, a soft sound confirms.
- **Little or none** suits word games, deduction, reading-led and turn-based strategy games. Clarity and calm are the reward: a clear state change and a gentle sound are enough. Wordle's tile flip is the whole of its juice.

#### Tools, and where each fits

- **Motion on the thing that acted.** Squash on landing, stretch on a jump, a scale pop when an item is collected, tweened movement between positions.
- **Impact.** A brief hit-stop on heavy hits and a small screen shake sized to the event. Save the biggest shake for the biggest moments: an explosion, a boss hit, losing a life.
- **Particles.** A burst at the point of contact, colored like its source. Trails on fast-moving objects.
- **Traces.** Marks that stay — scorch, debris, painted tiles — so the world records what the player did.
- **Sound.** A distinct sound for each meaningful event. Slight random pitch on repeated sounds; rising pitch through a combo or chain.
- **Score feedback.** Points float up from where they were earned; a combo counter grows as the chain grows.
- **Anticipation.** A flash, wind-up or warning line before a threat lands. This also makes the game fairer.

#### Scale feedback to the event

Common, small events get small, quick feedback. Rare, important events get the largest. The hierarchy tells the player what matters.

#### Keep play readable

Effects are short and fade fast. The player, threats and targets stay clearly visible through every effect. Shake moves the camera, and the HUD stays still.

#### Order of work

1. Build the loop plain and make it playable.
2. Add juice to the events that happen most and matter most.
3. Play after each addition and keep what makes the game clearer or better to play.

### Presentation

Players judge a game by how it looks in the first few seconds. Polished games get these things right by default, and they are easy to miss because nothing breaks when they are wrong. Check for them in every screenshot.

#### Layout that never breaks

- **Text fits.** No label runs past its button or panel, and none is cut off at the edge of the screen. Long words, big numbers and the longest score the game can reach still fit.
- **Nothing overlaps by accident.** Buttons, labels and HUD items don't sit on top of each other, and the HUD doesn't cover the play area where the action happens.
- **Room between things.** Buttons are far enough apart that a thumb hits the one it meant, and big enough to hit on a phone. Related items are grouped; unrelated ones have space between them.
- **Inside the screen.** Everything important stays clear of the edges and corners, where phones cut into the screen.
- **Lined up.** Items in a row share a baseline; items in a column share an edge. Things are centred when they look centred.
- **Readable at phone size.** Text is big enough and has enough contrast against what is behind it. Over a busy picture, text sits on a panel or has an outline or shadow.

#### One look

- **One visual style on a screen.** Fonts, buttons, panels, icons and colours come from one family. A plain default button beside pixel art, or two fonts doing the same job, looks unfinished.
- **The same across screens.** The title, play, pause and end screens look like one game: the same button style, the same fonts, the same palette.
- **Match the art.** Code-drawn shapes, panels and effects take their colours and style from the game's art and palette, not from defaults.

#### Smooth in, smooth out

- **Nothing pops.** Screens, panels, buttons and messages fade, slide or scale in and out instead of appearing and vanishing in one frame.
- **Scene changes have a transition:** a short fade or wipe between title, play and end screens.
- **Music fades** between tracks and out at the end, rather than cutting.
- **Keep it quick.** Transitions are short, and the player can act as soon as the next screen is readable.

#### A screen that is alive

A still screen looks broken. Something should always be moving a little.
- **Idle motion:** the player character breathes or bobs, water ripples, lights flicker, background layers drift.
- **Shine and shimmer** on things worth having: pickups glint, the logo shimmers, a button the player should press pulses.
- **Prompts move:** "press to start" pulses or bobs instead of sitting still.
- **Responses to input:** buttons react when hovered and pressed, and every tap or key gets a visible answer.
- **Keep it calm where it should be.** Motion is gentle and never hides what the player needs to see. A calm puzzle game wants less of it than an arcade game, but not none.

#### Checking it in screenshots

Look at every shot, at the size it will be played, and ask:
- Is any text cut off, overflowing or too small to read?
- Does anything overlap, or sit too close to something else?
- Is everything inside the screen and lined up?
- Is there one visual style, the same as the other screens?
- Does anything on screen move, shine or respond?
- Between two shots, did things fade in and out, or pop?

### Common mistakes

These come up again and again in small games. None of them is a rule. Each is a question worth asking of a build, and each says when the answer can be "that's on purpose". The game's own design always wins: when it asks for something on this list, build what it asks.

#### Play

- **Nothing can beat the player.** You see a careless player survive anything, or a player who stands still win. Usually the threats don't reach the player, or never speed up. Fine in toys, sandboxes, cosy and idle games, where the tension comes from something else: a goal, a timer, a choice.
- **The player can't win.** You see a level that can't be finished, or a goal nobody reached in testing. Usually it is a state the code never expected: an item that can't be collected after a miss, a spawn behind a wall. Play to the end at least once.
- **Progress gets stuck.** You see a step that can't happen any more: a second pickup refused, a door that stays shut, a recipe that can't complete. Usually an order of events the code didn't allow for. Check what happens after each kind of mistake.
- **The first minute is the hardest.** You see newcomers lose before they understand the verb. Usually the game opens at full speed. Arcade games that are meant to bite from the start are the exception, as long as the retry is instant.
- **Unfamiliar rules, no teaching.** You see a player who doesn't know what to do. A card game or a new mechanic needs its rules shown in play, a step at a time. A well-known form (a Frogger, a Breakout) needs less.
- **Same start every time.** You see an identical opening on every run. Usually a fixed seed or spawn table. Fine for puzzles and hand-made levels, where the sameness is the point.

#### Fit and fairness

- **The art and the rules disagree.** You see a hit that didn't touch, a miss that should have hit, pins too wide for the gap between them, lanes off the painted lanes. Usually the collision was sized separately from the picture. Make them agree, or move the code to fit the art.
- **A control does the opposite of what it says.** You see a drag left that throws right, or up that moves down. Usually an inverted sign. Check each control once, in each direction.
- **One press does two things.** You see a press that starts the game and also hops, or a menu tap that also fires. Usually input from one scene leaking into the next.
- **A death the player didn't cause.** You see a spawn on top of the player, a threat with no warning, a hit while invulnerable. Usually spawns that ignore where the player is. Every loss should feel like the player's own mistake.

#### State and flow

- **Restart doesn't reset everything.** You see timers, music, speed-ups or leftover objects carrying into the new run. Usually state kept outside the scene that resets it.
- **Pause doesn't stop everything.** You see a timer still counting, or enemies still moving, under the pause screen.
- **Things pile up.** You see the game slow down over a long run, or objects collecting off-screen. Usually things that spawn with nothing to remove them.
- **Debug left in.** You see a key that skips levels or grants lives in the finished game. Remove it, or keep it behind something no player would press.

#### Sound

- **Silence until the first tap.** Browsers start audio only after the first input. The title can't rely on sound before it.
- **Sounds that stack.** You see the same sound played many times at once, or two music tracks after a restart. Stop the old one before starting the new one.

#### How to use this

Read it before reviewing, then play. When a build does one of these things, ask whether the design meant it. When it did, leave it.
