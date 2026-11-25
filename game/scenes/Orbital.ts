import { game } from '../engine.js';
import { spawnActor, boxesOverlap, burstAt, hitFlash, type Actor } from '../actors.js';
import { award, run, updateRecord } from '../state.js';
import { makeRotatePrompt, persistMuteSetting } from '../rotate.js';
import { playCrewSfx } from '../sfx.js';

const ORBITAL = {
    shipSpeed: 470,
    shipYOffset: 74,
    domeYOffset: 172,
    domeHp: 6,
    baseFireInterval: 0.24,
    laserFireInterval: 0.14,
    spreadFireInterval: 0.28,
    bulletSpeed: 760,
    enemyShotSpeed: 310,
    orbShotSpeed: 280,
    marchBaseSpeed: 68,
    marchMaxSpeed: 245,
    marchDropY: 26,
    marginX: 72,
    flagshipHp: 18,
    maxShields: 3,
    invulnAfterHit: 2.0,
    ejectionDuration: 2.1,
};

const BURNING_DEBRIS = [
    'burning-cockpit-fragment', 'burning-wingtip-fragment', 'burning-thruster-nozzle', 'burning-stabilizer-fin',
    'burning-cockpit-frame', 'burning-armor-plate', 'burning-engine-cowling', 'burning-metal-strut',
    'burning-hull-plating', 'burning-metal-frame', 'burning-intake-vent', 'burning-fuel-casing',
    'burning-fuselage-fragment', 'burning-cannon-barrel', 'burning-bulkhead-plate', 'burning-wreckage-shard',
] as const;

type OrbitalBoost = 'normal' | 'spread' | 'laser';

