import { game } from './engine.js';
import assets from './assets.json';
import { paintArt } from './art.js';
import { addDebugControls } from './debug.js';
import { Title } from './scenes/Title.js';
import { Orbital } from './scenes/Orbital.js';
import { Play } from './scenes/Play.js';
import { Pause } from './scenes/Pause.js';
import { GameOver } from './scenes/GameOver.js';
import { MissionComplete } from './scenes/MissionComplete.js';
import { Story } from './scenes/Story.js';

paintArt();

game.controls.bindMove({
    left: ['ArrowLeft', 'KeyA', 'Touch:left'],
    right: ['ArrowRight', 'KeyD', 'Touch:right'],
    up: ['ArrowUp', 'KeyW', 'Touch:up'],
    down: ['ArrowDown', 'KeyS', 'Touch:down'],
});
game.controls.bind('jump', { keys: ['Space', 'Touch:jump'], pad: ['a'] });
game.controls.bind('fire', { keys: ['KeyZ', 'Touch:fire'], pad: ['x'] });
game.controls.bind('fireBack', { keys: ['KeyQ', 'ShiftLeft', 'ShiftRight', 'Touch:fireBack'], pad: ['y', 'l1'] });
game.controls.bind('pause', { keys: ['Escape', 'KeyP'], pad: ['start'] });

game.sound.defineAll({
    disparo: { type: 'square', freq: 780, freqEnd: 260, sweep: 'exponential', duration: 0.075, volume: 0.16 },
    salto: { type: 'square', freq: 260, freqEnd: 520, duration: 0.14, volume: 0.22 },
    impacto: { type: 'noise', duration: 0.18, filter: { type: 'lowpass', freq: 1200, freqEnd: 180 }, volume: 0.32 },
    explosao: { type: 'noise', duration: 0.48, filter: { type: 'lowpass', freq: 1900, freqEnd: 120 }, volume: 0.45 },
    coleta: { notes: [660, 990, 1320], duration: 0.2, type: 'square', volume: 0.26 },
    aviso: { type: 'square', freq: 450, freqEnd: 760, duration: 0.11, volume: 0.22 },
    barreira: { notes: [440, 660, 880], duration: 0.32, type: 'triangle', volume: 0.25 },
    chefe: { notes: [220, 330, 440, 660], duration: 0.55, type: 'square', volume: 0.35 },
    vitoria: { notes: [523, 659, 784, 1047], duration: 0.75, type: 'square', volume: 0.34 },
});

if (game.save.read('som-mudo', false)) game.commands.mute();

await game.assets.load(assets, { pack: 'title' });
game.ui.theme = await game.ui.loadTheme(game.assets.get('ui-theme'));
game.scenes.register(Title);
game.scenes.register(Orbital);
game.scenes.register(Story);
game.scenes.register(Play);
game.scenes.register(Pause);
game.scenes.register(GameOver);
game.scenes.register(MissionComplete);
addDebugControls();

await game.start();
game.scenes.go('title');
