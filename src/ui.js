// Helper class to render grids and paths onto a HTML Canvas.
export class UI {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // To make drawing cells easier, this method returns a
  // function that draws a line between two points.
  //
  // Batching actions is important, since the canvas is not
  // very fast. Returning a function instead of drawing immediately
  // makes batching actions possible.
  drawLine(x1, y1, x2, y2) {
    return () => {
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
    }
  }

  // Executes a list of actions in a single stroke call.
  execute(actions) {
    this.ctx.beginPath();

    actions.forEach(action => action());

    this.ctx.stroke();
  }

  // Renders a snapshot of the grid.
  // TODO: remove the grid argument and add cellSize to the snapshot.
  renderGrid(grid, snapshot) {
    const cellSize = grid.cellSize;
    const actions = [];

    snapshot.forEach(cell => {
      const x1 = cell.col * cellSize;
      const y1 = cell.row * cellSize;
      const x2 = (cell.col + 1) * cellSize;
      const y2 = (cell.row + 1) * cellSize;

      if (!cell.north)
        actions.push(this.drawLine(x1, y1, x2, y1));
      if (!cell.west)
        actions.push(this.drawLine(x1, y1, x1, y2));
      if (!cell.east)
        actions.push(this.drawLine(x2, y1, x2, y2));
      if (!cell.south)
        actions.push(this.drawLine(x1, y2, x2, y2));
    });

    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#fff';
    this.clear();
    this.execute(actions);
  }

  // Renders a path.
  renderPath(grid, path) {
    // Calculates the (x,y) coordinates in the middle of
    // a cell at (row,col).
    const middleOfCell = (cell) => {
      const y = cell.row * grid.cellSize + grid.cellSize / 2;
      const x = cell.col * grid.cellSize + grid.cellSize / 2;

      return [x, y];
    }


    // Rendering the grid is a good idea.
    this.renderGrid(grid, grid.createSnapshot());

    this.ctx.beginPath();
    this.ctx.moveTo(...middleOfCell(path[0]));

    path.slice(1).forEach(p => {
      this.ctx.lineTo(...middleOfCell(p))
    })

    // A gradient makes the path more interesting to look at.
    const gradient = this.ctx.createLinearGradient(
      ...middleOfCell(path.at(0)),
      ...middleOfCell(path.at(-1)),
    );

    // Good enough rainbow gradient.
    gradient.addColorStop(0, 'rgb(255, 0, 0)');
    gradient.addColorStop(0.1, 'rgb(255, 154, 0)');
    gradient.addColorStop(0.2, 'rgb(208, 222, 33)');
    gradient.addColorStop(0.3, 'rgb(79, 220, 74)');
    gradient.addColorStop(0.4, 'rgb(63, 218, 216)');
    gradient.addColorStop(0.5, 'rgb(47, 201, 226)');
    gradient.addColorStop(0.6, 'rgb(28, 127, 238)');
    gradient.addColorStop(0.7, 'rgb(95, 21, 242)');
    gradient.addColorStop(0.8, 'rgb(186, 12, 248)');
    gradient.addColorStop(0.9, 'rgb(251, 7, 217)');
    gradient.addColorStop(1, 'rgb(255, 0, 0)');

    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = gradient;
    this.ctx.stroke();
  }
}
