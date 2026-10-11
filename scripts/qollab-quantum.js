// One reference experiment per Run. Campaign measurements remain analytical.
const ghostQollabCopy = {
  'pt-BR': ['Sensor Qiskit · Simple / GHZ', 'A campanha usa uma simulação educativa. Esta experiência separada usa o backend escolhido no Qollab. O progresso fica disponível só nesta execução.', 'Executando um circuito de 8 qubits, 1000 shots…', 'A experiência Qiskit falhou. Veja o console; selecione um simulador local e execute novamente. O jogo permanece disponível.'],
  'pt-PT': ['Sensor Qiskit · Simple / GHZ', 'A campanha usa uma simulação educativa. Esta experiência separada usa o backend escolhido no Qollab. O progresso fica disponível só nesta execução.', 'A executar um circuito de 8 qubits, 1000 shots…', 'A experiência Qiskit falhou. Consulte a consola; selecione um simulador local e execute novamente. O jogo permanece disponível.'],
  en: ['Qiskit sensor · Simple / GHZ', 'The campaign uses an educational simulation. This separate experiment uses the selected Qollab backend. Progress lasts only for this run.', 'Running one 8-qubit circuit, 1000 shots…', 'Qiskit experiment failed. Check the console; select a local simulator and run again. The game remains playable.'],
  es: ['Sensor Qiskit · Simple / GHZ', 'La campaña usa una simulación educativa. Este experimento separado usa el backend seleccionado en Qollab. El progreso dura solo esta ejecución.', 'Ejecutando un circuito de 8 qubits, 1000 shots…', 'El experimento Qiskit falló. Consulte la consola; seleccione un simulador local y ejecute de nuevo. El juego sigue disponible.']
};
let ghostQuantumReport = null;
let ghostQuantumFailed = false;
function refreshGhostQuantumReport() {
  const copy = ghostQollabCopy[window.gameApp.currentLang] || ghostQollabCopy.en;
  document.getElementById('qollab-summary').textContent = copy[0];
  document.getElementById('qollab-note').textContent = copy[1];
  document.getElementById('qollab-result').textContent = ghostQuantumReport || copy[ghostQuantumFailed ? 3 : 2];
}
const ghostOriginalLocalization = GhostRouteApp.prototype.updateLocalization;
GhostRouteApp.prototype.updateLocalization = function() {
  ghostOriginalLocalization.call(this);
  refreshGhostQuantumReport();
};
refreshGhostQuantumReport();

async function runGhostQuantumReference() {
  const phi = 1.1, shots = 1000;
  const circuit = QuantumCircuit(8, 4);
  const blocks = [{q:[0],c:0,n:1,axis:'X'}, {q:[1],c:1,n:1,axis:'Y'},
    {q:[2,3,4],c:2,n:3,axis:'X'}, {q:[5,6,7],c:3,n:3,axis:'Y'}];
  for (const block of blocks) {
    const first = block.q[0];
    circuit.h(first);
    for (const q of block.q.slice(1)) circuit.cx(first, q);
    for (const q of block.q) circuit.rz(phi, q);
    for (const q of block.q.slice(1).reverse()) circuit.cx(first, q);
    if (block.axis === 'Y') circuit.sdg(first);
    circuit.h(first);
    circuit.measure(first, block.c);
  }
  // Use the user's backend; submit exactly one job, including on IonQ.
  const job = await backend.run(circuit, {shots});
  const counts = (await job.result()).get_counts().toJs();
  const entries = counts instanceof Map ? [...counts.entries()] : Object.entries(counts);
  const ones = [0,0,0,0];
  let total = 0;
  for (const [key, count] of entries) {
    const compact = String(key).replace(/\s/g, '');
    if (!/^[01]{4}$/.test(compact) || !Number.isInteger(count) || count < 0) throw Error('Invalid measurement counts');
    total += count;
    for (let bit=0;bit<4;bit++) if (compact[compact.length-1-bit] === '1') ones[bit] += count;
  }
  if (total !== shots) throw Error('Backend count total differs from requested shots');
  const lines = ['Ghost Route — QuantGirls', 'One circuit · 8 qubits · ' + shots + ' shots', 'Reference phase: ' + phi + ' rad'];
  for (const [offset,n,label] of [[0,1,'Simple'],[2,3,'GHZ']]) {
    const angle = (Math.atan2(1-2*ones[offset+1]/shots,1-2*ones[offset]/shots)+2*Math.PI)%(2*Math.PI);
    const candidates = Array.from({length:n},(_,k)=>(angle+2*Math.PI*k)/n);
    lines.push(label + ': X1=' + ones[offset] + '/' + shots + ', Y1=' + ones[offset+1] + '/' + shots);
    lines.push('P_X(1)=' + ((1-Math.cos(n*phi))/2).toFixed(4) + ', P_Y(1)=' + ((1-Math.sin(n*phi))/2).toFixed(4));
    lines.push('Phase candidates (rad): ' + candidates.map(x=>x.toFixed(4)).join(', '));
  }
  ghostQuantumReport = lines.join('\n');
  refreshGhostQuantumReport();
  console.log(ghostQuantumReport);
}
try { await runGhostQuantumReference(); }
catch (error) {
  ghostQuantumFailed = true;
  refreshGhostQuantumReport();
  console.error('Ghost Route Qiskit: ' + (error?.message || String(error)));
}
