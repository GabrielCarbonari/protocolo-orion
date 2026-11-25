# Protocolo Órion

An eight-bit run-and-gun for desktop and mobile, built with Phaser AE. The campaign has three hand-made stages: the alien jungle, the enemy base, and the waterfall climb. Portuguese (Brazil) text, synthesized sound effects, and landscape play follow `design/gdd.md`.

## Run and play

- From `C:\Users\GCO\protocolo-orion`, run `npm run -s serve` and open `http://localhost:4173`.
- Keyboard: arrows or WASD move and aim; Down/S ducks; Space jumps; Z fires; Escape/P pauses. Enter starts from the title.
- Gamepad: D-pad moves and aims, A jumps, X fires, Start pauses.
- Touch: the left stick moves and aims; A jumps; B fires continuously; swipe down to duck. Turn the phone sideways.
- Title secret: ↑ ↑ ↓ ↓ ← → ← →, then fire and jump, starts with 30 lives.
- There are sound effects and no music. Pause lets you continue, mute or return to the menu. Game over restarts the current stage.

## Scenes and stages

- Scenes: `title`, `story`, `play`, `pause`, `gameover`, and `missioncomplete`.
- Fase 1 is a 32,000-unit scrolling jungle with crash-site platforms, gaps, weapon carriers, emplacements, infantry and a defense wall boss.
- Fase 2 is a fixed rear-view corridor with five rooms and the central-computer boss. There is no countdown.
- Fase 3 climbs platforms alongside the waterfall to the Órion core, then continues to the evacuation bunker for the extraction bonus.
- Crew art provides the title logo and ship, crash still, soldier and enemy sprites, UFOs, structures, weapons, shots, explosions, backdrops, and results paintings. The imported `title-screen` design JSON is the layout source for the custom-rendered title; Phaser AE's title-screen playback pack is Pro-only on this account.

## Build and checks

- `npm run -s build` builds `dist/`.
- `npm run -s smoke -- --seconds 30` runs a scene and input smoke test.
- `npm run -s play -- "cheat stage 2; shot base"` jumps to a stage for inspection; use `cheat boss 1|2|3`, `cheat bunker`, `cheat screen victory`, `give barreira|rajada-rapida|tiro-espalhado`, `lives 1-30`, `score 10000`, `win-stage`, or `end-run` for other checkpoints.

## Source map

- `main.ts`: startup, controls, synthesized sound, theme loading and scene registration. `engine.ts` is generated; do not edit it.
- `manifest.json`: screen, touch controls and Phaser AE packs. `assets.json` is crew-owned.
- `scenes/`: title, story, play, pause, game-over and victory screens.
- `state.ts`, `levels.ts`, `actors.ts`, and `combat.ts`: campaign state, stage layouts, shared entities and combat.
- `art.ts`: pixel-art stand-ins, tutorial icons, effects and the default weapon capsules.
- `debug.ts`: inspection and test cheats. `input.ts` and `rotate.ts`: gestures and portrait-screen prompt.
