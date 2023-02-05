import { Grid } from './grid.js'
import { algorithms } from './impl.js';

onmessage = (e) => {
  console.log('Worker: received message')
  const { algo, ROWS, COLS, CELLSIZE } = e.data
  const impl = algorithms[algo];
  const grid = new Grid(ROWS, COLS, CELLSIZE);

  const states = []
  const startTime = performance.now();
  impl.on(grid, states)
  const endTime = performance.now();

  console.log(`Worker: finished algorithm in ${endTime - startTime} ms`);
  postMessage({ states, grid: grid.serialize() });
}
