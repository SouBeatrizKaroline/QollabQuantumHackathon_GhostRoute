/* Controller integration regressions; no browser or external test library required. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../public');
let document;
function node(){
 const classes=new Set();
 return {value:'',textContent:'',dataset:{},style:{},disabled:false,hidden:false,children:[],listeners:{},attributes:{},
  classList:{contains:name=>classes.has(name),add:name=>classes.add(name),toggle(name,force){const on=force??!classes.has(name);on?classes.add(name):classes.delete(name);return on;}},
  setAttribute(key,value){this.attributes[key]=value;},
  addEventListener(key,fn){(this.listeners[key]??=[]).push(fn);},
  dispatch(key){for(const fn of this.listeners[key]||[])fn({target:this,currentTarget:this,preventDefault(){}});},
  click(){this.focus();this.dispatch('click');},focus(){document.activeElement=this;},getClientRects(){return[{}];},
  appendChild(child){this.children.push(child);},replaceChildren(){this.children=[];},
  querySelector(selector){const turn=selector.match(/data-turn="(\d+)"/);return turn?this.children.find(child=>child.dataset.turn===turn[1]):null;},
  querySelectorAll(){return this.children;},getContext(){return new Proxy({}, {get:(target,key)=>target[key]??(()=>{})});},
  width:520,height:112};
}
const nodes=new Map(),get=id=>nodes.get(id)||nodes.set(id,node()).get(id);
const dirs=[315,0,45,270,90,225,180,135].map(deg=>Object.assign(node(),{dataset:{deg:String(deg)}}));
const radio=node(),utility=node(),dock=node();
document={activeElement:null,documentElement:{},getElementById:get,createElement:node,addEventListener(){},
 querySelector:selector=>({'.radio-widget':radio,'.utility':utility,'.navigation-dock':dock})[selector],
 querySelectorAll:selector=>selector==='.btn-dir'?dirs:[]};
for(const[id,values,selected]of[['sensor-mode-select',['none','simple','ghz'],'simple'],['sensor-shots-select',['100','250','500','1000'],'500']]){
 const select=get(id);select.options=values.map(value=>({value,disabled:false}));select.value=selected;
 Object.defineProperty(select,'selectedOptions',{get(){return this.options.filter(option=>option.value===this.value);}});
}
const context=vm.createContext({console,Math,Intl,Float32Array,Set,document,window:{addEventListener(){}},AssetRegistry:{drawQuooraAvatar(){}}});
const read=name=>fs.readFileSync(path.join(root,'assets/js',name),'utf8').replace(/\r\n/g,'\n');
let engine=read('engine.js');engine=engine.slice(0,engine.indexOf('/* =========================================================================='+'\n   RENDER'));
let app=read('app.js');app=app.slice(0,app.indexOf('function startGhostRoute'));
get('sensor-intro').hidden=true;get('feature-intro').hidden=true;
vm.runInContext(read('i18n.js')+'\n'+engine+'\n'+read('audio.js')+'\n'+read('onboarding.js')+'\n'+app+'\ninstallMissionExperience(GhostRouteApp);this.API={GhostRouteApp,BayesianGridEstimator,TEXTOS};',context);
const a=context.API;
const game=Object.create(a.GhostRouteApp.prototype);
game.renderer={canvas:node(),resize(){},render(){},worldToScreen(x,y){return{sx:x,sy:y};}};game.avatarCtx={};game.estimator=new a.BayesianGridEstimator();
game.currentLang='en';game.debugMode=false;game.initDOM();game.bindEvents();game.startNewGame(20261011);
assert.match(get('dialogue-box').textContent,/12 turns.*2 km/);
assert.equal(get('translated-credit').hidden,true);
assert.equal(game.chkSuspicious.disabled,true);
game.setHeading(90);game.sensorShotsSelect.value='1000';
for(let i=0;i<6;i++)game.advanceTurn();
assert.equal(game.sensorModeSelect.value,'none');
assert.equal(game.sensorShotsSelect.disabled,true);
assert.match(get('last-reading').textContent,/Observed turn 6.*budget exhausted/);
assert.match(get('lbl-suspicious').textContent,/turn 6/);
assert.equal(game.state.currentTurn,7);
game.advanceTurn();
assert.equal(game.state.turnsRecord.at(-1).shots,0);
assert.match(get('last-reading').textContent,/no quantum measurement this turn/);
for(const lang of['pt-BR','es','en']){
 game.currentLang=lang;game.updateLocalization();
 assert.equal(document.documentElement.lang,lang);
 assert.ok(get('last-reading').textContent.includes(a.TEXTOS[lang].budgetExhausted));
 assert.equal(get('val-dist').textContent.includes(','),lang!=='en');
 assert.equal(get('translated-credit').hidden,lang==='en');
}
while(!game.state.isFinished)game.advanceTurn();
assert.ok(get('dialogue-box').textContent.includes(a.TEXTOS.en.endingDeceived));
assert.equal(get('last-reading').textContent.includes(a.TEXTOS.en.budgetExhausted),false,'Do not tell a finished player to continue');
get('btn-close-replay').click();
for(const lang of['pt-BR','es']){
 game.currentLang=lang;game.updateLocalization();
 assert.equal(game.replayModal.style.display,'none','Changing language must not reopen a closed replay');
 assert.equal(get('dialogue-box').textContent,a.TEXTOS[lang].endingDeceived);
 assert.equal(get('outcome-banner').textContent,get('dialogue-box').textContent);
}
game.openReplayModal();
let button=get('attack-timeline').querySelector('[data-turn="4"]');button.click();
assert.equal(document.activeElement.dataset.turn,'4','Timeline focus must survive rebuilding its buttons');
assert.ok(get('timeline-legend').textContent.includes(a.TEXTOS.es.jumpCode+':'));
assert.equal(get('legend-heat').hidden,true,'Replay must not label a posterior it does not show');
assert.equal(get('legend-inertial').hidden,false);
for(const listener of game.replayModal.listeners.keydown)listener({key:'Escape',preventDefault(){}});
assert.equal(game.replayModal.style.display,'none');assert.equal(document.activeElement,game.btnAdvance);
game.startNewGame(20261011);
assert.equal(game.sensorModeSelect.value,'simple','Restart must restore sensing after an exhausted previous game');
assert.equal(game.sensorShotsSelect.value,'500');assert.equal(game.sensorShotsSelect.disabled,false);
assert.equal(game.state.remainingShots,6000);assert.equal(get('legend-heat').hidden,false);
console.log('PASS localized observation, exhausted sensing, final radio, replay focus/legend and restart states');

const saved=new Map();context.window.localStorage={getItem:key=>saved.get(key)||null,setItem:(key,value)=>saved.set(key,value)};
const campaign=Object.create(a.GhostRouteApp.prototype);
campaign.renderer={canvas:node(),resize(){},render(){},worldToScreen(x,y){return{sx:x,sy:y};}};
campaign.avatarCtx={};campaign.estimator=new a.BayesianGridEstimator();campaign.currentLang='pt-BR';campaign.levelNumber=0;campaign.completedLevels=new Set();campaign.debugMode=false;
campaign.initDOM();campaign.bindEvents();campaign.startNewGame(20261011);campaign.closeMissionMenu();
assert.equal(campaign.state.maxTurns,4);assert.match(get('dialogue-box').textContent,/045°/);
for(let i=0;i<4;i++){while(campaign.introQueue.length)campaign.ackFeature();campaign.advanceTurn();}
assert.equal(campaign.state.isFinished,true);assert.equal(campaign.state.isAground,false);
assert.ok(campaign.completedLevels.has(0));assert.equal(get('btn-next-level').hidden,false);
assert.equal(get('outcome-banner').textContent.includes(a.TEXTOS['pt-BR'].endingRescue),false,'No-attack tutorial must not claim an attack was missed');
assert.equal(get('outcome-banner').textContent.includes('3 ataques'),false,'Tutorial must not claim three attacks were detected');
assert.equal(JSON.parse(saved.get('ghost-route.preferences')).completed.join(','),'0');
campaign.openReplayModal();assert.equal(campaign.completedLevels.size,1,'Reopening replay must not double-count completion');
let download;
const createElement=document.createElement;document.createElement=tag=>{const result=node();result.remove=()=>{};if(tag==='a')download=result;return result;};document.body={appendChild(){}};
campaign.exportDecisionsJSON();document.createElement=createElement;
const data=JSON.parse(decodeURIComponent(download.attributes.href.split(',').slice(1).join(',')));
assert.equal(data.versao,'1.1.0');assert.equal(data.nivel_campanha,0);assert.equal(data.total_turnos,4);assert.equal(data.configuracao_missao.turnos,4);
assert.equal(data.estatisticas_finais.casco_encalhado,false);
if(process.env.GHOST_ROUTE_CAMPAIGN_EXPORT)fs.writeFileSync(process.env.GHOST_ROUTE_CAMPAIGN_EXPORT,JSON.stringify(data,null,2)+'\n');
get('btn-next-level').click();assert.equal(campaign.levelNumber,1);assert.equal(campaign.state.isFinished,false);
assert.equal(campaign.replayModal.style.display,'none');assert.equal(campaign.missionMenu.hidden,true);
campaign.setHeading(270);while(!campaign.state.isFinished){while(campaign.introQueue.length)campaign.ackFeature();campaign.advanceTurn();}
assert.equal(campaign.completedLevels.has(1),false,'An unsuccessful mission cannot complete a level');
assert.equal(get('btn-next-level').hidden,true,'An unsuccessful mission cannot offer progression');
campaign.completedLevels.add(1);campaign.updateCampaignMenu();
assert.equal(get('btn-next-level').hidden,true,'An earlier completion must not turn the current failed attempt into a win');
campaign.changeLanguage('pt-BR');assert.equal(JSON.parse(saved.get('ghost-route.preferences')).language,'pt-BR');
campaign.changeLanguage('invalid');assert.equal(campaign.currentLang,'pt-BR');
campaign.beginCampaignLevel(99);assert.equal(campaign.levelNumber,99);assert.equal(campaign.state.maxTurns,12);assert.equal(campaign.state.remainingShots,3000);
console.log('PASS tutorial rescue, saved completion, campaign JSON, next-level transition, failed rescue and final-level selection');

// The primary menu action must honor a newly selected level on compact screens.
get('level-select').options=[{value:'99'},{value:'17'}];get('level-select').value='17';
campaign.openMissionMenu();
assert.equal(get('menu-primary-label').textContent,a.TEXTOS['pt-BR'].menuStartLevel);
get('btn-menu-primary').click();
assert.equal(campaign.levelNumber,17);assert.equal(campaign.state.turnsRecord.length,0);
assert.equal(campaign.missionMenu.hidden,true);
console.log('PASS primary menu action starts the selected campaign level');
