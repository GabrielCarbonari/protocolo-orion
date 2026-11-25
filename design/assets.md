## Assets

Everything the crew made for this game, by the key the game's `assets.json` loads it under: use each one by its key. Draw or synthesize something only where an entry says it was not made. Sizes are in pixels, lengths in seconds.

### Logo

The approved logo: the game's name, "Protocolo Órion", with a transparent background. The title screen (below) shows its own copy of it; use this one anywhere else the game shows its name.

- **logo** · 1536×1024

### Sprites

One picture per sprite, cut from painted sheets and named and tagged by the crew, transparent around the edges. Each is a single still frame (no animation strips). Match them to the entities on the rules page by name; a sprite stands on its bottom center unless noted. `assets.json` loads each at 256 pixels (its `spriteSize`; 128 is there too), and scenery at 512 (its own `size`): scale sprites to the game's units.

A sprite's **world size** is how big the thing is in the game's world, in metres along its longer side (a person is about 1.8). Draw the sprites in proportion to it, so a tree stands well over the player and a car is longer than a crate: the pictures themselves are all about the same size, whatever they show. It is a guide, not a rule: a game may shrink its trees and buildings to fit the screen, but keeps them in proportion to each other. A sprite with none is sized by play (pickups, icons, effects).

**Scenery** (noted below) was painted for the game's world: trees, buildings, ledges, platforms, rocks, vehicles, big props. Build the levels from these sprites rather than drawing their shapes in code. A ledge or platform sprite is the art: give it a body along its top surface.

#### Sheet 1

Painted as: "Soldado Orion commando, alien infantry trooper"; "armored soldier in light grey suit with blue goggles running with rifle, armored soldier crouching prone firing rifle, armored soldier spinning acrobatic somersault jump ball, armored soldier aiming rifle diagonally up"; "alien flying saucer ufo with yellow underbelly lights"; "military defense bunker fortification with twin turrets and sandbags"; "human aerospace starfighter interceptor jet"; "spread shot weapon capsule, laser rifle weapon capsule, glowing energy shield orb, plasma bomb pickup"; "retro 8-bit weapon projectiles and explosion: rifle bullet, spread shot pellet, laser beam bolt, pixel explosion fireball"; "bunker modular de evacuacao com comporta blindada e torre de comunicacao"; "tactical pilot running sprint with rifle, tactical pilot midair jump flip with rifle"; "crimson jumping alien insectoid parasite, bulbous alien acid spitter plant"; "alien dive bomber gunship, alien chitinous escort cruiser"; "tactical pilot standing idle with rifle, tactical pilot aiming rifle straight up"; "tactical pilot survivor crouching firing rifle with muzzle flash, tactical pilot survivor weapon recoil pushback pose"; "giant biomechanical alien boss with pulsating core and chitinous armor plates, cybernetic whip tentacle, plasma turret node"; "giant glowing plasma energy sphere projectile, heavy alien energy bolt projectile, tracking biological spore projectile"; "massive boss explosion expanding fireball flash, massive boss explosion plasma shockwave ring, massive boss explosion fiery shrapnel and smoke dissipating"; "long jagged dark alien rock platform ledge, medium alien stone cliff step, small rocky alien ledge"; "tactical space marine standing idle full body, tactical space marine running left foot forward full body, tactical space marine running mid-stride full body, tactical space marine running right foot forward full body, tactical space marine jumping mid-air full body, tactical space marine crouching l"; "tactical space marine standing aiming rifle straight up full body"; "upward-curving half-bubble energy shield dome arch force field, bright glowing cyan outer rim, smooth pixel-dithered cyan-to-deep-blue gradient fading into semi-transparent hollow interior with 50% transparency dithering and open flat bottom"; "armored conical space ejection pod capsule wrapped in atmospheric reentry flames and sparks"; "alien jungle top-surface ground tile with mossy foliage overhang, solid underground dark volcanic rock and twisted root fill tile, dark volcanic earth tile with purple crystals, floating alien jungle platform ledge with beveled edges and moss"; "small insectoid alien scout drone ship with metallic purple carapace, sturdy red triangular alien dive bomber spaceship, alien aerial pursuit warship"; "retro arcade blue sea water surface tile with bright cyan and white cresting pixel waves, deep blue rippling water body tile"; "alien plasma turret, biomechanical ground turret, alien twin laser turret"; "top-down white and blue military starfighter facing straight up, twin wingtip cannons, blue cockpit, orange thruster flame at bottom".

