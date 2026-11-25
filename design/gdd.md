# Protocolo Órion

Abatido em órbita, o Soldado Órion cai na superfície de um planeta alienígena e abre caminho a tiros por três setores, a selva, a base e a cachoeira, até destruir o coração da invasão e alcançar o bunker de evacuação. Um run and gun retrô de oito bits no espírito de Contra.

## The game

- **Platform:** mobile and desktop, landscape.
- **Screen:** landscape first. On a phone held upright the game asks to be turned.
- **Graphics:** 2D, 8-bit pixel art.
- **Kind of game:** run and gun. Reference game: Contra (1988).
- **Setting:** modern military meets an alien world.
- **Audience:** everyone. Nothing that isn't fine for a child. This only sets limits; nothing is added because of it.
- **Length:** one sitting of ten to twenty minutes, three stages.
- **Sound:** sound effects only, no music.
- **Language:** Portuguese (Brazil). Every word a player reads or hears is in Portuguese (Brazil): the title, menus, buttons, HUD labels, tutorial hints, messages and the names of characters, items, enemies and places. It reads left to right. The UI theme's font (VT323) is used for all text.

## Decisions

1. **The orbital space shooter is dropped.** The crew's "Parte Um" (the Caça Estelar Órion at the bottom of a fixed screen, Drones Batedores in formation, Bombardeiros de Mergulho, Cúpulas de Escudo de Energia, the Indicador de Escudos Orbitais, the orbital Cápsulas de Reforço and the wave boss) is a different game from the brief's. The brief's game is three hand-made Contra stages. The ship controls in the controls table (Mover a Nave, Disparar Canhões) go with it. The pitch's downed ship stays only as the opening story still (`cutscene`).
2. **The crew's autoscroll and swarm wall are dropped.** The brief's screen scrolls only as the player moves forward and never back. There is no living wall at the left edge and no instant capture by it.
3. **A single ground run becomes three stages.** The crew wrote one escape to the bunker. The game has the brief's three: Setor 1 Selva (side-scrolling), Setor 2 Base (behind-view corridor) and Setor 3 Cachoeira (vertical climb).
4. **Death costs a life, not the game.** The crew made falls and hits an instant Game Over. The brief has one-hit deaths that cost one of three lives. Game Over comes only when all lives are gone.
5. **The win is the Stage 3 boss.** Winning means destroying the Setor 3 boss, as the brief says. The crew's arrival at the evacuation bunker is kept as the closing beat right after that boss. The crew's "win by reaching an extraction score" is dropped.
6. **Bosses.** The brief says both "culminating in the Defense Wall" and lists three bosses. Settled as one boss per stage: Muralha de Defesa (Setor 1), Computador Central (Setor 2) and Coração Alienígena (Setor 3, the final boss).
7. **Desktop controls.** The brief's table gives no jump key and shoots on Z. The brief's text says Z/Space jump and X/Enter shoot. Settled: arrows or WASD move, aim and duck; **Space** jumps; **Z** shoots.
8. **Weapon letters in Portuguese.** M Metralhadora, **E** Espalhado (the brief's S), L Laser, F Fogo, R Rápido, B Barreira.
9. **Capsule art.** The pickup art shows icons, not letters:
   - `pickup-tiro-espalhado` is E.
   - `pickup-raio-laser` is L.
   - `pickup-bomba-de-plasma` is F.
   - `pickup-escudo-de-energia` is B.
   - M and R have no art and are drawn as stand-ins in the same capsule style, marked with their letter.
   - The F shot has no projectile art and gets a stand-in fireball.
10. **The flying pod.** The brief's winged weapon pod uses `propulsor-de-reforco`.
11. **The player.** The game uses the `player-*` set as the main animation set. It adds `soldado-orion-salto-acrobatico` for the somersault, `soldado-orion-mirando-diagonal` for diagonal aim, `piloto-sobrevivente-disparando-agachado` for firing while ducked and `piloto-sobrevivente-em-recuo` for the death knock-back. The rest of the soldado/piloto sprites are not used. The art settles his look: blue visor, rifle. The crew's text said a green visor and a pistol.
12. **Stage 2 art angle.** `background-defense-base-corridor` is painted side-on. The brief's Stage 2 is a behind-view corridor, so the view stays behind-view and the art does not match it. Use it only as the backdrop's look and colors; the corridor's depth is drawn as a stand-in.
13. **Stage 3 waterfall.** No waterfall picture was made. The cascade is a stand-in in the same style, set over `background-alien-jungle-surface` and the rock ledge sprites.
14. **Orbital-only art becomes unused or reused.**
    - `background-orbital-defense`, `starfield`, `caca-aeroespacial-orion` and `cruzador-mae-alienigena` are not used in play.
    - `energy-shield-dome` becomes the look of the Barreira.
    - `ship-laser` becomes the Laser weapon's sound.
    - `enemy-plasma` becomes the enemies' shot sound.
    - `ship-explosion` becomes the turret and boss-part explosion sound.
    - `shield-damage` becomes the Barreira running out.
    - `atmospheric-ejection` plays over the opening still.
15. **Crew enemies kept in the brief's game.** The Naves Alienígenas Aéreas (`disco-voador-*`, `bombardeiro-alienigena-rasante`), the Parasitas Terrestres and the wall plants spitting acid spores (`cuspidor-acido-fixo`) fit the side-scrolling stages and stay.
16. **Infantry behavior.** The brief's infantry run, jump off ledges and stop to fire. The crew's march in from the right firing straight ahead. Merged: they enter ahead of the player, run at him, drop off ledges and stop now and then to fire straight shots.
17. **Score.** The brief's scoring is kept: enemies, turrets and boss parts. From the crew it adds:
    - points for shooting spores out of the air;
    - points for ground covered;
    - an extraction bonus at the bunker for lives kept.

    Orbital points and the shield bonus are dropped.
18. **Gentle failure.** The brief asks for both "prompt restart" and soft, quick recovery. Settled: Game Over offers "Tentar de novo", which restarts the stage reached with a fresh set of lives.
19. **The thirty-lives code.** It is typed on the title screen with keyboard or gamepad. The title screen is played exactly as designed, with nothing drawn or added to it.
20. **No-ceiling jump.** The crew's "no invisible ceiling" is kept: the jump is never cut short at the top of the screen.
21. **Difficulty targets.** The pages state none for this game. The targets below are the ones their words imply.

## The design

### What it is

A side-on run and gun across three hand-made stages. The Soldado Órion runs, somersaults, ducks and fires in eight directions. He dies to a single hit, and he upgrades his gun from capsules he shoots out of the air or out of casamatas.

### Story frame

The game opens on a story still, `cutscene` ("Ejeção para a Superfície"). The caça burns up and the escape pod (`capsula-de-ejecao-atmosferica` in the picture) plunges into the atmosphere while `atmospheric-ejection` plays. Setor 1 begins at the crash site, among `destrocos-do-caca-abatido`.

### Core loop

1. Run right, or climb upward in Setor 3, firing in eight directions.
2. Shoot flying pods and casamatas to free weapon capsules.
3. Grab weapons (Espalhado above all) while dodging bullets and enemies by jumping and ducking.
4. Reach the boss of the stage.
5. Destroy the boss's parts and its core to clear the stage.

### Rules

- **One hit.** Touching an enemy or an enemy shot costs one life. The soldier comes back at once, invulnerable for a short while, blinking.
- **Falling.** Falling into a pit costs one life.
- **Lives.** Play starts with three lives. Losing the last one is Game Over.
- **Thirty lives.** The secret code on the title screen starts the game with trinta vidas instead.
- **Weapons.** Touching a weapon capsule takes it at once:
  - M, E, L and F replace the current weapon.
  - R makes the current weapon fire faster for a while.
  - B surrounds the soldier with a Barreira that makes him untouchable for a while.
  - Dying returns him to the standard rifle.
- **Ducking.** Ducking flattens the soldier so high shots pass over him. Ducking on a thin platform drops him through it.
- **Jumping.** The jump is a somersault in a full, free arc, never cut short by a ceiling.
- **Scrolling.** The screen scrolls only as the player moves forward. It never scrolls back: right in Setores 1 and 3's runs, up in the Setor 3 climb.
- **Feel.** Every command answers at once, with no inertia. A jump still works just after running off an edge, and a jump pressed just before landing is kept.

### Win, lose, score

- **Win:** destroy the Coração Alienígena at the end of Setor 3. The soldier then reaches the evacuation bunker:
  - the `comporta-blindada-de-evacuacao` slides shut (`bunker-door`);
  - the roof turrets fire at the swarm;
  - `mission-clear` plays;
  - the victory screen follows.
- **Lose:** lose every life (Game Over).
- **Score** is shown as "Pontos" and earned for:
  - every enemy killed;
  - every turret and casamata destroyed;
  - every boss part destroyed;
  - every spore shot out of the air;
  - ground covered;
  - an extraction bonus at the bunker for the lives kept.

### Entities

**The player**

- **Soldado Órion.** A pilot in a light grey armored suit with a blue visor and a rifle.
  - Standing: `player-idle`.
  - Running: `player-run-1`, `player-run-2`, `player-run-3`.
  - Jumping: `player-jump` at the start and end of a jump, `soldado-orion-salto-acrobatico` spinning in the somersault.
  - Ducking: `player-crouch`; while firing ducked, `piloto-sobrevivente-disparando-agachado`.
  - Aiming straight up: `player-aim-up`.
  - Aiming diagonally: `soldado-orion-mirando-diagonal`.
  - On death: `piloto-sobrevivente-em-recuo` as he is knocked back.

**Ground enemies**

- **Infantaria Biomecânica** (`infantaria-biomecanica`). Purple biomechanical troopers. They enter ahead of the player, run at him, drop off ledges and stop now and then to fire straight shots.
- **Parasita Terrestre** (`parasita-terrestre-saltador`). A crimson insectoid crawler that rushes in front of the soldier and lunges in quick leaps.
- **Cuspidor Ácido** (`cuspidor-acido-fixo`). A bulbous carnivorous plant fixed to walls and ledges. It spits **Esporos Ácidos** (`esporo-biologico-teleguiado`), green bubbling spores that fall in downward arcs and can be shot out of the air.

**Emplacements**

- **Torreta** (`torreta-dupla-automatica`). A fixed gun emplacement that turns to aim and fires single shots. Weapons destroy it.
- **Casamata** (`bunker-defensivo-pillbox`). A fixed concrete pillbox. Shooting it open frees a weapon capsule.

**Air enemies and the pod**

- **Naves Alienígenas Aéreas.** Saucers and gunships that sweep in from the upper left and fly right, firing diagonally downward to pin the player against the ground threats. The kinds are `disco-voador-classico`, `disco-voador-batedor`, `disco-voador-furtivo`, `disco-voador-blindado` (the tougher one) and `bombardeiro-alienigena-rasante`.
- **Cápsula Voadora** (`propulsor-de-reforco`). A winged weapon pod that drifts across the screen and drops a weapon capsule when shot.

**Weapon capsules**

Each capsule bobs gently where it lands.

| Letra | Nome | Arte | O que faz |
| --- | --- | --- | --- |
| M | Metralhadora | stand-in capsule | Fast stream of standard shots (`projetil-tiro-padrao`) |
| E | Espalhado | `pickup-tiro-espalhado` | A fan of red orbs (`projetil-tiro-espalhado`) |
| L | Laser | `pickup-raio-laser` | A piercing cyan bolt (`projetil-raio-laser`) |
| F | Fogo | `pickup-bomba-de-plasma` | Spiralling fireballs (stand-in) |
| R | Rápido | stand-in capsule | Faster fire for the current weapon, for a while |
| B | Barreira | `pickup-escudo-de-energia` | A shield (`energy-shield-dome`) that makes him untouchable for a while |

The standard rifle (Fuzil) fires `projetil-tiro-padrao`.

**Enemy shots**

Infantry, turrets and air ships fire `disparo-pesado-de-energia-alienigena`. Every enemy shot flashes brightly so it reads clearly against the scenery.

**Bosses**

- **Muralha de Defesa** (end of Setor 1). A fortified wall in the style of `bunker-defensivo-pillbox`, topped with `torreta-dupla-automatica` turrets and holding a glowing core (stand-in). Destroy the turrets, then the core.
- **Computador Central** (end of Setor 2). A glowing core (stand-in) at the back of the corridor, guarded by `no-de-canhao-de-plasma` nodes. Destroy the nodes, then the core.
- **Coração Alienígena** (end of Setor 3, final boss).
  - It is `chefe-final-biomecanico`, the giant biomechanical boss with a pulsing core and chitin plates.
  - It whips `tentaculo-mecanico-do-chefe` tentacles and carries `no-de-canhao-de-plasma` nodes.
  - It fires `esfera-de-plasma-do-chefe` and `disparo-pesado-de-energia-alienigena`.
  - Destroy the tentacles and nodes, then the heart.
  - It dies in `explosao-do-chefe-clarao-de-fogo`, then `explosao-do-chefe-onda-de-choque-de-plasma`, then `explosao-do-chefe-fumaca-e-estilhacos`.

**Effects and props**

- **Explosões.** Ordinary enemies and turrets burst in `explosao-pixel-8bit`. Bosses use the three boss explosion sprites.
- **Scenery props:**
  - `barricada-de-sacos-de-areia` and `suporte-de-misseis` in the base;
  - `destrocos-do-caca-abatido` at the crash site.
- **Base de Evacuação** (after the final boss), built from:
  - `modulo-bunker-de-evacuacao`, the steel bunker;
  - `comporta-blindada-de-evacuacao`, the zig-zag blast door with a yellow warning light;
  - `torre-de-antena-do-bunker`, the antenna mast.

### Places

1. **Setor 1 — Selva.** A side-scrolling run to the right through the alien jungle. The backdrop is `background-alien-jungle-surface`. The ground is `jungle-ground-tiles-top` over `jungle-ground-tiles-fill`, with `jungle-ground-tiles-crystal` patches. There are thin floating `jungle-ground-tiles-platform` ledges and pits to jump. It opens at the crash site and ends at the Muralha de Defesa.
2. **Setor 2 — Base.** A fixed behind-view corridor inside the alien fortress, looking down the corridor. Its look comes from `background-defense-base-corridor`.
   - The soldier moves side to side at the near end, jumps, ducks, and fires into the corridor.
   - Each wall section's `no-de-canhao-de-plasma` nodes and core sensor (stand-in) must be destroyed to open it and go deeper.
   - Infantaria Biomecânica run out of the corridor at him.
   - The Computador Central waits at the far end.
3. **Setor 3 — Cachoeira.** A vertical climb up a rock face beside an alien waterfall (stand-in cascade) over `background-alien-jungle-surface`. The screen scrolls up as he climbs and never back down. The climb is built from `alien-stone-cliff-step`, `small-rocky-alien-ledge` and `long-alien-rock-platform` (each with a body along its top), with Cuspidores on the walls and air ships crossing. The Coração Alienígena waits at the top, and beyond it the Base de Evacuação.

### Screens and flow

1. **Title:** "Última Órbita", played as designed (see Assets). Any press starts the game. The secret code may be typed here with keyboard or gamepad.
2. **Story still** (`cutscene`).
3. **Setor 1**, which opens with the learning stretch.
4. **Stage clear:** a short banner ("Setor concluído").
5. **Setor 2**, then stage clear.
6. **Setor 3**.
7. **Bunker closing beat.**
8. **Vitória** (`victory`, "Missão Cumprida"): the score and "Jogar de novo".

Other screens:

- **Game Over** (`game-over`, "Sinal Perdido"): the score, "Tentar de novo" (restarts the stage reached with fresh lives) and "Menu".
- **Pause:** a pause button on screen opens a small menu with "Continuar", sound and "Menu".
- **Mute:** a mute button on screen turns sound off with one press and is remembered next time.

**HUD:** "Pontos", the lives as small soldier icons, the current weapon's letter in a HUD box, and the pause and mute buttons.

### Controls

| Ação | Desktop | Mobile | Gamepad |
| --- | --- | --- | --- |
| Correr / mirar (oito direções) / agachar | Arrows or WASD (down ducks) | Virtual stick (left) | D-pad |
| Saltar | Space | Button A (right) | A |
| Disparar | Z | Button B (right), automatic fire while held | X |
| Pausar / Som | on-screen buttons | on-screen buttons | — |

The on-screen controls appear only on touch screens. A plugged-in gamepad works on desktop. In Setor 2, aiming up fires down the corridor.

### How a new player learns

The first go teaches by doing. The opening stretch of Setor 1 is laid out so each action is needed once, in order:

1. run right;
2. jump a small pit;
3. shoot the first lone infantryman;
4. duck under a turret's high shot;
5. shoot a Cápsula Voadora and grab its capsule.

A short Portuguese hint with the control's icon appears at each spot ("Pule!", "Atire!", "Agache!") and fades once the player has done it.

## Difficulty & Feel

### Targets

The pages state none; these are the ones their words imply.

- **The opening of Setor 1.** It is calm and readable: single enemies and predictable shots, so any player gets through without dying.
- **The first lost life.** A careless player who stands still or fires only straight ahead starts losing lives in the crossfire before the Muralha de Defesa, where ground fire from the right meets diagonal fire from the air.
- **A good run.** It reaches the Coração Alienígena with lives in hand but has close calls in every boss fight. Most deaths come from mistimed jumps and forgetting to duck.
- **Failure.** It always feels fair and quick: every shot is clearly visible, respawn is instant, and "Tentar de novo" puts the player straight back into the stage.

### What gets harder

- Enemies come in denser groups as each stage goes on and from stage to stage. The pincer of ground troops ahead and air ships from behind tightens.
- Terrain asks for more: wider pits and narrower ledges in Setor 1, and in Setor 3 a climb where a miss costs a life.
- Each boss has more parts and more shots on screen than the last.
- The Espalhado matters more as the game goes on. Losing it on death is felt.

### Feel

Arcade-instant controls, with a forgiving jump edge and a buffered jump. Optional polish, only once everything above works:

- a light screen shake when turrets and boss cores explode;
- smooth somersaults on every jump;
- enemy shots that flash brightly;
- enemies and fortresses that flash white for an instant when hit;
- capsules that bob as they land;
- the Espalhado filling the screen with bold red orbs.

## The look

Classic 8-bit pixel art in which military technology meets aggressive alien biology. The scenery is:

- purple biomechanical aliens and crimson insectoids;
- acid-green spores;
- an alien jungle under an amber sky;
- cold steel bases.

The palette is deep night blues and violets with icy cyan and hot orange accents (title: #0a0a1f #2b1a5c #7a3fd1 #c8f7ff #ff9d2e), with strong contrast so projectiles always read. The menus and HUD use the green phosphor terminal skin. Key words: retro arcade, commando, alien infestation, bright bullets, crisp pixels.

## Assets

Everything the crew made for this game, by the key the game's `assets.json` loads it under: use each one by its key. Draw or synthesize something only where an entry says it was not made, or where the design above names a stand-in. Sizes are in pixels, lengths in seconds.

### Logo

The approved logo: the game's name, "Protocolo Órion", with a transparent background. The title screen (below) shows its own copy of it; use this one anywhere else the game shows its name.

- **logo** · 1536×1024

### Sprites

One picture per sprite, cut from painted sheets and named and tagged by the crew, transparent around the edges. Each is a single still frame (no animation strips). A sprite stands on its bottom center unless noted. `assets.json` loads each at 256 pixels (its `spriteSize`; 128 is there too), and scenery at 512 (its own `size`): scale sprites to the game's units.

A sprite's **world size** is how big the thing is in the game's world, in metres along its longer side (a person is about 1.8). Draw the sprites in proportion to it. It is a guide, not a rule: a game may shrink its trees and buildings to fit the screen, but keeps them in proportion to each other. A sprite with none is sized by play (pickups, icons, effects).

**Scenery** (noted below) was painted for the game's world. Build the levels from these sprites rather than drawing their shapes in code. A ledge or platform sprite is the art: give it a body along its top surface.

#### Sheet 1

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
| bunker-defensivo-pillbox | bunker defensivo pillbox | 897×607 | about 5 m | scenery; for: building, obstacle |
| torreta-dupla-automatica | torreta dupla automatica | 417×326 | about 2.3 m | scenery; for: weapon, enemy |
| barricada-de-sacos-de-areia | barricada de sacos de areia | 418×150 | about 2.3 m | scenery; for: obstacle, prop |
| caca-aeroespacial-orion | caca aeroespacial orion | 1387×381 | about 14 m | scenery; for: vehicle, player |
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

The design names which sprite plays each entity. Where it names a stand-in (the M and R capsules, the F fireball, the boss cores, the corridor depth, the waterfall), draw a simple one in the same style.

### Game UI

The interface skin for the engine's `ui` pack, "Terminal": a green phosphor terminal of black glass, one thin green rule, cut corners, scanlines, and tall low-resolution type that glows. One theme file (`phaser-ae-ui-theme`) styles every widget and the dialogue box.

Setup: compose `typography` and `ui` (and `nine-slice` and `dialogue` for conversations), then before the first screen run `game.ui.theme = await game.ui.loadTheme(game.assets.get('ui-theme'));`. It loads its own fonts (VT323), which any other text in the game can use by family name.

Widgets and roles:

- Build screens from the pack's widgets (`window`, `panel`, `button`, `label`, `slider`, `progress`, `checkbox`, `list`, `input` …) and let the theme dress them.
- A widget takes a role by `style`:
  - `'good'` for a confirm button;
  - `'warn'` for caution;
  - `'bad'` for danger or quit;
  - `'flat'` for a quiet one;
  - `'icon'` for a square icon button;
  - `'heading'` for a large label;
  - `'panel'` for a HUD box.
- Pass no other style fields.
- A button with no width sizes itself to its icon and caption.
- A dialogue opened without a preset wears the skin's box.

Icons: symbols on buttons are the pack's own icons (`icon: 'pause'`, `'sound-on'`, `'restart'`, `'home'`, `'star'`, `'coin'`, `'lock'` …), never letters. The theme colors them with the button text, stroked and extruded as its captions are. The game's pause and sound buttons are `game.ui.pauseButton()` and `game.ui.muteButton()`, which wear the `'icon'` role.

For anything drawn outside the pack, take colors from the palette:

| Name | Color | Use |
|---|---|---|
| ink | `#33ff66` | text on windows and panels |
| paper | `#020a04` | window bodies |
| panel | `#041008` | HUD boxes, cards, slots |
| face | `#062a10` | button faces, title bars |
| text | `#66ff99` | text on buttons |
| accent | `#33ff66` | focus, knobs, ticks, bar fills, the chosen row |
| rim | `#1f8b3f` | borders and frames |
| good | `#33ff66` | confirm, health |
| warn | `#ffd166` | caution |
| bad | `#ff5a5a` | danger, quit |
| shade | `#000000` | shadows and inner depth |
| glow | `#33ff66` | light thrown by lit things |

- **ui-theme**: the theme file

### Title screen

The game's animated title screen, "Última Órbita", designed on the Title Screen page and played by the engine's `title-screen` pack, so the game shows exactly what was designed: the key art, shaders, layers arriving and staying alive, the small surprises, the prompt, and the transition into play. Play it as it is: do not draw another title screen or add to this one.

As designed, at 1280×720, palette #0a0a1f #2b1a5c #7a3fd1 #c8f7ff #ff9d2e, settling after 2s. Shaders: pixel-starfield-1. Post: scanlines, vignette. Exit: pixels, 0.5s.

| Layer | Kind | Arrives | While up | On Start |
|---|---|---|---|---|
| planeta | scenery | there from the start | — | fade |
| colonia | fx | fade at 0.2s | flicker | fade |
| poeira | fx: stars | there from the start | — | fade |
| logo | logo: title-logo | zoom at 0.4s | bob, glow | zoom |
| nave | hero: title-sprite-caca-aeroespacial-orion | rise at 1.3s | bob | fly |
| alien | prop: title-sprite-soldado-orion-salto-acrobatico, hidden until an event | fade at 0s | — | fade |
| scrim | fx | fade at 1.6s | — | fade |
| prompt | prompt: "Pressione Enter" | fade at 1.7s | blink | fade |

Surprises every 4–7s: cross alien, shooting-star, burst.

Compose `title-screen`, `backdrops`, `typography`, `particles-2d`, `effects-2d`, `fx-halo`, `post`, `post-scanlines`, `post-vignette`, `transition` beside the game's 2D world (`world-side` or the world it already has). The title scene is one call:

```js
game.titleScreen.play(game.assets.get('title-screen'), { next: 'play', wait: () => game.assets.load(assets, { pack: 'game' }) });
```

Any press (Space, Enter, a click or a tap) starts the game: the screen waits for the `game` pack, then leaves through its own transition (pixels). Its pictures and sounds are in the `title` pack under the keys it names (`title-logo`, `title-sprite-soldado-orion-salto-acrobatico`, `title-sprite-caca-aeroespacial-orion`). Wait for `game.titleScreen.settled` before a screenshot of the title.

- **title-screen**: the title screen file
- **title-logo** · 1024×512
- **title-sprite-soldado-orion-salto-acrobatico** · 316×365
- **title-sprite-caca-aeroespacial-orion** · 1024×280

### Pictures

Full-frame paintings for screens and backdrops, each loaded as a WebP fitted to the game's screen (its size is the one given here): the one the designer put in the game for each picture.

| Key | Use | Where it goes | What it shows | Size |
|---|---|---|---|---|
| title | Title screen | Key art for the title screen | A lone commando overlooking a burning alien horizon as starfighters clash above. | 1280×714 |
| cutscene | Story still | A story still | Ejection to Surface: The burning fighter disintegrates as the escape pod plunges into alien atmosphere. | 1280×714 |
| background-orbital-defense | Background | A playable backdrop | Orbital Defense: Low orbit above gleaming colony domes under deep space starfields and nebulae. | 1280×714 |
| game-over | Game over | The defeat screen | Signal Lost: A cracked visor helmet resting on smoking wreckage amid encroaching alien vines. | 1280×714 |
| store | Store art | Store capsule art | Store Capsule: A commando blasts relentless alien hordes beneath a roaring orbital dogfight. | 1280×714 |
| background-alien-jungle-surface | Background | A playable backdrop | Alien Jungle Surface: Twisted alien jungle canopy and jagged crystalline spires beneath an amber sky. | 1280×714 |
| victory | Victory | The win screen | Evacuation Shuttle: An evacuation dropship lifts off toward the dawn as alien ruins burn below. | 1280×714 |
| background-defense-base-corridor | Background | A playable backdrop | Defense Base Corridor: Interior corridor of an alien fortress bristling with cybernetic tubes and blastdoors. | 1280×714 |

### Textures

Seamless textures that repeat, each a WebP loaded by `assets.json` under its key. A **2D background** is one sprite the size of the screen whose texture repeats (`uvRepeat`) and slides as the game scrolls (`scrollX` / `scrollY`, in tiles a second); an axis it does not tile is not repeated.

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

Play each one at the moment the design gives it. Where the design gives none, play it at the moment its name says. The description is what it sounds like.

| Key | When it plays | What it sounds like | Length | Loop |
|---|---|---|---|---|
| ship-laser | ship laser (weapon); in this design, the Laser weapon | crisp dual 8-bit chiptune laser cannon pew, bright high-to-low pitch sweep, tight dry retro arcade video game sound effect, no reverb | 0.5s | no |
| enemy-plasma | enemy plasma (weapon); in this design, enemy shots | menacing 8-bit alien plasma orb discharge, gritty modulated synth buzz with quick downward pitch drop, retro arcade video game sound effect | 0.5s | no |
| shield-damage | shield damage (impact); in this design, the Barreira running out | metallic electronic crackle and 8-bit power-down buzz, harsh square-wave glitch into descending tone, dry retro arcade video game sound effect | 1.0s | no |
| ship-explosion | ship explosion (impact); in this design, turrets, casamatas and boss parts exploding | crunchy 8-bit retro arcade explosion, punchy low-end thump with gritty white-noise burst and short decay, video game sound effect | 1.5s | no |
| atmospheric-ejection | atmospheric ejection (vehicle); in this design, over the opening story still | mechanical metal clamp release into fiery 8-bit noise whoosh, rising intensity, retro arcade video game sound effect | 2.0s | no |
| pilot-footstep | pilot footstep (player) | short gritty 8-bit boot step on alien rock, tight low-mid noise thud, dry retro arcade video game sound effect | 0.5s | no |
| pilot-jump | pilot jump (player) | snappy 8-bit chiptune jump, quick upward square-wave pitch sweep, bright and tight retro arcade video game sound effect | 0.5s | no |
| rifle-shot | rifle shot (weapon) | punchy 8-bit military pulse rifle shot, sharp transient crack with short white-noise tail, dry retro arcade video game sound effect | 0.5s | no |
| alien-hit | alien hit (enemy) | wet 8-bit alien creature hit, squelchy synth crunch with quick downward chirp, retro arcade video game sound effect | 0.5s | no |
| alien-death | alien death (enemy) | screeching 8-bit alien creature death, descending harsh chiptune roar into a crunchy burst, retro arcade video game sound effect | 1.0s | no |
| bunker-door | bunker door (machine) | heavy armored bunker blast door sliding shut, low metallic 8-bit rumble ending in a solid lock clank, retro arcade video game sound effect | 1.5s | no |
| mission-clear | mission clear (stinger) | triumphant 8-bit chiptune fanfare, four rising major-key square-wave notes with snare roll, 140 BPM, ending on a bright chord hit | 3.0s | no |

### Music

Not made. The game has sound effects only.

### Loading

The game's `assets.json` loads every file above by its key, in two packs:

- `title` holds what the title screen shows, and loads under the loading screen: the title screen file and its pictures and sounds, the buttons and the menu click.
- `game` holds everything else, and loads quietly while the title is up.

Move a file to `title` if the title screen shows it, and split `game` into packs of its own (`level-1`, `level-2` …) if it is too big to load in one go.

---

## Debug controls

These controls let the team and the designer reach any part of Protocolo Órion at once, without playing through the earlier stages.

| Control | Takes | Does |
| --- | --- | --- |
| level | n: 1 to 3 (1 Selva, 2 Base, 3 Cachoeira) | Jumps to the start of that Setor. The earlier Setores count as cleared, and the player has the lives and score he would have there, with the standard rifle. |
| boss | n: 1 to 3 (1 Muralha de Defesa, 2 Computador Central, 3 Coração Alienígena) | Jumps to the fight with that stage's boss, with the earlier progress in place, and the lives and score a player would have there. |
| bunker | nothing | Jumps to the Base de Evacuação closing beat right after the final boss, with all three Setores cleared. |
| screen | name: victory, game-over | Jumps to that end screen, showing the score a player would have at that point. |
| give | item: M, E, L, F, R or B | Gives the player that weapon capsule as if he had touched it. M, E, L and F replace the current weapon, R speeds up fire, B adds the Barreira. |
| lives | n: 1 to 30 | Sets the number of lives, up to the thirty of the secret code. |
| score | n: 0 to 99999 | Sets the Pontos. |
| infinite-lives | on or off | Switch. Dying still plays out as usual, but no life is lost, so Game Over never comes. |
| invincible | on or off | Switch. Enemies, enemy shots and pits do not hurt the soldier. |
| win-stage | nothing | Wins the current Setor through the game's own path, with its end screen, score, sounds and the following flow (the bunker beat and victory after Setor 3). |
| lose-life | nothing | Kills the soldier as an enemy hit would, with the knock-back, the loss of a life and the return to the standard rifle. Game Over comes if it was the last life. |
| end-run | nothing | Ends the run through the game's own Game Over path, with its screen and sounds, offering "Tentar de novo" and "Menu". |

In the engine each is added once at boot with `game.cheats.add({ name, does, args, run })` (the kernel manual says how); `bake play` lists them with `cheat` and runs one with `cheat <name> [args]`; a person opens them in a panel with the backquote key (`), or with `?cheats` in the address.

---

## Recommended packs

| Pack | For | Notes |
| --- | --- | --- |
| `platform-map` | The side-view level for Setor 1 and the Setor 3 climb. It holds the ground, the thin ledges you can drop through, the pits, and the rock ledges. | It holds the solid, one-way and hazard cells. Check how it handles a pit that costs a life. The Setor 2 corridor is a fixed behind view and does not use it. |
| `platform-walker` | The Soldado Órion's run, somersault jump and duck-drop through thin platforms. It also moves the infantry, which run and drop off ledges, and the Parasitas. | It needs `platform-map`. Check that it supports a jump just after leaving an edge and a buffered jump pressed before landing. The somersault, the eight-direction aim, shooting, one-hit death and invulnerability are the game's own code. |
| `controls-2d` | The named intents (move, aim, jump, shoot) and the aim axes. Keyboard (arrows or WASD, Space, Z) and gamepad (D-pad, A, X) drive the same intents. | Use it for the typed thirty-lives code on the title screen, which it reads as key and gamepad input. Nothing is drawn on the title screen. |
| `controls-touch` | The virtual stick on the left and buttons A and B on the right. Button B fires automatically while held. | It shows only on touch screens. It needs `world:screen` and `typography`, and it presses key codes, so it feeds `controls-2d`. |
| `scrolling-shooter` | The weapons and their pickups, the stage scripts keyed to distance, the boss parts and the checkpoints. Use it as a parts source for the weapon capsules, the flying air ships and the bosses. | It is built for vertical or horizontal shooters like 1942, not for run and gun. It is the closest fit, but check it before relying on it. The ground-based Contra rules are the game's own code: one-hit lives, the pod, the weapon letters and Barreira, and the forward-only scroll. |

From a search of the pack library for this design, made before the build: recommendations for the lead, who checks each (`packs.mjs get <id>`), chooses, and adds what fits. A pack that doesn't fit the game is left out. `core-2d` and the packs it brings (maths, color, typography, audio, ui, tween, save, backdrops, backdrop-sky, backdrop-stars, feel, render-auto, world-screen, world-side, rig-follow, render-texture, particle-textures, particles-2d, collision, pointer) are in the game already.