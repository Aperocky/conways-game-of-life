import sys
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as anim
import argparse

class Game:

    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.array = np.zeros((x,y), dtype=bool)

    def set_initial_array(self, arr, x=25, y=25):
        arr = np.array(arr, dtype=bool)
        if x+arr.shape[0] >= self.x or y+arr.shape[1] >= self.y:
            raise ValueError("starting array too large")
        self.array[x:x+arr.shape[0], y:y+arr.shape[1]] = arr

    # Get the sum of alive cell around each cell
    def sum_edges(self):
        # Get wrapped padded array
        scroll = np.pad(self.array, 1, 'wrap')
        # 8 edges
        combs = [(i,j) for i in range(3) for j in range(3) if not (i, j) == (1,1)]
        master = np.zeros((self.x,self.y), dtype=np.int8)
        for ij in combs:
            combstrix = scroll[ij[0]:ij[0]+self.x, ij[1]:ij[1]+self.y]
            master += combstrix
        return master

    def iterate(self, edgesum):
        curr_array = self.array
        keep_alive = np.logical_and(curr_array==1, np.isin(edgesum,[2,3]))
        newborn = np.logical_and(curr_array==0, edgesum==3)
        new_array = np.logical_or(keep_alive, newborn)
        self.array = new_array

    def run(self):
        edgesum = self.sum_edges()
        self.iterate(edgesum)
        return self.array
        

class Art:

    def __init__(self, game):
        self.game = game
        self.disturbed = np.zeros(self.game.array.shape)
        self.fig = plt.figure(figsize=(12,8))
        self.ax = self.fig.add_subplot(111)
        self.im = self.ax.imshow(game.array, interpolation=None, cmap='gray')
        self.text = self.ax.text(0.5,1.05,"Iteration 0", transform=self.ax.transAxes,
                horizontalalignment='center')
        self.iter = 0
        self.records = []

    def update(self, i):
        arr = self.game.run()
        self.im.set_array(arr)
        self.records.append(np.sum(arr))
        self.iter += 1
        self.text.set_text('Iteration {}'.format(self.iter))
        self.disturbed += arr
        return self.im, self.text

    def show(self):
        ani = anim.FuncAnimation(self.fig, self.update, 500, interval=20)
        plt.show()
        plt.imshow(self.disturbed, cmap='Greens', vmin=np.max(self.disturbed)/40, vmax=np.amax(self.disturbed)/10)
        plt.show()
        plt.plot(self.records)
        plt.grid(True)
        plt.show()

    @staticmethod
    def rolling_average(l, w=50):
        rolling = []
        lroll = sum(l[:w])
        pos = np.array([0, w])
        while True:
            rolling.append(lroll)
            lroll = lroll + l[pos[1]] - l[pos[0]]
            pos += 1
            if pos[1] == len(l):
                break
        rolling = np.array([rolling[0]]*25 + rolling + [rolling[-1]]*25)/w
        return rolling


def just_get_heatmap(game):
    heatmap = np.zeros(game.array.shape)
    popcount = []
    countiter = 0
    track = 0
    prevcount = 0
    while True:
        countiter += 1
        print("Current Iteration: {} \t\t Population: {}".format(countiter, prevcount))
        arr = game.run()
        heatmap += arr
        currcount = np.sum(arr)
        popcount.append(currcount)
        if currcount == prevcount:
            track += 1
        else:
            track = 0
        prevcount = currcount
        if track > 100:
            break
    plt.grid(True)
    plt.imshow(heatmap, cmap='Greens', vmin=np.max(heatmap)/40, vmax=np.amax(heatmap)/10)
    plt.show()
    plt.grid(True)
    rolling = Art.rolling_average(popcount)
    plt.plot(popcount)
    plt.plot(rolling, 'r-')
    plt.show()


def get_random_array(x, y, c):
    arr = np.random.choice([0,1], p=[1-c,c], size=(x,y))
    return arr


if __name__ == '__main__':
    fname = None
    if len(sys.argv) > 1:
        fname = sys.argv[1]
    if fname is not None:
        initial_array = np.genfromtxt(fname)
    else:
        initial_array = get_random_array(50,50,0.2)
    game = Game(100,100)
    game.set_initial_array(initial_array) 
    visual = Art(game)
    visual.show()
