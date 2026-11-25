import { game } from './engine.js';

const C = {
    ink: '#050811', night: '#101323', deep: '#171b2a', leaf: '#22473f', leaf2: '#315b4b', lime: '#84f28c',
    water: '#1b91aa', waterLight: '#69dce8', steel: '#677b86', steelLight: '#c4d6d5', steelDark: '#263642',
    red: '#b52b3d', redLight: '#ff5260', gold: '#ffd264', cyan: '#55e4f3', green: '#50f18e', skin: '#d7aa82',
    navy: '#192c49', olive: '#707445', brown: '#6b4932', white: '#efffff',
};

function block(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function polygon(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, points: number[][], color: string): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach(([x, y], index) => index ? ctx.lineTo(x ?? 0, y ?? 0) : ctx.moveTo(x ?? 0, y ?? 0));
    ctx.closePath();
    ctx.fill();
}

function drawSoldier(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frame: number): void {
    const stride = frame % 4;
    block(ctx, 17, 3, 16, 12, C.skin); block(ctx, 15, 1, 19, 5, C.navy); block(ctx, 13, 5, 20, 3, C.redLight);
    block(ctx, 27, 7, 5, 2, C.ink); block(ctx, 25, 12, 10, 2, C.brown);
    block(ctx, 14, 15, 23, 18, C.navy); block(ctx, 11, 18, 7, 12, C.steelDark); block(ctx, 17, 17, 6, 5, C.steelLight);
    block(ctx, 28, 19, 6, 5, C.olive); block(ctx, 18, 25, 6, 5, C.olive); block(ctx, 25, 26, 7, 5, '#9a8a55');
    block(ctx, 32, 18, 6, 4, C.skin); block(ctx, 35, 17, 9, 4, C.steel); block(ctx, 41, 18, 5, 3, C.steelDark);
    const leftLeg = stride === 0 || stride === 2 ? 2 : 7;
    const rightLeg = stride === 0 || stride === 2 ? 7 : 2;
    block(ctx, 17, 32, 8, 9 - leftLeg, C.olive); block(ctx, 23, 40 - leftLeg, 9, 5, C.steelDark);
    block(ctx, 28, 31, 8, 10 - rightLeg, '#8a8050'); block(ctx, 33, 40 - rightLeg, 10, 5, C.steelDark);
    block(ctx, 15, 44, 18, 3, C.ink); block(ctx, 31, 22, 5, 8, C.skin);
}

function drawInfantry(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frame: number): void {
    block(ctx, 13, 3, 22, 17, C.red); block(ctx, 16, 1, 18, 6, C.steelDark); block(ctx, 20, 8, 13, 6, C.green);
    block(ctx, 22, 9, 8, 3, '#a6ffb5'); block(ctx, 10, 17, 29, 20, '#792334');
    block(ctx, 13, 20, 10, 11, C.redLight); block(ctx, 27, 21, 9, 8, C.steelDark);
    block(ctx, 7, 20, 7, 13, C.red); block(ctx, 36, 21, 7, 11, C.red);
    block(ctx, 14, 36, 9, frame ? 10 : 12, C.steelDark); block(ctx, 27, 36, 9, frame ? 12 : 10, C.steelDark);
    block(ctx, 11, 46, 14, 4, C.ink); block(ctx, 25, 46, 14, 4, C.ink);
    block(ctx, 38, 24, 10, 3, C.steel); block(ctx, 44, 23, 4, 4, C.gold);
}

function drawJumper(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frame: number): void {
    polygon(ctx, [[19, 0], [31, 0], [38, 14], [34, 22], [14, 22], [9, 13]], '#9a2539');
    block(ctx, 21, 7, 12, 5, C.green); block(ctx, 23, 8, 7, 2, '#b5ffc0');
    block(ctx, 15, 21, 23, 16, '#762233'); block(ctx, 12, 23, 8, 13, C.redLight); block(ctx, 33, 23, 7, 11, C.red);
    block(ctx, 17, 36, 6, 10, C.steelDark); block(ctx, 29, 36, 6, 10, C.steelDark);
    block(ctx, 11, 46, 13, 3, C.ink); block(ctx, 27, 46, 14, 3, C.ink);
    block(ctx, frame ? 36 : 39, 18, 10, 3, C.steelLight); block(ctx, 44, 17, 4, 4, C.redLight);
}

function drawTurret(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, open: number): void {
    block(ctx, 3, 25, 48, 12, C.steelDark); block(ctx, 7, 19, 40, 15, C.steel);
    polygon(ctx, [[7, 22], [10, 10], [20, 3], [34, 3], [46, 12], [49, 24]], '#4b606a');
    if (open) {
        polygon(ctx, [[8, 19], [10, 10], [20, 4], [26, 15], [24, 22]], C.steelLight);
        polygon(ctx, [[28, 15], [35, 3], [46, 12], [50, 22], [34, 22]], C.steelDark);
        block(ctx, 20, 20, 26, 4, C.green); block(ctx, 39, 18, 12, 4, C.steelLight);
    } else {
        polygon(ctx, [[8, 22], [10, 10], [20, 3], [34, 3], [46, 12], [49, 24]], '#687d85');
        block(ctx, 21, 12, 15, 5, C.red); block(ctx, 23, 13, 11, 2, '#ffb84e');
    }
    block(ctx, 11, 34, 8, 4, C.ink); block(ctx, 35, 34, 8, 4, C.ink);
}

