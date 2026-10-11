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
  pedras: [],
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
  const curve=difficulty*difficulty*(3-2*difficulty);
  m.dificuldade = Math.round(difficulty*100);
  // The voyage grows from sheltered training water to the far side of the chart.
  m.turnos = Math.min(12, 4 + Math.floor(level/10));
  m.navio.velocidade_km_turno = Math.SQRT2 * 4;
  const currentProgress=Math.max(0,(level-5)/94);
  m.navio.ruido_corrente_km = level < 5 ? 0 : .01+.49*currentProgress*currentProgress*(3-2*currentProgress);
  m.inercial.crescimento_km_turno = .12 + difficulty * .88;
  m.sensor.shots_total = 8000 - Math.round(curve * 5000 / 100) * 100;
  m.vitoria.raio_resgate_km = 4 - curve * 2.4;
  const rng = mulberry32(7717), round = v => Math.round(v * 10) / 10;
  const target = [round(26+difficulty*60),round(31+difficulty*56)];
  // Gates: walls of reef or sandbank across the route, each with one opening on
  // alternating sides, so every voyage bends into a zigzag instead of a straight line.
  // Alternate open-water rock courses with gated passages. Gates are one
  // challenge family, not the prerequisite for every voyage or every curve.
  const gateCount = level<25||level%10<5 ? 0 : level<55 ? 1 : level<85 ? 2 : 3;
  m.tipo_rota=gateCount?'passages':'openWater';
  m.mecanicas = ['navigation', 'sensor', 'rescue'];
  if (level >= 5) m.mecanicas.push('current');
  if (level >= 10) m.mecanicas.push('rocks');
  if (gateCount) m.mecanicas.push('sandbank');
  if (level >= 35) m.mecanicas.push('jump');
  if (level >= 45) m.mecanicas.push('ghz');
  if (level >= 55) m.mecanicas.push('reef');
  if (level >= 65) m.mecanicas.push('blackout');
  if (level >= 70) m.mecanicas.push('ghost');
  if (level >= 75) m.mecanicas.push('drift');
  if (level >= 90) m.mecanicas.push('freeze');
  if (level >= 95) m.mecanicas.push('budget');
  if (gateCount===3) m.mecanicas.push('slalom');
  m.capsula.pouso_real = target;
  m.capsula.elipse_prevista = {centro:[target[0],round(target[1]-difficulty*3)],semi_eixo_x:2+difficulty*6,semi_eixo_y:2+difficulty*3};
  m.capsula.turno_blackout_inicio = level < 65 ? 0 : 2;
  m.capsula.turno_revelacao = level < 65 ? 0 : Math.max(3,Math.floor(m.turnos * .65));
  const port = m.porto, along = [target[0]-port[0], target[1]-port[1]], span = Math.hypot(...along);
  const dir = [along[0]/span, along[1]/span], side = [-dir[1], dir[0]];
  const at = (t, offset) => [port[0]+along[0]*t+side[0]*offset, port[1]+along[1]*t+side[1]*offset];
  // The original square reef now sits away from the route as a landmark.
  m.recife = [];
  const clip = poly => {
    // Sutherland-Hodgman clipping to the chart, so every vertex stays inside 1..99 km.
    let out = poly;
    for (const [axis, limit, keep] of [[0,1,v=>v>=1],[0,99,v=>v<=99],[1,1,v=>v>=1],[1,99,v=>v<=99]]) {
      const input = out; out = [];
      for (let i = 0; i < input.length; i++) {
        const a = input[i], b = input[(i + 1) % input.length], ia = keep(a[axis]), ib = keep(b[axis]);
        if (ia) out.push(a);
        if (ia !== ib) { const f = (limit - a[axis]) / (b[axis] - a[axis]); out.push([a[0] + (b[0]-a[0]) * f, a[1] + (b[1]-a[1]) * f]); }
      }
    }
    return out.map(p => [round(p[0]), round(p[1])]);
  };
  m.barreiras = []; m.bancos = []; m.passagens = [];
  const gateT = [.42,.65,.82].slice(0,gateCount);
  const widths=[25,55,85].map(first=>26-18*Math.max(0,(level-first)/(99-first)));
  const gapOffset=i=>(i%2?-1:1)*(8+curve*9);
  gateT.forEach((t, i) => {
    const gap=gapOffset(i),width=widths[i];
    const sand = i%2===0, thick = sand ? 3+curve*1.4 : 2+curve;
    m.passagens.push(at(t, gap).map(round));
    // Each gate is two wall pieces, one on each side of the opening.
    for (const [from, to] of [[-160, gap - width / 2], [gap + width / 2, 160]]) {
      const inner = Math.abs(from) < Math.abs(to) ? from : to, outer = inner === from ? to : from, dirOut = Math.sign(outer - inner);
      const along = h => [dir[0] * h, dir[1] * h], pt = (o, h) => { const q = at(t, o), d = along(h); return [q[0] + d[0], q[1] + d[1]]; };
      // Sandbanks taper into a soft point at the opening; reefs end square.
      const tip = sand ? [pt(inner - dirOut * 1.2, 0)] : [];
      const piece = [pt(outer, -thick / 2), pt(inner, -thick / 2), ...tip, pt(inner, thick / 2), pt(outer, thick / 2)];
      const clipped = clip(piece);
      if (clipped.length >= 3) (sand ? m.bancos : m.barreiras).push(clipped);
    }
  });
  // Reserve maneuvering distance using the actual alternating passage centers.
  // A fixed multiplier of the direct distance made level 01 tighter than late
  // missions, and produced sudden pressure jumps when a second/third gate appeared.
  // This is a design reference (not a shortest path or a human success rate).
  if(level>0){
    const route=[m.porto,...m.passagens,target];
    const length=route.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-route[i][0],p[1]-route[i][1]),0);
    m.navio.velocidade_km_turno=length/(m.turnos*(.70+.22*curve));
  }
  // The square landmark reef moves to the first patch of open water away from the walls.
  const overlaps = (a, b) => a.some(p => isPointInPoly(p, b)) || b.some(p => isPointInPoly(p, a)) ||
    a.some((p, i) => b.some((q, j) => segmentsIntersect(p, a[(i + 1) % a.length], q, b[(j + 1) % b.length])));
  const walls = [...m.barreiras, ...m.bancos];
  const spots = [[78,22],[86,8],[8,86],[90,40],[40,90],[60,8],[8,60]];
  for (let x = 4; x <= 90; x += 4) for (let y = 4; y <= 90; y += 4) spots.push([x, y]);
  const clearOf = (x, y) => [port, target, ...m.passagens].every(q => Math.hypot(x + 3 - q[0], y + 3 - q[1]) > 12);
  for (const [x, y] of level>=55?spots:[]) {
    if (!clearOf(x, y)) continue;
    const square = [[x,y],[x+6,y],[x+6,y+6],[x,y+6]], grown = [[x-3,y-3],[x+9,y-3],[x+9,y+9],[x-3,y+9]];
    if (!walls.some(w => overlaps(grown, w))) { m.recife = square; break; }
  }
  // Rocks guard the approaches to each opening without closing it.
  m.pedras = [];
  const rockCount = level<10 ? 0 : 1+Math.floor((level-10)/89*7);
  // Independent rocks bend open-water routes too. The first is small and
  // easy to go around; later rocks create a course without full-width walls.
  for (let slot=0;slot<48;slot++) {
    if (m.pedras.length >= rockCount) break;
    const off=slot===0?0:(slot%2?-1:1)*(2+(slot%4)*2);
    const radius = .65+curve*1.75, center = at(.20+(slot%12)*.05,off), sides = 6, angle = rng() * Math.PI;
    const shape = Array.from({length: sides}, () => .8 + rng() * .2);
    const rock = shape.map((factor, i) => { const a = angle + i / sides * Math.PI * 2; return [round(center[0] + Math.cos(a) * radius * factor), round(center[1] + Math.sin(a) * radius * factor)]; });
    if (rock.some(p => p.some(v => v <= 1 || v >= 99))) continue;
    if ([m.recife, ...walls, ...m.pedras].filter(o=>o.length).some(o => overlaps(rock, o))) continue;
    if ([port, target].some(q => Math.hypot(center[0] - q[0], center[1] - q[1]) < radius + 4)) continue;
    m.pedras.push(rock);
  }
  m.ataques = [];
  // Jumps are large enough that the ghost Aurora separates clearly from the real capsule.
  if (level >= 35){const start=level<65?3:8; m.ataques.push({tipo:'salto',inicio:start,fim:start+(level>=80?1:0),deslocamento_km:[-(1.6+(level-35)/64*6.9),.6+(level-35)/64*2.4]});}
  if (level >= 75) m.ataques.push({tipo:'deriva',inicio:5,fim:m.turnos-2,km_por_turno:[.08+(level-75)/24*.52,-(.08+(level-75)/24*.52)]});
  if (level >= 90) m.ataques.push({tipo:'congelamento',inicio:level<95?m.turnos-2:m.turnos-3,fim:m.turnos-2});
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

