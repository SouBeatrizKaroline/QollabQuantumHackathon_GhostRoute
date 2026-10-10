/* Run from the repository: node tests/estimator.cjs */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const engine = fs.readFileSync(path.join(__dirname, '../public/assets/js/engine.js'), 'utf8').replace(/\r\n/g, '\n');
const context = vm.createContext({ console, Float32Array, Float64Array, Set, Map, Math });
vm.runInContext(engine + '\nthis.API={BayesianGridEstimator,TacticalMapRenderer,calcPhi,getRamseyProbabilities};', context);
const { BayesianGridEstimator, TacticalMapRenderer, calcPhi, getRamseyProbabilities } = context.API;
const near = (actual, expected, tolerance = 1e-5) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
const mass = estimator => Array.from(estimator.grid).reduce((sum, p) => sum + p, 0);
const mean = estimator => {
  let x = 0, y = 0;
  for (let i = 0; i < estimator.grid.length; i++) {
    x += (i % estimator.size) * estimator.grid[i];
    y += Math.floor(i / estimator.size) * estimator.grid[i];
  }
  const total = mass(estimator);
  return [x / total, y / total];
};

const northeast = new BayesianGridEstimator();
const displacement = 7.5 / Math.sqrt(2);
for (let turn = 0; turn < 12; turn++) {
  northeast.predict(displacement, displacement);
  near(mass(northeast), 1);
}
const location = mean(northeast);
near(location[0], 10 + displacement * 12, 0.001);
near(location[1], 15 + displacement * 12, 0.001);
console.log('PASS fractional northeast transport preserves the commanded mean over 12 turns');

const boundary = new BayesianGridEstimator();
assert.equal(boundary.size, 101, 'Both 0 and 100 km need represented nodes');
boundary.grid.fill(0);
boundary.grid[15 * boundary.size + 95] = 1;
boundary.predict(7.5, 0);
near(mass(boundary), 1);
near(mean(boundary)[0], 100);
assert.equal(boundary.getMAP().join(','), '100,15');
assert.ok(boundary.isGPSInsideHPD(100, 15, boundary.getHPD95()), 'Honest GPS on the upper boundary must remain inside its credible region');
boundary.predict(7.5, 0);
near(mass(boundary), 1);
near(mean(boundary)[0], 100);
assert.equal(boundary.isGPSInsideHPD(100.1, 15, boundary.getHPD95()), false, 'Outside coordinates must not round into the map');
assert.equal(boundary.isGPSInsideHPD(NaN, 15, boundary.getHPD95()), false);
boundary.grid.fill(0);
boundary.grid[0] = 1;
boundary.predict(-7.5, -7.5);
near(mass(boundary), 1);
assert.equal(boundary.getMAP().join(','), '0,0');
assert.ok(boundary.isGPSInsideHPD(0, 0, boundary.getHPD95()));
console.log('PASS boundary-clamped movement conserves mass and admits honest GPS at 0 and 100 km');

const measured = new BayesianGridEstimator();
for (let turn = 1; turn <= 12; turn++) {
  measured.predict(displacement, displacement);
  const target = [10 + displacement * turn, 15 + displacement * turn];
  const n = turn % 2 ? 1 : 3;
  const { pX, pY } = getRamseyProbabilities(calcPhi(...target), n);
  measured.update(Math.round(pX * 250), 250, Math.round(pY * 250), 250, n);
  near(mass(measured), 1, 1e-4);
  assert.ok(Array.from(measured.grid).every(p => Number.isFinite(p) && p >= 0));
  const credibleMass = Array.from(measured.getHPD95()).reduce((sum, i) => sum + measured.grid[i], 0);
  assert.ok(credibleMass >= 0.95 - 1e-6, `HPD mass ${credibleMass} must cover at least 95%`);
}
console.log('PASS sensor updates remain normalized with a valid 95% credible region');

const renderer = Object.create(TacticalMapRenderer.prototype);
let cells = [];
renderer.ctx = { fillRect() {} };
renderer.scale = 1;
renderer.worldToScreen = (x, y) => { cells.push([x, y]); return { sx: x, sy: y }; };
const sparse = new BayesianGridEstimator();
sparse.grid.fill(0); sparse.grid[100 * sparse.size + 100] = 1;
renderer.drawHeatmap(sparse);
assert.deepEqual(cells, [[100, 100]], 'Heatmap indexing must use the estimator grid size');
console.log('PASS heatmap renders the inclusive upper-right node at its correct world coordinate');
