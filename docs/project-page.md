# Ghost Route — project-page draft

Team: QuantGirls · Qollab × IonQ hackathon · MIT license

This effort is supported by Qollab & IonQ

## The game

**Ghost Route** is a fullscreen, 16-bit pixel-art rescue game set in the South Atlantic in 2031. The player steers **SPOOFED** toward the Aurora-1 capsule while an adversary supplies deceptive GPS readings. Quoora's simulated quantum sensor offers another source of evidence.

The mission has 12 turns, a 6,000-shot measurement budget and a reef to avoid. At the end, the ship must be within 2 km of the capsule. Players flag observed suspicious GPS readings; a perfect rescue also detects all three attack types. False alarms are reported separately.

The whole interface supports English, Brazilian Portuguese and Spanish. The name Ghost Route is the same in all three languages.

## Quantum contribution

The toy magnetic field produces a phase φ. Ramsey circuits use the probabilities

```text
P_X(1 | φ, n) = (1 − cos(nφ)) / 2
P_Y(1 | φ, n) = (1 − sin(nφ)) / 2
```

Simple mode uses one qubit. GHZ mode uses three entangled qubits and a response depending on 3φ. This sharper phase response has a cost: three candidate phases. It is not a guarantee of better positioning or precision for every resource budget.

A scalar magnetic measurement describes possible field contours. The browser's Bayesian grid combines measurement likelihoods and predicted movement to estimate position. The GPS consistency warning compares a reported coordinate with the estimated 95% credible region.

This is a controlled educational simulation. It does not establish a spoof-proof real-world navigation system.

## Two execution paths

The browser samples the analytical Born probabilities offline in JavaScript. The canonical root `sensor.py` builds and samples Qiskit circuits in Python.

Session export preserves world observations, phases, commands and sensor choices. `scripts/replay_session.py` uses those saved references and submits the session circuit PUBs in one sampler.run call. It takes fresh Qiskit measurements; JavaScript and Python use different random-number generators, so exact sample counts need not match.

The browser demo, successful local tests and generated package do not by themselves verify a Qollab execution. Add the real platform run evidence to the submitted project page.

## Run and verify

From the repository root:

```sh
python -m pip install -r requirements.txt
python sensor.py
python -m pytest tests/test_sensor.py -q
python scripts/plot_fringes.py
python scripts/replay_session.py examples/session-seed-20261011.json
python scripts/package_qollab.py
```

Use a virtual environment for Python dependencies. Open `public/index.html` for the browser game, or deploy `public/` as a static site with no build. The Qollab package is generated into ignored `dist/qollab/` and `dist/ghost-route-qollab.zip`.

See [the README](../README.md) for installation and JavaScript tests, and [the submission checklist](submission-checklist.md) for remaining evidence.

## Links to fill before publishing

- Playable deployment URL
- Actual Qollab project URL and execution evidence
- Public demo video URL
- Source: [Ghost Route on GitHub](https://github.com/SouBeatrizKaroline/QollabQuantumHackathon_GhostRoute)

AI assistance and visual-reference use are disclosed in the README; confirm the final submission disclosure with the team.
