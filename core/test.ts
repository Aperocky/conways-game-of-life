import { Game } from "./game";

let game: Game = new Game();
game.initiate(0.2, 10);
console.log(game.state);
console.log(game.n_count);
