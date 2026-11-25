import { game } from './engine.js';
import { spawnActor, type Actor } from './actors.js';
import { run, type WeaponPickup } from './state.js';

export const LANDSCAPE = { width: 1280, height: 720 };
export const LEVEL_ONE_LENGTH = 32_000;
export const LEVEL_ONE_BOSS_X = 30_100;
export const LEVEL_ONE_BUNKER_X = 30_420;
export const LEVEL_ONE_GROUND = 620;
export const LEVEL_THREE_HEIGHT = 14_500;
export const LEVEL_THREE_PLATFORM_COUNT = 90;
export const LEVEL_THREE_GROUND = LEVEL_THREE_HEIGHT - 150;
export const LEVEL_THREE_FINAL_PLATFORM = LEVEL_THREE_GROUND - (LEVEL_THREE_PLATFORM_COUNT - 1) * 145;
export const LEVEL_THREE_BOSS_Y = 1_300;

export type StageEvent = {
    id: string;
    x: number;
    y: number;
    kind: 'infantry' | 'runner' | 'turret' | 'battery' | 'capsule' | 'drone' | 'sensor' | 'boulder' | 'nest' | 'spitter';
    weapon: WeaponPickup;
};

export const STAGE_ONE_EVENTS: StageEvent[] = [
    { id: 'turret-a', x: 2300, y: LEVEL_ONE_GROUND - 52, kind: 'battery', weapon: 'E' },
    { id: 'soldier-a', x: 3800, y: 489, kind: 'infantry', weapon: 'M' },
    { id: 'capsule-a', x: 4400, y: 365, kind: 'capsule', weapon: 'E' },
    { id: 'soldier-b', x: 5200, y: LEVEL_ONE_GROUND - 31, kind: 'infantry', weapon: 'L' },
    { id: 'battery-a', x: 4700, y: LEVEL_ONE_GROUND - 52, kind: 'battery', weapon: 'L' },
    { id: 'sensor-a', x: 5650, y: 574, kind: 'sensor', weapon: 'M' },
    { id: 'runner-a', x: 6400, y: LEVEL_ONE_GROUND - 30, kind: 'runner', weapon: 'R' },
    { id: 'turret-b', x: 7380, y: 594, kind: 'turret', weapon: 'R' },
    { id: 'drone-b', x: 8240, y: 345, kind: 'drone', weapon: 'R' },
    { id: 'capsule-b', x: 9800, y: 352, kind: 'capsule', weapon: 'R' },
    { id: 'soldier-c', x: 8680, y: LEVEL_ONE_GROUND - 31, kind: 'infantry', weapon: 'F' },
    { id: 'boulder-a', x: 9400, y: 500, kind: 'boulder', weapon: 'F' },
    { id: 'battery-b', x: 10_450, y: LEVEL_ONE_GROUND - 52, kind: 'battery', weapon: 'F' },
    { id: 'sensor-b', x: 11_300, y: 462, kind: 'sensor', weapon: 'B' },
    { id: 'spitter-a', x: 12_100, y: 580, kind: 'spitter', weapon: 'B' },
    { id: 'turret-c', x: 13_700, y: 594, kind: 'turret', weapon: 'E' },
    { id: 'drone-c', x: 14_700, y: 340, kind: 'drone', weapon: 'B' },
    { id: 'soldier-d', x: 15_100, y: LEVEL_ONE_GROUND - 31, kind: 'infantry', weapon: 'E' },
    { id: 'battery-c', x: 16_800, y: LEVEL_ONE_GROUND - 52, kind: 'battery', weapon: 'M' },
    { id: 'boulder-b', x: 18_100, y: 470, kind: 'boulder', weapon: 'L' },
    { id: 'sensor-c', x: 19_100, y: 574, kind: 'sensor', weapon: 'L' },
    { id: 'runner-b', x: 20_150, y: LEVEL_ONE_GROUND - 30, kind: 'runner', weapon: 'R' },
    { id: 'turret-d', x: 21_300, y: 594, kind: 'turret', weapon: 'F' },
    { id: 'drone-d', x: 22_300, y: 350, kind: 'drone', weapon: 'E' },
    { id: 'capsule-c', x: 24_100, y: 360, kind: 'capsule', weapon: 'L' },
    { id: 'battery-d', x: 23_550, y: LEVEL_ONE_GROUND - 52, kind: 'battery', weapon: 'E' },
    { id: 'soldier-e', x: 24_400, y: LEVEL_ONE_GROUND - 31, kind: 'infantry', weapon: 'B' },
    { id: 'boulder-c', x: 25_300, y: 470, kind: 'boulder', weapon: 'L' },
    { id: 'sensor-d', x: 26_250, y: 574, kind: 'sensor', weapon: 'R' },
    { id: 'spitter-b', x: 26_900, y: 580, kind: 'spitter', weapon: 'M' },
    { id: 'runner-c', x: 27_400, y: LEVEL_ONE_GROUND - 30, kind: 'runner', weapon: 'M' },
    { id: 'turret-e', x: 28_250, y: 594, kind: 'turret', weapon: 'E' },
];

