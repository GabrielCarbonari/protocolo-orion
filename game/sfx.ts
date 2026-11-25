import { game } from './engine.js';

export type CrewSfxKey =
    | 'ship-laser'
    | 'enemy-plasma'
    | 'shield-damage'
    | 'ship-explosion'
    | 'atmospheric-ejection'
    | 'pilot-footstep'
    | 'pilot-jump'
    | 'rifle-shot'
    | 'alien-hit'
    | 'alien-death'
    | 'bunker-door'
    | 'mission-clear';

const lastPlayedAt = new Map<CrewSfxKey, number>();

export function playCrewSfx(
    key: CrewSfxKey,
    fallback?: string,
    opts?: { volume?: number; rate?: number; minGapMs?: number },
): void {
    const gap = opts?.minGapMs ?? 0;
    if (gap > 0) {
        const now = game.clock.time;
        const prev = lastPlayedAt.get(key) ?? -Infinity;
        if (now >= prev && (now - prev) * 1000 < gap) return;
        lastPlayedAt.set(key, now);
    }
    if (game.assets.has(key)) {
        game.sound.sample(key, { volume: opts?.volume, rate: opts?.rate });
    } else if (fallback) {
        game.sound.play(fallback, opts?.volume !== undefined ? { volume: opts.volume } : undefined);
    }
}
