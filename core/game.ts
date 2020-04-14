export class Game {
    state: boolean[][]; // Current state of the game
    n_count: number[][]; // Current neighbor count
    stats: number[][]; // Cumulative time a spot had been alive
    age_map: number[][]; // Amount of time a spot have been alive, reset when state change.
    size: number; // Size of the map

    static indexstr(i: number, j: number): string {
        return JSON.stringify([i,j]);
    }

    initiate(chance=0.2, size=40) {
        this.size = size;
        this.initiate_map(chance, size);
        this.state_count();
    }

    initiate_map(chance=0.2, size=40) {
        this.state = [];
        this.stats = []
        this.n_count = [];
        this.age_map = [];
        for (let i=0; i<size; i++) {
            this.state[i] = [];
            this.stats[i] = [];
            this.n_count[i] = [];
            this.age_map[i] = [];
            for (let j=0; j<size; j++) {
                this.state[i][j] = (Math.random() < 0.2) ? true : false;
                this.n_count[i][j] = 0;
                this.stats[i][j] = 0;
                this.age_map[i][j] = 0;
            }
        }
    }

    state_count() {
        for (let i=0; i<this.size; i++) {
            for (let j=0; j<this.size; j++) {
                this.n_count[i][j] = this.get_neighbor_sum(i, j);
            }
        }
    }

    get_neighbor_sum(i:number, j:number): number {
        // Get 8 set of coordinates and sum them.
        // We need to get i-1, i, i+1, and same for j. Except for when they're on the edge.
        let get_adjacent = (num: number) : number[] => {
            if (num == 0) {
                return [this.size-1, 0, 1];
            } else if (num == this.size-1) {
                return [num-1, num, 0];
            } else {
                return [num-1, num, num+1];
            }
        }
        let cross = (is: number[], js: number[]) => {
            let crosses = [];
            for (let i=0; i<is.length; i++) {
                for (let j=0; j<js.length; j++) {
                    crosses.push([is[i],js[j]]);
                }
            }
            return crosses;
        }
        let i_nums: number[] = get_adjacent(i);
        let j_nums: number[] = get_adjacent(j);
        let pairs = cross(i_nums, j_nums);
        let sum: number = 0;
        for (let pair of pairs) {
            if (pair[0] == i && pair[1] == j) {
                continue;
            }
            sum += (this.state[pair[0]][pair[1]] ? 1 : 0);
        }
        return sum;
    }

    update(): {[loc:string]: boolean} {
        let change_set: {[loc:string]: boolean} = {};
        for (let i=0; i<this.size; i++) {
            for (let j=0; j<this.size; j++) {
                if (this.state[i][j]) {
                    this.stats[i][j] += 1;
                    this.age_map[i][j] += 1;
                    if (this.n_count[i][j] < 2 || this.n_count[i][j] > 3) {
                        this.state[i][j] = false;
                        change_set[Game.indexstr(i, j)] = false;
                    } else {
                        change_set[Game.indexstr(i, j)] = true;
                    }
                } else {
                    this.age_map[i][j] = 0;
                    if (this.n_count[i][j] == 3) {
                        this.state[i][j] = true;
                        change_set[Game.indexstr(i, j)] = true;
                    }
                }
            }
        }
        this.state_count();
        return change_set;
    }

    get_heatmap(): number[][] {
        let max = 0;
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.stats[i][j] > max) {
                    max = this.stats[i][j];
                }
            }
        }
        let heatmap = []
        for (let i = 0; i < this.size; i++) {
            heatmap[i] = [];
            for (let j = 0; j < this.size; j++) {
                heatmap[i][j] = this.stats[i][j] / max;
            }
        }
        return heatmap;
    }
}