| Key | Sprite | Size | World size | Notes |
|---|---|---|---|---|
| infantaria-biomecanica | infantaria biomecanica | 676×763 | about 2.1 m | for: enemy, npc |
| soldado-orion-correndo | soldado orion correndo | 510×494 | about 1.7 m | for: player, enemy |
| soldado-orion-agachado | soldado orion agachado | 757×237 | about 1.9 m | for: player, enemy |
| soldado-orion-salto-acrobatico | soldado orion salto acrobatico | 318×367 | about 1.2 m | for: player, enemy |
| soldado-orion-mirando-diagonal | soldado orion mirando diagonal | 465×627 | about 1.8 m | for: player, enemy |
| disco-voador-classico | disco voador classico | 338×187 | about 6 m | for: enemy, vehicle |
| disco-voador-batedor | disco voador batedor | 336×188 | about 5.5 m | for: enemy, vehicle |
| disco-voador-furtivo | disco voador furtivo | 365×164 | about 5 m | for: enemy, vehicle |
| disco-voador-blindado | disco voador blindado | 338×259 | about 7 m | for: enemy, boss |
| torreta-dupla-automatica | torreta dupla automatica | 417×326 | about 2.3 m | scenery; for: weapon, enemy |
| barricada-de-sacos-de-areia | barricada de sacos de areia | 418×150 | about 2.3 m | scenery; for: obstacle, prop |
| destrocos-do-caca-abatido | destrocos do caca abatido | 673×320 | about 7 m | scenery; for: prop, obstacle |
| propulsor-de-reforco | propulsor de reforco | 426×152 | about 4.5 m | scenery; for: prop, power-up |
| suporte-de-misseis | suporte de misseis | 282×133 | about 3 m | scenery; for: weapon, ammo |
| pickup-tiro-espalhado | pickup tiro espalhado | 365×537 | — | for: power-up, pickup |
| pickup-raio-laser | pickup raio laser | 364×537 | — | for: power-up, pickup |
| pickup-escudo-de-energia | pickup escudo de energia | 480×487 | — | for: power-up, pickup |
| pickup-bomba-de-plasma | pickup bomba de plasma | 468×490 | — | for: power-up, pickup |
| projetil-tiro-padrao | projetil tiro padrao | 484×175 | — | for: projectile |
| projetil-tiro-espalhado | projetil tiro espalhado | 436×459 | — | for: projectile |
| projetil-raio-laser | projetil raio laser | 677×282 | — | for: projectile |
| explosao-pixel-8bit | explosao pixel 8bit | 567×536 | — | for: effect |
| torre-de-antena-do-bunker | torre de antena do bunker | 260×933 | about 15 m | scenery; for: building, prop |
| modulo-bunker-de-evacuacao | modulo bunker de evacuacao | 672×482 | about 8 m | scenery; for: building |
| comporta-blindada-de-evacuacao | comporta blindada de evacuacao | 313×331 | about 2.5 m | scenery; for: door |
| piloto-sobrevivente-correndo | piloto sobrevivente correndo | 727×673 | about 1.8 m | for: player |
| piloto-sobrevivente-salto-no-ar | piloto sobrevivente salto no ar | 537×559 | about 1.5 m | for: player |
| parasita-terrestre-saltador | parasita terrestre saltador | 538×610 | about 1.2 m | for: enemy |
| cuspidor-acido-fixo | cuspidor acido fixo | 640×787 | about 2 m | for: enemy, hazard |
| bombardeiro-alienigena-rasante | bombardeiro alienigena rasante | 784×666 | about 14 m | for: enemy, vehicle |
| cruzador-mae-alienigena | cruzador-mae alienigena | 638×1130 | about 45 m | for: enemy, vehicle |
| piloto-sobrevivente-parado | piloto sobrevivente parado | 586×736 | about 1.8 m | for: player, enemy |
| piloto-sobrevivente-mirando-para-cima | piloto sobrevivente mirando para cima | 494×941 | about 2.2 m | for: player, enemy |
| piloto-sobrevivente-disparando-agachado | piloto sobrevivente disparando agachado | 801×507 | about 1.4 m | for: player |
| piloto-sobrevivente-em-recuo | piloto sobrevivente em recuo | 507×715 | about 1.7 m | for: player |
| chefe-final-biomecanico | chefe final biomecanico | 738×981 | about 8 m | scenery; for: boss, enemy |
| tentaculo-mecanico-do-chefe | tentaculo mecanico do chefe | 477×431 | about 3.8 m | scenery; for: boss, hazard |
| no-de-canhao-de-plasma | no de canhao de plasma | 320×238 | about 2.2 m | scenery; for: enemy, trap |
| esfera-de-plasma-do-chefe | esfera de plasma do chefe | 438×467 | — | for: projectile, hazard |
| disparo-pesado-de-energia-alienigena | disparo pesado de energia alienigena | 538×315 | — | for: projectile, hazard |
| esporo-biologico-teleguiado | esporo biologico teleguiado | 385×386 | — | for: projectile, hazard |
| explosao-do-chefe-clarao-de-fogo | explosao do chefe clarao de fogo | 477×521 | — | for: effect, hazard |
| explosao-do-chefe-onda-de-choque-de-plasma | explosao do chefe onda de choque de plasma | 509×573 | — | for: effect, hazard |
| explosao-do-chefe-fumaca-e-estilhacos | explosao do chefe fumaca e estilhacos | 476×583 | — | for: effect, particle |
| alien-stone-cliff-step | alien stone cliff step | 692×369 | about 4 m | scenery; for: platform, terrain |
| small-rocky-alien-ledge | small rocky alien ledge | 410×199 | about 2.5 m | scenery; for: platform, terrain |
| long-alien-rock-platform | long alien rock platform | 1490×328 | about 8 m | scenery; for: platform, terrain |
| player-idle | player_idle | 426×508 | about 1.8 m | for: player |
| player-run-1 | player_run_1 | 480×491 | about 1.8 m | for: player |
| player-run-2 | player_run_2 | 458×475 | about 1.8 m | for: player |
| player-run-3 | player_run_3 | 464×478 | about 1.8 m | for: player |
| player-jump | player_jump | 388×404 | about 1.8 m | for: player |
| player-crouch | player_crouch | 414×361 | about 1.8 m | for: player |
| player-aim-up | player_aim_up | 596×1353 | about 1.8 m | for: player |
| energy-shield-dome | energy_shield_dome | 1372×733 | — | for: effect |
| capsula-de-ejecao-atmosferica | capsula de ejecao atmosferica | 978×637 | about 3 m | for: vehicle |
| jungle-ground-tiles-top | jungle_ground_tiles_top | 564×599 | about 1 m | for: tile, terrain |
| jungle-ground-tiles-fill | jungle_ground_tiles_fill | 564×509 | about 1 m | for: tile, terrain |
| jungle-ground-tiles-crystal | jungle_ground_tiles_crystal | 562×567 | about 1 m | for: tile, terrain |
| jungle-ground-tiles-platform | jungle_ground_tiles_platform | 655×570 | about 3 m | for: platform, terrain |
| drone-batedor | drone batedor | 390×294 | about 3 m | for: enemy |
| bombardeiro-de-mergulho | bombardeiro de mergulho | 402×418 | about 6 m | for: enemy |
| nave-alienigena-aerea | nave alienigena aerea | 484×349 | about 10 m | for: enemy |
| mar-superficie | mar_superficie | 586×577 | about 1 m | for: tile, terrain |
| mar-profundo | mar_profundo | 586×578 | about 1 m | for: tile, terrain |
| torreta-de-plasma-alienigena | torreta de plasma alienigena | 449×427 | about 2 m | for: enemy, hazard |
| torreta-biomecanica-terrestre | torreta biomecanica terrestre | 454×443 | about 2 m | for: enemy, hazard |
| torreta-laser-dupla-alienigena | torreta laser dupla alienigena | 460×427 | about 2 m | for: enemy, hazard |
| caca-estelar-orion | caca estelar orion | 940×1012 | about 14 m | for: player, vehicle |