const STAGE_THREE_EVENTS: StageEvent[] = Array.from({ length: 28 }, (_, index) => {
    const step = 6 + index * 3;
    const top = LEVEL_THREE_GROUND - step * 145;
    const xPositions = [780, 1000, 780, 520, 280, 520, 780, 1000, 780, 520, 280, 520];
    const x = xPositions[index % xPositions.length] ?? 520;
    const kind = index % 9 === 0 ? (index === 0 ? 'capsule' : 'drone') : index % 7 === 0 ? 'boulder' : index % 6 === 0 ? 'spitter' : index % 4 === 0 ? 'nest' : index % 3 === 0 ? 'sensor' : index % 2 === 0 ? 'runner' : 'infantry';
    const weapon: WeaponPickup = (['E', 'B', 'L', 'R', 'F', 'M'] as WeaponPickup[])[index % 6] ?? 'E';
    return { id: `cume-${index + 1}`, x, y: top - (kind === 'boulder' ? 240 : 34), kind, weapon };
});

const WATER_GAPS: Array<[number, number]> = [
    [1280, 1460], [3860, 4100], [6700, 6960], [9780, 10_020], [13_150, 13_400],
    [16_200, 16_500], [19_900, 20_160], [22_950, 23_210], [26_700, 26_950],
];

export function levelThreeEvents(): StageEvent[] { return STAGE_THREE_EVENTS; }

