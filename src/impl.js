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
