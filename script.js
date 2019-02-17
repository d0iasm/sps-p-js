const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
ctx.scale(0.65, 0.65);
ctx.translate(500, 500);

const startButton = document.getElementById('start');
const resetButton = document.getElementById('reset');

const numPoints = 50;
const RED = 0;
const BLUE = 1;

let K = [[0, 0], [0, 0]];
let currentScale = 1;
let timestep = 0;
let points = [];
let handle;

function initPoints() {
  for (let i = 0; i < numPoints; i++) {
    const color = (i < numPoints / 2) ? RED : BLUE;
    points[i] = {x: random(), y: random(), color: color};
  }
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

function random() {
  return (Math.random() - 0.5) * 10;
}

function subtract(ri, rj) {
  return {x: rj.x - ri.x, y: rj.y - ri.y};
}

function length(vector) {
  return Math.sqrt(vector.x**2 + vector.y**2);
}

function rungeKutta(k1) {
  const k2 = k1 + k1 * 0.002 * 0.5;
  const k3 = k1 + k2 * 0.002 * 0.5;
  const k4 = k1 + k3 * 0.002;
  return (k1 + 2 * k2 + 2 * k3 + k4) * (0.002 / 6.0);
}

function step() {
  timestep++;
  let ps = [];

  for (let pi of points) {
    let x = 0;
    let y = 0;

    for (let pj of points) {
      if (pi == pj) continue;

      const diffV = subtract(pi, pj);
      const dis = length(diffV);
      const k = K[pi.color][pj.color];
      x += (k / dis - dis ** -2) * diffV.x / dis;
      y += (k / dis - dis ** -2) * diffV.y / dis;
    }
    ps.push({x: pi.x + rungeKutta(x), y: pi.y + rungeKutta(y), color: pi.color});
  }
  points = ps;
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
  const running = handle;
  if (running) stop();
  initPoints();
  timestep = 0;
  if (running) start();
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
