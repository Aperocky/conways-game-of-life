import * as PIXI from "pixi.js";
import { Game } from "./game";

const MOBILE = window.screen.width < 640 ? true : false;
let resolution = MOBILE ? 320 : 640;

const app = new PIXI.Application({
    width: resolution, height: resolution
});
let gamezone = document.getElementById("mapspace");
gamezone.appendChild(app.view);
app.renderer.plugins.interaction.autoPreventDefault = false;

const mapContainer = new PIXI.Container();
const startButton = document.getElementById("startgame");
const stopButton = document.getElementById("stopgame");
const seedButton = document.getElementById("seedgame");
const statButton = document.getElementById("statgame");
app.stage.addChild(mapContainer);

const SPRITE_COUNT = 40;
const SPRITE_SIZE = MOBILE ? 8 : 16;

// tint scales
const HEATMAP_REDSCALE = [1, 90];
const HEATMAP_GREENSCALE = [30, 238];
const HEATMAP_BLUESCALE = [20, 90];
const AGE_REDSCALE = [129, 212];
const AGE_GREENSCALE = [0, 235];
const AGE_BLUESCALE = [0, 242];
const game = new Game();
let spriteMap = {};
let run_state = false;

generateContainer();

function getSprite(toggle: boolean): PIXI.Sprite {
    let texture = PIXI.Texture.WHITE;
    let sprite = new PIXI.Sprite(texture);
    if (toggle) {
        sprite.tint = 0xd4ebf2;
    } else {
        sprite.tint = 0x222222;
    }
    sprite.anchor.set(0.5);
    let spriteSize = MOBILE ? 0.375 : 0.875;
    sprite.scale.set(spriteSize);
    return sprite;
}

function generateContainer(): void {
    mapContainer.removeChildren();
    game.initiate(0.2, SPRITE_COUNT);
    for (let i = 0; i < SPRITE_COUNT; i++) {
        for (let j = 0; j < SPRITE_COUNT; j++) {
            let terrainSprite = getSprite(game.state[i][j]);
            terrainSprite.name = Game.indexstr(i, j);
            terrainSprite.x = i * SPRITE_SIZE;
            terrainSprite.y = j * SPRITE_SIZE;
            spriteMap[Game.indexstr(i, j)] = terrainSprite;
            mapContainer.addChild(terrainSprite);
        }
    }
    mapContainer.x = SPRITE_SIZE/2;
    mapContainer.y = SPRITE_SIZE/2;
}

function updateContainer(): void {
    let updates = game.update();
    for (let [loc, bool] of Object.entries(updates)) {
        if (bool) {
            let pos = JSON.parse(loc);
            let age = game.age_map[pos[0]][pos[1]];
            let age_scalar = (age > 25) ? 1 : age/25;
            spriteMap[loc].tint = getTint(age_scalar, AGE_REDSCALE, AGE_GREENSCALE, AGE_BLUESCALE);
        } else {
            spriteMap[loc].tint = 0x222222;
        }
    }
}

function statsContainer(): void {
    let heatmap = game.get_heatmap();
    for (let i = 0; i < SPRITE_COUNT; i++) {
        for (let j = 0; j < SPRITE_COUNT; j++) {
            let sprite = spriteMap[Game.indexstr(i,j)]
            let spriteSize = MOBILE ? 0.5 : 1;
            sprite.scale.set(spriteSize);
            let heat_scalar = (heatmap[i][j]/0.6) > 1 ? 1 : heatmap[i][j]/0.6;
            sprite.tint = getTint(heat_scalar, HEATMAP_REDSCALE, HEATMAP_GREENSCALE, HEATMAP_BLUESCALE);
        }
    }
}

let getColor = (scalar: number, scale: number[]): number => {
    return scale[1] - Math.floor(scalar * (scale[1] - scale[0]));
}

function getTint(scalar: number, redscale: number[], greenscale: number[], bluescale: number[]): number {
    return getColor(scalar, redscale) * 256 * 256 + getColor(scalar, greenscale) * 256
            + getColor(scalar, bluescale);
}

let run = () => {
    let loop = () => {
        if (run_state) {
            updateContainer();
            setTimeout(() => {
                loop();
            }, 50);
        }
    }
    loop();
}

startButton.addEventListener("click", () => {
    run_state = true;
    run();
});

stopButton.addEventListener("click", () => {
    run_state = false;
});

seedButton.addEventListener("click", () => {
    run_state = false;
    generateContainer();
});

statButton.addEventListener("click", () => {
    run_state = false;
    statsContainer();
});
