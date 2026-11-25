import { game } from './engine.js';

export function isPortraitTouch(): boolean {
    return game.touch.touchDevice && game.screen.width < game.screen.height;
}

export function makeRotatePrompt(showControls = true): () => boolean {
    const W = game.screen.width;
    const H = game.screen.height;
    const shade = game.spawn({ id: 'rotacao-fundo', texture: 'white', x: W / 2, y: H / 2, width: W, height: H, layer: 'hud', tint: '#06111b', alpha: 0.94, z: 1000 });
    const handset = game.spawn({ id: 'rotacao-icone', texture: 'rotate-phone', x: W / 2, y: H / 2 - 92, layer: 'hud', z: 1001 });
    const title = game.text('GIRE O APARELHO', W / 2, H / 2 + 34, { size: 34, font: 'VT323', color: '#66ff99', stroke: { color: '#020a04', width: 2 }, z: 1002 });
    const hint = game.text('MANTENHA A TELA NA HORIZONTAL', W / 2, H / 2 + 86, { size: 17, font: 'VT323', color: '#66ff99', stroke: { color: '#020a04', width: 1 }, z: 1002 });

    const update = (): boolean => {
        const portrait = isPortraitTouch();
        if (game.touch.touchDevice) game.touch.visible = showControls && !portrait;
        shade.visible = portrait;
        handset.visible = portrait;
        title.visible = portrait;
        hint.visible = portrait;
        const width = game.screen.width;
        const height = game.screen.height;
        shade.x = width / 2; shade.y = height / 2; shade.width = width; shade.height = height;
        handset.x = width / 2; handset.y = height / 2 - 92;
        title.x = width / 2; title.y = height / 2 + 34;
        hint.x = width / 2; hint.y = height / 2 + 86;
        return portrait;
    };
    update();
    return update;
}

export function persistMuteSetting(): void {
    const muted = game.sound.muted;
    if (game.save.read('som-mudo', false) !== muted) game.save.write('som-mudo', muted);
}