function drawBattery(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, flash: number): void {
    block(ctx, 14, 12, 28, 26, C.steelDark); block(ctx, 8, 15, 10, 19, '#47616d'); block(ctx, 38, 15, 10, 19, '#47616d');
    block(ctx, 18, 6, 20, 16, C.steel); block(ctx, 22, 9, 12, 7, flash ? C.redLight : C.red);
    block(ctx, 21, 25, 6, 12, C.steelLight); block(ctx, 30, 25, 6, 12, C.steelLight);
    block(ctx, 24, 28, 10, 8, '#263c48'); block(ctx, 22, 38, 14, 4, C.ink);
}

function drawDrone(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frame: number): void {
    polygon(ctx, [[2, 14], [9, 3], [17, 11], [12, 22]], '#91a5ab');
    polygon(ctx, [[50, 14], [43, 3 + frame * 2], [35, 11], [40, 22]], '#d2dfdf');
    polygon(ctx, [[13, 7], [21, 2], [37, 5], [44, 15], [37, 26], [21, 29], [12, 20]], '#c7d5d7');
    block(ctx, 18, 8, 20, 6, '#edf4ed'); block(ctx, 18, 17, 20, 6, '#71868d');
    block(ctx, 22, 10, 12, 6, '#4b7f9a'); block(ctx, 25, 11, 6, 4, C.cyan);
    block(ctx, 8, 12, 7, 6, '#a6b9bd'); block(ctx, 43, 12, 7, 6, '#b4c2c3');
    block(ctx, 22, 28, 14, 3, '#71f5d5');
}

function drawSensor(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, frame: number): void {
    polygon(ctx, [[19, 1], [34, 8], [36, 31], [27, 45], [10, 37], [8, 14]], C.steelDark);
    polygon(ctx, [[20, 5], [31, 10], [32, 29], [25, 39], [14, 34], [12, 16]], '#75878b');
    if (frame) {
        block(ctx, 14, 12, 6, 9, '#c2d3d1'); block(ctx, 29, 12, 6, 9, '#9daeb2');
        block(ctx, 19, 16, 10, 12, '#35da91'); block(ctx, 21, 18, 6, 8, '#e7ff9c');
    } else {
        block(ctx, 18, 15, 13, 12, '#91233a'); block(ctx, 20, 17, 9, 8, '#ff4e63'); block(ctx, 22, 18, 5, 5, '#ffc5a9');
    }
    block(ctx, 18, 40, 13, 4, C.ink);
}

function drawPickupCapsule(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, kind: 'rifle' | 'ammo' | 'rapid'): void {
    block(ctx, 4, 8, 40, 28, '#435a64'); block(ctx, 7, 5, 34, 28, '#c4d3cc');
    block(ctx, 9, 8, 30, 22, kind === 'rapid' ? '#6e5525' : '#284a54');
    block(ctx, 11, 6, 26, 3, '#f3fff2'); block(ctx, 11, 30, 26, 3, '#71868a');
    if (kind === 'rifle') {
        block(ctx, 13, 16, 17, 4, '#b7c9c7'); block(ctx, 28, 15, 8, 3, '#efffff');
        block(ctx, 18, 20, 4, 5, '#526a72'); block(ctx, 12, 15, 3, 6, '#72e5b2');
    } else if (kind === 'ammo') {
        for (let i = 0; i < 3; i++) {
            block(ctx, 14 + i * 7, 13, 4, 11, '#e9f3d8');
            polygon(ctx, [[14 + i * 7, 13], [16 + i * 7, 10], [18 + i * 7, 13]], '#ffcf62');
        }
        block(ctx, 12, 25, 22, 2, '#68f0a2');
    } else {
        polygon(ctx, [[13, 20], [20, 12], [20, 17], [29, 17], [29, 22], [20, 22], [20, 27]], '#ffd166');
        polygon(ctx, [[23, 20], [30, 12], [30, 17], [36, 17], [36, 22], [30, 22], [30, 27]], '#ff9d2e');
    }
}

