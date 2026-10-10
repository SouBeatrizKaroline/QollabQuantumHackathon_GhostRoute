/* ==========================================================================
   CONFIG
   ========================================================================== */
const MISSAO = {
  turnos: 12,
  minutos_por_turno: 20,
  porto: [10, 15],
  navio: {
    velocidade_km_turno: 7.5,
    ruido_corrente_km: 0.3
  },
  inercial: {
    erro_inicial_km: 0.2,
    crescimento_km_turno: 0.6
  },
  campo: {
    kappa: 1.0,
    base: 2.0,
    anomalias: [
      { x: 25, y: 30, amplitude: 2.5, raio_km: 9 },
      { x: 45, y: 45, amplitude: -1.8, raio_km: 12 },
      { x: 60, y: 65, amplitude: 2.0, raio_km: 8 },
      { x: 75, y: 80, amplitude: -1.5, raio_km: 10 }
    ]
  },
  recife: [[38, 50], [48, 50], [48, 56], [38, 56]],
  capsula: {
    elipse_prevista: {
      centro: [70, 70],
      semi_eixo_x: 8,
      semi_eixo_y: 5
    },
    pouso_real: [70, 74],
    turno_blackout_inicio: 2,
    turno_revelacao: 8
  },
  sensor: {
    shots_total: 6000,
    ghz_n: 3,
    opcoes_shots: [100, 250, 500, 1000]
  },
  ataques: [
    { tipo: "salto", inicio: 4, fim: 4, deslocamento_km: [-6, 0] },
    { tipo: "deriva", inicio: 6, fim: 10, km_por_turno: [0.28, -0.28] },
    { tipo: "congelamento", inicio: 9, fim: 10 }
  ],
  vitoria: {
    raio_resgate_km: 2.0
  }
};

/* ==========================================================================
   RNG (Mulberry32 & Independent Streams)
   ========================================================================== */
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function gaussianRandom(rng) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function sampleBinomial(n, p, rng) {
  if (n <= 0) return 0;
  if (p <= 0.0) return 0;
  if (p >= 1.0) return n;
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (rng() < p) count++;
  }
  return count;
}

/* ==========================================================================
   PHYSICS & RAMSEY QUANTUM SENSOR
   ========================================================================== */
function calcB(x, y) {
  let b = MISSAO.campo.base;
  for (const anom of MISSAO.campo.anomalias) {
    const dx = x - anom.x;
    const dy = y - anom.y;
    const d2 = dx * dx + dy * dy;
    const r2 = anom.raio_km * anom.raio_km;
    b += anom.amplitude * Math.exp(-d2 / (2.0 * r2));
  }
  return b;
}

function calcPhi(x, y) {
  return MISSAO.campo.kappa * calcB(x, y);
}

function getRamseyProbabilities(phi, n) {
  const pX = Math.pow(Math.sin((n * phi) / 2.0), 2);
  const pY = (1.0 - Math.sin(n * phi)) / 2.0;
  return { pX: Math.max(0.0, Math.min(1.0, pX)), pY: Math.max(0.0, Math.min(1.0, pY)) };
}

function reconstructPhaseCandidates(kX, NX, kY, NY, n) {
  let cosVal = 1.0 - 2.0 * (kX / Math.max(1, NX));
  let sinVal = 1.0 - 2.0 * (kY / Math.max(1, NY));
  cosVal = Math.max(-1.0, Math.min(1.0, cosVal));
  sinVal = Math.max(-1.0, Math.min(1.0, sinVal));
  const phaseN = (Math.atan2(sinVal, cosVal) + 2.0 * Math.PI) % (2.0 * Math.PI);
  const candidates = [];
  for (let k = 0; k < n; k++) {
    candidates.push((phaseN + 2.0 * Math.PI * k) / n);
  }
  return candidates;
}

