const fs = require('node:fs');
const path = require('node:path');
const source = path.resolve(__dirname, '..');
const out = path.resolve(process.argv[2] || path.join(source, 'dist/qollab-js'));
fs.mkdirSync(out, { recursive: true });
const read = name => fs.readFileSync(path.join(source, name), 'utf8');
let html = read('public/index.html').split('<body>')[1].split('</body>')[0];
html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
const mark = 'data:image/svg+xml;base64,' + Buffer.from(read('public/assets/img/ghost-route-mark.svg')).toString('base64');
html = html.replaceAll('assets/img/ghost-route-mark.svg', mark);
html = html.replace('<details class="menu-guide">', `<details class="qollab-report"><summary id="qollab-summary">Qiskit · Simple / GHZ</summary><p id="qollab-note"></p><pre id="qollab-result" role="status" aria-live="polite"></pre></details><details class="menu-guide">`);
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.writeFileSync(path.join(out, 'main.css'), read('public/assets/css/game.css') + '\n.qollab-report{margin:8px 0;padding:8px;border:1px solid #7da8b6;background:#120f2b;color:#fff1de;font-weight:400}.qollab-report summary{cursor:pointer;font-weight:bold}.qollab-report p{font-size:11px;margin-top:6px}.qollab-report pre{font:11px/1.4 monospace;white-space:pre-wrap;overflow-wrap:anywhere;margin:6px 0}\n');
const storage = `// Qollab has no persistent storage. Retain preferences within this run only.
const ghostSessionValues = new Map();
const ghostSessionStorage = {
  getItem(key) { return ghostSessionValues.get(String(key)) ?? null; },
  setItem(key, value) { ghostSessionValues.set(String(key), String(value)); }
};\n`;
const scripts = ['i18n', 'engine', 'audio', 'onboarding', 'app', 'console-decor'].map(name => {
  let code = read('public/assets/js/' + name + '.js').replaceAll('window.localStorage', 'ghostSessionStorage');
  if (name === 'app') {
    const startup = "if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startGhostRoute,{once:true});\nelse startGhostRoute();";
    if (!code.includes(startup)) throw Error('Startup changed; review bundle ordering.');
    code = code.replace(startup, '// Start after all prototype extensions have been installed.');
    code = code.replace('    const jsonStr = "data:text/json;charset=utf-8,"', `    if (typeof sendFile === 'function') {
      sendFile('ghost_route_seed_' + this.seed + '_decisions.json', 'application/json', JSON.stringify(exportData, null, 2));
      return;
    }
    const jsonStr = "data:text/json;charset=utf-8,"`);
  }
  return '\n// --- ' + name + '.js ---\n' + code;
}).join('\n');
const quantum = fs.readFileSync(path.join(__dirname, 'qollab-quantum.js'), 'utf8');
const main = "import { QuantumCircuit } from 'qiskit';\n" + storage + scripts + `
// Qollab injects the HTML before executing main.js.
startGhostRoute();
` + quantum;
fs.writeFileSync(path.join(out, 'main.js'), main);
fs.writeFileSync(path.join(out, 'requirements.txt'), 'qiskit>=2.5.2,<3.0.0\n');
fs.copyFileSync(path.join(source, 'LICENSE'), path.join(out, 'LICENSE'));
fs.copyFileSync(path.join(source, 'docs/qollab-playable.md'), path.join(out, 'README.md'));
console.log(JSON.stringify({out, files:fs.readdirSync(out), mainBytes:Buffer.byteLength(main)}));
