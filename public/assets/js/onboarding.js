// Authored titles follow the actual learning and route milestones, in level order.
const LEVEL_NAMES={
  "pt-BR": [
    "Primeira viagem",
    "Águas tranquilas",
    "Rumo à Aurora",
    "Ler o mar",
    "Confiança no rumo",
    "Primeira corrente",
    "Corrigir o rumo",
    "Medir e ajustar",
    "Acompanhar a corrente",
    "Equilíbrio no mar",
    "Primeiro desvio",
    "Contornar a pedra",
    "Curva suave",
    "Espaço para manobrar",
    "Rota entre pedras",
    "Olhar adiante",
    "Manobra cuidadosa",
    "Ler antes de virar",
    "Traçar uma curva",
    "Rumo sob controle",
    "Mar aberto, rota livre",
    "Escolher o desvio",
    "Entre curvas e leituras",
    "Preparar a manobra",
    "Caminho seguro",
    "Primeira passagem",
    "Entre bancos de areia",
    "Encontrar a abertura",
    "Curva na passagem",
    "Além do banco",
    "De volta ao mar aberto",
    "Leituras em movimento",
    "Contorno planejado",
    "Rota e estimativa",
    "Preparar a travessia",
    "Primeiro sinal falso",
    "Passagem sob suspeita",
    "Conferir os instrumentos",
    "Curva com evidências",
    "Além do GPS",
    "Sinais em mar aberto",
    "Comparar para navegar",
    "Rumo com incerteza",
    "Desvio do sinal falso",
    "Leituras independentes",
    "Conhecer o GHZ",
    "Sensibilidade na passagem",
    "Fases e caminhos",
    "Resolver a ambiguidade",
    "Comparar modos",
    "GHZ em mar aberto",
    "Histórico e leitura",
    "Escolher a evidência",
    "Sensibilidade com cuidado",
    "Preparar duas curvas",
    "Segunda passagem",
    "Entre areia e recife",
    "Aberturas alternadas",
    "Uma curva de cada vez",
    "Travessia do recife",
    "Horizonte aberto",
    "Pedras e evidências",
    "Rumo bem estimado",
    "Manobra entre sinais",
    "Leitura para o resgate",
    "Silêncio na reentrada",
    "Rumo à elipse",
    "Esperar o sinal",
    "Travessia sem contato",
    "Reencontrar a Aurora",
    "Primeira Aurora-fantasma",
    "Dois sinais no horizonte",
    "Procurar a Aurora real",
    "Evidências para o resgate",
    "Entre ecos e pedras",
    "Primeira deriva falsa",
    "Erro que se acumula",
    "Corrigir entre passagens",
    "Rastrear o desvio",
    "Curvas sob engano",
    "Ecos em mar aberto",
    "Conferir a trajetória",
    "Estimar sob pressão",
    "Separar os sinais",
    "Preparar o slalom",
    "Terceira passagem",
    "Três curvas no mar",
    "Slalom entre sinais",
    "Alternar com precisão",
    "Travessia em três etapas",
    "Primeiro GPS congelado",
    "Navio em movimento",
    "Detectar a posição parada",
    "Leituras sob engano",
    "Último mar aberto",
    "Cada medição conta",
    "Precisão nas passagens",
    "Últimas curvas",
    "Resgate sob pressão",
    "Rota fantasma final"
  ],
  "pt-PT": [
    "Primeira viagem",
    "Águas tranquilas",
    "Rumo à Aurora",
    "Ler o mar",
    "Confiança no rumo",
    "Primeira corrente",
    "Corrigir o rumo",
    "Medir e ajustar",
    "Acompanhar a corrente",
    "Equilíbrio no mar",
    "Primeiro desvio",
    "Contornar a pedra",
    "Curva suave",
    "Espaço para manobrar",
    "Rota entre pedras",
    "Olhar adiante",
    "Manobra cuidadosa",
    "Ler antes de virar",
    "Traçar uma curva",
    "Rumo sob controlo",
    "Mar aberto, rota livre",
    "Escolher o desvio",
    "Entre curvas e leituras",
    "Preparar a manobra",
    "Caminho seguro",
    "Primeira passagem",
    "Entre bancos de areia",
    "Encontrar a abertura",
    "Curva na passagem",
    "Além do banco",
    "De volta ao mar aberto",
    "Leituras em movimento",
    "Contorno planeado",
    "Rota e estimativa",
    "Preparar a travessia",
    "Primeiro sinal falso",
    "Passagem sob suspeita",
    "Conferir os instrumentos",
    "Curva com evidências",
    "Além do GPS",
    "Sinais em mar aberto",
    "Comparar para navegar",
    "Rumo com incerteza",
    "Desvio do sinal falso",
    "Leituras independentes",
    "Conhecer o GHZ",
    "Sensibilidade na passagem",
    "Fases e caminhos",
    "Resolver a ambiguidade",
    "Comparar modos",
    "GHZ em mar aberto",
    "Histórico e leitura",
    "Escolher a evidência",
    "Sensibilidade com cuidado",
    "Preparar duas curvas",
    "Segunda passagem",
    "Entre areia e recife",
    "Aberturas alternadas",
    "Uma curva de cada vez",
    "Travessia do recife",
    "Horizonte aberto",
    "Pedras e evidências",
    "Rumo bem estimado",
    "Manobra entre sinais",
    "Leitura para o resgate",
    "Silêncio na reentrada",
    "Rumo à elipse",
    "Esperar o sinal",
    "Travessia sem contato",
    "Reencontrar a Aurora",
    "Primeira Aurora-fantasma",
    "Dois sinais no horizonte",
    "Procurar a Aurora real",
    "Evidências para o resgate",
    "Entre ecos e pedras",
    "Primeira deriva falsa",
    "Erro que se acumula",
    "Corrigir entre passagens",
    "Rastrear o desvio",
    "Curvas sob engano",
    "Ecos em mar aberto",
    "Conferir a trajetória",
    "Estimar sob pressão",
    "Separar os sinais",
    "Preparar o slalom",
    "Terceira passagem",
    "Três curvas no mar",
    "Slalom entre sinais",
    "Alternar com precisão",
    "Travessia em três etapas",
    "Primeiro GPS congelado",
    "Navio em movimento",
    "Detectar a posição parada",
    "Leituras sob engano",
    "Último mar aberto",
    "Cada medição conta",
    "Precisão nas passagens",
    "Últimas curvas",
    "Resgate sob pressão",
    "Rota fantasma final"
  ],
  "en": [
    "First Voyage",
    "Quiet Waters",
    "Heading for Aurora",
    "Reading the Sea",
    "Trust Your Heading",
    "First Current",
    "Course Correction",
    "Measure and Adjust",
    "Follow the Current",
    "Balance at Sea",
    "First Detour",
    "Around the Rock",
    "Gentle Turn",
    "Room to Turn",
    "Route among Rocks",
    "Look Ahead",
    "Careful Maneuver",
    "Read before Turning",
    "Plot a Curve",
    "Heading in Hand",
    "Open Sea, Free Course",
    "Choose the Detour",
    "Turns and Readings",
    "Prepare the Turn",
    "Safe Course",
    "First Passage",
    "Between Sandbanks",
    "Find the Opening",
    "Turn through the Gap",
    "Beyond the Sandbank",
    "Back to Open Water",
    "Readings on the Move",
    "Planned Detour",
    "Course and Estimate",
    "Prepare the Crossing",
    "First False Signal",
    "Suspect Passage",
    "Check the Instruments",
    "Turn with Evidence",
    "Beyond GPS",
    "Signals on Open Water",
    "Compare to Navigate",
    "Heading with Uncertainty",
    "Past the False Signal",
    "Independent Readings",
    "Meet GHZ",
    "Sensitivity in the Gap",
    "Phases and Paths",
    "Resolve Ambiguity",
    "Compare Modes",
    "GHZ on Open Water",
    "History and Reading",
    "Choose the Evidence",
    "Careful Sensitivity",
    "Prepare Two Turns",
    "Second Passage",
    "Sand and Reef",
    "Alternating Gaps",
    "One Turn at a Time",
    "Reef Crossing",
    "Open Horizon",
    "Rocks and Evidence",
    "A Well Estimated Course",
    "Maneuver among Signals",
    "Read for Rescue",
    "Reentry Silence",
    "Heading for the Ellipse",
    "Wait for the Signal",
    "Crossing without Contact",
    "Find Aurora Again",
    "First Ghost Aurora",
    "Two Horizon Signals",
    "Seek the Real Aurora",
    "Evidence for Rescue",
    "Echoes and Rocks",
    "First False Drift",
    "Error Adds Up",
    "Correct between Gaps",
    "Track the Offset",
    "Turns under Deception",
    "Open Water Echoes",
    "Check the Trajectory",
    "Estimate under Pressure",
    "Separate the Signals",
    "Prepare the Slalom",
    "Third Passage",
    "Three Turns at Sea",
    "Slalom among Signals",
    "Alternate with Precision",
    "Three Stage Crossing",
    "First Frozen GPS",
    "Ship in Motion",
    "Spot the Stuck Position",
    "Readings under Deception",
    "Last Open Water",
    "Every Shot Counts",
    "Precision through Gaps",
    "Final Turns",
    "Rescue under Pressure",
    "Final Ghost Route"
  ],
  "es": [
    "Primer viaje",
    "Aguas tranquilas",
    "Rumbo a Aurora",
    "Leer el mar",
    "Confianza en el rumbo",
    "Primera corriente",
    "Corregir el rumbo",
    "Medir y ajustar",
    "Seguir la corriente",
    "Equilibrio en el mar",
    "Primer desvío",
    "Rodear la roca",
    "Curva suave",
    "Espacio para maniobrar",
    "Ruta entre rocas",
    "Mirar adelante",
    "Maniobra cuidadosa",
    "Leer antes de girar",
    "Trazar una curva",
    "Rumbo bajo control",
    "Mar abierto, ruta libre",
    "Elegir el desvío",
    "Curvas y lecturas",
    "Preparar la maniobra",
    "Camino seguro",
    "Primer paso",
    "Entre bancos de arena",
    "Encontrar la abertura",
    "Curva en el paso",
    "Más allá del banco",
    "Vuelta al mar abierto",
    "Lecturas en movimiento",
    "Desvío planeado",
    "Ruta y estimación",
    "Preparar la travesía",
    "Primera señal falsa",
    "Paso bajo sospecha",
    "Revisar los instrumentos",
    "Curva con evidencias",
    "Más allá del GPS",
    "Señales en mar abierto",
    "Comparar para navegar",
    "Rumbo con incertidumbre",
    "Desvío de la señal falsa",
    "Lecturas independientes",
    "Conocer GHZ",
    "Sensibilidad en el paso",
    "Fases y caminos",
    "Resolver la ambigüedad",
    "Comparar modos",
    "GHZ en mar abierto",
    "Historial y lectura",
    "Elegir la evidencia",
    "Sensibilidad con cuidado",
    "Preparar dos curvas",
    "Segundo paso",
    "Arena y arrecife",
    "Aberturas alternadas",
    "Una curva a la vez",
    "Travesía del arrecife",
    "Horizonte abierto",
    "Rocas y evidencias",
    "Rumbo bien estimado",
    "Maniobra entre señales",
    "Lectura para el rescate",
    "Silencio en la reentrada",
    "Rumbo a la elipse",
    "Esperar la señal",
    "Travesía sin contacto",
    "Reencontrar Aurora",
    "Primera Aurora fantasma",
    "Dos señales en el horizonte",
    "Buscar la Aurora real",
    "Evidencias para el rescate",
    "Ecos y rocas",
    "Primera deriva falsa",
    "Error que se acumula",
    "Corregir entre pasos",
    "Rastrear el desvío",
    "Curvas bajo engaño",
    "Ecos en mar abierto",
    "Revisar la trayectoria",
    "Estimar bajo presión",
    "Separar las señales",
    "Preparar el eslalon",
    "Tercer paso",
    "Tres curvas en el mar",
    "Eslalon entre señales",
    "Alternar con precisión",
    "Travesía en tres etapas",
    "Primer GPS congelado",
    "Barco en movimiento",
    "Detectar la posición inmóvil",
    "Lecturas bajo engaño",
    "Último mar abierto",
    "Cada medición cuenta",
    "Precisión en los pasos",
    "Últimas curvas",
    "Rescate bajo presión",
    "Ruta fantasma final"
  ]
};
function campaignLevelName(level,lang){
  return (LEVEL_NAMES[lang]||LEVEL_NAMES.en)[level];
}
function featureQueue(mission,seen){return mission.mecanicas.filter(key=>!['navigation','sensor','rescue'].includes(key)&&!seen.has(key));}
// Introduce timed hazards just before their first affected move, instead of
// making a player who skips levels read every future event at departure.
function scheduledFeatures(mission,seen,completedTurns,record){
  const next=completedTurns+1,types={jump:'salto',drift:'deriva',freeze:'congelamento'};
  return featureQueue(mission,seen).filter(key=>{
    // Teach the false beacon when it is actually visible, including a late
    // drift/freeze after reentry. An early jump may happen while Aurora is hidden.
    if(key==='ghost')return !!record&&record.turn>=mission.capsula.turno_revelacao&&
      mission.ataques.some(attack=>record.turn>=attack.inicio&&record.turn<=attack.fim)&&
      Math.hypot(...record.gpsReported.map((v,i)=>v-record.realAfter[i]))>=1.5;
    if(key==='blackout')return mission.capsula.turno_blackout_inicio>0&&next>=mission.capsula.turno_blackout_inicio;
    if(types[key])return mission.ataques.some(attack=>attack.tipo===types[key]&&next>=attack.inicio);
    return true;
  });
}
function installMissionExperience(App){
  const proto=App.prototype;
  const bind=proto.bindEvents;
  proto.bindEvents=function(){
    bind.call(this);
    const prefs=readPreferences();this.sound=new GhostRouteAudio(prefs.sound!==false);this.experienceReady=false;
    this.seenFeatures=new Set(Array.isArray(prefs.features)?prefs.features:[]);this.introQueue=[];
    const box=document.getElementById('feature-intro');
    document.getElementById('btn-feature-ok').addEventListener('click',()=>this.ackFeature());
    document.getElementById('btn-sound').addEventListener('click',async()=>{this.sound.setEnabled(!this.sound.enabled);await this.sound.unlock();this.sound.play('click');this.savePreferences();this.updateSoundLabel();});
    document.addEventListener('pointerdown',()=>{this.sound.unlock();},{passive:true});
    document.addEventListener('keydown',()=>{this.sound.unlock();},{capture:true});
    window.addEventListener('keydown',event=>{
      if(box.hidden)return;
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();this.ackFeature();}
      else if(event.key==='Tab'){event.preventDefault();document.getElementById('btn-feature-ok').focus();}
      else if(!box.contains(event.target)){event.preventDefault();event.stopImmediatePropagation();}
    },true);
    this.chkSuspicious.addEventListener('change',()=>this.sound.play('mark'));
    this.sensorModeSelect.addEventListener('change',()=>{
      if(this.sensorModeSelect.value==='ghz'&&!this.seenFeatures.has('ghz'))this.queueIntro(['ghz']);
    });
  };
  proto.updateSoundLabel=function(){const button=document.getElementById('btn-sound');if(!button||!this.sound)return;button.textContent=TEXTOS[this.currentLang][this.sound.enabled?'soundOn':'soundOff'];button.setAttribute('aria-pressed',String(this.sound.enabled));};
  const save=proto.savePreferences;
  proto.savePreferences=function(){save.call(this);try{const p=readPreferences();p.sound=this.sound?.enabled!==false;p.features=[...(this.seenFeatures||[])];window.localStorage.setItem('ghost-route.preferences',JSON.stringify(p));}catch{}};
  const localize=proto.updateLocalization;
  proto.updateLocalization=function(){localize.call(this);this.updateSoundLabel();this.renderIntro();};
  proto.renderIntro=function(){
    if(!this.introQueue?.length)return;
    const t=TEXTOS[this.currentLang],key=this.introQueue[0],step=Number(key.slice(-1));
    document.getElementById('feature-title').textContent=key.startsWith('tutorial')?`${t.trainingMode} · ${step+1}/4`:t['feature_'+key+'_title'];
    document.getElementById('feature-body').textContent=key.startsWith('tutorial')?fillText(t[['tutorialHeading','tutorialSensor','tutorialGps','tutorialRescue'][step]],{radius:numberText(MISSAO.vitoria.raio_resgate_km,this.currentLang)}):t['feature_'+key+'_body'];
    document.getElementById('feature-step').textContent=`${fillText(t.levelName,{level:String(this.levelNumber).padStart(2,'0')})} · ${campaignLevelName(this.levelNumber,this.currentLang)}`;
  };
  proto.queueIntro=function(keys){
    const box=document.getElementById('feature-intro');
    if(!this.introQueue.length)this.introReturn=document.activeElement;
    this.introQueue.push(...keys.filter(key=>!this.introQueue.includes(key)));if(!this.introQueue.length)return;
    box.hidden=false;document.getElementById('game-shell').inert=true;this.renderIntro();document.getElementById('btn-feature-ok').focus();this.sound?.play('intro');
  };
  proto.ackFeature=function(){
    const key=this.introQueue.shift();if(!key)return;
    if(key.startsWith('tutorial')){
      this.tutorialAcknowledged=Number(key.slice(-1));
      if(key==='tutorial1')try{window.localStorage.setItem('ghost-route.sensor-intro-seen','1');}catch{}
    }else this.seenFeatures.add(key);
    this.savePreferences();this.sound.play('click');
    if(this.introQueue.length){this.renderIntro();return;}
    document.getElementById('feature-intro').hidden=true;document.getElementById('game-shell').inert=!this.missionMenu.hidden;
    (this.introReturn?.isConnected?this.introReturn:this.btnAdvance).focus();
  };
  proto.introduceMission=function(){
    if(this.levelNumber===undefined||this.state.isFinished)return;
    if(!document.getElementById('sensor-intro').hidden)return;
    if(this.levelNumber===0){const step=Math.min(this.state.turnsRecord.length,3);if(this.tutorialAcknowledged!==step)this.queueIntro(['tutorial'+step]);}
    else this.queueIntro(scheduledFeatures(MISSAO,this.seenFeatures,this.state.turnsRecord.length,this.state.turnsRecord.at(-1)));
  };
  const start=proto.startNewGame;
  proto.startNewGame=function(seed){
    this.introQueue=[];this.tutorialAcknowledged=-1;document.getElementById('feature-intro').hidden=true;
    start.call(this,seed);
    const ghz=this.sensorModeSelect.querySelector('option[value="ghz"]');if(ghz){ghz.disabled=this.levelNumber<45;ghz.hidden=this.levelNumber<45;}
    if(this.experienceReady&&this.missionMenu?.hidden)this.introduceMission();
  };
  const close=proto.closeMissionMenu;
  proto.closeMissionMenu=function(){close.call(this);this.experienceReady=true;this.introduceMission();};
  const advance=proto.advanceTurn;
  proto.advanceTurn=function(){
    if(this.introQueue.length||!document.getElementById('sensor-intro').hidden)return;
    const previous=this.state.turnsRecord.length,finished=this.state.isFinished;advance.call(this);
    if(this.state.turnsRecord.length===previous||finished)return;
    const rec=this.state.turnsRecord.at(-1);
    if(this.state.isFinished)this.sound.play(this.state.isAground||Math.hypot(...this.state.realPosition.map((v,i)=>v-MISSAO.capsula.pouso_real[i]))>MISSAO.vitoria.raio_resgate_km?'failure':'rescue');
    else{this.sound.play(!rec.gpsInsideHPD?'alert':rec.shots?'sensor':'move');this.introduceMission();}
  };
}
