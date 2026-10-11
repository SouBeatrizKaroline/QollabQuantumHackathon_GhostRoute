/* Adjacent levels increase pressure within small, explicit bounds. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../public/assets/js/engine.js'),'utf8');
const context=vm.createContext({Math,console,Float32Array});
vm.runInContext(source.slice(0,source.indexOf('/* =========================================================================='+ '\n   RENDER'))+'\nthis.mission=createCampaignMission;this.collides=checkReefCollision;',context);
const levels=Array.from({length:100},(_,level)=>context.mission(level));
const routeDemand=mission=>{
 const route=[mission.porto,...mission.passagens,mission.capsula.pouso_real];
 const length=route.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-route[i][0],p[1]-route[i][1]),0);
 return length/(mission.turnos*mission.navio.velocidade_km_turno);
};
for(let level=1;level<100;level++){
 const a=levels[level-1],b=levels[level];
 if(level>1){
  assert.ok(routeDemand(b)>=routeDemand(a)-1e-10,'Reference route pressure never eases toward the end');
  assert.ok(routeDemand(b)-routeDemand(a)<.0034,'Route changes do not create abrupt travel-budget pressure');
 }
 assert.ok(b.sensor.shots_total<=a.sensor.shots_total&&a.sensor.shots_total-b.sensor.shots_total<=100);
 assert.ok(b.vitoria.raio_resgate_km<=a.vitoria.raio_resgate_km&&a.vitoria.raio_resgate_km-b.vitoria.raio_resgate_km<.037);
 const noise=b.navio.ruido_corrente_km-a.navio.ruido_corrente_km;
 assert.ok(noise>=0&&noise<(level===5?.011:.008));
 const relocation=Math.hypot(...b.capsula.pouso_real.map((v,i)=>v-a.capsula.pouso_real[i]));
 assert.ok(relocation<1.1,'Destination moves gently across the chart');
 assert.ok(b.pedras.length>=a.pedras.length&&b.pedras.length-a.pedras.length<=1,'Add at most one small rock at a time');
 // Existing polygons keep their orientation and grow smoothly, even when a
 // new rock is appended. Rounded coordinates allow a small perimeter tolerance.
 for(let rock=0;rock<a.pedras.length;rock++){
  const perimeter=poly=>poly.reduce((sum,p,i)=>sum+Math.hypot(p[0]-poly[(i+1)%poly.length][0],p[1]-poly[(i+1)%poly.length][1]),0);
  const before=perimeter(a.pedras[rock]),after=perimeter(b.pedras[rock]);
  assert.ok(after>=before-.35&&after-before<1.2,'Existing rock growth stays bounded');
 }
}
assert.equal(levels[99].sensor.shots_total,3000);
assert.equal(levels[99].navio.ruido_corrente_km,.5);
assert.ok(Math.abs(levels[99].vitoria.raio_resgate_km-1.6)<1e-9);
assert.ok(routeDemand(levels[1])>.69&&routeDemand(levels[1])<.72,'First mission leaves generous maneuvering allowance');
assert.ok(Math.abs(routeDemand(levels[99])-.92)<1e-10);
for(let n=1;n<5;n++){
 assert.equal(levels[n].mecanicas.length,3);assert.equal(levels[n].recife.length+levels[n].pedras.length+levels[n].passagens.length,0);
 assert.equal(levels[n].ataques.length,0);assert.equal(levels[n].navio.ruido_corrente_km,0);
}
const learned=new Set(['navigation','sensor','rescue']);let lastNew=-5;
for(let n=1;n<100;n++){
 const fresh=levels[n].mecanicas.filter(key=>!learned.has(key));
 assert.ok(fresh.length<=1,'Never introduce two mechanics in one level');
 if(fresh.length){assert.ok(n-lastNew>=5,'At least five levels between new mechanics');lastNew=n;fresh.forEach(key=>learned.add(key));}
}
assert.equal(levels[24].passagens.length,0);assert.equal(levels[25].passagens.length,1);
assert.equal(levels[55].passagens.length,2);assert.equal(levels[85].passagens.length,3);
for(const n of[30,40,60,70,80,90])assert.equal(levels[n].passagens.length,0,'Open-water missions remain available later');
for(const n of[10,20,30,40,60,70,80,90]){
 const m=levels[n];assert.equal(m.passagens.length,0);
 assert.ok(m.pedras.some(poly=>context.collides(m.porto,m.capsula.pouso_real,poly)),'Open-water routes can require bends around individual rocks without wall barriers');
}
assert.equal(levels[99].passagens.length,3);assert.equal(levels[99].pedras.length,8);
console.log('PASS calm levels 01–04, spaced single-mechanic introductions, open-water variants, 70–92% route demand and strongest final resource pressure');
