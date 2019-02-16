const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
ctx.scale(0.5, 0.5);
ctx.translate(500, 500);

const nPoints = 50;
const RED = 0;
const BLUE = 1;

let currentScale = 1;
let timestep = 0;
let points = [];

function initPoints() {
  for (let i = 0; i < nPoints; i++) {
    let color = (i < nPoints / 2) ? RED : BLUE;
    points[i] = {x: random(), y: random(), color: color};
  }
}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = '#aaa';
  ctx.lineWidth = 1 / currentScale;

  const len = 5000;
  for (let x = -len; x < len; x += 100) {
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

function drawDot(p) {
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

function getK(pi, pj) {
  let k = [[0.8, 0.4], [0.8, 0.4]];
  return k[pi.color][pj.color];
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
  let k = -1;

  for (let pi of points) {
    let x = 0;
    let y = 0;

    for (let pj of points) {
      if (pi == pj) continue;

      const diffV = subtract(pi, pj);
      const diff = length(diffV);
      const k = getK(pi, pj);
      x += (k * Math.pow(diff, -1) - Math.pow(diff, -2)) * diffV.x;
      y += (k * Math.pow(diff, -1) - Math.pow(diff, -2)) * diffV.y;
    }
    ps.push({x: pi.x + rungeKutta(x), y: pi.y + rungeKutta(y), color: pi.color});
  }
  points = ps;
}

function scaleout() {
  let max = 0;
  for (let p of points) {
    max = Math.max(max, Math.abs(p.x), Math.abs(p.y));
  }

  let scale = 500 / (max * 1.2);
  ctx.scale(scale, scale);
  currentScale = scale;
}

function redraw() {
  ctx.save();
  ctx.clearRect(-50000, -50000, 100000, 100000);

  scaleout();
  drawGrid();

  for (let p of points) {
    drawDot(p);
  }
  ctx.restore();
}

initPoints();
window.setInterval(function() {
  step();
  if (timestep % 50 == 0) {
    redraw();
    document.getElementById('timestep').innerText = timestep;
  }
}, 0);
