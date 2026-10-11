const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../public/assets/js'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const engine=read('engine.js').split('/* ==========================================================================\n   RENDER')[0];
const scope=vm.createContext({Math,console,Float32Array,window:{},document:{hidden:false}});
vm.runInContext(read('i18n.js')+'\n'+engine+'\n'+read('audio.js')+'\n'+read('onboarding.js')+'\nthis.api={TEXTOS,createCampaignMission,campaignLevelName,featureQueue,scheduledFeatures,GhostRouteAudio};',scope);
const a=scope.api;
for(const lang of ['pt-BR','pt-PT','en','es']){
 assert.equal(new Set(Array.from({length:100},(_,n)=>a.campaignLevelName(n,lang))).size,100);
 for(let n=0;n<100;n++)for(const key of a.featureQueue(a.createCampaignMission(n),new Set())){
  assert.ok(a.TEXTOS[lang]['feature_'+key+'_title']);assert.ok(a.TEXTOS[lang]['feature_'+key+'_body']);
 }
}
for(const [level,key] of [[1,'sandbank'],[2,'rocks'],[1,'current'],[3,'jump'],[3,'ghost'],[6,'ghz'],[10,'reef'],[10,'blackout'],[10,'drift'],[30,'freeze'],[60,'budget']]){
 assert.ok(!a.createCampaignMission(level-1).mecanicas.includes(key));assert.ok(a.createCampaignMission(level).mecanicas.includes(key));
}
const all=a.featureQueue(a.createCampaignMission(99),new Set());assert.equal(all.length,11);
assert.equal(a.featureQueue(a.createCampaignMission(99),new Set(all)).length,0);
assert.equal(a.featureQueue(a.createCampaignMission(0),new Set()).length,0);
for(let level=1;level<100;level++){
 const mission=a.createCampaignMission(level),seen=new Set(),introduced=new Map();
 for(let completed=0;completed<mission.turnos;completed++){
  const record=completed?{turn:completed,gpsReported:[2,0],realAfter:[0,0]}:undefined;
  const queue=a.scheduledFeatures(mission,seen,completed,record);
  assert.equal(new Set(queue).size,queue.length,'No duplicate cards');
  for(const key of queue){assert.ok(!seen.has(key));seen.add(key);introduced.set(key,completed+1);}
 }
 assert.deepEqual([...seen].sort(),[...a.featureQueue(mission,new Set())].sort(),'Skipping levels still teaches every active mechanic');
 for(const [key,type]of[['jump','salto'],['drift','deriva'],['freeze','congelamento']]){
  const attack=mission.ataques.find(event=>event.tipo===type);
  if(attack)assert.equal(introduced.get(key),attack.inicio,'Timed hazard is explained before its first affected move');
 }
 if(mission.mecanicas.includes('blackout'))assert.equal(introduced.get('blackout'),mission.capsula.turno_blackout_inicio);
 if(mission.mecanicas.includes('ghost')){
  const first=Array.from({length:mission.turnos},(_,i)=>i+1).find(turn=>turn>=mission.capsula.turno_revelacao&&mission.ataques.some(event=>turn>=event.inicio&&turn<=event.fim));
  assert.equal(introduced.get('ghost'),first+1,'False beacon is taught as soon as it appears, including after blackout');
  assert.ok(!a.scheduledFeatures(mission,new Set(),first,{turn:first,gpsReported:[.5,0],realAfter:[0,0]}).includes('ghost'),'No invisible ghost introduction for small offsets');
 }
}
assert.ok(a.scheduledFeatures(a.createCampaignMission(99),new Set(),0).length<all.length,'Advanced departures do not front-load all future attacks');
let started=0,stopped=0,connections=0;
const audio=new a.GhostRouteAudio();audio.context={state:'running',currentTime:0,
 createOscillator(){return{frequency:{setValueAtTime(){}},connect(){connections++;},disconnect(){},start(){started++;},stop(){stopped++;}};},
 createGain(){return{gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){connections++;},disconnect(){}};},destination:{}};
for(const event of ['click','move','sensor','mark','alert','rescue','failure','intro'])audio.play(event);
assert.ok(started>=20);assert.equal(started,stopped);assert.equal(connections,started*2);
const active=started;audio.setEnabled(false);audio.play('rescue');assert.equal(started,active);
audio.setEnabled(true);scope.document.hidden=true;audio.play('alert');assert.equal(started,active);
scope.document.hidden=false;audio.context=null;assert.doesNotThrow(()=>audio.play('sensor'));
audio.unlock().then(result=>assert.equal(result,false));
console.log('PASS 100 unique names per locale, mechanic introductions including skipped levels, sound effects, mute and unavailable audio');
