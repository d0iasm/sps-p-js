const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');

let minGrid = -500;
let maxGrid = 500;
let lenScale = 500;
let scaleFrag = false;

const num = 50;

ctx.scale(0.5, 0.5);
ctx.translate(maxGrid, maxGrid);

let points = [];

for (let i = 0; i < num; i++) {
  points[i] = [random(), random()];
}

function scaleOut() {
  minGrid *= 2;
  maxGrid *= 2;
  ctx.scale(0.5, 0.5);
}

function drawGrid() {
  ctx.save();
  ctx.strokeStyle = '#aaa';
  for (let x = minGrid; x < maxGrid; x += lenScale) {
    ctx.beginPath();
    ctx.moveTo(x, minGrid);
    ctx.lineTo(x, maxGrid);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(minGrid, x);
    ctx.lineTo(maxGrid, x);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDot(x, y) {
  ctx.save();
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI, true);
  ctx.fill();
  ctx.restore();
}

function random() {
  return (Math.random() - 0.5) * 10;
}

function step() {
  let ps = [];
  for (let p of points) {
    let x = p[0] + (Math.random() - 0.5) * 3;
    let y = p[1] + (Math.random() - 0.5) * 3;
    if (x < minGrid || maxGrid < x) scaleFrag = true;
    if (y < minGrid || maxGrid < y) scaleFrag = true;
    ps.push([x, y]);
  }
  points = ps;
}

window.setInterval(function() {
  ctx.clearRect(minGrid, minGrid, maxGrid-minGrid, maxGrid-minGrid);

  drawGrid();
  step();
  if (scaleFrag) {
    scaleOut();
    scaleFrag = false;
  }

  for (let p of points) {
    drawDot(p[0], p[1]);
  }
}, 1);

