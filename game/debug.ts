import { game } from './engine.js';
import { run, resetRun, newDebugRun, updateRecord, type Weapon } from './state.js';

function numeric(value: string | undefined, minimum: number, maximum = Number.MAX_SAFE_INTEGER): number | null {
    if (value === undefined || value.trim() === '') return null;
    const number = Number(value);
    if (!Number.isFinite(number) || !Number.isInteger(number) || number < minimum || number > maximum) return null;
    return number;
}

function onOff(value: string | undefined): boolean | null {
    if (value?.toLowerCase() === 'on') return true;
    if (value?.toLowerCase() === 'off') return false;
    return null;
}

function enterPlay(): void {
    if (!game.roster.byId('soldado-orion') && !game.roster.byId('caca-orion')) game.scenes.go('play');
}

export function addDebugControls(): void {
    game.inspect.state(() => run);

    game.cheats.add({
        name: 'orbital', does: 'Começa na Parte 1: Defesa Orbital',
        run: () => {
            resetRun(3);
            game.scenes.go('orbital');
            return 'Parte 1: Defesa Orbital';
        },
    });

    game.cheats.add({
        name: 'stage', does: 'Começa no início da fase 1, 2 ou 3', args: 'n',
        run: value => {
            const stage = numeric(value, 1, 3);
            if (stage === null) return 'Use stage 1, 2 ou 3';
            newDebugRun(stage, false);
            game.scenes.go('play');
            return `Fase ${stage}: ${stage === 1 ? 'Selva' : stage === 2 ? 'Base' : 'Cachoeira'}`;
        },
    });

    game.cheats.add({
        name: 'boss', does: 'Abre o chefe da fase 1, 2 ou 3', args: 'n',
        run: value => {
            const stage = numeric(value, 1, 3);
            if (stage === null) return 'Use boss 1, 2 ou 3';
            newDebugRun(stage, true);
            game.scenes.go('play');
            return `Chefe da fase ${stage}`;
        },
    });

    game.cheats.add({
        name: 'bunker', does: 'Vai direto para o bunker de evacuação no final da fase',
        run: () => {
            newDebugRun(1, false);
            run.debugBunkerStart = true;
            game.scenes.go('play');
            return 'Bunker de evacuação';
        },
    });

    game.cheats.add({
        name: 'ending', does: 'Abre a tela final de vitória ou derrota', args: 'win|lose',
        run: value => {
            const ending = value?.toLowerCase();
            if (ending === 'win') { updateRecord(); game.scenes.go('missioncomplete'); }
            else if (ending === 'lose') { updateRecord(); game.scenes.go('gameover'); }
            else return 'Use ending win ou ending lose';
            return `Final: ${ending}`;
        },
    });

    game.cheats.add({
        name: 'screen', does: 'Mostra uma tela pelo nome', args: 'title|orbital|cutscene|victory|game-over|pause',
        run: value => {
            const screen = value?.toLowerCase();
            const scenes: Record<string, string> = { title: 'title', orbital: 'orbital', cutscene: 'story', victory: 'missioncomplete', 'game-over': 'gameover' };
            if (screen === 'pause') {
                if (game.roster.byId('soldado-orion') || game.roster.byId('caca-orion')) game.scenes.push('pause');
                else {
                    newDebugRun(1, false);
                    game.scenes.go('play');
                    game.after(0.2, () => game.scenes.push('pause'));
                }
                return 'Tela: pause';
            }
            const scene = screen ? scenes[screen] : undefined;
            if (!scene) return 'Use screen title, orbital, cutscene, victory, game-over ou pause';
            game.scenes.go(scene);
            return `Tela: ${screen}`;
        },
    });

    game.cheats.add({
        name: 'give', does: 'Entrega uma arma ou melhoria', args: 'metralhadora|tiro-espalhado|raio-laser|bomba-de-plasma|rajada-rapida|barreira',
        run: value => {
            const raw = (value ?? '').toUpperCase();
            const item = ({ 'TIRO-ESPALHADO': 'E', 'RAIO-LASER': 'L', 'BOMBA-DE-PLASMA': 'F', 'RAJADA-RAPIDA': 'R', 'BARRIER': 'B', 'BARREIRA': 'B', 'METRALHADORA': 'M' } as Record<string, string>)[raw] ?? raw;
            if (!['M', 'E', 'L', 'F', 'R', 'B'].includes(item)) return 'Use give M, E, L, F, R ou B';
            if (!game.roster.byId('soldado-orion')) { newDebugRun(1, false); enterPlay(); }
            if (item === 'R') { run.rapidTime = -1; return 'Rajada rápida ativada'; }
            run.weapon = item as Weapon;
            run.barrierTime = item === 'B' ? 13 : 0;
            return `Arma recebida: ${item}`;
        },
    });

    game.cheats.add({
        name: 'score', does: 'Define os pontos atuais', args: 'n',
        run: value => {
            const score = numeric(value, 0);
            if (score === null) return 'Use score com um número inteiro igual ou maior que zero';
            run.score = score;
            return `Pontos: ${score}`;
        },
    });

    game.cheats.add({
        name: 'lives', does: 'Define o número de vidas', args: 'n',
        run: value => {
            const lives = numeric(value, 1, 30);
            if (lives === null) return 'Use lives de 1 a 30';
            run.lives = lives;
            return `${lives} vidas`;
        },
    });

    game.cheats.add({
        name: 'infinite-lives', does: 'Liga ou desliga vidas infinitas', args: 'on|off',
        run: value => {
            const enabled = onOff(value);
            if (enabled === null) return 'Use infinite-lives on ou infinite-lives off';
            run.infiniteLives = enabled;
            return `Vidas infinitas ${enabled ? 'ligadas' : 'desligadas'}`;
        },
    });

    game.cheats.add({
        name: 'invincible', does: 'Liga ou desliga invulnerabilidade, incluindo quedas', args: 'on|off',
        run: value => {
            const enabled = onOff(value);
            if (enabled === null) return 'Use invincible on ou invincible off';
            run.invulnerable = enabled;
            return `Invulnerabilidade ${enabled ? 'ligada' : 'desligada'}`;
        },
    });

    game.cheats.add({
        name: 'keep-weapon', does: 'Mantém ou perde a arma ao morrer', args: 'on|off',
        run: value => {
            const enabled = onOff(value);
            if (enabled === null) return 'Use keep-weapon on ou keep-weapon off';
            run.keepWeapon = enabled;
            return `Manter arma ${enabled ? 'ligado' : 'desligado'}`;
        },
    });

    game.cheats.add({
        name: 'win-stage', does: 'Vence a fase atual pelo fluxo normal',
        run: () => { run.debugWinQueued = true; enterPlay(); return 'Vitória da fase solicitada'; },
    });

    game.cheats.add({
        name: 'lose-life', does: 'Perde uma vida e reaparece no mesmo lugar',
        run: () => { run.debugLoseQueued = true; enterPlay(); return 'Perda de vida solicitada'; },
    });

    game.cheats.add({
        name: 'end-run', does: 'Encerra a tentativa pela tela de Fim de Jogo',
        run: () => { updateRecord(); game.scenes.go('gameover'); return 'Fim de Jogo'; },
    });
}
