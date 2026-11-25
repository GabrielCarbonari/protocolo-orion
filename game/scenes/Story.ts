import { game } from '../engine.js';
import { makeRotatePrompt, persistMuteSetting } from '../rotate.js';
import { listen, tapped } from '../input.js';
import { playCrewSfx } from '../sfx.js';

let stopStoryInput: (() => void) | null = null;

export const Story = {
    name: 'story',
    enter(): void {
        const W = game.screen.width, H = game.screen.height;
        game.rig.follow(null);
        game.rig.bounds(null);
        game.camera.x = W / 2; game.camera.y = H / 2; game.camera.zoom = 1; game.camera.bounds = null;
        game.background.color('#0a0a1f');
        game.touch.visible = false;
        game.spawn({ id: 'historia-queda', texture: 'cutscene', x: W / 2, y: H / 2, width: W, height: H, layer: 'back' });
        playCrewSfx('atmospheric-ejection', 'explosao', { volume: 0.82 });
        let elapsed = 0, leaving = false;
        stopStoryInput = listen();
        const rotate = makeRotatePrompt(false);

        function continueToPlay(): void {
            if (leaving) return;
            leaving = true;
            void game.transition.go('play', { kind: 'fade', duration: 0.45, color: '#0a0a1f' });
        }

        game.step('story', dt => {
            persistMuteSetting();
            if (rotate()) return;
            elapsed += dt;
            const key = ['Space', 'Enter', 'KeyZ', 'KeyX', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape', 'KeyP']
                .some(code => game.input.keyPressed(code));
            if (tapped() || game.input.pointer?.pressed || key || game.controls.justPressed('jump') || game.controls.justPressed('fire') || game.controls.justPressed('pause') || elapsed >= 4) continueToPlay();
        });
    },
    exit(): void { stopStoryInput?.(); stopStoryInput = null; },
};
