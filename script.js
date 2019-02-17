// Main canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
ctx.scale(0.65, 0.65);
ctx.translate(500, 500);

// Log log graph
const graph = document.getElementById("graph");
const gctx = graph.getContext('2d');
gctx.scale(150, 150);

// HTML elements
const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');

// Constants
const numPoints = 50;
const RED = 0;
const BLUE = 1;

// Variables
let K = [[0, 0], [0, 0]];
let currentScale = 1;
let timestep = 0;
let points = [];
let handle;

// Graph
let xv = [];
let center;

function initPoints() {
  for (let i = 0; i < numPoints; i++) {
    const color = (i < numPoints / 2) ? RED : BLUE;
    points[i] = {x: random(), y: random(), color: color};
  }
  center = computeCenter();
}

function random() {
  return (Math.random() - 0.5) * 10;
}

function computeCenter() {
  let x = 0;
  let y = 0;
  for (let p of points) {
    x += p.x;
    y += p.y;
  }
  return {x: x / points.length, y: y / points.length};
}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = '#aaa';
  ctx.lineWidth = 1 / currentScale;

  const len = 5000;
  for (let x = -len; x < len; x += 10) {
    ctx.beginPath();
    ctx.moveTo(x, -len);
    ctx.lineTo(x, len);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-len, x);
    ctx.lineTo(len, x);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPoint(p) {
  ctx.save();
  ctx.fillStyle = (p.color == RED) ? 'red' : 'blue';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 5 / currentScale, 0, 2 * Math.PI, true);
  ctx.fill();
  ctx.restore();
}

function rungeKutta(k1) {
  const k2 = k1 + k1 * 0.002 * 0.5;
  const k3 = k1 + k2 * 0.002 * 0.5;
  const k4 = k1 + k3 * 0.002;
  return (k1 + 2 * k2 + 2 * k3 + k4) * (0.002 / 6.0);
}

function distance(p, q) {
  const dx = p.x - q.x;
  const dy = p.y - q.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function computeXV(delta) {
  // Compute values for drawing the graph. First, compute X.
  let sum = 0;
  for (let p of points) {
    sum += distance(center, p);
  }
  let x = points.length / sum;

  // Compute V.
  let newCenter = computeCenter();
  let cdx = newCenter.x - center.x;
  let cdy = newCenter.y - center.y;
  sum = 0;
  for (let d of delta) {
    let dx = d.x - cdx;
    let dy = d.y - cdy;
    sum += Math.sqrt(dx * dx + dy * dy);
  }
  let v = sum / points.length;

  center = newCenter;
  xv.push({x: x, v: v});
}

function step() {
  timestep++;
  let ps = [];
  let delta = [];

  for (let pi of points) {
    let x = 0;
    let y = 0;

    for (let pj of points) {
      if (pi == pj) continue;

      const dx = pj.x - pi.x;
      const dy = pj.y - pi.y;
      const dist = distance(pi, pj);
      const k = K[pi.color][pj.color];
      x += (k / dist - dist ** -2) * dx / dist;
      y += (k / dist - dist ** -2) * dy / dist;
    }
    x = rungeKutta(x);
    y = rungeKutta(y);
    ps.push({x: pi.x + x, y: pi.y + y, color: pi.color});
    delta.push({x: x, y: y});
  }
  points = ps;

  computeXV(delta);
}

function redrawParams() {
  const p = (K[0][1] + K[1][0]) / 2;

  document.getElementById('k0').value = K[0][0];
  document.getElementById('k1').value = K[0][1];
  document.getElementById('k2').value = K[1][0];
  document.getElementById('k3').value = K[1][1];

  document.getElementById('ra').value = K[0][0];
  document.getElementById('rp').value = p;
  document.getElementById('rm').value = K[0][1] - p;
  document.getElementById('rb').value = K[1][1];
}

function readK() {
  K[0][0] = parseFloat(document.getElementById('k0').value);
  K[0][1] = parseFloat(document.getElementById('k1').value);
  K[1][0] = parseFloat(document.getElementById('k2').value);
  K[1][1] = parseFloat(document.getElementById('k3').value);
  redrawParams();
}

function readR() {
  const a = parseFloat(document.getElementById('ra').value);
  const p = parseFloat(document.getElementById('rp').value);
  const m = parseFloat(document.getElementById('rm').value);
  const b = parseFloat(document.getElementById('rb').value);

  K[0][0] = a;
  K[0][1] = p + m;
  K[1][0] = p - m;
  K[1][1] = b;

  redrawParams();
}

function scaleout() {
  let max = 0;
  for (let p of points) {
    max = Math.max(max, Math.abs(p.x), Math.abs(p.y));
  }

  currentScale = 500 / (max * 1.2);
  ctx.scale(currentScale, currentScale);
}

function redraw() {
  ctx.save();
  ctx.clearRect(-50000, -50000, 100000, 100000);

  drawGraph();
  scaleout();
  drawGrid();

  for (let p of points) {
    drawPoint(p);
  }
  ctx.restore();
}

function mainloop() {
  for (let i = 0; i < 500; i++) {
    step();
  }
  redraw();
  document.getElementById('timestep').innerText = timestep;
}

function start() {
  readK();
  handle = window.setInterval(mainloop, 0);
  startButton.innerText = 'Stop';
}

function stop() {
  window.clearInterval(handle);
  handle = undefined;
  startButton.innerText = 'Start';
}

function reset() {
  gctx.clearRect(-50000, -50000, 100000, 100000);

  const running = handle;
  if (running) stop();
  initPoints();
  timestep = 0;
  if (running) start();
}

function drawGraph() {
  gctx.save();
  gctx.translate(0.5, 0.5);
  gctx.scale(.1, .1);
  gctx.transform(1, 0, 0, -1, 0, 0);

  gctx.save();
  gctx.strokeStyle = '#000';
  gctx.lineWidth = 0.01;

  gctx.beginPath();
  gctx.moveTo(-1000, 0);
  gctx.lineTo(2000, 0);
  gctx.stroke();

  gctx.beginPath();
  gctx.moveTo(0, -1000);
  gctx.lineTo(0, 2000);
  gctx.stroke();
  gctx.restore();

  gctx.fillStyle = 'black';
  
  for (let p of xv) {
    let v = Math.log10(1000 * p.v + 1);
    let x = Math.log10(1000 * p.x + 1);

    gctx.beginPath();
    gctx.arc(x, v, 0.003, 0, 2 * Math.PI, true);
    gctx.fill();
  }

  xv = [];
  gctx.restore();
}

startButton.addEventListener('click', function() {
  if (handle) {
    stop();
  } else {
    start();
  }
});

resetButton.addEventListener('click', reset);

for (let elem of document.getElementsByTagName('input')) {
  elem.addEventListener('change', function(event) {
    if (event.currentTarget.id.startsWith('k')) {
      readK();
    } else {
      readR();
    }
    reset();
  });
}

initPoints();
start();
