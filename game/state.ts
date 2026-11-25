import { game } from './engine.js';

export type Weapon = 'P' | 'M' | 'E' | 'L' | 'F' | 'B';
export type WeaponPickup = Weapon | 'R';

export type RunState = {
    stage: number;
    orbitalShields: number;
    orbitalWave: number;
    orbitalCleared: boolean;
    lives: number;
    score: number;
    best: number;
    recordBeaten: boolean;
    kills: number;
    turrets: number;
    capsules: number;
    sporesShot: number;
    distanceScore: number;
    extractionBonus: number;
    bossParts: number;
    cleared: number;
    weapon: Weapon;
    barrierTime: number;
    rapidTime: number;
    invulnerable: boolean;
    infiniteLives: boolean;
    keepWeapon: boolean;
    invulnTime: number;
    campaignTime: number;
    deaths: number;
    room: number;
    lastCause: string;
    debugBossStart: boolean;
    debugBunkerStart: boolean;
    debugWinQueued: boolean;
    debugLoseQueued: boolean;
    tutorial: Record<string, boolean>;
    secretLives: boolean;
};

export const run: RunState = {
    stage: 1,
    orbitalShields: 3,
    orbitalWave: 1,
    orbitalCleared: false,
    lives: 3,
    score: 0,
    best: 0,
    recordBeaten: false,
    kills: 0,
    turrets: 0,
    capsules: 0,
    sporesShot: 0,
    distanceScore: 0,
    extractionBonus: 0,
    bossParts: 0,
    cleared: 0,
    weapon: 'P',
    barrierTime: 0,
    rapidTime: 0,
    invulnerable: false,
    infiniteLives: false,
    keepWeapon: false,
    invulnTime: 0,
    campaignTime: 0,
    deaths: 0,
    room: 0,
    lastCause: '',
    debugBossStart: false,
    debugBunkerStart: false,
    debugWinQueued: false,
    debugLoseQueued: false,
    tutorial: {},
    secretLives: false,
};

type StageCheckpoint = {
    stage: number;
    score: number;
    kills: number;
    turrets: number;
    capsules: number;
    bossParts: number;
    cleared: number;
    weapon: Weapon;
};

let stageCheckpoint: StageCheckpoint = {
    stage: 1, score: 0, kills: 0, turrets: 0, capsules: 0, bossParts: 0, cleared: 0, weapon: 'P',
};

export const STAGE_NAMES = ['Selva', 'Base', 'Cachoeira'] as const;
export const STAGE_BOSSES = ['Muralha de Defesa', 'Núcleo Computador', 'Coração Alienígena'] as const;

export function resetRun(lives = 3): void {
    run.stage = 1;
    run.orbitalShields = 3;
    run.orbitalWave = 1;
    run.orbitalCleared = false;
    run.lives = lives;
    run.score = 0;
    run.best = game.save.read('recorde', 0);
    run.recordBeaten = false;
    run.kills = 0;
    run.turrets = 0;
    run.capsules = 0;
    run.sporesShot = 0;
    run.distanceScore = 0;
    run.extractionBonus = 0;
    run.bossParts = 0;
    run.cleared = 0;
    run.weapon = 'P';
    run.barrierTime = 0;
    run.rapidTime = 0;
    run.invulnerable = false;
    run.infiniteLives = false;
    run.keepWeapon = false;
    run.invulnTime = 0;
    run.campaignTime = 0;
    run.deaths = 0;
    run.room = 0;
    run.lastCause = '';
    run.debugBossStart = false;
    run.debugBunkerStart = false;
    run.debugWinQueued = false;
    run.debugLoseQueued = false;
    run.tutorial = {};
    run.secretLives = lives >= 30;
    captureStageCheckpoint();
}

export function newDebugRun(stage: number, boss: boolean): void {
    resetRun(Math.max(1, 3 - (stage - 1)));
    run.stage = stage;
    run.cleared = stage - 1;
    run.score = stage === 1 ? 0 : stage === 2 ? 7200 : 16800;
    run.kills = stage === 1 ? 0 : stage === 2 ? 24 : 58;
    run.turrets = stage === 1 ? 0 : stage === 2 ? 7 : 14;
    run.capsules = stage === 1 ? 0 : stage === 2 ? 3 : 7;
    run.bossParts = stage - 1;
    run.weapon = 'P';
    run.room = boss && stage === 2 ? 5 : 0;
    run.debugBossStart = boss;
    captureStageCheckpoint();
}

export function captureStageCheckpoint(): void {
    stageCheckpoint = {
        stage: run.stage,
        score: run.score,
        kills: run.kills,
        turrets: run.turrets,
        capsules: run.capsules,
        bossParts: run.bossParts,
        cleared: run.cleared,
        weapon: run.weapon,
    };
}

export function restartStageRun(lives = 3): void {
    const checkpoint = stageCheckpoint.stage === run.stage ? stageCheckpoint : {
        stage: run.stage, score: run.score, kills: run.kills, turrets: run.turrets,
        capsules: run.capsules, bossParts: run.bossParts, cleared: run.cleared, weapon: 'P' as Weapon,
    };
    resetRun(lives);
    run.stage = checkpoint.stage;
    run.score = 0;
    run.kills = 0;
    run.turrets = 0;
    run.capsules = 0;
    run.sporesShot = 0;
    run.distanceScore = 0;
    run.extractionBonus = 0;
    run.bossParts = 0;
    run.cleared = checkpoint.stage - 1;
    run.weapon = 'P';
    run.room = 0;
    captureStageCheckpoint();
}

export function award(points: number): void {
    run.score += points;
}

export function updateRecord(): boolean {
    if (run.score > run.best) {
        run.recordBeaten = true;
        run.best = run.score;
        game.save.write('recorde', run.best);
        return true;
    }
    return run.recordBeaten;
}

export function formattedTime(seconds: number): string {
    const total = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(total / 60);
    const rest = total % 60;
    return `${minutes}:${String(rest).padStart(2, '0')}`;
}
