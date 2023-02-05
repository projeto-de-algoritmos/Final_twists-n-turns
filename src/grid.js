import { range, randomFromArray } from './utils.js';
import { Cell } from './cell.js';

// Represents a grid.
//
// This contains cells and handles the relationships between cells.
export class Grid {
  constructor(rows, cols, cellSize) {
    this.rows = rows;
    this.cols = cols;
    this.cellSize = cellSize;

    // Initially, there are no cells in the grid.
    this.grid = this.prepareGrid();
    this.configureCells();
  }

  // Populate grid with cells in each spot.
  prepareGrid() {
    return range(this.rows).map(row =>
      range(this.cols).map(col =>
        new Cell(row, col)
      )
    );
  }

  // Links cells to their neighbors.
  //
  // This takes into account eges.
  configureCells() {
    this.cells.forEach(cell => {
      const { row, col } = cell;
      cell.north = this.at(row - 1, col);
      cell.south = this.at(row + 1, col);
      cell.west = this.at(row, col - 1);
      cell.east = this.at(row, col + 1);
    });
  }

  // Return cells as a one-dimensional array.
  //
  // This returns a new array and not a reference to the internal
  // grid structure, so callers are able to mutate as needed without
  // messing up the internal representation of the class.
  get cells() {
    return this.grid.flat();
  }

  get size() {
    return this.rows * this.cols;
  }

  // Get a cell at (row, col).
  at(row, col) {
    if (row < 0 || row > this.rows - 1 ||
      col < 0 || col > this.grid[row].length)
      return undefined;

    return this.grid[row][col];
  }

  // Get a random cell from the grid.
  randomCell() {
    return randomFromArray(this.cells);
  }

  // Creates a snapshot of the current state of the grid.
  //
  // This is useful for storing a history of changes during
  // the execution of an algorithm, so the steps can be used
  // for animation at a later time.
  createSnapshot() {
    return this.cells.map(cell => ({
      row: cell.row,
      col: cell.col,
      north: !!cell.north,
      west: !!cell.west,
      east: cell.hasLink(cell.east),
      south: cell.hasLink(cell.south),
    }));
  }

  serialize() {
    const cellData = this.cells.map(
      cell => ({
        row: cell.row,
        col: cell.col,
        links: Array.from(cell.links.keys()).map(x => [x.row, x.col]),
      })
    )

    return {
      rows: this.rows,
      cols: this.cols,
      cellSize: this.cellSize,
      cellData,
    }
  }

  static deserialize({ rows, cols, cellSize, cellData }) {
    const grid = new Grid(rows, cols, cellSize);

    cellData.forEach(data => {
      const cell = grid.at(data.row, data.col);

      data.links.forEach(([row, col]) => {
        cell.link(grid.at(row, col));
      })
    })

    return grid;
  }
}
