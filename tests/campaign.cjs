/* Mission feasibility and gradual difficulty over all 100 generated levels. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const engine=fs.readFileSync(path.join(__dirname,'../public/assets/js/engine.js'),'utf8');
const context=vm.createContext({Math,console,Float32Array});
vm.runInContext(engine.slice(0,engine.indexOf('/* =========================================================================='+'\n   RENDER'))+'\nthis.API={MISSAO,createCampaignMission,useCampaignMission,checkReefCollision,activeAttacks,mulberry32,gaussianRandom,headingToVector};',context);
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
  // A route south of the reef, then to the target, fits the available travel.
  const waypoint=level<10?m.porto:[m.recife[1][0]+4,m.recife[0][1]-3];
  assert.equal(a.checkReefCollision(m.porto,waypoint,m.recife),false);
  assert.equal(a.checkReefCollision(waypoint,m.capsula.pouso_real,m.recife),false);
  const routeLength=Math.hypot(waypoint[0]-m.porto[0],waypoint[1]-m.porto[1])+Math.hypot(m.capsula.pouso_real[0]-waypoint[0],m.capsula.pouso_real[1]-waypoint[1]);
  assert.ok(routeLength<=m.turnos*m.navio.velocidade_km_turno,'Collision-free route fits the turn budget');
}
assert.equal(missions[0].ataques.length,0);assert.equal(missions[0].navio.ruido_corrente_km,0);
assert.equal(missions[1].ataques.length,1);assert.equal(missions[10].ataques.length,2);assert.equal(missions[99].ataques.length,3);
a.useCampaignMission(99);assert.equal(a.MISSAO.nivel,99);assert.equal(a.activeAttacks(3).length,1);
a.useCampaignMission(0);assert.equal(a.MISSAO.nivel,0);assert.equal(a.activeAttacks(3).length,0);
assert.equal(missions[99].sensor.shots_total,3000,'Switching missions must not mutate saved configs');
console.log('PASS 100 unique feasible missions, gradual difficulty, tutorial safety, attack stages and configuration isolation');

// A bounded geometric search checks fixed-length moves, integer headings and
// each level's actual deterministic current stream. It is a test oracle only;
// routes and hidden coordinates are never added to the player interface.
for(let level=0;level<100;level++){
 const m=missions[level],rng=a.mulberry32(20261011+level*7919),target=m.capsula.pouso_real,speed=m.navio.velocidade_km_turno;
 const currents=Array.from({length:m.turnos},()=>[a.gaussianRandom(rng)*m.navio.ruido_corrente_km,a.gaussianRandom(rng)*m.navio.ruido_corrente_km]);
 const vectors=Array.from({length:360},(_,heading)=>[Math.sin(heading*Math.PI/180)*speed,Math.cos(heading*Math.PI/180)*speed]);
 const move=(position,heading,turn)=>position.map((coordinate,index)=>Math.max(0,Math.min(100,coordinate+vectors[heading][index]+currents[turn][index])));
 const xs=m.recife.map(p=>p[0]),ys=m.recife.map(p=>p[1]),bounds=[Math.min(...xs),Math.max(...xs),Math.min(...ys),Math.max(...ys)];
 const collision=(from,to)=>{
  // Disjoint segment/polygon bounds prove separation; touching bounds still use
  // the game's exact collision check, preserving its boundary behavior.
  if(Math.max(from[0],to[0])<bounds[0]||Math.min(from[0],to[0])>bounds[1]||Math.max(from[1],to[1])<bounds[2]||Math.min(from[1],to[1])>bounds[3])return false;
  return a.checkReefCollision(from,to,m.recife);
 };
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
     const corners=[[bounds[1]+2,bounds[2]-2],[bounds[0]-2,bounds[3]+2]];
     const detours=corners.filter(p=>!collision(next,p)&&!collision(p,target)).map(p=>Math.hypot(p[0]-next[0],p[1]-next[1])+Math.hypot(p[0]-target[0],p[1]-target[1]));
     score=detours.length?Math.min(...detours):distance+30;
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
  assert.equal(a.checkReefCollision(verified,next,m.recife),false,`Level ${level}, turn ${turn+1}: safe full-length movement`);
  verified=next;
 }
 assert.ok(Math.hypot(verified[0]-target[0],verified[1]-target[1])<=m.vitoria.raio_resgate_km,`Level ${level}: discrete route reaches the rescue radius`);
}
console.log('PASS all 100 campaign seeds admit a safe rescue with fixed-length moves and integer headings');