On the Entities & Rules page, with no sprite named for them: Indicador de Escudos Orbitais, Cápsula de Ejeção Atmosférica, Naves Alienígenas Aéreas, Plataformas Rochosas e Despenhadeiros, Base de Evacuação Humana, Cápsulas de Reforço Temporário de Tiro, Recarga de Munição Rápida, Defesa Espacial e Vidas na Parte Um, Cúpulas de Escudo de Energia na Parte Um, Vitória Orbital e Transição para a Parte Dois, Rolagem Automática e Condição de Derrota, Salto Vertical Totalmente Livre, Marcha e Fogo dos Inimigos Terrestres, Perseguição e Disparo das Naves Alienígenas Aéreas, Resgate e Conclusão, Abate de Belonaves, Eliminação de Insetoides Terrestres, Tempo e Distância Sobrevividos, Bônus de Extração. Use a kept sprite that plainly shows the thing (check the names above), or draw a simple stand-in in the same style.

### Game UI

The interface skin for the engine's `ui` pack, "Terminal": A green phosphor terminal: black glass, one thin green rule, cut corners, scanlines, tall low-resolution type that glows. One theme file (`phaser-ae-ui-theme`) styles every widget and the dialogue box. Compose `typography` and `ui` (and `nine-slice` and `dialogue` for conversations), then before the first screen: `game.ui.theme = await game.ui.loadTheme(game.assets.get('ui-theme'));`. It loads its own fonts (VT323), which any other text in the game can use by family name.

