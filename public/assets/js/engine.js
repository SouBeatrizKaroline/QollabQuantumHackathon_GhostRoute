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

// Campaign missions are deterministic configurations, also included in exports.
// The original mission remains the default for archived sessions and core tests.
const ORIGINAL_MISSION = JSON.parse(JSON.stringify(MISSAO));
function createCampaignMission(level) {
  if (!Number.isInteger(level) || level < 0 || level > 99) throw new RangeError('Campaign level must be 0..99');
  const m = JSON.parse(JSON.stringify(ORIGINAL_MISSION)), difficulty = level / 99;
  m.nivel = level;
  m.turnos = level === 0 ? 4 : Math.min(12, 6 + Math.floor(level / 8));
  m.navio.velocidade_km_turno = level === 0 ? Math.SQRT2 * 4 : 5.8 + difficulty * 2.7;
  m.navio.ruido_corrente_km = level === 0 ? 0 : .04 + difficulty * .46;
  m.inercial.crescimento_km_turno = .12 + difficulty * .88;
  m.sensor.shots_total = 8000 - Math.round(difficulty * 5000 / 100) * 100;
  m.vitoria.raio_resgate_km = 4 - difficulty * 2.4;
  const reach = level === 0 ? 16 : m.turnos * m.navio.velocidade_km_turno * .79 / Math.SQRT2;
  const target = [10 + reach, 15 + reach];
  m.capsula.pouso_real = target;
  m.capsula.elipse_prevista = {centro:[target[0],target[1]-difficulty*3],semi_eixo_x:2+difficulty*6,semi_eixo_y:2+difficulty*3};
  m.capsula.turno_blackout_inicio = level < 10 ? 0 : 2;
  m.capsula.turno_revelacao = level < 10 ? 0 : Math.max(3,Math.floor(m.turnos * .65));
  const middle = [10 + reach * .52, 15 + reach * .52];
  m.recife = level < 10 ? [[88,88],[94,88],[94,94],[88,94]] :
    [[middle[0]-3,middle[1]+1],[middle[0]+3,middle[1]+1],[middle[0]+3,middle[1]+4+difficulty*2],[middle[0]-3,middle[1]+4+difficulty*2]];
  m.ataques = [];
  if (level > 0) m.ataques.push({tipo:'salto',inicio:3,fim:3,deslocamento_km:[-(.8+difficulty*7),difficulty*2]});
  if (level >= 10) m.ataques.push({tipo:'deriva',inicio:Math.max(3,Math.floor(m.turnos*.4)),fim:m.turnos-2,km_por_turno:[.1+difficulty*.5,-(.1+difficulty*.5)]});
  if (level >= 30) m.ataques.push({tipo:'congelamento',inicio:m.turnos-3,fim:m.turnos-2});
  return m;
}
function useCampaignMission(level) {
  const next = createCampaignMission(level);
  for (const key of Object.keys(MISSAO)) delete MISSAO[key];
  Object.assign(MISSAO,next);
  return MISSAO;
}
function activeAttacks(turn) { return MISSAO.ataques.filter(a=>turn>=a.inicio&&turn<=a.fim); }

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

function segmentsIntersect(a,b,c,d) {
  const eps=1e-9;
  const cross=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
  const on=(p,q,r)=>Math.abs(cross(p,q,r))<=eps&&r[0]>=Math.min(p[0],q[0])-eps&&r[0]<=Math.max(p[0],q[0])+eps&&r[1]>=Math.min(p[1],q[1])-eps&&r[1]<=Math.max(p[1],q[1])+eps;
  const u=cross(a,b,c),v=cross(a,b,d),w=cross(c,d,a),z=cross(c,d,b);
  return ((u>eps&&v<-eps||u<-eps&&v>eps)&&(w>eps&&z<-eps||w<-eps&&z>eps))||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b);
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
   BAYESIAN ESTIMATOR (101x101 nodes covering 0..100 km, 1 km resolution)
   ========================================================================== */
