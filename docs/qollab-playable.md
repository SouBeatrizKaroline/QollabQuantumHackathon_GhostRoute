# Play Ghost Route inside Qollab

This JavaScript distribution runs the complete browser campaign in Qollab's
HTML/JS output, with a separate Qiskit reference experiment on the selected
backend. It does not embed the Vercel website or require external network assets.

## Build and upload

From the repository root, run:

```sh
node scripts/package_qollab_js.cjs
```

Upload the **contents** of `dist/qollab-js` to your Qollab project, preserving
`index.html`, `main.js`, `main.css`, `requirements.txt`, `LICENSE` and `README.md`
at the top level. Do not upload the outer directory as a nested folder. These
six files are sufficient; no `node_modules` or Python helper files are required.
The generator can take an optional destination directory as its first argument.

Qollab detects `index.html` + `main.js` as a JavaScript project, even if an older
`main.py` remains. That older Python entry point is not invoked in this mode.
Keep the original Python project/version if you want to run it independently.

Select **Run Project**, **Run**, a **free local simulator**, then **Run** again.
The game menu appears above the console. Start at level 00. The menu's
**Qiskit · Simple / GHZ** section displays the reference experiment results;
the same report prints in the console. Language selection updates the explanation.

Each Run submits one eight-qubit circuit with 1000 shots on the user's injected
backend. It measures Simple and three-qubit GHZ Ramsey circuits in X/Y at phase
1.1 rad. It shows counts, theoretical probabilities and phase candidates.
No backend is hardcoded and no additional jobs are sent when playing missions.
Use a free local simulator for initial verification; remote backends may consume
credits. A circuit failure is shown in the menu and console while gameplay remains
available; a failed experiment is not reported as a successful quantum run.

## Gameplay and sandbox behavior

- The full 100-mission campaign, four languages, tutorial, sensor controls and
  replay remain available. The game retains its analytical statistical sensor.
- The separate Qiskit experiment demonstrates the circuit physics. Its counts
  do **not** replace mission sensor readings or locate the ship.
- Preferences, completed levels and acknowledged lessons persist in memory
  during the current Run only. Stop/reload starts a fresh session.
- JSON export uses Qollab's `sendFile` when available, with the browser download
  path as fallback. Sound depends on browser/user-interaction permissions;
  lack of audio never blocks navigation. Fullscreen depends on the host frame.
- HTML contains body content only; SVG marks are embedded as data URLs. All
  scripts are bundled in `main.js` and all CSS in `main.css`.

## Validation

```sh
node tests/qollab-js.cjs
```

This developer test uses Playwright and an installed Chromium/Edge browser.
Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` if necessary. It checks the generated game
in an opaque-origin sandbox without storage, the four-turn rescue, languages,
progress retention, export, the single-job circuit contract and circuit failure.
The backend in this test is a test double; this is **not evidence of a Qollab or
IonQ execution**. After upload, run on the actual platform, inspect the report,
then Publish again before submitting.

Scientific foundations: https://github.com/SouBeatrizKaroline/QollabQuantumHackathon_GhostRoute/blob/main/docs/scientific-basis.md

QuantGirls — Beatriz Karoline, Daiane and Sonia.

This effort is supported by Qollab & IonQ. MIT License.
