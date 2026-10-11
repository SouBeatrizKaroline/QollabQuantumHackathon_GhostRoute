/* Real-browser regressions for sensor availability and mission end flows. */
const assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../public/index.html')).href);
  for(const [width,height]of[[1366,768],[1336,605],[320,568],[667,375]]){
   await page.setViewportSize({width,height});
   for(const lang of['en','pt-BR','pt-PT','es']){
    await page.evaluate(lang=>{
     gameApp.changeLanguage(lang);gameApp.beginCampaignLevel(1);
     while(gameApp.introQueue.length)gameApp.ackFeature();
     gameApp.setHeading(45);
     while(!gameApp.state.isFinished)gameApp.advanceTurn();
    },lang);
    assert.equal(await page.locator('#sensor-mode-select option[value="ghz"]').isDisabled(),true);
    assert.equal(await page.locator('#btn-replay-mark-final').isVisible(),true);
    await page.locator('#btn-replay-mark-final').click();
    assert.equal(await page.locator('#val-rep-false').textContent(),'1');
    assert.equal(await page.locator('#btn-replay-mark-final').getAttribute('aria-pressed'),'true');
    await page.locator('#btn-replay-mark-final').click();
    assert.equal(await page.locator('#val-rep-false').textContent(),'0');
    await page.locator('#scrubber-range').evaluate(el=>{el.value='1';el.dispatchEvent(new Event('input',{bubbles:true}));});
    assert.equal(await page.locator('#btn-replay-mark-final').isVisible(),false);
    const downloadEvent=page.waitForEvent('download');
    await page.locator('#btn-export-json').click();
    const download=await downloadEvent;assert.equal(await download.failure(),null);
    const layout=await page.evaluate(()=>{
     const box=document.querySelector('.replay-box'),r=box.getBoundingClientRect();
     return {horizontal:box.scrollWidth-box.clientWidth,inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight};
    });
    assert.ok(layout.horizontal<=1&&layout.inside,`${width}x${height} ${lang}: readable replay`);
    await page.locator('#btn-close-replay').click();
    await page.locator('#btn-sensor-help').click();
    const help=await page.evaluate(()=>{
     const box=document.querySelector('.sensor-intro-box'),r=box.getBoundingClientRect();
     return {horizontal:box.scrollWidth-box.clientWidth,inside:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight};
    });
    assert.ok(help.horizontal<=1&&help.inside,`${width}x${height} ${lang}: readable sensor help`);
    await page.locator('#btn-sensor-intro-ok').click();
    await page.evaluate(()=>{
     gameApp.beginCampaignLevel(1);gameApp.setHeading(270);
     while(!gameApp.state.isFinished)gameApp.advanceTurn();
    });
    assert.ok((await page.locator('#outcome-banner').textContent()).includes(await page.evaluate(()=>numberText(MISSAO.vitoria.raio_resgate_km,gameApp.currentLang)+' km')));
    assert.equal(await page.locator('#btn-next-level').isVisible(),false);
    await page.evaluate(()=>{
     gameApp.beginCampaignLevel(45);while(gameApp.introQueue.length)gameApp.ackFeature();gameApp.updateTelemetryUI();
    });
    assert.equal(await page.locator('#sensor-mode-select option[value="ghz"]').isDisabled(),false);
    await page.evaluate(()=>{gameApp.state.remainingShots=0;gameApp.updateTelemetryUI();});
    assert.equal(await page.locator('#sensor-mode-select').inputValue(),'none');
    assert.equal(await page.locator('#sensor-mode-select option[value="ghz"]').isDisabled(),true);
    await page.evaluate(()=>{gameApp.beginCampaignLevel(44);while(gameApp.introQueue.length)gameApp.ackFeature();gameApp.updateTelemetryUI();});
    assert.equal(await page.locator('#sensor-mode-select option[value="ghz"]').isDisabled(),true);
    console.log(`PASS mission results, export, sensor help and GHZ ${width}x${height} ${lang}`);
   }
  }
  assert.deepEqual(errors,[],'No browser execution errors');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
