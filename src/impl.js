import { randomFromArray, randomBool, shuffleArray, range, randomInt } from './utils.js';
import { CellMap } from './cell.js';

// This file contains all the maze generation algorithms implemented.
// 
// An implementation consists of a class with only static methods and properties.
// To be a valid implementation, a class needs to contain the following fields:
// - key: the key that will be used as the value of an HTML input element
// - display: an human-readable string that will be showed in the interface.
// - info: a list of strings that explain how the algorithm works.
//         every string corresponds to a <p> in the rendered DOM.

// Storing state for every `link` call makes algorithms slow,
// since its a copy of all the cells and links in the current grid.
// Skipping some entries allow for faster algorithms and animations.
const SKIP = 10;

class BinaryTree {
  static key = 'binary-tree';
  static display = 'Binary Tree';
  static info = [
    'O algoritmo de Árvore Binária é, possivelmente, o mais simples para se gerar labirintos.',
    'Ele consiste em escolher, para cada célula, se existe uma passagem para o norte ou para o leste.',
    'Esse algoritmo cria um corredor nas paredes ao norte e ao leste, devido à restrição de escolher uma passagem para essas direções.',
    'Além disso, os caminhos sempre são muito simples, correndo sempre na diagonal norte-leste.',
  ]

  static on(grid, states) {
    let n = 0;
    grid.cells.forEach(cell => {
      const neighbors = [];

      if (cell.north)
        neighbors.push(cell.north);

      if (cell.east)
        neighbors.push(cell.east);

      const neighbor = randomFromArray(neighbors);

      if (neighbor) {
        cell.link(neighbor);
        if (n++ % SKIP == 0)
          states.push(grid.createSnapshot());
      }
    });

    states.push(grid.createSnapshot());
    return grid;
  }
}

class Sidewinder {
  static key = 'sidewinder';
  static display = 'Sidewinder';
  static info = [
    'O algorimo Sidewinder é parecido com o de Árvore Binária.',
    'Nesse algoritmo, células adjacentes são agrupadas antes de se conectarem com a fileira ao norte.',
    'Em decorrência dessa característica, um corredor na parede norte sempre corre por toda a extensão do labirinto.',
    'O caminho entre duas células também é previsível: sempre corre na direção norte-sul com algumas variações na direção leste-oeste.',
  ]

  static on(grid, states) {
    let n = 0;
    grid.grid.forEach(row => {
      let run = [];

      row.forEach(cell => {
        run.push(cell);

        const atEasternBoundary = !cell.east
        const atNorthernBoundary = !cell.north;

        const shouldClose = atEasternBoundary ||
          (!atNorthernBoundary && randomBool())

        if (shouldClose) {
          const member = randomFromArray(run);
          if (member.north)
            member.link(member.north);

          run = [];
        } else {
          cell.link(cell.east);
        }

        if (n++ % SKIP == 0)
          states.push(grid.createSnapshot());
      });
    });

    states.push(grid.createSnapshot());
    return grid;
  }
}

// This algorithm is somewhat slow.
class HuntAndKill {
  static display = 'Hunt and Kill';
  static key = 'hunt-andkill';
  static info = [];

  static on(grid, states) {
    let n = 0;
    let current = grid.randomCell();

    while (current) {
      const unvisitedNeighbors = current.neighbors.filter(n => !n.hasAnyLink);

      if (unvisitedNeighbors.length) {
        const neighbor = randomFromArray(unvisitedNeighbors);

        current.link(neighbor);
        if (n++ % SKIP == 0)
          states.push(grid.createSnapshot());

        current = neighbor;
      } else {
        current = null;

        for (let cell of shuffleArray(grid.cells)) {
          const visitedNeighbors = cell.neighbors.filter(n => n.hasAnyLink);

          if (!cell.hasAnyLink && visitedNeighbors.length) {
            current = cell;

            const neighbor = randomFromArray(visitedNeighbors);

            current.link(neighbor);
            if (n++ % SKIP == 0)
              states.push(grid.createSnapshot());

            break;
          }
        }
      }
    }

    states.push(grid.createSnapshot());
    return grid;
  }
}

class RecursiveBacktracker {
  static display = 'Recursive Backtracker';
  static key = 'recursive-backtracker'
  static info = [];

  static on(grid, states) {
    let n = 0;

    const stack = [grid.randomCell()];

    while (stack.length > 0) {
      const current = stack.at(-1);
      const neighbors = current.neighbors.filter(n => !n.hasAnyLink);

      if (neighbors.length === 0) {
        stack.pop();
      } else {
        const neighbor = randomFromArray(neighbors);
        current.link(neighbor);
        if (n++ % SKIP == 0)
          states.push(grid.createSnapshot());
        stack.push(neighbor);
      }
    }

    states.push(grid.createSnapshot());
    return grid;
  }
}

