class GhostRouteApp {
  constructor() {
    this.renderer = new TacticalMapRenderer('map-canvas');
    this.avatarCtx = document.getElementById('avatar-canvas').getContext('2d');
    this.estimator = new BayesianGridEstimator();

    const preferences = readPreferences();
    this.currentLang = Object.hasOwn(TEXTOS,preferences.language) ? preferences.language : 'pt-BR';
    this.levelNumber = Number.isInteger(preferences.level) && preferences.level>=0 && preferences.level<=99 ? preferences.level : 0;
    this.completedLevels = new Set(Array.isArray(preferences.completed) ? preferences.completed.filter(n=>Number.isInteger(n)&&n>=0&&n<=99) : []);
    this.debugMode = false;
    this.seed = 20261011 + this.levelNumber * 7919;

    this.initDOM();
    this.bindEvents();

    // Run sensor self-test
    autotesteSensor();

    this.startNewGame(this.seed);
    this.openMissionMenu();
  }

  initDOM() {
    this.langSelect = document.getElementById('lang-select');
    this.headingSlider = document.getElementById('heading-slider');
    this.sliderValDisplay = document.getElementById('slider-val-display');
    this.sensorModeSelect = document.getElementById('sensor-mode-select');
    this.sensorShotsSelect = document.getElementById('sensor-shots-select');
    this.chkSuspicious = document.getElementById('chk-suspicious');
    this.btnAdvance = document.getElementById('btn-advance');
    this.btnRestart = document.getElementById('btn-restart');
    this.btnNextTut = document.getElementById('btn-next-tutorial');
    this.dialogueNav = document.getElementById('dialogue-nav');
    this.debugBadge = document.getElementById('debug-badge');
    this.liveAnnouncer = document.getElementById('live-announcer');

    this.alertReef = document.getElementById('alert-reef');
    this.alertGps = document.getElementById('alert-gps');

    // Replay Modal
    this.replayModal = document.getElementById('replay-modal');
    this.btnCloseReplay = document.getElementById('btn-close-replay');
    this.scrubberRange = document.getElementById('scrubber-range');
    this.btnReplaySame = document.getElementById('btn-replay-same');
    this.btnReplayNew = document.getElementById('btn-replay-new');
    this.btnExportJson = document.getElementById('btn-export-json');

    this.dirButtons = Array.from(document.querySelectorAll('.btn-dir'));
  }