Build screens from the pack's widgets (`window`, `panel`, `button`, `label`, `slider`, `progress`, `checkbox`, `list`, `input` …) and let the theme dress them; a widget takes a role by `style`: `'good'` for a confirm button, `'warn'` for caution, `'bad'` for danger or quit, `'flat'` for a quiet one, `'icon'` for a square icon button, `'heading'` for a large label, `'panel'` for a HUD box. Pass no other style fields. A button with no width sizes itself to its icon and caption. A dialogue opened without a preset wears the skin's box.

Symbols on buttons are the pack's own icons (`icon: 'pause'`, `'sound-on'`, `'restart'`, `'home'`, `'star'`, `'coin'`, `'lock'` …), never letters; the theme colors them with the button text, stroked and extruded as its captions are. The game's pause and sound buttons are `game.ui.pauseButton()` and `game.ui.muteButton()`, which wear the `'icon'` role.

For anything drawn outside the pack, take colors from the palette: ink `#33ff66` (text on windows and panels), paper `#020a04` (window bodies), panel `#041008` (HUD boxes, cards, slots), face `#062a10` (button faces, title bars), text `#66ff99` (text on buttons), accent `#33ff66` (focus, knobs, ticks, bar fills, the chosen row), rim `#1f8b3f` (borders and frames), good `#33ff66` (confirm, health), warn `#ffd166` (caution), bad `#ff5a5a` (danger, quit), shade `#000000` (shadows and inner depth), glow `#33ff66` (light thrown by lit things).

- **ui-theme**: the theme file

### Title screen

The game's animated title screen, "Última Órbita", designed on the Title Screen page and played by the engine's `title-screen` pack, so the game shows exactly what was designed: the key art, shaders, layers arriving and staying alive, the small surprises, the prompt, and the transition into play. Play it as it is: do not draw another title screen or add to this one.

Compose `title-screen`, `backdrops`, `typography`, `particles-2d`, `effects-2d`, `fx-halo`, `post`, `post-scanlines`, `post-vignette`, `transition` beside the game's 2D world (`world-side` or the world it already has). The title scene is one call:

```js
game.titleScreen.play(game.assets.get('title-screen'), { next: 'play', wait: () => game.assets.load(assets, { pack: 'game' }) });
```

Any press (Space, Enter, a click or a tap) starts the game: the screen waits for the `game` pack, then leaves through its own transition (pixels). Its pictures and sounds are in the `title` pack under the keys it names (`title-logo`, `title-sprite-soldado-orion-salto-acrobatico`, `title-sprite-caca-aeroespacial-orion`). Wait for `game.titleScreen.settled` before a screenshot of the title.

- **title-screen**: the title screen file

### Pictures

Full-frame paintings for screens and backdrops, each loaded as a WebP fitted to the game's screen (its size is the one given here): the one the designer put in the game for each picture.

| Key | Use | Where it goes | What it shows | Size |
|---|---|---|---|---|
| title | Title screen | Key art for the title screen | A lone commando overlooking a burning alien horizon as starfighters clash above. | 1280×714 |
| cutscene | Story still | A story still | Ejection to Surface: The burning fighter disintegrates as the escape pod plunges into alien atmosphere. | 1280×714 |
| background-orbital-defense | Background | A playable backdrop | Orbital Defense: Low orbit above gleaming colony domes under deep space starfields and nebulae. | 1280×714 |
| game-over | Game over | The defeat screen | Signal Lost: A cracked visor helmet resting on smoking wreckage amid encroaching alien vines. | 1280×714 |
| store | Store art | Store capsule art | Store Capsule: A commando blasts relentless alien hordes beneath a roaring orbital dogfight. | 1280×714 |
| victory | Victory | The win screen | Evacuation Shuttle: An evacuation dropship lifts off toward the dawn as alien ruins burn below. | 1280×714 |
| background-defense-base-corridor | Background | A playable backdrop | Defense Base Corridor: Interior corridor of an alien fortress bristling with cybernetic tubes and blastdoors. | 1280×714 |
| background-alien-jungle-surface | Background | A playable backdrop | Alien Jungle Surface: Twisted alien jungle canopy and jagged crystalline spires beneath an amber sky. | 1280×714 |

