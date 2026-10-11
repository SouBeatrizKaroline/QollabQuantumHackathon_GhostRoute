/* Adjacent levels increase pressure within small, explicit bounds. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../public/assets/js/engine.js'),'utf8');
const context=vm.createContext({Math,console,Float32Array});
vm.runInContext(source.slice(0,source.indexOf('/* =========================================================================='+ '\n   RENDER'))+'\nthis.mission=createCampaignMission;',context);
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
  assert.ok(routeDemand(b)-routeDemand(a)<.0022,'Gate transitions do not create abrupt travel-budget pressure');
 }
 assert.ok(b.sensor.shots_total<=a.sensor.shots_total&&a.sensor.shots_total-b.sensor.shots_total<=100);
 assert.ok(b.vitoria.raio_resgate_km<=a.vitoria.raio_resgate_km&&a.vitoria.raio_resgate_km-b.vitoria.raio_resgate_km<.037);
 const noise=b.navio.ruido_corrente_km-a.navio.ruido_corrente_km;
 assert.ok(noise>=0&&noise<(level===1?.041:.008));
 const relocation=Math.hypot(...b.capsula.pouso_real.map((v,i)=>v-a.capsula.pouso_real[i]));
 assert.ok(relocation<(level<=10?8:.2),'No random target relocations');
 assert.ok(b.pedras.length-a.pedras.length<=2);
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
assert.ok(routeDemand(levels[1])>.77&&routeDemand(levels[1])<.80,'First gate leaves a generous maneuvering allowance');
assert.ok(Math.abs(routeDemand(levels[99])-.92)<1e-10);
assert.equal(levels[9].passagens.length,1);assert.equal(levels[10].passagens.length,2);
assert.equal(levels[39].passagens.length,2);assert.equal(levels[40].passagens.length,3);
console.log('PASS all 100 levels: gradual reference-route pressure (78% to 92%), gate transitions, resource limits and final-level pressure');
