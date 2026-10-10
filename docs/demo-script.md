# Ghost Route — demo script

Target: 2–3 minutes. Narrator: Quoora. Record real gameplay and use the matching translated subtitles. Display **Ghost Route** in every language.

This effort is supported by Qollab & IonQ

## 00:00–00:30 — Mission

Show the fullscreen map, SPOOFED at the port, the mission objective and the language selector.

**English:** “South Atlantic, 2031. Aurora-1 is returning from orbit. Steer SPOOFED to rescue its crew in twelve turns. Finish within two kilometers of the capsule and avoid the reef. GPS readings may look convincing while an unseen adversary alters them.”

**Português:** “Atlântico Sul, 2031. A Aurora-1 retorna da órbita. Conduza o SPOOFED para resgatar a tripulação em doze turnos. Termine a até dois quilômetros da cápsula e evite o recife. As leituras do GPS podem parecer confiáveis enquanto um adversário invisível as altera.”

**Español:** “Atlántico Sur, 2031. Aurora-1 regresa de la órbita. Conduce SPOOFED para rescatar a su tripulación en doce turnos. Termina a no más de dos kilómetros de la cápsula y evita el arrecife. Las lecturas del GPS pueden parecer fiables mientras un adversario invisible las altera.”

## 00:30–01:15 — Sensor

Select Simple and GHZ. Show the measurement budget, a sensor update and phase candidates. Briefly show the Ramsey fringe figure from `docs/assets/ramsey-fringes.png`.

**English:** “I am Quoora. Our model turns a magnetic field into a quantum phase. A Ramsey sensor measures it in two bases. Three-qubit GHZ responds to three times the phase, but leaves three possible phase candidates. A scalar reading gives possible contours, not an instant position. Our Bayesian grid combines measurements with movement.”

**Português:** “Eu sou a Quoora. Nosso modelo transforma um campo magnético em uma fase quântica. Um sensor de Ramsey a mede em duas bases. O GHZ de três qubits responde ao triplo da fase, mas deixa três fases candidatas. Uma leitura escalar indica contornos possíveis, não uma posição imediata. Nossa grade bayesiana combina medições com movimento.”

**Español:** “Soy Quoora. Nuestro modelo transforma un campo magnético en una fase cuántica. Un sensor de Ramsey la mide en dos bases. El GHZ de tres cúbits responde al triple de la fase, pero deja tres fases candidatas. Una lectura escalar indica posibles contornos, no una posición instantánea. Nuestra cuadrícula bayesiana combina mediciones y movimiento.”

## 01:15–01:50 — Decisions and result

Show a suspicious observed reading, mark its completed turn, then show the recorded mission outcome and the replay timeline. Use the actual distance and score from the recording; do not substitute an invented perfect rescue.

**English:** “The adversary can jump, drift or freeze GPS readings. Compare the instruments and mark the reading you actually observed. After the mission, replay reveals the true, GPS and inertial routes, your marks, and the measurement counts.”

**Português:** “O adversário pode provocar saltos, deriva ou congelamento das leituras do GPS. Compare os instrumentos e marque a leitura que você realmente observou. Após a missão, a repetição revela as rotas real, do GPS e inercial, suas marcações e as contagens das medições.”

**Español:** “El adversario puede provocar saltos, deriva o congelación de las lecturas del GPS. Compara los instrumentos y marca la lectura que realmente observaste. Después de la misión, la repetición muestra las rutas real, del GPS e inercial, tus marcas y los recuentos de las mediciones.”

## 01:50–02:30 — Qiskit and reproducibility

Export JSON. Show the real output of `python scripts/replay_session.py <exported-session.json>`. If recording a Qollab run, show its actual project and execution result.

**English:** “The browser samples Born probabilities offline. Our Python sensor uses Qiskit circuits. We replay the saved positions and phases in one batched sampler call, taking fresh measurements. Different random-number generators mean the counts need not be identical. Ghost Route makes the sensing model and its limitations visible.”

**Português:** “O navegador amostra as probabilidades de Born localmente. Nosso sensor Python usa circuitos do Qiskit. Reproduzimos as posições e fases salvas em uma única chamada em lote do amostrador, com novas medições. Geradores aleatórios diferentes podem produzir contagens diferentes. Ghost Route mostra o modelo do sensor e suas limitações.”

**Español:** “El navegador muestrea las probabilidades de Born localmente. Nuestro sensor Python usa circuitos de Qiskit. Reproducimos las posiciones y fases guardadas en una única llamada por lotes al muestreador, con nuevas mediciones. Distintos generadores aleatorios pueden producir distintos recuentos. Ghost Route muestra el modelo del sensor y sus limitaciones.”

End with the source link, actual playable link and the exact attribution. Disclose AI assistance as stated in the README.
