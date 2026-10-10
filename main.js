class RotaFantasmaApp {
  constructor() {
    this.renderer = new TacticalMapRenderer('map-canvas');
    this.avatarCtx = document.getElementById('avatar-canvas').getContext('2d');
    this.estimator = new BayesianGridEstimator();

    this.currentLang = 'pt-BR';
    this.debugMode = false;
    this.seed = 20261011;

    this.initDOM();
    this.bindEvents();

    // Run sensor self-test
    autotesteSensor();

    this.startNewGame(this.seed);
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
      this.currentLang = e.target.value;
      this.updateLocalization();
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
      if (e.target.tagName === 'INPUT' && e.target.type === 'text') return;
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
    this.announce("Nova missão iniciada no Porto de partida [10, 15].");
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
    if (checkReefCollision(prevReal, nextReal, MISSAO.recife)) {
      this.state.isAground = true;
      this.state.isFinished = true;
      this.recordTurnDecisions(commanded, prevReal, nextReal, 0, 0, 0, 0, 'none', 0);
      this.openReplayModal();
      return;
    }

    this.state.realPosition = nextReal;
    this.state.realHistory.push([...nextReal]);
    this.state.totalDistanceKm += MISSAO.navio.velocidade_km_turno;

    // 3. Move inertial dead-reckoning
    this.state.inertialPosition = [
      Math.max(0, Math.min(100, this.state.inertialPosition[0] + commanded.dx)),
      Math.max(0, Math.min(100, this.state.inertialPosition[1] + commanded.dy))
    ];
    this.state.inertialRadiusKm = MISSAO.inercial.erro_inicial_km + MISSAO.inercial.crescimento_km_turno * turn;
    this.state.inertialHistory.push([...this.state.inertialPosition]);

    // 4. Apply GPS Spoofing Attacks
    let reportedGPS = [...nextReal];
    // Jump attack (Turn 4)
    if (turn === 4) {
      reportedGPS[0] += MISSAO.ataques[0].deslocamento_km[0];
      reportedGPS[1] += MISSAO.ataques[0].deslocamento_km[1];
    }
    // Drift attack (Turns 6 to 10)
    if (turn >= 6 && turn <= 10) {
      this.driftAccum[0] += MISSAO.ataques[1].km_por_turno[0];
      this.driftAccum[1] += MISSAO.ataques[1].km_por_turno[1];
      reportedGPS[0] += this.driftAccum[0];
      reportedGPS[1] += this.driftAccum[1];
    } else if (turn > 10) {
      this.driftAccum = [0.0, 0.0]; // Drift resets when attack ends
    }

    // Freeze attack (Turns 9 and 10)
    if (turn >= 9 && turn <= 10) {
      if (!this.frozenGpsPos && this.state.gpsHistory.length >= 8) {
        this.frozenGpsPos = [...this.state.gpsHistory[7]]; // Turn 8 displayed position
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
    const mode = this.sensorModeSelect.value;
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
    const reefDist = distToPolygon(mapCoords, MISSAO.recife);
    this.alertReef.style.display = (reefDist < 3.0) ? 'block' : 'none';

    // Record turn decision data
    this.recordTurnDecisions(commanded, prevReal, nextReal, kX, NX, kY, NY, mode, actualShots, phaseCandidates, gpsInside);

    // Advance Turn Counter
    if (turn >= this.state.maxTurns) {
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
      markedSuspicious: this.chkSuspicious.checked,
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
      text = t.diaTurn8;
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

    // Jump attack on turn 4
    const turn4 = this.state.turnsRecord.find(r => r.turn === 4);
    if (turn4 && turn4.markedSuspicious) attacksDetected++;

    // Drift attack on turns 6 to 10
    const driftRecord = this.state.turnsRecord.filter(r => r.turn >= 6 && r.turn <= 10 && r.markedSuspicious);
    if (driftRecord.length > 0) attacksDetected++;

    // Freeze attack on turns 9 to 10
    const freezeRecord = this.state.turnsRecord.filter(r => (r.turn === 9 || r.turn === 10) && r.markedSuspicious);
    if (freezeRecord.length > 0) attacksDetected++;

    // False alarms (marked on honest turns 1, 2, 3, 5, 11, 12)
    const honestMarks = this.state.turnsRecord.filter(r => [1, 2, 3, 5, 11, 12].includes(r.turn) && r.markedSuspicious);
    falseAlarms = honestMarks.length;

    // Final capsule distance
    const dx = this.state.realPosition[0] - MISSAO.capsula.pouso_real[0];
    const dy = this.state.realPosition[1] - MISSAO.capsula.pouso_real[1];
    const finalDist = Math.hypot(dx, dy);

    document.getElementById('val-rep-score').textContent = `${attacksDetected} / 3`;
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
      if (attacksDetected === 3 && falseAlarms === 0) {
        banner.classList.add("outcome-perfect");
        banner.textContent = t.endingPerfect;
      } else {
        banner.classList.add("outcome-rescue");
        banner.textContent = t.endingRescue;
      }
    } else {
      banner.classList.add("outcome-deceived");
      banner.textContent = t.endingDeceived;
    }

    this.scrubberRange.max = this.state.turnsRecord.length;
    this.scrubberRange.value = this.state.turnsRecord.length;
    this.renderScrubberTurn(this.state.turnsRecord.length);
  }

  renderScrubberTurn(turnIndex) {
    if (!this.state.turnsRecord || this.state.turnsRecord.length === 0) return;
    const rec = this.state.turnsRecord[turnIndex - 1];
    if (!rec) return;

    const info = document.getElementById('turn-event-info');
    info.textContent = `Turno ${rec.turn} | Rumo: ${formatHeading(rec.heading)} | GPS: [${rec.gpsReported[0].toFixed(1)}, ${rec.gpsReported[1].toFixed(1)}] | Real: [${rec.realAfter[0].toFixed(1)}, ${rec.realAfter[1].toFixed(1)}] | Suspeito: ${rec.markedSuspicious ? 'SIM' : 'NÃO'}`;

    const measBox = document.getElementById('replay-measurement-box');
    const measDetails = document.getElementById('meas-details');
    const t = TEXTOS[this.currentLang];

    if (rec.shots > 0) {
      measBox.style.display = 'block';
      document.getElementById('lbl-meas-title').textContent = t.measTitle.replace('{turn}', rec.turn);
      measDetails.innerHTML = `
        Modo: ${rec.sensorMode.toUpperCase()} | Total Shots: ${rec.shots}<br>
        Quad X: kX = ${rec.kX} / ${rec.NX} (${((rec.kX/rec.NX)*100).toFixed(1)}%) | Quad Y: kY = ${rec.kY} / ${rec.NY} (${((rec.kY/rec.NY)*100).toFixed(1)}%)<br>
        Candidatos de Fase: [${rec.phaseCandidates.map(c => c.toFixed(3) + ' rad').join(', ')}]
      `;
    } else {
      measBox.style.display = 'none';
    }

    // Render map for scrubber state
    this.renderer.render({
      ...this.state,
      currentTurn: rec.turn,
      realPosition: rec.realAfter,
      currentHeading: rec.heading,
      gpsHistory: this.state.gpsHistory.slice(0, rec.turn + 1),
      realHistory: this.state.realHistory.slice(0, rec.turn + 1)
    }, this.estimator, true, true);
  }

  exportDecisionsJSON() {
    const exportData = {
      projeto: "Rota Fantasma",
      versao: "1.0.0",
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
    dlAnchor.setAttribute("download", `rota_fantasma_seed_${this.seed}_decisions.json`);
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

    document.getElementById('txt-radio-title').textContent = t.radioTitle || "Transmissão de Rádio & Quoora";
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

// Startup bootstrap
window.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new RotaFantasmaApp();
});