class Kruskals {
  // a helper method that returns functions to operate on the
  // current state of the algorithm.
  static state(grid, states) {
    let n = 0;
    const neighbors = [];
    const setForCell = new CellMap();
    const cellsInSet = new Map();

    grid.cells.forEach(cell => {
      const set = setForCell.size;

      setForCell.set(cell, set);
      cellsInSet.set(set, [cell]);

      if (cell.south)
        neighbors.push([cell, cell.south]);

      if (cell.east)
        neighbors.push([cell, cell.east]);
    });

    const canMerge = (left, right) =>
      setForCell.get(left) != setForCell.get(right);

    const merge = (left, right) => {
      left.link(right);
      if (n++ % SKIP == 0)
        states.push(grid.createSnapshot());

      const winner = setForCell.get(left);
      const loser = setForCell.get(right);
      const losers = cellsInSet.get(loser) || [right];

      losers.forEach(cell => {
        cellsInSet.get(winner).push(cell);
        setForCell.set(cell, winner);
      });

      cellsInSet.delete(loser);
    }

    return { neighbors, canMerge, merge };
  }

  static display = 'Kruskals';
  static key = 'kruskals';
  static info = [];

  static on(grid, states) {
    const state = Kruskals.state(grid, states);
    const neighbors = shuffleArray(state.neighbors);

    while (neighbors.length) {
      const [left, right] = neighbors.pop();
      if (state.canMerge(left, right))
        state.merge(left, right);
    }

    states.push(grid.createSnapshot());
    return grid;
  }
}

class SimplifiedPrims {
  static display = "Prim's Simplificado";
  static key = 'simplified-prims';
  static info = [];

  static on(grid, states) {
    let active = [grid.randomCell()];
    let n = 0;

    while (active.length) {
      const cell = randomFromArray(active);
      const availableNeighbors = cell.neighbors.filter(n => !n.hasAnyLink);

      if (availableNeighbors.length) {
        const neighbor = randomFromArray(availableNeighbors);

        cell.link(neighbor);
        if (n++ % SKIP == 0)
          states.push(grid.createSnapshot());

        active.push(neighbor);
      } else {
        active = active.filter(c => !c.equals(cell));
      }
    }

    states.push(grid.createSnapshot());
    return grid;
  }
}

class RecursiveDivision {
  // Helper to implement the actual algorithm.
  static div(grid, states) {
    let n = 0;

    function divideHorizontally(row, col, height, width) {
      const divideSouthOf = randomInt(0, height - 1);
      const passageAt = randomInt(0, width);

      range(width).forEach(x => {
        if (x === passageAt) return;

        const cell = grid.at(row + divideSouthOf, col + x);
        cell.unlink(cell.south);
      });

      if (n++ % SKIP == 0)
        states.push(grid.createSnapshot());

      divide(row, col, divideSouthOf + 1, width);
      divide(row + divideSouthOf + 1, col, height - divideSouthOf - 1, width);
    }

    function divideVertically(row, col, height, width) {
      const divideEastOf = randomInt(0, width - 1);
      const passageAt = randomInt(0, height);

      range(height).forEach(y => {
        if (y === passageAt) return;

        const cell = grid.at(row + y, col + divideEastOf);
        cell.unlink(cell.east);
      });

      if (n++ % SKIP == 0)
        states.push(grid.createSnapshot());

      divide(row, col, height, divideEastOf + 1);
      divide(row, col + divideEastOf + 1, height, width - divideEastOf - 1);
    }

    function divide(row, col, height, width) {
      if (height <= 1 || width <= 1) return;

      if (height > width)
        divideHorizontally(row, col, height, width);
      else
        divideVertically(row, col, height, width);
    }

    return divide;
  }

  static display = 'Divisão Recursiva';
  static key = 'recursive-division';
  static info = [];

  static on(grid, states) {
    grid.cells.forEach(cell => {
      cell.neighbors.forEach(n => cell.link(n, false));
    });

    RecursiveDivision.div(grid, states)(0, 0, grid.rows, grid.cols);
    return grid;
  }
}

// An object contaning every algorithm.
// This is used to populate the HTML Select element
// at runtime, so new algorithms don't have to
// be inserted manually in the DOM.
export const algorithms = {
  [BinaryTree.key]: BinaryTree,
  [Sidewinder.key]: Sidewinder,
  [HuntAndKill.key]: HuntAndKill,
  [RecursiveBacktracker.key]: RecursiveBacktracker,
  [Kruskals.key]: Kruskals,
  [SimplifiedPrims.key]: SimplifiedPrims,
  [RecursiveDivision.key]: RecursiveDivision,
}
