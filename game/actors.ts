import { game, type Sprite } from './engine.js';
import { run, type Weapon, type WeaponPickup } from './state.js';

export type ActorData = {
    kind: string;
    hp: number;
    maxHp: number;
    scoreValue: number;
    targetId: string;
    stage: number;
    room: number;
    vx: number;
    vy: number;
    cooldown: number;
    warning: number;
    flash: number;
    timer: number;
    phase: number;
    face: number;
    grounded: boolean;
    oneWay: boolean;
    weapon: WeaponPickup;
    seed: number;
    startX: number;
    startY: number;
    active: boolean;
    collisionBox: CollisionBox | null;
};

export type CollisionBox = { width: number; height: number; offsetX: number; offsetY: number };
export type CollisionBounds = { x: number; y: number; width: number; height: number };

export type Actor = Sprite<ActorData>;
export type SpawnActor = {
    id: string;
    texture: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    scale?: number;
    layer?: 'back' | 'world' | 'front' | 'hud';
    tags?: string[];
    kind: string;
    hp?: number;
    scoreValue?: number;
    room?: number;
    oneWay?: boolean;
    weapon?: WeaponPickup;
    vx?: number;
    vy?: number;
    cooldown?: number;
    timer?: number;
    phase?: number;
    face?: number;
    active?: boolean;
    collisionBox?: CollisionBox | null;
};

export function spawnActor(spec: SpawnActor): Actor {
    const hp = spec.hp ?? 1;
    const actor = game.spawn({
        id: spec.id,
        texture: spec.texture,
        x: spec.x,
        y: spec.y,
        width: spec.width,
        height: spec.height,
        scale: spec.scale,
        layer: spec.layer ?? 'world',
        tags: ['actor', ...(spec.tags ?? [])],
        data: {
            kind: spec.kind,
            hp,
            maxHp: hp,
            scoreValue: spec.scoreValue ?? 0,
            targetId: '',
            stage: run.stage,
            room: spec.room ?? 0,
            vx: spec.vx ?? 0,
            vy: spec.vy ?? 0,
            cooldown: spec.cooldown ?? 0,
            warning: 0,
            flash: 0,
            timer: spec.timer ?? 0,
            phase: spec.phase ?? 0,
            face: spec.face ?? 1,
            grounded: false,
            oneWay: spec.oneWay ?? false,
            weapon: spec.weapon ?? 'P',
            seed: game.rng.int(1, 1_000_000),
            startX: spec.x,
            startY: spec.y,
            active: spec.active ?? true,
            collisionBox: spec.collisionBox ?? null,
        },
    });
    const typed = actor as Actor;
    typed.data.targetId = typed.id;
    return typed;
}

export function collisionBounds(actor: Actor): CollisionBounds | null {
    const box = actor.data.collisionBox;
    return box ? {
        x: actor.x + box.offsetX,
        y: actor.y + box.offsetY,
        width: box.width,
        height: box.height,
    } : null;
}

export function targetActors(): Actor[] {
    return [...game.roster.tagged('target') as Iterable<Actor>].filter(actor => actor.alive && actor.data.active);
}

export function actorByTargetId(id: string): Actor | null {
    const actor = game.roster.byId(id) as Actor | null;
    return actor?.alive ? actor : null;
}

export function distanceSquared(a: { x: number; y: number }, b: { x: number; y: number }): number {
    const dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
}

export function boxesOverlap(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean {
    return Math.abs(ax - bx) < (aw + bw) / 2 && Math.abs(ay - by) < (ah + bh) / 2;
}

export function burstAt(x: number, y: number, count = 12, colors: string[] = ['#fff6b0', '#ff7b42', '#f4334c']): void {
    game.particles.burst({ x, y, count, layer: 'front', frame: 'particle:spark', blend: 'add', speed: [70, 210], lifespan: [0.22, 0.5], color: colors });
}

export function hitFlash(actor: Actor): void {
    actor.tint = '#ffffff';
    actor.data.flash = 0.12;
}

export function addScore(points: number): void {
    run.score += points;
}