export function buildJungleWorld(): void {
    game.background.gradient('#0a0a1f', '#ff9d2e');
    const panels = Math.ceil(LEVEL_ONE_LENGTH / 1280);
    for (let i = 0; i < panels; i++) {
        spawnActor({ id: `selva-fundo-${i}`, texture: 'background-alien-jungle-surface', x: i * 1280 + 640, y: 360, width: 1280, height: 720, layer: 'back', kind: 'background' });
    }
    for (let x = 100, tileIndex = 0; x < LEVEL_ONE_LENGTH; x += 128, tileIndex++) {
        if (insideGap(x)) continue;
        spawnActor({
            id: `chao-${x}`, texture: 'jungle-ground-tiles-top', x: x + 64, y: LEVEL_ONE_GROUND + 34,
            width: 128, height: 84, tags: ['platform', 'solidPlatform'], kind: 'ground',
            collisionBox: { width: 128, height: 10, offsetX: 0, offsetY: -29 },
        });
        const fillTex = tileIndex % 3 === 1 ? 'jungle-ground-tiles-crystal' : 'jungle-ground-tiles-fill';
        spawnActor({
            id: `subsolo-${x}`, texture: fillTex, x: x + 64, y: LEVEL_ONE_GROUND + 88,
            width: 128, height: 72, layer: 'world', kind: 'groundFill',
        });
    }
    for (const [start, end] of WATER_GAPS) {
        const tileW = 72;
        for (let wx = start - 36; wx < end + 36; wx += tileW) {
            spawnActor({ id: `mar-sup-${start}-${wx}`, texture: 'mar-superficie', x: wx + tileW / 2, y: LEVEL_ONE_GROUND + 34, width: tileW, height: 70, layer: 'back', kind: 'water' });
            spawnActor({ id: `mar-prof-${start}-${wx}`, texture: 'mar-profundo', x: wx + tileW / 2, y: LEVEL_ONE_GROUND + 96, width: tileW, height: 68, layer: 'back', kind: 'water' });
        }
        if (start === WATER_GAPS[0]?.[0] || start === WATER_GAPS[3]?.[0] || start === WATER_GAPS[6]?.[0]) {
            addPlatform(`tronco-${start}`, 'log', (start + end) / 2, LEVEL_ONE_GROUND - 90, end - start + 20, 28, 'log', true);
        }
    }
    for (const x of [3980, 13_275, 23_080, 26_800]) {
        addPlatform(`ponte-${x}`, 'metal-stone-bridge', x, LEVEL_ONE_GROUND - 14, 244, 48, 'bridge', true);
    }
    for (const [x, top, width] of [
        [5900, 487, 210], [6100, 445, 180], [14_950, 482, 230], [15_240, 436, 180],
        [20_700, 494, 190], [21_010, 450, 180], [27_150, 480, 210],
    ]) {
        addPlatform(`grade-${x}`, 'iron-grid', x, top, width, 24, 'grid', true);
    }
    for (const x of [3050, 3800, 8350, 14_450, 22_050]) {
        addPlatform(`rocha-${x}`, 'jungle-ground-tiles-platform', x, 520, 196, 86, 'ledge', true);
    }
    const pod = spawnActor({ id: 'capsula-ejecao-queda', texture: 'capsula-de-ejecao-atmosferica', x: 335, y: LEVEL_ONE_GROUND - 40, width: 132, height: 86, layer: 'world', kind: 'wreckage' });
    pod.rot = 0.22;
    spawnActor({ id: 'destrocos-caca-queda', texture: 'destrocos-do-caca-abatido', x: 610, y: LEVEL_ONE_GROUND - 78, width: 340, height: 164, layer: 'world', kind: 'wreckage' });
    const wreckTop = addPlatform('destrocos-caca-piso', 'white', 610, LEVEL_ONE_GROUND - 160, 220, 18, 'wreckPlatform', true); wreckTop.visible = false;
    const crashDebris: Array<[string, number, number, number]> = [
        ['burning-cockpit-fragment', 455, 56, 48],
        ['burning-wingtip-fragment', 775, 48, 52],
        ['burning-thruster-nozzle', 1085, 50, 42],
        ['burning-stabilizer-fin', 1660, 46, 52],
        ['burning-cockpit-frame', 2040, 52, 44],
        ['burning-armor-plate', 3450, 50, 46],
        ['burning-engine-cowling', 4620, 54, 46],
        ['burning-metal-strut', 6240, 52, 42],
        ['burning-hull-plating', 7820, 48, 46],
        ['burning-metal-frame', 9220, 46, 46],
        ['burning-intake-vent', 10_850, 48, 44],
        ['burning-fuel-casing', 12_650, 48, 46],
        ['burning-fuselage-fragment', 15_600, 52, 46],
        ['burning-cannon-barrel', 18_450, 50, 46],
        ['burning-bulkhead-plate', 21_650, 48, 46],
        ['burning-wreckage-shard', 25_400, 46, 46],
    ];
    for (const [texture, dx, dw, dh] of crashDebris) {
        spawnActor({ id: `destroco-${texture}`, texture, x: dx, y: LEVEL_ONE_GROUND - dh / 2 + 4, width: dw, height: dh, layer: 'world', kind: 'wreckage' });
    }
    spawnActor({ id: 'propulsor-caca', texture: 'propulsor-de-reforco', x: 950, y: LEVEL_ONE_GROUND - 42, width: 210, height: 76, kind: 'wreckage' });
    const boosterTop = addPlatform('propulsor-plataforma', 'white', 950, LEVEL_ONE_GROUND - 82, 150, 16, 'wreckPlatform', true); boosterTop.visible = false;
    spawnActor({ id: 'suporte-misseis-caca', texture: 'suporte-de-misseis', x: 1260, y: LEVEL_ONE_GROUND - 42, width: 170, height: 82, kind: 'wreckage' });
    const missileTop = addPlatform('suporte-misseis-plataforma', 'white', 1260, LEVEL_ONE_GROUND - 84, 130, 16, 'wreckPlatform', true); missileTop.visible = false;
    addPlatform('sacos-de-areia-inicial', 'barricada-de-sacos-de-areia', 1500, LEVEL_ONE_GROUND - 45, 176, 56, 'sandbag', true);
    for (const x of [2_820, 7_560, 11_180, 17_780, 24_980]) {
        spawnActor({ id: `cratera-incandescente-${x}`, texture: 'incandescent-crater', x, y: LEVEL_ONE_GROUND - 6, width: 94, height: 42, tags: ['hazard'], kind: 'crater', timer: x % 4 });
    }
    for (const x of [4_950, 9_980, 18_780, 25_850]) {
        spawnActor({ id: `raiz-pontiaguda-piso-${x}`, texture: 'root-spikes', x, y: LEVEL_ONE_GROUND - 18, width: 112, height: 38, tags: ['hazard'], kind: 'spikedRoot' });
    }
    for (const x of [8_900, 16_400, 23_900]) {
        spawnActor({ id: `raiz-pontiaguda-teto-${x}`, texture: 'root-spikes', x, y: 550, width: 104, height: 52, layer: 'front', tags: ['hazard'], kind: 'spikedRoot' }).rot = Math.PI;
    }
    spawnActor({ id: 'antena-bunker-fase1', texture: 'torre-de-antena-do-bunker', x: LEVEL_ONE_BUNKER_X + 230, y: LEVEL_ONE_GROUND - 155, width: 88, height: 310, layer: 'back', kind: 'evacuationAntenna' });
    spawnActor({ id: 'modulo-bunker-fase1', texture: 'modulo-bunker-de-evacuacao', x: LEVEL_ONE_BUNKER_X, y: LEVEL_ONE_GROUND - 146, width: 420, height: 300, layer: 'world', kind: 'evacuationBunker' });
    const door = spawnActor({ id: 'comporta-bunker-fase1', texture: 'comporta-blindada-de-evacuacao', x: LEVEL_ONE_BUNKER_X, y: LEVEL_ONE_GROUND - 82, width: 118, height: 126, layer: 'world', kind: 'evacuationDoor' });
    door.visible = false;
}

