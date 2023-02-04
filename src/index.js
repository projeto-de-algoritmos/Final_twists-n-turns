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
  grid = new Grid(ROWS, COLS, CELLSIZE);
  states = [];
  currentIndex = 0;

  const impl = algorithms[$algoSelect.value];

  // Add algorithm info to DOM.
  $info.innerHTML = impl.info.map(i => `<p>${i}</p>`).join('\n');

  // FIXME: move to webworker so the main thread is not blocked.
  impl.on(grid, states);
});

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

