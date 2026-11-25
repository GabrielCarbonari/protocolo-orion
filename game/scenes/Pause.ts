import { game } from '../engine.js';
import { makeRotatePrompt, persistMuteSetting } from '../rotate.js';

export const Pause = {
    name: 'pause',
    enter(): void {
        const W = game.screen.width, H = game.screen.height;
        game.touch.visible = false;
        game.ui.panel({ anchor: 'center', w: W, h: H, style: 'panel' });
        const menu = game.ui.window({ anchor: 'center', w: Math.min(W - 80, 500), h: 'auto', title: 'PAUSA', titleHeight: 64, layout: { padding: 24, gap: 16, align: 'stretch' } });
        game.ui.button({ parent: menu, h: 72, text: 'Continuar', style: 'good', icon: 'play', onClick: () => game.scenes.pop() });
        const sound = game.ui.button({ parent: menu, h: 72, text: game.sound.muted ? 'Som desligado' : 'Som ligado', style: 'flat', icon: game.sound.muted ? 'sound-off' : 'sound-on', onClick: h => {
            if (game.sound.muted) { game.commands.unmute(); h.ui.text = 'Som ligado'; h.ui.icon = 'sound-on'; }
            else { game.commands.mute(); h.ui.text = 'Som desligado'; h.ui.icon = 'sound-off'; }
            persistMuteSetting();
        } });
        void sound;
        game.ui.button({ parent: menu, h: 64, text: 'Menu inicial', style: 'flat', icon: 'home', onClick: () => { void game.transition.go('title', { kind: 'fade', duration: 0.4, color: '#020a04' }); } });
        const rotate = makeRotatePrompt(false);
        game.step('pause', () => {
            persistMuteSetting();
            if (!rotate() && game.controls.justPressed('pause')) game.scenes.pop();
        });
    },
};