export function buildWaterfallWorld(): void {
    game.background.gradient('#0a0a1f', '#2b1a5c');
    let bgIndex = 0;
    for (let y = LEVEL_THREE_HEIGHT - 360; y >= -360; y -= 714) {
        spawnActor({ id: `selva-cachoeira-fundo-${bgIndex++}`, texture: 'background-alien-jungle-surface', x: 640, y, width: 1280, height: 714, layer: 'back', kind: 'background' });
    }
    for (let y = -220; y <= LEVEL_THREE_HEIGHT + 300; y += 460) {
        spawnActor({ id: `cascata-esquerda-${y}`, texture: 'waterfall', x: 150, y, width: 250, height: 500, layer: 'back', kind: 'waterfall' });
        spawnActor({ id: `cascata-centro-${y}`, texture: 'waterfall', x: 640, y: y + 190, width: 180, height: 500, layer: 'back', kind: 'waterfall' });
        spawnActor({ id: `cascata-direita-${y}`, texture: 'waterfall', x: 1120, y, width: 260, height: 500, layer: 'back', kind: 'waterfall' });
        if (y % 920 === 0) spawnActor({ id: `rocha-fundo-${y}`, texture: 'cliff', x: y % 1840 === 0 ? 10 : 1270, y: y + 180, width: 270, height: 510, layer: 'back', kind: 'cliff' });
    }
    const xPositions = [520, 780, 1000, 780, 520, 280, 520, 780, 1000, 780, 520, 280];
    for (let index = 0; index < LEVEL_THREE_PLATFORM_COUNT; index++) {
        const top = LEVEL_THREE_GROUND - index * 145;
        const x = xPositions[index % xPositions.length] ?? 520;
        const isGrid = index % 11 === 0;
        const isBridge = !isGrid && index % 7 === 0;
        const rockKind = index % 3 === 0 ? 'long-alien-rock-platform' : index % 3 === 1 ? 'alien-stone-cliff-step' : 'small-rocky-alien-ledge';
        const texture = isGrid ? 'iron-grid' : isBridge ? 'bridge' : rockKind;
        const width = isGrid || isBridge ? 220 : rockKind === 'long-alien-rock-platform' ? 248 : rockKind === 'alien-stone-cliff-step' ? 216 : 196;
        const height = isGrid || isBridge ? 24 : rockKind === 'long-alien-rock-platform' ? 56 : rockKind === 'alien-stone-cliff-step' ? 110 : 92;
        addPlatform(`cume-plataforma-${index}`, texture, x, top, width, height, isBridge ? 'bridge' : isGrid ? 'grid' : 'cliffPlatform', true);
        if (index % 13 === 7) spawnActor({ id: `brasa-cume-${index}`, texture: 'incandescent-crater', x: x + 54, y: top - 1, width: 72, height: 34, tags: ['hazard'], kind: 'crater' });
        if (index % 17 === 9) spawnActor({ id: `raiz-cume-${index}`, texture: 'root-spikes', x: x - 52, y: top - 14, width: 76, height: 28, tags: ['hazard'], kind: 'spikedRoot' });
        if (index % 9 === 0 && index > 0) spawnActor({ id: `ninho-${index}`, texture: 'nest', x: x + (index % 2 ? 60 : -60), y: top - 30, width: 60, height: 46, tags: ['enemy', 'target'], kind: 'nest', hp: 3, scoreValue: 220, weapon: 'B' });
    }
}

