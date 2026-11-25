import { game } from '../engine.js';
import { spawnActor, targetActors, actorByTargetId, boxesOverlap, burstAt, hitFlash, collisionBounds, type Actor, type CollisionBox, type CollisionBounds } from '../actors.js';
import { firePlayer, fireAtPlayer, fireAngle, FIRE_INTERVALS, WEAPON_NAMES, WEAPON_PICKUP_TEXTURES, type ProjectileSystem } from '../combat.js';
import {
    LANDSCAPE, LEVEL_ONE_BOSS_X, LEVEL_ONE_BUNKER_X, LEVEL_ONE_GROUND, LEVEL_ONE_LENGTH, LEVEL_THREE_BOSS_Y,
    LEVEL_THREE_GROUND, LEVEL_THREE_HEIGHT, LEVEL_THREE_FINAL_PLATFORM, STAGE_ONE_EVENTS, buildCorridorWorld,
    addPlatform, buildJungleWorld, buildWaterfallWorld, groundPlatforms, levelThreeEvents,
} from '../levels.js';
import { award, captureStageCheckpoint, run, STAGE_BOSSES, STAGE_NAMES, updateRecord, type Weapon, type WeaponPickup } from '../state.js';
import { makeRotatePrompt, persistMuteSetting } from '../rotate.js';
import { listen, swiped } from '../input.js';
import { playCrewSfx } from '../sfx.js';

const TUNE = {
    runSpeed: 270,
    airSpeed: 292,
    corridorSpeed: 290,
    gravity: 1680,
    jumpSpeed: 850,
    coyote: 0.13,
    jumpBuffer: 0.15,
    stageThreeEdgePadding: 4,
    enemyBodyWidth: 42,
    enemyBodyHeight: 48,
    invulnerability: 4.6,
    barrierSeconds: 13,
    playerBoltLife: 2.3,
    bossWarning: 0.85,
    runnerSpeed: 92,
    runnerJumpSpeed: 700,
    acidSplashSeconds: 2.5,
    autoScrollSpeed: 108,
    hunterRespawnDelay: 4.5,
};

const PLAYER_BODY: { standing: CollisionBox; crouched: CollisionBox } = {
    standing: { width: 40, height: 50, offsetX: 0, offsetY: 4 },
    crouched: { width: 52, height: 22, offsetX: 0, offsetY: 5 },
};

function surfaceY(platform: Actor): number {
    const box = collisionBounds(platform);
    return box ? box.y - box.height / 2 : platform.y - platform.height / 2;
}

function platformBounds(platform: Actor): CollisionBounds {
    return collisionBounds(platform) ?? { x: platform.x, y: platform.y, width: platform.width, height: platform.height };
}

function bodyAt(actor: Actor, body: CollisionBox): CollisionBounds {
    return { x: actor.x + body.offsetX, y: actor.y + body.offsetY, width: body.width, height: body.height };
}

function groundedCenter(surface: number, body = PLAYER_BODY.standing): number {
    return surface - body.offsetY - body.height / 2;
}

type Aim = { x: number; y: number; angle: number };
let stopPlayGestures: (() => void) | null = null;

