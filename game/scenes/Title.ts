import { game } from '../engine.js';
import assets from '../assets.json';
import { resetRun } from '../state.js';
import { makeRotatePrompt, persistMuteSetting } from '../rotate.js';
import { listen, tapped } from '../input.js';

const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
type CrewTitleLayer = {
    id: string; kind: string; x: number; y: number; size: number; height?: number;
    hidden?: boolean; alpha?: number; tint?: string; text?: { text: string; touch?: string };
    particles?: { count?: number }; enter?: { at?: number; duration?: number };
    idle?: Array<{ kind: string; amount?: number; hz?: number }>;
};
type CrewTitleDesign = {
    palette?: string[]; layers?: CrewTitleLayer[];
    shaders?: Array<{ name: string; params?: Record<string, number> }>;
};
let titleActive = false;
let stopTitleInput: (() => void) | null = null;

export const Title = {
    name: 'title',
    enter(): void {
        titleActive = true;
        const W = game.screen.width, H = game.screen.height;
        const design = game.assets.get('title-screen') as CrewTitleDesign;
        const layers = design.layers ?? [];
        const layer = (id: string): CrewTitleLayer => layers.find(item => item.id === id) ?? { id, kind: 'shape', x: W / 2, y: H / 2, size: 100 };
        const findLayer = (id: string): CrewTitleLayer | undefined => layers.find(item => item.id === id);
        const planetLayer = layer('planeta'), colonyLayer = layer('colonia'), dustLayer = layer('poeira');
        const logoLayer = layer('logo'), shipLayer = findLayer('nave'), alienLayer = findLayer('alien');
        const scrimLayer = layer('scrim'), promptLayer = layer('prompt');
        const palette = design.palette ?? ['#0a0a1f', '#2b1a5c', '#7a3fd1', '#c8f7ff', '#ff9d2e'];
        const star = design.shaders?.find(shader => shader.name === 'pixel-starfield-1')?.params ?? {};
        game.rig.follow(null);
        game.camera.x = W / 2; game.camera.y = H / 2; game.camera.zoom = 1; game.camera.bounds = null;
        game.background.gradient(palette[0] ?? '#0a0a1f', palette[1] ?? '#2b1a5c');
        game.background.stars({ density: star.density ?? 0.6, twinkle: star.twinkle ?? 0.6, drift: star.speed ?? 0.35 });
        game.post.add('scanlines', { strength: 0.2, size: 2 });
        game.post.add('vignette', { strength: 0.35, radius: 0.9, color: palette[0] ?? '#0a0a1f' });
        game.touch.visible = false;

        const planet = game.graphics({ id: 'titulo-planeta', layer: 'back' });
        planet.draw(ctx => {
            const radius = planetLayer.size / 2, height = planetLayer.height ?? 330;
            const glow = ctx.createRadialGradient(planetLayer.x, planetLayer.y - height * 0.3, 30, planetLayer.x, planetLayer.y, radius);
            glow.addColorStop(0, planetLayer.tint ?? palette[2] ?? '#7a3fd1');
            glow.addColorStop(0.6, palette[1] ?? '#2b1a5c'); glow.addColorStop(1, palette[0] ?? '#0a0a1f');
            ctx.fillStyle = glow;
            ctx.beginPath(); ctx.ellipse(planetLayer.x, planetLayer.y, radius, height, 0, 0, Math.PI * 2); ctx.fill();
            ctx.globalAlpha = colonyLayer.alpha ?? 0.72;
            ctx.fillStyle = colonyLayer.tint ?? palette[4] ?? '#ff9d2e'; ctx.shadowColor = ctx.fillStyle as string; ctx.shadowBlur = 28;
            ctx.fillRect(colonyLayer.x - colonyLayer.size / 2, colonyLayer.y, colonyLayer.size, colonyLayer.height ?? 10);
            ctx.shadowBlur = 0;
        });
        const dust = game.graphics({ id: 'titulo-poeira', layer: 'back' });
        dust.draw(ctx => {
            const count = dustLayer.particles?.count ?? 60;
            for (let i = 0; i < count; i++) {
                const x = (i * 97 + 29) % W, y = (i * 53 + 17) % H;
                ctx.fillStyle = i % 3 ? palette[3] ?? '#c8f7ff' : palette[2] ?? '#7a3fd1';
                ctx.globalAlpha = 0.45 + (i % 4) * 0.12; ctx.fillRect(x, y, i % 7 ? 2 : 3, i % 7 ? 2 : 3);
            }
            ctx.globalAlpha = 1;
        });

        const logo = game.spawn({ id: 'titulo-logo', texture: 'title-logo', x: logoLayer.x, y: logoLayer.y, width: logoLayer.size, height: logoLayer.size / 2, layer: 'world' });
        logo.alpha = 0;
        const ship = shipLayer ? game.spawn({ id: 'titulo-caca', texture: 'title-sprite-caca-aeroespacial-orion', x: shipLayer.x, y: H + 90, width: shipLayer.size, height: shipLayer.size * 280 / 1024, layer: 'world' }) : null;
        const alien = alienLayer ? game.spawn({ id: 'titulo-alien', texture: 'title-sprite-soldado-orion-salto-acrobatico', x: W + 40, y: alienLayer.y, width: alienLayer.size, height: alienLayer.size * 365 / 316, layer: 'world' }) : null;
        if (alien) alien.visible = false;
        const scrim = game.graphics({ id: 'titulo-scrim', layer: 'hud' });
        scrim.draw(ctx => {
            const x = scrimLayer.x - scrimLayer.size / 2, y = scrimLayer.y - (scrimLayer.height ?? 80) / 2;
            ctx.fillStyle = `rgba(10,10,31,${scrimLayer.alpha ?? 0.5})`; ctx.fillRect(x, y, scrimLayer.size, scrimLayer.height ?? 80);
            ctx.strokeStyle = palette[2] ?? '#7a3fd1'; ctx.lineWidth = 2; ctx.strokeRect(x, y, scrimLayer.size, scrimLayer.height ?? 80);
        });
        const promptText = game.touch.touchDevice ? promptLayer.text?.touch ?? 'Toque para jogar' : promptLayer.text?.text ?? 'Pressione Enter';
        const prompt = game.text(promptText, promptLayer.x, promptLayer.y, { size: promptLayer.size, font: 'VT323', color: palette[3] ?? '#c8f7ff', stroke: { color: palette[0] ?? '#0a0a1f', width: 2 } });
        const codeStatus = game.text('', W / 2, promptLayer.y - 52, { size: 20, font: 'VT323', color: palette[4] ?? '#ff9d2e', stroke: { color: palette[0] ?? '#0a0a1f', width: 2 } });
        let codeIndex = 0, secretArmed = false, starting = false, elapsed = 0, alienPass = 0;
        let surpriseIndex = 0, nextSurpriseAt = 4;
        stopTitleInput = listen();
        const rotate = makeRotatePrompt(false);
        const gameAssets = game.assets.load(assets, { pack: 'game' }).done;

        async function start(): Promise<void> {
            if (starting) return;
            starting = true;
            resetRun(secretArmed ? 30 : 3);
            await gameAssets;
            if (titleActive) await game.transition.go('orbital', { kind: 'pixels', duration: 0.5, color: palette[0] ?? '#0a0a1f', at: { x: logoLayer.x, y: logoLayer.y }, cells: 16 });
        }

        game.step('title', dt => {
            persistMuteSetting();
            if (rotate()) return;
            elapsed += dt;
            const logoEnter = logoLayer.enter ?? { at: 0.4, duration: 0.8 };
            const logoBob = logoLayer.idle?.find(item => item.kind === 'bob');
            const promptBlink = promptLayer.idle?.find(item => item.kind === 'blink');
            logo.alpha = Math.min(1, Math.max(0, (elapsed - (logoEnter.at ?? 0.4)) / (logoEnter.duration ?? 0.8)));
            logo.y = logoLayer.y + Math.sin(elapsed * Math.PI * 2 * (logoBob?.hz ?? 0.23)) * (logoBob?.amount ?? 3);
            if (ship && shipLayer) {
                const shipEnter = shipLayer.enter ?? { at: 1.3, duration: 0.4 };
                const shipBob = shipLayer.idle?.find(item => item.kind === 'bob');
                const shipIn = Math.max(0, Math.min(1, (elapsed - (shipEnter.at ?? 1.3)) / (shipEnter.duration ?? 0.4)));
                ship.y = H + 90 + (shipLayer.y - (H + 90)) * shipIn + Math.sin(elapsed * Math.PI * 2 * (shipBob?.hz ?? 0.3)) * (shipBob?.amount ?? 3);
            }
            prompt.alpha = 1 - (promptBlink?.amount ?? 0.7) * (0.5 + Math.sin(elapsed * Math.PI * 2 * (promptBlink?.hz ?? 0.9)) * 0.5);
            if (!alienPass && elapsed >= nextSurpriseAt) {
                if (alien && surpriseIndex % 3 === 0) { alien.visible = true; alien.x = W + 40; alienPass = 1; }
                else if (surpriseIndex % 2 === 0) game.particles.burst({ x: W - 40, y: 140, count: 4, layer: 'back', frame: 'particle:star', speed: [170, 300], lifespan: [0.35, 0.65], color: ['#c8f7ff', '#ffffff'] });
                else game.particles.burst({ x: ship?.x ?? W / 2, y: ship?.y ?? 520, count: 14, layer: 'front', frame: 'particle:spark', blend: 'add', speed: [40, 150], lifespan: [0.2, 0.55], color: ['#ff9d2e', '#c8f7ff'] });
                surpriseIndex++;
                nextSurpriseAt = elapsed + (surpriseIndex % 2 === 0 ? 4 : 7);
            }
            if (alien && alienPass) {
                alien.x -= 220 * dt;
                if (alien.x < -50) { alien.visible = false; alien.x = W + 40; alienPass = 0; }
            }

            const press = CODE.find(key => game.input.keyPressed(key)) ?? '';
            if (press) {
                codeIndex = press === CODE[codeIndex] ? codeIndex + 1 : press === CODE[0] ? 1 : 0;
                secretArmed = false;
                codeStatus.text = codeIndex ? 'CÓDIGO DE ACESSO…' : '';
                return;
            }
            if (codeIndex === CODE.length && game.controls.justPressed('fire')) {
                codeIndex++; codeStatus.text = 'CÓDIGO DE ACESSO…'; return;
            }
            if (codeIndex === CODE.length + 1 && game.controls.justPressed('jump')) {
                secretArmed = true; codeStatus.text = '30 VIDAS LIBERADAS'; game.sound.play('coleta'); void start(); return;
            }
            if (tapped() || game.input.pointer?.pressed || game.input.keyPressed('Enter')) { void start(); return; }
            if (secretArmed && game.controls.justPressed('fire')) { void start(); return; }
            if (codeIndex === 0 && (game.controls.justPressed('jump') || game.controls.justPressed('fire') || game.controls.justPressed('pause'))) void start();
        });

        void gameAssets;
    },
    exit(): void {
        titleActive = false;
        stopTitleInput?.();
        stopTitleInput = null;
        game.post.clear();
    },
};
