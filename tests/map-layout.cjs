/* Keep the complete chart outside visible panels, including notices. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../public/assets/js/engine.js'),'utf8');
const rect=(x,y,width,height)=>({x,y,left:x,top:y,right:x+width,bottom:y+height,width,height});
let panels={};
const context=vm.createContext({Math,document:{querySelector:selector=>panels[selector]?{getBoundingClientRect:()=>panels[selector]}:null},getComputedStyle:()=>({display:'block'})});
vm.runInContext(source.slice(source.indexOf('class TacticalMapRenderer'),source.indexOf('// Original 5 × 7 bitmap lettering'))+'\nthis.Renderer=TacticalMapRenderer;',context);
const Renderer=context.Renderer;
const cases=[
 {size:[1366,768],panels:{'.hud-top':rect(14,12,1338,84),'.navigation-dock':rect(143,547,1080,177),'.utility':rect(934,109,412,35),'.telemetry-strip':rect(1012,155,334,49),'.compass-widget':rect(20,111,126,148),'.radar-widget':rect(20,273,154,160),'.radio-widget':rect(194,298,266,234),'.chart-legend':rect(1106,364,240,167)}},
 {size:[390,844],panels:{'.hud-top':rect(9,8,372,136),'.navigation-dock':rect(12,579,366,222),'.telemetry-strip':rect(107,204,271,45),'.compass-widget':rect(12,157,83,101),'.radio-widget':rect(12,270,173,48)}},
 {size:[390,667],panels:{'.hud-top':rect(9,8,372,108),'.navigation-dock':rect(12,402,366,222),'.telemetry-strip':rect(148.5,128,229.5,44),'.radio-widget':rect(12,128,124.5,43)}},
 {size:[844,390],panels:{'.hud-top':rect(8,6,828,68),'.navigation-dock':rect(434,132,398,215),'.telemetry-strip':rect(12,84,294,43),'.radio-widget':rect(434,84,155,38)}},
 {size:[768,1024],panels:{'.hud-top':rect(9,8,750,124),'.navigation-dock':rect(12,765,744,216),'.telemetry-strip':rect(436,195,320,49),'.compass-widget':rect(12,146,96,114),'.radio-widget':rect(12,273,173,48)}}
];
const intersects=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
for(const fixture of cases){
 panels=fixture.panels;
 const renderer=Object.create(Renderer.prototype),[width,height]=fixture.size;
 renderer.canvas={getBoundingClientRect:()=>rect(0,0,width,height)};renderer.ctx={};renderer.makeOcean=()=>{};
 renderer.resize();
 const chart=rect(renderer.ox*2,renderer.oy*2,renderer.chartSize*2,renderer.chartSize*2);
 assert.ok(chart.width>=120,'Small layouts must retain a usable chart');
 assert.ok(chart.left>=0&&chart.right<=width&&chart.top>=0&&chart.bottom<=height);
 for(const[selector,panel]of Object.entries(panels))assert.equal(intersects(chart,panel),false,`${width}×${height}: chart obscured by ${selector}`);
 for(const[x,y]of[[0,0],[10,15],[100,100],[57.5,32.25]]){
  const point=renderer.worldToScreen(x,y),back=renderer.screenToWorld(point.sx,point.sy);
  assert.ok(Math.abs(back[0]-x)<1e-10&&Math.abs(back[1]-y)<1e-10,'Projection remains reversible');
 }
 // Extra notice rows grow the bottom dock and reduce the chart safely.
 if(width===390){
  panels['.navigation-dock']=rect(12,fixture.panels['.navigation-dock'].top-56,366,278);
  renderer.resize();
  assert.ok((renderer.oy+renderer.chartSize)*2<panels['.navigation-dock'].top);
 }
}
const labels=Object.create(Renderer.prototype);
labels.ctx={measureText:value=>({width:value.length*4})};labels.ox=10;labels.oy=10;labels.chartSize=150;labels.labelBoxes=[{left:35,right:55,top:115,bottom:135}];labels.mapLabels=[];
labels.mapLabel('SPOOFED',62,127,'#fff');
labels.mapLabel('AURORA-1',70,127,'#fff');
assert.equal(intersects(labels.labelBoxes[1],labels.labelBoxes[0]),false,'The ship name must avoid its silhouette');
assert.equal(intersects(labels.labelBoxes[2],labels.labelBoxes[1]),false,'Destination and ship names must remain separate');
labels.mapLabel('A LONG WARNING THAT NEEDS TO WRAP ON A SMALL CHART',90,45,'#fff');
assert.ok(labels.mapLabels.every(label=>label.x>=labels.ox&&label.x+label.label.length*4<=labels.ox+labels.chartSize&&label.y>=labels.oy&&label.y<=labels.oy+labels.chartSize));
console.log('PASS five viewport projections, panel/notice separation, reversible coordinates and readable map labels');
