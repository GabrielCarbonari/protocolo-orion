import { game } from '../engine.js';
import { resetRun, run, updateRecord, formattedTime } from '../state.js';
import { makeRotatePrompt, persistMuteSetting } from '../rotate.js';

export const MissionComplete = {
    name: 'missioncomplete',
    enter(): void {
        const W = game.screen.width, H = game.screen.height;
        const setNewRecord = run.recordBeaten || run.score > run.best;
        updateRecord();
        game.rig.follow(null);
        game.rig.bounds(null);
        game.camera.x = W / 2; game.camera.y = H / 2; game.camera.zoom = 1; game.camera.bounds = null;
        game.background.color('#020a04');
        game.spawn({ id: 'vitoria-evacuacao', texture: 'victory', x: W / 2, y: H / 2, width: W, height: H, layer: 'back' });
        game.ui.panel({ anchor: 'center', w: Math.min(W - 64, 840), h: 432, style: 'panel' });
        game.ui.label({ anchor: 'center', y: -158, w: W - 100, h: 76, text: 'EVACUAÇÃO CONFIRMADA', style: 'heading' });
        const line1 = game.text(`PONTOS  ${run.score.toLocaleString('pt-BR')}    RECORDE  ${run.best.toLocaleString('pt-BR')}`, W / 2, H / 2 - 92, { size: 25, font: 'VT323', color: '#ffd166' });
        const bonus = game.text(`BONUS DE EXTRAÇÃO  ${run.extractionBonus.toLocaleString('pt-BR')}`, W / 2, H / 2 - 56, { size: 21, font: 'VT323', color: '#ffd166' });
        const line2 = game.text(`ELIMINAÇÕES  ${run.kills}   •   ESPOROS  ${run.sporesShot}   •   TORRETAS  ${run.turrets}`, W / 2, H / 2 - 20, { size: 18, font: 'VT323', color: '#66ff99' });
        const line3 = game.text(`CÁPSULAS  ${run.capsules}   •   PEÇAS DE CHEFE  ${run.bossParts}   •   TEMPO  ${formattedTime(run.campaignTime)}`, W / 2, H / 2 + 16, { size: 17, font: 'VT323', color: '#66ff99' });
        const recordLabel = game.text(setNewRecord ? 'NOVO RECORDE DE COMBATE' : 'A FRONTEIRA ESTÁ SEGURA', W / 2, H / 2 + 51, { size: 19, font: 'VT323', color: '#33ff66' });
        game.ui.button({ anchor: 'center', y: 104, h: 62, text: 'Jogar de novo', style: 'good', icon: 'restart', onClick: restart });
        game.ui.button({ anchor: 'center', y: 174, h: 56, text: 'Menu inicial', style: 'flat', icon: 'home', onClick: () => { void game.transition.go('title', { kind: 'fade', duration: 0.4, color: '#020a04' }); } });
        game.ui.muteButton();
        const rotate = makeRotatePrompt(false);
        game.step('missioncomplete', () => {
            persistMuteSetting();
            const portrait = rotate();
            const width = game.screen.width, height = game.screen.height;
            line1.x = width / 2; line1.y = height / 2 - 92;
            bonus.x = width / 2; bonus.y = height / 2 - 56;
            line2.x = width / 2; line2.y = height / 2 - 20;
            line3.x = width / 2; line3.y = height / 2 + 16;
            recordLabel.x = width / 2; recordLabel.y = height / 2 + 51;
            if (!portrait && (game.input.keyPressed('Space') || game.input.keyPressed('Enter'))) restart();
        });
    },
};

function restart(): void {
    resetRun();
    void game.transition.go('orbital', { kind: 'pixels', duration: 0.5, color: '#020a04' });
}