export function buildCorridorWorld(): Actor {
    game.background.gradient('#060b16', '#0a1720');
    return spawnActor({ id: 'corredor-fundo', texture: 'background-defense-base-corridor', x: LANDSCAPE.width / 2, y: LANDSCAPE.height / 2, width: LANDSCAPE.width, height: LANDSCAPE.height, layer: 'back', kind: 'background' });
}

export function addPlatform(id: string, texture: string, x: number, top: number, width: number, height: number, kind: string, oneWay: boolean): Actor {
    const collisionHeight = Math.min(8, height);
    const topInset =
        texture === 'white' ? 0
            : texture === 'jungle-ground-tiles-platform' ? 16
            : texture === 'long-alien-rock-platform' ? 6
            : texture === 'alien-stone-cliff-step' ? 10
            : texture === 'small-rocky-alien-ledge' ? 10
            : texture === 'metal-stone-bridge' ? 5
            : texture === 'iron-grid' ? 3
            : texture === 'bridge' ? 5
            : texture === 'log' ? 4
            : 4;
    return spawnActor({
        id, texture, x, y: top + height / 2 - topInset, width, height, tags: ['platform', kind], kind, oneWay,
        collisionBox: {
            width: Math.max(1, width - 8),
            height: collisionHeight,
            offsetX: 0,
            offsetY: topInset + collisionHeight / 2 - height / 2,
        },
    });
}

function insideGap(x: number): boolean {
    return WATER_GAPS.some(([start, end]) => x + 64 > start && x < end);
}

export function bossGateX(stage: number): number {
    return stage === 1 ? LEVEL_ONE_BOSS_X : stage === 3 ? LEVEL_THREE_BOSS_Y : 0;
}

export function groundPlatforms(): Actor[] {
    return [...game.roster.tagged('platform') as Iterable<Actor>]
        .filter(p => p.alive && p.data.stage === run.stage && p.data.collisionBox !== null);
}
