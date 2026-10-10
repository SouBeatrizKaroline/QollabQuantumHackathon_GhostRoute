/* Rendering invariants: direction, stable anchor, upright mast and wraparound. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const engine=fs.readFileSync(path.join(__dirname,'../public/assets/js/engine.js'),'utf8');
const canvases=[];
const document={createElement(){const pixels=new Map();const ctx={fillStyle:'',fillRect(x,y,w,h){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)pixels.set(`${xx},${yy}`,this.fillStyle);}};const cv={width:0,height:0,pixels,getContext:()=>ctx};canvases.push(cv);return cv;}};
const context=vm.createContext({document,Math});
vm.runInContext(engine.slice(engine.indexOf('class PixelShipAtlas'),engine.indexOf('class TacticalMapRenderer'))+'\nthis.Atlas=PixelShipAtlas;',context);
const Atlas=context.Atlas,atlas=new Atlas();
assert.equal(atlas.frames.length,32);
assert.equal(new Set(atlas.frames.map(frame=>JSON.stringify([...frame.pixels]))).size,32,'Every view needs its own perspective');
for(const heading of[0,90,180,270,359,-1,720])assert.ok(Atlas.frameIndex(heading)>=0&&Atlas.frameIndex(heading)<32);
assert.equal(Atlas.frameIndex(0),Atlas.frameIndex(360));assert.equal(Atlas.frameIndex(-90),Atlas.frameIndex(270));
assert.equal(Atlas.turnDelta(350,10),20);assert.equal(Atlas.turnDelta(10,350),-20);
assert.equal(Atlas.turnDelta(1070,10),20);assert.equal(Atlas.turnDelta(-710,350),-20);
for(const frame of atlas.frames){
  assert.equal(frame.width,88);assert.equal(frame.height,88);
  const positions=[...frame.pixels.keys()].map(key=>key.split(',').map(Number));
  assert.ok(positions.every(([x,y])=>x>=0&&x<88&&y>=0&&y<88),'No perspective is cropped');
  assert.ok(frame.pixels.has('44,26'),'Mast tip stays upright and anchored at all headings');
  assert.ok(frame.pixels.size>200,'Detailed ship silhouette remains present');
}
// The cyan navigation lamp must be on the bow in every cardinal view.
for(const[heading,bow]of[[0,[44,24]],[90,[70,44]],[180,[44,64]],[270,[18,44]]]){
  assert.equal(atlas.frames[Atlas.frameIndex(heading)].pixels.get(bow.join(',')),'#baf9ed');
}
// The full-resolution "32-bit" atlas keeps the same invariants at twice the detail.
const hi=new Atlas(2);
assert.equal(new Set(hi.frames.map(frame=>JSON.stringify([...frame.pixels]))).size,32,'Every high-resolution view needs its own perspective');
for(const frame of hi.frames){
  assert.equal(frame.width,176);assert.equal(frame.height,176);
  const positions=[...frame.pixels.keys()].map(key=>key.split(',').map(Number));
  assert.ok(positions.every(([x,y])=>x>=0&&x<176&&y>=0&&y<176),'No high-resolution perspective is cropped');
  assert.ok(frame.pixels.has('88,52'),'High-resolution mast tip stays upright and anchored');
  assert.ok(frame.pixels.size>atlas.frames[0].pixels.size*3,'High-resolution sprite carries more detail');
}
for(const[heading,bow]of[[0,[88,47]],[90,[140,88]],[180,[88,129]],[270,[36,88]]]){
  assert.equal(hi.frames[Atlas.frameIndex(heading)].pixels.get(bow.join(',')),'#baf9ed');
}
console.log('PASS 32 distinct pixel views (88 px and 176 px), intact bounds, upright anchored mast, cardinal bow lights and shortest turns');
