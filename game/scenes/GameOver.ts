import { game } from '../engine.js';
import { restartStageRun, run, STAGE_NAMES, updateRecord } from '../state.js';
import { makeRotatePrompt, persistMuteSetting } from '../rotate.js';

export const GameOver = {
    name: 'gameover',
    enter(): void {
        const W = game.screen.width, H = game.screen.height;
        updateRecord();
        game.rig.follow(null);
        game.rig.bounds(null);
        game.camera.x = W / 2; game.camera.y = H / 2; game.camera.zoom = 1; game.camera.bounds = null;
        game.background.color('#020a04');
        game.spawn({ id: 'fim-ilustracao', texture: 'game-over', x: W / 2, y: H / 2, width: W, height: H, layer: 'back' });
        game.ui.panel({ anchor: 'center', w: Math.min(W - 64, 790), h: 420, style: 'panel' });
        game.ui.label({ anchor: 'center', y: -154, w: W - 100, h: 76, text: 'SINAL PERDIDO', style: 'heading' });
        const where = game.text(`FASE ${run.stage}: ${STAGE_NAMES[run.stage - 1]}`, W / 2, H / 2 - 68, { size: 24, font: 'VT323', color: '#66ff99' });
        const score = game.text(`PONTOS  ${run.score.toLocaleString('pt-BR')}    RECORDE  ${run.best.toLocaleString('pt-BR')}`, W / 2, H / 2 - 24, { size: 25, font: 'VT323', color: '#ffd166' });
        const stats = game.text(`ELIMINAÇÕES  ${run.kills}   •   ESPOROS  ${run.sporesShot}   •   TORRETAS  ${run.turrets}`, W / 2, H / 2 + 18, { size: 18, font: 'VT323', color: '#66ff99' });
        const pods = game.text(`CÁPSULAS  ${run.capsules}`, W / 2, H / 2 + 44, { size: 18, font: 'VT323', color: '#66ff99' });
        game.ui.button({ anchor: 'center', y: 94, h: 64, text: 'Jogar de novo', style: 'good', icon: 'restart', onClick: retry });
        game.ui.button({ anchor: 'center', y: 168, h: 58, text: 'Menu inicial', style: 'flat', icon: 'home', onClick: () => { void game.transition.go('title', { kind: 'fade', duration: 0.4, color: '#020a04' }); } });
        game.ui.muteButton();
        const rotate = makeRotatePrompt(false);
        game.step('gameover', () => {
            persistMuteSetting();
            const portrait = rotate();
            const width = game.screen.width, height = game.screen.height;
            where.x = width / 2; where.y = height / 2 - 68;
            score.x = width / 2; score.y = height / 2 - 24;
            stats.x = width / 2; stats.y = height / 2 + 18;
            pods.x = width / 2; pods.y = height / 2 + 44;
            if (!portrait && (game.input.keyPressed('Space') || game.input.keyPressed('Enter'))) retry();
        });
    },
};

function retry(): void {
    restartStageRun();
    void game.transition.go('play', { kind: 'pixels', duration: 0.5, color: '#020a04' });
}
