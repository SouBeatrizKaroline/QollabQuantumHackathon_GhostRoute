const LEVEL_THEMES={
  'pt-BR':[['Primeira Viagem','Brisa','Maré','Farol','Eco','Sombra','Aurora','Tempestade','Abismo','Fantasma'],['do Porto','da Enseada','dos Corais','da Ilha','do Horizonte','da Lua','das Estrelas','da Névoa','do Silêncio','do Amanhecer']],
  'pt-PT':[['Primeira Viagem','Brisa','Maré','Farol','Eco','Sombra','Aurora','Tempestade','Abismo','Fantasma'],['do Porto','da Enseada','dos Corais','da Ilha','do Horizonte','da Lua','das Estrelas','do Nevoeiro','do Silêncio','do Amanhecer']],
  en:[['First Voyage','Breeze','Tide','Beacon','Echo','Shadow','Aurora','Storm','Abyss','Ghost'],['Harbor','Cove','Coral','Island','Horizon','Moon','Stars','Mist','Silence','Dawn']],
  es:[['Primer Viaje','Brisa','Marea','Faro','Eco','Sombra','Aurora','Tormenta','Abismo','Fantasma'],['del Puerto','de la Bahía','de los Corales','de la Isla','del Horizonte','de la Luna','de las Estrellas','de la Niebla','del Silencio','del Amanecer']]
};
function campaignLevelName(level,lang){
  const [themes,places]=LEVEL_THEMES[lang]||LEVEL_THEMES.en;
  return lang==='en'?`${places[level%10]} ${themes[Math.floor(level/10)]}`:`${themes[Math.floor(level/10)]} ${places[level%10]}`;
}
function featureQueue(mission,seen){return mission.mecanicas.filter(key=>!['navigation','sensor','rescue'].includes(key)&&!seen.has(key));}
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
    if(key.startsWith('tutorial'))this.tutorialAcknowledged=Number(key.slice(-1));else this.seenFeatures.add(key);
    this.savePreferences();this.sound.play('click');
    if(this.introQueue.length){this.renderIntro();return;}
    document.getElementById('feature-intro').hidden=true;document.getElementById('game-shell').inert=!this.missionMenu.hidden;
    (this.introReturn?.isConnected?this.introReturn:this.btnAdvance).focus();
  };
  proto.introduceMission=function(){
    if(this.levelNumber===undefined||this.state.isFinished)return;
    if(this.levelNumber===0){const step=Math.min(this.state.turnsRecord.length,3);if(this.tutorialAcknowledged!==step)this.queueIntro(['tutorial'+step]);}
    else this.queueIntro(featureQueue(MISSAO,this.seenFeatures));
  };
  const start=proto.startNewGame;
  proto.startNewGame=function(seed){
    this.introQueue=[];this.tutorialAcknowledged=-1;document.getElementById('feature-intro').hidden=true;
    start.call(this,seed);
    const ghz=this.sensorModeSelect.querySelector('option[value="ghz"]');if(ghz){ghz.disabled=this.levelNumber<6;ghz.hidden=this.levelNumber<6;}
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