### Textures

Seamless textures that repeat, each a WebP loaded by `assets.json` under its key. A **3D surface** tiles over a mesh as a `world3d` material, its normal map (the key with `-normal`) giving the engine's lights its relief; set `tile` so one repeat covers about two units, or what looks right for the place. A **2D background** is one sprite the size of the screen whose texture repeats (`uvRepeat`) and slides as the game scrolls (`scrollX` / `scrollY`, in tiles a second); an axis it does not tile is not repeated.

| Key | Texture | Use | Repeats | Size | Where it goes |
|---|---|---|---|---|---|
| starfield | Starfield | 2D background | across (side to side) | 768×1024 | a deep black starfield with scattered bright stars and a faint violet nebula |

A background, in the engine:

```js
const starfield = game.spawn({ frame: game.assets.frames('starfield'), x: game.screen.width / 2, y: game.screen.height / 2,
    width: game.screen.width, height: game.screen.height, uvRepeat: { x: game.screen.width / 768, y: game.screen.height / 1024 } });
// each step — it travels the way the game scrolls, in tiles a second (the sign sets the direction):
starfield.scrollX += 0.05 * dt;
```

### Concept art

The mood board holds 2 concept pictures: reference for the look only, not for use in the game, and not loaded.

### Sound effects

#### Protocolo Órion SFX

Play each one at the moment its name says. The description is what it sounds like.

| Key | When it plays | What it sounds like | Length | Loop |
|---|---|---|---|---|
| ship-laser | ship laser (weapon) | crisp dual 8-bit chiptune laser cannon pew, bright high-to-low pitch sweep, tight dry retro arcade video game sound effect, no reverb | 0.5s | no |
| enemy-plasma | enemy plasma (weapon) | menacing 8-bit alien plasma orb discharge, gritty modulated synth buzz with quick downward pitch drop, retro arcade video game sound effect | 0.5s | no |
| shield-damage | shield damage (impact) | metallic electronic crackle and 8-bit power-down buzz, harsh square-wave glitch into descending tone, dry retro arcade video game sound effect | 1.0s | no |
| ship-explosion | ship explosion (impact) | crunchy 8-bit retro arcade explosion, punchy low-end thump with gritty white-noise burst and short decay, video game sound effect | 1.5s | no |
| atmospheric-ejection | atmospheric ejection (vehicle) | mechanical metal clamp release into fiery 8-bit noise whoosh, rising intensity, retro arcade video game sound effect | 2.0s | no |
| pilot-footstep | pilot footstep (player) | short gritty 8-bit boot step on alien rock, tight low-mid noise thud, dry retro arcade video game sound effect | 0.5s | no |
| pilot-jump | pilot jump (player) | snappy 8-bit chiptune jump, quick upward square-wave pitch sweep, bright and tight retro arcade video game sound effect | 0.6s | no |
| rifle-shot | rifle shot (weapon) | punchy 8-bit military pulse rifle shot, sharp transient crack with short white-noise tail, dry retro arcade video game sound effect | 0.5s | no |
| alien-hit | alien hit (enemy) | wet 8-bit alien creature hit, squelchy synth crunch with quick downward chirp, retro arcade video game sound effect | 0.5s | no |
| alien-death | alien death (enemy) | screeching 8-bit alien creature death, descending harsh chiptune roar into a crunchy burst, retro arcade video game sound effect | 1.0s | no |
| bunker-door | bunker door (machine) | heavy armored bunker blast door sliding shut, low metallic 8-bit rumble ending in a solid lock clank, retro arcade video game sound effect | 1.5s | no |
| mission-clear | mission clear (stinger) | triumphant 8-bit chiptune fanfare, four rising major-key square-wave notes with snare roll, 140 BPM, ending on a bright chord hit | 3.0s | no |

### Music

Not made. Leave the game without music, or synthesize a simple loop.

### Loading

The game's `assets.json` loads every file above by its key, in two packs. `title` holds what the title screen shows, and loads under the loading screen: the title screen file and its pictures and sounds, the buttons and the menu click. `game` holds everything else, and loads quietly while the title is up. Move a file to `title` if the title screen shows it, and split `game` into packs of its own (`level-1`, `level-2` …) if it is too big to load in one go.
