const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const N = 9;
const COINC_WINDOW = 180;

let W, H;
let positions = [];
let weights = [];
let fireTime = [];
let activation = [];
let totalFires = 0, totalCoinc = 0;
let t = 0;
let eta = 0.05, decayRate = 0.002, fireRate = 6;

function resize() {
  const rect = canvas.getBoundingClientRect();
  W = canvas.width = rect.width * window.devicePixelRatio;
  H = canvas.height = rect.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  buildPositions();
}

function buildPositions() {
  positions = [];
  const cols = 3, rows = 3;
  const rw = canvas.getBoundingClientRect().width;
  const rh = canvas.getBoundingClientRect().height;
  const padX = rw * 0.15, padY = rh * 0.15;
  const gapX = (rw - padX * 2) / (cols - 1);
  const gapY = (rh - padY * 2) / (rows - 1);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      positions.push({ x: padX + c * gapX, y: padY + r * gapY });
}

function resetState() {
  weights = Array.from({ length: N }, () => new Array(N).fill(0));
  fireTime = new Array(N).fill(-9999);
  activation = new Array(N).fill(0);
  totalFires = 0;
  totalCoinc = 0;
  updateStats();
}

function fireNeuron(i) {
  activation[i] = 1.0;
  fireTime[i] = t;
  totalFires++;
  for (let j = 0; j < N; j++) {
    if (j === i) continue;
    if (t - fireTime[j] < COINC_WINDOW) {
      const dw = eta;
      weights[i][j] = Math.min(1, weights[i][j] + dw);
      weights[j][i] = Math.min(1, weights[j][i] + dw);
      totalCoinc++;
    }
  }
}

function fireAll() {
  for (let i = 0; i < N; i++) fireNeuron(i);
}

function updateStats() {
  document.getElementById('s-fires').textContent = totalFires;
  document.getElementById('s-coinc').textContent = totalCoinc;
  let mx = 0;
  for (let i = 0; i < N; i++)
    for (let j = i + 1; j < N; j++)
      mx = Math.max(mx, weights[i][j]);
  document.getElementById('s-maxw').textContent = mx.toFixed(2);
}

function draw() {
  const rw = canvas.getBoundingClientRect().width;
  const rh = canvas.getBoundingClientRect().height;
  ctx.clearRect(0, 0, rw, rh);

  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const w = weights[i][j];
      if (w < 0.01) continue;
      const p = positions[i], q = positions[j];
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(q.x, q.y);
      ctx.lineWidth = w * 10;
      ctx.strokeStyle = `rgba(224, 130, 160, ${0.15 + w * 0.8})`;
      ctx.stroke();

      const mx = (p.x + q.x) / 2;
      const my = (p.y + q.y) / 2;
      ctx.font = '11px sans-serif';
      ctx.fillStyle = 'rgba(192, 96, 122, 0.5)';
      ctx.textAlign = 'center';
      ctx.fillText(w.toFixed(2), mx, my - 6);
    }
  }

  for (let i = 0; i < N; i++) {
    const { x, y } = positions[i];
    const age = t - fireTime[i];
    const glow = Math.max(0, 1 - age / 300);

    if (glow > 0.05) {
      ctx.beginPath();
      ctx.arc(x, y, 26 + glow * 14, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240, 160, 180, ${glow * 0.25})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fillStyle = glow > 0.3
      ? `rgba(232, 144, 154, ${0.3 + glow * 0.5})`
      : '#fff0f5';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#f0c0d0';
    ctx.stroke();

    ctx.font = '500 13px sans-serif';
    ctx.fillStyle = '#c0607a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N' + (i + 1), x, y);
  }
}

function loop() {
  t += 16;

  for (let i = 0; i < N; i++) activation[i] *= 0.92;

  for (let i = 0; i < N; i++)
    for (let j = i + 1; j < N; j++) {
      weights[i][j] = Math.max(0, weights[i][j] - decayRate * 0.016);
      weights[j][i] = weights[i][j];
    }

  if (Math.random() < fireRate / 600) {
    fireNeuron(Math.floor(Math.random() * N));
  }

  draw();
  updateStats();
  requestAnimationFrame(loop);
}

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  for (let i = 0; i < N; i++) {
    const dx = mx - positions[i].x;
    const dy = my - positions[i].y;
    if (Math.sqrt(dx * dx + dy * dy) < 26) {
      fireNeuron(i);
      break;
    }
  }
});

document.getElementById('btn-reset').addEventListener('click', resetState);
document.getElementById('btn-fire').addEventListener('click', fireAll);

document.getElementById('r-rate').addEventListener('input', e => {
  fireRate = +e.target.value;
  document.getElementById('o-rate').textContent = fireRate;
});
document.getElementById('r-eta').addEventListener('input', e => {
  eta = +e.target.value / 100;
  document.getElementById('o-eta').textContent = eta.toFixed(2);
});
document.getElementById('r-decay').addEventListener('input', e => {
  decayRate = +e.target.value / 1000;
  document.getElementById('o-decay').textContent = decayRate.toFixed(3);
});

window.addEventListener('resize', resize);
resize();
resetState();
loop();