// The reef and every rock are obstacles: hitting any of them runs the ship aground.
function missionObstacles() { return [MISSAO.recife, ...(MISSAO.pedras || []), ...(MISSAO.barreiras || []), ...(MISSAO.bancos || [])]; }
function hitsObstacle(p1, p2) { return missionObstacles().some(poly => checkReefCollision(p1, p2, poly)); }
function distToObstacles(pt) { return Math.min(...missionObstacles().map(poly => distToPolygon(pt, poly))); }

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

    ctx.fillStyle = "#1b1238";
    ctx.fillRect(4, 4, 40, 40);
    ctx.strokeStyle = "#b69cff";
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 40, 40);

    ctx.fillStyle = "#ffd166";
    ctx.fillRect(22, 1, 4, 4);

    ctx.fillStyle = "#0d0820";
    ctx.fillRect(8, 8, 32, 32);

    // Bevelled casing, tiny screws and screen reflections complete the bridge portrait.
    ctx.fillStyle = "#e8ddff"; ctx.fillRect(6, 5, 35, 1);
    ctx.fillStyle = "#4a365e"; ctx.fillRect(42, 6, 1, 36); ctx.fillRect(6, 42, 36, 1);
    for (const x of [6, 40]) for (const y of [6, 40]) {
      ctx.fillStyle = "#ccb9df"; ctx.fillRect(x, y, 2, 2);
      ctx.fillStyle = "#5b436f"; ctx.fillRect(x, y + 1, 2, 1);
    }
    ctx.fillStyle = "#262243"; ctx.fillRect(9, 9, 29, 1); ctx.fillRect(9, 10, 1, 27);
    ctx.fillStyle = "#baf9ed"; ctx.fillRect(12, 36, 2, 1);
    ctx.fillStyle = "#ffd166"; ctx.fillRect(16, 36, 2, 1);
    ctx.fillStyle = "#574368"; ctx.fillRect(20, 36, 16, 1);

    if (expression === 'happy') {
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(12, 18, 8, 3);
      ctx.fillRect(12, 15, 2, 3);
      ctx.fillRect(18, 15, 2, 3);
      ctx.fillRect(28, 18, 8, 3);
      ctx.fillRect(28, 15, 2, 3);
      ctx.fillRect(34, 15, 2, 3);
      ctx.fillRect(20, 28, 8, 3);
    } else if (expression === 'worried') {
      ctx.fillStyle = "#ffb347";
      ctx.fillRect(12, 17, 8, 4);
      ctx.fillRect(28, 17, 8, 4);
      ctx.fillRect(22, 30, 4, 3);
    } else if (expression === 'alert') {
      ctx.fillStyle = "#ff6b6b";
      ctx.fillRect(12, 15, 9, 8);
      ctx.fillRect(27, 15, 9, 8);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(15, 18, 3, 3);
      ctx.fillRect(30, 18, 3, 3);
      ctx.fillStyle = "#ff6b6b";
      ctx.fillRect(21, 28, 6, 5);
    } else if (expression === 'thoughtful') {
      ctx.fillStyle = "#b69cff";
      ctx.fillRect(12, 18, 8, 4);
      ctx.fillRect(28, 15, 8, 4);
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(22, 28, 4, 3);
    } else {
      ctx.fillStyle = "#d7c8ff";
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
  // k = pixels per hull unit. k=1 is the original 88 px sprite; the map draws a
  // larger "32-bit" atlas (k≈2) on its own full-resolution layer.
  constructor(k=1) { this.k=k;this.frames=Array.from({length:64},(_,i)=>this.paint(i*5.625)); }
  static normalize(heading) { return ((heading%360)+360)%360; }
  static turnDelta(from,to) { return (((to-from+180)%360)+360)%360-180; }
  static frameIndex(heading) { return Math.round(PixelShipAtlas.normalize(heading)/5.625)%64; }
  static approachHeading(current,target,elapsedMs,snap=false) {
    target=PixelShipAtlas.normalize(target);
    if(snap||!Number.isFinite(current))return target;
    const delta=PixelShipAtlas.turnDelta(current,target);
    if(Math.abs(delta)<.08)return target;
    // Retargeting changes only the destination; it never restarts the animation clock.
    const amount=1-Math.exp(-Math.max(0,Math.min(250,elapsedMs))/65);
    return PixelShipAtlas.normalize(current+delta*amount);
  }
  paint(heading) {
    const k=this.k,size=Math.round(88*k),hi=k>=1.4;
    const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;
    const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
    const angle=heading*Math.PI/180,fx=Math.sin(angle),fy=-Math.cos(angle),rx=Math.cos(angle),ry=Math.sin(angle);
    const project=([u,v,z=0])=>[Math.round(44*k+(u*fx+v*rx)*k),Math.round(48*k+((u*fy+v*ry)*.78-z)*k)];
    const pixel=(x,y,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,1,1);};
    const line=(a,b,color)=>{
      let [x,y]=a;const [tx,ty]=b,dx=Math.abs(tx-x),dy=-Math.abs(ty-y),sx=x<tx?1:-1,sy=y<ty?1:-1;let error=dx+dy;
      for(;;){pixel(x,y,color);if(x===tx&&y===ty)break;const twice=2*error;if(twice>=dy){error+=dy;x+=sx;}if(twice<=dx){error+=dx;y+=sy;}}
    };
    const fillPts=(pts,color)=>{
      const ys=pts.map(p=>p[1]);ctx.fillStyle=color;
      for(let y=Math.min(...ys);y<=Math.max(...ys);y++){
        const xs=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=y+.5&&b[1]>y+.5)||(b[1]<=y+.5&&a[1]>y+.5))xs.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]));}
        xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2)ctx.fillRect(Math.ceil(xs[i]),y,Math.max(1,Math.floor(xs[i+1])-Math.ceil(xs[i])+1),1);
      }
    };
    const poly=(vertices,color,outline='#2a1530')=>{const pts=vertices.map(project);fillPts(pts,color);if(outline)pts.forEach((p,i)=>line(p,pts[(i+1)%pts.length],outline));};
    // Sunset light comes from the top right of the chart; faces turned to it are brighter.
    const L=[.6,-.8];
    const facing=(a,b,z,orient)=>{const p=project([...a,z]),q=project([...b,z]);let nx=(q[1]-p[1])*orient,ny=-(q[0]-p[0])*orient;const n=Math.hypot(nx,ny)||1;nx/=n;ny/=n;return{nx,ny,light:nx*L[0]+ny*L[1]};};
    const orientation=pts=>{let a=0;for(let i=0;i<pts.length;i++){const p=project([...pts[i],0]),q=project([...pts[(i+1)%pts.length],0]);a+=p[0]*q[1]-q[0]*p[1];}return a>0?1:-1;};
    const ramp=(colors,light)=>colors[Math.max(0,Math.min(colors.length-1,Math.round((light+1)/2*(colors.length-1))))];

    const hull=[[-28,-5],[-23,-8],[9,-8],[22,-5],[30,0],[22,5],[9,8],[-23,8],[-28,5]];
    const hullOrient=orientation(hull);
    // Soft shadow on the water, cast away from the sun (32-bit depth cue).
    if(hi){const off=Math.round(2*k);fillPts(hull.map(([u,v])=>{const p=project([u,v,-2]);return[p[0]-off,p[1]+off];}),'rgba(13,8,32,.45)');}
    poly(hull.map(([u,v])=>[u,v,-2]),'#6e2410');
    poly(hull.map(([u,v])=>[u,v,1]),'#ff7a2e');
    const sideRamp=['#6e2410','#9a3514','#c2481a','#e0601f','#ff7a2e','#ff9a55'];
    for(let i=0;i<hull.length;i++){
      const a=hull[i],b=hull[(i+1)%hull.length],f=facing(a,b,0,hullOrient);
      if(f.ny>0||(!hi&&project(a)[1]+project(b)[1]>=96*k)){
        poly([[...a,1],[...b,1],[...b,-2],[...a,-2]],ramp(sideRamp,f.light));
        if(hi)line(project([...a,-.6]),project([...b,-.6]),'#fff1de'); // white rescue stripe
      }
      if(hi&&f.light>.25)line(project([...a,1]),project([...b,1]),'#ffc489'); // sunlit gunwale
    }
    const deck=[[-25,-4],[-21,-6],[8,-6],[20,-4],[26,0],[20,4],[8,6],[-21,6],[-25,4]];
    poly(deck.map(([u,v])=>[u,v,2]),'#efe2d2','#fff6ea');
    if(hi){for(const v of[-3,-1.5,1.5,3])line(project([-20,v,2]),project([18-Math.abs(v)*1.5,v,2]),'#e2d2bf');}
    line(project([-22,0,3]),project([22,0,3]),'#c9b29a');
    // Railing: a thin rail with posts along the deck edge.
    if(hi){const railOrient=orientation(deck);for(let i=0;i<deck.length;i++){const a=deck[i],b=deck[(i+1)%deck.length],f=facing(a,b,0,railOrient);line(project([...a,4]),project([...b,4]),f.ny>0?'#fff6ea':'#d9c6b0');const n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/3));for(let j=0;j<n;j++){const t=j/n,u=a[0]+(b[0]-a[0])*t,v=a[1]+(b[1]-a[1])*t;line(project([u,v,2]),project([u,v,4]),'#e9d8c6');}}}
    const box=(u1,u2,v1,v2,height,opt={})=>{
      const corners=[[u1,v1],[u2,v1],[u2,v2],[u1,v2]],faces=[],orient=orientation(corners);
      const sides=opt.sides||['#a8978a','#c7b6a4','#e3d4c2','#fff1de'];
      for(let i=0;i<4;i++){
        const a=corners[i],b=corners[(i+1)%4];faces.push({a,b,y:(project(a)[1]+project(b)[1])/2,f:facing(a,b,0,orient)});
      }
      faces.sort((a,b)=>a.y-b.y).forEach(({a,b,f},i)=>{
        poly([[...a,2],[...b,2],[...b,height],[...a,height]],hi?ramp(sides,f.light):(i<2?sides[1]:sides[2]));
        if(opt.windows&&height>5){
          if(hi&&f.ny>0){const panes=5;for(let w=0;w<panes;w++){const t0=(w+.2)/panes,t1=(w+.8)/panes,P=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
            const quad=[[...P(t0),height-1.5],[...P(t1),height-1.5],[...P(t1),height-3.5],[...P(t0),height-3.5]];poly(quad,'#1f2a4a',null);line(project(quad[0]),project([...P((t0+t1)/2),height-1.5]),'#7fd4ff');}}
          else line(project([a[0]*.75+b[0]*.25,a[1]*.75+b[1]*.25,height-2]),project([a[0]*.25+b[0]*.75,a[1]*.25+b[1]*.75,height-2]),'#7fd4ff');
        }
      });
      poly(corners.map(([u,v])=>[u,v,height]),opt.roof||'#fff6ea','#3a1f2a');
      line(project([u1+1,v1+1,height]),project([u2-1,v1+1,height]),opt.stripe||'#ff8a3d');
    };
    // Stern: an orange rescue lifeboat on its cradle.
    box(-21,-12,-4,4,5,{sides:['#9a3514','#c2481a','#e0601f','#ff7a2e'],roof:'#ff9a55',stripe:'#fff1de'});
    box(-3,11,-5,5,10,{windows:true}); // wheelhouse: roof and visible faces vary with the angle
    poly([[-1,-3,11],[7,-3,11],[7,3,11],[-1,3,11]],'#ff8a3d','#ffc489');
    if(hi){line(project([5,-2.5,12.5]),project([5,2.5,12.5]),'#e9d8c6');line(project([5,0,11]),project([5,0,12.5]),'#c9b29a');
      const port=project([4,-5.3,8]),star=project([4,5.3,8]);ctx.fillStyle='#ff6b6b';ctx.fillRect(port[0],port[1],2,2);ctx.fillStyle='#7be08a';ctx.fillRect(star[0],star[1],2,2);}
    const mast=project([0,0,11]),tip=project([0,0,22]);
    line([mast[0]-1,mast[1]], [tip[0]-1,tip[1]],'#2a1530');line(mast,tip,'#fff1de');if(hi)line([mast[0]+1,mast[1]],[tip[0]+1,tip[1]],'#e2d2bf');
    line(project([0,-6,19]),project([0,6,19]),'#e9d8c6');
    pixel(tip[0],tip[1]-1,'#ffd166');if(hi){pixel(tip[0]+1,tip[1]-1,'#ffd166');pixel(tip[0],tip[1]-2,'#ffe9a8');}
    for(const u of[-25,-15,16])for(const v of[-5,5]){const p=project([u,v,4]);pixel(p[0],p[1],'#ffe9a8');}
    // Bow spray where the hull cuts the water.
    if(hi){for(const[u,v]of[[31,0],[30,-2],[30,2],[28,-4],[28,4],[32,-1],[32,1]]){const p=project([u,v,-2]);pixel(p[0],p[1],'#fff6ea');}}
    const bow=project([26,0,4]);pixel(bow[0],bow[1],'#baf9ed');pixel(bow[0]+1,bow[1],'#70d9ea');
    return canvas;
  }
}
class TacticalMapRenderer {
  constructor(canvasId){
    this.canvas=document.getElementById(canvasId);this.ctx=this.canvas.getContext('2d');this.padding=32;this.worldMax=100;this.current=null;this.displayWorld=null;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.lastFrame=0;
    this.shipAtlas=new PixelShipAtlas();this.ocean=document.createElement('canvas');
    // The ship lives on its own full-resolution layer: twice the detail of the 16-bit chart.
    this.shipLayer=document.createElement('canvas');this.shipLayer.className='ship-layer';this.shipLayer.setAttribute('aria-hidden','true');this.canvas.after(this.shipLayer);this.shipCtx=this.shipLayer.getContext('2d');
    this.resize();
    window.addEventListener('resize',()=>{this.resize();if(this.current)this.drawScene(performance.now());});
    this.loop=(now)=>{if(this.current&&now-this.lastFrame>32){this.lastFrame=now;this.drawScene(now);}requestAnimationFrame(this.loop);};requestAnimationFrame(this.loop);
  }
  resize(){
    const r=this.canvas.getBoundingClientRect();this.canvas.width=Math.max(1,Math.round(r.width));this.canvas.height=Math.max(1,Math.round(r.height));this.ctx.setTransform?.(2,0,0,2,0,0);this.ctx.imageSmoothingEnabled=false;
    const w=this.canvas.width/2,h=this.canvas.height/2,ratioX=w/r.width,ratioY=h/r.height;
    const bounds=selector=>{const el=document.querySelector(selector);return el&&getComputedStyle(el).display!=='none'?el.getBoundingClientRect():null;};
    const hud=bounds('.hud-top'),dock=bounds('.navigation-dock'),telemetry=bounds('.telemetry-strip'),radio=bounds('.radio-widget');
    const portrait=r.width<=850&&r.height>520||r.width<=620;
    const short=r.height<500;
    const sideDock=short&&dock&&dock.left>r.width*.4&&dock.width<r.width*.6;
    const floatingRadio=document.querySelector('.radio-widget')?.classList?.contains('radio-floating');
    const top=(Math.max(hud?.bottom||100,(portrait||sideDock)?telemetry?.bottom||0:0,portrait&&!floatingRadio?radio?.bottom||0:0,portrait?bounds('.compass-widget')?.bottom||0:0)+26-r.top)*ratioY;
    // In the bridge layout the window frame ends above the console; keep the axis labels inside it.
    const frameBox=bounds('.bezel'),frameBottom=frameBox&&dock&&frameBox.bottom<dock.top?frameBox.bottom-r.top-46:Infinity;
    const bottom=Math.min(sideDock?r.height-70:dock?dock.top-r.top-64:r.height-70,frameBottom)*ratioY;
    let left=26*ratioX,right=w-26*ratioX;
    if(sideDock)right=(dock.left-r.left-24)*ratioX;
    else if(!portrait){
      // Only panels that sit beside the chart band push it sideways; console panels below it do not.
      const bandTop=top/ratioY+r.top,bandBottom=bottom/ratioY+r.top,beside=p=>p&&p.top<bandBottom&&p.bottom>bandTop;
      for(const selector of['.compass-widget','.radar-widget',...(!floatingRadio?['.radio-widget']:[])]){const p=bounds(selector);if(beside(p))left=Math.max(left,(p.right-r.left+24)*ratioX);}
      for(const selector of['.utility','.telemetry-strip','.chart-legend']){const p=bounds(selector);if(beside(p))right=Math.min(right,(p.left-r.left-24)*ratioX);}
    }
    this.scale=Math.max(.12,Math.min((right-left)/100,(bottom-top)/100));
    this.chartSize=100*this.scale;this.ox=left+(right-left-this.chartSize)/2;this.oy=top+(Math.max(0,bottom-top-this.chartSize))/2;this.makeOcean();
    if(this.shipLayer){this.shipLayer.width=Math.max(1,Math.round(r.width));this.shipLayer.height=Math.max(1,Math.round(r.height));this.shipCtx.imageSmoothingEnabled=false;
      const k=Math.max(1,Math.round(2*this.shipScale()*TacticalMapRenderer.SHIP_ZOOM*4)/4);if(k!==this.shipK){this.shipK=k;this.hiAtlas=new PixelShipAtlas(k);}}
  }
  static get SHIP_ZOOM(){return .8;}
  shipScale(){return Math.min(1,Math.max(.42,this.scale/2));}
  worldToScreen(x,y){return{sx:this.ox+x*this.scale,sy:this.oy+(100-y)*this.scale};}
  screenToWorld(x,y){return[(x-this.ox)/this.scale,100-(y-this.oy)/this.scale];}
  makeOcean(){
    // Full-resolution chart with half-pixel facets and two cached ocean frames.
    this.oceanFrames=[0,1].map(frame=>this.paintOcean(frame));this.ocean=this.oceanFrames[0];
  }
  paintOcean(frame){
    const c=document.createElement('canvas');c.width=this.canvas.width;c.height=this.canvas.height;const g=c.getContext('2d'),W=c.width/2,H=c.height/2;g.scale(2,2);
    // Sunset sky reflected on the sea: stepped bands, warm violet at the top to deep navy at the bottom.
    const bands=['#4a2358','#43245e','#3b2765','#322a68','#292c69','#212d66','#1b2c60','#162a58','#12264f','#0f2247','#0d1e40'];
    const bh=Math.ceil(H/bands.length);
    bands.forEach((color,i)=>{g.fillStyle=color;g.fillRect(0,i*bh,W,bh);});
    // Checker dithering on band edges keeps the gradient pixelated, never smooth.
    for(let i=0;i<bands.length-1;i++){const y0=(i+1)*bh;for(let y=y0-3;y<y0+3;y++){g.fillStyle=y<y0?bands[i+1]:bands[i];for(let x=(y+i)%2;x<W;x+=2)if((y<y0)===((x+y)%4<2))g.fillRect(x,y,1,1);}}
    // Low sun glow near the top right, drawn with dithered dots that thin out with distance.
    const sunX=Math.round(W*.74),sunY=Math.round(H*.06),rx=W*.42,ry=H*.36;
    const rng=mulberry32(4401+frame*17);
    const glow=['#ffb347','#ff8a3d','#e0651f','#b8466a','#7a3070'];
    // Ordered (Bayer) dithering: an even, retro pattern instead of random noise.
    const bayer=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
    for(let y=0;y<Math.min(H,sunY+ry);y++)for(let x=Math.max(0,Math.floor(sunX-rx));x<Math.min(W,sunX+rx);x+=1){
      const d=Math.hypot((x-sunX)/rx,(y-sunY)/ry);if(d>=1)continue;
      if(bayer[y%4][x%4]/16<Math.pow(1-d,2.6)*.42){g.fillStyle=glow[Math.min(glow.length-1,Math.floor(d*glow.length))];g.fillRect(x,y,1,1);}
    }
    // Sun path: golden glints on the water below the sun, widening and fading downward.
    const glints=['#ffe9a8','#ffd166','#ffb347','#ff8a3d'];
    for(let i=0;i<W*H/900;i++){
      const y=Math.floor(Math.pow(rng(),1.6)*H),spread=5+y*.32,x=Math.round(sunX+(rng()-.5)*2*spread);
      if(x<0||x>=W||rng()>1-y/H*.85)continue;
      g.fillStyle=glints[Math.min(3,Math.floor(y/H*4+rng()*.8))];g.fillRect(x,y,2+Math.floor(rng()*4),1);
    }
    // Wave dashes, shifted between the two frames.
    const waveRng=mulberry32(837211);
    for(let i=0;i<W*H/150;i++){
      const x=Math.floor(waveRng()*W),y=Math.floor(waveRng()*H),pick=Math.floor(waveRng()*3),len=Math.ceil(waveRng()*5)+2,curl=waveRng()>.6;
      const t=y/H,palette=t<.3?['#6a3f7a','#5e3a86','#7a4a8a']:t<.65?['#3e4a8a','#45508f','#36437f']:['#2a4a78','#1f3f6c','#305584'];
      const dx=frame?2:0;g.fillStyle=palette[pick];g.fillRect(x+dx,y,len,1);if(curl){g.fillRect(x+dx+2,y-1,2,1);g.fillRect(x+dx+4,y+1,2,1);}g.fillStyle='#c6a2e144';g.fillRect(x+dx+.5,y-.5,Math.max(1,len-2),.5);
    }
    for(let y=0;y<H;y+=3){g.fillStyle='#0b061920';g.fillRect(0,y,W,1);}
    return c;
  }
  render(state,estimator,isReplay=false,debug=false){
    this.current={state,estimator,isReplay,debug};this.noteReadings(state);const target=(debug||isReplay)?state.realPosition:estimator.getMAP();
    const now=performance.now(),heading=PixelShipAtlas.normalize(state.currentHeading);
    this.headingTarget=heading;
    if(this.reduced||isReplay)this.visualHeading=heading;
    if(!this.target||Math.hypot(this.target[0]-target[0],this.target[1]-target[1])>.01){this.animFrom=this.displayWorld?[...this.displayWorld]:[...target];this.target=[...target];this.animStart=performance.now();}
    if(this.reduced||isReplay)this.displayWorld=[...target];this.drawScene(performance.now());
  }
  text(label,x,y,color='#f3e6f2',align='left'){const c=this.ctx;c.font='bold 7px monospace';c.textAlign=align;c.fillStyle='#0d0820';c.fillText(label,x+1,y+1);c.fillStyle=color;c.fillText(label,x,y);c.textAlign='left';}
  // optional=true: a secondary name that is simply left out when it can't find free space.
  mapLabel(label,x,y,color='#f3e6f2',align='left',optional=false){
    const c=this.ctx;c.font='bold 7px monospace';
    const left=this.ox+2,right=this.ox+this.chartSize-2,top=this.oy+8,bottom=this.oy+this.chartSize-3;
    const lines=[];let line='';for(const word of label.split(' ')){const candidate=line?line+' '+word:word;if(line&&c.measureText(candidate).width>right-left){lines.push(line);line=word;}else line=candidate;}if(line)lines.push(line);
    const width=Math.max(...lines.map(value=>c.measureText(value).width)),height=lines.length*9;
    const anchor=align==='center'?x-width/2:align==='right'?x-width:x;
    const candidates=[[anchor,y],[anchor,y-16],[anchor,y+16],[x-width-12,y],[x+12,y],[x+12,y-16],[x-width-12,y-16],[x+12,y+16],[x-width-12,y+16],[anchor,y-28],[anchor,y+28],[left,top]];
    let best=null,bestOverlap=Infinity;
    // A secondary name never jumps to the chart corner: far from its place it would mislead.
    for(const[px,py]of optional?candidates.slice(0,-1):candidates){
      const bx=Math.max(left,Math.min(right-width,px)),by=Math.max(top,Math.min(bottom-height+9,py));
      const box={left:bx-2,right:bx+width+2,top:by-8,bottom:by+height-6};
      let overlap=0;for(const occupied of this.labelBoxes||[]){overlap+=Math.max(0,Math.min(box.right,occupied.right)-Math.max(box.left,occupied.left))*Math.max(0,Math.min(box.bottom,occupied.bottom)-Math.max(box.top,occupied.top));}
      if(overlap<bestOverlap){best={bx,by,box};bestOverlap=overlap;}if(!overlap)break;
    }
    if(optional&&bestOverlap>0)return;
    this.labelBoxes.push(best.box);lines.forEach((value,index)=>this.mapLabels.push({label:value,x:best.bx,y:best.by+index*9,color}));
  }
  line(points,color,width,dash=[]){if(!points?.length)return;const c=this.ctx;c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.beginPath();points.forEach((p,i)=>{const s=this.worldToScreen(...p);i?c.lineTo(s.sx,s.sy):c.moveTo(s.sx,s.sy);});c.stroke();c.setLineDash([]);}
  drawScene(now){
    const{state:s,estimator:e,isReplay:replay,debug}=this.current;this.frameNow=now;if(this.shipCtx)this.shipCtx.clearRect(0,0,this.shipLayer.width,this.shipLayer.height);const c=this.ctx,w=this.canvas.width/2,h=this.canvas.height/2;const t=TEXTOS[window.gameApp?.currentLang||'pt-BR'];c.imageSmoothingEnabled=false;c.drawImage(this.oceanFrames?.[this.reduced?0:Math.floor(now/650)%2]||this.ocean,0,0,w,h);
    const u=this.reduced||replay?1:Math.min(1,(now-this.animStart)/1500);const f=u*u*(3-2*u);this.displayWorld=this.target.map((v,i)=>this.animFrom[i]+(v-this.animFrom[i])*f);
    const shipAnchor=this.worldToScreen(...this.displayWorld),shipScale=Math.min(1,Math.max(.42,this.scale/2))*(this.shipLayer?TacticalMapRenderer.SHIP_ZOOM:1);
    this.labelBoxes=[{left:shipAnchor.sx-29*shipScale,right:shipAnchor.sx+29*shipScale,top:shipAnchor.sy-26*shipScale,bottom:shipAnchor.sy+22*shipScale}];
    this.mapLabels=[];const compact=this.chartSize<180; // small charts (phones) only keep names that fit
    // Grid and a low-key map boundary; the ocean itself fills the viewport.
    c.strokeStyle='#d7c8ff26';c.lineWidth=.5;for(let km=0;km<=100;km+=10){const p=this.worldToScreen(km,km);c.beginPath();c.moveTo(p.sx,this.oy);c.lineTo(p.sx,this.oy+this.chartSize);c.moveTo(this.ox,p.sy);c.lineTo(this.ox+this.chartSize,p.sy);c.stroke();if(km%(this.scale<.7?100:20)===0){this.text(String(km),p.sx,this.oy+this.chartSize+9,'#e2d0f0','center');this.text(String(km),this.ox-5,p.sy+2,'#e2d0f0','right');}}
    // A decorative port shoreline is rasterized into the chart's lower edge.
    const port=this.worldToScreen(...MISSAO.porto);c.fillStyle='#3a2440';c.beginPath();c.moveTo(this.ox,this.oy+this.chartSize);c.lineTo(this.ox+this.scale*8,this.oy+this.chartSize);c.lineTo(this.ox+this.scale*6,this.oy+this.chartSize-this.scale*8);c.lineTo(this.ox+this.scale*2,this.oy+this.chartSize-this.scale*18);c.lineTo(this.ox,this.oy+this.chartSize-this.scale*21);c.fill();c.fillStyle='#ffb34799';for(let i=0;i<9;i++)c.fillRect(this.ox+1+i%3*3,this.oy+this.chartSize-9-Math.floor(i/3)*4,3,2);
    // Known magnetic anomalies: contour rings, not revealed attack locations.
    c.strokeStyle='#b69cff30';c.lineWidth=.5;for(const a of MISSAO.campo.anomalias){const p=this.worldToScreen(a.x,a.y);for(const k of [1,1.45]){c.beginPath();c.arc(p.sx,p.sy,a.raio_km*this.scale*k,0,Math.PI*2);c.stroke();}}
    this.drawReef(t);this.drawBarriers(t);this.drawRocks();if(!replay)this.drawHeatmap(e);this.drawTarget(s,t);
    const inertial=this.worldToScreen(...s.inertialPosition);c.strokeStyle='#e9ddff99';c.lineWidth=.6;c.setLineDash([1,3]);c.beginPath();c.arc(inertial.sx,inertial.sy,s.inertialRadiusKm*this.scale,0,Math.PI*2);c.stroke();c.setLineDash([]);
    if(replay){this.line(s.realHistory,'#fff1de',2);this.line(s.inertialHistory,'#d7c8ff',.8,[1,3]);}else if(debug)this.line(s.realHistory,'#fff1de',1.6);
    this.line(s.gpsHistory,'#ffb347',1,[3,3]);
    const gps=this.worldToScreen(...s.gpsPosition);
    const recorded=s.turnsRecord||[],marked=recorded.filter(r=>r.markedSuspicious),hpd=e.getHPD95(),mismatch=!replay&&recorded.length&&!e.isGPSInsideHPD(...s.gpsPosition,hpd);
    for(const r of marked){const p=this.worldToScreen(...r.gpsReported);this.drawInterference(p.sx,p.sy,14,now);if(r===marked.at(-1)&&(!mismatch||Math.hypot(p.sx-gps.sx,p.sy-gps.sy)>20))this.mapLabel(t.suspectedSignal,p.sx+15,p.sy-9,'#ffc2b5');}
    if(mismatch){this.drawInterference(gps.sx,gps.sy,19,now);this.mapLabel(t.signalMismatch,gps.sx+21,gps.sy+3,'#ffc2b5');}
    this.drawGPS(gps.sx,gps.sy,mismatch,now);
    this.drawLighthouse(port.sx,port.sy,now);if(Math.hypot(this.displayWorld[0]-MISSAO.porto[0],this.displayWorld[1]-MISSAO.porto[1])>10)this.mapLabel(t.portLabel,port.sx+8,port.sy+12,'#f3e6f2','left',true);
    this.mapLabel('SPOOFED',shipAnchor.sx+29*shipScale+7,shipAnchor.sy+8,'#ffe6cc','left',compact);
    const ship=this.worldToScreen(...this.displayWorld);this.drawShip(ship.sx,ship.sy,s.currentHeading,now);this.drawQuantumFx(ship.sx,ship.sy,now);
    const b=this.worldToScreen(0,0);if(this.scale>=.7){c.strokeStyle='#e9d8c6';c.beginPath();c.moveTo(b.sx,b.sy+17);c.lineTo(b.sx+this.scale*10,b.sy+17);c.stroke();this.text('10 km',b.sx,b.sy+26,'#e9d8c6');}if(!compact)this.mapLabel(t.northLabel,this.ox+this.chartSize-3,this.oy+10,'#ffd166','right',true); // the compass already shows north on small charts
    this.mapLabels.forEach(label=>this.text(label.label,label.x,label.y,label.color));
    this.drawCompass(s.currentHeading);this.drawRadar(s,e,now);
  }
  drawBarriers(t){
    // Gate walls: coral reefs (hatched red) and sandbanks (pale sand with turquoise shallows).
    const c=this.ctx,tick=this.reduced?0:Math.floor((this.frameNow||0)/420);
    const shape=(poly)=>{const p=poly.map(q=>this.worldToScreen(...q));c.beginPath();p.forEach((q,i)=>i?c.lineTo(q.sx,q.sy):c.moveTo(q.sx,q.sy));c.closePath();return p;};
    const foam=(p,seed,colors)=>{for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],n=Math.max(2,Math.round(Math.hypot(b.sx-a.sx,b.sy-a.sy)/5));for(let k=0;k<n;k++){if(((k*7+i*3+seed+tick)%5)>1)continue;const f=(k+.5)/n;c.fillStyle=colors[k%2];c.fillRect(Math.round(a.sx+(b.sx-a.sx)*f),Math.round(a.sy+(b.sy-a.sy)*f),1,1);}}};
    (MISSAO.bancos||[]).forEach((poly,index)=>{
      shape(poly);c.strokeStyle='#5fc4c455';c.lineWidth=Math.max(3,this.scale*2.2);c.lineJoin='round';c.stroke();c.lineJoin='miter';
      const p=shape(poly);c.fillStyle='#c79a5e';c.fill();c.save();c.clip();
      const xs=p.map(q=>q.sx),ys=p.map(q=>q.sy),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
      for(let y=Math.floor(y0);y<y1;y+=2)for(let x=Math.floor(x0)+(y%4?1:0);x<x1;x+=4){c.fillStyle=(x*7+y*3)%11<4?'#e6c88f':'#a97c48';c.fillRect(x,y,1,.5);}
      c.restore();c.strokeStyle='#f3dcae';c.lineWidth=.7;shape(poly);c.stroke();foam(p,index*3,['#fff6ea','#d9f6f0']);
    });
    (MISSAO.barreiras||[]).forEach((poly,index)=>{
      const p=shape(poly);c.fillStyle='#7a2b3acc';c.fill();c.strokeStyle='#ff7b6b';c.lineWidth=1;c.stroke();c.save();c.clip();
      const xs=p.map(q=>q.sx),ys=p.map(q=>q.sy),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
      c.strokeStyle='#ff8f7a80';for(let x=x0-(y1-y0);x<x1;x+=4){c.beginPath();c.moveTo(x,y0);c.lineTo(x+(y1-y0),y1);c.stroke();}
      c.fillStyle='#c4766877';for(let x=Math.floor(x0)+1;x<x1;x+=2)for(let y=Math.floor(y0)+1;y<y1;y+=2)c.fillRect(x+.5,y+.5,1,.5);c.restore();
      foam(p,index*5+2,['#fff6ea','#ffd3c9']);
    });
  }
  drawReef(t){if(MISSAO.recife.length<3)return;const c=this.ctx,p=MISSAO.recife.map(p=>this.worldToScreen(...p));c.fillStyle='#7a2b3acc';c.strokeStyle='#ff7b6b';c.lineWidth=1;c.beginPath();p.forEach((q,i)=>i?c.lineTo(q.sx,q.sy):c.moveTo(q.sx,q.sy));c.closePath();c.fill();c.stroke();c.save();c.clip();c.strokeStyle='#ff8f7a80';for(let x=p[0].sx-30;x<p[1].sx+30;x+=4){c.beginPath();c.moveTo(x,p[0].sy+3);c.lineTo(x+20,p[2].sy-3);c.stroke();}c.fillStyle='#c4766877';for(let x=p[0].sx+1;x<p[1].sx;x+=2){for(let y=p[2].sy+1;y<p[0].sy;y+=2)c.fillRect(x+.5,y+.5,1,.5);}c.restore();
    // Foam breaking on the reef edge: a few white pixels that twinkle.
    const foamTick=this.reduced?0:Math.floor((this.frameNow||0)/400);for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];for(let k=0;k<6;k++){if(((k*7+i*3+foamTick)%5)>1)continue;const f=(k+.5)/6;c.fillStyle=k%2?'#fff6ea':'#ffd3c9';c.fillRect(Math.round(a.sx+(b.sx-a.sx)*f),Math.round(a.sy+(b.sy-a.sy)*f),1,1);}}
    this.labelBoxes.push({left:Math.min(...p.map(q=>q.sx))-2,right:Math.max(...p.map(q=>q.sx))+2,top:Math.min(...p.map(q=>q.sy))-2,bottom:Math.max(...p.map(q=>q.sy))+2});this.mapLabel(t.reefLabel,p[3].sx,p[3].sy-5,'#ffc2b5');}
  drawRocks(){
    // Pixel rocks: a shadow on the water, a dark body lit from the top right,
    // a few crisp highlights and white foam that breaks around the base.
    const c=this.ctx,tick=this.reduced?0:Math.floor((this.frameNow||0)/450);
    (MISSAO.pedras||[]).forEach((poly,index)=>{
      const p=poly.map(q=>this.worldToScreen(...q)),xs=p.map(q=>q.sx),ys=p.map(q=>q.sy);
      const cx=xs.reduce((a,b)=>a+b)/p.length,cy=ys.reduce((a,b)=>a+b)/p.length;
      const path=(dx=0,dy=0,k=1)=>{c.beginPath();p.forEach((q,i)=>{const x=cx+(q.sx-cx)*k+dx,y=cy+(q.sy-cy)*k+dy;i?c.lineTo(x,y):c.moveTo(x,y);});c.closePath();};
      c.fillStyle='#0b061999';path(-1,2);c.fill();
      c.fillStyle='#4a4166';path();c.fill();c.strokeStyle='#1a1230';c.lineWidth=1;c.stroke();
      c.fillStyle='#7a6f96';path(1,-1,.62);c.fill();
      c.fillStyle='#c2b8d8';path(1.5,-1.5,.28);c.fill();
      c.save();path();c.clip();
      // Small angular facets, mineral seams and reflected sunset light.
      for(let i=0;i<7;i++){const x=cx+(i%3-1)*1.2,y=cy+Math.floor(i/3)-1.5;c.fillStyle=['#9485b0','#635578','#e1cbde','#302c48'][i%4];c.fillRect(Math.round(x*2)/2,Math.round(y*2)/2,1,.5);}
      c.restore();c.fillStyle='#ffd16699';c.fillRect(Math.round(cx+1),Math.round(cy-2),.5,.5);
      for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];for(let k=0;k<3;k++){if(((k*5+i*3+index+tick)%4)>1)continue;const f=(k+.5)/3,ox=(a.sx+b.sx)/2-cx,oy=(a.sy+b.sy)/2-cy,n=Math.hypot(ox,oy)||1;
        c.fillStyle=k%2?'#fff6ea':'#d7e6ff';c.fillRect(Math.round(a.sx+(b.sx-a.sx)*f+ox/n*1.5),Math.round(a.sy+(b.sy-a.sy)*f+oy/n*1.5),1,1);}}
      this.labelBoxes.push({left:Math.min(...xs)-2,right:Math.max(...xs)+2,top:Math.min(...ys)-2,bottom:Math.max(...ys)+2});
    });
  }
  drawHeatmap(e){const c=this.ctx;let max=0;for(const p of e.grid)if(p>max)max=p;if(!max)return;
    // Four discrete lilac bands (16-bit style) instead of a smooth gradient.
    const steps=[[.75,'rgba(243,236,255,.72)'],[.5,'rgba(215,200,255,.6)'],[.28,'rgba(182,156,255,.46)'],[0,'rgba(125,95,214,.3)']];
    for(let i=0;i<e.grid.length;i++){const p=e.grid[i];if(p<max*.004)continue;const r=Math.sqrt(p/max),s=this.worldToScreen(i%e.size,Math.floor(i/e.size));c.fillStyle=steps.find(([limit])=>r>limit)[1];c.fillRect(Math.round(s.sx-this.scale/2),Math.round(s.sy-this.scale/2),Math.ceil(this.scale),Math.ceil(this.scale));}}
  drawTarget(s,t){const c=this.ctx,observed=s.turnsRecord?.at(-1)?.turn||0,now=this.frameNow||0;if(observed>=MISSAO.capsula.turno_revelacao){
      // Ghost Aurora: a spoofed beacon is shifted exactly as far as the GPS is lying.
      // Both markers look identical; only the quantum estimate tells them apart.
      const rec=s.turnsRecord?.at(-1),ghostOffset=(!MISSAO.mecanicas||MISSAO.mecanicas.includes('ghost'))&&!this.current?.isReplay&&rec?.gpsReported&&rec?.realAfter&&activeAttacks(rec.turn).length?[rec.gpsReported[0]-rec.realAfter[0],rec.gpsReported[1]-rec.realAfter[1]]:null;
      const real=MISSAO.capsula.pouso_real,ghost=ghostOffset&&Math.hypot(...ghostOffset)>=1.5?real.map((v,i)=>Math.max(1,Math.min(99,v+ghostOffset[i]))):null;
      const label=ghost?'AURORA-1 ?':'AURORA-1';
      // Draw in a stable order that does not reveal which one is real.
      const spots=ghost?[real,ghost].sort((a,b)=>a[0]-b[0]||a[1]-b[1]):[real];
      for(const spot of spots)this.drawCapsule(this.worldToScreen(...spot),now,label);
      this.ghostAurora=ghost;}
    else if(observed>=MISSAO.capsula.turno_blackout_inicio){const m=MISSAO.capsula.elipse_prevista,p=this.worldToScreen(...m.centro);c.setLineDash([3,2]);c.lineDashOffset=this.reduced?0:-Math.floor(now/120)%5;c.strokeStyle='#ffd166';c.beginPath();c.ellipse(p.sx,p.sy,m.semi_eixo_x*this.scale,m.semi_eixo_y*this.scale,0,0,Math.PI*2);c.stroke();c.setLineDash([]);c.lineDashOffset=0;this.mapLabel(t.landingLabel,p.sx,p.sy-m.semi_eixo_y*this.scale-5,'#ffe2b0','center',this.chartSize<180);}}
  drawCapsule(p,now,label){const c=this.ctx;
      // Capsule with an orange parachute and a pulsing rescue ring.
      c.fillStyle='#ff8a3d';c.fillRect(p.sx-4,p.sy-7,8,2);c.fillStyle='#fff1de';c.fillRect(p.sx-2,p.sy-7,2,2);c.fillRect(p.sx+2,p.sy-7,1,2);
      c.fillStyle='#e9d8c6';c.fillRect(p.sx-3,p.sy-5,1,3);c.fillRect(p.sx+2,p.sy-5,1,3);
      c.fillStyle='#fff1de';c.fillRect(p.sx-3,p.sy-2,6,4);c.fillStyle='#ff8a3d';c.fillRect(p.sx-3,p.sy,6,1);
      const pulse=this.reduced?0:(now%1600)/1600;c.strokeStyle='#ff8a3d';c.beginPath();c.arc(p.sx,p.sy,8,0,Math.PI*2);c.stroke();
      if(pulse){c.strokeStyle=`rgba(255,209,102,${(1-pulse)*.9})`;c.beginPath();c.arc(p.sx,p.sy,8+pulse*10,0,Math.PI*2);c.stroke();}
      this.labelBoxes.push({left:p.sx-9,right:p.sx+9,top:p.sy-9,bottom:p.sy+9});this.mapLabel(label,p.sx+12,p.sy+2,'#ffd166');}
  drawInterference(x,y,r,now){const c=this.ctx;const phase=this.reduced?0:(now%3000)/3000;c.fillStyle='#ff6b6b30';c.strokeStyle='#ff8f86aa';for(let k=0;k<4;k++){c.beginPath();c.arc(x,y,r*(.25+k*.25)+phase*2,0,Math.PI*2);k===3&&c.fill();c.stroke();}c.fillStyle='#ff6b6b';c.fillRect(x-2,y-2,4,4);c.strokeStyle='#ffb0a8';c.beginPath();c.moveTo(x-r-4,y);c.lineTo(x-r-1,y);c.moveTo(x+r+1,y);c.lineTo(x+r+4,y);c.stroke();}
  drawGPS(x,y,mismatch,now){
    // Amber GPS marker. When it disagrees with the quantum estimate it glitches:
    // magenta/cyan ghost copies jump around it, like a corrupted signal.
    const c=this.ctx;
    if(mismatch&&!this.reduced){const tick=Math.floor(now/90),j=(n)=>((tick*7919+n*104729)%7)-3;
      c.fillStyle='#ff3fa499';c.fillRect(Math.round(x-3+j(1)),Math.round(y-3+j(2)/2),6,6);
      c.fillStyle='#3ff6ff88';c.fillRect(Math.round(x-3+j(3)),Math.round(y-3+j(4)/2),6,6);
      if(tick%3===0){c.fillStyle='#ffb347';c.fillRect(Math.round(x-8+j(5)),Math.round(y+j(6)),16,1);}}
    c.strokeStyle='#ffd08a';c.lineWidth=1;c.strokeRect(x-3,y-3,6,6);c.fillStyle='#ffb347';c.fillRect(x-1,y-1,2,2);
    const blink=this.reduced||Math.floor(now/500)%2;if(blink){c.fillStyle='#fff1de';c.fillRect(x-4,y-5,1,1);c.fillRect(x+3,y-5,1,1);}
  }
  drawLighthouse(x,y,now){
    // Port lighthouse: a gold lamp with a beam that sweeps every couple of seconds.
    const c=this.ctx;c.fillStyle='#fff1de';c.fillRect(x-2,y-4,4,8);c.fillStyle='#ff6b6b';c.fillRect(x-2,y-1,4,2);c.fillStyle='#ffd166';c.fillRect(x-1,y-6,2,2);
    if(this.reduced)return;const a=(now%2400)/2400*Math.PI*2,len=26*Math.max(.6,this.scale/2);
    for(let r=4;r<len;r+=2)for(const off of[-.12,0,.12]){if((r+Math.round(off*10))%4===1)continue;c.fillStyle=r<len*.5?'#ffe9a8':'#ffd16699';c.fillRect(Math.round(x+Math.cos(a+off*(1+r/len))*r),Math.round(y-5+Math.sin(a+off*(1+r/len))*r),1,1);}
  }
  noteReadings(state){
    // Fires the sonar pulse once each time a new quantum reading is recorded.
    const count=(state.turnsRecord||[]).filter(r=>r.shots>0).length;
    if(this.readingCount!==undefined&&count>this.readingCount&&!this.reduced)this.burstStart=performance.now();
    this.readingCount=count;
  }
  drawQuantumFx(x,y,now){
    if(this.reduced||this.current?.isReplay)return;const c=this.ctx,scale=Math.min(1,Math.max(.42,this.scale/2))*(this.shipLayer?TacticalMapRenderer.SHIP_ZOOM:1);
    // Three lilac "qubits" orbit the ship: Quoora is always listening.
    for(let i=0;i<3;i++){const a=now/900+i*Math.PI*2/3,r=22*scale+Math.sin(now/400+i)*1.5;c.fillStyle=i===1?'#ffd166':'#d7c8ff';c.fillRect(Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r*.6),1,1);}
    // Sonar pulse + sparkles right after a reading.
    if(this.burstStart===undefined)return;const t=(now-this.burstStart)/1400;if(t<0||t>1)return;
    for(let k=0;k<3;k++){const u=t-k*.18;if(u<=0||u>=1)continue;const r=(8+u*46)*scale*1.4;c.fillStyle=`rgba(215,200,255,${(1-u)*.9})`;
      for(let d=0;d<48;d++){const a=d/48*Math.PI*2;if(d%2)continue;c.fillRect(Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r*.62),1,1);}}
    for(let i=0;i<14;i++){const a=i/14*Math.PI*2+t*1.4,r=(10+t*30)*scale*1.2,tw=(i+Math.floor(now/80))%3;if(tw===0)continue;c.fillStyle=i%3===0?'#ffd166':'#e9e0ff';c.fillRect(Math.round(x+Math.cos(a)*r),Math.round(y+Math.sin(a)*r*.62-t*6),tw,1);if(tw===2)c.fillRect(Math.round(x+Math.cos(a)*r)+0,Math.round(y+Math.sin(a)*r*.62-t*6)-1,1,3);}
  }
  drawShip(x,y,heading,now){
    const c=this.ctx,snap=this.reduced||this.current?.isReplay;
    this.visualHeading=PixelShipAtlas.approachHeading(this.visualHeading,this.headingTarget??heading,now-(this.headingTick??now),snap);
    this.headingTick=now;
    const bearing=this.visualHeading*Math.PI/180,fx=Math.sin(bearing),fy=-Math.cos(bearing),rx=Math.cos(bearing),ry=Math.sin(bearing);
    // Cache distinct views instead of rotating a flat sprite (which tilted the mast).
    const scale=Math.min(1,Math.max(.42,this.scale/2))*(this.shipLayer?TacticalMapRenderer.SHIP_ZOOM:1),phase=this.reduced?0:now/320;
    c.fillStyle='#ffe9d655';
    for(let i=0;i<14;i++){
      const back=29+i*2.1,spread=4+Math.sin(i*.6+phase)*1.5+i*.22;
      for(const side of[-1,1])c.fillRect(Math.round(x+(-fx*back+rx*spread*side)*scale),Math.round(y+(-fy*back+ry*spread*side)*scale*.78),Math.max(1,Math.round(3*scale)),1);
    }
    // Foam particles shed from the stern, drifting outward and fading.
    if(!snap){this.foam=this.foam||[];if(!this.lastFoam||now-this.lastFoam>70){this.lastFoam=now;for(const side of[-1,1])this.foam.push({x:x-fx*27*scale+rx*3*side*scale,y:y-fy*27*scale*.78+ry*3*side*scale*.78,vx:(-fx*.5+rx*side*.35),vy:(-fy*.5+ry*side*.35)*.78,born:now});}
      this.foam=this.foam.filter(p=>now-p.born<1100);for(const p of this.foam){const age=(now-p.born)/1100,d=age*14;c.fillStyle=age<.35?'#fff6ea':age<.7?'#ffe9d6':'#cfd8ff';c.globalAlpha=1-age;c.fillRect(Math.round(p.x+p.vx*d),Math.round(p.y+p.vy*d),age<.5?2:1,1);}c.globalAlpha=1;}
    const index=PixelShipAtlas.frameIndex(this.visualHeading);
    if(this.hiAtlas&&this.shipCtx){const frame=this.hiAtlas.frames[index],k=this.hiAtlas.k;this.drawWake(x*2,y*2,k,fx,fy,rx,ry,now);this.shipCtx.drawImage(frame,Math.round(x*2-44*k),Math.round(y*2-48*k));return;}
    const frame=this.shipAtlas.frames[index],size=Math.round(88*scale);
    c.drawImage(frame,Math.round(x-size/2),Math.round(y-48*size/88),size,size);
  }
  drawWake(X,Y,k,fx,fy,rx,ry,now){
    // White pixel waves of a moving ship (full resolution, drawn under the sprite):
    // a V-shaped Kelvin wake with crests travelling backwards, churned foam behind
    // the stern and a bow wave peeling off both sides of the hull.
    const c=this.shipCtx,still=this.reduced||this.current?.isReplay,phase=still?0:now/110;
    const px=Math.max(2,Math.round(k)),P=(u,v)=>[Math.round(X+(u*fx+v*rx)*k),Math.round(Y+(u*fy+v*ry)*.78*k)];
    const blob=(u,v,size,alpha,color)=>{const[x,y]=P(u,v);c.globalAlpha=alpha;c.fillStyle=color;c.fillRect(x-(size>>1),y-(size>>1),size,size);};
    const L=58;
    // Kelvin arms: dashed white crests that slide away from the stern.
    for(const side of[-1,1])for(let t=0;t<L;t+=.55){
      const fade=Math.pow(1-t/L,1.3),cycle=(t+phase)%8;if(cycle>4.5)continue;
      const bright=cycle<2.2;blob(-24-t,side*(5.5+t*.38),bright?px+1:px,fade*(bright?.95:.6),bright?'#ffffff':'#cfe4ff');
      // Little feathers: short transverse crests leaning inward from each arm.
      if(cycle<.6&&t>4){for(let f=0;f<5;f++)blob(-24-t+f*.45,side*(5.5+t*.38-f*1.1),px,fade*.55,'#e9f3ff');}
    }
    // Churned foam right behind the stern, widening and dissolving.
    for(let t=0;t<L*.55;t+=.5){
      const fade=Math.pow(1-t/(L*.55),1.5),w=2.2+t*.12;
      for(const o of[-1,0,1]){const n=Math.sin(t*1.9+phase*.8+o*2.1)*w*.6+o*w*.55;if(((t*7+o*3+Math.floor(phase))%5)<2)continue;
        blob(-25-t,n,o===0&&t<8?px+1:px,fade*.8,t<6?'#ffffff':'#e9f3ff');}
    }
    // Bow wave: two white lines curling off the bow along the hull.
    const halfWidth=u=>u>22?(30-u)*5/8:u>9?5+(22-u)*3/13:8; // hull outline, so the wave hugs it from outside
    for(const side of[-1,1])for(let i=0;i<16;i++){
      const u=31-i*1.2,v=side*(halfWidth(u)+1.4+i*.28+Math.sin(i*.8+phase*.9)*.35),fade=1-i/16;
      blob(u,v,i<5?px+1:px,.95*fade,'#ffffff');
      if(i%3===0)blob(u-.6,v+side*1.2,px,.5*fade,'#cfe4ff');
    }
    c.globalAlpha=1;
  }
  drawCompass(heading){const cv=document.getElementById('compass-canvas');if(!cv)return;const c=cv.getContext('2d');c.clearRect(0,0,120,120);c.imageSmoothingEnabled=false;c.fillStyle='#0b061966';c.beginPath();c.arc(62,63,56,0,Math.PI*2);c.fill();c.fillStyle='#160f2ef0';c.strokeStyle='#2a2f3a';c.lineWidth=9;c.beginPath();c.arc(60,60,52,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle='#c3cad6';c.lineWidth=5;c.stroke();c.strokeStyle='#eef2f7';c.lineWidth=1;c.beginPath();c.arc(60,60,54,Math.PI*1.05,Math.PI*1.55);c.stroke();c.strokeStyle='#4a3a6a';c.lineWidth=1;c.beginPath();c.arc(60,60,45,0,Math.PI*2);c.stroke();c.fillStyle='#ffd166';for(let i=0;i<8;i++){const a=i*Math.PI/4;c.fillRect(Math.round(60+Math.cos(a)*48)-1,Math.round(60+Math.sin(a)*48)-1,2,2);}c.fillStyle='#fff1de';c.font='bold 14px monospace';c.textAlign='center';c.fillText('N',60,28);c.fillText('S',60,103);c.fillText(window.gameApp?.currentLang==='en'?'W':'O',22,65);c.fillText('E',98,65);c.save();c.translate(60,60);c.rotate(heading*Math.PI/180);c.fillStyle='#ff6b6b';c.beginPath();c.moveTo(0,-30);c.lineTo(-4,0);c.lineTo(4,0);c.fill();c.fillStyle='#b69cff';c.beginPath();c.moveTo(0,29);c.lineTo(-4,0);c.lineTo(4,0);c.fill();c.restore();c.fillStyle='#ffd166';c.fillRect(57,57,6,6);}
  drawRadar(s,e,now){const cv=document.getElementById('radar-canvas');if(!cv)return;const c=cv.getContext('2d');c.clearRect(0,0,132,112);c.fillStyle='#1f1408';c.strokeStyle='#8a5a1f';c.lineWidth=1;c.beginPath();c.arc(66,55,49,0,Math.PI*2);c.fill();c.stroke();for(const r of [16,32]){c.beginPath();c.arc(66,55,r,0,Math.PI*2);c.stroke();}c.strokeStyle='#8a5a1f99';c.beginPath();c.moveTo(17,55);c.lineTo(115,55);c.moveTo(66,6);c.lineTo(66,104);c.stroke();const angle=this.reduced?-Math.PI/3:now/1900;c.fillStyle='#ffb34730';c.beginPath();c.moveTo(66,55);c.arc(66,55,48,angle-.7,angle);c.closePath();c.fill();c.strokeStyle='#ffd08a';c.beginPath();c.moveTo(66,55);c.lineTo(66+48*Math.cos(angle),55+48*Math.sin(angle));c.stroke();const p=this.current.isReplay?s.realPosition:e.getMAP(),dx=(s.gpsPosition[0]-p[0])*5,dy=(s.gpsPosition[1]-p[1])*5;c.fillStyle='#d7c8ff';c.fillRect(64,53,4,4);c.fillStyle='#ffb347';c.fillRect(65+Math.max(-44,Math.min(44,dx)),54-Math.max(-44,Math.min(44,dy)),3,3);}
}

// Original 5 × 7 bitmap lettering: embedded, network-free, crisp at integer scales.
function drawTitle(){
 const letters={G:['01111','10000','10000','10111','10001','10001','01110'],H:['10001','10001','10001','11111','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],R:['11110','10001','10001','11110','10100','10010','10001'],U:['10001','10001','10001','10001','10001','10001','01110'],E:['11111','10000','10000','11110','10000','10000','11111']};
 const cv=document.getElementById('title-canvas'),c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);const pixels=[];let x=10;for(const ch of 'GHOST ROUTE'){if(ch===' '){x+=14;continue;}letters[ch].forEach((row,y)=>{[...row].forEach((v,col)=>{if(v==='1')pixels.push([x+col*5,8+y*5,y]);});});x+=31;}
 for(const[a,b]of pixels){c.fillStyle='#0d0820';c.fillRect(a-4,b-4,13,14);c.fillStyle='#e0651f';c.fillRect(a-2,b-2,9,11);}for(const[a,b,y]of pixels){c.fillStyle=y<3?'#fff1de':y<5?'#ffd166':'#ff8a3d';c.fillRect(a,b,5,5);c.fillStyle='#2a0f3a';c.fillRect(a,b+5,5,2);}
}



