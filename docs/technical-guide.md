# Technical guide

**English** · [Português (Brasil)](pt-BR/technical-guide.md) · [Português (Portugal)](pt-PT/technical-guide.md) · [Español](es/technical-guide.md)

**Reproduce the model, run the checks and keep browser simulation separate from circuit execution.** Commands below run from the repository root.

## Three execution paths

| Path | What executes | Evidence it provides |
| --- | --- | --- |
| Browser | HTML/CSS/Canvas and JavaScript sampling of analytical Born probabilities. | Playable missions and exported decisions; no Qiskit or hardware job. |
| Local Python | [sensor.py](../sensor.py) and Qiskit simulation; optional JSON circuit replay. | Circuit/model comparisons on the local backend used. |
| Qollab | [main.py](../main.py) with the platform-injected backend. | Only an actual platform run establishes execution there. |

## Sensor model

A toy magnetic field maps position to phase φ. Measurements in X and Y use:

~~~text
P_X(1 | φ, n) = (1 − cos(nφ)) / 2
P_Y(1 | φ, n) = (1 − sin(nφ)) / 2
~~~

Simple uses n=1; GHZ uses n=3 and three entangled qubits. The threefold phase response also creates three candidate phases. A scalar field reading alone cannot identify a unique two-dimensional position. The Bayesian grid combines its likelihood with predicted movement. The 95% credible region tests consistency, not the probability that GPS is honest.

![Ramsey fringe figure generated from the model.](assets/ramsey-fringes.png)

## Browser and frontend checks

Open [public/index.html](../public/index.html), or serve public with <code>python -m http.server 8000 --directory public</code>. No build or frontend package install is needed. Node.js runs the checks:

~~~sh
node tests/game-core.cjs
node tests/estimator.cjs
node --test tests/localization.cjs
node tests/ui-state.cjs
node tests/campaign.cjs
node tests/ship-rendering.cjs
node tests/map-layout.cjs
node tests/experience.cjs
node tests/progression.cjs
~~~

The campaign search checks full movement segments, fixed travel distances, integer headings and seeded currents. It does not measure perceived difficulty or learning outcomes.

## Local Python setup

Use Python 3.10 or newer and the dependencies in [requirements.txt](../requirements.txt). Qiskit is constrained to >=2.5.2 and <3; other dependency versions are not pinned.

~~~sh
python -m venv .venv
~~~

**Windows:** <code>.venv\Scripts\activate</code>  
**macOS / Linux:** <code>source .venv/bin/activate</code>

~~~sh
python -m pip install -r requirements.txt
python sensor.py
python -m pytest tests -q
python scripts/plot_fringes.py
~~~

On Windows, [setup_and_test.bat](../scripts/setup_and_test.bat) provides the setup workflow. The fringe script regenerates the illustration above.

## Export and replay

Browser exports preserve positions, phases, commands, measurements and campaign configuration. Python replay validates the recorded world and takes **fresh samples** at saved phases. Python and JavaScript use different random-number generators; identical seeds do not imply identical measurement counts.

~~~sh
python scripts/replay_session.py examples/session-seed-20261011.json
python scripts/replay_session.py examples/session-level-00.json --validate-only
python scripts/replay_session.py examples/session-level-00.json --output dist/replay-report.json
python scripts/package_qollab.py
~~~

Archived 1.0.0 and campaign 1.1.0 exports are supported. The archived example retains the original twelve-turn mission; it is not the current difficulty configuration for every level. <code>--validate-only</code> submits no circuit job. Actual replay batches circuit PUBs in one sampler.run call. This multi-circuit replay is distinct from the Qollab entry point.

## Qollab entry point and package

<code>main.py</code> combines Simple/GHZ X/Y readings into **one eight-qubit circuit and one backend.run call**. It relies on the injected backend, does not select one during import and does not call main manually. Generate the package, preserve its root and follow the platform's current runtime workflow. Output is ignored <code>dist/qollab/</code> and <code>dist/ghost-route-qollab.zip</code>. Confirm actual execution and public links using the [submission checklist](submission-checklist.md).

## Static hosting and source map

For Vercel, the repository's [vercel.json](../vercel.json) serves **public/**: framework Other, no build command, repository root. The Python sensor needs its own execution environment.

| Source | Responsibility |
| --- | --- |
| public/assets/js/engine.js | Physics, campaign configurations, estimation and 64 ship perspectives. |
| public/assets/js/app.js | Controls, replay, localization updates and radio positioning. |
| public/assets/js/i18n.js | Four complete player-facing catalogs. |
| public/assets/js/onboarding.js | Level names and introductions. |
| public/assets/js/audio.js | Synthesized effects and mute behavior. |
| public/assets/css/game.css | Responsive bridge and walkie-talkie presentation. |
| main.py / sensor.py | Qollab entry point and reusable quantum model. |
| scripts/ / tests/ | Replay, packaging and verification. |

See [verification](qa-report.md) for tested scope. “32-bit” denotes the visual style, not a Windows binary architecture.
