const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../public/assets/js'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const engine=read('engine.js').split('/* ==========================================================================\n   RENDER')[0];
const scope=vm.createContext({Math,console,Float32Array,window:{},document:{hidden:false}});
vm.runInContext(read('i18n.js')+'\n'+engine+'\n'+read('audio.js')+'\n'+read('onboarding.js')+'\nthis.api={TEXTOS,createCampaignMission,campaignLevelName,featureQueue,GhostRouteAudio};',scope);
const a=scope.api;
for(const lang of ['pt-BR','pt-PT','en','es']){
 assert.equal(new Set(Array.from({length:100},(_,n)=>a.campaignLevelName(n,lang))).size,100);
 for(let n=0;n<100;n++)for(const key of a.featureQueue(a.createCampaignMission(n),new Set())){
  assert.ok(a.TEXTOS[lang]['feature_'+key+'_title']);assert.ok(a.TEXTOS[lang]['feature_'+key+'_body']);
 }
}
for(const [level,key] of [[1,'rocks'],[1,'current'],[3,'jump'],[6,'ghz'],[10,'reef'],[10,'blackout'],[10,'drift'],[30,'freeze'],[60,'budget']]){
 assert.ok(!a.createCampaignMission(level-1).mecanicas.includes(key));assert.ok(a.createCampaignMission(level).mecanicas.includes(key));
}
const all=a.featureQueue(a.createCampaignMission(99),new Set());assert.equal(all.length,9);
assert.equal(a.featureQueue(a.createCampaignMission(99),new Set(all)).length,0);
assert.equal(a.featureQueue(a.createCampaignMission(0),new Set()).length,0);
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
