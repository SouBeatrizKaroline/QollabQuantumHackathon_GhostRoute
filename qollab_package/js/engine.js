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
/* Full-viewport 16-bit chart. Coordinates remain in kilometers, north up.
   Only the posterior estimate is drawn as the ship during normal play. */
class TacticalMapRenderer {
  constructor(canvasId){
    this.canvas=document.getElementById(canvasId);this.ctx=this.canvas.getContext('2d');this.padding=32;this.worldMax=100;this.current=null;this.displayWorld=null;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.lastFrame=0;
    this.sprite=this.makeShip();this.ocean=document.createElement('canvas');this.resize();
    window.addEventListener('resize',()=>{this.resize();if(this.current)this.drawScene(performance.now());});
    this.loop=(now)=>{if(this.current&&now-this.lastFrame>48){this.lastFrame=now;this.drawScene(now);}requestAnimationFrame(this.loop);};requestAnimationFrame(this.loop);
  }
  resize(){
    const r=this.canvas.getBoundingClientRect();this.canvas.width=Math.max(180,Math.round(r.width/2));this.canvas.height=Math.max(270,Math.round(r.height/2));this.ctx.imageSmoothingEnabled=false;
    const w=this.canvas.width,h=this.canvas.height;const mobile=r.width<850;const top=mobile?Math.min(r.width<520?127:108,h*.45):64; const dock=document.querySelector(".navigation-dock")?.getBoundingClientRect();const bottom=dock?dock.top/2-12:h-92;this.scale=Math.max(.45,Math.min((w-(mobile?52:64))/100,(bottom-top)/100));this.chartSize=100*this.scale;this.ox=(w-this.chartSize)/2+(mobile?20:0);this.oy=top;this.makeOcean();
  }
  worldToScreen(x,y){return{sx:this.ox+x*this.scale,sy:this.oy+(100-y)*this.scale};}
  screenToWorld(x,y){return[(x-this.ox)/this.scale,100-(y-this.oy)/this.scale];}
  makeOcean(){
    const c=this.ocean;c.width=this.canvas.width;c.height=this.canvas.height;const g=c.getContext('2d');
    const gradient=g.createLinearGradient(0,0,c.width,c.height);gradient.addColorStop(0,'#0c4266');gradient.addColorStop(.45,'#093657');gradient.addColorStop(1,'#08264c');g.fillStyle=gradient;g.fillRect(0,0,c.width,c.height);
    const rng=mulberry32(837211);for(let i=0;i<c.width*c.height/150;i++){const x=Math.floor(rng()*c.width),y=Math.floor(rng()*c.height);g.fillStyle=['#174b6c','#1b5273','#28627b','#0b2b4c'][Math.floor(rng()*4)];g.fillRect(x,y,Math.ceil(rng()*5)+2,1);if(rng()>.6){g.fillRect(x+2,y-1,2,1);g.fillRect(x+4,y+1,2,1);}}
    for(let y=0;y<c.height;y+=3){g.fillStyle='#04193420';g.fillRect(0,y,c.width,1);}
  }
  makeShip(){
    const s=document.createElement('canvas');s.width=66;s.height=28;const g=s.getContext('2d');g.imageSmoothingEnabled=false;
    // Pixel rows form a gray cutter, bridge, radar mast and cyan bow lamp.
    for(let y=7;y<23;y++){const edge=Math.abs(y-15);const start=edge>6?10:5;const end=62-Math.max(0,edge-1)*2;g.fillStyle='#05101a';g.fillRect(start,y,end-start,1);g.fillStyle=y<15?'#b6c8bd':'#506e70';g.fillRect(start+2,y,end-start-5,1);}
    g.fillStyle='#172c35';g.fillRect(10,10,40,11);g.fillStyle='#7e9691';g.fillRect(10,11,40,8);g.fillStyle='#bed2bf';g.fillRect(13,11,35,2);g.fillStyle='#536d6b';g.fillRect(12,16,36,3);
    g.fillStyle='#1f363e';g.fillRect(29,5,16,13);g.fillStyle='#d7d8bc';g.fillRect(31,6,12,9);g.fillStyle='#667f7d';g.fillRect(32,7,10,6);g.fillStyle='#9feafa';g.fillRect(34,8,3,3);g.fillRect(39,8,3,3);
    g.fillStyle='#172b35';g.fillRect(24,7,4,10);g.fillStyle='#9ab3a8';g.fillRect(25,8,2,7);g.fillStyle='#1b303b';g.fillRect(36,0,2,7);g.fillStyle='#c2d6c5';g.fillRect(31,2,12,2);g.fillStyle='#d9ead4';g.fillRect(37,0,1,3);
    g.fillStyle='#253d43';g.fillRect(14,12,7,5);g.fillStyle='#c7d1b2';g.fillRect(15,12,5,2);g.fillStyle='#75e5fc';g.fillRect(56,14,3,2);g.fillStyle='#dae6c6';g.fillRect(46,11,2,8);g.fillStyle='#304b52';g.fillRect(8,13,2,5);
    g.fillStyle='#224a64';g.fillRect(10,23,42,2);g.fillStyle='#80b6c0';g.fillRect(14,23,32,1);return s;
  }
  render(state,estimator,isReplay=false,debug=false){
    this.current={state,estimator,isReplay,debug};const target=(debug||isReplay)?state.realPosition:estimator.getMAP();
    if(!this.target||Math.hypot(this.target[0]-target[0],this.target[1]-target[1])>.01){this.animFrom=this.displayWorld?[...this.displayWorld]:[...target];this.target=[...target];this.animStart=performance.now();}
    if(this.reduced||isReplay)this.displayWorld=[...target];this.drawScene(performance.now());
  }
  text(label,x,y,color='#cee7df',align='left'){const c=this.ctx;c.font='bold 7px monospace';c.textAlign=align;c.fillStyle='#041024';c.fillText(label,x+1,y+1);c.fillStyle=color;c.fillText(label,x,y);c.textAlign='left';}
  line(points,color,width,dash=[]){if(!points?.length)return;const c=this.ctx;c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.beginPath();points.forEach((p,i)=>{const s=this.worldToScreen(...p);i?c.lineTo(s.sx,s.sy):c.moveTo(s.sx,s.sy);});c.stroke();c.setLineDash([]);}
  drawScene(now){
    const{state:s,estimator:e,isReplay:replay,debug}=this.current;const c=this.ctx,w=this.canvas.width,h=this.canvas.height;const t=TEXTOS[window.gameApp?.currentLang||'pt-BR'];c.imageSmoothingEnabled=false;c.drawImage(this.ocean,0,0);
    const u=this.reduced||replay?1:Math.min(1,(now-this.animStart)/650);const f=u*u*(3-2*u);this.displayWorld=this.target.map((v,i)=>this.animFrom[i]+(v-this.animFrom[i])*f);
    // Grid and a low-key map boundary; the ocean itself fills the viewport.
    c.strokeStyle='#5189a031';c.lineWidth=.5;for(let km=0;km<=100;km+=10){const p=this.worldToScreen(km,km);c.beginPath();c.moveTo(p.sx,this.oy);c.lineTo(p.sx,this.oy+this.chartSize);c.moveTo(this.ox,p.sy);c.lineTo(this.ox+this.chartSize,p.sy);c.stroke();if(km%20===0){this.text(String(km),p.sx,this.oy+this.chartSize+9,'#9fc4cd','center');this.text(String(km),this.ox-5,p.sy+2,'#9fc4cd','right');}}
    // A decorative port shoreline is rasterized into the chart's lower edge.
    const port=this.worldToScreen(...MISSAO.porto);c.fillStyle='#203e41';c.beginPath();c.moveTo(this.ox,this.oy+this.chartSize);c.lineTo(this.ox+this.scale*8,this.oy+this.chartSize);c.lineTo(this.ox+this.scale*6,this.oy+this.chartSize-this.scale*8);c.lineTo(this.ox+this.scale*2,this.oy+this.chartSize-this.scale*18);c.lineTo(this.ox,this.oy+this.chartSize-this.scale*21);c.fill();c.fillStyle='#487367';for(let i=0;i<9;i++)c.fillRect(this.ox+1+i%3*3,this.oy+this.chartSize-9-Math.floor(i/3)*4,3,2);
    // Known magnetic anomalies: contour rings, not revealed attack locations.
    c.strokeStyle='#3c719334';c.lineWidth=.5;for(const a of MISSAO.campo.anomalias){const p=this.worldToScreen(a.x,a.y);for(const k of [1,1.45]){c.beginPath();c.arc(p.sx,p.sy,a.raio_km*this.scale*k,0,Math.PI*2);c.stroke();}}
    this.drawReef(t);if(!replay)this.drawHeatmap(e);this.drawTarget(s,t);
    const inertial=this.worldToScreen(...s.inertialPosition);c.strokeStyle='#97d3f280';c.lineWidth=.6;c.setLineDash([1,3]);c.beginPath();c.arc(inertial.sx,inertial.sy,s.inertialRadiusKm*this.scale,0,Math.PI*2);c.stroke();c.setLineDash([]);
    if(replay){this.line(s.realHistory,'#a7f2ce',2);this.line(s.inertialHistory,'#b1c8ff',.8,[1,3]);}else if(debug)this.line(s.realHistory,'#a7f2ce',1.6);
    this.line(s.gpsHistory,'#e6bc72',1,[3,3]);
    const gps=this.worldToScreen(...s.gpsPosition);c.strokeStyle='#ead59c';c.lineWidth=1;c.strokeRect(gps.sx-3,gps.sy-3,6,6);c.fillStyle='#f3db91';c.fillRect(gps.sx-1,gps.sy-1,2,2);
    const recorded=s.turnsRecord||[];for(const r of recorded.filter(r=>r.markedSuspicious)){const p=this.worldToScreen(...r.gpsReported);this.drawInterference(p.sx,p.sy,14,now);this.text(t.suspectedSignal,p.sx+15,p.sy-9,'#ffc0b6');}
    const hpd=e.getHPD95();if(!replay&&recorded.length&&!e.isGPSInsideHPD(...s.gpsPosition,hpd)){this.drawInterference(gps.sx,gps.sy,19,now);this.text(t.signalMismatch,gps.sx+21,gps.sy+3,'#ffc0b6');}
    c.fillStyle='#7bcaca';c.fillRect(port.sx-4,port.sy-4,8,8);c.fillStyle='#0a2334';c.fillRect(port.sx-2,port.sy-2,4,4);this.text(t.portLabel,port.sx+8,port.sy+12);
    const ship=this.worldToScreen(...this.displayWorld);this.drawShip(ship.sx,ship.sy,s.currentHeading,now);this.text('SPOOFED',ship.sx,ship.sy+20,'#e6f5de','center');
    const b=this.worldToScreen(0,0);c.strokeStyle='#bed5ce';c.beginPath();c.moveTo(b.sx,b.sy+17);c.lineTo(b.sx+this.scale*10,b.sy+17);c.stroke();this.text('10 km',b.sx,b.sy+26,'#b7d6d6');this.text(t.northLabel,this.ox+this.chartSize-2,this.oy-8,'#b4d4dc','right');
    this.drawCompass(s.currentHeading);this.drawRadar(s,e,now);
  }
  drawReef(t){const c=this.ctx,p=MISSAO.recife.map(p=>this.worldToScreen(...p));c.fillStyle='#5a334d99';c.strokeStyle='#f18c97';c.lineWidth=1;c.beginPath();p.forEach((q,i)=>i?c.lineTo(q.sx,q.sy):c.moveTo(q.sx,q.sy));c.closePath();c.fill();c.stroke();c.save();c.clip();c.strokeStyle='#ed829680';for(let x=p[0].sx-30;x<p[1].sx+30;x+=4){c.beginPath();c.moveTo(x,p[0].sy+3);c.lineTo(x+20,p[2].sy-3);c.stroke();}c.restore();this.text(t.reefLabel,p[3].sx,p[3].sy-5,'#ffb6b9');}
  drawHeatmap(e){const c=this.ctx;let max=0;for(const p of e.grid)if(p>max)max=p;if(!max)return;for(let i=0;i<e.grid.length;i++){const p=e.grid[i];if(p<max*.004)continue;const s=this.worldToScreen(i%100,Math.floor(i/100));c.fillStyle=`rgba(95,211,247,${.12+.5*Math.sqrt(p/max)})`;c.fillRect(Math.round(s.sx-this.scale/2),Math.round(s.sy-this.scale/2),Math.ceil(this.scale),Math.ceil(this.scale));}}
  drawTarget(s,t){const c=this.ctx,observed=s.turnsRecord?.at(-1)?.turn||0;if(observed>=8){const p=this.worldToScreen(...MISSAO.capsula.pouso_real);c.strokeStyle='#afefdb';c.fillStyle='#cefbdc';c.fillRect(p.sx-3,p.sy-2,6,4);c.beginPath();c.arc(p.sx,p.sy,8,0,Math.PI*2);c.stroke();this.text('AURORA-1',p.sx+12,p.sy+2,'#cefbdc');}else if(observed>=2){const m=MISSAO.capsula.elipse_prevista,p=this.worldToScreen(...m.centro);c.setLineDash([3,2]);c.strokeStyle='#ecd09c';c.beginPath();c.ellipse(p.sx,p.sy,m.semi_eixo_x*this.scale,m.semi_eixo_y*this.scale,0,0,Math.PI*2);c.stroke();c.setLineDash([]);this.text(t.landingLabel,p.sx,p.sy-m.semi_eixo_y*this.scale-5,'#f1d1a0','center');}}
  drawInterference(x,y,r,now){const c=this.ctx;const phase=this.reduced?0:(now%3000)/3000;c.fillStyle='#c92d5930';c.strokeStyle='#eb5c7d99';for(let k=0;k<4;k++){c.beginPath();c.arc(x,y,r*(.25+k*.25)+phase*2,0,Math.PI*2);k===3&&c.fill();c.stroke();}c.fillStyle='#ff667b';c.fillRect(x-2,y-2,4,4);c.strokeStyle='#ffa0a6';c.beginPath();c.moveTo(x-r-4,y);c.lineTo(x-r-1,y);c.moveTo(x+r+1,y);c.lineTo(x+r+4,y);c.stroke();}
  drawShip(x,y,heading,now){const c=this.ctx;c.save();c.translate(Math.round(x),Math.round(y));c.rotate((heading-90)*Math.PI/180);const spriteScale=Math.min(1,Math.max(.45,this.scale/2));c.scale(spriteScale,spriteScale);c.fillStyle='#9adbe14d';for(let i=0;i<12;i++){c.fillRect(-35-i*2,Math.round(Math.sin(i*.7+(this.reduced?0:now/450))*2)+(i%2?5:-5),3,1);}c.fillStyle='#43bbe91a';c.beginPath();c.moveTo(27,-2);c.lineTo(64,-18);c.lineTo(74,-5);c.lineTo(74,5);c.lineTo(64,18);c.lineTo(27,2);c.fill();c.drawImage(this.sprite,-33,-14);c.restore();}
  drawCompass(heading){const cv=document.getElementById('compass-canvas');if(!cv)return;const c=cv.getContext('2d');c.clearRect(0,0,120,120);c.imageSmoothingEnabled=false;c.fillStyle='#04152a';c.strokeStyle='#87a8b8';c.lineWidth=3;c.beginPath();c.arc(60,60,51,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle='#3b6075';c.lineWidth=1;c.beginPath();c.arc(60,60,45,0,Math.PI*2);c.stroke();c.fillStyle='#e6ece3';c.font='bold 14px monospace';c.textAlign='center';c.fillText('N',60,28);c.fillText('S',60,103);c.fillText(window.gameApp?.currentLang==='en'?'W':'O',22,65);c.fillText('E',98,65);c.save();c.translate(60,60);c.rotate(heading*Math.PI/180);c.fillStyle='#ff8791';c.beginPath();c.moveTo(0,-30);c.lineTo(-4,0);c.lineTo(4,0);c.fill();c.fillStyle='#8de3fd';c.beginPath();c.moveTo(0,29);c.lineTo(-4,0);c.lineTo(4,0);c.fill();c.restore();c.fillStyle='#d1eadb';c.fillRect(57,57,6,6);}
  drawRadar(s,e,now){const cv=document.getElementById('radar-canvas');if(!cv)return;const c=cv.getContext('2d');c.clearRect(0,0,132,112);c.fillStyle='#031d20';c.strokeStyle='#3c8b6e';c.lineWidth=1;c.beginPath();c.arc(66,55,49,0,Math.PI*2);c.fill();c.stroke();for(const r of [16,32]){c.beginPath();c.arc(66,55,r,0,Math.PI*2);c.stroke();}c.strokeStyle='#3c8b6e99';c.beginPath();c.moveTo(17,55);c.lineTo(115,55);c.moveTo(66,6);c.lineTo(66,104);c.stroke();const angle=this.reduced?-Math.PI/3:now/1900;c.fillStyle='#62f8a527';c.beginPath();c.moveTo(66,55);c.arc(66,55,48,angle-.7,angle);c.closePath();c.fill();c.strokeStyle='#a6f9b4';c.beginPath();c.moveTo(66,55);c.lineTo(66+48*Math.cos(angle),55+48*Math.sin(angle));c.stroke();const p=this.current.isReplay?s.realPosition:e.getMAP(),dx=(s.gpsPosition[0]-p[0])*5,dy=(s.gpsPosition[1]-p[1])*5;c.fillStyle='#bbefc9';c.fillRect(64,53,4,4);c.fillStyle='#ffc79a';c.fillRect(65+Math.max(-44,Math.min(44,dx)),54-Math.max(-44,Math.min(44,dy)),3,3);}
}

// Original 5 × 7 bitmap lettering: embedded, network-free, crisp at integer scales.
function drawTitle(){
 const letters={G:['01111','10000','10000','10111','10001','10001','01110'],H:['10001','10001','10001','11111','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],R:['11110','10001','10001','11110','10100','10010','10001'],U:['10001','10001','10001','10001','10001','10001','01110'],E:['11111','10000','10000','11110','10000','10000','11111']};
 const cv=document.getElementById('title-canvas'),c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);const pixels=[];let x=10;for(const ch of 'GHOST ROUTE'){if(ch===' '){x+=14;continue;}letters[ch].forEach((row,y)=>{[...row].forEach((v,col)=>{if(v==='1')pixels.push([x+col*5,8+y*5,y]);});});x+=31;}
 for(const[a,b]of pixels){c.fillStyle='#000719';c.fillRect(a-4,b-4,13,14);c.fillStyle='#568cad';c.fillRect(a-2,b-2,9,11);}for(const[a,b,y]of pixels){c.fillStyle=y<3?'#e5faff':y<5?'#a7deed':'#6aaabf';c.fillRect(a,b,5,5);c.fillStyle='#122944';c.fillRect(a,b+5,5,2);}
}