export function paintArt(): void {
    game.paint('orion-run', 48, 52, drawSoldier, { frames: 4 });
    game.paint('orion-jump', 48, 48, ctx => {
        block(ctx, 10, 11, 28, 28, C.navy); block(ctx, 14, 7, 21, 16, C.skin); block(ctx, 12, 5, 25, 6, C.redLight);
        block(ctx, 22, 19, 16, 15, C.steelDark); block(ctx, 15, 23, 17, 14, C.olive); block(ctx, 10, 33, 28, 8, C.navy);
        block(ctx, 27, 19, 16, 4, C.steel); block(ctx, 39, 20, 6, 3, C.gold); block(ctx, 7, 15, 8, 20, C.steelLight);
    });
    game.paint('orion-prone', 68, 30, ctx => {
        block(ctx, 8, 15, 39, 9, C.navy); block(ctx, 17, 7, 19, 9, C.skin); block(ctx, 16, 5, 22, 4, C.redLight);
        block(ctx, 25, 15, 13, 6, C.steelDark); block(ctx, 38, 16, 20, 3, C.steel); block(ctx, 55, 15, 8, 4, C.gold);
        block(ctx, 6, 23, 48, 4, C.ink); block(ctx, 12, 19, 8, 4, C.olive);
    });
    game.paint('rifle', 40, 12, ctx => {
        block(ctx, 1, 4, 27, 4, C.steel); block(ctx, 25, 3, 11, 3, C.steelLight); block(ctx, 35, 2, 4, 3, C.gold);
        block(ctx, 8, 8, 4, 3, C.brown); block(ctx, 19, 8, 5, 3, C.steelDark); block(ctx, 4, 3, 4, 5, '#303d43');
    });
    game.paint('infantry', 50, 52, drawInfantry, { frames: 2 });
    game.paint('jumper', 50, 52, drawJumper, { frames: 2 });
    game.paint('turret', 56, 42, (ctx, i) => drawTurret(ctx, i), { frames: 2 });
    game.paint('battery', 56, 48, (ctx, i) => drawBattery(ctx, i), { frames: 2 });
    game.paint('drone', 52, 34, drawDrone, { frames: 2 });
    game.paint('sensor', 44, 48, (ctx, i) => drawSensor(ctx, i), { frames: 2 });
    game.paint('pickup-fuzil-padrao', 48, 42, ctx => drawPickupCapsule(ctx, 'rifle'));
    game.paint('pickup-metralhadora', 48, 42, ctx => drawPickupCapsule(ctx, 'ammo'));
    game.paint('pickup-tiro-rapido', 48, 42, ctx => drawPickupCapsule(ctx, 'rapid'));

    game.paint('ground', 128, 96, ctx => {
        block(ctx, 0, 0, 128, 13, '#263b3d'); block(ctx, 0, 0, 128, 5, '#78db91');
        block(ctx, 0, 14, 128, 82, '#171c29'); block(ctx, 0, 16, 128, 5, '#2e5046');
        for (let x = 8; x < 128; x += 24) { block(ctx, x, 31 + (x % 3) * 7, 13, 5, '#353541'); block(ctx, x + 7, 57, 8, 4, '#28323a'); }
        block(ctx, 0, 88, 128, 8, '#0d121d');
        block(ctx, 18, 31, 12, 2, '#57ec98'); block(ctx, 82, 54, 13, 2, '#ac60e6');
    });
    game.paint('river', 160, 42, ctx => {
        block(ctx, 0, 0, 160, 42, '#075574'); block(ctx, 0, 4, 160, 7, '#1f93aa');
        for (let x = 0; x < 160; x += 30) { block(ctx, x, 12 + (x % 2) * 5, 18, 3, '#70e3e5'); block(ctx, x + 14, 29, 14, 3, '#147a96'); }
    });
    game.paint('log', 180, 32, ctx => {
        block(ctx, 0, 7, 180, 19, '#6f472b'); block(ctx, 5, 4, 165, 8, '#a36b3d'); block(ctx, 20, 16, 130, 3, '#cf9854');
        block(ctx, 0, 11, 7, 12, '#b6834b'); block(ctx, 171, 10, 8, 12, '#452c24'); block(ctx, 55, 5, 3, 12, '#4b392a');
    });
    game.paint('bridge', 190, 34, ctx => {
        block(ctx, 0, 6, 190, 6, '#b17b3d'); block(ctx, 0, 22, 190, 7, '#75462e');
        for (let x = 8; x < 190; x += 24) { block(ctx, x, 10, 17, 13, '#b57c3b'); block(ctx, x + 4, 13, 3, 3, '#efd074'); }
        block(ctx, 0, 29, 4, 5, '#3c4240'); block(ctx, 186, 29, 4, 5, '#3c4240');
    });
    game.paint('iron-grid', 220, 28, ctx => {
        block(ctx, 0, 3, 220, 4, '#a2b6bb'); block(ctx, 0, 22, 220, 4, '#647982');
        for (let x = 4; x < 220; x += 20) { block(ctx, x, 5, 4, 18, '#526b73'); block(ctx, x + 3, 7, 2, 3, '#c3dad9'); }
    });
    game.paint('rock-platform', 180, 44, ctx => {
        polygon(ctx, [[1, 41], [7, 19], [23, 14], [38, 4], [59, 12], [87, 8], [111, 17], [137, 9], [159, 18], [178, 39]], '#414f4f');
        polygon(ctx, [[7, 23], [23, 14], [38, 4], [59, 12], [87, 8], [111, 17], [137, 9], [159, 18], [175, 25], [178, 39], [3, 39]], '#66736b');
        block(ctx, 10, 31, 30, 4, '#9a9a75'); block(ctx, 74, 25, 22, 3, '#87917b'); block(ctx, 132, 28, 30, 4, '#88907a');
    });
    game.paint('jungle-panel', 1280, 720, ctx => {
        const sky = ctx.createLinearGradient(0, 0, 0, 720); sky.addColorStop(0, '#131324'); sky.addColorStop(0.7, '#282a3a'); sky.addColorStop(1, '#151c27');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, 1280, 720);
        for (let x = 0; x < 1280; x += 92) { block(ctx, x + 26, 58 + (x % 5) * 14, 4, 3, '#d9da9b'); }
        ctx.fillStyle = '#c6bbd6'; ctx.beginPath(); ctx.arc(1040, 130, 34, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#a49bbd'; ctx.beginPath(); ctx.arc(180, 178, 23, 0, Math.PI * 2); ctx.fill();
        polygon(ctx, [[0, 380], [115, 262], [215, 336], [366, 218], [512, 336], [667, 238], [818, 350], [1004, 224], [1170, 330], [1280, 242], [1280, 530], [0, 530]], '#202331');
        polygon(ctx, [[0, 454], [120, 355], [250, 417], [388, 310], [548, 434], [735, 324], [900, 427], [1088, 320], [1280, 421], [1280, 590], [0, 590]], '#262f37');
        for (let x = -15; x < 1280; x += 122) {
            block(ctx, x + 37, 305 + (x % 3) * 12, 12, 205, '#1a342f');
            polygon(ctx, [[x - 18, 350], [x + 18, 262], [x + 51, 310], [x + 101, 268], [x + 125, 353], [x + 77, 337], [x + 54, 382]], x % 2 ? '#285447' : '#3b3654');
            block(ctx, x + 3, 388, 7, 28, x % 2 ? '#62d980' : '#8d64c5');
        }
        block(ctx, 0, 568, 1280, 152, '#131c25');
        for (let x = 0; x < 1280; x += 74) { block(ctx, x + 8, 540 + (x % 4) * 4, 4, 34, x % 2 ? '#347356' : '#604b88'); block(ctx, x + 21, 548, 3, 23, '#70e78e'); }
    });
    game.paint('title-backdrop', 1280, 720, ctx => {
        const sky = ctx.createLinearGradient(0, 0, 0, 720); sky.addColorStop(0, '#0a0d1c'); sky.addColorStop(0.65, '#1c2132'); sky.addColorStop(1, '#111b24');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, 1280, 720);
        ctx.fillStyle = '#c4b9d8'; ctx.beginPath(); ctx.arc(1010, 148, 38, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8e89aa'; ctx.beginPath(); ctx.arc(212, 232, 22, 0, Math.PI * 2); ctx.fill();
        polygon(ctx, [[0, 476], [168, 326], [286, 431], [444, 284], [574, 428], [758, 294], [928, 437], [1060, 318], [1280, 460], [1280, 720], [0, 720]], '#171a28');
        for (let x = 15; x < 1280; x += 120) { block(ctx, x, 472 - (x % 4) * 18, 12, 175, '#0e1621'); polygon(ctx, [[x - 38, 506], [x + 3, 410], [x + 47, 496], [x + 73, 454], [x + 90, 522]], x % 2 ? '#233b37' : '#2e2940'); block(ctx, x + 19, 500, 4, 27, x % 2 ? '#68e48c' : '#a96be0'); }
        block(ctx, 0, 625, 1280, 95, '#091119');
        for (let x = 0; x < 1280; x += 48) block(ctx, x + 4, 616 - (x % 3) * 4, 24, 8, x % 2 ? '#254438' : '#302740');
        block(ctx, 914, 306, 94, 322, '#111d27'); block(ctx, 930, 328, 64, 54, '#1e4250');
        block(ctx, 945, 344, 35, 7, '#50d2dc'); block(ctx, 948, 380, 28, 195, '#19313a');
        block(ctx, 0, 594, 1280, 3, '#66b6a0');
    });
    game.paint('canopy', 1280, 170, ctx => {
        for (let x = 0; x < 1280; x += 92) {
            block(ctx, x, 0, 34, 30, '#101321'); block(ctx, x + 22, 10, 58, 36, '#202031');
            block(ctx, x + 42, 25, 70, 46, '#26343a'); block(ctx, x + 56, 43, 88, 46, '#232a36');
            block(ctx, x + 71, 68, 12, 90, '#1b2f2c'); block(ctx, x + 18, 69, 8, 62, '#302746');
            block(ctx, x + 47, 37, 13, 3, '#5aaf78'); block(ctx, x + 89, 58, 10, 3, '#8b59bc');
        }
    });
    game.paint('waterfall', 250, 500, (ctx, frame) => {
        block(ctx, 16, 0, 210, 500, '#07536a'); block(ctx, 33, 0, 18, 500, '#209ab2'); block(ctx, 92 + frame * 8, 0, 12, 500, '#82e8e9');
        block(ctx, 142, 0, 18, 500, '#35b9c9'); block(ctx, 180 - frame * 5, 0, 9, 500, '#b0f3ed');
        for (let y = 16; y < 500; y += 49) { block(ctx, 42 + (y % 4) * 7, y, 24, 4, '#6bd7df'); block(ctx, 130, y + 18, 29, 4, '#1687a1'); }
        block(ctx, 0, 0, 16, 500, '#233b3d'); block(ctx, 226, 0, 24, 500, '#243a3b');
    }, { frames: 2 });
    game.paint('cliff', 270, 510, ctx => {
        polygon(ctx, [[0, 0], [270, 0], [245, 78], [218, 114], [244, 174], [205, 236], [253, 302], [207, 365], [242, 432], [270, 510], [0, 510]], '#25393c');
        polygon(ctx, [[0, 0], [51, 25], [20, 88], [73, 133], [31, 194], [65, 265], [24, 333], [70, 402], [40, 467], [0, 510]], '#3c5149');
        for (let y = 30; y < 490; y += 83) block(ctx, y % 2 ? 36 : 185, y, 58, 11, '#596456');
    });
    game.paint('nest', 64, 48, ctx => {
        polygon(ctx, [[2, 43], [12, 19], [25, 7], [45, 12], [60, 40]], '#4a302d');
        block(ctx, 13, 21, 36, 18, '#791f34'); block(ctx, 19, 24, 24, 11, '#ed503a');
        block(ctx, 24, 27, 13, 5, '#ffc75f'); block(ctx, 4, 39, 55, 7, '#273435');
    });

    game.paint('defense-wall', 760, 560, ctx => {
        block(ctx, 10, 82, 740, 478, '#25333a'); block(ctx, 40, 109, 680, 451, '#45565b');
        for (let x = 48; x < 720; x += 84) {
            block(ctx, x, 124, 58, 396, '#586a6d'); block(ctx, x + 8, 135, 6, 350, '#819397');
            block(ctx, x + 54, 141, 10, 359, '#273942');
        }
        block(ctx, 102, 84, 550, 34, '#172831'); block(ctx, 240, 39, 282, 57, '#586b70');
        block(ctx, 284, 50, 190, 30, '#9c333d'); block(ctx, 317, 59, 126, 12, '#f45b4f');
        block(ctx, 0, 515, 760, 45, '#131f26'); block(ctx, 34, 496, 695, 18, '#718285');
        for (let x = 44; x < 740; x += 34) block(ctx, x, 506, 6, 8, '#cad5cc');
    });
    game.paint('defense-gate', 190, 205, ctx => {
        block(ctx, 11, 4, 168, 197, '#172a31'); block(ctx, 20, 13, 150, 182, '#627277');
        for (let y = 21; y < 190; y += 24) {
            block(ctx, 25, y, 140, 8, '#a5b5ae'); block(ctx, 32, y + 9, 126, 7, '#384b53');
        }
        block(ctx, 77, 24, 36, 158, '#7b2838'); block(ctx, 84, 33, 22, 138, '#e34e52');
        block(ctx, 6, 194, 178, 8, '#d2d8c9');
    });
    game.paint('boss-battery', 112, 100, ctx => {
        block(ctx, 9, 19, 94, 72, '#495f66'); block(ctx, 20, 10, 72, 20, '#93a8a7'); block(ctx, 16, 35, 84, 47, '#30434d');
        block(ctx, 30, 42, 52, 17, '#951e30'); block(ctx, 44, 47, 24, 8, '#ff594f');
        block(ctx, 83, 49, 27, 8, '#b2c4bf'); block(ctx, 9, 82, 94, 10, '#1a2c34');
    });
    game.paint('boss-launcher', 100, 88, ctx => {
        block(ctx, 8, 15, 84, 65, '#4d6265'); polygon(ctx, [[16, 27], [33, 6], [66, 6], [84, 27], [80, 64], [20, 64]], '#829292');
        block(ctx, 37, 19, 27, 27, '#14252e'); block(ctx, 43, 24, 14, 16, '#ff8b48'); block(ctx, 30, 70, 40, 7, '#17242a');
    });
    game.paint('boss-core', 118, 128, (ctx, frame) => {
        block(ctx, 28, 5, 62, 118, '#4d5c60'); block(ctx, 20, 17, 78, 96, '#778386');
        block(ctx, 28, 31, 61, 64, '#8d2836'); block(ctx, 37, 39, 44, 48, frame ? '#ff7452' : '#df403f');
        block(ctx, 45, 49, 28, 28, '#ffbd6d'); block(ctx, 51, 55, 16, 16, '#fff2ab');
        block(ctx, 0, 47, 24, 20, '#32454b'); block(ctx, 95, 47, 23, 20, '#32454b');
    }, { frames: 2 });
    game.paint('computer-wall', 760, 440, ctx => {
        block(ctx, 10, 32, 740, 395, '#142630'); block(ctx, 33, 53, 694, 348, '#243b46');
        for (let x = 52; x < 710; x += 42) { block(ctx, x, 68, 8, 314, '#1a6671'); block(ctx, x + 10, 77 + (x % 3) * 11, 18, 8, '#36c5b8'); }
        block(ctx, 120, 96, 520, 270, '#1b2a36'); block(ctx, 138, 115, 484, 230, '#30444d');
        for (let y = 132; y < 334; y += 38) { block(ctx, 153, y, 438, 5, '#228d92'); block(ctx, 176 + (y % 4) * 19, y + 11, 58, 7, '#6adaaa'); }
        block(ctx, 0, 398, 760, 42, '#101c24');
    });
    game.paint('computer-cannon', 92, 72, (ctx, frame) => {
        block(ctx, 8, 9, 76, 54, '#4a6067'); block(ctx, 17, 5, 58, 15, '#a1b4b5');
        block(ctx, 22, 21, 48, 33, '#233b46'); block(ctx, 28, 29, 36, 16, frame ? C.redLight : '#45d8d0');
        block(ctx, 35, 53, 21, 8, '#9cb5b5'); block(ctx, 73, 31, 18, 8, '#c1d3cc');
    }, { frames: 2 });
    game.paint('computer-eye', 136, 116, (ctx, frame) => {
        polygon(ctx, [[2, 58], [26, 31], [58, 15], [82, 10], [112, 28], [134, 57], [112, 85], [79, 103], [50, 94], [24, 80]], '#71888a');
        polygon(ctx, [[17, 58], [42, 36], [69, 29], [99, 37], [118, 58], [99, 77], [69, 84], [42, 77]], '#182c38');
        block(ctx, 50, 39, 39, 37, frame ? '#ff4c59' : '#39ffb2'); block(ctx, 60, 47, 21, 20, '#eaffcc');
        block(ctx, 65, 49, 11, 16, '#11262f');
    }, { frames: 2 });
    game.paint('orion-heart', 320, 270, (ctx, frame) => {
        polygon(ctx, [[159, 243], [87, 220], [38, 165], [16, 112], [35, 56], [78, 25], [132, 34], [162, 70], [199, 29], [251, 26], [292, 63], [303, 119], [277, 172], [225, 221]], '#682336');
        polygon(ctx, [[159, 220], [97, 198], [55, 154], [39, 111], [56, 70], [86, 48], [128, 53], [161, 91], [195, 51], [236, 48], [270, 75], [280, 116], [260, 154], [215, 197]], frame ? '#c52e4c' : '#a92544');
        block(ctx, 78, 95, 34, 19, '#f16b68'); block(ctx, 205, 94, 34, 19, '#f16b68');
        block(ctx, 93, 100, 10, 8, '#fff0bd'); block(ctx, 218, 99, 10, 8, '#fff0bd');
        block(ctx, 136, 117, 48, 52, '#681d39'); block(ctx, 147, 126, 26, 33, frame ? '#ff795c' : '#f04561');
        block(ctx, 153, 133, 14, 19, '#fff2ac');
        for (let y = 24; y < 225; y += 29) { block(ctx, 35 + (y % 5) * 8, y, 6, 21, '#e65c66'); block(ctx, 268 - (y % 4) * 9, y + 8, 6, 23, '#5be0ce'); }
    }, { frames: 2 });
    game.paint('heart-mouth', 66, 58, (ctx, frame) => {
        polygon(ctx, [[2, 28], [9, 12], [20, 5], [33, 9], [46, 4], [59, 14], [64, 30], [57, 48], [42, 54], [29, 48], [15, 55], [4, 44]], '#662038');
        block(ctx, 10, 17, 46, 25, frame ? '#d33350' : '#a52848');
        block(ctx, 17, 22, 32, 15, '#1b1927'); block(ctx, 20, 25, 26, 7, '#ff4d62');
        for (let x = 18; x <= 44; x += 8) { block(ctx, x, 17, 4, 7, '#e8dbba'); block(ctx, x + 3, 35, 4, 7, '#e8dbba'); }
        block(ctx, 6, 10, 8, 6, '#64e2cf'); block(ctx, 52, 8, 8, 7, '#ff7868');
    }, { frames: 2 });
    game.paint('parasite', 30, 26, (ctx, frame) => {
        polygon(ctx, [[2, 13], [8, 4], [22, 3], [29, 12], [23, 22], [8, 22]], '#b42d49');
        block(ctx, 10, 9, 12, 7, '#f2a556'); block(ctx, 12, 10, 4, 4, '#fff1a8');
        block(ctx, 5, 19 + frame, 5, 6 - frame, '#62233c'); block(ctx, 20, 18 + (1 - frame), 6, 6 - (1 - frame), '#62233c');
    }, { frames: 2 });
    game.paint('runner', 58, 48, (ctx, frame) => {
        polygon(ctx, [[4, 25], [12, 12], [24, 8], [37, 12], [53, 23], [46, 35], [28, 40], [12, 35]], '#7f1e39');
        polygon(ctx, [[12, 23], [20, 12], [29, 4], [33, 17], [42, 8], [41, 22]], '#d6425c');
        block(ctx, 18, 19, 17, 9, '#bb334f'); block(ctx, 21, 21, 8, 4, '#ffc266'); block(ctx, 22, 21, 3, 3, '#fff6c4');
        polygon(ctx, [[15, 29], [9, 37 + frame], [4, 41 + frame], [17, 38]], '#a62a46');
        polygon(ctx, [[39, 29], [47, 35 + (1 - frame)], [55, 38 + (1 - frame)], [43, 40]], '#a62a46');
        block(ctx, 25, 31, 5, 9, '#641d39'); block(ctx, 32, 31, 5, 8, '#641d39');
        block(ctx, 12, 35, 6, 3, '#f07979'); block(ctx, 43, 35, 6, 3, '#f07979');
    }, { frames: 2 });
    game.paint('acid-spitter', 66, 62, (ctx, frame) => {
        polygon(ctx, [[6, 56], [10, 36], [5, 26], [18, 8], [29, 20], [36, 3], [44, 20], [59, 12], [62, 37], [57, 56]], '#3e4250');
        polygon(ctx, [[12, 47], [14, 32], [25, 25], [39, 26], [51, 35], [48, 52]], frame ? '#8e3c87' : '#65396f');
        block(ctx, 24, 33, 18, 12, '#291d3a'); block(ctx, 28, 34, 11, 6, '#52ec92');
        block(ctx, 19, 52, 34, 6, '#252b37'); block(ctx, 8, 57, 50, 4, '#141923');
    }, { frames: 2 });
    game.paint('acid-glob', 18, 18, (ctx, frame) => {
        ctx.beginPath(); ctx.arc(9, 9, frame ? 7 : 6, 0, Math.PI * 2); ctx.fillStyle = '#43ef89'; ctx.fill();
        block(ctx, 6, 5, 5, 3, '#dbff98'); block(ctx, 4, 12, 2, 2, '#b6ff68');
    }, { frames: 2 });
    game.paint('acid-splash', 88, 28, (ctx, frame) => {
        block(ctx, 5, 19, 78, 5, '#1d9c61'); block(ctx, 12, 14, 16, 8, frame ? '#74ff89' : '#44e977');
        block(ctx, 32, 9, 18, 13, '#52f48a'); block(ctx, 56, 14, 18, 8, frame ? '#54ec7a' : '#8cff82');
        block(ctx, 26, 5, 5, 8, '#b5ff8a'); block(ctx, 63, 7, 4, 9, '#b5ff8a');
    }, { frames: 2 });
    game.paint('incandescent-crater', 94, 42, (ctx, frame) => {
        polygon(ctx, [[1, 30], [12, 19], [26, 17], [38, 21], [50, 15], [65, 19], [81, 16], [93, 29], [89, 39], [5, 39]], '#202732');
        polygon(ctx, [[11, 29], [23, 24], [37, 28], [48, 21], [64, 27], [82, 23], [87, 30], [73, 35], [22, 35]], frame ? '#ffb33d' : '#fa6038');
        block(ctx, 37, 24, 17, 7, '#fff07a'); block(ctx, 17, 11, 3, 8, '#c4485b'); block(ctx, 72, 7, 4, 10, '#a25bd6');
    }, { frames: 2 });
    game.paint('root-spikes', 112, 44, (ctx, frame) => {
        block(ctx, 5, 31, 102, 10, '#28343b');
        for (let x = 12; x < 104; x += 18) {
            polygon(ctx, [[x, 33], [x + 7, frame ? 1 : 5], [x + 14, 33]], x % 3 ? '#718c86' : '#765594');
            block(ctx, x + 6, 27, 3, 7, '#72eea0');
        }
        block(ctx, 5, 39, 102, 4, '#111a24');
    });
    for (const action of ['move', 'fire', 'duck', 'jump', 'grab', 'aim'] as const) {
        game.paint(`cue-${action}`, 48, 38, ctx => {
            block(ctx, 2, 2, 44, 34, '#10232b'); block(ctx, 5, 5, 38, 28, '#bed6d4');
            block(ctx, 7, 7, 34, 24, '#18242e'); block(ctx, 9, 9, 30, 20, '#253745');
            if (action === 'move') {
                polygon(ctx, [[13, 19], [20, 13], [20, 17], [27, 17], [27, 13], [34, 19], [27, 25], [27, 21], [20, 21], [20, 25]], '#c7f3f1');
            } else if (action === 'fire') {
                block(ctx, 14, 16, 15, 6, '#ffd66d'); block(ctx, 28, 14, 7, 10, '#ff7653'); block(ctx, 35, 17, 4, 4, '#fff4bd');
            } else if (action === 'duck') {
                polygon(ctx, [[17, 13], [31, 13], [31, 21], [35, 21], [24, 28], [13, 21], [17, 21]], '#c7f3f1');
            } else if (action === 'jump') {
                polygon(ctx, [[24, 9], [34, 20], [28, 20], [28, 27], [20, 27], [20, 20], [14, 20]], '#c7f3f1');
            } else if (action === 'grab') {
                block(ctx, 18, 12, 12, 16, '#ff536e'); block(ctx, 20, 15, 8, 10, '#fff0c2');
                block(ctx, 21, 7, 6, 5, '#b7eaff'); block(ctx, 16, 29, 16, 3, '#c7f3f1');
            } else {
                polygon(ctx, [[13, 24], [21, 16], [27, 20], [35, 11], [37, 18], [27, 27], [21, 23]], '#c7f3f1');
            }
        });
    }
    game.paint('orion-back', 54, 58, ctx => {
        block(ctx, 17, 3, 20, 16, '#d5dfdf'); block(ctx, 14, 17, 26, 22, '#9aa9ad');
        block(ctx, 18, 10, 18, 7, '#4779a4'); block(ctx, 11, 22, 7, 15, '#65777e'); block(ctx, 37, 22, 7, 15, '#65777e');
        block(ctx, 16, 38, 9, 15, '#9ba56f'); block(ctx, 29, 38, 9, 15, '#89956c');
        block(ctx, 13, 52, 14, 4, '#303b43'); block(ctx, 28, 52, 14, 4, '#303b43');
    });
    game.paint('orion-aim-up', 54, 58, ctx => {
        block(ctx, 20, 3, 16, 14, '#dce4e1'); block(ctx, 17, 15, 22, 23, '#aab7b8');
        block(ctx, 21, 8, 14, 5, '#4e85bb'); block(ctx, 18, 20, 8, 11, '#76878b');
        block(ctx, 23, 37, 8, 13, '#a0a76d'); block(ctx, 15, 49, 14, 5, '#343c42');
        block(ctx, 35, 15, 4, 13, '#bfcac8'); block(ctx, 36, 7, 4, 10, '#83dff1'); block(ctx, 35, 4, 6, 4, '#d5ffff');
    });
    game.paint('boulder', 52, 52, ctx => {
        polygon(ctx, [[14, 2], [37, 6], [49, 19], [47, 37], [33, 50], [13, 46], [2, 32], [5, 13]], '#4e5855');
        block(ctx, 15, 8, 16, 8, '#888e7d'); block(ctx, 8, 20, 14, 9, '#707a70'); block(ctx, 25, 27, 13, 8, '#68736b');
        block(ctx, 33, 12, 7, 6, '#303e40'); block(ctx, 15, 37, 12, 5, '#353f40');
    });
    game.paint('bomb', 26, 30, ctx => {
        block(ctx, 7, 8, 13, 17, '#343d3d'); block(ctx, 10, 4, 7, 5, '#899394');
        block(ctx, 11, 11, 5, 5, C.redLight); block(ctx, 15, 2, 4, 4, C.gold); block(ctx, 5, 24, 17, 3, '#1a272b');
    });
    game.paint('barrier-dome', 112, 112, (ctx, frame) => {
        ctx.beginPath(); ctx.arc(56, 56, frame ? 49 : 46, 0, Math.PI * 2); ctx.strokeStyle = frame ? '#b5ffff' : '#57e9fa'; ctx.lineWidth = 5; ctx.stroke();
        ctx.beginPath(); ctx.arc(56, 56, 35, 0, Math.PI * 2); ctx.strokeStyle = '#db72ff'; ctx.lineWidth = 2; ctx.stroke();
        block(ctx, 27, 18 + frame * 2, 4, 4, '#fff9aa'); block(ctx, 79, 78 - frame * 2, 5, 5, '#c8ffff');
        block(ctx, 50, 7, 8, 3, '#f7fbff');
    }, { frames: 2 });
    game.paint('corridor-back', 1280, 720, ctx => {
        const bg = ctx.createLinearGradient(0, 0, 0, 720); bg.addColorStop(0, '#08121d'); bg.addColorStop(1, '#111e26');
        ctx.fillStyle = bg; ctx.fillRect(0, 0, 1280, 720);
        polygon(ctx, [[0, 0], [430, 210], [430, 525], [0, 720]], '#172834');
        polygon(ctx, [[1280, 0], [850, 210], [850, 525], [1280, 720]], '#172834');
        polygon(ctx, [[0, 720], [430, 525], [850, 525], [1280, 720]], '#1b3038');
        polygon(ctx, [[0, 0], [1280, 0], [850, 210], [430, 210]], '#0b1821');
        block(ctx, 430, 180, 420, 32, '#263d48'); block(ctx, 454, 193, 372, 5, '#238995');
        block(ctx, 537, 214, 206, 292, '#0a1924'); block(ctx, 555, 229, 170, 270, '#24434d');
        block(ctx, 580, 244, 120, 190, '#0d2029'); block(ctx, 597, 260, 86, 5, '#58d5cd');
        for (let row = 1; row <= 7; row++) {
            const y = 220 + row * row * 8;
            const half = 50 + row * 56;
            block(ctx, 640 - half, y, half * 2, 3, row % 2 ? '#23545d' : '#31505a');
        }
        for (let x = 0; x < 640; x += 80) {
            ctx.strokeStyle = x % 160 ? '#234b55' : '#38616a'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(640, 211); ctx.lineTo(x, 720); ctx.stroke();
        }
        for (const x of [62, 148, 286, 995, 1128, 1214]) {
            block(ctx, x, 106, 20, 9, '#31bbc1'); block(ctx, x + 7, 128, 5, 300, '#21707a'); block(ctx, x - 13, 95, 45, 5, '#42626a');
        }
        block(ctx, 0, 0, 1280, 16, '#1a2c36'); block(ctx, 0, 704, 1280, 16, '#07141c');
    });
    game.paint('corridor-door', 470, 400, ctx => {
        block(ctx, 4, 5, 462, 391, '#263b43'); block(ctx, 21, 19, 428, 364, '#101c26');
        block(ctx, 38, 34, 394, 19, '#71878b'); block(ctx, 38, 347, 394, 19, '#53686f');
        for (let x = 46; x < 430; x += 42) { block(ctx, x, 64, 12, 283, '#29444b'); block(ctx, x + 14, 68, 3, 277, '#51666a'); }
        block(ctx, 213, 69, 44, 275, '#9c333b'); block(ctx, 222, 77, 25, 260, '#de5550');
    });
    game.paint('corridor-gate', 380, 126, ctx => {
        block(ctx, 1, 8, 378, 112, '#1b404b'); block(ctx, 8, 15, 364, 10, '#74e7e3');
        for (let x = 16; x < 380; x += 29) { block(ctx, x, 30, 8, 82, '#43b5bb'); block(ctx, x + 8, 30, 6, 82, '#1d6677'); }
        block(ctx, 14, 109, 352, 7, '#bbffff');
    });
    game.paint('laser-line', 16, 16, ctx => {
        block(ctx, 0, 4, 16, 8, '#ff4258'); block(ctx, 2, 6, 12, 4, '#fff3c9');
    });
    game.paint('parachute', 68, 54, ctx => {
        polygon(ctx, [[4, 31], [7, 13], [20, 3], [47, 3], [62, 15], [66, 31]], '#d9e8dc');
        block(ctx, 7, 17, 55, 5, '#c83b4a'); block(ctx, 21, 4, 6, 26, '#a9c8c7'); block(ctx, 43, 4, 5, 26, '#a9c8c7');
        block(ctx, 18, 27, 4, 19, '#84999c'); block(ctx, 47, 27, 4, 19, '#84999c'); block(ctx, 19, 46, 31, 6, '#70848b');
    });
    game.paint('rotate-phone', 86, 78, ctx => {
        block(ctx, 22, 8, 43, 62, '#a9dadd'); block(ctx, 27, 14, 33, 49, '#122836'); block(ctx, 37, 65, 13, 3, '#e8fbf3');
        ctx.strokeStyle = '#57e4ef'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(43, 40, 32, -0.6, Math.PI * 1.35); ctx.stroke();
        polygon(ctx, [[6, 14], [23, 9], [17, 26]], '#57e4ef');
    });
    game.paint('life-icon', 22, 22, ctx => {
        block(ctx, 2, 7, 7, 6, '#ff6a72'); block(ctx, 13, 7, 7, 6, '#ff6a72'); block(ctx, 4, 5, 14, 11, '#ff6a72');
        polygon(ctx, [[3, 12], [19, 12], [11, 21]], '#e53c59'); block(ctx, 6, 8, 5, 3, '#ffd3b7');
    });
    game.paint('title-soldier', 120, 130, ctx => {
        drawSoldier(ctx as OffscreenCanvasRenderingContext2D, 1);
    });
    game.paint('result-backdrop', 1280, 720, ctx => {
        ctx.fillStyle = '#07131d'; ctx.fillRect(0, 0, 1280, 720);
        for (let i = 0; i < 24; i++) {
            const x = (i * 167) % 1280, y = (i * 97) % 720;
            block(ctx, x, y, 48 + (i % 4) * 18, 3, i % 2 ? '#15303a' : '#263c43');
        }
        polygon(ctx, [[0, 530], [250, 420], [434, 520], [640, 380], [830, 517], [1020, 414], [1280, 520], [1280, 720], [0, 720]], '#142c31');
        block(ctx, 0, 634, 1280, 86, '#09171d');
    });
    game.paint('shot-p', 24, 10, ctx => { block(ctx, 2, 3, 19, 4, '#ffd267'); block(ctx, 0, 4, 24, 2, '#fff6b6'); });
    game.paint('shot-s', 24, 20, ctx => { block(ctx, 3, 5, 18, 10, '#e7354f'); block(ctx, 7, 8, 9, 4, '#ffa18a'); block(ctx, 10, 9, 4, 2, '#fff0bd'); });
    game.paint('shot-l', 32, 8, ctx => { block(ctx, 1, 2, 29, 4, '#59eaff'); block(ctx, 0, 3, 32, 2, '#d9ffff'); });
    game.paint('shot-f', 22, 18, (ctx, frame) => { polygon(ctx, [[1, 9], [6, 4 + frame * 2], [12, 1], [18, 6], [21, 9], [17, 15], [9, 17], [3, 14]], '#fa652f'); block(ctx, 9, 6, 7, 6, '#ffe097'); }, { frames: 2 });
    game.paint('boss-flash', 132, 24, ctx => { block(ctx, 0, 8, 132, 8, '#f13d53'); block(ctx, 6, 11, 120, 2, '#fff0b9'); });
}
