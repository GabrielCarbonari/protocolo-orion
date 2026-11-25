# Protocolo Órion

## Run and play

- From `C:\Users\GCO\protocolo-orion`, run `npm run -s serve` and open `http://localhost:4173`.
- Keyboard: arrows or WASD move and aim; Down/S ducks; Space jumps; Z fires; Q/Shift fires backward (hold Up+Q/Shift for up-left); Escape/P pauses; Enter starts.
- Gamepad: D-pad moves and aims, A jumps, X fires, Y/L1 fires backward, Start pauses.
- Touch: left stick moves and aims, A jumps, B fires continuously, `◀` fires backward, swipe down ducks; rotate to landscape.
- Title secret: ↑ ↑ ↓ ↓ ← → ← →, then fire and jump, starts with 30 lives.
- Build and runtime checks: `npm run -s build` and `npm run -s smoke -- --seconds 30`.

## Scenes and campaign

- Scenes: `title`, `orbital` (Part 1), `story` (Ejection cutscene), `play` (Part 2), `pause`, `gameover`, `missioncomplete`.
- Part 1 (`orbital`): Space Invaders-style Orbital Defense with Caça Estelar Órion, 4 `energy-shield-dome` bunkers, 2 alien waves, Cruzador-Mãe flagship, orbital pickups, and atmospheric ejection transition into `story` -> `play`.
- Part 2 Stage 1: steady right auto-scrolling alien jungle with 1–2 upper-left hovering alien ships firing diagonally down, instant left-edge capture, gaps, platforms, capsules, emplacements, infantry, saucers and the defense-wall boss.
- Part 2 Stage 2: five-room rear-view corridor with the Núcleo Computador boss and no countdown.
- Part 2 Stage 3: 90-platform waterfall climb, armored saucers, Órion core boss, evacuation bunker, sealed door, turret cover and extraction bonus.
- Run state and visible objects: `npm run -s play -- "inspect"`; inspect the player with `inspect soldado-orion` or `inspect caca-orion`.

## Debug controls

- `orbital`, `stage 1|2|3`, `boss 1|2|3`, `bunker`, `ending win|lose`, `screen title|orbital|cutscene|victory|game-over|pause`
- `give metralhadora|tiro-espalhado|raio-laser|bomba-de-plasma|rajada-rapida|barreira`
- `score n`, `lives 1-30`, `infinite-lives on|off`, `invincible on|off`, `keep-weapon on|off`
- `win-stage`, `lose-life`, `end-run`
- List controls with `npm run -s play -- "cheat"`; use one with `npm run -s play -- "cheat bunker"`.

## Source map

- `main.ts`: startup, controls, fallback synth sound, theme loading and scene registration; `engine.ts` is generated.
- `sfx.ts`: crew recorded SFX playback (`game.sound.sample`) with throttling and synth fallback.
- `manifest.json`: 1280×720 landscape, touch controls and Phaser AE packs; `assets.json` is crew-owned.
- `state.ts`, `levels.ts`: run state, score and hand-built stages using crew jungle ground tiles and waterfall rock ledges.
- `actors.ts`, `combat.ts`: entities, collisions, weapons, crew rifle/laser SFX and shots.
- `art.ts`: stand-in art and tutorial icons. Crew sprites, terrain, bosses, explosions, shield dome, SFX and UI theme are loaded by key from `assets.json`.
- `debug.ts`: cheats and state inspection. `scenes/Title.ts`: title, controls and secret code (launches `orbital`).
- `scenes/Orbital.ts`: Part 1 Space Invaders-style orbital defense battle, shield domes, Cruzador-Mãe flagship, and ejection transition to `story`.
- `scenes/Play.ts`: Part 2 movement, enemies, bosses, tutorials, score, extraction and stage flow.
- `scenes/Pause.ts`, `scenes/GameOver.ts`, `scenes/MissionComplete.ts`: pause and results screens.
- `input.ts`, `rotate.ts`: touch gestures, portrait prompt and mute setting.

## Remaining limits

- The account cannot use Phaser AE's Pro-only `title-screen` playback pack; the title is custom-rendered from the crew's imported design JSON.
- Some rear-view and aiming poses use hand-drawn stand-ins because the crew sprites are side-view art.
- The smoke test and final boss-to-bunker route passed; the entire three-stage campaign has not been manually played from start to finish without debug controls.
