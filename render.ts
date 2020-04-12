import * as PIXI from "pixi.js";
import { Game } from "./core/game";

const app = new PIXI.Application({
    width: 640, height: 640
});
let gamezone = document.getElementById("mapspace");
gamezone.appendChild(app.view);
app.renderer.plugins.interaction.autoPreventDefault = false;

const mapContainer = new PIXI.Container();
const startButton = document.getElementById("startgame");
const stopButton = document.getElementById("stopgame");
const seedButton = document.getElementById("seedgame");
app.stage.addChild(mapContainer);

const SPRITE_COUNT = 40;
const SPRITE_SIZE = 16;
const game = new Game();
let spriteMap = {};
let run_state = false;

generateContainer();

function getSprite(toggle: boolean): PIXI.Sprite {
    let texture = PIXI.Texture.WHITE;
    let sprite = new PIXI.Sprite(texture);
    if (toggle) {
        sprite.tint = 0xeeeeee;    
    } else {
        sprite.tint = 0x111111;
    }
    sprite.anchor.set(0.5);
    sprite.scale.set(0.875);
    return sprite;
}

function generateContainer(): void {
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
        spriteMap[loc].tint = bool ? 0xeeeeee : 0x111111;
    }
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
    generateContainer();
});