function autotesteSensor() {
  const testRng = mulberry32(999983);
  const testPhases = [0.4, 1.2, 2.5, 4.0];
  const testN = [1, 3];
  const shotsTotal = 4000;
  const shotsX = 2000;
  const shotsY = 2000;

  for (const phi of testPhases) {
    for (const n of testN) {
      const { pX, pY } = getRamseyProbabilities(phi, n);
      const kX = sampleBinomial(shotsX, pX, testRng);
      const kY = sampleBinomial(shotsY, pY, testRng);

      const freqX = kX / shotsX;
      const freqY = kY / shotsY;

      const stdX = Math.sqrt((pX * (1 - pX)) / shotsX);
      const stdY = Math.sqrt((pY * (1 - pY)) / shotsY);

      if (Math.abs(freqX - pX) > 4.0 * stdX || Math.abs(freqY - pY) > 4.0 * stdY) {
        console.warn(`[Sensor Self-Test] Warning on phase ${phi}, n=${n}: stat fluctuation > 4 std dev`);
        return false;
      }
    }
  }
  console.log("[Sensor Self-Test] Verified Born-rule measurement frequencies within 4 std dev.");
  return true;
}

/* ==========================================================================
   WORLD & GEOMETRY (Collision, Movement, Attacks)
   ========================================================================== */
function headingToVector(deg, dist) {
  const rad = (deg * Math.PI) / 180.0;
  return { dx: Math.sin(rad) * dist, dy: Math.cos(rad) * dist };
}

function formatHeading(deg) {
  const d = ((Math.round(deg) % 360) + 360) % 360;
  return String(d).padStart(3, '0') + '°';
}

function getDirectionName(deg) {
  const d = ((Math.round(deg) % 360) + 360) % 360;
  if (d >= 337.5 || d < 22.5) return 'N';
  if (d >= 22.5 && d < 67.5) return 'NE';
  if (d >= 67.5 && d < 112.5) return 'E';
  if (d >= 112.5 && d < 157.5) return 'SE';
  if (d >= 157.5 && d < 202.5) return 'S';
  if (d >= 202.5 && d < 247.5) return 'SW';
  if (d >= 247.5 && d < 292.5) return 'W';
  return 'NW';
}

function segmentsIntersect(a, b, c, d) {
  function ccw(p1, p2, p3) {
    return (p3[1] - p1[1]) * (p2[0] - p1[0]) > (p2[1] - p1[1]) * (p3[0] - p1[0]);
  }
  return (ccw(a, c, d) !== ccw(b, c, d)) && (ccw(a, b, c) !== ccw(a, b, d));
}

function isPointInPoly(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > pt[1]) !== (yj > pt[1])) &&
      (pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function checkReefCollision(p1, p2, reefPoly) {
  if (isPointInPoly(p1, reefPoly) || isPointInPoly(p2, reefPoly)) return true;
  for (let i = 0; i < reefPoly.length; i++) {
    const next = (i + 1) % reefPoly.length;
    if (segmentsIntersect(p1, p2, reefPoly[i], reefPoly[next])) return true;
  }
  return false;
}

function distToPolygon(pt, poly) {
  if (isPointInPoly(pt, poly)) return 0.0;
  let minDist = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % poly.length];
    const d = distToSegment(pt, p1, p2);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

function distToSegment(p, v, w) {
  const l2 = (v[0] - w[0])**2 + (v[1] - w[1])**2;
  if (l2 === 0) return Math.hypot(p[0] - v[0], p[1] - v[1]);
  let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (v[0] + t * (w[0] - v[0])), p[1] - (v[1] + t * (w[1] - v[1])));
}

/* ==========================================================================
   BAYESIAN ESTIMATOR (100x100 Grid, 1 km resolution)
   ========================================================================== */
class BayesianGridEstimator {
  constructor() {
    this.size = 100;
    this.grid = new Float32Array(this.size * this.size);
    this.reset();
  }

