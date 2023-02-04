import { CellMap } from './cell.js';

// Simple breadth-first search to find shortest path between two points in a grid.
//
// As the bottleneck of the application is the maze generation animation process,
// a BFS should be enough for up to 100 * 100 cells in a grid.
export const findPath = (start, end) => {
  const queue = [start];
  const parent = new CellMap();

  parent.set(start, null);

  while (queue.length) {
    const current = queue.shift();

    if (!current || current.equals(end)) break;

    current.neighbors
      .filter(n => current.hasLink(n) && !parent.has(n))
      .forEach(n => {
        parent.set(n, current);
        queue.push(n);
      })
  }

  // Instead of returning the map with all parent-children relationships,
  // we can unwind the successful path to return only the shortest one.
  const path = [];
  let node = end;

  while (node) {
    path.push(node);
    node = parent.get(node);
  }

  return path;
}
