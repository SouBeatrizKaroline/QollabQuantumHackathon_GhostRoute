const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '..');
execFileSync(process.execPath, [path.join(root, 'scripts/package_qollab_js.cjs')]);
const dir = path.join(root, 'dist/qollab-js');
const html = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(dir, 'main.css'), 'utf8');
const script = fs.readFileSync(path.join(dir, 'main.js'), 'utf8');
assert.ok(!/<script\b|<html\b|<head\b|<body\b/i.test(html));
assert.ok(!/assets\//.test(html));
assert.ok(!script.includes('window.localStorage'));
for (const name of fs.readdirSync(dir)) assert.ok(fs.statSync(path.join(dir,name)).size < 2*1024*1024);
assert.ok(fs.readdirSync(dir).length <= 100);

// Test double: validate the gates submitted, return analytically constructed counts.
// It does not claim to execute Qiskit or access the Qollab backend.
function fixture(mode) {
  window.testJobs = [];
  window.testFiles = [];
  window.sendFile = (name, mime, content) => window.testFiles.push({name,mime,content});
  const QuantumCircuit = (qubits, bits) => {
    const circuit = {qubits,bits,ops:[]};
    for (const gate of ['h','cx','rz','sdg','measure']) circuit[gate]=(...args)=>circuit.ops.push([gate,...args]);
    return circuit;
  };
  const backend = {async run(circuit, options) {
    window.testJobs.push({circuit,options});
    if (mode === 'failure') throw Error('Injected backend failure');
    const p=[(1-Math.cos(1.1))/2,(1-Math.sin(1.1))/2,(1-Math.cos(3.3))/2,(1-Math.sin(3.3))/2];
    const entries=Array.from({length:16},(_,value)=>{
      const weight=p.reduce((product,prob,bit)=>product*((value>>bit)&1 ? prob : 1-prob),1);
      return [value.toString(2).padStart(4,'0'),Math.floor(weight*options.shots)];
    });
    entries[0][1] += options.shots-entries.reduce((sum,[key,count])=>sum+count,0);
    const counts=mode==='map'?new Map(entries):Object.fromEntries(entries);
    return {async result(){return {get_counts(){return {toJs(){return counts;}};}};}};
  }};
  return {QuantumCircuit,backend};
}

(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try {
  for(const mode of ['object','map','failure']) {
   const page=await browser.newPage({viewport:{width:1336,height:605}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const code=script.replace("import { QuantumCircuit } from 'qiskit';",'') + '\nwindow.qollabTest={preferences:()=>readPreferences(),mission:()=>MISSAO};';
   const loader=`const fixture=${fixture.toString()};const deps=fixture(${JSON.stringify(mode)});const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;new AsyncFunction('QuantumCircuit','backend',${JSON.stringify(code)})(deps.QuantumCircuit,deps.backend).then(()=>window.testReady=true).catch(e=>{window.testError=e.stack;});`;
   await page.setContent('<iframe id="game" sandbox="allow-scripts" style="border:0;position:absolute;inset:0;width:100%;height:100%"></iframe>');
   await page.locator('#game').evaluate((el,content)=>el.srcdoc=content, '<!doctype html><style>'+css+'</style>'+html+'<script>'+loader.replaceAll('</script','<\\/script')+'</script>');
   const frame=page.frames().find(f=>f.parentFrame());
   await frame.waitForFunction(()=>window.testReady||window.testError,{timeout:30000});
   assert.equal(await frame.evaluate(()=>window.testError),undefined);
   assert.equal(await frame.evaluate(()=>{try{window.localStorage.getItem('x');return false;}catch{return true;}}),true,'opaque frame must deny storage');
   const jobs=await frame.evaluate(()=>window.testJobs);
   assert.equal(jobs.length,1);assert.equal(jobs[0].circuit.qubits,8);assert.equal(jobs[0].circuit.bits,4);assert.equal(jobs[0].options.shots,1000);
   const expected=[];
   for(const block of [{q:[0],c:0,y:false},{q:[1],c:1,y:true},{q:[2,3,4],c:2,y:false},{q:[5,6,7],c:3,y:true}]) {
    const first=block.q[0];expected.push(['h',first]);
    for(const q of block.q.slice(1))expected.push(['cx',first,q]);
    for(const q of block.q)expected.push(['rz',1.1,q]);
    for(const q of block.q.slice(1).reverse())expected.push(['cx',first,q]);
    if(block.y)expected.push(['sdg',first]);
    expected.push(['h',first],['measure',first,block.c]);
   }
   assert.deepEqual(jobs[0].circuit.ops,expected);
   const result=await frame.locator('#qollab-result').textContent();
   if(mode==='failure')assert.ok(result.includes('falhou'));
   else {assert.ok(result.includes('Simple:'));assert.ok(result.includes('GHZ:'));assert.ok(result.includes('P_X(1)=0.2732'));}
   for(const [width,height] of [[1336,605],[390,667],[667,375]]) {
    await page.setViewportSize({width,height});
    for(const lang of ['en','pt-BR','pt-PT','es']) {
     const played=await frame.evaluate(lang=>{
      const app=window.gameApp;
      app.changeLanguage(lang);app.closeMissionMenu();app.beginCampaignLevel(0);
      for(let turn=0;turn<4;turn++) {while(app.introQueue.length)app.ackFeature();app.setHeading(45);app.advanceTurn();}
      app.exportDecisionsJSON();
      app.savePreferences();
      return {completed:app.completedLevels.has(0),turns:app.state.turnsRecord.length,aground:app.state.isAground,
       language:window.qollabTest.preferences().language,translations:document.getElementById('qollab-note').textContent,
       files:window.testFiles.length, menu:document.querySelector('.mission-menu').scrollWidth<=innerWidth+1};
     },lang);
     assert.ok(played.completed,`${mode} ${lang} ${width}x${height}: tutorial rescue`);
     assert.equal(played.aground,false);assert.equal(played.turns,4);assert.equal(played.language,lang);assert.ok(played.menu);assert.ok(played.translations.length>40);
    }
   }
   const exported=await frame.evaluate(()=>JSON.parse(window.testFiles.at(-1).content));
   assert.equal(exported.total_turnos,4);
   assert.equal(await frame.evaluate(()=>window.testJobs.length),1,'gameplay must not submit extra jobs');
   assert.deepEqual(errors,[]);
   if(mode==='object')await page.screenshot({path:path.join(root,'dist/qollab-js-proof.png')});
   console.log('PASS sandbox, circuit, tutorial, languages, session preferences and JSON export: '+mode);
   await page.close();
  }
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