  bindEvents() {
    this.langSelect.addEventListener('change', (e) => {
      this.changeLanguage(e.target.value);
    });

    this.headingSlider.addEventListener('input', (e) => {
      this.setHeading(parseInt(e.target.value, 10));
    });

    this.dirButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setHeading(parseInt(btn.dataset.deg, 10));
      });
    });

    this.btnAdvance.addEventListener('click', () => this.advanceTurn());
    this.btnRestart.addEventListener('click', () => this.startNewGame(this.seed));

    this.btnNextTut.addEventListener('click', () => {
      this.dialogueNav.style.display = 'none';
      this.dialogueStep++;
      this.updateNarrative();
    });

    this.btnCloseReplay.addEventListener('click', () => {
      this.replayModal.style.display = 'none';
    });

    this.scrubberRange.addEventListener('input', (e) => {
      this.renderScrubberTurn(parseInt(e.target.value, 10));
    });

    this.btnReplaySame.addEventListener('click', () => {
      this.replayModal.style.display = 'none';
      this.startNewGame(this.seed);
    });

    this.btnReplayNew.addEventListener('click', () => {
      this.replayModal.style.display = 'none';
      this.startNewGame(Math.floor(Math.random() * 9000000) + 1000000);
    });

    this.btnExportJson.addEventListener('click', () => this.exportDecisionsJSON());

    window.addEventListener('keydown', (e) => {
      if (this.missionMenu && !this.missionMenu.hidden) return;
      if (e.target.closest('input, select, button') || e.target.isContentEditable) return;
      if (this.replayModal.style.display === 'flex') return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.advanceTurn();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.setHeading((this.state.currentHeading + 5) % 360);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.setHeading((this.state.currentHeading - 5 + 360) % 360);
      } else if (e.key === 'd' || e.key === 'D') {
        this.toggleDebug();
      } else if (e.key === 'r' || e.key === 'R') {
        this.startNewGame(this.seed);
      }
    });
  }

  startNewGame(seed) {
    this.seed = seed;
    this.currentRng = mulberry32(this.seed);
    this.sensorRng = mulberry32(this.seed ^ 0xA5A5A5A5);

    this.state = {
      currentTurn: 1,
      maxTurns: MISSAO.turnos,
      currentHeading: 45,
      remainingShots: MISSAO.sensor.shots_total,
      totalDistanceKm: 0.0,
      realPosition: [...MISSAO.porto],
      gpsPosition: [...MISSAO.porto],
      inertialPosition: [...MISSAO.porto],
      inertialRadiusKm: MISSAO.inercial.erro_inicial_km,
      estimatorPosition: this.worldToScreenCoords(MISSAO.porto[0], MISSAO.porto[1]),
      realHistory: [[...MISSAO.porto]],
      gpsHistory: [[...MISSAO.porto]],
      inertialHistory: [[...MISSAO.porto]],
      turnsRecord: [],
      isAground: false,
      isFinished: false
    };

    this.driftAccum = [0.0, 0.0];
    this.frozenGpsPos = null;
    this.dialogueStep = 0;

    this.estimator.reset();
    this.setHeading(45);
    this.updateLocalization();
    this.updateTelemetryUI();
    this.updateNarrative();

    this.renderMap();
    this.announce(TEXTOS[this.currentLang].missionStarted);
  }

  worldToScreenCoords(wx, wy) {
    return this.renderer.worldToScreen(wx, wy);
  }

  setHeading(deg) {
    this.state.currentHeading = deg;
    this.headingSlider.value = deg;
    const dirName = getDirectionName(deg);
    this.sliderValDisplay.textContent = `${formatHeading(deg)} (${dirName})`;

    this.dirButtons.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.deg, 10) === deg);
    });

    this.updateTelemetryUI();
    this.renderMap();
  }

  advanceTurn() {
    if (this.state.isFinished) {
      this.openReplayModal();
      return;
    }

    const turn = this.state.currentTurn;

    // 1. Commanded movement + current noise
    const commanded = headingToVector(this.state.currentHeading, MISSAO.navio.velocidade_km_turno);
    const noiseX = gaussianRandom(this.currentRng) * MISSAO.navio.ruido_corrente_km;
    const noiseY = gaussianRandom(this.currentRng) * MISSAO.navio.ruido_corrente_km;

    const prevReal = [...this.state.realPosition];
    const nextReal = [
      Math.max(0, Math.min(100, prevReal[0] + commanded.dx + noiseX)),
      Math.max(0, Math.min(100, prevReal[1] + commanded.dy + noiseY))
    ];

    // 2. Check collision with reef segment
    if (hitsObstacle(prevReal, nextReal)) {
      this.state.isAground = true;

    }

    this.state.realPosition = nextReal;
    this.state.realHistory.push([...nextReal]);
    this.state.totalDistanceKm += Math.hypot(nextReal[0]-prevReal[0], nextReal[1]-prevReal[1]);

    // 3. Move inertial dead-reckoning
    this.state.inertialPosition = [
      Math.max(0, Math.min(100, this.state.inertialPosition[0] + commanded.dx)),
      Math.max(0, Math.min(100, this.state.inertialPosition[1] + commanded.dy))
    ];
    this.state.inertialRadiusKm = MISSAO.inercial.erro_inicial_km + MISSAO.inercial.crescimento_km_turno * turn;
    this.state.inertialHistory.push([...this.state.inertialPosition]);

    // 4. Apply GPS Spoofing Attacks
    let reportedGPS = [...nextReal];
    const attacks = activeAttacks(turn), jump = attacks.find(a=>a.tipo==='salto'), drift = attacks.find(a=>a.tipo==='deriva');
    if (jump) {
      reportedGPS[0] += jump.deslocamento_km[0];
      reportedGPS[1] += jump.deslocamento_km[1];
    }
    if (drift) {
      this.driftAccum[0] += drift.km_por_turno[0];
      this.driftAccum[1] += drift.km_por_turno[1];
      reportedGPS[0] += this.driftAccum[0];
      reportedGPS[1] += this.driftAccum[1];
    } else {
      this.driftAccum = [0.0, 0.0]; // Drift resets when attack ends
    }

    // Freeze attack (Turns 9 and 10)
    if (attacks.some(a=>a.tipo==='congelamento')) {
      if (!this.frozenGpsPos) {
        this.frozenGpsPos = [...this.state.gpsHistory[this.state.gpsHistory.length - 1]]; // Turn 8 displayed position
      }
      if (this.frozenGpsPos) {
        reportedGPS = [...this.frozenGpsPos];
      }
    } else {
      this.frozenGpsPos = null;
    }

    this.state.gpsPosition = [
      Math.max(0, Math.min(100, reportedGPS[0])),
      Math.max(0, Math.min(100, reportedGPS[1]))
    ];
    this.state.gpsHistory.push([...this.state.gpsPosition]);

    // 5. Predict Bayesian Estimator
    this.estimator.predict(commanded.dx, commanded.dy);

    // 6. Sensor Reading & Update
    const mode = this.state.isAground ? 'none' : this.sensorModeSelect.value;
    const requestedShots = parseInt(this.sensorShotsSelect.value, 10);
    let actualShots = 0;
    let kX = 0, kY = 0, NX = 0, NY = 0;
    let phaseCandidates = [];

    if (mode !== 'none' && this.state.remainingShots >= requestedShots) {
      actualShots = requestedShots;
      this.state.remainingShots -= actualShots;
      const n = (mode === 'ghz') ? 3 : 1;
      NX = Math.floor(actualShots / 2);
      NY = Math.floor(actualShots / 2);

      const realPhi = calcPhi(this.state.realPosition[0], this.state.realPosition[1]);
      const { pX, pY } = getRamseyProbabilities(realPhi, n);

      kX = sampleBinomial(NX, pX, this.sensorRng);
      kY = sampleBinomial(NY, pY, this.sensorRng);

      phaseCandidates = reconstructPhaseCandidates(kX, NX, kY, NY, n);
      this.estimator.update(kX, NX, kY, NY, n);
    }

    // Calculate MAP estimate
    const mapCoords = this.estimator.getMAP();
    this.state.estimatorPosition = this.worldToScreenCoords(mapCoords[0], mapCoords[1]);

    // Check HPD 95% discrepancy with GPS
    const hpdSet = this.estimator.getHPD95();
    const gpsInside = this.estimator.isGPSInsideHPD(this.state.gpsPosition[0], this.state.gpsPosition[1], hpdSet);
    this.alertGps.style.display = gpsInside ? 'none' : 'block';

    // Check Reef Proximity (< 3 km from MAP)
    const reefDist = distToObstacles(mapCoords);
    this.alertReef.style.display = (reefDist < 3.0) ? 'block' : 'none';

    // Record turn decision data
    this.recordTurnDecisions(commanded, prevReal, nextReal, kX, NX, kY, NY, mode, actualShots, phaseCandidates, gpsInside);

    // Advance Turn Counter
    const rescued = this.levelNumber !== undefined && Math.hypot(nextReal[0]-MISSAO.capsula.pouso_real[0],nextReal[1]-MISSAO.capsula.pouso_real[1])<=MISSAO.vitoria.raio_resgate_km;
    if (this.state.isAground || rescued || turn >= this.state.maxTurns) {
      this.state.isFinished = true;
      this.openReplayModal();
    } else {
      this.state.currentTurn++;
    }

    // Reset turn suspicion mark
    this.chkSuspicious.checked = false;

    this.updateTelemetryUI();
    this.updateNarrative();
    this.renderMap();
  }

  recordTurnDecisions(commanded, prevReal, nextReal, kX, NX, kY, NY, mode, shots, phaseCandidates, gpsInside) {
    this.state.turnsRecord.push({
      turn: this.state.currentTurn,
      heading: this.state.currentHeading,
      commanded: { ...commanded },
      realBefore: [...prevReal],
      realAfter: [...nextReal],
      gpsReported: [...this.state.gpsPosition],
      inertial: [...this.state.inertialPosition],
      sensorMode: mode,
      shots: shots,
      kX: kX, NX: NX, kY: kY, NY: NY,
      phaseCandidates: phaseCandidates || [],
      markedSuspicious: false,
      gpsInsideHPD: gpsInside,
      remainingShots: this.state.remainingShots
    });
  }

  updateTelemetryUI() {
    const t = TEXTOS[this.currentLang];
    document.getElementById('val-turn').textContent = `${this.state.currentTurn} / ${this.state.maxTurns}`;

    const elapsedMins = (this.state.currentTurn - 1) * MISSAO.minutos_por_turno;
    const hrs = String(Math.floor(elapsedMins / 60)).padStart(2, '0');
    const mins = String(elapsedMins % 60).padStart(2, '0');
    document.getElementById('val-time').textContent = `${hrs}:${mins}`;

    document.getElementById('val-pos').textContent = `[${this.state.gpsPosition[0].toFixed(1)}, ${this.state.gpsPosition[1].toFixed(1)}]`;
    document.getElementById('val-heading').textContent = `${formatHeading(this.state.currentHeading)} (${getDirectionName(this.state.currentHeading)})`;
    document.getElementById('val-dist').textContent = `${this.state.totalDistanceKm.toFixed(1)} km`;

    // Shot Budget Bar
    const budgetElem = document.getElementById('val-budget');
    const fillElem = document.getElementById('budget-bar-fill');
    budgetElem.textContent = `${this.state.remainingShots} / ${MISSAO.sensor.shots_total}`;
    const pct = Math.max(0, (this.state.remainingShots / MISSAO.sensor.shots_total) * 100);
    fillElem.style.width = `${pct}%`;
    fillElem.classList.toggle('warn', this.state.remainingShots < 1000);

    // Disable shot options exceeding budget
    Array.from(this.sensorShotsSelect.options).forEach(opt => {
      const s = parseInt(opt.value, 10);
      opt.disabled = s > this.state.remainingShots;
    });
  }

  updateNarrative() {
    const t = TEXTOS[this.currentLang];
    const turn = this.state.currentTurn;
    let speaker = t.speakerQuoora;
    let role = t.roleQuoora;
    let text = "";
    let expr = "neutral";

    if (turn === 1) {
      speaker = t.speakerHelena;
      role = t.roleHelena;
      text = t.diaTurn1;
      expr = "thoughtful";
      if (this.dialogueStep === 0) {
        this.dialogueNav.style.display = 'flex';
      } else {
        speaker = t.speakerQuoora;
        role = t.roleQuoora;
        text = t.tut1;
        expr = "happy";
      }
    } else if (turn === 2) {
      speaker = t.speakerHelena;
      role = t.roleHelena;
      text = t.diaTurn2;
      expr = "worried";
    } else if (turn === 3) {
      speaker = t.speakerQuoora;
      role = t.roleQuoora;
      text = t.tut3;
      expr = "thoughtful";
    } else if (turn === 4) {
      speaker = t.speakerHelena;
      role = t.roleHelena;
      text = t.diaTurn4;
      expr = "alert";
    } else if (turn === 5) {
      speaker = t.speakerHelena;
      role = t.roleHelena;
      text = t.diaTurn5;
      expr = "neutral";
    } else if (turn === 6) {
      speaker = t.speakerQuoora;
      role = t.roleQuoora;
      text = t.diaTurn6;
      expr = "worried";
    } else if (turn === 7) {
      speaker = t.speakerQuoora;
      role = t.roleQuoora;
      text = t.diaTurn7;
      expr = "thoughtful";
    } else if (turn === 8) {
      speaker = t.speakerAna;
      role = t.roleAstronaut;
      text = fillText(t.diaTurn8, {coords: MISSAO.capsula.pouso_real.map(v => Math.round(v)).join(', ')});
      expr = "happy";
    } else if (turn === 9) {
      speaker = t.speakerHelena;
      role = t.roleHelena;
      text = t.diaTurn9;
      expr = "thoughtful";
    } else if (turn === 10) {
      speaker = t.speakerKenji;
      role = t.roleAstronaut;
      text = t.diaTurn10;
      expr = "worried";
    } else if (turn === 11) {
      speaker = t.speakerQuoora;
      role = t.roleQuoora;
      text = t.diaTurn11;
      expr = "happy";
    } else if (turn === 12) {
      speaker = t.speakerHelena;
      role = t.roleHelena;
      text = t.diaTurn12Rescued;
      expr = "alert";
    }

    document.getElementById('speaker-name').textContent = speaker;
    document.getElementById('speaker-role').textContent = role;
    document.getElementById('dialogue-box').textContent = text;
    AssetRegistry.drawQuooraAvatar(this.avatarCtx, expr);
  }

  openReplayModal() {
    const t = TEXTOS[this.currentLang];
    this.replayModal.style.display = 'flex';

    // Calculate final scores
    let attacksDetected = 0;
    let falseAlarms = 0;

    const encounteredAttacks = MISSAO.ataques.filter(a=>this.state.turnsRecord.some(r=>r.turn>=a.inicio&&r.turn<=a.fim));
    attacksDetected = encounteredAttacks.filter(a=>this.state.turnsRecord.some(r=>r.markedSuspicious&&r.turn>=a.inicio&&r.turn<=a.fim)).length;
    const honestMarks = this.state.turnsRecord.filter(r => !activeAttacks(r.turn).length && r.markedSuspicious);
    falseAlarms = honestMarks.length;

    // Final capsule distance
    const dx = this.state.realPosition[0] - MISSAO.capsula.pouso_real[0];
    const dy = this.state.realPosition[1] - MISSAO.capsula.pouso_real[1];
    const finalDist = Math.hypot(dx, dy);

    document.getElementById('val-rep-score').textContent = `${attacksDetected} / ${encounteredAttacks.length}`;
    document.getElementById('val-rep-false').textContent = `${falseAlarms}`;
    document.getElementById('val-rep-dist').textContent = `${finalDist.toFixed(1)} km`;
    document.getElementById('val-rep-shots').textContent = `${this.state.remainingShots}`;

    // Determine Ending
    const banner = document.getElementById('outcome-banner');
    banner.className = "outcome-banner";

    if (this.state.isAground) {
      banner.classList.add("outcome-aground");
      banner.textContent = t.endingAground;
    } else if (finalDist <= MISSAO.vitoria.raio_resgate_km) {
      if (encounteredAttacks.length === 0) {
        banner.classList.add('outcome-rescue');
        banner.textContent = fillText(t.levelCompleted,{level:String(this.levelNumber).padStart(2,'0')}) + ' · AURORA-1 ✓';
      } else if (attacksDetected === encounteredAttacks.length) {
        banner.classList.add("outcome-perfect");
        banner.textContent = t.endingPerfect;
      } else {
        banner.classList.add("outcome-rescue");
        banner.textContent = t.endingRescue;
      }
    } else {
      banner.classList.add("outcome-deceived");
      banner.textContent = fillText(t.endingDeceived,{radius:numberText(MISSAO.vitoria.raio_resgate_km,this.currentLang)});
    }

    this.scrubberRange.max = this.state.turnsRecord.length;
    this.scrubberRange.value = this.state.turnsRecord.length;
    this.renderScrubberTurn(this.state.turnsRecord.length);
  }


  exportDecisionsJSON() {
    const exportData = {
      projeto: "Ghost Route",
      versao: this.levelNumber === undefined ? "1.0.0" : "1.1.0",
      ...(this.levelNumber === undefined ? {} : {nivel_campanha:this.levelNumber}),
      hackathon: "Qollab x IonQ Quantum Hackathon 2026",
      equipe: "QuantGirls",
      atribuicao: "This effort is supported by Qollab & IonQ",
      semente: this.seed,
      configuracao_missao: MISSAO,
      total_turnos: this.state.turnsRecord.length,
      registros_turnos: this.state.turnsRecord,
      estatisticas_finais: {
        distancia_capsula_km: Math.hypot(
          this.state.realPosition[0] - MISSAO.capsula.pouso_real[0],
          this.state.realPosition[1] - MISSAO.capsula.pouso_real[1]
        ),
        shots_economizados: this.state.remainingShots,
        casco_encalhado: this.state.isAground
      }
    };

    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", jsonStr);
    dlAnchor.setAttribute("download", `ghost_route_seed_${this.seed}_decisions.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }

  toggleDebug() {
    this.debugMode = !this.debugMode;
    this.debugBadge.style.display = this.debugMode ? 'inline-block' : 'none';
    this.renderMap();
  }

  renderMap() {
    this.renderer.render(this.state, this.estimator, this.state.isFinished, this.debugMode);
  }

  updateLocalization() {
    const t = TEXTOS[this.currentLang];
    document.getElementById('app-title').textContent = t.appTitle;
    document.getElementById('mission-badge').textContent = t.missionBadge;
    document.getElementById('lbl-language').textContent = t.languageLabel;
    document.getElementById('txt-restart').textContent = t.restart;
    document.getElementById('txt-map-title').textContent = t.mapTitle;
    document.getElementById('txt-grid-scale').textContent = t.gridScale;
    document.getElementById('legend-port').textContent = t.legendPort;
    document.getElementById('legend-ship').textContent = t.legendShip;
    document.getElementById('legend-gps').textContent = t.legendGps;
    document.getElementById('legend-heat').textContent = t.legendHeat;
    document.getElementById('legend-reef').textContent = t.legendReef;

    document.getElementById('txt-radio-title').textContent = t.radioTitle;
    document.getElementById('txt-telemetry-title').textContent = t.telemetryTitle;
    document.getElementById('lbl-turn').textContent = t.lblTurn;
    document.getElementById('lbl-time').textContent = t.lblTime;
    document.getElementById('lbl-pos').textContent = t.lblPos;
    document.getElementById('lbl-heading').textContent = t.lblHeading;
    document.getElementById('lbl-speed').textContent = t.lblSpeed;
    document.getElementById('lbl-dist').textContent = t.lblDist;
    document.getElementById('val-speed').textContent = t.speedValue;
    document.getElementById('lbl-budget').textContent = t.lblBudget;

    document.getElementById('txt-helm-title').textContent = t.helmTitle;
    document.getElementById('lbl-slider-heading').textContent = t.sliderHeading;
    document.getElementById('lbl-sensor-mode').textContent = t.lblSensorMode;
    document.getElementById('opt-mode-none').textContent = t.optModeNone;
    document.getElementById('opt-mode-simple').textContent = t.optModeSimple;
    document.getElementById('opt-mode-ghz').textContent = t.optModeGhz;
    document.getElementById('lbl-sensor-shots').textContent = t.lblSensorShots;
    document.getElementById('lbl-suspicious').textContent = t.lblSuspicious;
    document.getElementById('txt-advance').textContent = t.advanceTurn;
    document.getElementById('txt-shortcut-hint').textContent = t.shortcutHint;

    document.getElementById('alert-reef').textContent = t.alertReef;
    document.getElementById('alert-gps').textContent = t.alertGps;

    document.getElementById('replay-title-text').textContent = t.repTitle;
    document.getElementById('lbl-rep-score').textContent = t.lblRepScore;
    document.getElementById('lbl-rep-false').textContent = t.lblRepFalse;
    document.getElementById('lbl-rep-dist').textContent = t.lblRepDist;
    document.getElementById('lbl-rep-shots').textContent = t.lblRepShots;
    document.getElementById('lbl-scrubber').textContent = t.lblScrubber;
    document.getElementById('txt-btn-same').textContent = t.txtBtnSame;
    document.getElementById('txt-btn-new').textContent = t.txtBtnNew;
    document.getElementById('txt-btn-export').textContent = t.txtBtnExport;

    this.updateTelemetryUI();
    this.updateNarrative();
    this.renderMap();
  }

  announce(msg) {
    if (this.liveAnnouncer) this.liveAnnouncer.textContent = msg;
  }
}

// Fullscreen HUD controller. Sensor sampling stays offline; no Qiskit claim.
const fillText = (template, values) => String(template || '').replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
const numberText = (value, lang, digits=1) => new Intl.NumberFormat(lang, {minimumFractionDigits:digits, maximumFractionDigits:digits}).format(value);
const coordText = (p, lang) => `[${p.map(v => numberText(v, lang)).join(lang==='en'?', ':'; ')}]`;
const lastRecord = app => app.state.turnsRecord.at(-1);
const baseLocalization = GhostRouteApp.prototype.updateLocalization;
const baseTelemetry = GhostRouteApp.prototype.updateTelemetryUI;
const baseNarrative = GhostRouteApp.prototype.updateNarrative;
const baseStart = GhostRouteApp.prototype.startNewGame;
const baseReplay = GhostRouteApp.prototype.openReplayModal;
const baseBind = GhostRouteApp.prototype.bindEvents;

GhostRouteApp.prototype.updateLocalization = function () {
  document.documentElement.lang = this.currentLang;
  document.title = 'Ghost Route — QuantGirls';
  const t = TEXTOS[this.currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t[el.dataset.i18n]);
  document.querySelector('.utility').setAttribute('aria-label', t.gameSettings);
  document.querySelector('.navigation-dock').setAttribute('aria-label', t.navigationControls);
  this.headingSlider.setAttribute('aria-label', t.headingHelp);
  this.debugBadge.textContent = t.debugLabel;
  this.updateRadioLabel();
  const credit = document.getElementById('translated-credit');
  credit.textContent = t.attributionTranslated;
  credit.hidden = this.currentLang === 'en';
  this.liveAnnouncer.textContent = '';
  this.dirButtons.forEach(btn => {
    const west = this.currentLang === 'en' ? 'W' : 'O';
    btn.textContent = getDirectionName(Number(btn.dataset.deg)).replace('W', west);
    btn.setAttribute('aria-label', `${t.lblHeading} ${formatHeading(Number(btn.dataset.deg))}`);
  });
  baseLocalization.call(this);
  this.updateFullscreenLabel();
  if (this.state.isFinished) {
    const display = this.replayModal.style.display;
    const turn = Number(this.scrubberRange.value);
    baseReplay.call(this);
    this.replayModal.style.display = display;
    this.scrubberRange.value = turn;
    this.renderScrubberTurn(turn);
    this.updateNarrative();
    if (display !== 'flex') this.renderMap();
  }
};

GhostRouteApp.prototype.updateTelemetryUI = function () {
  baseTelemetry.call(this);
  const t = TEXTOS[this.currentLang], rec = lastRecord(this);
  const direction = getDirectionName(this.state.currentHeading).replace('W',this.currentLang==='en'?'W':'O');
  const headingText = `${formatHeading(this.state.currentHeading)} (${direction})`;
  this.sliderValDisplay.textContent = headingText;
  document.getElementById('val-heading').textContent = headingText;
  document.getElementById('val-pos').textContent = coordText(this.state.gpsPosition, this.currentLang);
  document.getElementById('val-dist').textContent = `${numberText(this.state.totalDistanceKm, this.currentLang)} km`;
  document.getElementById('val-budget').textContent = `${numberText(this.state.remainingShots, this.currentLang,0)} / ${numberText(MISSAO.sensor.shots_total, this.currentLang,0)}`;
  const completed = this.state.turnsRecord.length;
  document.getElementById('val-time').textContent = `${String(Math.floor(completed * MISSAO.minutos_por_turno / 60)).padStart(2,'0')}:${String(completed * MISSAO.minutos_por_turno % 60).padStart(2,'0')}`;
  const aligned = rec?.gpsInsideHPD;
  const gpsStatus = document.getElementById('gps-status');
  gpsStatus.textContent = !rec ? t.gpsPending : aligned ? t.gpsAligned : t.gpsMismatch;
  gpsStatus.style.color = !rec ? '#e6d8ef' : aligned ? '#a6e8a0' : '#ff8f86';
  const gpsMeter = document.getElementById('gps-meter');
  gpsMeter.style.width = !rec ? '0%' : '100%';
  gpsMeter.style.background = aligned ? 'linear-gradient(#ffd08a,#e8891f)' : 'linear-gradient(#ff9a8a,#c9344a)';
  document.getElementById('hull-status').textContent = this.state.isAground ? t.hullGrounded : t.hullIntact;
  document.getElementById('hull-status').style.color = this.state.isAground ? '#ff8f86' : '#a6e8a0';
  const reading = rec?.shots ? fillText(t.observedReading, {turn:rec.turn, shots:numberText(rec.shots,this.currentLang,0), mode:rec.sensorMode==='ghz'?t.modeGhz:t.modeSimple}) : rec ? t.sensorOffReading : t.readingNone;
  const exhausted = this.state.remainingShots < 100;
  document.getElementById('last-reading').textContent = reading + (exhausted && !this.state.isFinished ? ' ' + t.budgetExhausted : '');
  document.getElementById('lbl-suspicious').textContent = rec ? fillText(t.observedMark,{turn:rec.turn}) : t.lblSuspicious;
  this.chkSuspicious.disabled = !rec || this.state.isFinished;
  this.chkSuspicious.checked = Boolean(rec?.markedSuspicious);
  document.getElementById('txt-advance').textContent = this.state.isFinished ? t.btnViewReplay : t.advanceTurn;
  const map = this.estimator.getMAP();
  const target = completed >= MISSAO.capsula.turno_revelacao ? MISSAO.capsula.pouso_real : MISSAO.capsula.elipse_prevista.centro;
  document.getElementById('map-description').textContent = fillText(t.mapDescription, {
    x:numberText(map[0],this.currentLang), y:numberText(map[1],this.currentLang), distance:numberText(Math.hypot(map[0]-target[0],map[1]-target[1]),this.currentLang),
    turn:completed, alerts:(!rec?t.gpsPending:aligned?t.gpsAligned:t.gpsMismatch)
  });
  Array.from(this.sensorModeSelect.options).forEach(opt => {
    const locked=opt.value==='ghz'&&this.levelNumber!==undefined&&this.levelNumber<45;
    opt.disabled = locked || opt.value !== 'none' && exhausted;
    if(opt.value==='ghz')opt.hidden=locked;
  });
  if(this.sensorModeSelect.selectedOptions[0]?.disabled&&!exhausted)this.sensorModeSelect.value='simple';
  if (exhausted) this.sensorModeSelect.value = 'none';
  this.sensorShotsSelect.disabled = this.sensorModeSelect.value === 'none' || exhausted || this.state.isFinished;
  this.sensorModeSelect.disabled = this.state.isFinished;
  this.headingSlider.disabled = this.state.isFinished;
  this.dirButtons.forEach(btn => btn.disabled = this.state.isFinished);
  const usable = Array.from(this.sensorShotsSelect.options).filter(opt => !opt.disabled);
  if (this.sensorShotsSelect.selectedOptions[0]?.disabled && usable.length) this.sensorShotsSelect.value = usable.at(-1).value;
};

GhostRouteApp.prototype.updateNarrative = function () {
  const nextTurn = this.state.currentTurn;
  this.state.currentTurn = Math.max(1, this.state.turnsRecord.length);
  baseNarrative.call(this);
  this.state.currentTurn = nextTurn;
  if (this.state.turnsRecord.length || this.dialogueStep) this.dialogueNav.style.display = 'none';
  if (!this.state.turnsRecord.length) document.getElementById('dialogue-box').textContent += ' ' + TEXTOS[this.currentLang].missionObjective;
  if (this.state.isFinished) document.getElementById('dialogue-box').textContent = document.getElementById('outcome-banner').textContent;
};

GhostRouteApp.prototype.startNewGame = function (seed) {
  if (this.levelNumber !== undefined) useCampaignMission(this.levelNumber);
  this.sensorModeSelect.value = 'simple';
  this.sensorShotsSelect.value = '500';
  this.replayModal.style.display = 'none';
  this.renderer.displayWorld = null;
  this.renderer.target = null;
  this.renderer.visualHeading = null;
  this.renderer.headingTarget = null;
  this.renderer.headingTick = null;
  this.alertGps.style.display = 'none';
  this.alertReef.style.display = 'none';
  baseStart.call(this, seed);
  this.announce(TEXTOS[this.currentLang].missionStarted);
};

GhostRouteApp.prototype.updateRadioLabel = function () {
  const button = document.getElementById('btn-radio-toggle');
  const open = document.querySelector('.radio-widget').classList.contains('radio-open');
  button.setAttribute('aria-label', TEXTOS[this.currentLang][open ? 'collapseRadio' : 'expandRadio']);
};

GhostRouteApp.prototype.updateMapLegend = function (replay=false) {
  const t = TEXTOS[this.currentLang], actual = replay || this.debugMode;
  document.getElementById('legend-ship').textContent = actual ? t.replayLegendShip : t.legendShip;
  document.getElementById('legend-true').textContent = t.replayLegendTrue;
  document.getElementById('legend-true').hidden = !actual;
  document.getElementById('legend-inertial').textContent = t.replayLegendInertial;
  document.getElementById('legend-inertial').hidden = !replay;
  document.getElementById('legend-heat').hidden = replay;
};

GhostRouteApp.prototype.renderMap = function () {
  this.updateMapLegend(this.state.isFinished);
  this.renderer.resize();
  this.renderer.render(this.state, this.estimator, this.state.isFinished, this.debugMode);
};

GhostRouteApp.prototype.updateFullscreenLabel = function () {
  document.getElementById('btn-fullscreen').textContent = TEXTOS[this.currentLang][document.fullscreenElement ? 'exitFullscreen' : 'fullscreen'];
  const menuButton=document.getElementById('btn-menu-fullscreen');
  if(menuButton)menuButton.textContent=TEXTOS[this.currentLang][document.fullscreenElement ? 'exitFullscreen' : 'menuFullscreen'];
};

GhostRouteApp.prototype.bindEvents = function () {
  baseBind.call(this);
  this.renderer.canvas.setAttribute('tabindex', '0');
  this.chkSuspicious.addEventListener('change', () => {
    const rec = lastRecord(this);
    if (rec && !this.state.isFinished) {
      rec.markedSuspicious = this.chkSuspicious.checked;
      this.renderMap();
      this.announce(TEXTOS[this.currentLang].markSaved);
    }
  });
  this.sensorModeSelect.addEventListener('change', () => this.updateTelemetryUI());
  document.getElementById('btn-replay-mark-final').addEventListener('click',()=>{
    const rec=lastRecord(this);
    if(!this.state.isFinished||!rec||Number(this.scrubberRange.value)!==rec.turn)return;
    rec.markedSuspicious=!rec.markedSuspicious;
    this.openReplayModal();
    document.getElementById('btn-replay-mark-final').focus();
    this.announce(TEXTOS[this.currentLang][rec.markedSuspicious?'markSaved':'markRemoved']);
  });
  document.getElementById('btn-radio-toggle').addEventListener('click', e => {
    const open = document.querySelector('.radio-widget').classList.toggle('radio-open');
    e.currentTarget.setAttribute('aria-expanded',String(open));
    e.currentTarget.textContent = open ? '▲' : '▼';
    this.updateRadioLabel();
    this.renderMap();
  });
  document.getElementById('btn-fullscreen').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { this.announce(TEXTOS[this.currentLang].fullscreenUnavailable); }
    this.updateFullscreenLabel();
  });
  document.addEventListener('fullscreenchange', () => this.updateFullscreenLabel());
  this.btnCloseReplay.addEventListener('click', () => { this.renderMap(); this.btnAdvance.focus(); });
  this.replayModal.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); this.btnCloseReplay.click(); }
    if (e.key !== 'Tab') return;
    const focusable = Array.from(this.replayModal.querySelectorAll('button:not(:disabled), input:not(:disabled)')).filter(el => el.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
};

GhostRouteApp.prototype.openReplayModal = function () {
  baseReplay.call(this);
  this.updateTelemetryUI();
  this.updateNarrative();
  this.btnCloseReplay.focus();
};

GhostRouteApp.prototype.renderScrubberTurn = function (turnIndex) {
  const rec = this.state.turnsRecord[turnIndex - 1];
  if (!rec) return;
  const t = TEXTOS[this.currentLang];
  const finalMark=document.getElementById('btn-replay-mark-final');
  finalMark.hidden=!this.state.isFinished||rec!==lastRecord(this);
  finalMark.textContent=fillText(t[rec.markedSuspicious?'unmarkObserved':'observedMark'],{turn:rec.turn});
  finalMark.setAttribute('aria-pressed',String(Boolean(rec.markedSuspicious)));
  const focusedTurn = document.activeElement?.dataset?.turn;
  const finalDist = Math.hypot(this.state.realPosition[0]-MISSAO.capsula.pouso_real[0],this.state.realPosition[1]-MISSAO.capsula.pouso_real[1]);
  document.getElementById('val-rep-dist').textContent = `${numberText(finalDist,this.currentLang)} km`;
  document.getElementById('val-rep-shots').textContent = numberText(this.state.remainingShots,this.currentLang,0);
  this.updateMapLegend(true);
  document.getElementById('turn-event-info').textContent = fillText(t.replayTurnSummary, {
    turn:rec.turn, heading:formatHeading(rec.heading), gps:coordText(rec.gpsReported,this.currentLang), real:coordText(rec.realAfter,this.currentLang), marked:rec.markedSuspicious?t.yes:t.no
  });
  document.getElementById('lbl-meas-title').textContent = fillText(t.measTitle,{turn:rec.turn});
  const details = document.getElementById('meas-details');
  details.textContent = rec.shots ? `${rec.sensorMode==='ghz'?t.modeGhz:t.modeSimple} · ${t.shotsTotal}: ${rec.shots}. X: ${rec.kX}/${rec.NX} · Y: ${rec.kY}/${rec.NY}. ${t.phaseCandidates}: ${rec.phaseCandidates.map(c=>numberText(c,this.currentLang,3)+' rad').join('; ')}.` : t.measurementNone;
  const cv = document.getElementById('histogram-canvas'), ctx = cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  cv.style.display = rec.shots ? 'block' : 'none';
  document.getElementById('histogram-caption').hidden=!rec.shots;
  if(rec.shots) {
    const bars = [['X0',rec.NX-rec.kX],['X1',rec.kX],['Y0',rec.NY-rec.kY],['Y1',rec.kY]];
    const max = Math.max(rec.NX,rec.NY,1);
    bars.forEach(([label,value],i)=> {
      const x=16+i*128, height=value/max*68;
      ctx.fillStyle='#241a40';ctx.fillRect(x,14,105,68);
      ctx.fillStyle=i<2?'#b69cff':'#ffd166';ctx.fillRect(x,82-height,105,height);
      ctx.fillStyle='#fbefe2';ctx.font='14px monospace';ctx.textAlign='center';ctx.fillText(`${label}: ${value}`,x+52,105);
    });
  }
  const timeline=document.getElementById('attack-timeline'); timeline.replaceChildren(); timeline.setAttribute('aria-label',t.timelineLabel);
  for (const r of this.state.turnsRecord) {
    const names=[], symbols=[];
    const active=activeAttacks(r.turn);
    if(active.some(a=>a.tipo==='salto')){names.push(t.attackJump);symbols.push(t.jumpCode);}
    if(active.some(a=>a.tipo==='deriva')){names.push(t.attackDrift);symbols.push(t.driftCode);}
    if(active.some(a=>a.tipo==='congelamento')){names.push(t.attackFreeze);symbols.push(t.freezeCode);}
    const btn=document.createElement('button');btn.type='button';btn.className='timeline-cell'+(names.length?' attack':'')+(r.markedSuspicious?' marked':'')+(r.turn===rec.turn?' current':'');
    btn.dataset.turn = String(r.turn);
    btn.textContent=`${r.turn}${symbols.length?' '+symbols.join(''):''}${r.markedSuspicious?' !':''}`;
    btn.title=`${t.lblTurn} ${r.turn}: ${names.join(' + ')||t.attackNone}. ${t.markedLabel}: ${r.markedSuspicious?t.yes:t.no}`;
    btn.setAttribute('aria-label',btn.title);btn.setAttribute('aria-pressed',String(r.turn===rec.turn));
    btn.addEventListener('click',()=>{this.scrubberRange.value=r.turn;this.renderScrubberTurn(r.turn);});timeline.appendChild(btn);
  }
  timeline.title=t.timelineHint;
  document.getElementById('timeline-legend').textContent=t.timelineExplanation;
  if (focusedTurn) timeline.querySelector(`[data-turn="${focusedTurn}"]`)?.focus();
  this.renderer.resize();
  this.renderer.render({
    ...this.state,currentTurn:rec.turn,currentHeading:rec.heading,realPosition:rec.realAfter,gpsPosition:rec.gpsReported,inertialPosition:rec.inertial,
    inertialRadiusKm:MISSAO.inercial.erro_inicial_km+MISSAO.inercial.crescimento_km_turno*rec.turn,
    turnsRecord:this.state.turnsRecord.slice(0,turnIndex),
    realHistory:[[...MISSAO.porto],...this.state.turnsRecord.slice(0,turnIndex).map(r=>r.realAfter)],
    gpsHistory:[[...MISSAO.porto],...this.state.turnsRecord.slice(0,turnIndex).map(r=>r.gpsReported)],
    inertialHistory:[[...MISSAO.porto],...this.state.turnsRecord.slice(0,turnIndex).map(r=>r.inertial)]
  },this.estimator,true,true);
};

function readPreferences(){
  try { const value=JSON.parse(window.localStorage.getItem('ghost-route.preferences')||'{}');return value&&typeof value==='object'?value:{}; }
  catch { return {}; }
}
GhostRouteApp.prototype.savePreferences = function(){
  try { window.localStorage.setItem('ghost-route.preferences',JSON.stringify({language:this.currentLang,level:this.levelNumber,completed:[...(this.completedLevels||[])]})); }
  catch { /* Storage restrictions must not prevent playing. */ }
};
GhostRouteApp.prototype.changeLanguage = function(lang){
  if(!Object.hasOwn(TEXTOS,lang))return;
  this.currentLang=lang;this.savePreferences();this.updateLocalization();
};
GhostRouteApp.prototype.levelBand = function(level){
  return level===0?'levelTutorial':level<25?'levelBeginner':level<55?'levelIntermediate':level<85?'levelAdvanced':'levelExpert';
};
GhostRouteApp.prototype.updateCampaignMenu = function(){
  if(this.levelNumber===undefined)return;
  const t=TEXTOS[this.currentLang],select=document.getElementById('level-select');
  this.langSelect.value=this.currentLang;
  document.getElementById('menu-lang-select').value=this.currentLang;
  const selected=select.options?.length?Number(select.value):this.levelNumber;
  select.replaceChildren();
  for(let level=0;level<100;level++){
    const option=document.createElement('option');option.value=String(level);
    option.textContent=`${String(level).padStart(2,'0')} · ${campaignLevelName(level,this.currentLang)}${this.completedLevels?.has(level)?' ✓':''}`;select.appendChild(option);
  }
  select.value=String(selected);
  document.getElementById('current-level').textContent=fillText(t.levelName,{level:String(this.levelNumber).padStart(2,'0')});
  document.getElementById('level-progress').textContent=fillText(t.progressLabel,{completed:this.completedLevels?.size||0});
  document.getElementById('mission-badge').textContent=`${fillText(t.levelName,{level:String(this.levelNumber).padStart(2,'0')})} · ${campaignLevelName(this.levelNumber,this.currentLang)}`;
  document.getElementById('menu-primary-label').textContent=selected!==this.levelNumber?t.menuStartLevel:this.state?.isFinished?t.btnViewReplay:this.state?.turnsRecord.length?t.menuContinue:t.menuStart;
  const m=createCampaignMission(selected);
  document.getElementById('level-difficulty').textContent=`${t[this.levelBand(selected)]} · ${m.dificuldade}/100`;
  document.getElementById('level-description').textContent=fillText(t.levelBrief,{turns:m.turnos,budget:numberText(m.sensor.shots_total,this.currentLang,0),radius:numberText(m.vitoria.raio_resgate_km,this.currentLang)});
  const next=document.getElementById('btn-next-level');
  next.hidden=!(this.state?.isFinished&&!this.state.isAground&&Math.hypot(this.state.realPosition[0]-MISSAO.capsula.pouso_real[0],this.state.realPosition[1]-MISSAO.capsula.pouso_real[1])<=MISSAO.vitoria.raio_resgate_km&&this.levelNumber<99);
};
GhostRouteApp.prototype.openMissionMenu = function(){
  this.missionMenu=document.getElementById('mission-menu');
  this.menuPreviousFocus=document.activeElement;
  this.replayModal.style.display='none';
  this.updateCampaignMenu();this.missionMenu.hidden=false;
  document.getElementById('game-shell').inert=true;
  document.getElementById('btn-menu-primary').focus();
};
GhostRouteApp.prototype.closeMissionMenu = function(){
  this.missionMenu.hidden=true;document.getElementById('game-shell').inert=false;
  const previous=this.menuPreviousFocus;
  (previous?.isConnected&&previous.matches?.('button,select,input,summary,[tabindex]')?previous:this.renderer.canvas).focus();
};
GhostRouteApp.prototype.beginCampaignLevel = function(level){
  if(!Number.isInteger(level)||level<0||level>99)return;
  this.levelNumber=level;this.debugMode=false;this.debugBadge.style.display='none';
  this.startNewGame(20261011+level*7919);this.savePreferences();
  document.getElementById('level-select').value=String(level);this.updateCampaignMenu();this.closeMissionMenu();
};
const campaignLocalization=GhostRouteApp.prototype.updateLocalization;
GhostRouteApp.prototype.updateLocalization=function(){campaignLocalization.call(this);this.updateCampaignMenu();};
const campaignTelemetry=GhostRouteApp.prototype.updateTelemetryUI;
GhostRouteApp.prototype.updateTelemetryUI=function(){
  campaignTelemetry.call(this);
  if(this.levelNumber===undefined)return;
  const t=TEXTOS[this.currentLang];
  document.getElementById('val-speed').textContent=fillText(t.speedFormat,{speed:numberText(MISSAO.navio.velocidade_km_turno,this.currentLang)});
};
const campaignNarrative=GhostRouteApp.prototype.updateNarrative;
GhostRouteApp.prototype.updateNarrative=function(){
  campaignNarrative.call(this);
  document.querySelectorAll('.tutorial-focus').forEach(el=>el.classList.remove('tutorial-focus'));
  if(this.levelNumber===undefined||this.state.isFinished)return;
  const t=TEXTOS[this.currentLang],turn=this.state.turnsRecord.length;
  const tutorial=['tutorialHeading','tutorialSensor','tutorialGps','tutorialRescue'];
  document.getElementById('dialogue-box').textContent=this.levelNumber===0?fillText(t[tutorial[Math.min(turn,3)]],{radius:numberText(MISSAO.vitoria.raio_resgate_km,this.currentLang)}):
    fillText(t.levelIntro,{turns:MISSAO.turnos,radius:numberText(MISSAO.vitoria.raio_resgate_km,this.currentLang)})+'\n'+t[this.levelNumber<5?'practiceCalm':this.levelNumber<10?'practiceCurrent':MISSAO.tipo_rota==='openWater'?'practiceOpenWater':'practicePassages'];
  document.getElementById('speaker-name').textContent=t.speakerQuoora;
  document.getElementById('speaker-role').textContent=this.levelNumber===0?t.trainingMode:t.roleQuoora;
  this.dialogueNav.style.display='none';
  if(this.levelNumber===0){
    const selectors=['.heading-module','.sensor-module','.telemetry-strip','.action-module'];
    document.querySelector(selectors[Math.min(turn,3)])?.classList.add('tutorial-focus');
  }
};
const campaignReplay=GhostRouteApp.prototype.openReplayModal;
GhostRouteApp.prototype.openReplayModal=function(){
  campaignReplay.call(this);
  if(this.levelNumber===undefined)return;
  const success=!this.state.isAground&&Math.hypot(this.state.realPosition[0]-MISSAO.capsula.pouso_real[0],this.state.realPosition[1]-MISSAO.capsula.pouso_real[1])<=MISSAO.vitoria.raio_resgate_km;
  if(success){this.completedLevels.add(this.levelNumber);this.savePreferences();}
  if(this.completedLevels.size===100){
    document.getElementById('outcome-banner').textContent=TEXTOS[this.currentLang].campaignComplete;
    this.updateNarrative();
  }
  this.updateCampaignMenu();
};
const campaignBind=GhostRouteApp.prototype.bindEvents;
GhostRouteApp.prototype.bindEvents=function(){
  campaignBind.call(this);
  if(this.levelNumber===undefined)return;
  this.missionMenu=document.getElementById('mission-menu');
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.missionMenu.hidden&&this.replayModal.style.display!=='flex'){e.preventDefault();this.openMissionMenu();}});
  document.getElementById('btn-menu').addEventListener('click',()=>this.openMissionMenu());
  document.getElementById('btn-menu-close').addEventListener('click',()=>this.closeMissionMenu());
  document.getElementById('btn-menu-primary').addEventListener('click',()=>{
    const selected=Number(document.getElementById('level-select').value);
    if(selected!==this.levelNumber){this.beginCampaignLevel(selected);return;}
    this.closeMissionMenu();if(this.state.isFinished)this.openReplayModal();
  });
  document.getElementById('menu-lang-select').addEventListener('change',e=>this.changeLanguage(e.target.value));
  document.getElementById('level-select').addEventListener('change',()=>this.updateCampaignMenu());
  document.getElementById('btn-start-level').addEventListener('click',()=>this.beginCampaignLevel(Number(document.getElementById('level-select').value)));
  document.getElementById('btn-next-level').addEventListener('click',()=>this.beginCampaignLevel(this.levelNumber+1));
  document.getElementById('btn-menu-restart').addEventListener('click',()=>{this.startNewGame(this.seed);this.closeMissionMenu();});
  document.getElementById('btn-menu-export').addEventListener('click',()=>this.exportDecisionsJSON());
  document.getElementById('btn-menu-fullscreen').addEventListener('click',()=>document.getElementById('btn-fullscreen').click());
  this.missionMenu.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.preventDefault();this.closeMissionMenu();return;}
    if(e.key!=='Tab')return;
    const elements=Array.from(this.missionMenu.querySelectorAll('button:not(:disabled),select,summary')).filter(el=>el.getClientRects().length);
    const first=elements[0],last=elements.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
};

function startGhostRoute(){ installMissionExperience(GhostRouteApp); drawTitle(); window.gameApp = new GhostRouteApp(); }
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startGhostRoute,{once:true});
else startGhostRoute();




/* Mission radio as an icon (phones in portrait): it floats on the left, just above the
   helm, and opens upward over the sea without shrinking the chart. In every layout where
   the radio can be collapsed, a new message makes it pulse and shows a "!" badge until
   the player opens it. */
(function(){
  const proto=GhostRouteApp.prototype;
  const matches=query=>typeof window!=='undefined'&&typeof window.matchMedia==='function'&&window.matchMedia(query).matches;
  const visible=el=>!!el&&typeof getComputedStyle==='function'&&getComputedStyle(el).display!=='none';
  proto.refreshRadio=function(){
    const widget=document.querySelector('.radio-widget'),toggle=document.getElementById('btn-radio-toggle');
    if(!widget||!widget.classList||!toggle)return;
    const floating=true; // Walkie-talkie interaction applies at every viewport size.
    widget.classList.toggle('radio-floating',floating);
    const open=widget.classList.contains('radio-open'),collapsed=!open&&visible(toggle);
    // A message is identified by the mission moment, not its wording, so switching language is not "new".
    const key=[this.levelNumber,this.state?.turnsRecord?.length,this.state?.isFinished,this.dialogueStep].join('|');
    if(!collapsed){this.radioSeen=key;widget.classList.remove('radio-unread');}
    else if(key!==this.radioSeen)widget.classList.add('radio-unread');
    if(widget.style){
      const dock=document.querySelector('.navigation-dock'),shell=document.getElementById('game-shell');
      if(floating&&dock?.getBoundingClientRect&&shell?.getBoundingClientRect){
        const d=dock.getBoundingClientRect(),s=shell.getBoundingClientRect();
        const box=selector=>{const el=document.querySelector(selector);return visible(el)?el.getBoundingClientRect():null;};
        const radar=box('.radar-widget'),compass=box('.compass-widget'),hud=box('.hud-top');
        const landscape=matches('(max-height:520px) and (min-width:621px)');
        let left=12,width=Math.min(340,s.width-24),space;
        if(matches('(min-width:1200px) and (min-height:640px)')){
          // Instruments have their own console slots; the radio never covers the GPS.
          left=(radar?.right||168)-s.left+18;
          width=Math.min(340,d.left-s.left-left-18);
          widget.style.top='auto';widget.style.bottom='16px';
          space=s.bottom-d.top-34;
        }else if(landscape){
          const telemetry=document.querySelector('.telemetry-strip')?.getBoundingClientRect();
          const top=Math.max(128,(telemetry?.bottom||128)-s.top+14);
          widget.style.top=Math.round(top)+'px';widget.style.bottom='auto';
          width=Math.min(width,d.left-s.left-30);
          space=s.height-top-58;
        }else{
          widget.style.top='auto';widget.style.bottom=Math.round(s.bottom-d.top+18)+'px';
          if(radar){
            left=radar.right-s.left+20;
            const canvas=this.renderer.canvas.getBoundingClientRect();
            const chartLeft=canvas.left+this.renderer.ox*canvas.width/(this.renderer.canvas.width/2);
            width=Math.min(width,chartLeft-s.left-left-18);
          }
          space=d.top-Math.max(hud?.bottom||100,compass?.bottom||0,radar?0:box('.telemetry-strip')?.bottom||0)-36;
        }
        widget.style.setProperty('--radio-left',Math.round(left)+'px');
        widget.style.setProperty('--radio-width',Math.max(100,Math.floor(width))+'px');
        widget.style.setProperty('--radio-space',Math.max(40,Math.floor(space))+'px');
      }else{widget.style.top='';widget.style.bottom='';}
    }
    this.updateRadioLabel();
    const t=TEXTOS[this.currentLang];
    if(widget.classList.contains('radio-unread')&&t?.radioNew)toggle.setAttribute('aria-label',toggle.getAttribute('aria-label')+' · '+t.radioNew);
  };
  const render=proto.renderMap,narrate=proto.updateNarrative;
  proto.renderMap=function(){document.querySelector('.radio-widget')?.classList.add('radio-floating');const out=render.apply(this,arguments);this.refreshRadio();return out;};
  proto.updateNarrative=function(){const out=narrate.apply(this,arguments);this.refreshRadio();return out;};
  if(typeof window!=='undefined'&&window.addEventListener)window.addEventListener('resize',()=>window.gameApp?.refreshRadio?.());
})();


/* First-use explanation of the quantum sensor. It opens the first time the player touches
   the sensor controls or makes a first reading, is remembered in this browser, and can
   be reopened from the "?" button in the sensor panel. */
(function(){
  const proto=GhostRouteApp.prototype,KEY='ghost-route.sensor-intro-seen';
  const isElement=el=>typeof HTMLElement!=='undefined'&&el instanceof HTMLElement;
  const seen=()=>{try{return window.localStorage.getItem(KEY)==='1';}catch{return false;}};
  const remember=()=>{try{window.localStorage.setItem(KEY,'1');}catch{}};
  proto.openSensorIntro=function(){
    if(this.introQueue?.length)return;
    const box=document.getElementById('sensor-intro');
    if(!isElement(box)||!box.hidden)return;
    const menu=document.getElementById('mission-menu');
    if(isElement(menu)&&!menu.hidden)return;
    this.sensorIntroReturn=document.activeElement;box.hidden=false;remember();
    document.getElementById('btn-sensor-intro-ok')?.focus();
  };
  proto.closeSensorIntro=function(){
    const box=document.getElementById('sensor-intro');
    if(!isElement(box)||box.hidden)return;
    box.hidden=true;
    const back=this.sensorIntroReturn;if(back&&typeof back.focus==='function'&&document.contains(back))back.focus();
    this.introduceMission?.();
  };
  const bind=proto.bindEvents;
  proto.bindEvents=function(){
    bind.apply(this,arguments);
    const box=document.getElementById('sensor-intro');if(!isElement(box))return;
    document.getElementById('btn-sensor-intro-ok').addEventListener('click',()=>this.closeSensorIntro());
    document.getElementById('btn-sensor-help').addEventListener('click',()=>this.openSensorIntro());
    box.addEventListener('click',e=>{if(e.target===box)this.closeSensorIntro();});
    box.addEventListener('keydown',e=>{
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.closeSensorIntro();}
      if(e.key==='Tab'){e.preventDefault();document.getElementById('btn-sensor-intro-ok').focus();}
    });
    // While the explanation is open, game shortcuts (Enter, arrows, Esc → menu) wait.
    window.addEventListener('keydown',e=>{
      if(box.hidden)return;
      if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();this.closeSensorIntro();return;}
      if(!box.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();document.getElementById('btn-sensor-intro-ok').focus();}
    },true);
    for(const id of['sensor-mode-select','sensor-shots-select'])
      document.getElementById(id).addEventListener('pointerdown',e=>{if(this.levelNumber>=5&&!seen()){e.preventDefault();this.openSensorIntro();}});
  };
  const render=proto.renderMap;
  proto.renderMap=function(){
    const out=render.apply(this,arguments);
    const rec=this.state?.turnsRecord?.at?.(-1);
    if(this.levelNumber>=5&&rec?.shots>0&&!this.state.isFinished&&!seen())this.openSensorIntro();
    return out;
  };
})();
