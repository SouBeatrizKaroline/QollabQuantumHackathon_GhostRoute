/* Optional browser companion to experience.cjs: readable, sequential tutorials. */
const assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../public/index.html')).href);
  for(const [width,height]of[[1336,605],[390,667],[320,568],[667,375]]){
   await page.setViewportSize({width,height});
   for(const language of['en','pt-BR','pt-PT','es']){
    const result=await page.evaluate(lang=>{
     const issues=[],check=()=>{
      const feature=document.getElementById('feature-intro'),sensor=document.getElementById('sensor-intro');
      if(!feature.hidden&&!sensor.hidden)issues.push('two explanations open');
      const card=document.querySelector('.feature-card'),r=card.getBoundingClientRect();
      if(!feature.hidden){
       if(r.left<0||r.right>innerWidth||r.top<0||r.bottom>innerHeight)issues.push('card outside screen');
       if(card.scrollWidth>card.clientWidth+1)issues.push('horizontal text overflow');
       if(!document.getElementById('feature-body').textContent)issues.push('empty translation');
      }
     };
     gameApp.changeLanguage(lang);gameApp.closeMissionMenu();gameApp.beginCampaignLevel(0);
     const steps=[];
     for(let turn=0;turn<4;turn++){
      steps.push(gameApp.introQueue[0]);check();
      const count=gameApp.state.turnsRecord.length;gameApp.advanceTurn();
      if(gameApp.state.turnsRecord.length!==count)issues.push('tutorial did not pause');
      gameApp.ackFeature();gameApp.setHeading(45);gameApp.advanceTurn();
     }
     if(!gameApp.completedLevels.has(0)||gameApp.state.isAground)issues.push('guided tutorial not rescued');
     for(let level=1;level<=4;level++){
      gameApp.seenFeatures=new Set();gameApp.beginCampaignLevel(level);gameApp.setHeading(45);
      if(gameApp.introQueue.length)issues.push('new mechanic in first calm missions');
      while(!gameApp.state.isFinished){
       gameApp.advanceTurn();
       if(gameApp.introQueue.length||!document.getElementById('sensor-intro').hidden)issues.push('unexpected popup during calm sensor practice');
      }
      if(!gameApp.completedLevels.has(level)||gameApp.state.isAground)issues.push('calm mission is not reachable using tutorial heading');
     }
     gameApp.seenFeatures=new Set();gameApp.beginCampaignLevel(35);
     gameApp.openSensorIntro();check(); // An active terrain card retains precedence.
     while(gameApp.introQueue.length){check();gameApp.ackFeature();}
     gameApp.openSensorIntro();gameApp.state.turnsRecord.push(...[1,2].map(turn=>({turn,gpsReported:[10,15],realAfter:[10,15]})));
     gameApp.introduceMission();check();
     if(gameApp.introQueue.length)issues.push('hazard card covered sensor explanation');
     gameApp.closeSensorIntro();check();
     if(!gameApp.introQueue.includes('jump'))issues.push('deferred attack explanation lost');
     while(gameApp.introQueue.length)gameApp.ackFeature();
     for(const key of['current','rocks','sandbank','jump','ghz','reef','blackout','ghost','drift','slalom','freeze','budget']){
      gameApp.queueIntro([key]);check();gameApp.ackFeature();
     }
     return {issues,steps};
    },language);
    assert.deepEqual(result.steps,['tutorial0','tutorial1','tutorial2','tutorial3']);
    assert.deepEqual(result.issues,[],`${width}x${height} ${language}`);
    console.log(`PASS tutorials ${width}x${height} ${language}`);
   }
  }
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
