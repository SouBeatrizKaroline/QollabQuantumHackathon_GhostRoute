/* Run from the repository: node tests/game-core.cjs */
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const base=path.resolve(__dirname,'../public');
const useBuilt=true;
let core=fs.readFileSync(path.join(base,'assets/js/engine.js'),'utf8').replace(/\r\n/g,'\n');
core=core.slice(0,core.indexOf('/* ==========================================================================\n   RENDER'));
let main=fs.readFileSync(path.join(base,'assets/js/app.js'),'utf8').replace(/\r\n/g,'\n');
main=main.slice(0,main.indexOf('\n}\n')+3);
// This script exercises the game controller itself with UI/renderer callbacks isolated.
if(!main.includes('class GhostRouteApp'))throw new Error('Controller was not found');
const context=vm.createContext({console,Float32Array,Set,Math,Intl,TEXTOS:{'pt-BR':{missionStarted:'Mission started'}}});
vm.runInContext(core+'\n'+main+'\nthis.API={MISSAO,mulberry32,getRamseyProbabilities,reconstructPhaseCandidates,checkReefCollision,distToPolygon,BayesianGridEstimator,GhostRouteApp};',context);
const a=context.API;
const originalStart=a.GhostRouteApp.prototype.startNewGame;
const near=(x,y,eps=1e-9)=>assert.ok(Math.abs(x-y)<eps,`${x} != ${y}`);
for(const n of[1,3])for(const phase of[0,.5,Math.PI/2,Math.PI,4.1,2*Math.PI]){
 const p=a.getRamseyProbabilities(phase,n);
 near(p.pX,(1-Math.cos(n*phase))/2);near(p.pY,(1-Math.sin(n*phase))/2);
 assert.ok(p.pX>=0&&p.pX<=1&&p.pY>=0&&p.pY<=1);
 const cs=a.reconstructPhaseCandidates(p.pX*1e6,1e6,p.pY*1e6,1e6,n);
 const wrap=x=>((x%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
 assert.ok(cs.some(c=>Math.min(Math.abs(c-wrap(phase)),2*Math.PI-Math.abs(c-wrap(phase)))<1e-7),'Phase candidates exclude the true phase');
}
console.log('PASS Ramsey probabilities and phase ambiguity');
const reef=a.MISSAO.recife;
assert.ok(a.checkReefCollision([35,53],[52,53],reef),'A crossing segment must ground');
assert.equal(a.checkReefCollision([35,47],[52,47],reef),false,'A safe parallel segment must remain safe');
near(a.distToPolygon([42,53],reef),0);near(a.distToPolygon([42,47],reef),3);
console.log('PASS reef crossing, safe route, proximity');
const e=new a.BayesianGridEstimator();
const total=()=>Array.from(e.grid).reduce((s,p)=>s+p,0);
near(total(),1,1e-5);assert.equal(e.getMAP().join(','),'10,15');
for(let turn=0;turn<12;turn++){e.predict(5.3033008589,5.3033008589);e.update(150,250,120,250,turn%2?3:1);near(total(),1,1e-4);assert.ok(Array.from(e.grid).every(p=>Number.isFinite(p)&&p>=0));const hpd=e.getHPD95();assert.ok(Array.from(hpd).reduce((s,i)=>s+e.grid[i],0)>=.9499,'HPD region must contain 95% posterior');}
console.log('PASS estimator normalization and credible mass across 12 updates');
function game(mode,heading=90){
 const app=Object.create(a.GhostRouteApp.prototype);app.estimator=new a.BayesianGridEstimator();
 app.startNewGame=originalStart;
 app.sensorModeSelect={value:mode};app.sensorShotsSelect={value:'500'};app.chkSuspicious={checked:false};app.alertGps={style:{}};app.alertReef={style:{}};
 app.worldToScreenCoords=(x,y)=>({sx:x,sy:y});app.setHeading=function(deg){this.state.currentHeading=deg;};
 for(const name of['updateLocalization','updateTelemetryUI','updateNarrative','renderMap','announce','openReplayModal'])app[name]=()=>{};
 app.currentLang='pt-BR';app.startNewGame(20261011);app.state.currentHeading=heading;return app;
}
const g1=game('simple'),g2=game('ghz'),g3=game('none');
for(let i=0;i<12;i++){g1.advanceTurn();g2.advanceTurn();g3.advanceTurn();}
assert.equal(JSON.stringify(g1.state.realHistory),JSON.stringify(g2.state.realHistory),'Sensor mode must not alter world movement');
assert.equal(JSON.stringify(g1.state.realHistory),JSON.stringify(g3.state.realHistory),'No sensor must preserve deterministic world movement');
assert.equal(g1.state.remainingShots,0);assert.equal(g3.state.remainingShots,6000);
assert.equal(g1.state.turnsRecord.length,12);
console.log('PASS independent world/sensor streams, 12-turn termination, shot budget');
const rec=g1.state.turnsRecord;
const freezeOK=JSON.stringify(rec[8].gpsReported)===JSON.stringify(rec[7].gpsReported)&&JSON.stringify(rec[9].gpsReported)===JSON.stringify(rec[7].gpsReported);
console.log((freezeOK?'PASS':'FAIL')+' GPS freeze retains turn 8 observation on turns 9 and 10');
const grounding=game('simple');grounding.state.realPosition=[42,47];grounding.state.realHistory=[[42,47]];grounding.state.inertialPosition=[42,47];grounding.state.inertialHistory=[[42,47]];grounding.state.gpsPosition=[42,47];grounding.state.gpsHistory=[[42,47]];grounding.state.currentHeading=0;grounding.advanceTurn();
assert.ok(grounding.state.isAground&&grounding.state.isFinished,'Grounding must end the mission');
const gr=grounding.state.turnsRecord.at(-1);
const groundingOK=JSON.stringify(grounding.state.realPosition)===JSON.stringify(gr.realAfter)&&JSON.stringify(grounding.state.realHistory.at(-1))===JSON.stringify(gr.realAfter);
console.log((groundingOK?'PASS':'FAIL')+' grounding commits final position/history for replay and export');
assert.equal(grounding.state.remainingShots,6000,'Grounding must not consume a post-collision sensor reading');
assert.equal(gr.shots,0);
const edgeCases=[[[35,56],[52,56]],[[48,45],[48,60]],[[38,45],[38,60]]];
let edgesOK=true;
for(const[p1,p2]of edgeCases){const hit=a.checkReefCollision(p1,p2,reef);edgesOK=edgesOK&&hit;console.log((hit?'PASS':'FAIL')+' reef boundary contact '+JSON.stringify([p1,p2]));}
if(!freezeOK||!groundingOK||!edgesOK)process.exitCode=1;
if(useBuilt){
 // Exercise the real checkbox change listener installed by the built frontend.
 const eventNode=()=>({listeners:{},style:{},addEventListener(name,callback){(this.listeners[name]??=[]).push(callback);},setAttribute(){}});
 const fullscreen=eventNode();
 context.document={getElementById:()=>fullscreen,addEventListener(){}};
 context.window={addEventListener(){}};
 context.TEXTOS={'pt-BR':{markSaved:'saved'}};
 let enhancements=fs.readFileSync(path.join(base,'assets/js/app.js'),'utf8').replace(/\r\n/g,'\n');
 enhancements=enhancements.slice(enhancements.indexOf('// Fullscreen HUD controller'),enhancements.indexOf('function startGhostRoute'));
 vm.runInContext(enhancements,context);
 const markGame=game('none');
 for(const name of['langSelect','headingSlider','btnAdvance','btnRestart','btnNextTut','btnCloseReplay','btnReplaySame','btnReplayNew','btnExportJson','scrubberRange','replayModal'])markGame[name]=eventNode();
 for(const name of['sensorModeSelect','sensorShotsSelect','chkSuspicious'])Object.assign(markGame[name],eventNode());
 markGame.dirButtons=[];markGame.renderer={canvas:eventNode()};markGame.currentLang='pt-BR';
 markGame.bindEvents();
 const change=()=>markGame.chkSuspicious.listeners.change.forEach(callback=>callback());
 markGame.chkSuspicious.checked=true;change();
 assert.equal(markGame.state.turnsRecord.length,0,'A pre-observation checkbox must not fabricate a mark');
 markGame.advanceTurn();assert.equal(markGame.state.turnsRecord[0].markedSuspicious,false,'Advancing must not pre-mark a new observation');
 markGame.chkSuspicious.checked=true;change();assert.equal(markGame.state.turnsRecord[0].markedSuspicious,true);
 markGame.advanceTurn();assert.equal(markGame.state.turnsRecord[0].markedSuspicious,true,'A saved mark must survive the next turn');assert.equal(markGame.state.turnsRecord[1].markedSuspicious,false,'The next turn must start unmarked');
 markGame.chkSuspicious.checked=true;change();assert.equal(markGame.state.turnsRecord[1].markedSuspicious,true);
 markGame.chkSuspicious.checked=false;change();assert.equal(markGame.state.turnsRecord[1].markedSuspicious,false,'Unchecking must update only the latest observed turn');assert.equal(markGame.state.turnsRecord[0].markedSuspicious,true);
 while(!markGame.state.isFinished)markGame.advanceTurn();
 markGame.chkSuspicious.checked=true;change();assert.equal(markGame.state.turnsRecord.at(-1).markedSuspicious,false,'Finished records must not change through an inactive checkbox');
 console.log('PASS suspicion marks attach to the latest observation and persist independently');
 const allEngine=fs.readFileSync(path.join(base,'assets/js/engine.js'),'utf8').replace(/\r\n/g,'\n');
 vm.runInContext(allEngine.slice(allEngine.indexOf('class TacticalMapRenderer'))+'\nthis.Renderer=TacticalMapRenderer;',context);
 const chart=Object.create(context.Renderer.prototype);
 chart.ctx=new Proxy({}, {get:(obj,key)=>obj[key]||(()=>{})});chart.worldToScreen=(x,y)=>({sx:x,sy:y});chart.scale=1;
 let labels=[];chart.text=label=>labels.push(label);
 const labelText={landingLabel:'Expected landing'};
 chart.drawTarget({currentTurn:8,turnsRecord:[{turn:7}]},labelText);
 assert.equal(labels.includes('AURORA-1'),false,'Capsule must remain hidden after completing turn 7');
 labels=[];chart.drawTarget({currentTurn:9,turnsRecord:[{turn:8}]},labelText);
 assert.equal(labels.includes('AURORA-1'),true,'Capsule must appear after completing turn 8');
 console.log('PASS capsule reveal follows completed turn 8');
 const historicalState={...markGame.state,currentTurn:3,currentHeading:90,realPosition:[30,15],gpsPosition:[30,15],inertialPosition:[30,15],inertialRadiusKm:2,turnsRecord:[{turn:3,markedSuspicious:false}],gpsHistory:[[10,15],[30,15]],realHistory:[[10,15],[30,15]],inertialHistory:[[10,15],[30,15]]};
 chart.canvas={width:100,height:100};chart.ocean={};chart.ox=0;chart.oy=0;chart.chartSize=100;chart.target=[30,15];chart.animFrom=[30,15];chart.reduced=true;
 let heatmapCalls=0;chart.drawHeatmap=()=>heatmapCalls++;
 for(const name of['drawReef','drawTarget','drawShip','drawRadar','drawCompass','line'])chart[name]=()=>{};
 chart.current={state:historicalState,estimator:markGame.estimator,isReplay:true,debug:true};chart.drawScene(1000);
 assert.equal(heatmapCalls,0,'Historical replay must not draw the final posterior');
 chart.current.isReplay=false;chart.drawScene(1000);assert.equal(heatmapCalls,1,'Live map must show its current posterior');
 console.log('PASS historical replay omits final posterior while live map preserves it');
 // Run the actual export method, capturing the anchor's data URI instead of
 // depending on the preview browser's download event implementation.
 function captureExport(app){
   let anchor;
   context.document.createElement=tag=>{
     assert.equal(tag,'a');
     anchor={attributes:{},clicked:false,removed:false,setAttribute(key,value){this.attributes[key]=value;},click(){this.clicked=true;},remove(){this.removed=true;}};
     return anchor;
   };
   context.document.body={appendChild(node){assert.equal(node,anchor);}};
   app.exportDecisionsJSON();
   assert.ok(anchor.clicked&&anchor.removed,'Export must initiate its download and clean up the temporary link');
   assert.equal(anchor.attributes.download,`ghost_route_seed_${app.seed}_decisions.json`);
   assert.ok(anchor.attributes.href.startsWith('data:text/json;charset=utf-8,'));
   return JSON.parse(decodeURIComponent(anchor.attributes.href.slice(anchor.attributes.href.indexOf(',')+1)));
 }
 const exported=captureExport(g1);
 assert.equal(exported.projeto,'Ghost Route');assert.equal(exported.semente,20261011);
 assert.equal(exported.total_turnos,12);assert.equal(exported.registros_turnos.length,12);
 const spent=exported.registros_turnos.reduce((sum,r)=>sum+r.shots,0);
 assert.equal(spent,6000);assert.equal(spent+exported.estatisticas_finais.shots_economizados,exported.configuracao_missao.sensor.shots_total);
 assert.equal(JSON.stringify(exported.registros_turnos.at(-1).realAfter),JSON.stringify(g1.state.realPosition),'Exported final position must agree with the completed game');
 near(exported.estatisticas_finais.distancia_capsula_km,Math.hypot(g1.state.realPosition[0]-a.MISSAO.capsula.pouso_real[0],g1.state.realPosition[1]-a.MISSAO.capsula.pouso_real[1]));
 for(const record of exported.registros_turnos){
   assert.equal(record.sensorMode,'simple');assert.equal(record.heading,90);assert.equal(record.shots,500);
   near(record.commanded.dx,7.5);near(record.commanded.dy,0);
   assert.equal(record.NX+record.NY,record.shots);assert.ok(record.kX>=0&&record.kX<=record.NX&&record.kY>=0&&record.kY<=record.NY);
 }
 const sameSeed=game('simple');while(!sameSeed.state.isFinished)sameSeed.advanceTurn();
 assert.deepEqual(captureExport(sameSeed),exported,'Replaying the same seed, commands, modes and shots must reproduce the full export');
 const ghzExport=captureExport(g2),noneExport=captureExport(g3);
 assert.ok(ghzExport.registros_turnos.every(r=>r.sensorMode==='ghz'));
 assert.ok(noneExport.registros_turnos.every(r=>r.sensorMode==='none'&&r.shots===0));
 assert.equal(noneExport.estatisticas_finais.shots_economizados,6000);
 const groundedExport=captureExport(grounding);
 assert.equal(groundedExport.estatisticas_finais.casco_encalhado,true);
 assert.equal(JSON.stringify(groundedExport.registros_turnos.at(-1).realAfter),JSON.stringify(grounding.state.realPosition));
 console.log('PASS actual JSON export: Ghost Route, seed, 12 records, 6000 shots, final position and deterministic replay');
 // A complete safe route must remain achievable with the default seed.
 // This is a regression fixture, not a player hint or an exposed UI route.
 const rescue=game('simple');
 const rescueHeadings=[45,45,45,45,45,45,90,45,45,45,45,350];
 for(const heading of rescueHeadings){rescue.state.currentHeading=heading;rescue.advanceTurn();const completed=rescue.state.turnsRecord.at(-1);if([4,6,9].includes(completed.turn))completed.markedSuspicious=true;}
 assert.equal(rescue.state.isAground,false,'A route around the reef must remain navigable');
 assert.equal(rescue.state.turnsRecord.length,12);
 const rescueDistance=Math.hypot(rescue.state.realPosition[0]-a.MISSAO.capsula.pouso_real[0],rescue.state.realPosition[1]-a.MISSAO.capsula.pouso_real[1]);
 assert.ok(rescueDistance<=a.MISSAO.vitoria.raio_resgate_km,`Default-seed fixture must allow rescue, actual distance ${rescueDistance}`);
 vm.runInContext('this.originalReplay=baseReplay;',context);
 const replayNodes={};
 context.document.getElementById=id=>replayNodes[id]??={textContent:'',className:'',classList:{added:[],add(name){this.added.push(name);}}};
 context.TEXTOS['pt-BR']=Object.assign(context.TEXTOS['pt-BR'],{endingPerfect:'Perfect rescue',endingRescue:'Rescue',endingDeceived:'Missed rescue',endingAground:'Grounded'});
 rescue.currentLang='pt-BR';rescue.replayModal={style:{}};rescue.scrubberRange={};rescue.renderScrubberTurn=()=>{};
 context.originalReplay.call(rescue);
 assert.equal(replayNodes['val-rep-score'].textContent,'3 / 3');assert.equal(replayNodes['outcome-banner'].textContent,'Perfect rescue');
 console.log(`PASS mission is winnable: no grounding, 3 attacks detected, perfect rescue at ${rescueDistance.toFixed(3)} km`);
 if(process.argv.includes('--write-example'))fs.writeFileSync(path.resolve(__dirname,'../examples/session-seed-20261011.json'),JSON.stringify(captureExport(rescue),null,2)+'\n');
}