export const Play = {
    name: 'play',
    enter(): void {
        const stage = run.stage;
        const W = game.screen.width, H = game.screen.height;
        const isCorridor = stage === 2;
        const projectiles = game.projectilePatterns.createProjectiles();
        const projectileWeapons = new Map<number, { weapon: Weapon; expires: number }>();
        const projectileSprites = new Map<number, ReturnType<typeof game.spawn>>();
        stopPlayGestures?.();
        stopPlayGestures = listen();
        const spawnedEvents = new Set<string>();
        let stageWon = false;
        let runEnded = false;
        let bossStarted = false;
        let stageOneEvacZone = false;
        let extractionStarted = false;
        let extractionSequence = false;
        let extractionTime = 0;
        let extractionShotsFired = 0;
        let bunkerDoor: Actor | null = null;
        let bunkerStep: Actor | null = null;
        let distanceMilestone = 0;
        let bossCore: Actor | null = null;
        let bossGate: Actor | null = null;
        let corridorDoor: Actor | null = null;
        let corridorGate: Actor | null = null;
        let cameraTarget: Actor | null = null;
        let playerPlatform: Actor | null = null;
        let tutorialCue: { id: string; action: 'move' | 'fire' | 'duck' | 'jump' | 'grab' | 'aim' } | null = null;
        let tutorialFade = 0;
        let tutorialIcon: Actor | null = null;
        let swipeDuckTime = 0;
        let corridorBeamCooldown = 5.5;
        let corridorBeamWarning = 0;
        let corridorBeamActive = 0;
        let corridorBeamHigh = false;
        let parasiteIndex = 0;
        let effectIndex = 0;
        let droneIndex = 0;
        let roomTransition = false;
        let jumpBuffer = 0;
        let coyoteTime = 0;
        let ignorePlatformId = '';
        let ignorePlatformTime = 0;
        let airTime = 0;
        let firePoseTime = 0;
        let backFirePoseTime = 0;
        let knockbackTime = 0;
        let runCycle = 0;
        let footstepTimer = 0;
        let scrollLeft = 0;
        let hunterSeq = 0;
        const hunterRespawnTimers: [number, number] = [0.25, 1.8];
        let aim: Aim = stage === 2 ? { x: 0, y: -1, angle: -Math.PI / 2 } : { x: 1, y: 0, angle: 0 };

        game.rig.follow(null);
        game.rig.bounds(null);
        game.camera.x = W / 2; game.camera.y = H / 2; game.camera.zoom = 1;

        if (stage === 1) {
            buildJungleWorld();
        } else if (stage === 2) {
            buildCorridorWorld();
        } else {
            buildWaterfallWorld();
            game.rig.deadzone = { w: 280, h: 110 };
            game.rig.offset = { x: 0, y: -112 };
            game.rig.smoothing = 0.14;
            game.rig.bounds({ x: 0, y: 0, w: W, h: LEVEL_THREE_HEIGHT });
        }

        const startX = stage === 1
            ? (run.debugBunkerStart || run.debugBossStart ? LEVEL_ONE_BUNKER_X - 420 : 320)
            : stage === 2 ? W / 2 : 520;
        const startY = stage === 1 ? groundedCenter(LEVEL_ONE_GROUND) : stage === 2 ? groundedCenter(H - 120) : run.debugBossStart ? groundedCenter(LEVEL_THREE_FINAL_PLATFORM + 145) : groundedCenter(LEVEL_THREE_GROUND);
        scrollLeft = stage === 1
            ? (run.debugBunkerStart || run.debugBossStart ? Math.max(0, LEVEL_ONE_BUNKER_X - W * 0.72) : 0)
            : 0;
        const player = spawnActor({ id: 'soldado-orion', texture: stage === 2 ? 'orion-back' : 'player-idle', x: startX, y: startY, width: 52, height: 62, tags: ['player', 'target'], kind: 'player', hp: 1, layer: 'world', collisionBox: PLAYER_BODY.standing });
        function playerBounds(crouched = player.data.phase === 1): CollisionBounds {
            return bodyAt(player, crouched ? PLAYER_BODY.crouched : PLAYER_BODY.standing);
        }
        player.data.grounded = stage !== 2;
        player.data.face = 1;
        if (stage === 2) player.data.grounded = true;
        distanceMilestone = Math.floor(Math.max(0, stage === 1 ? player.x : stage === 3 ? LEVEL_THREE_GROUND - player.y : 0) / 100);

        const gun = game.spawn({ id: 'rifle-orion', texture: 'rifle', x: player.x + 24, y: player.y - 4, layer: 'world' });
        gun.visible = stage === 2;
        const shield = spawnActor({ id: 'barreira-orion', texture: 'energy-shield-dome', x: player.x, y: player.y, width: 112, height: 64, layer: 'front', kind: 'shieldVisual' });
        shield.visible = false;
        const bulletFx = game.graphics({ layer: 'hud' });
        const edgeFx = game.graphics({ layer: 'hud' });
        if (stage === 2) {
            const beam = spawnActor({ id: 'feixe-corredor', texture: 'laser-line', x: W / 2, y: H - 132, width: W, height: 18, layer: 'front', kind: 'corridorBeam' });
            beam.visible = false;
        }

        if (stage === 1) {
            game.camera.x = scrollLeft + W / 2;
            game.camera.y = H / 2;
        } else if (stage === 3) {
            cameraTarget = spawnActor({ id: 'camera-orion', texture: 'white', x: player.x, y: player.y, layer: 'world', kind: 'cameraTrack' });
            cameraTarget.visible = false;
            game.rig.follow(cameraTarget);
            game.camera.x = cameraTarget.x + game.rig.offset.x;
            game.camera.y = cameraTarget.y + game.rig.offset.y;
        }

        game.ui.panel({ anchor: 'top-left', x: 14, y: 12, w: 454, h: 76, style: 'panel' });
        const lifeIcons = [0, 1, 2].map(index => game.spawn({ id: `vida-icone-${index}`, texture: 'player-idle', x: 28 + index * 24, y: 27, width: 20, height: 24, layer: 'hud' }));
        const livesLabel = game.text('', 104, 17, { size: 18, font: 'VT323', color: '#66ff99', align: 'left', baseline: 'top' });
        const scoreLabel = game.text('', 24, 51, { size: 20, font: 'VT323', color: '#ffd166', align: 'left', baseline: 'top' });
        const weaponIcon = game.spawn({ id: 'hud-arma', texture: WEAPON_PICKUP_TEXTURES[run.weapon], x: 302, y: 48, width: 28, height: 36, layer: 'hud' });
        const weaponLabel = game.text('', 326, 32, { size: 17, font: 'VT323', color: '#66ff99', align: 'left', baseline: 'top' });
        const chapterLabel = game.text('', W / 2, 22, { size: 18, font: 'VT323', color: '#66ff99', baseline: 'top' });
        const statusLabel = game.text('', W / 2, H - 54, { size: 19, font: 'VT323', color: '#c8f7ff', stroke: { color: '#020a04', width: 2 } });
        const bossNameLabel = game.text('', W / 2, 50, { size: 17, font: 'VT323', color: '#ffd166', stroke: { color: '#020a04', width: 1 } });
        game.ui.pauseButton();
        game.ui.muteButton();
        const rotate = makeRotatePrompt();
        let bossBar: ReturnType<typeof game.bars.create> | null = null;

        function cue(id: string, action: 'move' | 'fire' | 'duck' | 'jump' | 'grab' | 'aim'): void {
            if (run.tutorial[id] || tutorialCue || tutorialIcon) return;
            tutorialCue = { id, action };
            tutorialFade = 0;
            tutorialIcon = spawnActor({ id: 'controle-ajuda', texture: `cue-${action}`, x: player.x + player.data.face * 54, y: player.y - 54, width: 46, height: 36, layer: 'front', kind: 'tutorialCue' });
        }

        function finishCue(): void {
            if (!tutorialCue) return;
            run.tutorial[tutorialCue.id] = true;
            tutorialCue = null;
            tutorialFade = 0.35;
        }

        function updateBossBar(name: string, maximum: number, core: Actor): void {
            bossNameLabel.text = name.toLocaleUpperCase('pt-BR');
            if (!bossBar) {
                bossBar = game.bars.create({
                    anchor: 'top', y: 74, width: Math.min(440, W * 0.4), height: 18, max: maximum,
                    value: core.data.hp, style: 'retro', fill: '#e44853', track: '#172833',
                });
            }
        }

        function spawnRoomDoor(): void {
            corridorDoor?.destroy();
            corridorDoor = spawnActor({ id: `portao-sala-${run.room}`, texture: 'corridor-door', x: W / 2, y: 268, width: 430, height: 355, layer: 'back', kind: 'corridorDoor' });
        }

        function clearRoomActors(): void {
            for (const target of game.roster.tagged('roomTarget') as Iterable<Actor>) target.destroy();
            for (const actor of game.roster.tagged('roomDecoration') as Iterable<Actor>) actor.destroy();
            corridorGate = null;
        }

        function startCorridorRoom(room: number): void {
            roomTransition = false;
            run.room = room;
            clearRoomActors();
            spawnRoomDoor();
            corridorGate = spawnActor({ id: `barreira-sala-${room}`, texture: 'corridor-gate', x: W / 2, y: 270, width: 330, height: 110, tags: ['target', 'roomTarget'], kind: 'laserBarrier', hp: 7 + room, scoreValue: 1_100, room, active: false });
            const count = room < 3 ? 2 : 3;
            for (let index = 0; index < count; index++) {
                const side = index % 2 === 0 ? -1 : 1;
                const x = W / 2 + side * (index === 2 ? 300 : 225);
                spawnActor({ id: `canhao-sala-${room}-${index}`, texture: 'no-de-canhao-de-plasma', x, y: 214 + (index === 2 ? 30 : 0), width: 68, height: 50, tags: ['enemy', 'target', 'roomTarget'], kind: 'robotCannon', hp: 3 + Math.floor(room / 2), scoreValue: 420, room, cooldown: 1.6 + index * 0.65 });
            }
            statusLabel.text = `SALA ${room}  •  DESTRUA OS CANHÕES E A BARREIRA`;
        }

        function enterStageOneEvacZone(): void {
            if (stageOneEvacZone) return;
            stageOneEvacZone = true;
            projectiles.clear();
            for (const h of game.roster.tagged('leftHunter') as Iterable<Actor>) h.destroy();
            for (const shot of game.roster.tagged('enemyProjectile') as Iterable<Actor>) shot.destroy();
            for (const enemy of game.roster.tagged('enemy') as Iterable<Actor>) enemy.destroy();
            statusLabel.text = 'BUNKER DE EVACUAÇÃO  •  ENCOSTE NO BUNKER PARA TERMINAR';
        }

        function completeStageOneBunker(): void {
            if (stageWon) return;
            enterStageOneEvacZone();
            stageWon = true;
            run.cleared = 1;
            run.extractionBonus = 5_000 + run.lives * 500;
            award(run.extractionBonus);
            updateRecord();
            const door = game.roster.byId('comporta-bunker-fase1') as Actor | null;
            if (door?.alive) door.visible = true;
            playCrewSfx('bunker-door', 'barreira', { volume: 0.85 });
            playCrewSfx('mission-clear', 'vitoria', { volume: 0.85 });
            game.feel.flash('#d9fff5', 0.18);
            game.feel.shake(6, 0.25);
            statusLabel.text = 'EVACUAÇÃO CONFIRMADA  •  MISSÃO CUMPRIDA!';
            game.after(1.35, () => void game.transition.go('missioncomplete', { kind: 'pixels', duration: 0.6, color: '#020a04', cells: 16 }));
        }

        function spawnBoss(): void {
            if (stage === 1) {
                enterStageOneEvacZone();
                run.debugBossStart = false;
                return;
            }
            if (bossStarted || extractionStarted) return;
            bossStarted = true;
            game.sound.play('chefe');
            game.feel.shake(5, 0.28);
            if (stage === 2) {
                clearRoomActors();
                corridorDoor?.destroy();
                spawnActor({ id: 'computador-fundo', texture: 'computer-wall', x: W / 2, y: 305, width: 760, height: 440, layer: 'back', kind: 'bossBackdrop' });
                const left = spawnActor({ id: 'canhao-central-esquerdo', texture: 'no-de-canhao-de-plasma', x: W * 0.36, y: 215, width: 92, height: 68, tags: ['target', 'bossPart'], kind: 'bossCannon', hp: 8, scoreValue: 1_800, cooldown: 1.2 });
                left.data.startX = W * 0.36;
                const right = spawnActor({ id: 'canhao-central-direito', texture: 'no-de-canhao-de-plasma', x: W * 0.64, y: 215, width: 92, height: 68, tags: ['target', 'bossPart'], kind: 'bossCannon', hp: 8, scoreValue: 1_800, cooldown: 2 });
                right.data.startX = W * 0.64;
                bossCore = spawnActor({ id: 'olho-computador-central', texture: 'computer-eye', x: W / 2, y: 365, width: 136, height: 116, tags: ['target', 'bossPart'], kind: 'bossEye', hp: 18, scoreValue: 5_000, active: false, cooldown: 2.1 });
                updateBossBar(STAGE_BOSSES[1], bossCore.data.hp, bossCore);
                statusLabel.text = 'COMPUTADOR CENTRAL  •  DESTRUA OS CANHÕES PARA ABRIR O OLHO';
            } else {
                const tentLeft = spawnActor({ id: 'tentaculo-nucleo-esquerdo', texture: 'tentaculo-mecanico-do-chefe', x: 385, y: LEVEL_THREE_BOSS_Y + 20, width: 118, height: 106, tags: ['target', 'bossPart'], kind: 'bossMouth', hp: 7, scoreValue: 1_600, cooldown: 1.4 });
                tentLeft.data.face = -1;
                const tentRight = spawnActor({ id: 'tentaculo-nucleo-direito', texture: 'tentaculo-mecanico-do-chefe', x: 895, y: LEVEL_THREE_BOSS_Y + 20, width: 118, height: 106, tags: ['target', 'bossPart'], kind: 'bossMouth', hp: 7, scoreValue: 1_600, cooldown: 2.2 });
                tentRight.sx = -1;
                tentRight.data.face = 1;
                spawnActor({ id: 'no-plasma-nucleo-esquerdo', texture: 'no-de-canhao-de-plasma', x: 458, y: LEVEL_THREE_BOSS_Y - 82, width: 82, height: 60, tags: ['target', 'bossPart'], kind: 'bossNode', hp: 6, scoreValue: 1_400, cooldown: 1.9 });
                spawnActor({ id: 'no-plasma-nucleo-direito', texture: 'no-de-canhao-de-plasma', x: 822, y: LEVEL_THREE_BOSS_Y - 82, width: 82, height: 60, tags: ['target', 'bossPart'], kind: 'bossNode', hp: 6, scoreValue: 1_400, cooldown: 2.6 });
                bossCore = spawnActor({ id: 'coracao-nucleo-final', texture: 'chefe-final-biomecanico', x: W / 2, y: LEVEL_THREE_BOSS_Y - 30, width: 210, height: 280, tags: ['target', 'bossPart'], kind: 'bossHeart', hp: 22, scoreValue: 8_000, active: false, cooldown: 2.3 });
                spawnActor({ id: 'filamento-piso', texture: 'laser-line', x: W / 2, y: LEVEL_THREE_FINAL_PLATFORM - 8, width: 1_000, height: 22, layer: 'front', kind: 'filament' });
                const filament = [...game.roster.tagged('actor') as Iterable<Actor>].find(actor => actor.data.kind === 'filament');
                if (filament) filament.visible = false;
                updateBossBar(STAGE_BOSSES[2], bossCore.data.hp, bossCore);
                statusLabel.text = 'CORAÇÃO ALIENÍGENA  •  DESTRUA OS TENTÁCULOS E NÓS DE PLASMA';
            }
            run.debugBossStart = false;
        }

        function refreshBossState(): void {
            if (!bossStarted) return;
            const parts = [...game.roster.tagged('bossPart') as Iterable<Actor>].filter(actor => actor.alive);
            if (stage === 1 && bossCore?.alive) {
                const shielded = parts.some(actor => actor.data.kind === 'bossBattery1' || actor.data.kind === 'bossBattery2');
                bossCore.data.active = !shielded;
                if (bossGate?.alive) bossGate.visible = shielded;
                if (!shielded) statusLabel.text = 'PORTÃO ABERTO  •  ATINJA O NÚCLEO VERMELHO';
            } else if (stage === 2 && bossCore?.alive) {
                const shielded = parts.some(actor => actor.data.kind === 'bossCannon');
                bossCore.data.active = !shielded;
                if (!shielded) statusLabel.text = 'OLHO EXPOSTO  •  ATINJA O NÚCLEO';
            } else if (stage === 3 && bossCore?.alive) {
                const shielded = parts.some(actor => actor.data.kind === 'bossMouth' || actor.data.kind === 'bossNode');
                bossCore.data.active = !shielded;
                if (!shielded) statusLabel.text = 'CORAÇÃO EXPOSTO  •  DESVIE DOS FILAMENTOS';
            }
            if (bossBar && bossCore?.alive) bossBar.value = bossCore.data.hp;
        }

        function showPickup(weapon: WeaponPickup, x: number, y: number): Actor {
            const tall = weapon === 'E' || weapon === 'L';
            const pickup = spawnActor({ id: `arma-${weapon}-solta`, texture: WEAPON_PICKUP_TEXTURES[weapon], x, y, width: tall ? 34 : 40, height: tall ? 48 : 40, tags: ['pickup'], kind: 'weaponPickup', weapon, vy: 32, timer: 0 });
            if (stage === 1 && run.tutorial.fire && !run.tutorial.grab) cue('grab', 'grab');
            return pickup;
        }

        function updateDistanceScore(): void {
            const progress = Math.max(0, stage === 1 ? player.x : stage === 3 ? LEVEL_THREE_GROUND - player.y : 0);
            const milestone = Math.floor(progress / 100);
            if (milestone <= distanceMilestone) return;
            const points = (milestone - distanceMilestone) * 10;
            distanceMilestone = milestone;
            run.distanceScore += points;
            award(points);
        }

        function showPixelExplosion(x: number, y: number, boss = false): void {
            if (boss) {
                spawnActor({ id: `explosao-chefe-clarao-${++effectIndex}`, texture: 'explosao-do-chefe-clarao-de-fogo', x, y, width: 120, height: 132, layer: 'front', tags: ['effect'], kind: 'pixelExplosion', timer: 0.34, phase: 0.34 });
                game.after(0.14, () => {
                    spawnActor({ id: `explosao-chefe-onda-${++effectIndex}`, texture: 'explosao-do-chefe-onda-de-choque-de-plasma', x, y, width: 136, height: 152, layer: 'front', tags: ['effect'], kind: 'pixelExplosion', timer: 0.42, phase: 0.42 });
                });
                game.after(0.32, () => {
                    spawnActor({ id: `explosao-chefe-fumaca-${++effectIndex}`, texture: 'explosao-do-chefe-fumaca-e-estilhacos', x, y, width: 148, height: 180, layer: 'front', tags: ['effect'], kind: 'pixelExplosion', timer: 0.52, phase: 0.52 });
                });
                return;
            }
            const seconds = 0.28;
            spawnActor({ id: `explosao-pixel-${++effectIndex}`, texture: 'explosao-pixel-8bit', x, y, width: 54, height: 52, layer: 'front', tags: ['effect'], kind: 'pixelExplosion', timer: seconds, phase: seconds });
        }

        function isOrganicKind(kind: string): boolean {
            return kind === 'infantry' || kind === 'runner' || kind === 'spitter' || kind === 'nest' || kind === 'parasite' || kind === 'acidGlob' || kind === 'bossMouth' || kind === 'bossHeart';
        }

        function onActorDestroyed(actor: Actor): void {
            const kind = actor.data.kind;
            const targetX = actor.x, targetY = actor.y;
            showPixelExplosion(targetX, targetY, kind.startsWith('boss'));
            burstAt(targetX, targetY, kind.startsWith('boss') ? 34 : 14, kind.startsWith('boss') ? ['#fff6bf', '#ff754d', '#f33d5b'] : undefined);
            if (isOrganicKind(kind)) {
                playCrewSfx('alien-death', kind.startsWith('boss') ? 'explosao' : 'impacto', { volume: kind.startsWith('boss') ? 0.85 : 0.72, minGapMs: 70 });
                if (kind === 'bossHeart') playCrewSfx('ship-explosion', 'explosao', { volume: 0.82 });
            } else {
                playCrewSfx('ship-explosion', kind.startsWith('boss') ? 'explosao' : 'impacto', { volume: kind.startsWith('boss') ? 0.82 : 0.66, minGapMs: 70 });
            }
            game.feel.shake(kind.startsWith('boss') ? 9 : 3, kind.startsWith('boss') ? 0.35 : 0.12);
            award(actor.data.scoreValue);
            if (kind === 'infantry' || kind === 'runner' || kind === 'robotCannon' || kind === 'nest' || kind === 'drone' || kind === 'leftHunter') run.kills++;
            if (kind === 'leftHunter' && (actor.data.room === 0 || actor.data.room === 1)) {
                hunterRespawnTimers[actor.data.room] = TUNE.hunterRespawnDelay;
            }
            if (kind === 'turret' || kind === 'battery' || kind === 'spitter') run.turrets++;
            if (kind === 'capsule') {
                run.capsules++;
                award(180);
                showPickup(actor.data.weapon, targetX, targetY);
            } else if (kind === 'acidGlob') {
                run.sporesShot++;
                award(250);
                burstAt(targetX, targetY, 9, ['#c7ff8a', '#5bff8f', '#26b36d']);
            } else if (kind === 'sensor') {
                award(250);
                showPickup(actor.data.weapon, targetX, targetY - 10);
            } else if (kind === 'battery') {
                if (actor.data.seed % 2 === 0) showPickup(actor.data.weapon, targetX, targetY - 26);
            } else if (kind.startsWith('boss')) {
                run.bossParts++;
                if (kind === 'bossCore1' || kind === 'bossEye') finishStage();
                else if (kind === 'bossHeart') beginExtraction();
            } else if (kind === 'laserBarrier') {
                award(1_000);
                finishCorridorRoom();
            }
        }

        function damageTarget(actor: Actor, damage: number): void {
            if (!actor.alive || !actor.data.active) return;
            if (actor.data.kind === 'sensor' && actor.data.phase !== 1) return;
            if (actor.data.kind === 'bossCore1' || actor.data.kind === 'bossEye' || actor.data.kind === 'bossHeart') {
                if (!actor.data.active) return;
            }
            actor.data.hp -= damage;
            hitFlash(actor);
            if (actor.data.kind === 'bossCore1' || actor.data.kind === 'bossEye' || actor.data.kind === 'bossHeart') game.feel.hitstop(0.045);
            if (actor.data.hp <= 0) {
                actor.destroy();
                onActorDestroyed(actor);
            } else if (isOrganicKind(actor.data.kind)) {
                playCrewSfx('alien-hit', 'impacto', { volume: 0.56, minGapMs: 70 });
            }
        }

        function beginExtraction(): void {
            if (extractionStarted) return;
            extractionStarted = true;
            bossStarted = false;
            bossCore = null;
            if (bossBar) bossBar.visible = false;
            for (const actor of game.roster.tagged('actor') as Iterable<Actor>) {
                if (actor.data.kind === 'bossBackdrop' || actor.data.kind.startsWith('boss') || actor.data.kind === 'filament' || actor.data.kind === 'parasite') actor.destroy();
            }
            for (const shot of game.roster.tagged('enemyProjectile') as Iterable<Actor>) shot.destroy();
            for (const enemy of game.roster.tagged('enemy') as Iterable<Actor>) enemy.destroy();
            for (const hazard of game.roster.tagged('hazard') as Iterable<Actor>) hazard.destroy();

            const ascent = [
                { x: 520, top: 1260, tex: 'alien-stone-cliff-step', w: 225, h: 112 },
                { x: 760, top: 1080, tex: 'small-rocky-alien-ledge', w: 210, h: 96 },
                { x: 640, top: 900, tex: 'alien-stone-cliff-step', w: 225, h: 112 },
                { x: 520, top: 720, tex: 'small-rocky-alien-ledge', w: 210, h: 96 },
            ];
            ascent.forEach((ledge, index) => addPlatform(`bunker-acesso-${index}`, ledge.tex, ledge.x, ledge.top, ledge.w, ledge.h, 'bunkerLedge', true));
            bunkerStep = addPlatform('escadas-bunker-evacuacao', 'long-alien-rock-platform', 640, 540, 440, 54, 'bunkerSteps', true);
            spawnActor({ id: 'modulo-bunker-evacuacao', texture: 'modulo-bunker-de-evacuacao', x: 640, y: 370, width: 500, height: 358, layer: 'back', kind: 'evacuationBunker' });
            bunkerDoor = spawnActor({ id: 'comporta-bunker-evacuacao', texture: 'comporta-blindada-de-evacuacao', x: 640, y: 390, width: 138, height: 148, layer: 'back', kind: 'evacuationDoor' });
            bunkerDoor.visible = false;
            spawnActor({ id: 'antena-bunker-evacuacao', texture: 'torre-de-antena-do-bunker', x: 930, y: 295, width: 92, height: 330, layer: 'back', kind: 'evacuationAntenna' });
            for (const [index, x] of [510, 770].entries()) {
                const turret = spawnActor({ id: `torreta-bunker-${index}`, texture: 'torreta-dupla-automatica', x, y: 250, width: 96, height: 76, kind: 'extractionTurret' });
                turret.rot = index === 0 ? -2.2 : -0.94;
            }
            statusLabel.text = 'BUNKER DE EVACUAÇÃO  •  ALCANCE AS ESCADAS';
            bossNameLabel.text = '';
            playCrewSfx('ship-explosion', 'explosao', { volume: 0.78 });
            game.feel.shake(7, 0.3);
        }

        function finishVictory(): void {
            if (stageWon) return;
            stageWon = true;
            run.cleared = 3;
            updateRecord();
            playCrewSfx('mission-clear', 'vitoria', { volume: 0.85 });
            game.feel.flash('#d9fff5', 0.18);
            game.feel.shake(8, 0.35);
            statusLabel.text = 'EXTRAÇÃO CONFIRMADA  •  MISSÃO CUMPRIDA';
            game.after(1.6, () => void game.transition.go('missioncomplete', { kind: 'pixels', duration: 0.6, color: '#020a04', cells: 16 }));
        }

        function fireEvacuationTurrets(): void {
            const turrets = [...game.roster.tagged('actor') as Iterable<Actor>].filter(actor => actor.alive && actor.data.kind === 'extractionTurret');
            turrets.forEach((turret, index) => {
                const baseAngle = index === 0 ? -2.2 : -0.94;
                for (const offset of [-0.16, 0.16]) {
                    const angle = baseAngle + offset;
                    const shot = spawnActor({ id: `tiro-bunker-${++effectIndex}`, texture: 'projetil-tiro-padrao', x: turret.x, y: turret.y - 24, width: 30, height: 12, layer: 'front', kind: 'extractionShot', vx: Math.cos(angle) * 520, vy: Math.sin(angle) * 520, timer: 1.2 });
                    shot.rot = angle;
                }
                burstAt(turret.x, turret.y - 28, 6, ['#fff6bf', '#ff9d2e', '#66ff99']);
            });
            playCrewSfx('rifle-shot', 'disparo', { volume: 0.55, minGapMs: 60 });
        }

        function updateExtraction(dt: number): void {
            if (!extractionStarted) return;
            for (const shot of game.roster.tagged('actor') as Iterable<Actor>) {
                if (!shot.alive || shot.data.kind !== 'extractionShot') continue;
                shot.x += shot.data.vx * dt;
                shot.y += shot.data.vy * dt;
                shot.data.timer -= dt;
                if (shot.data.timer <= 0 || shot.y < -60 || shot.x < -40 || shot.x > W + 40) shot.destroy();
            }
            if (!extractionSequence) {
                const hero = playerBounds(false);
                if (bunkerStep && boxesOverlap(hero.x, hero.y, hero.width, hero.height, bunkerStep.x, bunkerStep.y - 28, bunkerStep.width, 92)) {
                    extractionSequence = true;
                    extractionTime = 0;
                    player.x = bunkerStep.x;
                    player.y = groundedCenter(surfaceY(bunkerStep));
                    player.data.collisionBox = PLAYER_BODY.standing;
                    player.data.vx = 0; player.data.vy = 0; player.data.grounded = true;
                    playerPlatform = bunkerStep;
                    run.extractionBonus = 5_000;
                    award(run.extractionBonus);
                    if (bunkerDoor) { bunkerDoor.visible = true; bunkerDoor.y = 360; }
                    statusLabel.text = 'COMPORTA BLINDADA TRAVADA';
                    playCrewSfx('bunker-door', 'barreira', { volume: 0.85 });
                    game.feel.shake(4, 0.2);
                }
                return;
            }
            extractionTime += dt;
            if (bunkerDoor) bunkerDoor.y = 360 + Math.min(1, extractionTime / 0.72) * 70;
            statusLabel.text = extractionTime < 0.85 ? 'COMPORTA BLINDADA TRAVADA' : 'TORRETAS DO TETO  •  FOGO DE COBERTURA';
            const salvos = Math.min(3, Math.floor(Math.max(0, extractionTime - 0.75) / 0.48) + 1);
            while (extractionShotsFired < salvos) { fireEvacuationTurrets(); extractionShotsFired++; }
            if (extractionTime >= 2.45) finishVictory();
        }

        function finishStage(): void {
            if (stage === 1) { completeStageOneBunker(); return; }
            if (stage === 3) { beginExtraction(); return; }
            if (stageWon) return;
            stageWon = true;
            projectiles.clear();
            for (const actor of game.roster.tagged('enemyProjectile') as Iterable<Actor>) actor.destroy();
            updateRecord();
            playCrewSfx('mission-clear', 'vitoria', { volume: 0.84 });
            game.feel.flash('#d9fff5', 0.18);
            game.feel.shake(12, 0.48);
            statusLabel.text = stage === 3 ? 'NÚCLEO DESTRUÍDO  •  MISSÃO CUMPRIDA!' : `${STAGE_BOSSES[stage - 1]} NEUTRALIZADA`;
            bossNameLabel.text = 'VITÓRIA';
            if (bossBar) bossBar.visible = false;
            game.after(2.6, () => {
                run.cleared = Math.max(run.cleared, stage);
                if (stage < 3) {
                    run.stage = stage + 1;
                    run.room = 0;
                    captureStageCheckpoint();
                    void game.transition.go('play', { kind: 'wipe', duration: 0.55, angle: 0, color: '#020a04' });
                } else {
                    void game.transition.go('missioncomplete', { kind: 'pixels', duration: 0.6, color: '#020a04', cells: 16 });
                }
            });
        }

        function finishCorridorRoom(): void {
            if (roomTransition || stageWon) return;
            roomTransition = true;
            projectiles.clear();
            game.sound.play('barreira');
            game.feel.flash('#86fff2', 0.1);
            statusLabel.text = 'BARREIRA DESATIVADA  •  AVANÇANDO';
            if (corridorGate) corridorGate.visible = false;
            if (corridorDoor) corridorDoor.visible = false;
            const next = run.room + 1;
            game.after(1.55, () => {
                if (stage !== 2) return;
                if (next > 5) spawnBoss();
                else startCorridorRoom(next);
            });
        }

        function recoverFromFall(cause: string): void {
            if (cause === 'queda em rio profundo') {
                const minSafeX = stage === 1 ? scrollLeft + 180 : 0;
                const safeGround = groundPlatforms()
                    .filter(platform => platform.data.kind === 'ground' && platform.x >= minSafeX)
                    .sort((a, b) => Math.abs(a.x - Math.max(player.x, minSafeX)) - Math.abs(b.x - Math.max(player.x, minSafeX)))[0]
                    ?? groundPlatforms()
                        .filter(platform => platform.data.kind === 'ground')
                        .sort((a, b) => Math.abs(a.x - player.x) - Math.abs(b.x - player.x))[0];
                if (safeGround) {
                    const support = platformBounds(safeGround);
                    const minX = support.x - support.width / 2 + PLAYER_BODY.standing.width / 2;
                    const maxX = support.x + support.width / 2 - PLAYER_BODY.standing.width / 2;
                    player.x = Math.max(minX, Math.min(maxX, Math.max(player.x, minSafeX)));
                    player.y = groundedCenter(surfaceY(safeGround));
                    playerPlatform = safeGround;
                } else {
                    player.x = Math.max(player.x, minSafeX);
                    player.y = groundedCenter(LEVEL_ONE_GROUND);
                    playerPlatform = null;
                }
                player.data.grounded = true;
            } else if (cause === 'queda da cachoeira') {
                const above = groundPlatforms()
                    .filter(platform => surfaceY(platform) < playerBounds(false).y)
                    .sort((a, b) => {
                        const da = (a.x - player.x) ** 2 + (surfaceY(a) - player.y) ** 2;
                        const db = (b.x - player.x) ** 2 + (surfaceY(b) - player.y) ** 2;
                        return da - db;
                    })[0];
                if (above) {
                    const support = platformBounds(above);
                    const minX = support.x - support.width / 2 + PLAYER_BODY.standing.width / 2;
                    const maxX = support.x + support.width / 2 - PLAYER_BODY.standing.width / 2;
                    player.x = Math.max(minX, Math.min(maxX, player.x));
                    player.y = groundedCenter(surfaceY(above));
                    player.data.collisionBox = PLAYER_BODY.standing;
                    player.data.grounded = true;
                    playerPlatform = above;
                }
            }
            player.data.collisionBox = PLAYER_BODY.standing;
            player.data.vx = 0;
            player.data.vy = 0;
        }

        function hitPlayer(cause: string, _unforgivable = false): void {
            if (!player.alive || stageWon) return;
            if (run.invulnerable || run.invulnTime > 0 || run.barrierTime > 0) {
                if (cause.startsWith('queda')) recoverFromFall(cause);
                if (run.barrierTime > 0 && cause === 'contato') {
                    const hero = playerBounds();
                    const touched = [...game.roster.tagged('enemy') as Iterable<Actor>].find(enemy => enemy.alive && boxesOverlap(hero.x, hero.y, hero.width, hero.height, enemy.x, enemy.y, enemy.width, enemy.height));
                    if (touched) { touched.destroy(); onActorDestroyed(touched); }
                }
                return;
            }
            run.lastCause = cause;
            run.deaths++;
            if (!run.infiniteLives) run.lives = Math.max(0, run.lives - 1);
            projectiles.clear();
            for (const shot of game.roster.tagged('enemyProjectile') as Iterable<Actor>) shot.destroy();
            if (!run.keepWeapon) run.weapon = 'P';
            run.barrierTime = 0;
            run.rapidTime = 0;
            playCrewSfx('shield-damage', 'impacto', { volume: 0.72 });
            game.feel.shake(6, 0.24);
            if (run.lives <= 0 && !run.infiniteLives) {
                updateRecord();
                runEnded = true;
                void game.transition.go('gameover', { kind: 'shatter', duration: 0.65, cells: 14, at: { x: W / 2, y: H / 2 } });
                return;
            }
            run.invulnTime = TUNE.invulnerability;
            knockbackTime = 0.36;
            recoverFromFall(cause);
            player.data.phase = 0;
            player.rot = 0;
            player.texture = isCorridor ? 'orion-back' : 'piloto-sobrevivente-em-recuo';
        }

        function captureByLeftEdge(): void {
            if (!player.alive || stageWon || runEnded) return;
            if (run.invulnerable) {
                player.x = scrollLeft + 220;
                return;
            }
            if (run.infiniteLives) {
                playCrewSfx('shield-damage', 'impacto', { volume: 0.72 });
                run.invulnTime = TUNE.invulnerability;
                player.x = scrollLeft + 260;
                recoverFromFall('queda em rio profundo');
                return;
            }
            run.lastCause = 'capturado pela borda da tela';
            run.deaths++;
            run.lives = 0;
            run.barrierTime = 0;
            run.rapidTime = 0;
            projectiles.clear();
            for (const shot of game.roster.tagged('enemyProjectile') as Iterable<Actor>) shot.destroy();
            playCrewSfx('shield-damage', 'impacto', { volume: 0.85 });
            playCrewSfx('ship-explosion', 'explosao', { volume: 0.76 });
            burstAt(player.x, player.y, 26, ['#ff5a5a', '#ff9d2e', '#c8f7ff']);
            game.feel.shake(10, 0.36);
            updateRecord();
            runEnded = true;
            void game.transition.go('gameover', { kind: 'shatter', duration: 0.65, cells: 14, at: { x: W / 2, y: H / 2 } });
        }

        function updateLeftHunters(dt: number): void {
            if (stage !== 1 || bossStarted || stageOneEvacZone || stageWon) return;
            const slots = [
                {
                    offsetX: 118, baseY: 138, interval: 2.35,
                    textures: ['alien-pilot-saucer', 'heavy-scout-saucer', 'sleek-stealth-saucer', 'white-disc-saucer', 'nave-alienigena-aerea'] as const,
                    sizes: [[78, 50], [82, 36], [86, 30], [82, 40], [86, 62]] as const,
                },
                {
                    offsetX: 244, baseY: 184, interval: 2.95,
                    textures: ['brain-alien-ufo', 'winged-interceptor-saucer', 'blue-war-saucer', 'finned-attack-saucer', 'notched-attack-saucer', 'bombardeiro-de-mergulho'] as const,
                    sizes: [[78, 52], [88, 30], [84, 35], [82, 46], [82, 40], [62, 64]] as const,
                },
            ];
            const activeHunters = [...game.roster.tagged('leftHunter') as Iterable<Actor>].filter(a => a.alive);
            for (let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
                const slot = slots[slotIndex]!;
                const existing = activeHunters.find(h => h.data.room === slotIndex);
                if (!existing) {
                    hunterRespawnTimers[slotIndex] -= dt;
                    if (hunterRespawnTimers[slotIndex] <= 0) {
                        const pick = hunterSeq++ % slot.textures.length;
                        const texture = slot.textures[pick] ?? slot.textures[0];
                        const [w, h] = slot.sizes[pick] ?? slot.sizes[0];
                        const hunter = spawnActor({
                            id: `nave-canto-${slotIndex}-${hunterSeq}`,
                            texture,
                            x: scrollLeft - 50,
                            y: slot.baseY - 40,
                            width: w,
                            height: h,
                            layer: 'world',
                            tags: ['enemy', 'target', 'leftHunter'],
                            kind: 'leftHunter',
                            room: slotIndex,
                            hp: 3,
                            scoreValue: 350,
                            cooldown: 1.3 + slotIndex * 0.85,
                        });
                        if (texture === 'nave-alienigena-aerea' || texture === 'bombardeiro-de-mergulho') {
                            hunter.sx = -1;
                            hunter.rot = 0.24;
                        }
                    }
                    continue;
                }
                const targetX = scrollLeft + slot.offsetX + Math.sin(run.campaignTime * 1.85 + slotIndex * 2.1) * 26;
                const targetY = slot.baseY + Math.cos(run.campaignTime * 2.4 + slotIndex * 1.4) * 18;
                existing.x += (targetX - existing.x) * Math.min(1, dt * 4.5);
                existing.y += (targetY - existing.y) * Math.min(1, dt * 4.5);
                if (warningStep(existing, dt, slot.interval, 0.72)) {
                    const rawAngle = Math.atan2(player.y - existing.y, player.x - existing.x);
                    const diagAngle = Math.max(0.38, Math.min(1.22, rawAngle));
                    playCrewSfx('enemy-plasma', 'disparo', { volume: 0.44, minGapMs: 90 });
                    fireAngle(projectiles, existing, diagAngle, { kind: 'aimed', count: 1, speed: 295, radius: 8, life: 4.2 }, 1);
                }
            }
        }

        function drawLeftEdgeWarning(): void {
            edgeFx.clear();
            if (stage !== 1 || bossStarted || stageOneEvacZone || stageWon) return;
            const dist = player.x - scrollLeft;
            const pulse = 0.55 + Math.sin(run.campaignTime * 14) * 0.45;
            const alpha = dist < 170 ? (1 - Math.max(0, dist) / 170) * 0.52 * pulse : 0.1 * pulse;
            edgeFx.draw(ctx => {
                const grad = ctx.createLinearGradient(0, 0, dist < 170 ? 54 : 18, 0);
                grad.addColorStop(0, `rgba(255, 66, 88, ${alpha.toFixed(3)})`);
                grad.addColorStop(1, 'rgba(255, 66, 88, 0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, dist < 170 ? 54 : 18, H);
            });
        }

        function quantizeAim(x: number, y: number): Aim {
            const length = Math.hypot(x, y);
            if (length < 0.18) return stage === 2 ? { x: 0, y: -1, angle: -Math.PI / 2 } : { x: player.data.face, y: 0, angle: player.data.face > 0 ? 0 : Math.PI };
            const octant = Math.round(Math.atan2(y, x) / (Math.PI / 4));
            const angle = octant * Math.PI / 4;
            return { x: Math.cos(angle), y: Math.sin(angle), angle };
        }

        function fire(): void {
            const firedWeapon = run.weapon;
            firePoseTime = 0.16;
            for (const id of firePlayer(projectiles, player, aim.angle, firedWeapon)) projectileWeapons.set(id, { weapon: firedWeapon, expires: projectiles.time + 3 });
            if (tutorialCue?.action === 'fire') finishCue();
        }

        function spawnScheduled(event: typeof STAGE_ONE_EVENTS[number]): void {
            const common = { id: event.id, x: event.x, y: event.y, weapon: event.weapon };
            if (event.kind === 'infantry') spawnActor({ ...common, texture: 'infantaria-biomecanica', width: 56, height: 64, tags: ['enemy', 'target'], kind: 'infantry', hp: 2, scoreValue: 180, cooldown: 1.2 });
            else if (event.kind === 'runner') spawnActor({ ...common, texture: 'parasita-terrestre-saltador', width: 54, height: 60, tags: ['enemy', 'target'], kind: 'runner', hp: 2, scoreValue: 300, cooldown: 2.2 });
            else if (event.kind === 'turret') {
                const useDual = (event.x % 200) < 100;
                spawnActor({ ...common, y: LEVEL_ONE_GROUND - 34, texture: useDual ? 'torreta-laser-dupla-alienigena' : 'torreta-de-plasma-alienigena', width: useDual ? 74 : 72, height: 68, tags: ['enemy', 'target'], kind: 'turret', hp: 3, scoreValue: 360, cooldown: 1.5 });
            }
            else if (event.kind === 'battery') spawnActor({ ...common, y: LEVEL_ONE_GROUND - 38, texture: 'torreta-biomecanica-terrestre', width: 78, height: 76, tags: ['enemy', 'target'], kind: 'battery', hp: 5, scoreValue: 650, cooldown: 1.9 });
            else if (event.kind === 'capsule') spawnActor({ ...common, texture: 'propulsor-de-reforco', x: stage === 3 ? player.x - 360 : event.x, y: stage === 3 ? player.y - 210 : event.y, width: 170, height: 62, tags: ['enemy', 'target'], kind: 'capsule', hp: 1, scoreValue: 220, cooldown: 0, vx: 94 });
            else if (event.kind === 'drone') {
                const variant = droneIndex++;
                const armored = stage === 1 ? event.x >= 14_000 : stage === 3 && event.y <= LEVEL_THREE_GROUND - 45 * 145;
                const ships = armored
                    ? [
                        { texture: 'nave-alienigena-aerea', width: 88, height: 64, hp: 4, score: 540, vx: 150, flipRight: true },
                        { texture: 'bombardeiro-de-mergulho', width: 64, height: 66, hp: 4, score: 560, vx: 162, flipRight: true },
                        { texture: 'disco-voador-blindado', width: 92, height: 70, hp: 4, score: 520, vx: 138, flipRight: false },
                        { texture: 'bombardeiro-alienigena-rasante', width: 88, height: 74, hp: 4, score: 560, vx: 152, flipRight: false },
                    ]
                    : [
                        { texture: 'drone-batedor', width: 66, height: 50, hp: 2, score: 200, vx: 156, flipRight: true },
                        { texture: 'disco-voador-classico', width: 76, height: 42, hp: 2, score: 180, vx: 144, flipRight: false },
                        { texture: 'disco-voador-furtivo', width: 82, height: 37, hp: 2, score: 220, vx: 162, flipRight: false },
                        { texture: 'disco-voador-batedor', width: 76, height: 42, hp: 2, score: 200, vx: 148, flipRight: false },
                    ];
                const ship = ships[variant % ships.length] ?? ships[0]!;
                const drone = spawnActor({ ...common, texture: ship.texture, x: Math.max(80, player.x - 430), y: player.y - 220, width: ship.width, height: ship.height, tags: ['enemy', 'target'], kind: 'drone', hp: ship.hp, scoreValue: ship.score, cooldown: 1.1, vx: ship.vx });
                if (ship.flipRight) drone.sx = -1;
            }
            else if (event.kind === 'sensor') spawnActor({ ...common, texture: 'sensor', tags: ['target'], kind: 'sensor', hp: 2, scoreValue: 250, cooldown: 0 });
            else if (event.kind === 'boulder') spawnActor({ ...common, texture: 'boulder', tags: ['hazard'], kind: 'boulder', hp: 1, cooldown: 0, vx: -125, vy: 90 });
            else if (event.kind === 'nest') spawnActor({ ...common, texture: 'nest', tags: ['enemy', 'target'], kind: 'nest', hp: 3, scoreValue: 220, cooldown: 1.7 });
            else if (event.kind === 'spitter') spawnActor({ ...common, texture: 'cuspidor-acido-fixo', width: 60, height: 74, tags: ['enemy', 'target'], kind: 'spitter', hp: 4, scoreValue: 480, cooldown: 1.8 });
        }

        function spawnDueEvents(): void {
            if (extractionStarted || stageOneEvacZone) return;
            if (stage === 1) {
                for (const event of STAGE_ONE_EVENTS) {
                    if (spawnedEvents.has(event.id)) continue;
                    if (event.x < player.x - W * 1.2) { spawnedEvents.add(event.id); continue; }
                    if (event.x <= player.x + W * 0.8) { spawnedEvents.add(event.id); spawnScheduled(event); }
                }
            } else if (stage === 3) {
                for (const event of levelThreeEvents()) {
                    if (spawnedEvents.has(event.id)) continue;
                    if (event.y > player.y + H * 1.3) { spawnedEvents.add(event.id); continue; }
                    if (event.y <= player.y + 120 && event.y >= player.y - H * 1.3) {
                        spawnedEvents.add(event.id);
                        spawnScheduled(event);
                    }
                }
            }
        }

        function warningStep(actor: Actor, dt: number, interval: number, lead = TUNE.bossWarning): boolean {
            if (actor.data.warning > 0) {
                actor.data.warning -= dt;
                actor.tint = Math.floor(run.campaignTime * 12) % 2 ? '#ffffff' : '#ff4d58';
                if (actor.data.warning <= 0) {
                    actor.data.warning = 0;
                    actor.tint = '#ffffff';
                    return true;
                }
                return false;
            }
            actor.data.cooldown -= dt;
            if (actor.data.cooldown <= 0) {
                actor.data.cooldown = interval;
                actor.data.warning = lead;
                game.sound.play('aviso');
                return false;
            }
            return false;
        }

        function fireEnemy(actor: Actor, mode: string): void {
            const angle = Math.atan2(player.y - actor.y, player.x - actor.x);
            playCrewSfx('enemy-plasma', 'disparo', { volume: 0.46, minGapMs: 90 });
            if (mode === 'groundBurst') {
                const horizontal = player.x < actor.x ? Math.PI : 0;
                fireAngle(projectiles, actor, horizontal, { kind: 'burst', count: 3, interval: 0.15, speed: 280, radius: 7, life: 4 }, 1);
            } else if (mode === 'highShot') {
                const aimHigh = Math.atan2(player.y - 14 - actor.y, player.x - actor.x);
                fireAngle(projectiles, actor, aimHigh, { kind: 'aimed', count: 1, speed: 290, radius: 8, life: 5 }, 1);
            } else if (mode === 'ceilingCone') {
                fireAngle(projectiles, actor, Math.PI / 2, { kind: 'fan', count: 3, spread: 0.72, speed: 255, radius: 8, life: 4 }, 1);
            } else if (mode === 'shockSphere') {
                fireAtPlayer(projectiles, actor, player, { kind: 'fan', count: 3, spread: 0.34, speed: 285, radius: 9, life: 5 }, 1);
            } else if (mode === 'bossFan') {
                fireAtPlayer(projectiles, actor, player, { kind: 'fan', count: 5, spread: 0.72, speed: 300, radius: 10, life: 5 }, 1);
            } else {
                fireAngle(projectiles, actor, angle, { kind: 'aimed', count: 1, speed: 310, radius: 8, life: 5 }, 1);
            }
        }

        function spawnAcidGlob(spitter: Actor): void {
            const direction = Math.sign(player.x - spitter.x) || 1;
            playCrewSfx('enemy-plasma', 'disparo', { volume: 0.42, rate: 0.85, minGapMs: 120 });
            spawnActor({ id: `cuspe-acido-${++effectIndex}`, texture: 'esporo-biologico-teleguiado', x: spitter.x, y: spitter.y - 22, width: 28, height: 28, tags: ['enemyProjectile', 'target'], kind: 'acidGlob', vx: direction * 160, vy: -350 });
        }

        function splashAcid(glob: Actor, surfaceY: number): void {
            spawnActor({ id: 'poça-acida', texture: 'acid-splash', x: glob.x, y: surfaceY - 12, width: 88, height: 28, tags: ['hazard'], kind: 'acidSplash', timer: TUNE.acidSplashSeconds });
            burstAt(glob.x, surfaceY - 10, 7, ['#c7ff8a', '#5bff8f', '#26b36d']);
            glob.destroy();
        }

        function spawnBomb(actor: Actor): void {
            const dir = player.x < actor.x ? -1 : 1;
            spawnActor({ id: 'bomba-arqueada', texture: 'bomb', x: actor.x, y: actor.y + 28, width: 26, height: 30, tags: ['enemyProjectile'], kind: 'bossBomb', vx: dir * 145, vy: -300, cooldown: 0 });
        }

        function updateEnemyActors(dt: number): void {
            const enemies = [...game.roster.tagged('enemy') as Iterable<Actor>, ...game.roster.tagged('enemyProjectile') as Iterable<Actor>];
            for (const actor of enemies) {
                if (!actor.alive || !actor.data.active) continue;
                const kind = actor.data.kind;
                if (kind === 'infantry') {
                    if (stage !== 2) {
                        const toward = Math.sign(player.x - actor.x);
                        const previousFoot = actor.y + actor.height / 2;
                        actor.data.vy += TUNE.gravity * dt;
                        actor.y += actor.data.vy * dt;
                        if (Math.abs(player.x - actor.x) > 92) actor.x += toward * 58 * dt;
                        actor.data.face = toward || actor.data.face;
                        let landed = false;
                        for (const platform of groundPlatforms()) {
                            const support = platformBounds(platform);
                            const top = surfaceY(platform);
                            if (actor.data.vy >= 0 && previousFoot <= top + 16 && actor.y + actor.height / 2 >= top && Math.abs(actor.x - support.x) < (support.width + actor.width) / 2) {
                                actor.y = top - actor.height / 2;
                                actor.data.vy = 0;
                                actor.data.grounded = true;
                                landed = true;
                                break;
                            }
                        }
                        if (actor.data.grounded && landed) {
                            const nextX = actor.x + actor.data.face * 34;
                            const ledgeAhead = groundPlatforms().some(platform => {
                                const support = platformBounds(platform);
                                return Math.abs(surfaceY(platform) - (actor.y + actor.height / 2)) < 28 && Math.abs(support.x - nextX) < support.width / 2 + 12;
                            });
                            if (!ledgeAhead && actor.data.cooldown <= 0) {
                                actor.data.vy = -470;
                                actor.data.grounded = false;
                                actor.data.cooldown = 1.35;
                            }
                        }
                        actor.data.cooldown -= dt;
                    }
                    actor.sx = actor.data.face < 0 ? -1 : 1;
                    actor.tint = actor.data.warning > 0 ? '#ffd8d0' : '#ffffff';
                    if (warningStep(actor, dt, 2.75, 0.92)) fireEnemy(actor, 'groundBurst');
                    else if (stage === 1 && run.tutorial.jump && !run.tutorial.duck && actor.data.warning > 0) cue('duck', 'duck');
                } else if (kind === 'runner') {
                    const previousFoot = actor.y + actor.height / 2;
                    actor.data.cooldown -= dt;
                    if (actor.data.phase === 0) {
                        const direction = Math.sign(player.x - actor.x) || actor.data.face;
                        actor.data.face = direction;
                        actor.x += direction * TUNE.runnerSpeed * dt;
                        const support = groundPlatforms().some(platform => {
                            const body = platformBounds(platform);
                            return actor.x + actor.width * 0.35 > body.x - body.width / 2 && actor.x - actor.width * 0.35 < body.x + body.width / 2 && Math.abs(actor.y + actor.height / 2 - surfaceY(platform)) < 20;
                        });
                        if ((!support || Math.abs(player.x - actor.x) < 170) && actor.data.cooldown <= 0) {
                            actor.data.phase = 1;
                            actor.data.timer = 0.36;
                            actor.data.cooldown = 2.6;
                            game.sound.play('aviso', { volume: 0.42 });
                        }
                    } else if (actor.data.phase === 1) {
                        actor.data.timer -= dt;
                        actor.tint = Math.floor(run.campaignTime * 14) % 2 ? '#ffb4c2' : '#ffffff';
                        if (actor.data.timer <= 0) {
                            actor.data.phase = 2;
                            actor.data.vy = -TUNE.runnerJumpSpeed;
                            actor.data.vx = (Math.sign(player.x - actor.x) || actor.data.face) * 138;
                            actor.tint = '#ffffff';
                        }
                    } else {
                        actor.data.vy += TUNE.gravity * 0.82 * dt;
                        actor.x += actor.data.vx * dt;
                        actor.y += actor.data.vy * dt;
                        for (const platform of groundPlatforms()) {
                            const support = platformBounds(platform);
                            const top = surfaceY(platform);
                            if (actor.data.vy >= 0 && previousFoot <= top + 10 && actor.y + actor.height / 2 >= top && Math.abs(actor.x - support.x) < (support.width + actor.width) / 2) {
                                actor.y = top - actor.height / 2;
                                actor.data.vy = 0; actor.data.vx = 0; actor.data.phase = 0;
                                break;
                            }
                        }
                    }
                    actor.sx = actor.data.face < 0 ? -1 : 1;
                    actor.rot = actor.data.phase === 2 ? actor.data.face * 0.22 : Math.sin(run.campaignTime * 11 + actor.data.seed) * 0.08;
                    if (stage === 1 && actor.x < player.x - W) actor.destroy();
                } else if (kind === 'spitter') {
                    actor.sx = player.x < actor.x ? -1 : 1;
                    if (warningStep(actor, dt, 3.4, 1.1)) spawnAcidGlob(actor);
                } else if (kind === 'turret') {
                    actor.sx = player.x < actor.x ? -1 : 1;
                    actor.rot = 0;
                    if (warningStep(actor, dt, 2.7, 0.9)) fireEnemy(actor, 'aimed');
                } else if (kind === 'battery') {
                    actor.sx = player.x < actor.x ? -1 : 1;
                    if (warningStep(actor, dt, 3.8, 1.05)) fireEnemy(actor, actor.id === 'turret-a' ? 'highShot' : 'ceilingCone');
                } else if (kind === 'robotCannon') {
                    if (warningStep(actor, dt, Math.max(1.9, 3.5 - run.room * 0.22), 0.8)) fireEnemy(actor, 'shockSphere');
                } else if (kind === 'drone' || kind === 'capsule') {
                    actor.x += actor.data.vx * dt;
                    actor.y = actor.data.startY + Math.sin(run.campaignTime * 2.6 + actor.data.seed) * 24;
                    if (kind === 'drone' && warningStep(actor, dt, actor.data.maxHp > 2 ? 2.3 : 2.8, 0.75)) {
                        const angle = actor.x < player.x ? Math.PI / 4 : (3 * Math.PI) / 4;
                        playCrewSfx('enemy-plasma', 'disparo', { volume: 0.44, minGapMs: 90 });
                        fireAngle(projectiles, actor, angle, { kind: 'aimed', count: 1, speed: 285, radius: 8, life: 4 }, 1);
                    }
                    if (isCorridor ? actor.x < -100 : actor.x > player.x + W || actor.x < player.x - W) actor.destroy();
                } else if (kind === 'boulder') {
                    actor.x += actor.data.vx * dt;
                    actor.y += actor.data.vy * dt;
                    actor.rot += dt * (actor.data.vx < 0 ? -2.8 : 2.8);
                    const nearby = groundPlatforms().find(platform => {
                        const support = platformBounds(platform);
                        return Math.abs(surfaceY(platform) - actor.y) < 30 && Math.abs(support.x - actor.x) < support.width / 2 + 18;
                    });
                    if (nearby) { actor.y = surfaceY(nearby) - actor.height / 2; actor.data.vy = 0; }
                    if (stage === 1 && actor.x < player.x - W) actor.destroy();
                    if (stage === 3 && actor.y > player.y + H) actor.destroy();
                } else if (kind === 'nest') {
                    if (warningStep(actor, dt, 3.8, 0.9)) fireEnemy(actor, 'shockSphere');
                } else if (kind === 'parasite') {
                    const toward = Math.sign(player.x - actor.x);
                    actor.x += toward * 58 * dt;
                    if (toward !== 0) actor.sx = toward < 0 ? -1 : 1;
                    actor.rot = Math.sin(run.campaignTime * 10 + actor.data.seed) * 0.12;
                    if (actor.x < 72 || actor.x > W - 72) actor.x = Math.max(72, Math.min(W - 72, actor.x));
                } else if (kind === 'bossBomb') {
                    actor.data.vy += 590 * dt;
                    actor.x += actor.data.vx * dt; actor.y += actor.data.vy * dt;
                    const hero = playerBounds(player.data.grounded && player.data.phase === 1);
                    if (boxesOverlap(hero.x, hero.y, hero.width, hero.height, actor.x, actor.y, 26, 30)) {
                        actor.destroy(); hitPlayer('bomba alienígena'); burstAt(actor.x, actor.y, 16);
                    }
                    if (actor.y > H + 100 || actor.x < player.x - 1200 || actor.x > player.x + 1200) actor.destroy();
                } else if (kind === 'acidGlob') {
                    const previousY = actor.y;
                    actor.rot += dt * 4.5;
                    actor.data.vy += 650 * dt;
                    actor.x += actor.data.vx * dt;
                    actor.y += actor.data.vy * dt;
                    const hero = playerBounds(player.data.phase === 1);
                    if (boxesOverlap(hero.x, hero.y, hero.width, hero.height, actor.x, actor.y, actor.width, actor.height)) {
                        hitPlayer('ácido alienígena');
                        burstAt(actor.x, actor.y, 8, ['#c7ff8a', '#5bff8f', '#26b36d']);
                        actor.destroy();
                    } else {
                        let landing: number | null = stage === 1 && actor.y >= LEVEL_ONE_GROUND - 4 ? LEVEL_ONE_GROUND : null;
                        for (const platform of groundPlatforms()) {
                            const support = platformBounds(platform);
                            const top = surfaceY(platform);
                            if (actor.data.vy > 0 && previousY < top && actor.y >= top && Math.abs(actor.x - support.x) < (support.width + actor.width) / 2) { landing = top; break; }
                        }
                        if (landing !== null) splashAcid(actor, landing);
                        if (actor.y > H + 150 || actor.x < player.x - W * 1.5 || actor.x > player.x + W * 1.5) actor.destroy();
                    }
                }
            }
            for (const sensor of game.roster.tagged('target') as Iterable<Actor>) {
                if (sensor.alive && sensor.data.kind === 'sensor') {
                    sensor.data.phase = Math.floor(run.campaignTime * 2) % 2;
                    sensor.setFrame(sensor.data.phase);
                }
            }
        }

        function updateBossAttacks(dt: number): void {
            if (!bossStarted || stageWon || extractionStarted) return;
            refreshBossState();
            const parts = [...game.roster.tagged('bossPart') as Iterable<Actor>].filter(actor => actor.alive);
            for (const actor of parts) {
                const kind = actor.data.kind;
                if (kind === 'bossBattery1' || kind === 'bossBattery2') {
                    if (warningStep(actor, dt, 3.4, 1.05)) fireEnemy(actor, 'bossFan');
                } else if (kind === 'bossLauncher') {
                    if (warningStep(actor, dt, 4.8, 1.1)) spawnBomb(actor);
                } else if (kind === 'bossCore1') {
                    actor.setFrame(Math.floor(run.campaignTime * (actor.data.warning > 0 ? 14 : 3)) % 2);
                    if (warningStep(actor, dt, 2.8, 1.15)) fireEnemy(actor, 'aimed');
                } else if (kind === 'bossCannon') {
                    actor.x = actor.data.startX + Math.sin(run.campaignTime * 1.1 + actor.data.seed) * 112;
                    if (warningStep(actor, dt, 2.9, 0.95)) fireEnemy(actor, 'shockSphere');
                } else if (kind === 'bossEye') {
                    actor.setFrame(Math.floor(run.campaignTime * (actor.data.warning > 0 ? 12 : 2.8)) % 2);
                    if (warningStep(actor, dt, 2.8, 1.15)) fireEnemy(actor, 'bossFan');
                } else if (kind === 'bossMouth') {
                    actor.rot = Math.sin(run.campaignTime * 2.4 + actor.data.seed) * 0.16;
                    if (warningStep(actor, dt, 2.7, 0.95)) {
                        const angle = Math.atan2(player.y - actor.y, player.x - actor.x);
                        playCrewSfx('enemy-plasma', 'disparo', { volume: 0.5, minGapMs: 90 });
                        fireAngle(projectiles, actor, angle, { kind: 'fan', count: 4, spread: 0.56, speed: 240, radius: 10, life: 5 }, 1);
                        const parasites = [...game.roster.tagged('enemy') as Iterable<Actor>].filter(enemy => enemy.data.kind === 'parasite' && enemy.alive).length;
                        if (parasites < 4) spawnActor({ id: `parasita-${++parasiteIndex}`, texture: 'parasita-terrestre-saltador', x: actor.x, y: LEVEL_THREE_FINAL_PLATFORM - 21, width: 38, height: 42, tags: ['enemy', 'target'], kind: 'parasite', hp: 2, scoreValue: 300, cooldown: 0 });
                    }
                } else if (kind === 'bossNode') {
                    if (warningStep(actor, dt, 3.1, 0.9)) fireEnemy(actor, 'shockSphere');
                } else if (kind === 'bossHeart') {
                    const pulse = 1 + Math.sin(run.campaignTime * (actor.data.warning > 0 ? 12 : 3.4)) * 0.035;
                    actor.width = 210 * pulse;
                    actor.height = 280 * pulse;
                    if (warningStep(actor, dt, 2.55, 1.05)) {
                        const angle = Math.atan2(player.y - actor.y, player.x - actor.x);
                        playCrewSfx('enemy-plasma', 'disparo', { volume: 0.55, minGapMs: 90 });
                        fireAngle(projectiles, actor, angle, { kind: 'fan', count: 5, spread: 0.7, speed: 280, radius: 10, life: 5 }, 1);
                    }
                }
            }
        }

        function updatePickups(dt: number): void {
            for (const pickup of game.roster.tagged('pickup') as Iterable<Actor>) {
                if (!pickup.alive) continue;
                pickup.data.timer += dt * 3.4;
                pickup.x = pickup.data.startX + Math.sin(pickup.data.timer) * 18;
                if (!pickup.data.grounded) {
                    pickup.data.vy += 460 * dt;
                    pickup.y += pickup.data.vy * dt;
                    const surface = groundPlatforms().find(platform => {
                        const support = platformBounds(platform);
                        return Math.abs(pickup.x - support.x) < (support.width + pickup.width) / 2 && pickup.y + pickup.height / 2 >= surfaceY(platform) && pickup.y < surfaceY(platform);
                    });
                    if (surface) { pickup.y = surfaceY(surface) - pickup.height / 2; pickup.data.grounded = true; pickup.data.vy = 0; }
                }
                const hero = playerBounds(player.data.phase === 1);
                const hit = boxesOverlap(hero.x, hero.y, hero.width + 18, hero.height, pickup.x, pickup.y, pickup.width + 12, pickup.height + 12);
                if (hit) {
                    if (pickup.data.weapon === 'R') {
                        run.rapidTime = -1;
                    } else {
                        run.weapon = pickup.data.weapon;
                        run.barrierTime = run.weapon === 'B' ? TUNE.barrierSeconds : 0;
                    }
                    game.sound.play('coleta');
                    burstAt(pickup.x, pickup.y, 10, ['#fff3ae', '#55e4f3', '#a9ffff']);
                    award(500);
                    if (stage === 1 && run.tutorial.fire && !run.tutorial.grab) {
                        run.tutorial.grab = true;
                        if (tutorialCue?.action === 'grab') finishCue();
                    }
                    pickup.destroy();
                }
            }
        }

        function handleProjectileEvents(): void {
            for (const event of projectiles.drain()) {
                if (event.kind !== 'hit') continue;
                const target = actorByTargetId(event.target);
                if (!target) continue;
                if (target.data.kind === 'player') hitPlayer('projétil inimigo');
                else damageTarget(target, event.damage);
            }
        }

        function projectileTargets(): Array<{ id: string; team: string; x: number; y: number; r: number; alive: boolean }> {
            return targetActors().map(target => ({
                id: target.data.targetId,
                team: target.data.kind === 'player' ? 'player' : 'enemy',
                x: target.x,
                y: target.data.kind === 'player' && player.data.phase === 1 ? target.y + 8 : target.y,
                r: target.data.kind === 'player' ? (player.data.phase === 1 ? 9 : 13) : Math.max(12, Math.min(target.width, target.height) * 0.37),
                alive: target.alive && target.data.active,
            }));
        }

        function drawProjectiles(): void {
            bulletFx.clear();
            const liveSprites = new Set<number>();
            const flashTint = Math.floor(run.campaignTime * 18) % 2 ? '#ffffff' : '#ffe88a';
            bulletFx.draw(ctx => {
                for (const shot of projectiles.shots) {
                    if (shot.team !== 'player' || (projectileWeapons.get(shot.id)?.weapon ?? run.weapon) !== 'F') continue;
                    const screen = game.world.toScreen(shot.x, shot.y);
                    ctx.save();
                    ctx.translate(screen.x, screen.y);
                    ctx.rotate(shot.rot);
                    ctx.shadowBlur = 9;
                    ctx.shadowColor = '#ff9d2e';
                    ctx.fillStyle = '#ff9d2e';
                    const width = Math.max(shot.r * 2.3, 9);
                    const height = Math.max(shot.r * 1.25, 5);
                    ctx.fillRect(-width / 2, -height / 2, width, height);
                    ctx.fillStyle = '#fff8d6';
                    ctx.fillRect(-width * 0.18, -height * 0.22, width * 0.48, height * 0.42);
                    ctx.restore();
                }
            });
            for (const shot of projectiles.shots) {
                if (shot.team === 'player') {
                    const weapon = projectileWeapons.get(shot.id)?.weapon ?? (shot.r >= 8 ? 'E' : shot.r >= 6 ? 'L' : 'P');
                    if (weapon === 'F') continue;
                    const texture = weapon === 'E' ? 'projetil-tiro-espalhado' : weapon === 'L' ? 'projetil-raio-laser' : 'projetil-tiro-padrao';
                    const size = weapon === 'E' ? { width: 18, height: 18 } : weapon === 'L' ? { width: 44, height: 18 } : { width: 30, height: 12 };
                    let sprite = projectileSprites.get(shot.id);
                    if (!sprite?.alive) {
                        sprite = game.spawn({ id: `projetil-jogador-${shot.id}`, texture, x: shot.x, y: shot.y, ...size, layer: 'front' });
                        projectileSprites.set(shot.id, sprite);
                    }
                    sprite.x = shot.x; sprite.y = shot.y; sprite.rot = shot.rot;
                    liveSprites.add(shot.id);
                } else {
                    const isOrb = shot.r >= 9;
                    const texture = isOrb ? 'esfera-de-plasma-do-chefe' : 'disparo-pesado-de-energia-alienigena';
                    const size = isOrb ? { width: 28, height: 30 } : { width: 34, height: 20 };
                    let sprite = projectileSprites.get(shot.id);
                    if (!sprite?.alive) {
                        sprite = game.spawn({ id: `projetil-inimigo-${shot.id}`, texture, x: shot.x, y: shot.y, ...size, layer: 'front' });
                        projectileSprites.set(shot.id, sprite);
                    }
                    sprite.x = shot.x; sprite.y = shot.y;
                    sprite.rot = isOrb ? run.campaignTime * 5 : shot.rot;
                    sprite.tint = flashTint;
                    liveSprites.add(shot.id);
                }
            }
            for (const [id, sprite] of projectileSprites) {
                if (!liveSprites.has(id)) { if (sprite.alive) sprite.destroy(); projectileSprites.delete(id); }
            }
            for (const [id, entry] of projectileWeapons) if (projectiles.time > entry.expires) projectileWeapons.delete(id);
        }

        function createWeaponVisual(): void {
            gun.visible = stage === 2;
            if (gun.visible) {
                const facingLeft = Math.cos(aim.angle) < -0.1;
                gun.x = player.x + Math.cos(aim.angle) * 24;
                gun.y = player.y - 6 + Math.sin(aim.angle) * 19;
                gun.rot = aim.angle;
                gun.sx = facingLeft ? -1 : 1;
                if (run.weapon === 'E') gun.tint = '#ff6872';
                else if (run.weapon === 'L') gun.tint = '#77f1ff';
                else if (run.weapon === 'F') gun.tint = '#ff9a4b';
                else gun.tint = '#ffffff';
            }
            weaponIcon.texture = WEAPON_PICKUP_TEXTURES[run.weapon];
            const tallIcon = run.weapon === 'E' || run.weapon === 'L';
            weaponIcon.width = tallIcon ? 25 : 32; weaponIcon.height = tallIcon ? 38 : 32;
            shield.visible = run.barrierTime > 0;
            shield.x = player.x; shield.y = player.y - 2;
            shield.alpha = 0.62 + Math.sin(run.campaignTime * 8) * 0.18;
        }

        function updateHeroVisual(dt: number, grounded: boolean, crouched: boolean): void {
            player.data.phase = grounded && crouched ? 1 : 0;
            player.data.collisionBox = grounded && crouched ? PLAYER_BODY.crouched : PLAYER_BODY.standing;
            if (grounded) airTime = 0;
            else airTime += dt;

            if (stage === 2) {
                player.texture = 'orion-back';
                player.width = 60; player.height = 62; player.rot = 0;
            } else if (knockbackTime > 0) {
                player.texture = 'piloto-sobrevivente-em-recuo';
                player.width = 48; player.height = 66; player.rot = 0;
            } else if (crouched && grounded) {
                player.rot = 0;
                if (firePoseTime > 0) {
                    player.texture = 'piloto-sobrevivente-disparando-agachado';
                    player.width = 72; player.height = 46;
                } else {
                    player.texture = 'player-crouch';
                    player.width = 56; player.height = 48;
                }
            } else if (!grounded) {
                if (airTime < 0.1 || player.data.vy > 480) {
                    player.texture = 'player-jump';
                    player.width = 58; player.height = 60; player.rot = 0;
                } else {
                    player.texture = 'soldado-orion-salto-acrobatico';
                    player.width = 52; player.height = 60;
                    player.rot += player.data.face * 12 * dt;
                }
            } else {
                player.rot = 0;
                if (aim.y < -0.25 && Math.abs(aim.x) > 0.25) {
                    player.texture = 'soldado-orion-mirando-diagonal';
                    player.width = 48; player.height = 64;
                } else if (aim.y < -0.7) {
                    player.texture = 'player-aim-up';
                    player.width = 34; player.height = 76;
                } else if (Math.abs(player.data.vx) > 20) {
                    runCycle += dt * 10;
                    const frames = ['player-run-1', 'player-run-2', 'player-run-3'] as const;
                    player.texture = frames[Math.floor(runCycle) % frames.length] ?? 'player-run-1';
                    player.width = 60; player.height = 62;
                    footstepTimer -= dt;
                    if (footstepTimer <= 0) {
                        footstepTimer = 0.26;
                        playCrewSfx('pilot-footstep', undefined, { volume: 0.34, minGapMs: 220 });
                    }
                } else {
                    player.texture = 'player-idle';
                    player.width = 52; player.height = 62;
                    footstepTimer = 0;
                }
            }
            const visualFace = backFirePoseTime > 0 ? -1 : player.data.face;
            player.sx = visualFace < 0 ? -1 : 1;
            createWeaponVisual();
        }

        function updateHazards(dt: number): void {
            for (const hazard of game.roster.tagged('hazard') as Iterable<Actor>) {
                if (!hazard.alive) continue;
                if (hazard.data.kind === 'crater') {
                    hazard.data.timer -= dt;
                    if (hazard.data.timer <= 0) {
                        hazard.data.timer = 1.6;
                        game.particles.burst({ x: hazard.x, y: hazard.y - 14, count: 4, layer: 'front', frame: 'particle:spark', blend: 'add', speed: [22, 64], lifespan: [0.22, 0.52], color: ['#fff6bf', '#ff9d2e', '#ff5a5a'] });
                    }
                } else if (hazard.data.kind === 'acidSplash') {
                    hazard.data.timer -= dt;
                    hazard.setFrame(Math.floor(run.campaignTime * 8) % 2);
                    if (hazard.data.timer <= 0) hazard.destroy();
                }
            }
        }

        function updateEffects(dt: number): void {
            for (const effect of game.roster.tagged('effect') as Iterable<Actor>) {
                if (!effect.alive || effect.data.kind !== 'pixelExplosion') continue;
                effect.data.timer -= dt;
                const progress = Math.max(0, effect.data.timer / Math.max(0.01, effect.data.phase));
                effect.alpha = progress;
                effect.width *= 1 + dt * 1.8;
                effect.height *= 1 + dt * 1.8;
                effect.rot += dt * 0.32;
                if (effect.data.timer <= 0) effect.destroy();
            }
        }

        function updateExplodingBridges(dt: number): void {
            for (const bridge of game.roster.tagged('bridge') as Iterable<Actor>) {
                if (!bridge.alive || bridge.data.phase !== 1) continue;
                bridge.data.timer -= dt;
                bridge.tint = Math.floor(run.campaignTime * 16) % 2 ? '#ff645b' : '#ffffff';
                if (bridge.data.timer <= 0) {
                    bridge.destroy();
                    burstAt(bridge.x, bridge.y, 12, ['#fff0ae', '#ff793f', '#bd3d42']);
                    playCrewSfx('ship-explosion', 'explosao', { volume: 0.72 });
                    if (playerPlatform?.id === bridge.id) {
                        playerPlatform = null;
                        player.data.grounded = false;
                        player.data.vy = 36;
                    }
                }
            }
        }

        function updateHeroPhysics(dt: number, moveX: number, jumpPressed: boolean, dropHeld: boolean): { grounded: boolean; crouched: boolean } {
            const previousY = player.y;
            const wasGrounded = player.data.grounded;
            const wasCrouched = wasGrounded && player.data.phase === 1;
            let crouched = wasGrounded && dropHeld && !jumpPressed;
            const previousBody = wasCrouched ? PLAYER_BODY.crouched : PLAYER_BODY.standing;
            const currentBody = crouched ? PLAYER_BODY.crouched : PLAYER_BODY.standing;
            const footBefore = previousY + previousBody.offsetY + previousBody.height / 2;
            const headBefore = previousY + previousBody.offsetY - previousBody.height / 2;
            const platforms = groundPlatforms();

            if (wasGrounded && wasCrouched !== crouched) {
                const previousFootOffset = previousBody.offsetY + previousBody.height / 2;
                const currentFootOffset = currentBody.offsetY + currentBody.height / 2;
                player.y += previousFootOffset - currentFootOffset;
            }
            player.data.collisionBox = currentBody;

            if (jumpPressed) jumpBuffer = TUNE.jumpBuffer;
            else jumpBuffer = Math.max(0, jumpBuffer - dt);
            ignorePlatformTime = Math.max(0, ignorePlatformTime - dt);
            if (wasGrounded) coyoteTime = TUNE.coyote;
            else coyoteTime = Math.max(0, coyoteTime - dt);

            if (jumpPressed && dropHeld && wasGrounded && playerPlatform?.data.oneWay) {
                ignorePlatformId = playerPlatform.id;
                ignorePlatformTime = 0.36;
                player.y += 28;
                player.data.vy = 115;
                player.data.grounded = false;
                playerPlatform = null;
                jumpBuffer = 0;
            } else {
                player.data.vx = moveX * (wasGrounded ? TUNE.runSpeed : TUNE.airSpeed);
                player.x += player.data.vx * dt;
                if (Math.abs(moveX) > 0.08) player.data.face = moveX < 0 ? -1 : 1;
                player.data.grounded = false;
                if (jumpBuffer > 0 && (wasGrounded || coyoteTime > 0)) {
                    player.data.vy = -TUNE.jumpSpeed;
                    player.data.grounded = false;
                    jumpBuffer = 0;
                    coyoteTime = 0;
                    playerPlatform = null;
                    playCrewSfx('pilot-jump', 'salto', { volume: 0.72 });
                }
                player.data.vy += TUNE.gravity * dt;
                player.y += player.data.vy * dt;
                const currentFootOffset = currentBody.offsetY + currentBody.height / 2;
                const currentHeadOffset = currentBody.offsetY - currentBody.height / 2;
                const footNow = player.y + currentFootOffset;
                for (const platform of platforms) {
                    if (!platform.alive || (ignorePlatformTime > 0 && platform.id === ignorePlatformId)) continue;
                    const support = platformBounds(platform);
                    const top = support.y - support.height / 2;
                    const hero = playerBounds(crouched);
                    const overlapsX = hero.x + hero.width / 2 > support.x - support.width / 2 && hero.x - hero.width / 2 < support.x + support.width / 2;
                    if (!overlapsX) continue;
                    const supports = platform.data.oneWay || platform.data.kind === 'ground';
                    if (supports && player.data.vy >= 0 && footBefore <= top + 16 && footNow >= top) {
                        player.y = top - currentFootOffset;
                        player.data.vy = 0;
                        player.data.grounded = true;
                        playerPlatform = platform;
                        crouched = dropHeld;
                        if (platform.data.kind === 'bridge' && platform.data.phase === 0) {
                            platform.data.phase = 1;
                            platform.data.timer = 1.15;
                            game.sound.play('aviso');
                        }
                        break;
                    }
                    if (wasGrounded && supports && !platform.data.oneWay && footNow > top && footNow - top < 26) {
                        player.y = top - currentFootOffset;
                        player.data.vy = 0;
                        player.data.grounded = true;
                        playerPlatform = platform;
                    }
                    if (!platform.data.oneWay && player.data.vy < 0) {
                        const underside = support.y - support.height / 2;
                        const headNow = player.y + currentHeadOffset;
                        if (headBefore >= underside && headNow <= underside) { player.y = underside - currentHeadOffset; player.data.vy = 0; }
                    }
                }
                if (!player.data.grounded) playerPlatform = null;
            }

            if (player.data.grounded && dropHeld && !jumpPressed) crouched = true;
            if (stage === 1) {
                const maxScrollLeft = LEVEL_ONE_BUNKER_X - W * 0.72;
                if (!stageOneEvacZone && !stageWon) {
                    scrollLeft += TUNE.autoScrollSpeed * dt;
                    if (player.x > scrollLeft + W * 0.48) scrollLeft = Math.max(scrollLeft, player.x - W * 0.48);
                    scrollLeft = Math.min(scrollLeft, maxScrollLeft);
                }
                game.camera.x = scrollLeft + W / 2;
                game.camera.y = H / 2;
                player.x = Math.min(LEVEL_ONE_BUNKER_X + 60, player.x);
                if (!stageOneEvacZone && (player.x >= LEVEL_ONE_BUNKER_X - 640 || scrollLeft >= maxScrollLeft - 40)) {
                    enterStageOneEvacZone();
                }
                if (stageOneEvacZone) {
                    player.x = Math.max(scrollLeft + currentBody.width / 2 + 12, Math.min(LEVEL_ONE_BUNKER_X + 60, player.x));
                    const bunker = game.roster.byId('modulo-bunker-fase1') as Actor | null;
                    const hero = playerBounds(crouched);
                    if (bunker?.alive && boxesOverlap(hero.x, hero.y, hero.width, hero.height, bunker.x, bunker.y + 12, bunker.width * 0.82, bunker.height)) {
                        completeStageOneBunker();
                    }
                } else if (player.x - currentBody.width / 2 <= scrollLeft + 8) {
                    captureByLeftEdge();
                }
                if (!runEnded && !stageWon && player.y > H + 100) hitPlayer('queda em rio profundo', true);
            } else if (stage === 3) {
                player.x = Math.max(currentBody.width / 2 + TUNE.stageThreeEdgePadding, Math.min(W - currentBody.width / 2 - TUNE.stageThreeEdgePadding, player.x));
                if (cameraTarget) {
                    cameraTarget.x = player.x;
                    cameraTarget.y = Math.min(cameraTarget.y, player.y);
                    if (!bossStarted && !extractionStarted && player.y <= LEVEL_THREE_BOSS_Y + 430) spawnBoss();
                }
                if (player.y > (cameraTarget?.y ?? player.y) + H * 0.86 || player.y > LEVEL_THREE_HEIGHT + 100) hitPlayer('queda da cachoeira', true);
            } else {
                player.x = Math.max(130, Math.min(W - 130, player.x));
            }

            if (cameraTarget && stage === 1) cameraTarget.x = Math.max(cameraTarget.x, player.x);
            return { grounded: player.data.grounded, crouched };
        }

        function updateCorridorPlayer(dt: number, moveX: number, jumpPressed: boolean, dropHeld: boolean): { grounded: boolean; crouched: boolean } {
            const wasGrounded = player.data.grounded;
            const wasCrouched = wasGrounded && player.data.phase === 1;
            let crouched = wasGrounded && dropHeld && !jumpPressed;
            const previousBody = wasCrouched ? PLAYER_BODY.crouched : PLAYER_BODY.standing;
            const currentBody = crouched ? PLAYER_BODY.crouched : PLAYER_BODY.standing;
            const previousFootOffset = previousBody.offsetY + previousBody.height / 2;
            const currentFootOffset = currentBody.offsetY + currentBody.height / 2;
            if (wasGrounded && wasCrouched !== crouched) player.y += previousFootOffset - currentFootOffset;
            player.data.collisionBox = currentBody;
            player.x += moveX * TUNE.corridorSpeed * dt;
            player.x = Math.max(150, Math.min(W - 150, player.x));
            if (Math.abs(moveX) > 0.08) player.data.face = moveX < 0 ? -1 : 1;
            if (jumpPressed) jumpBuffer = TUNE.jumpBuffer;
            else jumpBuffer = Math.max(0, jumpBuffer - dt);
            if (wasGrounded) coyoteTime = TUNE.coyote;
            else coyoteTime = Math.max(0, coyoteTime - dt);
            player.data.grounded = false;
            const floor = H - 120;
            if (jumpBuffer > 0 && (wasGrounded || coyoteTime > 0)) {
                player.data.vy = -TUNE.jumpSpeed;
                jumpBuffer = 0; coyoteTime = 0;
                playCrewSfx('pilot-jump', 'salto', { volume: 0.72 });
            }
            player.data.vy += TUNE.gravity * dt;
            player.y += player.data.vy * dt;
            if (player.y + currentFootOffset >= floor && player.data.vy >= 0) {
                player.y = floor - currentFootOffset;
                player.data.vy = 0;
                player.data.grounded = true;
            }
            if (dropHeld && player.data.grounded && !jumpPressed) crouched = true;
            return { grounded: player.data.grounded, crouched };
        }

        function updateCorridorBeam(dt: number, crouched: boolean, grounded: boolean): void {
            const beam = [...game.roster.tagged('actor') as Iterable<Actor>].find(actor => actor.data.kind === 'corridorBeam');
            if (!beam || roomTransition) return;
            if (corridorBeamActive > 0) {
                corridorBeamActive = Math.max(0, corridorBeamActive - dt);
                beam.visible = true;
                beam.alpha = 0.85 + Math.sin(run.campaignTime * 30) * 0.1;
                const hero = playerBounds(crouched);
                if (boxesOverlap(hero.x, hero.y, hero.width, hero.height, beam.x, beam.y, W, 18)) {
                    if (corridorBeamHigh ? crouched : !grounded) return;
                    hitPlayer('feixe elétrico');
                }
                if (corridorBeamActive <= 0) { beam.visible = false; corridorBeamCooldown = 5.8; }
            } else if (corridorBeamWarning > 0) {
                corridorBeamWarning = Math.max(0, corridorBeamWarning - dt);
                beam.visible = true;
                beam.alpha = 0.25 + Math.sin(run.campaignTime * 23) * 0.18;
                if (corridorBeamWarning <= 0) {
                    corridorBeamActive = 1.15;
                    beam.visible = true;
                    beam.alpha = 0.95;
                    game.sound.play('aviso');
                }
            } else {
                corridorBeamCooldown -= dt;
                if (corridorBeamCooldown <= 0) {
                    corridorBeamWarning = 0.92;
                    corridorBeamHigh = run.room % 2 === 0;
                    beam.y = H - (corridorBeamHigh ? 178 : 132);
                    statusLabel.text = corridorBeamHigh ? 'FEIXE ALTO  •  AGACHE-SE' : 'FEIXE BAIXO  •  SALTE';
                    game.sound.play('aviso');
                }
            }
        }

        function updateStageBossEvents(dt: number, crouched: boolean, grounded: boolean): void {
            if (stage === 3 && bossStarted && !extractionStarted) {
                const filament = [...game.roster.tagged('actor') as Iterable<Actor>].find(actor => actor.data.kind === 'filament');
                if (filament) {
                    if (filament.data.warning > 0) {
                        filament.data.warning -= dt;
                        filament.visible = true;
                        filament.alpha = 0.3 + Math.sin(run.campaignTime * 22) * 0.2;
                        if (filament.data.warning <= 0) {
                            filament.data.warning = 0;
                            filament.data.timer = 1.2;
                            filament.alpha = 0.95;
                            game.sound.play('aviso');
                        }
                    } else if (filament.data.timer > 0) {
                        filament.data.timer -= dt;
                        filament.visible = true;
                        filament.alpha = 0.9 + Math.sin(run.campaignTime * 32) * 0.1;
                        const hero = playerBounds(crouched);
                        if (boxesOverlap(hero.x, hero.y, hero.width, hero.height, filament.x, filament.y, filament.width, filament.height)) {
                            if (grounded) hitPlayer('filamento luminoso');
                        }
                        if (filament.data.timer <= 0) { filament.visible = false; filament.data.cooldown = 5.4; }
                    } else {
                        filament.data.cooldown -= dt;
                        if (filament.data.cooldown <= 0) {
                            filament.data.warning = 0.95;
                            statusLabel.text = 'FILAMENTOS CARREGANDO  •  PREPARE-SE PARA SALTAR';
                            game.sound.play('aviso');
                        }
                    }
                }
            }
        }

        function collideBodies(crouched: boolean): void {
            const hero = playerBounds(crouched);
            for (const enemy of game.roster.tagged('enemy') as Iterable<Actor>) {
                if (!enemy.alive || enemy.data.kind === 'robotCannon' || enemy.data.kind === 'bossCannon') continue;
                if (!boxesOverlap(hero.x, hero.y, hero.width, hero.height, enemy.x, enemy.y, enemy.width, enemy.height)) continue;
                if (run.barrierTime > 0 && !enemy.data.kind.startsWith('boss')) {
                    enemy.destroy(); onActorDestroyed(enemy);
                } else {
                    hitPlayer(enemy.data.kind === 'boulder' ? 'pedra rolante' : 'contato');
                }
            }
            for (const hazard of game.roster.tagged('hazard') as Iterable<Actor>) {
                if (hazard.alive && boxesOverlap(hero.x, hero.y, hero.width, hero.height, hazard.x, hazard.y, hazard.width, hazard.height)) {
                    const cause = hazard.data.kind === 'acidSplash' ? 'ácido alienígena' : hazard.data.kind === 'crater' ? 'cratera incandescente' : 'raiz pontiaguda';
                    hitPlayer(cause);
                }
            }
        }

        function updateCorridorRoomState(): void {
            if (stage !== 2 || run.room < 1 || run.room > 5 || !corridorGate) return;
            const cannonsAlive = [...game.roster.tagged('roomTarget') as Iterable<Actor>].some(actor => actor.alive && actor.data.kind === 'robotCannon');
            corridorGate.data.active = !cannonsAlive;
            if (!cannonsAlive && corridorGate.visible) statusLabel.text = 'BARREIRA EXPOSTA  •  DISPARA PARA ABRIR A PASSAGEM';
        }

        function syncHud(): void {
            livesLabel.text = `× ${run.lives}${run.infiniteLives ? '  ∞' : ''}`;
            lifeIcons.forEach((icon, index) => { icon.visible = index < Math.min(3, run.lives); });
            scoreLabel.text = `PONTOS  ${run.score.toLocaleString('pt-BR')}`;
            weaponLabel.text = `${WEAPON_NAMES[run.weapon]}${run.barrierTime > 0 ? `  ${run.barrierTime.toFixed(1)}s` : run.rapidTime !== 0 ? '  RAJADA RÁPIDA' : ''}`;
            chapterLabel.text = stage === 2 ? `FASE 2  •  SALA ${Math.max(1, run.room)} / 5` : `FASE ${stage}  •  ${STAGE_NAMES[stage - 1].toLocaleUpperCase('pt-BR')}`;
            const width = game.screen.width, height = game.screen.height;
            livesLabel.x = 104; livesLabel.y = 17;
            scoreLabel.x = 24; scoreLabel.y = 51;
            weaponIcon.x = 302; weaponIcon.y = 48;
            weaponLabel.x = 326; weaponLabel.y = 32;
            chapterLabel.x = width / 2; chapterLabel.y = 20;
            statusLabel.x = width / 2; statusLabel.y = height - 50;
            bossNameLabel.x = width / 2; bossNameLabel.y = 52;
            if (bossBar && !stageWon) bossBar.width = Math.min(440, width * 0.4);
        }

        function finishDebugRequests(): void {
            if (run.debugLoseQueued) {
                run.debugLoseQueued = false;
                hitPlayer('teste de perda', true);
            }
            if (run.debugWinQueued) {
                run.debugWinQueued = false;
                if (!bossStarted) spawnBoss();
                for (const part of game.roster.tagged('bossPart') as Iterable<Actor>) {
                    if (!part.alive) continue;
                    part.destroy(); run.bossParts++; award(part.data.scoreValue);
                }
                finishStage();
            }
        }

        if (stage === 1 && (run.debugBunkerStart || run.debugBossStart)) {
            run.debugBunkerStart = false;
            run.debugBossStart = false;
            enterStageOneEvacZone();
        } else if (stage === 2) {
            if (run.debugBossStart) spawnBoss();
            else startCorridorRoom(Math.max(1, run.room || 1));
        } else if (stage === 3 && run.debugBunkerStart) {
            run.debugBunkerStart = false;
            player.x = 640; player.y = groundedCenter(540); player.data.grounded = true; player.data.collisionBox = PLAYER_BODY.standing;
            if (cameraTarget) { cameraTarget.x = player.x; cameraTarget.y = player.y; game.camera.x = player.x + game.rig.offset.x; game.camera.y = player.y + game.rig.offset.y; }
            beginExtraction();
        } else if (run.debugBossStart) {
            spawnBoss();
        }

        if (stage === 1 && !stageOneEvacZone) {
            cue('move', 'move');
            statusLabel.text = 'AVANCE SEMPRE À DIREITA  •  Q / SHIFT ATIRA PARA TRÁS';
        }

        game.step('play', dt => {
            if (runEnded || !player.alive) return;
            persistMuteSetting();
            run.campaignTime += dt;
            if (rotate()) { syncHud(); return; }
            if (game.controls.justPressed('pause')) { game.scenes.push('pause'); return; }
            if (stageWon) { syncHud(); return; }

            run.invulnTime = Math.max(0, run.invulnTime - dt);
            firePoseTime = Math.max(0, firePoseTime - dt);
            backFirePoseTime = Math.max(0, backFirePoseTime - dt);
            knockbackTime = Math.max(0, knockbackTime - dt);
            if (run.barrierTime > 0) {
                run.barrierTime = Math.max(0, run.barrierTime - dt);
                if (run.barrierTime === 0) {
                    playCrewSfx('shield-damage', 'barreira', { volume: 0.75 });
                    if (run.weapon === 'B') run.weapon = 'P';
                }
            }
            if (run.rapidTime > 0) run.rapidTime = Math.max(0, run.rapidTime - dt);
            swipeDuckTime = Math.max(0, swipeDuckTime - dt);
            if (swiped() === 'down') swipeDuckTime = 0.24;

            const move = game.controls.axis('move');
            const aimAxis = game.controls.axis('aim');
            const jumpPressed = game.controls.justPressed('jump');
            const fireBackHeld = !isCorridor && game.controls.pressed('fireBack');
            const dropHeld = move.y > 0.55 || swipeDuckTime > 0;
            const crouchedBefore = player.data.grounded && dropHeld && !jumpPressed;
            const aimInput = Math.hypot(move.x, move.y) > 0.18 ? move : Math.hypot(aimAxis.x, aimAxis.y) > 0.22 ? aimAxis : { x: 0, y: 0 };
            if (fireBackHeld) {
                backFirePoseTime = 0.16;
                if (aimInput.y < -0.25) aim = { x: -Math.SQRT1_2, y: -Math.SQRT1_2, angle: (-3 * Math.PI) / 4 };
                else aim = { x: -1, y: 0, angle: Math.PI };
            } else if (crouchedBefore) aim = { x: player.data.face, y: 0, angle: player.data.face > 0 ? 0 : Math.PI };
            else if (stage === 2 && Math.hypot(aimInput.x, aimInput.y) < 0.18) aim = { x: 0, y: -1, angle: -Math.PI / 2 };
            else aim = quantizeAim(aimInput.x, aimInput.y);

            const movement = isCorridor
                ? updateCorridorPlayer(dt, move.x, jumpPressed, dropHeld)
                : updateHeroPhysics(dt, move.x, jumpPressed, dropHeld);
            if (runEnded) return;
            updateDistanceScore();
            updateExtraction(dt);
            if (extractionSequence) {
                updateHeroVisual(dt, movement.grounded, movement.crouched);
                syncHud();
                return;
            }
            if (tutorialCue?.action === 'move' && Math.abs(move.x) > 0.18) finishCue();
            if (tutorialCue?.action === 'duck' && movement.crouched) finishCue();
            if (tutorialCue?.action === 'jump' && jumpPressed) finishCue();
            if (tutorialCue?.action === 'aim' && aimInput.x > 0.2 && aimInput.y < -0.2) finishCue();
            updateExplodingBridges(dt);
            updateHeroVisual(dt, movement.grounded, movement.crouched);
            spawnDueEvents();
            updateLeftHunters(dt);
            updateCorridorRoomState();
            updateEnemyActors(dt);
            if (runEnded) return;
            updateHazards(dt);
            if (runEnded) return;
            updateEffects(dt);
            updateBossAttacks(dt);
            if (runEnded) return;
            updatePickups(dt);
            updateStageBossEvents(dt, movement.crouched, movement.grounded);
            if (runEnded) return;
            if (!isCorridor) collideBodies(movement.crouched);
            else {
                updateCorridorBeam(dt, movement.crouched, movement.grounded);
            }
            if (runEnded) return;

            player.data.cooldown = Math.max(0, player.data.cooldown - dt);
            if ((game.controls.pressed('fire') || fireBackHeld) && player.data.cooldown <= 0) {
                fire();
                player.data.cooldown = FIRE_INTERVALS[run.weapon] * (run.rapidTime !== 0 ? 0.46 : 1);
            }

            if (stage === 1 && !tutorialCue && !tutorialIcon) {
                if (!run.tutorial.move) cue('move', 'move');
                else if (!run.tutorial.jump && player.x > 650 && player.x < 1_200) cue('jump', 'jump');
                else if (run.tutorial.jump && !run.tutorial.duck && player.x > 1_850 && player.x < 2_700) cue('duck', 'duck');
                else if (run.tutorial.duck && !run.tutorial.aim && player.x > 2_650 && player.x < 3_500) cue('aim', 'aim');
                else if (run.tutorial.aim && !run.tutorial.fire && player.x > 3_200 && player.x < 4_100) cue('fire', 'fire');
            }
            if (tutorialCue && tutorialIcon?.alive) {
                tutorialIcon.x = player.x + player.data.face * 54;
                tutorialIcon.y = player.y - 54;
                tutorialIcon.alpha = 0.88 + Math.sin(run.campaignTime * 8) * 0.12;
            } else if (tutorialFade > 0 && tutorialIcon?.alive) {
                tutorialFade = Math.max(0, tutorialFade - dt);
                tutorialIcon.alpha = tutorialFade / 0.35;
                if (tutorialFade <= 0) { tutorialIcon.destroy(); tutorialIcon = null; }
            }

            const targets = projectileTargets();
            projectiles.tick(dt, targets, [], 14);
            handleProjectileEvents();
            if (runEnded) return;
            drawProjectiles();
            drawLeftEdgeWarning();
            if (player.alive) {
                if (run.invulnTime > 0) player.alpha = Math.floor(run.campaignTime * 16) % 2 ? 0.35 : 1;
                else player.alpha = 1;
            }
            if (run.barrierTime > 0) shield.visible = true;
            finishDebugRequests();
            syncHud();
        }, { before: 'rig-follow.camera' });
    },
    exit(): void {
        stopPlayGestures?.();
        stopPlayGestures = null;
    },
};
