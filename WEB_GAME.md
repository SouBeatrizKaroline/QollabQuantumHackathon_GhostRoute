# Ghost Route web frontend

The static browser game uses no external frontend dependencies. Keep index.html, main.css, main.js and js/ together. The qollab_package/ copy contains the same web interface alongside its existing Python runner.

## Controls

- Choose a heading with the compass buttons or slider, a sensor mode and shot allocation, then advance one turn.
- Mark the latest observed GPS reading as suspicious after seeing it. The mark belongs to that completed turn.
- On the map, Enter or Space advances, Left/Right steers by 5 degrees, D toggles the labeled debug view, and R restarts.
- Native buttons, sliders and selects retain their normal keyboard behavior.
- Use the fullscreen button; Escape exits fullscreen. Restricted iframe previews may not allow fullscreen or downloads.
- English, Brazilian Portuguese and Spanish are available without resetting the mission.
- On a narrow screen, use the radio arrow to expand or collapse the current message.

The debrief includes true/GPS/inertial routes, an attack timeline, measurement counts, phase candidates and Export Decisions (JSON). Historical replay omits the final posterior because per-turn posterior snapshots are not stored.

## Verification

Run `node tests/game-core.cjs` with Node.js 18 or later. No package install is needed. Checks cover Ramsey probabilities, phase ambiguity, normalized posteriors, 95% credible mass, deterministic movement, shot budget, reef boundaries, GPS freeze, suspicion marks, JSON export, and a perfect rescue.

Browser QA covered a complete 12-turn mission, a perfect rescue, three languages, native keyboard controls, replay, fullscreen entry and desktop/mobile layouts. Export data was validated directly from the generated JSON; the in-app preview did not report a completed download event. Open the game in a normal browser for file export.

## Vercel

Import SouBeatrizKaroline/QollabQuantumHackathon_GhostRoute from GitHub. Use main, the repository root, Framework Preset Other, an empty build command and output directory `.`. The included vercel.json declares these static settings. No environment variables are required by this frontend.

Official references: [Configuring a Build](https://vercel.com/docs/builds/configure-a-build) and [vercel.json](https://vercel.com/docs/project-configuration/vercel-json).

## Quantum execution

The web version samples the Ramsey Born probabilities locally in JavaScript. It does not invoke Qiskit or IonQ hardware. The existing sensor.py and qollab_package/sensor.py are separate components; the JSON export preserves the seed, headings, sensor modes and measurements for later reproduction. This update does not verify the official Qollab runner or submission.

## Credits

Base game: QuantGirls. Visual direction: user-provided reference images. Procedural cutter and bitmap title: original drawings embedded in code. AI assistance: OpenAI Codex. MIT license.

This effort is supported by Qollab & IonQ