  reset() {
    const pX = MISSAO.porto[0];
    const pY = MISSAO.porto[1];
    const std = MISSAO.inercial.erro_inicial_km;
    let sum = 0;
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const dx = x - pX;
        const dy = y - pY;
        const val = Math.exp(-(dx * dx + dy * dy) / (2 * std * std));
        this.grid[y * this.size + x] = val;
        sum += val;
      }
    }
    for (let i = 0; i < this.grid.length; i++) {
      this.grid[i] /= sum;
    }
  }

  predict(dx, dy) {
    const nextGrid = new Float32Array(this.size * this.size);
    const spreadStd = MISSAO.navio.ruido_corrente_km;
    const kernelRadius = 2;

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const p = this.grid[y * this.size + x];
        if (p < 1e-6) continue;

        const targetX = x + dx;
        const targetY = y + dy;

        for (let ky = -kernelRadius; ky <= kernelRadius; ky++) {
          for (let kx = -kernelRadius; kx <= kernelRadius; kx++) {
            const nx = Math.round(targetX + kx);
            const ny = Math.round(targetY + ky);
            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
              const dist2 = (nx - targetX)**2 + (ny - targetY)**2;
              const weight = Math.exp(-dist2 / (2 * spreadStd * spreadStd));
              nextGrid[ny * this.size + nx] += p * weight;
            }
          }
        }
      }
    }

    let sum = 0;
    for (let i = 0; i < nextGrid.length; i++) sum += nextGrid[i];
    if (sum > 0) {
      for (let i = 0; i < nextGrid.length; i++) nextGrid[i] /= sum;
      this.grid = nextGrid;
    }
  }

  update(kX, NX, kY, NY, n) {
    if (NX <= 0 && NY <= 0) return;

    let logSum = -Infinity;
    const logPost = new Float32Array(this.size * this.size);

    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const idx = y * this.size + x;
        const prior = this.grid[idx];
        if (prior <= 1e-12) {
          logPost[idx] = -Infinity;
          continue;
        }

        const phi = calcPhi(x, y);
        const { pX, pY } = getRamseyProbabilities(phi, n);

        const clampX = Math.max(1e-5, Math.min(1.0 - 1e-5, pX));
        const clampY = Math.max(1e-5, Math.min(1.0 - 1e-5, pY));

        const logLikX = kX * Math.log(clampX) + (NX - kX) * Math.log(1.0 - clampX);
        const logLikY = kY * Math.log(clampY) + (NY - kY) * Math.log(1.0 - clampY);

        const lp = Math.log(prior) + logLikX + logLikY;
        logPost[idx] = lp;

        if (lp > logSum) {
          logSum = lp + Math.log1p(Math.exp(logSum - lp));
        } else {
          logSum = logSum + Math.log1p(Math.exp(lp - logSum));
        }
      }
    }

    for (let i = 0; i < this.grid.length; i++) {
      if (logPost[i] === -Infinity) {
        this.grid[i] = 0;
      } else {
        this.grid[i] = Math.exp(logPost[i] - logSum);
      }
    }
  }

  getMAP() {
    let maxP = -1;
    let mapX = MISSAO.porto[0];
    let mapY = MISSAO.porto[1];
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const val = this.grid[y * this.size + x];
        if (val > maxP) {
          maxP = val;
          mapX = x;
          mapY = y;
        }
      }
    }
    return [mapX, mapY];
  }

  getHPD95() {
    const items = [];
    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i] > 1e-6) {
        items.push({ idx: i, p: this.grid[i] });
      }
    }
    items.sort((a, b) => b.p - a.p);

    let cumulative = 0;
    const hpdSet = new Set();
    for (const it of items) {
      cumulative += it.p;
      hpdSet.add(it.idx);
      if (cumulative >= 0.95) break;
    }
    return hpdSet;
  }

  isGPSInsideHPD(gpsX, gpsY, hpdSet) {
    const gx = Math.round(gpsX);
    const gy = Math.round(gpsY);
    if (gx < 0 || gx >= this.size || gy < 0 || gy >= this.size) return false;
    return hpdSet.has(gy * this.size + gx);
  }
}

/* ==========================================================================
   RENDER & 16-BIT ASSET REGISTRY
   ========================================================================== */
