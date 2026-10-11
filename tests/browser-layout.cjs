/* Optional real-browser regression: npm install --no-save playwright
   npx playwright install chromium; node tests/browser-layout.cjs
   PLAYWRIGHT_CHROMIUM_EXECUTABLE can select a local Chromium/Edge executable. */
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const sizes=process.env.GHOST_ROUTE_VIEWPORTS?JSON.parse(process.env.GHOST_ROUTE_VIEWPORTS):[[1920,1080],[1440,900],[1366,768],[1280,720],[1200,640],[1024,768],[900,600],[899,700],[851,600],[768,1024],[390,844],[390,667],[360,640],[320,568],[844,390],[667,375]];
const languages=['en','pt-BR','pt-PT','es'];
async function run(){
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../public/index.html')).href);
  for(const [width,height]of sizes){
   await page.setViewportSize({width,height});
   for(const language of languages){
    const label=`${width}x${height} ${language}`;
    await page.evaluate(lang=>{gameApp.openMissionMenu();document.querySelector('.menu-guide').open=false;gameApp.changeLanguage(lang);},language);
    const menu=await page.evaluate(()=>{
     const box=document.querySelector('.menu-box');
     return {vertical:box.scrollHeight-box.clientHeight,horizontal:box.scrollWidth-box.clientWidth,
      outer:document.querySelector('.mission-menu').scrollHeight-innerHeight,
      page:document.documentElement.scrollHeight-innerHeight};
    });
    assert.ok(menu.horizontal<=1,`${label}: menu horizontal overflow`);
    assert.ok(menu.outer<=1&&menu.page<=1,`${label}: background scroll while menu open`);
    // Small landscape/320px screens may need internal scrolling to retain legibility.
    if(height>=600&&width>=360)assert.ok(menu.vertical<=1,`${label}: unnecessary menu scroll (${menu.vertical}px)`);
    await page.locator('#level-select').selectOption('99');
    assert.equal(await page.locator('#menu-primary-label').textContent(),await page.evaluate(()=>TEXTOS[gameApp.currentLang].menuStartLevel));
    await page.locator('#btn-menu-primary').click();
    assert.equal(await page.evaluate(()=>gameApp.levelNumber),99,`${label}: primary starts selected level`);
    await page.evaluate(()=>{while(gameApp.introQueue.length)gameApp.ackFeature();gameApp.beginCampaignLevel(0);while(gameApp.introQueue.length)gameApp.ackFeature();});
    const overlaps=await page.evaluate(()=>{
     const selectors=['.hud-top','.utility','.telemetry-strip','.navigation-dock','.bottom-status'];
     const problems=[];
     for(const selector of selectors){
      const parent=document.querySelector(selector),r=parent.getBoundingClientRect();
      for(const el of parent.querySelectorAll('button:not([hidden]),select,.mission-line')){
       const s=getComputedStyle(el),b=el.getBoundingClientRect();if(!b.width||s.display==='none')continue;
       if(b.left<r.left-1||b.right>r.right+1||b.top<r.top-1||b.bottom>r.bottom+1)problems.push(selector+' clips '+(el.id||el.className));
      }
     }
     const controls=[...document.querySelectorAll('.navigation-dock button,.navigation-dock select,.navigation-dock input')].filter(e=>e.getClientRects().length);
     for(let i=0;i<controls.length;i++)for(let j=i+1;j<controls.length;j++){
      const a=controls[i].getBoundingClientRect(),b=controls[j].getBoundingClientRect();
      if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)problems.push('controls overlap: '+controls[i].id+' / '+controls[j].id);
     }
     return problems;
    });
    assert.deepEqual(overlaps,[],`${label}: controls/readings outside their frame`);
    await page.locator('#btn-radio-toggle').click();
    const radio=await page.evaluate(()=>{const r=document.querySelector('.radio-widget').getBoundingClientRect(),d=document.querySelector('.navigation-dock').getBoundingClientRect();return Math.min(r.right,d.right)-Math.max(r.left,d.left)>1&&Math.min(r.bottom,d.bottom)-Math.max(r.top,d.top)>1;});
    assert.equal(radio,false,`${label}: radio covers helm`);
    await page.locator('#btn-radio-toggle').click();
    await page.evaluate(()=>{gameApp.openMissionMenu();document.querySelector('.menu-guide').open=true;});
    await page.locator('#btn-menu-export').scrollIntoViewIfNeeded();
    assert.equal(await page.locator('#btn-menu-export').isVisible(),true,`${label}: expanded help accessible`);
    await page.evaluate(()=>document.querySelector('.menu-guide').open=false);
    console.log('PASS '+label);
   }
  }
  assert.deepEqual(errors,[],'No page execution errors');
 }finally{await browser.close();}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