class BayesianGridEstimator {
  constructor() {
    // The continuous world includes both endpoints, so 100 km needs a node too.
    this.size = 101;
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
    const sigma = MISSAO.navio.ruido_corrente_km;
    // Integrating each noise cell avoids sampling a narrow Gaussian only at
    // integer coordinates, which used to bias fractional headings toward the
    // nearest integer step. The omitted tails beyond 2.5 km are negligible.
    const normalCDF = z => {
      const sign = z < 0 ? -1 : 1;
      const x = Math.abs(z) / Math.SQRT2;
      const t = 1 / (1 + 0.3275911 * x);
      const erf = 1 - (((((1.061405429 * t - 1.453152027) * t +
        1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-x * x);
      return (1 + sign * erf) / 2;
    };
    const noise = [];
    let noiseMass = 0;
    for (let offset = -2; offset <= 2; offset++) {
      const mass = sigma > 0 ? normalCDF((offset + 0.5) / sigma) -
        normalCDF((offset - 0.5) / sigma) : Number(offset === 0);
      noise.push({ offset, mass });
      noiseMass += mass;
    }
    noise.forEach(cell => cell.mass /= noiseMass);

    const axisTransitions = delta => Array.from({ length: this.size }, (_, value) => {
      const destinations = new Map();
      for (const { offset, mass } of noise) {
        // The true movement adds current noise before clamping to the coast.
        // Keep escaped mass on the boundary instead of conditioning it away.
        const target = Math.max(0, Math.min(this.size - 1, value + delta + offset));
        const lower = Math.floor(target), upper = Math.min(this.size - 1, lower + 1);
        const fraction = target - lower;
        destinations.set(lower, (destinations.get(lower) || 0) + mass * (1 - fraction));
        if (fraction) destinations.set(upper, (destinations.get(upper) || 0) + mass * fraction);
      }
      return Array.from(destinations);
    });
    const moveX = axisTransitions(dx), moveY = axisTransitions(dy);
    const horizontal = new Float64Array(this.grid.length);
    const next = new Float64Array(this.grid.length);
    // The independent x/y current model is separable. Fractional redistribution
    // is bilinear in two dimensions and preserves the commanded mean inland.
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const p = this.grid[y * this.size + x];
        if (!p) continue;
        for (const [nx, weight] of moveX[x]) horizontal[y * this.size + nx] += p * weight;
      }
    }
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const p = horizontal[y * this.size + x];
        if (!p) continue;
        for (const [ny, weight] of moveY[y]) next[ny * this.size + x] += p * weight;
      }
    }
    let sum = 0;
    for (const p of next) sum += p;
    if (sum > 0) this.grid = Float32Array.from(next, p => p / sum);
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
      if (this.grid[i] > 0) {
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
    if (!Number.isFinite(gpsX) || !Number.isFinite(gpsY) ||
      gpsX < 0 || gpsX > this.size - 1 || gpsY < 0 || gpsY > this.size - 1) return false;
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
/* Full-viewport 16-bit chart. Coordinates remain in kilometers, north up.
   Only the posterior estimate is drawn as the ship during normal play. */
class PixelShipAtlas {
  constructor() { this.frames=Array.from({length:32},(_,i)=>this.paint(i*11.25)); }
  static normalize(heading) { return ((heading%360)+360)%360; }
  static turnDelta(from,to) { return (((to-from+180)%360)+360)%360-180; }
  static frameIndex(heading) { return Math.round(PixelShipAtlas.normalize(heading)/11.25)%32; }
  paint(heading) {
    const canvas=document.createElement('canvas');canvas.width=88;canvas.height=88;
    const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
    const angle=heading*Math.PI/180,fx=Math.sin(angle),fy=-Math.cos(angle),rx=Math.cos(angle),ry=Math.sin(angle);
    const project=([u,v,z=0])=>[Math.round(44+u*fx+v*rx),Math.round(48+(u*fy+v*ry)*.78-z)];
    const pixel=(x,y,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,1,1);};
    const line=(a,b,color)=>{
      let [x,y]=a;const [tx,ty]=b,dx=Math.abs(tx-x),dy=-Math.abs(ty-y),sx=x<tx?1:-1,sy=y<ty?1:-1;let error=dx+dy;
      for(;;){pixel(x,y,color);if(x===tx&&y===ty)break;const twice=2*error;if(twice>=dy){error+=dy;x+=sx;}if(twice<=dx){error+=dx;y+=sy;}}
    };
    const poly=(vertices,color,outline='#051623')=>{
      const pts=vertices.map(project),ys=pts.map(p=>p[1]);ctx.fillStyle=color;
      for(let y=Math.min(...ys);y<=Math.max(...ys);y++){
        const xs=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))xs.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
        xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)ctx.fillRect(Math.ceil(xs[i]),y,Math.max(1,Math.floor(xs[i+1])-Math.ceil(xs[i])+1),1);
      }
      if(outline)pts.forEach((p,i)=>line(p,pts[(i+1)%pts.length],outline));
    };
    const hull=[[-28,-5],[-23,-8],[9,-8],[22,-5],[30,0],[22,5],[9,8],[-23,8],[-28,5]];
    // An oblique, pixel-rasterized hull. Elevated features stay vertical in every view.
    poly(hull.map(([u,v])=>[u,v,-2]),'#173c4c');
    poly(hull.map(([u,v])=>[u,v,1]),'#7faaa8');
    for(let i=0;i<hull.length;i++){
      const a=hull[i],b=hull[(i+1)%hull.length];
      if(project(a)[1]+project(b)[1]>=96)poly([[...a,1],[...b,1],[...b,-2],[...a,-2]],'#345864');
    }
    const deck=[[-25,-4],[-21,-6],[8,-6],[20,-4],[26,0],[20,4],[8,6],[-21,6],[-25,4]];
    poly(deck.map(([u,v])=>[u,v,2]),'#91b4ad','#c6ddd0');
    line(project([-22,0,3]),project([22,0,3]),'#597e80');
    const box=(u1,u2,v1,v2,height)=>{
      const corners=[[u1,v1],[u2,v1],[u2,v2],[u1,v2]],faces=[];
      for(let i=0;i<4;i++){
        const a=corners[i],b=corners[(i+1)%4];faces.push({a,b,y:(project(a)[1]+project(b)[1])/2});
      }
      faces.sort((a,b)=>a.y-b.y).forEach(({a,b},i)=>{
        poly([[...a,2],[...b,2],[...b,height],[...a,height]],i<2?'#4e7179':'#5d8b8c');
        if(height>5){line(project([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25,height-2]),project([a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75,height-2]),'#a4f3ed');}
      });
      poly(corners.map(([u,v])=>[u,v,height]),'#d8e2cc','#183743');
      line(project([u1+1,v1+1,height]),project([u2-1,v1+1,height]),'#f1efda');
    };
    box(-21,-12,-4,4,5); // stern equipment locker
    box(-3,11,-5,5,10); // wheelhouse: roof and visible faces vary with the angle
    poly([[-1,-3,11],[7,-3,11],[7,3,11],[-1,3,11]],'#5e8388','#abc7bd');
    const mast=project([0,0,11]),tip=project([0,0,22]);
    line([mast[0]-1,mast[1]], [tip[0]-1,tip[1]],'#082332');line(mast,tip,'#e5e9cf');
    line(project([0,-6,19]),project([0,6,19]),'#c1dcd0');
    pixel(tip[0],tip[1]-1,'#8affdc');
    for(const u of[-25,-15,16])for(const v of[-5,5]){const p=project([u,v,4]);pixel(p[0],p[1],'#e1ead0');}
    const bow=project([26,0,4]);pixel(bow[0],bow[1],'#baf9ed');pixel(bow[0]+1,bow[1],'#70d9ea');
    return canvas;
  }
}
class TacticalMapRenderer {
  constructor(canvasId){
    this.canvas=document.getElementById(canvasId);this.ctx=this.canvas.getContext('2d');this.padding=32;this.worldMax=100;this.current=null;this.displayWorld=null;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.lastFrame=0;
    this.shipAtlas=new PixelShipAtlas();this.ocean=document.createElement('canvas');this.resize();
    window.addEventListener('resize',()=>{this.resize();if(this.current)this.drawScene(performance.now());});
    this.loop=(now)=>{if(this.current&&now-this.lastFrame>48){this.lastFrame=now;this.drawScene(now);}requestAnimationFrame(this.loop);};requestAnimationFrame(this.loop);
  }
  resize(){
    const r=this.canvas.getBoundingClientRect();this.canvas.width=Math.max(1,Math.round(r.width/2));this.canvas.height=Math.max(1,Math.round(r.height/2));this.ctx.imageSmoothingEnabled=false;
    const w=this.canvas.width,h=this.canvas.height,ratioX=w/r.width,ratioY=h/r.height;
    const bounds=selector=>{const el=document.querySelector(selector);return el&&getComputedStyle(el).display!=='none'?el.getBoundingClientRect():null;};
    const hud=bounds('.hud-top'),dock=bounds('.navigation-dock'),telemetry=bounds('.telemetry-strip'),radio=bounds('.radio-widget');
    const portrait=r.width<=850&&r.height>520||r.width<=620;
    const short=r.height<500;
    const sideDock=short&&dock&&dock.left>r.width*.4&&dock.width<r.width*.6;
    const top=(Math.max(hud?.bottom||100,(portrait||sideDock)?telemetry?.bottom||0:0,portrait?radio?.bottom||0:0,portrait?bounds('.compass-widget')?.bottom||0:0)+26-r.top)*ratioY;
    const bottom=(sideDock?r.height-70:dock?dock.top-r.top-64:r.height-70)*ratioY;
    let left=26*ratioX,right=w-26*ratioX;
    if(sideDock)right=(dock.left-r.left-24)*ratioX;
    else if(!portrait){
      for(const selector of['.compass-widget','.radar-widget','.radio-widget']){const p=bounds(selector);if(p)left=Math.max(left,(p.right-r.left+24)*ratioX);}
      for(const selector of['.utility','.telemetry-strip','.chart-legend']){const p=bounds(selector);if(p)right=Math.min(right,(p.left-r.left-24)*ratioX);}
    }
    this.scale=Math.max(.12,Math.min((right-left)/100,(bottom-top)/100));
    this.chartSize=100*this.scale;this.ox=left+(right-left-this.chartSize)/2;this.oy=top+(Math.max(0,bottom-top-this.chartSize))/2;this.makeOcean();
  }
  worldToScreen(x,y){return{sx:this.ox+x*this.scale,sy:this.oy+(100-y)*this.scale};}
  screenToWorld(x,y){return[(x-this.ox)/this.scale,100-(y-this.oy)/this.scale];}
  makeOcean(){
    const c=this.ocean;c.width=this.canvas.width;c.height=this.canvas.height;const g=c.getContext('2d');
    const gradient=g.createLinearGradient(0,0,c.width,c.height);gradient.addColorStop(0,'#0c4266');gradient.addColorStop(.45,'#093657');gradient.addColorStop(1,'#08264c');g.fillStyle=gradient;g.fillRect(0,0,c.width,c.height);
    const rng=mulberry32(837211);for(let i=0;i<c.width*c.height/150;i++){const x=Math.floor(rng()*c.width),y=Math.floor(rng()*c.height);g.fillStyle=['#174b6c','#1b5273','#28627b','#0b2b4c'][Math.floor(rng()*4)];g.fillRect(x,y,Math.ceil(rng()*5)+2,1);if(rng()>.6){g.fillRect(x+2,y-1,2,1);g.fillRect(x+4,y+1,2,1);}}
    for(let y=0;y<c.height;y+=3){g.fillStyle='#04193420';g.fillRect(0,y,c.width,1);}
  }
  render(state,estimator,isReplay=false,debug=false){
    this.current={state,estimator,isReplay,debug};const target=(debug||isReplay)?state.realPosition:estimator.getMAP();
    const now=performance.now(),heading=PixelShipAtlas.normalize(state.currentHeading);
    if(this.headingTarget!==heading){this.headingFrom=this.visualHeading??heading;this.headingTarget=heading;this.headingStart=now;}
    if(this.reduced||isReplay)this.visualHeading=heading;
    if(!this.target||Math.hypot(this.target[0]-target[0],this.target[1]-target[1])>.01){this.animFrom=this.displayWorld?[...this.displayWorld]:[...target];this.target=[...target];this.animStart=performance.now();}
    if(this.reduced||isReplay)this.displayWorld=[...target];this.drawScene(performance.now());
  }
  text(label,x,y,color='#cee7df',align='left'){const c=this.ctx;c.font='bold 7px monospace';c.textAlign=align;c.fillStyle='#041024';c.fillText(label,x+1,y+1);c.fillStyle=color;c.fillText(label,x,y);c.textAlign='left';}
  mapLabel(label,x,y,color='#cee7df',align='left'){
    const c=this.ctx;c.font='bold 7px monospace';
    const left=this.ox+2,right=this.ox+this.chartSize-2,top=this.oy+8,bottom=this.oy+this.chartSize-3;
    const lines=[];let line='';for(const word of label.split(' ')){const candidate=line?line+' '+word:word;if(line&&c.measureText(candidate).width>right-left){lines.push(line);line=word;}else line=candidate;}if(line)lines.push(line);
    const width=Math.max(...lines.map(value=>c.measureText(value).width)),height=lines.length*9;
    const anchor=align==='center'?x-width/2:align==='right'?x-width:x;
    const candidates=[[anchor,y],[anchor,y-16],[anchor,y+16],[x-width-12,y],[x+12,y],[left,top]];
    let best=null,bestOverlap=Infinity;
    for(const[px,py]of candidates){
      const bx=Math.max(left,Math.min(right-width,px)),by=Math.max(top,Math.min(bottom-height+9,py));
      const box={left:bx-2,right:bx+width+2,top:by-8,bottom:by+height-6};
      let overlap=0;for(const occupied of this.labelBoxes||[]){overlap+=Math.max(0,Math.min(box.right,occupied.right)-Math.max(box.left,occupied.left))*Math.max(0,Math.min(box.bottom,occupied.bottom)-Math.max(box.top,occupied.top));}
      if(overlap<bestOverlap){best={bx,by,box};bestOverlap=overlap;}if(!overlap)break;
    }
    this.labelBoxes.push(best.box);lines.forEach((value,index)=>this.mapLabels.push({label:value,x:best.bx,y:best.by+index*9,color}));
  }
  line(points,color,width,dash=[]){if(!points?.length)return;const c=this.ctx;c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.beginPath();points.forEach((p,i)=>{const s=this.worldToScreen(...p);i?c.lineTo(s.sx,s.sy):c.moveTo(s.sx,s.sy);});c.stroke();c.setLineDash([]);}
  drawScene(now){
    const{state:s,estimator:e,isReplay:replay,debug}=this.current;const c=this.ctx,w=this.canvas.width,h=this.canvas.height;const t=TEXTOS[window.gameApp?.currentLang||'pt-PT'];c.imageSmoothingEnabled=false;c.drawImage(this.ocean,0,0);
    const u=this.reduced||replay?1:Math.min(1,(now-this.animStart)/650);const f=u*u*(3-2*u);this.displayWorld=this.target.map((v,i)=>this.animFrom[i]+(v-this.animFrom[i])*f);
    const shipAnchor=this.worldToScreen(...this.displayWorld),shipScale=Math.min(1,Math.max(.42,this.scale/2));
    this.labelBoxes=[{left:shipAnchor.sx-29*shipScale,right:shipAnchor.sx+29*shipScale,top:shipAnchor.sy-26*shipScale,bottom:shipAnchor.sy+22*shipScale}];
    this.mapLabels=[];this.mapLabel('SPOOFED',shipAnchor.sx+29*shipScale+7,shipAnchor.sy+8,'#e6f5de');
    // Grid and a low-key map boundary; the ocean itself fills the viewport.
    c.strokeStyle='#5189a031';c.lineWidth=.5;for(let km=0;km<=100;km+=10){const p=this.worldToScreen(km,km);c.beginPath();c.moveTo(p.sx,this.oy);c.lineTo(p.sx,this.oy+this.chartSize);c.moveTo(this.ox,p.sy);c.lineTo(this.ox+this.chartSize,p.sy);c.stroke();if(km%(this.scale<.7?100:20)===0){this.text(String(km),p.sx,this.oy+this.chartSize+9,'#9fc4cd','center');this.text(String(km),this.ox-5,p.sy+2,'#9fc4cd','right');}}
    // A decorative port shoreline is rasterized into the chart's lower edge.
    const port=this.worldToScreen(...MISSAO.porto);c.fillStyle='#203e41';c.beginPath();c.moveTo(this.ox,this.oy+this.chartSize);c.lineTo(this.ox+this.scale*8,this.oy+this.chartSize);c.lineTo(this.ox+this.scale*6,this.oy+this.chartSize-this.scale*8);c.lineTo(this.ox+this.scale*2,this.oy+this.chartSize-this.scale*18);c.lineTo(this.ox,this.oy+this.chartSize-this.scale*21);c.fill();c.fillStyle='#487367';for(let i=0;i<9;i++)c.fillRect(this.ox+1+i%3*3,this.oy+this.chartSize-9-Math.floor(i/3)*4,3,2);
    // Known magnetic anomalies: contour rings, not revealed attack locations.
    c.strokeStyle='#3c719334';c.lineWidth=.5;for(const a of MISSAO.campo.anomalias){const p=this.worldToScreen(a.x,a.y);for(const k of [1,1.45]){c.beginPath();c.arc(p.sx,p.sy,a.raio_km*this.scale*k,0,Math.PI*2);c.stroke();}}
    this.drawReef(t);if(!replay)this.drawHeatmap(e);this.drawTarget(s,t);
    const inertial=this.worldToScreen(...s.inertialPosition);c.strokeStyle='#97d3f280';c.lineWidth=.6;c.setLineDash([1,3]);c.beginPath();c.arc(inertial.sx,inertial.sy,s.inertialRadiusKm*this.scale,0,Math.PI*2);c.stroke();c.setLineDash([]);
    if(replay){this.line(s.realHistory,'#a7f2ce',2);this.line(s.inertialHistory,'#b1c8ff',.8,[1,3]);}else if(debug)this.line(s.realHistory,'#a7f2ce',1.6);
    this.line(s.gpsHistory,'#e6bc72',1,[3,3]);
    const gps=this.worldToScreen(...s.gpsPosition);c.strokeStyle='#ead59c';c.lineWidth=1;c.strokeRect(gps.sx-3,gps.sy-3,6,6);c.fillStyle='#f3db91';c.fillRect(gps.sx-1,gps.sy-1,2,2);
    const recorded=s.turnsRecord||[],marked=recorded.filter(r=>r.markedSuspicious),hpd=e.getHPD95(),mismatch=!replay&&recorded.length&&!e.isGPSInsideHPD(...s.gpsPosition,hpd);
    for(const r of marked){const p=this.worldToScreen(...r.gpsReported);this.drawInterference(p.sx,p.sy,14,now);if(r===marked.at(-1)&&(!mismatch||Math.hypot(p.sx-gps.sx,p.sy-gps.sy)>20))this.mapLabel(t.suspectedSignal,p.sx+15,p.sy-9,'#ffc0b6');}
    if(mismatch){this.drawInterference(gps.sx,gps.sy,19,now);this.mapLabel(t.signalMismatch,gps.sx+21,gps.sy+3,'#ffc0b6');}
    c.fillStyle='#7bcaca';c.fillRect(port.sx-4,port.sy-4,8,8);c.fillStyle='#0a2334';c.fillRect(port.sx-2,port.sy-2,4,4);if(Math.hypot(this.displayWorld[0]-MISSAO.porto[0],this.displayWorld[1]-MISSAO.porto[1])>10)this.mapLabel(t.portLabel,port.sx+8,port.sy+12);
    const ship=this.worldToScreen(...this.displayWorld);this.drawShip(ship.sx,ship.sy,s.currentHeading,now);
    const b=this.worldToScreen(0,0);if(this.scale>=.7){c.strokeStyle='#bed5ce';c.beginPath();c.moveTo(b.sx,b.sy+17);c.lineTo(b.sx+this.scale*10,b.sy+17);c.stroke();this.text('10 km',b.sx,b.sy+26,'#b7d6d6');}this.text(t.northLabel,this.ox+this.chartSize-2,this.oy-8,'#b4d4dc','right');
    this.mapLabels.forEach(label=>this.text(label.label,label.x,label.y,label.color));
    this.drawCompass(s.currentHeading);this.drawRadar(s,e,now);
  }
  drawReef(t){const c=this.ctx,p=MISSAO.recife.map(p=>this.worldToScreen(...p));c.fillStyle='#5a334d99';c.strokeStyle='#f18c97';c.lineWidth=1;c.beginPath();p.forEach((q,i)=>i?c.lineTo(q.sx,q.sy):c.moveTo(q.sx,q.sy));c.closePath();c.fill();c.stroke();c.save();c.clip();c.strokeStyle='#ed829680';for(let x=p[0].sx-30;x<p[1].sx+30;x+=4){c.beginPath();c.moveTo(x,p[0].sy+3);c.lineTo(x+20,p[2].sy-3);c.stroke();}c.restore();this.mapLabel(t.reefLabel,p[3].sx,p[3].sy-5,'#ffb6b9');}
  drawHeatmap(e){const c=this.ctx;let max=0;for(const p of e.grid)if(p>max)max=p;if(!max)return;for(let i=0;i<e.grid.length;i++){const p=e.grid[i];if(p<max*.004)continue;const s=this.worldToScreen(i%e.size,Math.floor(i/e.size));c.fillStyle=`rgba(95,211,247,${.12+.5*Math.sqrt(p/max)})`;c.fillRect(Math.round(s.sx-this.scale/2),Math.round(s.sy-this.scale/2),Math.ceil(this.scale),Math.ceil(this.scale));}}
  drawTarget(s,t){const c=this.ctx,observed=s.turnsRecord?.at(-1)?.turn||0;if(observed>=MISSAO.capsula.turno_revelacao){const p=this.worldToScreen(...MISSAO.capsula.pouso_real);c.strokeStyle='#afefdb';c.fillStyle='#cefbdc';c.fillRect(p.sx-3,p.sy-2,6,4);c.beginPath();c.arc(p.sx,p.sy,8,0,Math.PI*2);c.stroke();this.labelBoxes.push({left:p.sx-9,right:p.sx+9,top:p.sy-9,bottom:p.sy+9});this.mapLabel('AURORA-1',p.sx+12,p.sy+2,'#cefbdc');}else if(observed>=MISSAO.capsula.turno_blackout_inicio){const m=MISSAO.capsula.elipse_prevista,p=this.worldToScreen(...m.centro);c.setLineDash([3,2]);c.strokeStyle='#ecd09c';c.beginPath();c.ellipse(p.sx,p.sy,m.semi_eixo_x*this.scale,m.semi_eixo_y*this.scale,0,0,Math.PI*2);c.stroke();c.setLineDash([]);this.mapLabel(t.landingLabel,p.sx,p.sy-m.semi_eixo_y*this.scale-5,'#f1d1a0','center');}}
  drawInterference(x,y,r,now){const c=this.ctx;const phase=this.reduced?0:(now%3000)/3000;c.fillStyle='#c92d5930';c.strokeStyle='#eb5c7d99';for(let k=0;k<4;k++){c.beginPath();c.arc(x,y,r*(.25+k*.25)+phase*2,0,Math.PI*2);k===3&&c.fill();c.stroke();}c.fillStyle='#ff667b';c.fillRect(x-2,y-2,4,4);c.strokeStyle='#ffa0a6';c.beginPath();c.moveTo(x-r-4,y);c.lineTo(x-r-1,y);c.moveTo(x+r+1,y);c.lineTo(x+r+4,y);c.stroke();}
  drawShip(x,y,heading,now){
    const c=this.ctx,snap=this.reduced||this.current?.isReplay;
    const progress=snap?1:Math.min(1,Math.max(0,(now-(this.headingStart??now))/240)),ease=progress*progress*(3-2*progress);
    this.visualHeading=snap?heading:(this.headingFrom??heading)+PixelShipAtlas.turnDelta(this.headingFrom??heading,this.headingTarget??heading)*ease;
    const bearing=this.visualHeading*Math.PI/180,fx=Math.sin(bearing),fy=-Math.cos(bearing),rx=Math.cos(bearing),ry=Math.sin(bearing);
    // Cache distinct views instead of rotating a flat sprite (which tilted the mast).
    const scale=Math.min(1,Math.max(.42,this.scale/2)),phase=this.reduced?0:now/320;
    c.fillStyle='#a1e4e448';
    for(let i=0;i<14;i++){
      const back=29+i*2.1,spread=4+Math.sin(i*.6+phase)*1.5+i*.22;
      for(const side of[-1,1])c.fillRect(Math.round(x+(-fx*back+rx*spread*side)*scale),Math.round(y+(-fy*back+ry*spread*side)*scale*.78),Math.max(1,Math.round(3*scale)),1);
    }
    const frame=this.shipAtlas.frames[PixelShipAtlas.frameIndex(this.visualHeading)],size=Math.round(88*scale);
    c.drawImage(frame,Math.round(x-size/2),Math.round(y-48*size/88),size,size);
  }
  drawCompass(heading){const cv=document.getElementById('compass-canvas');if(!cv)return;const c=cv.getContext('2d');c.clearRect(0,0,120,120);c.imageSmoothingEnabled=false;c.fillStyle='#04152a';c.strokeStyle='#87a8b8';c.lineWidth=3;c.beginPath();c.arc(60,60,51,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle='#3b6075';c.lineWidth=1;c.beginPath();c.arc(60,60,45,0,Math.PI*2);c.stroke();c.fillStyle='#e6ece3';c.font='bold 14px monospace';c.textAlign='center';c.fillText('N',60,28);c.fillText('S',60,103);c.fillText(window.gameApp?.currentLang==='en'?'W':'O',22,65);c.fillText('E',98,65);c.save();c.translate(60,60);c.rotate(heading*Math.PI/180);c.fillStyle='#ff8791';c.beginPath();c.moveTo(0,-30);c.lineTo(-4,0);c.lineTo(4,0);c.fill();c.fillStyle='#8de3fd';c.beginPath();c.moveTo(0,29);c.lineTo(-4,0);c.lineTo(4,0);c.fill();c.restore();c.fillStyle='#d1eadb';c.fillRect(57,57,6,6);}
  drawRadar(s,e,now){const cv=document.getElementById('radar-canvas');if(!cv)return;const c=cv.getContext('2d');c.clearRect(0,0,132,112);c.fillStyle='#031d20';c.strokeStyle='#3c8b6e';c.lineWidth=1;c.beginPath();c.arc(66,55,49,0,Math.PI*2);c.fill();c.stroke();for(const r of [16,32]){c.beginPath();c.arc(66,55,r,0,Math.PI*2);c.stroke();}c.strokeStyle='#3c8b6e99';c.beginPath();c.moveTo(17,55);c.lineTo(115,55);c.moveTo(66,6);c.lineTo(66,104);c.stroke();const angle=this.reduced?-Math.PI/3:now/1900;c.fillStyle='#62f8a527';c.beginPath();c.moveTo(66,55);c.arc(66,55,48,angle-.7,angle);c.closePath();c.fill();c.strokeStyle='#a6f9b4';c.beginPath();c.moveTo(66,55);c.lineTo(66+48*Math.cos(angle),55+48*Math.sin(angle));c.stroke();const p=this.current.isReplay?s.realPosition:e.getMAP(),dx=(s.gpsPosition[0]-p[0])*5,dy=(s.gpsPosition[1]-p[1])*5;c.fillStyle='#bbefc9';c.fillRect(64,53,4,4);c.fillStyle='#ffc79a';c.fillRect(65+Math.max(-44,Math.min(44,dx)),54-Math.max(-44,Math.min(44,dy)),3,3);}
}

// Original 5 × 7 bitmap lettering: embedded, network-free, crisp at integer scales.
function drawTitle(){
 const letters={G:['01111','10000','10000','10111','10001','10001','01110'],H:['10001','10001','10001','11111','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],R:['11110','10001','10001','11110','10100','10010','10001'],U:['10001','10001','10001','10001','10001','10001','01110'],E:['11111','10000','10000','11110','10000','10000','11111']};
 const cv=document.getElementById('title-canvas'),c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);const pixels=[];let x=10;for(const ch of 'GHOST ROUTE'){if(ch===' '){x+=14;continue;}letters[ch].forEach((row,y)=>{[...row].forEach((v,col)=>{if(v==='1')pixels.push([x+col*5,8+y*5,y]);});});x+=31;}
 for(const[a,b]of pixels){c.fillStyle='#000719';c.fillRect(a-4,b-4,13,14);c.fillStyle='#568cad';c.fillRect(a-2,b-2,9,11);}for(const[a,b,y]of pixels){c.fillStyle=y<3?'#e5faff':y<5?'#a7deed':'#6aaabf';c.fillRect(a,b,5,5);c.fillStyle='#122944';c.fillRect(a,b+5,5,2);}
}