const AssetRegistry = {
  draw16BitShip(ctx, x, y, headingDeg) {
    ctx.save();
    ctx.translate(x, y);
    const rad = ((headingDeg - 90) * Math.PI) / 180.0;
    ctx.rotate(rad);

    ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
    ctx.beginPath();
    ctx.moveTo(-16, -5);
    ctx.lineTo(-28, -10);
    ctx.lineTo(-24, 0);
    ctx.lineTo(-28, 10);
    ctx.lineTo(-16, 5);
    ctx.fill();

    ctx.fillStyle = "#0c1f38";
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(8, 8);
    ctx.lineTo(-16, 8);
    ctx.lineTo(-18, 0);
    ctx.lineTo(-16, -8);
    ctx.lineTo(8, -8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#2c4866";
    ctx.beginPath();
    ctx.moveTo(17, 0);
    ctx.lineTo(8, 7);
    ctx.lineTo(-15, 7);
    ctx.lineTo(-16, 0);
    ctx.lineTo(-15, -7);
    ctx.lineTo(8, -7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#486581";
    ctx.fillRect(-8, -5, 16, 10);

    ctx.fillStyle = "#627d98";
    ctx.fillRect(-3, -4, 8, 8);

    ctx.fillStyle = "#00f0ff";
    ctx.fillRect(3, -3, 2, 6);

    ctx.fillStyle = "#f0f4f8";
    ctx.fillRect(-1, -1, 3, 2);

    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(13, -1, 3, 2);

    ctx.fillStyle = "#1e3a5f";
    ctx.fillRect(-14, -3, 3, 6);

    ctx.restore();
  },

  drawQuooraAvatar(ctx, expression) {
    ctx.clearRect(0, 0, 48, 48);

    ctx.fillStyle = "#091a30";
    ctx.fillRect(4, 4, 40, 40);
    ctx.strokeStyle = "#00d2ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 40, 40);

    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(22, 1, 4, 4);

    ctx.fillStyle = "#020712";
    ctx.fillRect(8, 8, 32, 32);

    if (expression === 'happy') {
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(12, 18, 8, 3);
      ctx.fillRect(12, 15, 2, 3);
      ctx.fillRect(18, 15, 2, 3);
      ctx.fillRect(28, 18, 8, 3);
      ctx.fillRect(28, 15, 2, 3);
      ctx.fillRect(34, 15, 2, 3);
      ctx.fillRect(20, 28, 8, 3);
    } else if (expression === 'worried') {
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(12, 17, 8, 4);
      ctx.fillRect(28, 17, 8, 4);
      ctx.fillRect(22, 30, 4, 3);
    } else if (expression === 'alert') {
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(12, 15, 9, 8);
      ctx.fillRect(27, 15, 9, 8);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(15, 18, 3, 3);
      ctx.fillRect(30, 18, 3, 3);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(21, 28, 6, 5);
    } else if (expression === 'thoughtful') {
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(12, 18, 8, 4);
      ctx.fillRect(28, 15, 8, 4);
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(22, 28, 4, 3);
    } else {
      ctx.fillStyle = "#00f0ff";
      ctx.fillRect(12, 18, 8, 5);
      ctx.fillRect(28, 18, 8, 5);
      ctx.fillRect(20, 29, 8, 3);
    }
  }
};

/* ==========================================================================
   MAP CANVAS RENDERER
   ========================================================================= */
class TacticalMapRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.padding = 44;
    this.worldMax = 100;
  }

  worldToScreen(wx, wy) {
    const plotSize = this.canvas.width - this.padding * 2;
    const sx = this.padding + (wx / this.worldMax) * plotSize;
    const sy = this.canvas.height - this.padding - (wy / this.worldMax) * plotSize;
    return { sx, sy };
  }

  render(state, estimator, isReplay = false, debug = false) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const plotSize = w - this.padding * 2;

    ctx.fillStyle = "#040e1d";
    ctx.fillRect(0, 0, w, h);

    const oceanGrad = ctx.createLinearGradient(this.padding, this.padding, w - this.padding, h - this.padding);
    oceanGrad.addColorStop(0, "#081f3d");
    oceanGrad.addColorStop(0.5, "#061833");
    oceanGrad.addColorStop(1, "#031124");
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(this.padding, this.padding, plotSize, plotSize);

    ctx.save();
    ctx.strokeStyle = "rgba(0, 240, 255, 0.04)";
    for (let y = this.padding; y < this.padding + plotSize; y += 12) {
      ctx.beginPath();
      ctx.moveTo(this.padding, y);
      ctx.lineTo(this.padding + plotSize, y);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    for (let km = 0; km <= 100; km += 10) {
      const pt = this.worldToScreen(km, km);
      ctx.strokeStyle = (km === 0 || km === 100) ? "#1e4976" : "rgba(14, 52, 92, 0.5)";
      ctx.lineWidth = (km % 20 === 0) ? 1.5 : 1.0;

      ctx.beginPath();
      ctx.moveTo(pt.sx, this.padding);
      ctx.lineTo(pt.sx, this.padding + plotSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(this.padding, pt.sy);
      ctx.lineTo(this.padding + plotSize, pt.sy);
      ctx.stroke();
    }
    ctx.restore();

    this.drawReef(ctx);
    this.drawPosteriorHeatmap(ctx, estimator);
    this.drawCapsuleTarget(ctx, state.currentTurn);
    this.drawInertialDeadReckoning(ctx, state);
    this.drawGPSTrail(ctx, state.gpsHistory);

    if (isReplay || debug) {
      this.drawTrueRoute(ctx, state.realHistory);
    }

    this.drawPort(ctx);

    const renderPos = (debug || isReplay) ? state.realPosition : state.estimatorPosition;
    AssetRegistry.draw16BitShip(ctx, renderPos.sx, renderPos.sy, state.currentHeading);

    this.drawCompass(ctx, w - 85, this.padding + 55, state.currentHeading);
    this.drawScaleBar(ctx, this.padding + 16, h - this.padding - 18);
    this.drawAxes(ctx, plotSize);
  }

  drawReef(ctx) {
    ctx.save();
    const poly = MISSAO.recife.map(pt => this.worldToScreen(pt[0], pt[1]));

    ctx.fillStyle = "rgba(239, 68, 68, 0.25)";
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(poly[0].sx, poly[0].sy);
    for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].sx, poly[i].sy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(239, 68, 68, 0.4)";
    ctx.lineWidth = 1;
    const minX = Math.min(...poly.map(p => p.sx));
    const maxX = Math.max(...poly.map(p => p.sx));
    const minY = Math.min(...poly.map(p => p.sy));
    const maxY = Math.max(...poly.map(p => p.sy));

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(poly[0].sx, poly[0].sy);
    for (let i = 1; i < poly.length; i++) ctx.lineTo(poly[i].sx, poly[i].sy);
    ctx.closePath();
    ctx.clip();

    for (let x = minX - 50; x < maxX + 50; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, maxY);
      ctx.lineTo(x + 50, minY);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = "#fca5a5";
    ctx.font = "bold 11px monospace";
    ctx.fillText("RECIFE PERIGOSO", poly[0].sx + 6, poly[0].sy + 16);
    ctx.restore();
  }

  drawPosteriorHeatmap(ctx, estimator) {
    if (!estimator) return;
    ctx.save();
    const hpdSet = estimator.getHPD95();
    const plotSize = this.canvas.width - this.padding * 2;
    const cellSize = plotSize / 100.0;

    for (const idx of hpdSet) {
      const x = idx % 100;
      const y = Math.floor(idx / 100);
      const p = estimator.grid[idx];
      const pt = this.worldToScreen(x, y);

      const alpha = Math.min(0.7, 0.15 + p * 30.0);
      ctx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
      ctx.fillRect(pt.sx - cellSize/2, pt.sy - cellSize/2, cellSize + 0.5, cellSize + 0.5);
    }
    ctx.restore();
  }

  drawCapsuleTarget(ctx, turn) {
    ctx.save();
    if (turn >= MISSAO.capsula.turno_revelacao) {
      const p = this.worldToScreen(MISSAO.capsula.pouso_real[0], MISSAO.capsula.pouso_real[1]);
      ctx.strokeStyle = "#38bdf8";
      ctx.fillStyle = "#0284c7";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(p.sx, p.sy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.sx, p.sy, 16, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#bae6fd";
      ctx.font = "bold 11px monospace";
      ctx.fillText("AURORA-1 [70, 74]", p.sx + 14, p.sy + 4);
    } else if (turn >= MISSAO.capsula.turno_blackout_inicio) {
      const center = this.worldToScreen(MISSAO.capsula.elipse_prevista.centro[0], MISSAO.capsula.elipse_prevista.centro[1]);
      const plotSize = this.canvas.width - this.padding * 2;
      const rx = (MISSAO.capsula.elipse_prevista.semi_eixo_x / 100.0) * plotSize;
      const ry = (MISSAO.capsula.elipse_prevista.semi_eixo_y / 100.0) * plotSize;

      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 4]);

      ctx.beginPath();
      ctx.ellipse(center.sx, center.sy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 11px monospace";
      ctx.fillText("ELIPSE REENTRADA [70, 70]", center.sx - rx, center.sy - ry - 6);
    }
    ctx.restore();
  }

  drawInertialDeadReckoning(ctx, state) {
    ctx.save();
    const p = this.worldToScreen(state.inertialPosition[0], state.inertialPosition[1]);
    const plotSize = this.canvas.width - this.padding * 2;
    const radiusPix = (state.inertialRadiusKm / 100.0) * plotSize;

    ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    ctx.beginPath();
    ctx.arc(p.sx, p.sy, radiusPix, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  drawGPSTrail(ctx, gpsHistory) {
    if (!gpsHistory || gpsHistory.length < 1) return;
    ctx.save();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2.0;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    for (let i = 0; i < gpsHistory.length; i++) {
      const pt = this.worldToScreen(gpsHistory[i][0], gpsHistory[i][1]);
      if (i === 0) ctx.moveTo(pt.sx, pt.sy);
      else ctx.lineTo(pt.sx, pt.sy);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#f59e0b";
    for (const pt of gpsHistory) {
      const s = this.worldToScreen(pt[0], pt[1]);
      ctx.fillRect(s.sx - 2, s.sy - 2, 4, 4);
    }
    ctx.restore();
  }

  drawTrueRoute(ctx, realHistory) {
    if (!realHistory || realHistory.length < 1) return;
    ctx.save();
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3.0;

    ctx.beginPath();
    for (let i = 0; i < realHistory.length; i++) {
      const pt = this.worldToScreen(realHistory[i][0], realHistory[i][1]);
      if (i === 0) ctx.moveTo(pt.sx, pt.sy);
      else ctx.lineTo(pt.sx, pt.sy);
    }
    ctx.stroke();

    ctx.fillStyle = "#4ade80";
    for (const pt of realHistory) {
      const s = this.worldToScreen(pt[0], pt[1]);
      ctx.beginPath();
      ctx.arc(s.sx, s.sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawPort(ctx) {
    const p = this.worldToScreen(MISSAO.porto[0], MISSAO.porto[1]);
    ctx.save();
    ctx.strokeStyle = "rgba(34, 197, 94, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#86efac";
    ctx.font = "bold 11px monospace";
    ctx.fillText("PORTO [10, 15]", p.sx + 12, p.sy + 4);
    ctx.restore();
  }

  drawCompass(ctx, cx, cy, headingDeg) {
    ctx.save();
    const r = 30;
    ctx.fillStyle = "rgba(7, 21, 39, 0.85)";
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#ef4444";
    ctx.fillText("N", cx, cy - r + 8);
    ctx.fillStyle = "#8bb2d9";
    ctx.fillText("S", cx, cy + r - 8);
    ctx.fillText("E", cx + r - 8, cy);
    ctx.fillText("W", cx - r + 8, cy);

    const needleRad = ((headingDeg - 90) * Math.PI) / 180.0;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(needleRad);

    ctx.fillStyle = "#00f0ff";
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(6, -4);
    ctx.lineTo(6, 4);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawScaleBar(ctx, sx, sy) {
    ctx.save();
    const p0 = this.worldToScreen(0, 0);
    const p10 = this.worldToScreen(10, 0);
    const barWidth = p10.sx - p0.sx;

    ctx.strokeStyle = "#e2f1ff";
    ctx.fillStyle = "#e2f1ff";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + barWidth, sy);
    ctx.moveTo(sx, sy - 4);
    ctx.lineTo(sx, sy + 4);
    ctx.moveTo(sx + barWidth, sy - 4);
    ctx.lineTo(sx + barWidth, sy + 4);
    ctx.stroke();

    ctx.font = "11px monospace";
    ctx.fillText("10 km", sx + barWidth / 2 - 14, sy - 6);
    ctx.restore();
  }

  drawAxes(ctx, plotSize) {
    ctx.save();
    ctx.fillStyle = "#8bb2d9";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let km = 0; km <= 100; km += 20) {
      const pt = this.worldToScreen(km, 0);
      ctx.fillText(km + "k", pt.sx, this.canvas.height - 18);
    }
    ctx.fillText("Leste (km) →", this.padding + plotSize / 2, this.canvas.height - 4);

    ctx.textAlign = "right";
    for (let km = 0; km <= 100; km += 20) {
      const pt = this.worldToScreen(0, km);
      ctx.fillText(km + "k", this.padding - 8, pt.sy);
    }

    ctx.save();
    ctx.translate(14, this.padding + plotSize / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("Norte (km) →", 0, 0);
    ctx.restore();

    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 2;
    ctx.strokeRect(this.padding, this.padding, plotSize, plotSize);
    ctx.restore();
  }
}
