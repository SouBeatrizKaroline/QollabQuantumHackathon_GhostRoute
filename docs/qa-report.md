# Ghost Route QA report

Revision reviewed locally on 2026-10-10. The game name remains **Ghost Route** in all languages.

## Corrections

- Bayesian position estimation includes the 0 and 100 km boundaries, preserves fractional movement and conserves probability at the coast.
- Sensor exhaustion disables unavailable measurements, explains the state and allows navigation to continue. Restart restores the default sensor settings.
- The suspicion checkbox identifies the observed turn. Marks persist with that reading.
- Final radio messages, measurement details, attack codes, actions and number formatting update in English, Brazilian Portuguese and Spanish.
- Replay preserves keyboard focus, shows a visible attack-code explanation and uses legends matching the displayed routes. Historical replay omits the final posterior.
- Small portrait and landscape layouts retain access to the radio and navigation controls. The Canvas projection follows the available space.
- `sensor.py` validates sensor inputs and batches its demonstration into one job. Its console output supports Windows UTF-8.
- The JSON bridge validates records before sampling and batches X/Y circuits in one Sampler V2 submission, with each circuit's saved measurement budget.
- Canonical sources replace duplicated web/Qiskit packages. Documentation, deployment settings and script imports follow the new layout.

## Verification

Python: **67 tests passed**, using Qiskit 2.5.2 and its local `StatevectorSampler`. Coverage includes circuit/theory agreement, phase reconstruction, invalid inputs, one-job batching, mixed budgets, session validation and zero-job validation mode.

JavaScript: game-core and estimator regressions passed; five localization tests passed with **135 matching keys** per language; controller integration checks passed for observation labels, exhaustion, number formatting, final radio, replay focus/legends and restart.

Browser: checked at 1366 × 768, 844 × 390 and 390 × 844. Tested all three languages, sensor-off and GHZ readings, budget exhaustion, restart, replay focus and Escape, and a complete rescue with all three attack categories identified. The default-seed rescue fixture finishes within 1.670 km of the capsule. The checked browser states produced no application errors in the captured console.

Export: the tracked example was regenerated from the actual controller. Local Qiskit replay retained its 12-turn trajectory and ran 24 circuits in one job. JavaScript and Qiskit use different random streams; matching counts are not expected.

Distribution: generated ZIP integrity, relative web assets and root Python imports were checked from an isolated extraction. The Vercel configuration serves `public/` without a build step.

## Remaining submission checks

An official Qollab/IonQ execution and a live Vercel deployment were not performed in this revision. Backend compatibility, current hackathon terms, final project/video links and submission status still require evidence from their platforms. Keyboard and responsive checks do not establish formal accessibility certification.

The batching interface follows the [Qiskit primitives documentation](https://quantum.cloud.ibm.com/docs/en/guides/primitive-input-output). See [submission-checklist.md](submission-checklist.md) for platform tasks.

This effort is supported by Qollab & IonQ
