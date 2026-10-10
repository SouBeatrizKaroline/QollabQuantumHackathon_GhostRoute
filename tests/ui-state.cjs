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
vm.runInContext(read('i18n.js')+'\n'+engine+'\n'+app+'\nthis.API={GhostRouteApp,BayesianGridEstimator,TEXTOS};',context);
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
