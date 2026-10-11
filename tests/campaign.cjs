/* Mission feasibility and gradual difficulty over all 100 generated levels. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const engine=fs.readFileSync(path.join(__dirname,'../public/assets/js/engine.js'),'utf8');
const context=vm.createContext({Math,console,Float32Array});
vm.runInContext(engine.slice(0,engine.indexOf('/* =========================================================================='+'\n   RENDER'))+'\nthis.API={MISSAO,createCampaignMission,useCampaignMission,checkReefCollision,hitsObstacle,distToObstacles,activeAttacks,mulberry32,gaussianRandom,headingToVector};',context);
const a=context.API,missions=Array.from({length:100},(_,i)=>a.createCampaignMission(i));
assert.equal(new Set(missions.map(m=>JSON.stringify(m))).size,100);
for(const bad of[-1,100,1.5,NaN,'0'])assert.throws(()=>a.createCampaignMission(bad));
for(let level=0;level<100;level++){
  const m=missions[level],previous=missions[level-1];
  assert.equal(m.nivel,level);assert.ok(m.turnos>=4&&m.turnos<=12);
  assert.ok(m.sensor.shots_total>=m.turnos*250,'Each mission supports a modest measurement every turn');
  assert.ok(m.capsula.pouso_real.every(v=>v>0&&v<100));
  assert.ok(m.capsula.turno_revelacao<=m.turnos);
  assert.ok(m.ataques.every(at=>at.inicio>=1&&at.inicio<=at.fim&&at.fim<=m.turnos));
  if(previous){
    assert.ok(m.sensor.shots_total<=previous.sensor.shots_total,'Budget never increases');
    assert.ok(m.vitoria.raio_resgate_km<=previous.vitoria.raio_resgate_km,'Precision increases');
    assert.ok(m.navio.ruido_corrente_km>=previous.navio.ruido_corrente_km,'Current uncertainty increases');
    assert.ok(m.turnos>=previous.turnos,'Mission length increases');
  }
  // From level 1 gates (reef walls and sandbanks with one opening) bend the route.
  const obstacles=[m.recife,...m.pedras,...m.barreiras,...m.bancos].filter(poly=>poly.length);
  if(level>0){
    if(level>=85)assert.ok(Math.hypot(m.capsula.pouso_real[0]-m.porto[0],m.capsula.pouso_real[1]-m.porto[1])>=90,'Later rescues lie across the chart');
    assert.equal(m.barreiras.length+m.bancos.length,m.passagens.length*2,'Every gate has two walls');
    if(level<5){assert.equal(obstacles.length,0);assert.equal(m.ataques.length,0);assert.equal(m.navio.ruido_corrente_km,0);assert.equal(m.mecanicas.length,3,'First missions only practice tutorial skills');}
    // Consecutive openings alternate sides of the direct line, forcing a zigzag.
    const d=[m.capsula.pouso_real[0]-m.porto[0],m.capsula.pouso_real[1]-m.porto[1]],side=p=>Math.sign((p[0]-m.porto[0])*d[1]-(p[1]-m.porto[1])*d[0]);
    for(let i=1;i<m.passagens.length;i++)assert.notEqual(side(m.passagens[i]),side(m.passagens[i-1]),'Openings alternate');
  } else assert.equal(m.pedras.length+m.passagens.length,0,'The tutorial has no rocks or gates');
  for(const poly of obstacles){
    assert.ok(poly.length>=3&&poly.every(p=>p.every(v=>v>0&&v<100)));
    for(const point of[m.porto,m.capsula.pouso_real])assert.ok(obstacles.every(o=>!a.checkReefCollision(point,point,o)),'Port and capsule are open water');
  }
  // Rocks never touch each other or the reef, so every gap between them is real water.
  for(let i=0;i<obstacles.length;i++)for(let j=i+1;j<obstacles.length;j++)for(const p of obstacles[i])assert.ok(!a.checkReefCollision(p,p,obstacles[j]));
}
assert.equal(missions[0].ataques.length,0);assert.equal(missions[0].navio.ruido_corrente_km,0);
assert.equal(missions[34].ataques.length,0);assert.equal(missions[35].ataques.length,1);assert.equal(missions[75].ataques.length,2);assert.equal(missions[99].ataques.length,3);
a.useCampaignMission(99);assert.equal(a.MISSAO.nivel,99);assert.equal(a.activeAttacks(8).length,2);
a.useCampaignMission(0);assert.equal(a.MISSAO.nivel,0);assert.equal(a.activeAttacks(3).length,0);
assert.equal(missions[99].sensor.shots_total,3000,'Switching missions must not mutate saved configs');
console.log('PASS 100 unique missions with alternating gates, growing obstacle fields, gradual difficulty, tutorial safety, attack stages and configuration isolation');

// A bounded geometric search checks fixed-length moves, integer headings and
// each level's actual deterministic current stream. It is a test oracle only;
// routes and hidden coordinates are never added to the player interface.
for(let level=0;level<100;level++){
 const m=missions[level],rng=a.mulberry32(20261011+level*7919),target=m.capsula.pouso_real,speed=m.navio.velocidade_km_turno;
 const currents=Array.from({length:m.turnos},()=>[a.gaussianRandom(rng)*m.navio.ruido_corrente_km,a.gaussianRandom(rng)*m.navio.ruido_corrente_km]);
 const vectors=Array.from({length:360},(_,heading)=>[Math.sin(heading*Math.PI/180)*speed,Math.cos(heading*Math.PI/180)*speed]);
 const move=(position,heading,turn)=>position.map((coordinate,index)=>Math.max(0,Math.min(100,coordinate+vectors[heading][index]+currents[turn][index])));
 const boxes=[m.recife,...m.pedras,...m.barreiras,...m.bancos].filter(poly=>poly.length).map(poly=>{const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);return{poly,bounds:[Math.min(...xs),Math.max(...xs),Math.min(...ys),Math.max(...ys)]};});
 const collision=(from,to)=>boxes.some(({poly,bounds})=>{
  // Disjoint segment/polygon bounds prove separation; touching bounds still use
  // the game's exact collision check, preserving its boundary behavior.
  if(Math.max(from[0],to[0])<bounds[0]||Math.min(from[0],to[0])>bounds[1]||Math.max(from[1],to[1])<bounds[2]||Math.min(from[1],to[1])>bounds[3])return false;
  return a.checkReefCollision(from,to,poly);
 });
 // Waypoints: every opening, plus the corners around the reef and each rock.
 const small=[m.recife,...m.pedras].filter(poly=>poly.length).map(poly=>{const xs=poly.map(p=>p[0]),ys=poly.map(p=>p[1]);return[Math.min(...xs),Math.max(...xs),Math.min(...ys),Math.max(...ys)];});
 const corners=[...m.passagens,...small.flatMap(([x0,x1,y0,y1])=>[[x0-2.5,y0-2.5],[x1+2.5,y0-2.5],[x0-2.5,y1+2.5],[x1+2.5,y1+2.5]])].filter(p=>p.every(v=>v>0&&v<100)&&!collision(p,p));
 // Shortest collision-free path from each waypoint to the capsule (Dijkstra on the visibility graph).
 const cornerCost=corners.map(p=>collision(p,target)?Infinity:Math.hypot(p[0]-target[0],p[1]-target[1]));
 for(const done=new Set();done.size<corners.length;){
  let best=-1;corners.forEach((_,i)=>{if(!done.has(i)&&(best<0||cornerCost[i]<cornerCost[best]))best=i;});
  if(cornerCost[best]===Infinity)break;done.add(best);
  corners.forEach((q,j)=>{if(done.has(j)||collision(corners[best],q))return;const c=cornerCost[best]+Math.hypot(q[0]-corners[best][0],q[1]-corners[best][1]);if(c<cornerCost[j])cornerCost[j]=c;});
 }
 const headingFor=(dx,dy)=>(Math.round(Math.atan2(dx,dy)*180/Math.PI)+360)%360;
 let beam=[{position:m.porto,headings:[]}],solution=null;
 for(let turn=0;turn<m.turnos&&!solution;turn++){
  const candidates=[];
  for(const {position,headings} of beam){
   // Greedy distance alone drops routes that need two fixed-length legs near
   // the target. Circle geometry supplies those legs without shortening a
   // movement, changing current, or accepting a non-integer player heading.
   if(turn+1<m.turnos){
    const dx=target[0]-position[0]-currents[turn][0]-currents[turn+1][0],dy=target[1]-position[1]-currents[turn][1]-currents[turn+1][1],length=Math.hypot(dx,dy);
    if(length<=2*speed){
     const bearing=Math.atan2(dx,dy),offset=Math.acos(length/(2*speed));
     for(const side of[-1,1]){
      const first=(Math.round((bearing+side*offset)*180/Math.PI)+360)%360,via=move(position,first,turn);
      const second=headingFor(target[0]-via[0]-currents[turn+1][0],target[1]-via[1]-currents[turn+1][1]),end=move(via,second,turn+1);
      if(!collision(position,via)&&!collision(via,end)&&Math.hypot(end[0]-target[0],end[1]-target[1])<=m.vitoria.raio_resgate_km){solution=[...headings,first,second];break;}
     }
    }
   }
   if(solution)break;
   const direct=headingFor(target[0]-position[0]-currents[turn][0],target[1]-position[1]-currents[turn][1]);
   for(const heading of new Set([...Array.from({length:72},(_,i)=>i*5),direct])){
    const next=move(position,heading,turn);
    if(collision(position,next))continue;
    const distance=Math.hypot(next[0]-target[0],next[1]-target[1]);
    if(distance<=m.vitoria.raio_resgate_km){solution=[...headings,heading];break;}
    let score=distance;
    if(collision(next,target)){
     // Around one obstacle (one corner) or between two (two corners).
     let best=Infinity;
     corners.forEach((p,i)=>{if(cornerCost[i]<Infinity&&!collision(next,p))best=Math.min(best,Math.hypot(p[0]-next[0],p[1]-next[1])+cornerCost[i]);});
     score=Number.isFinite(best)?best:distance+30;
    }
    candidates.push({position:next,headings:[...headings,heading],score});
   }
   if(solution)break;
  }
  candidates.sort((a,b)=>a.score-b.score);
  const cells=new Set();beam=[];
  for(const candidate of candidates){const key=candidate.position.map(v=>Math.round(v*2)).join(',');if(cells.has(key))continue;cells.add(key);beam.push(candidate);if(beam.length===60)break;}
 }
 assert.ok(solution,`Level ${level} must admit a safe discrete route with its actual current stream`);
 assert.ok(solution.length<=m.turnos);
 // Replay every found route with the actual game's vector and collision APIs.
 // This verification is independent of search pruning and the circle formula.
 let verified=[...m.porto];
 for(const [turn,heading]of solution.entries()){
  assert.ok(Number.isInteger(heading)&&heading>=0&&heading<360);
  const vector=a.headingToVector(heading,speed),next=[Math.max(0,Math.min(100,verified[0]+vector.dx+currents[turn][0])),Math.max(0,Math.min(100,verified[1]+vector.dy+currents[turn][1]))];
  assert.equal(a.useCampaignMission(level)&&a.hitsObstacle(verified,next),false,`Level ${level}, turn ${turn+1}: safe full-length movement`);
  verified=next;
 }
 assert.ok(Math.hypot(verified[0]-target[0],verified[1]-target[1])<=m.vitoria.raio_resgate_km,`Level ${level}: discrete route reaches the rescue radius`);
}
console.log('PASS all 100 campaign seeds admit a safe rescue with fixed-length moves and integer headings');
