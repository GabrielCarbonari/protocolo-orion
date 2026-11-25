import { game } from './engine.js';
import { type Actor, type ActorData } from './actors.js';
import { type Weapon, type WeaponPickup } from './state.js';
import { playCrewSfx } from './sfx.js';

export type ProjectileSystem = ReturnType<typeof game.projectilePatterns.createProjectiles>;
export type ProjectilePattern = Parameters<ProjectileSystem['emit']>[0];

export const WEAPON_NAMES: Record<Weapon, string> = {
    P: 'Fuzil Padrão',
    M: 'Metralhadora',
    E: 'Tiro Espalhado',
    L: 'Raio Laser',
    F: 'Bomba de Plasma',
    B: 'Barreira',
};

export const WEAPON_PICKUP_TEXTURES: Record<WeaponPickup, string> = {
    P: 'pickup-fuzil-padrao',
    M: 'pickup-metralhadora',
    E: 'pickup-tiro-espalhado',
    L: 'pickup-raio-laser',
    F: 'pickup-bomba-de-plasma',
    B: 'pickup-escudo-de-energia',
    R: 'pickup-tiro-rapido',
};

export const FIRE_INTERVALS: Record<Weapon, number> = {
    P: 0.22,
    M: 0.13,
    E: 0.3,
    L: 0.35,
    F: 0.32,
    B: 0.22,
};

const PATTERNS: Record<Exclude<Weapon, 'E' | 'F'>, ProjectilePattern> = {
    P: { kind: 'aimed', count: 1, speed: 860, radius: 4, life: 2 },
    M: { kind: 'fan', count: 2, spread: 0.07, speed: 980, radius: 3.5, life: 2 },
    L: { kind: 'aimed', count: 1, speed: 1500, radius: 7, life: 2.3, pierce: 2 },
    B: { kind: 'aimed', count: 1, speed: 860, radius: 4, life: 2 },
};

export function weaponDamage(weapon: Weapon): number {
    if (weapon === 'L') return 2.4;
    if (weapon === 'F') return 1.6;
    if (weapon === 'E') return 1.2;
    return 1;
}

export function firePlayer(system: ProjectileSystem, player: Actor, angle: number, weapon: Weapon): number[] {
    const muzzle = { x: player.x + Math.cos(angle) * 28, y: player.y - 4 + Math.sin(angle) * 28 };
    const damage = weaponDamage(weapon);
    let ids: number[];
    if (weapon === 'E') {
        ids = system.emit({ kind: 'fan', count: 5, spread: 1.02, speed: 760, radius: 9, life: 1.8 }, muzzle, angle, 'player', damage);
    } else if (weapon === 'F') {
        ids = system.emit({ kind: 'spiral', count: 8, interval: 0.055, rotation: 0.48, speed: 540, radius: 10, life: 1.4 }, muzzle, angle, 'player', damage);
    } else {
        ids = system.emit(PATTERNS[weapon], muzzle, angle, 'player', damage);
    }
    if (weapon === 'L') {
        playCrewSfx('ship-laser', 'disparo', { volume: 0.78, minGapMs: 50 });
    } else {
        const rate = weapon === 'M' ? 1.14 : weapon === 'E' ? 0.92 : weapon === 'F' ? 0.82 : 1;
        const volume = weapon === 'F' ? 0.6 : weapon === 'E' ? 0.72 : 0.76;
        playCrewSfx('rifle-shot', 'disparo', { volume, rate, minGapMs: 45 });
    }
    return ids;
}

export function fireAtPlayer(system: ProjectileSystem, source: Actor, player: Actor, pattern: ProjectilePattern, damage = 1): void {
    const angle = Math.atan2(player.y - source.y, player.x - source.x);
    system.emit(pattern, { x: source.x, y: source.y }, angle, 'enemy', damage);
}

export function fireAngle(system: ProjectileSystem, source: Actor, angle: number, pattern: ProjectilePattern, damage = 1): void {
    system.emit(pattern, { x: source.x, y: source.y }, angle, 'enemy', damage);
}

export function isEnemyTarget(actor: Actor): boolean {
    const data: ActorData = actor.data;
    return data.kind !== 'player';
}