export const Orbital = {
    name: 'orbital',
    enter(): void {
        const W = game.screen.width, H = game.screen.height;
        game.rig.follow(null);
        game.rig.bounds(null);
        game.camera.x = W / 2; game.camera.y = H / 2; game.camera.zoom = 1; game.camera.bounds = null;
        game.background.color('#06081a');

        // Backdrop: gleaming colony domes in low orbit + scrolling seamless starfield
        spawnActor({ id: 'orbital-fundo', texture: 'background-orbital-defense', x: W / 2, y: H / 2, width: W, height: H, layer: 'back', kind: 'background' });
        const starfield = game.spawn({
            id: 'orbital-estrelas',
            frame: game.assets.frames('starfield'),
            x: W / 2,
            y: H / 2,
            width: W,
            height: H,
            uvRepeat: { x: W / 768, y: H / 1024 },
            layer: 'back',
            alpha: 0.42,
        });

        let orbitalShields = ORBITAL.maxShields;
        let wave = 1;
        let boost: OrbitalBoost = 'normal';
        let boostTimer = 0;
        let fireCooldown = 0;
        let shipInvuln = 0;
        let marchDir = 1;
        let enemyShotCooldown = 1.25;
        let flagshipShotCooldown = 1.7;
        let mysteryCooldown = 7.5;
        let waveBannerTimer = 1.8;
        let ejecting = false;
        let ejectTimer = 0;
        let transitionStarted = false;
        let effectIndex = 0;
        let shotIndex = 0;
        let pickupIndex = 0;
        let totalWaveAliens = 1;
        let flagship: Actor | null = null;
        let pod: Actor | null = null;
        let bossBar: ReturnType<typeof game.bars.create> | null = null;

        run.orbitalShields = orbitalShields;
        run.orbitalWave = wave;
        run.orbitalCleared = false;

        // Player starfighter (top-down sprite pointing straight up with twin wing cannons)
        const ship = spawnActor({
            id: 'caca-orion',
            texture: 'caca-estelar-orion',
            x: W / 2,
            y: H - ORBITAL.shipYOffset,
            width: 74,
            height: 80,
            layer: 'world',
            tags: ['orbitalPlayer'],
            kind: 'orbitalShip',
            hp: 1,
        });

        // 4 Space Invaders-style energy shield domes
        const domeXs = [210, 496, 784, 1070];
        const domes: Actor[] = domeXs.map((x, idx) =>
            spawnActor({
                id: `cupula-escudo-${idx}`,
                texture: 'energy-shield-dome',
                x,
                y: H - ORBITAL.domeYOffset,
                width: 130,
                height: 68,
                layer: 'world',
                tags: ['orbitalDome'],
                kind: 'orbitalDome',
                hp: ORBITAL.domeHp,
            }),
        );

        // HUD (Terminal skin)
        game.ui.panel({ anchor: 'top-left', x: 14, y: 12, w: 468, h: 76, style: 'panel' });
        const shieldIcons = [0, 1, 2].map(idx =>
            game.spawn({ id: `escudo-orbital-icone-${idx}`, texture: 'energy-shield-dome', x: 34 + idx * 32, y: 28, width: 26, height: 15, layer: 'hud' }),
        );
        const shieldLabel = game.text('', 122, 18, { size: 17, font: 'VT323', color: '#66ff99', align: 'left', baseline: 'top' });
        const scoreLabel = game.text('', 24, 51, { size: 20, font: 'VT323', color: '#ffd166', align: 'left', baseline: 'top' });
        const weaponIcon = game.spawn({ id: 'orbital-hud-arma', texture: 'pickup-raio-laser', x: 306, y: 48, width: 24, height: 34, layer: 'hud' });
        const weaponLabel = game.text('', 328, 32, { size: 17, font: 'VT323', color: '#66ff99', align: 'left', baseline: 'top' });
        const headerLabel = game.text('PARTE 1  •  DEFESA ORBITAL', W / 2, 20, { size: 18, font: 'VT323', color: '#66ff99', baseline: 'top' });
        const subHeaderLabel = game.text('', W / 2, 48, { size: 17, font: 'VT323', color: '#ffd166', stroke: { color: '#020a04', width: 1 } });
        const statusLabel = game.text('ONDA 1  •  DESTRUA A VANGUARDA ALIENÍGENA', W / 2, H - 24, { size: 19, font: 'VT323', color: '#c8f7ff', stroke: { color: '#020a04', width: 2 } });
        game.ui.pauseButton();
        game.ui.muteButton();
        const rotate = makeRotatePrompt(true);

        function showExplosion(x: number, y: number, big = false): void {
            if (big) {
                spawnActor({ id: `orb-exp-clarao-${++effectIndex}`, texture: 'explosao-do-chefe-clarao-de-fogo', x, y, width: 124, height: 136, layer: 'front', tags: ['orbitalFx'], kind: 'orbitalFx', timer: 0.34, phase: 0.34 });
                game.after(0.14, () => {
                    spawnActor({ id: `orb-exp-onda-${++effectIndex}`, texture: 'explosao-do-chefe-onda-de-choque-de-plasma', x, y, width: 142, height: 156, layer: 'front', tags: ['orbitalFx'], kind: 'orbitalFx', timer: 0.42, phase: 0.42 });
                });
                game.after(0.3, () => {
                    spawnActor({ id: `orb-exp-fumaca-${++effectIndex}`, texture: 'explosao-do-chefe-fumaca-e-estilhacos', x, y, width: 152, height: 184, layer: 'front', tags: ['orbitalFx'], kind: 'orbitalFx', timer: 0.5, phase: 0.5 });
                });
                return;
            }
            spawnActor({ id: `orb-exp-${++effectIndex}`, texture: 'explosao-pixel-8bit', x, y, width: 58, height: 56, layer: 'front', tags: ['orbitalFx'], kind: 'orbitalFx', timer: 0.28, phase: 0.28 });
        }

        function spawnOrbitalPickup(x: number, y: number): void {
            const roll = game.rng.int(0, 2);
            const weapon = roll === 0 ? 'E' : roll === 1 ? 'L' : 'B';
            const texture = weapon === 'E' ? 'pickup-tiro-espalhado' : weapon === 'L' ? 'pickup-raio-laser' : 'pickup-escudo-de-energia';
            const tall = weapon !== 'B';
            spawnActor({
                id: `orb-pickup-${++pickupIndex}`,
                texture,
                x,
                y,
                width: tall ? 30 : 36,
                height: tall ? 44 : 36,
                layer: 'front',
                tags: ['orbitalPickup'],
                kind: 'orbitalPickup',
                weapon,
                vy: 155,
            });
        }

        function spawnDebrisBurst(x: number, y: number, count: number): void {
            for (let i = 0; i < count; i++) {
                const texture = BURNING_DEBRIS[game.rng.int(0, BURNING_DEBRIS.length - 1)] ?? BURNING_DEBRIS[0];
                const angle = game.rng.int(-314, 314) / 100;
                const speed = game.rng.int(95, 240);
                spawnActor({
                    id: `orb-debris-${++effectIndex}`,
                    texture,
                    x,
                    y,
                    width: 38,
                    height: 36,
                    layer: 'front',
                    tags: ['orbitalDebris'],
                    kind: 'orbitalDebris',
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 60,
                    timer: 1.15,
                    phase: 1.15,
                });
            }
        }

        function spawnWave(waveNum: number): void {
            wave = waveNum;
            run.orbitalWave = wave;
            marchDir = 1;
            waveBannerTimer = 2.0;

            if (waveNum === 1) {
                const rows: Array<{ texture: string; w: number; h: number; hp: number; score: number; rot: number }> = [
                    { texture: 'brain-alien-ufo', w: 64, h: 42, hp: 2, score: 260, rot: 0 },
                    { texture: 'alien-pilot-saucer', w: 66, h: 42, hp: 2, score: 220, rot: 0 },
                    { texture: 'heavy-scout-saucer', w: 68, h: 30, hp: 1, score: 160, rot: 0 },
                    { texture: 'winged-interceptor-saucer', w: 72, h: 26, hp: 1, score: 120, rot: 0 },
                ];
                const cols = 8;
                const spacingX = 104;
                const startX = W / 2 - ((cols - 1) * spacingX) / 2;
                const startY = 128;
                totalWaveAliens = rows.length * cols;
                rows.forEach((spec, r) => {
                    for (let c = 0; c < cols; c++) {
                        const a = spawnActor({
                            id: `orb-alien-w1-${r}-${c}`,
                            texture: spec.texture,
                            x: startX + c * spacingX,
                            y: startY + r * 66,
                            width: spec.w,
                            height: spec.h,
                            layer: 'world',
                            tags: ['orbitalAlien'],
                            kind: 'orbitalAlien',
                            hp: spec.hp,
                            scoreValue: spec.score,
                        });
                        a.rot = spec.rot;
                    }
                });
                subHeaderLabel.text = 'ONDA 1 / 2  •  VANGUARDA ORBITAL';
                statusLabel.text = 'DEFENDA A ÓRBITA  •  Z / ESPAÇO DISPARAM';
            } else {
                // Wave 2: Assault wing + Cruzador-Mãe flagship
                const rows: Array<{ texture: string; w: number; h: number; hp: number; score: number; rot: number }> = [
                    { texture: 'finned-attack-saucer', w: 66, h: 38, hp: 2, score: 300, rot: 0 },
                    { texture: 'blue-war-saucer', w: 68, h: 28, hp: 2, score: 240, rot: 0 },
                ];
                const cols = 6;
                const spacingX = 124;
                const startX = W / 2 - ((cols - 1) * spacingX) / 2;
                const startY = 242;
                totalWaveAliens = rows.length * cols;
                rows.forEach((spec, r) => {
                    for (let c = 0; c < cols; c++) {
                        const a = spawnActor({
                            id: `orb-alien-w2-${r}-${c}`,
                            texture: spec.texture,
                            x: startX + c * spacingX,
                            y: startY + r * 68,
                            width: spec.w,
                            height: spec.h,
                            layer: 'world',
                            tags: ['orbitalAlien'],
                            kind: 'orbitalAlien',
                            hp: spec.hp,
                            scoreValue: spec.score,
                        });
                        a.rot = spec.rot;
                    }
                });

                flagship = spawnActor({
                    id: 'cruzador-mae-orbital',
                    texture: 'cruzador-mae-alienigena',
                    x: W / 2,
                    y: 146,
                    width: 112,
                    height: 196,
                    layer: 'world',
                    tags: ['orbitalFlagship'],
                    kind: 'orbitalFlagship',
                    hp: ORBITAL.flagshipHp,
                    scoreValue: 2_500,
                    vx: 150,
                });
                flagship.rot = Math.PI; // Nose facing downward toward the colony

                if (!bossBar) {
                    bossBar = game.bars.create({
                        anchor: 'top',
                        y: 72,
                        width: Math.min(440, W * 0.38),
                        height: 16,
                        max: ORBITAL.flagshipHp,
                        value: ORBITAL.flagshipHp,
                        style: 'retro',
                        fill: '#e44853',
                        track: '#172833',
                    });
                } else {
                    bossBar.visible = true;
                    bossBar.value = ORBITAL.flagshipHp;
                }
                game.sound.play('chefe');
                game.feel.shake(6, 0.3);
                subHeaderLabel.text = 'ONDA 2 / 2  •  CRUZADOR-MÃE ALIENÍGENA';
                statusLabel.text = 'DESTRUA O CRUZADOR-MÃE E SUA ESCOLTA!';
            }
        }

        function fireShipWeapon(): void {
            const noseY = ship.y - 46;
            if (boost === 'spread') {
                const angles = [-Math.PI / 2 - 0.2, -Math.PI / 2, -Math.PI / 2 + 0.2];
                for (const angle of angles) {
                    const bolt = spawnActor({
                        id: `orb-tiro-${++shotIndex}`,
                        texture: 'projetil-tiro-espalhado',
                        x: ship.x + Math.cos(angle) * 14,
                        y: noseY,
                        width: 18,
                        height: 18,
                        layer: 'front',
                        tags: ['orbitalPlayerShot'],
                        kind: 'orbitalPlayerShot',
                        vx: Math.cos(angle) * ORBITAL.bulletSpeed,
                        vy: Math.sin(angle) * ORBITAL.bulletSpeed,
                        hp: 1,
                    });
                    bolt.rot = angle;
                }
                playCrewSfx('rifle-shot', 'disparo', { volume: 0.65, rate: 0.94, minGapMs: 60 });
            } else if (boost === 'laser') {
                const bolt = spawnActor({
                    id: `orb-tiro-${++shotIndex}`,
                    texture: 'projetil-raio-laser',
                    x: ship.x,
                    y: noseY,
                    width: 44,
                    height: 16,
                    layer: 'front',
                    tags: ['orbitalPlayerShot'],
                    kind: 'orbitalPlayerShot',
                    vx: 0,
                    vy: -ORBITAL.bulletSpeed * 1.25,
                    hp: 2, // pierces 1 target
                });
                bolt.rot = -Math.PI / 2;
                playCrewSfx('ship-laser', 'disparo', { volume: 0.72, rate: 1.12, minGapMs: 55 });
            } else {
                for (const wingOffset of [-22, 22]) {
                    const bolt = spawnActor({
                        id: `orb-tiro-${++shotIndex}`,
                        texture: 'projetil-raio-laser',
                        x: ship.x + wingOffset,
                        y: noseY + 12,
                        width: 28,
                        height: 10,
                        layer: 'front',
                        tags: ['orbitalPlayerShot'],
                        kind: 'orbitalPlayerShot',
                        vx: 0,
                        vy: -ORBITAL.bulletSpeed,
                        hp: 1,
                    });
                    bolt.rot = -Math.PI / 2;
                }
                playCrewSfx('ship-laser', 'disparo', { volume: 0.68, minGapMs: 60 });
            }
        }

        function fireAlienShot(source: Actor, orb = false, vx = 0): void {
            const shot = spawnActor({
                id: `orb-inimigo-tiro-${++shotIndex}`,
                texture: orb ? 'esfera-de-plasma-do-chefe' : 'disparo-pesado-de-energia-alienigena',
                x: source.x,
                y: source.y + source.height * 0.35,
                width: orb ? 26 : 30,
                height: orb ? 28 : 18,
                layer: 'front',
                tags: ['orbitalEnemyShot'],
                kind: orb ? 'orbitalEnemyOrb' : 'orbitalEnemyShot',
                vx,
                vy: orb ? ORBITAL.orbShotSpeed : ORBITAL.enemyShotSpeed,
            });
            shot.rot = Math.atan2(shot.data.vy, shot.data.vx);
            playCrewSfx('enemy-plasma', 'disparo', { volume: 0.42, minGapMs: 110 });
        }

        function beginEjection(wonOrbital: boolean, reason: string): void {
            if (ejecting) return;
            ejecting = true;
            ejectTimer = 0;
            run.orbitalCleared = wonOrbital;
            if (bossBar) bossBar.visible = false;

            // Clear stray shots
            for (const s of game.roster.tagged('orbitalEnemyShot') as Iterable<Actor>) s.destroy();
            for (const s of game.roster.tagged('orbitalPlayerShot') as Iterable<Actor>) s.destroy();

            if (wonOrbital) {
                const shieldBonus = orbitalShields * 500;
                award(shieldBonus);
                playCrewSfx('mission-clear', 'vitoria', { volume: 0.78 });
            } else {
                playCrewSfx('ship-explosion', 'explosao', { volume: 0.85 });
            }
            updateRecord();

            showExplosion(ship.x, ship.y, true);
            spawnDebrisBurst(ship.x, ship.y, 7);
            burstAt(ship.x, ship.y, 28, ['#fff6bf', '#ff9d2e', '#ff5a5a']);
            game.feel.flash(wonOrbital ? '#c8f7ff' : '#ff9d2e', 0.22);
            game.feel.shake(10, 0.4);
            ship.visible = false;

            pod = spawnActor({
                id: 'capsula-ejecao-orbital',
                texture: 'capsula-de-ejecao-atmosferica',
                x: ship.x,
                y: ship.y,
                width: 96,
                height: 64,
                layer: 'front',
                kind: 'ejectionPod',
                vx: 85,
                vy: -90,
            });
            pod.rot = 0.65;
            playCrewSfx('atmospheric-ejection', 'explosao', { volume: 0.75 });
            statusLabel.text = reason;
        }

        function damageOrbitalShip(reason: string): void {
            if (ejecting || shipInvuln > 0 || run.invulnerable) return;
            if (!run.infiniteLives) orbitalShields = Math.max(0, orbitalShields - 1);
            run.orbitalShields = orbitalShields;
            boost = 'normal';
            boostTimer = 0;
            playCrewSfx('shield-damage', 'impacto', { volume: 0.8 });
            burstAt(ship.x, ship.y, 18, ['#66ff99', '#ff9d2e', '#ff5a5a']);
            game.feel.shake(7, 0.26);
            if (orbitalShields <= 0) {
                beginEjection(false, 'CAÇA ÓRION ABATIDO  •  EJEÇÃO ATMOSFÉRICA!');
                return;
            }
            shipInvuln = ORBITAL.invulnAfterHit;
            statusLabel.text = `ESCUDO ORBITAL DANIFICADO (${orbitalShields} RESTANTES)`;
        }

        function syncHud(): void {
            shieldIcons.forEach((icon, idx) => { icon.visible = idx < orbitalShields; });
            shieldLabel.text = `ESCUDOS × ${orbitalShields}`;
            scoreLabel.text = `PONTOS  ${run.score.toLocaleString('pt-BR')}`;
            if (boost === 'spread') {
                weaponIcon.texture = 'pickup-tiro-espalhado';
                weaponLabel.text = `Espalhado  ${boostTimer.toFixed(1)}s`;
            } else if (boost === 'laser') {
                weaponIcon.texture = 'pickup-raio-laser';
                weaponLabel.text = `Laser Turbo  ${boostTimer.toFixed(1)}s`;
            } else {
                weaponIcon.texture = 'pickup-raio-laser';
                weaponLabel.text = 'Canhão Órion';
            }
        }

        spawnWave(1);
        syncHud();

        game.step('orbital', dt => {
            persistMuteSetting();
            run.campaignTime += dt;
            starfield.scrollY -= 0.065 * dt;
            starfield.scrollX += 0.012 * dt;

            if (rotate()) { syncHud(); return; }
            if (game.controls.justPressed('pause')) { game.scenes.push('pause'); return; }

            // Debug shortcuts work inside Part 1 too
            if (run.debugWinQueued) {
                run.debugWinQueued = false;
                for (const a of game.roster.tagged('orbitalAlien') as Iterable<Actor>) a.destroy();
                if (flagship?.alive) { flagship.destroy(); flagship = null; }
                beginEjection(true, 'ÓRBITA LIBERADA  •  INICIANDO DESCIDA AO PLANETA!');
            }
            if (run.debugLoseQueued) {
                run.debugLoseQueued = false;
                damageOrbitalShip('teste de perda orbital');
            }

            // Update explosion visual effects & burning debris shards
            for (const fx of game.roster.tagged('orbitalFx') as Iterable<Actor>) {
                if (!fx.alive) continue;
                fx.data.timer -= dt;
                const progress = Math.max(0, fx.data.timer / Math.max(0.01, fx.data.phase));
                fx.alpha = progress;
                fx.width *= 1 + dt * 1.5;
                fx.height *= 1 + dt * 1.5;
                fx.rot += dt * 0.4;
                if (fx.data.timer <= 0) fx.destroy();
            }
            for (const d of game.roster.tagged('orbitalDebris') as Iterable<Actor>) {
                if (!d.alive) continue;
                d.data.timer -= dt;
                d.data.vy += 260 * dt;
                d.x += d.data.vx * dt;
                d.y += d.data.vy * dt;
                d.rot += dt * 3.8;
                d.alpha = Math.max(0, d.data.timer / Math.max(0.01, d.data.phase));
                if (d.data.timer <= 0) d.destroy();
            }

            // Ejection transition sequence -> Story cutscene -> Part 2 ground platformer
            if (ejecting) {
                ejectTimer += dt;
                if (pod?.alive) {
                    pod.data.vy += 320 * dt;
                    pod.x += pod.data.vx * dt;
                    pod.y += pod.data.vy * dt;
                    pod.rot = Math.atan2(pod.data.vy, pod.data.vx);
                    if (Math.floor(ejectTimer * 24) % 2 === 0) {
                        game.particles.burst({ x: pod.x - 16, y: pod.y - 10, count: 2, layer: 'front', frame: 'particle:spark', blend: 'add', speed: [30, 95], lifespan: [0.15, 0.35], color: ['#fff6bf', '#ff9d2e', '#ff5a5a'] });
                    }
                }
                if (ejectTimer >= ORBITAL.ejectionDuration && !transitionStarted) {
                    transitionStarted = true;
                    run.stage = 1;
                    run.lives = run.secretLives ? 30 : 3;
                    run.weapon = 'P';
                    void game.transition.go('story', { kind: 'pixels', duration: 0.5, color: '#0a0a1f', cells: 16 });
                }
                syncHud();
                return;
            }

            if (waveBannerTimer > 0) waveBannerTimer = Math.max(0, waveBannerTimer - dt);
            if (shipInvuln > 0) {
                shipInvuln = Math.max(0, shipInvuln - dt);
                ship.alpha = Math.floor(run.campaignTime * 16) % 2 ? 0.35 : 1;
            } else {
                ship.alpha = 1;
            }
            if (boostTimer > 0) {
                boostTimer = Math.max(0, boostTimer - dt);
                if (boostTimer === 0) boost = 'normal';
            }

            // Player movement & shooting
            const move = game.controls.axis('move');
            ship.x = Math.max(ORBITAL.marginX, Math.min(W - ORBITAL.marginX, ship.x + move.x * ORBITAL.shipSpeed * dt));
            fireCooldown = Math.max(0, fireCooldown - dt);
            const wantsFire = game.controls.pressed('fire') || game.controls.pressed('jump');
            if (wantsFire && fireCooldown <= 0) {
                fireShipWeapon();
                fireCooldown = boost === 'laser' ? ORBITAL.laserFireInterval : boost === 'spread' ? ORBITAL.spreadFireInterval : ORBITAL.baseFireInterval;
            }

            // Formation marching (classic Space Invaders speed-up!)
            const aliens = [...game.roster.tagged('orbitalAlien') as Iterable<Actor>].filter(a => a.alive);
            if (aliens.length > 0) {
                const ratio = 1 - aliens.length / Math.max(1, totalWaveAliens);
                const speed = ORBITAL.marchBaseSpeed + ratio * ratio * (ORBITAL.marchMaxSpeed - ORBITAL.marchBaseSpeed);
                let hitEdge = false;
                for (const alien of aliens) {
                    alien.x += marchDir * speed * dt;
                    if (alien.data.flash > 0) {
                        alien.data.flash = Math.max(0, alien.data.flash - dt);
                        if (alien.data.flash === 0) alien.tint = '#ffffff';
                    }
                    if ((marchDir > 0 && alien.x > W - ORBITAL.marginX) || (marchDir < 0 && alien.x < ORBITAL.marginX)) hitEdge = true;
                }
                if (hitEdge) {
                    marchDir *= -1;
                    for (const alien of aliens) {
                        alien.y += ORBITAL.marchDropY;
                        // Aliens descending into shield domes smash them
                        for (const dome of domes) {
                            if (dome.alive && boxesOverlap(alien.x, alien.y, alien.width, alien.height, dome.x, dome.y, dome.width, dome.height)) {
                                showExplosion(dome.x, dome.y, false);
                                playCrewSfx('shield-damage', 'impacto', { volume: 0.6 });
                                dome.destroy();
                            }
                        }
                        if (alien.y >= ship.y - 46) {
                            beginEjection(false, 'INVASÃO ROMPEU A DEFESA  •  EJEÇÃO DE EMERGÊNCIA!');
                            return;
                        }
                    }
                }

                // Random bottom-row alien fires plasma downward
                enemyShotCooldown -= dt;
                if (enemyShotCooldown <= 0) {
                    enemyShotCooldown = Math.max(0.45, 1.35 - ratio * 0.65 - (wave - 1) * 0.2);
                    const shooter = aliens[game.rng.int(0, aliens.length - 1)];
                    if (shooter) fireAlienShot(shooter, false, 0);
                }
            }

            // Mystery saucer bonus during Wave 1
            if (wave === 1) {
                mysteryCooldown -= dt;
                if (mysteryCooldown <= 0) {
                    mysteryCooldown = 11.5;
                    const fromLeft = game.rng.int(0, 1) === 0;
                    const mysteryPool = [
                        { texture: 'white-disc-saucer', w: 84, h: 40 },
                        { texture: 'sleek-stealth-saucer', w: 88, h: 31 },
                        { texture: 'notched-attack-saucer', w: 84, h: 40 },
                    ];
                    const pick = mysteryPool[effectIndex % mysteryPool.length] ?? mysteryPool[0]!;
                    spawnActor({
                        id: `orb-misterio-${++effectIndex}`,
                        texture: pick.texture,
                        x: fromLeft ? -48 : W + 48,
                        y: 102,
                        width: pick.w,
                        height: pick.h,
                        layer: 'world',
                        tags: ['orbitalMystery'],
                        kind: 'orbitalMystery',
                        hp: 2,
                        scoreValue: 600,
                        vx: fromLeft ? 210 : -210,
                    });
                }
            }
            for (const m of game.roster.tagged('orbitalMystery') as Iterable<Actor>) {
                if (!m.alive) continue;
                m.x += m.data.vx * dt;
                if (m.data.flash > 0) {
                    m.data.flash = Math.max(0, m.data.flash - dt);
                    if (m.data.flash === 0) m.tint = '#ffffff';
                }
                if (m.x < -120 || m.x > W + 120) m.destroy();
            }

            // Wave 2 Cruzador-Mãe flagship patrol & plasma fan attacks
            if (flagship?.alive) {
                flagship.x += flagship.data.vx * dt;
                if (flagship.x < 180) { flagship.x = 180; flagship.data.vx = Math.abs(flagship.data.vx); }
                if (flagship.x > W - 180) { flagship.x = W - 180; flagship.data.vx = -Math.abs(flagship.data.vx); }
                if (flagship.data.flash > 0) {
                    flagship.data.flash = Math.max(0, flagship.data.flash - dt);
                    if (flagship.data.flash === 0) flagship.tint = '#ffffff';
                }
                flagshipShotCooldown -= dt;
                if (flagshipShotCooldown <= 0) {
                    flagshipShotCooldown = 1.65;
                    fireAlienShot(flagship, true, -95);
                    fireAlienShot(flagship, true, 0);
                    fireAlienShot(flagship, true, 95);
                }
                if (bossBar) bossBar.value = flagship.data.hp;
            }

            // Player shots update & collisions
            const flashTint = Math.floor(run.campaignTime * 18) % 2 ? '#ffffff' : '#ffe88a';
            for (const shot of game.roster.tagged('orbitalPlayerShot') as Iterable<Actor>) {
                if (!shot.alive) continue;
                shot.x += shot.data.vx * dt;
                shot.y += shot.data.vy * dt;
                if (shot.y < -40 || shot.x < -40 || shot.x > W + 40) { shot.destroy(); continue; }

                let consumed = false;
                for (const alien of aliens) {
                    if (!alien.alive) continue;
                    if (!boxesOverlap(shot.x, shot.y, 20, 28, alien.x, alien.y, alien.width * 0.85, alien.height * 0.85)) continue;
                    alien.data.hp -= 1;
                    hitFlash(alien);
                    if (alien.data.hp <= 0) {
                        const ax = alien.x, ay = alien.y;
                        award(alien.data.scoreValue);
                        run.kills++;
                        showExplosion(ax, ay, false);
                        if (alien.data.maxHp > 1) spawnDebrisBurst(ax, ay, 2);
                        burstAt(ax, ay, 10, ['#fff6bf', '#ff9d2e', '#66ff99']);
                        playCrewSfx('ship-explosion', 'explosao', { volume: 0.56, minGapMs: 70 });
                        if (game.rng.int(1, 7) === 1) spawnOrbitalPickup(ax, ay);
                        alien.destroy();
                    } else {
                        playCrewSfx('alien-hit', 'impacto', { volume: 0.5, minGapMs: 65 });
                    }
                    shot.data.hp -= 1;
                    if (shot.data.hp <= 0) { shot.destroy(); consumed = true; break; }
                }
                if (consumed) continue;

                for (const m of game.roster.tagged('orbitalMystery') as Iterable<Actor>) {
                    if (!m.alive) continue;
                    if (!boxesOverlap(shot.x, shot.y, 20, 28, m.x, m.y, m.width * 0.85, m.height * 0.85)) continue;
                    m.data.hp -= 1;
                    hitFlash(m);
                    if (m.data.hp <= 0) {
                        award(m.data.scoreValue);
                        run.kills++;
                        showExplosion(m.x, m.y, false);
                        playCrewSfx('ship-explosion', 'explosao', { volume: 0.7 });
                        spawnOrbitalPickup(m.x, m.y);
                        m.destroy();
                    }
                    shot.destroy();
                    consumed = true;
                    break;
                }
                if (consumed) continue;

                if (flagship?.alive && boxesOverlap(shot.x, shot.y, 22, 28, flagship.x, flagship.y, flagship.width * 0.85, flagship.height * 0.78)) {
                    flagship.data.hp -= 1;
                    hitFlash(flagship);
                    playCrewSfx('alien-hit', 'impacto', { volume: 0.52, minGapMs: 65 });
                    shot.destroy();
                    if (flagship.data.hp <= 0) {
                        const fx = flagship.x, fy = flagship.y;
                        award(flagship.data.scoreValue);
                        run.bossParts++;
                        showExplosion(fx, fy, true);
                        spawnDebrisBurst(fx, fy, 6);
                        burstAt(fx, fy, 36, ['#fff6bf', '#ff9d2e', '#ff5a5a']);
                        playCrewSfx('ship-explosion', 'explosao', { volume: 0.85 });
                        game.feel.shake(10, 0.4);
                        flagship.destroy();
                        flagship = null;
                        if (bossBar) bossBar.visible = false;
                    }
                }
            }

            // Enemy shots update & collisions (vs domes and vs player ship)
            for (const shot of game.roster.tagged('orbitalEnemyShot') as Iterable<Actor>) {
                if (!shot.alive) continue;
                shot.x += shot.data.vx * dt;
                shot.y += shot.data.vy * dt;
                shot.tint = flashTint;
                if (shot.data.kind === 'orbitalEnemyOrb') shot.rot += dt * 5;
                if (shot.y > H + 40 || shot.x < -40 || shot.x > W + 40) { shot.destroy(); continue; }

                let blocked = false;
                for (const dome of domes) {
                    if (!dome.alive) continue;
                    if (!boxesOverlap(shot.x, shot.y, 18, 18, dome.x, dome.y, dome.width * 0.88, dome.height * 0.75)) continue;
                    dome.data.hp -= 1;
                    burstAt(shot.x, shot.y, 8, ['#c8f7ff', '#33ff66', '#55e4f3']);
                    playCrewSfx('shield-damage', 'impacto', { volume: 0.45, minGapMs: 80 });
                    dome.alpha = Math.max(0.32, dome.data.hp / ORBITAL.domeHp);
                    if (dome.data.hp <= 0) {
                        showExplosion(dome.x, dome.y, false);
                        dome.destroy();
                    }
                    shot.destroy();
                    blocked = true;
                    break;
                }
                if (blocked) continue;

                if (boxesOverlap(shot.x, shot.y, 18, 18, ship.x, ship.y, 44, 62)) {
                    shot.destroy();
                    damageOrbitalShip('disparo alienígena');
                    if (ejecting) return;
                }
            }

            // Orbital pickups
            for (const p of game.roster.tagged('orbitalPickup') as Iterable<Actor>) {
                if (!p.alive) continue;
                p.y += p.data.vy * dt;
                if (p.y > H + 40) { p.destroy(); continue; }
                if (boxesOverlap(p.x, p.y, p.width + 12, p.height + 12, ship.x, ship.y, 56, 72)) {
                    if (p.data.weapon === 'E') {
                        boost = 'spread'; boostTimer = 10;
                        statusLabel.text = 'REFORÇO ORBITAL  •  TIRO ESPALHADO ATIVADO!';
                    } else if (p.data.weapon === 'L') {
                        boost = 'laser'; boostTimer = 10;
                        statusLabel.text = 'REFORÇO ORBITAL  •  LASER PERFURANTE ATIVADO!';
                    } else {
                        orbitalShields = Math.min(ORBITAL.maxShields, orbitalShields + 1);
                        run.orbitalShields = orbitalShields;
                        for (const dome of domes) {
                            if (dome.alive) { dome.data.hp = Math.min(ORBITAL.domeHp, dome.data.hp + 2); dome.alpha = dome.data.hp / ORBITAL.domeHp; }
                        }
                        statusLabel.text = 'ESCUDOS ORBITAIS REFORÇADOS!';
                    }
                    award(300);
                    game.sound.play('coleta');
                    burstAt(p.x, p.y, 10, ['#fff3ae', '#55e4f3', '#66ff99']);
                    p.destroy();
                }
            }

            // Wave progression & orbital battle completion
            const remainingAliens = [...game.roster.tagged('orbitalAlien') as Iterable<Actor>].filter(a => a.alive).length;
            const flagshipAlive = Boolean(flagship?.alive);
            if (remainingAliens === 0 && !flagshipAlive) {
                if (wave === 1) {
                    award(1_000);
                    spawnWave(2);
                } else {
                    beginEjection(true, 'FROTA DESTRUÍDA! ONDA DE CHOQUE ATINGIU O CAÇA — EJEÇÃO!');
                }
            }

            syncHud();
        });
    },
};
