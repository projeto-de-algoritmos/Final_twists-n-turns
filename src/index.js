import { Grid } from './grid.js';
import { algorithms } from './impl.js';
import { findPath } from './pathfinding.js';
import { UI } from './ui.js';

/// Constants.
// TODO: Make configurable?
const WIDTH = 600;
const HEIGHT = 600;
const CELLSIZE = 10;

// The amount of rows and columns is always computable.
const COLS = Math.floor(WIDTH / CELLSIZE);
const ROWS = Math.floor(HEIGHT / CELLSIZE);

/// Elements
const $canvas = document.getElementById('main-canvas');
const $algoSelect = document.getElementById('algo-select');
const $clear = document.getElementById('clear');
const $info = document.getElementById('info');

const $findPath = document.getElementById('find-path');
const $otherPath = document.getElementById('other-path');

$canvas.width = WIDTH;
$canvas.height = HEIGHT;

// Addding the implementations to algorithm `select` input.
Object.entries(algorithms).forEach(([name, impl]) => {
  $algoSelect.appendChild(new Option(impl.display, name));
});

const ui = new UI($canvas);
const implWorker = new Worker('src/worker.js', { type: 'module' });

// TODO: Make these not global. Maybe inject them into all places that uses them.
let grid = null;
let states = [];
let currentIndex = 0;


// Find path between top right and bottom left.
$findPath.addEventListener('click', () => {
  const p = findPath(grid.at(0, 0), grid.at(grid.rows - 1, grid.cols - 1));
  ui.renderPath(grid, p);
})

// Find path between bottom left and top right;
$otherPath.addEventListener('click', () => {
  const p = findPath(grid.at(grid.rows - 1, 0), grid.at(0, grid.cols - 1));
  ui.renderPath(grid, p);
})

// (Re)generate grid on input change.
$algoSelect.addEventListener('change', () => {
  // When generating, state should be reset.
  states = [];
  currentIndex = 0;

  const impl = algorithms[$algoSelect.value];

  // Add algorithm info to DOM.
  $info.innerHTML = impl.info.map(i => `<p>${i}</p>`).join('\n');

  // Clearing previous maze
  ui.clear();

  // Starting algorithm in a webworker.
  // The algorithms can take multiple seconds, so doing this in a separate thread
  // unblocks the UI.
  //
  // Even though most of the work is done outside of the main thread, the animation
  // data consists of a large quantity of grids at different points in time.
  // This takes a while to be copied later, so the main thread is still blocked at
  // that time.
  //
  // A better solution could be implemented if the animation task was streaming instead,
  // buffering frames and disposing of them when they are rendered into the canvas.
  // This is hard to do, though.
  //
  // Another possible solution would be to improve the rendering algorithm to only
  // take the diff between two states and render only the changes. This would make
  // the animation data smaller, since most cells don't change at all from one frame
  // to another.
  implWorker.postMessage({ algo: $algoSelect.value, ROWS, COLS, CELLSIZE });
});

// Receives the animation data and grid from the webworker.
implWorker.onmessage = (e) => {
  currentIndex = 0;
  states = e.data.states;
  const g = Grid.deserialize(e.data.grid);
  grid = g;
}

// Clears 
$clear.addEventListener('click', () => {
  grid = null;
  ui.clear()
});

// Main animation loop.
const animate = () => {
  setTimeout(() => {
    requestAnimationFrame(animate);

    // Animate the algorithm if there is any state left.
    // If not, the animation is over and we can enable the UI again.
    if (currentIndex < states.length) {
      ui.renderGrid(grid, states[currentIndex]);
      currentIndex++;
      $clear.disabled = true;
      $findPath.disabled = true;
      $otherPath.disabled = true;
      $algoSelect.disabled = true;
    } else {
      $clear.disabled = false;
      $findPath.disabled = false;
      $otherPath.disabled = false;
      $algoSelect.disabled = false;
    }
  }, 1000 / 120);
}

// Only start the main animation loop when the window finishes loading.
window.addEventListener('load', () => animate(), false);

