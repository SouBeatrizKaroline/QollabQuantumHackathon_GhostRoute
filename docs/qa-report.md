# Ghost Route QA report

Revision reviewed locally on 2026-10-10. The game name remains **Ghost Route** in all languages.

## Corrections

- Bayesian position estimation includes the 0 and 100 km boundaries, preserves fractional movement and conserves probability at the coast.
- Sensor exhaustion disables unavailable measurements, explains the state and allows navigation to continue. Restart restores the default sensor settings.
- The suspicion checkbox identifies the observed turn. Marks persist with that reading.
- Final radio messages, measurement details, attack codes, actions and number formatting update in English, Portuguese from Portugal, Portuguese from Brazil and Spanish. The two Portuguese catalogs use distinct regional wording. Portugal Portuguese is the default; the selectors display BR, PT, ES and IN.
- Replay preserves keyboard focus, shows a visible attack-code explanation and uses legends matching the displayed routes. Historical replay omits the final posterior.
- The mission menu adds level selection, progress, language, fullscreen, navigation help, restart and decision export. Local storage preserves language, selected level and completed levels when available.
- SPOOFED uses 32 separately drawn pixel perspectives. Its mast remains upright, every frame retains the same anchor, and heading transitions take the shortest path across 0°.
- The campaign contains 100 deterministic missions, numbered 00–99. Level 00 is a safe four-turn introduction; later missions introduce stronger currents, GPS attack stages, reduced measurement budgets and smaller rescue radii.
- `sensor.py` validates sensor inputs and batches its demonstration into one job. Its console output supports Windows UTF-8.
- Root `main.py` provides the Qollab Run entry point. It uses the injected backend and combines simple/GHZ readings in both X/Y bases into one eight-qubit circuit and one backend job. Importing the module does not submit a job.
- The JSON bridge validates archived 1.0.0 and campaign 1.1.0 records before sampling and batches X/Y circuits in one Sampler V2 submission, with each circuit's saved measurement budget.
- Canonical sources replace duplicated web/Qiskit packages. Documentation, deployment settings and script imports follow the new layout.

## Verification

Python: **105 tests passed**, using Qiskit 2.5.2 with local `StatevectorSampler` and `BasicSimulator` execution. Coverage includes circuit/theory agreement, phase reconstruction, invalid inputs, one-job batching, mixed budgets, archived/campaign session validation, zero-job validation mode and the injected-backend Qollab entry point.

JavaScript: all seven suites passed: game-core, estimator, localization, controller state, ship rendering, campaign and map layout. **Nine localization tests passed**, checking **185 matching translation keys per locale**, interpolation variables, HTML/accessibility bindings, menu/tutorial/campaign messages and regional Portuguese wording. Controller checks cover observation labels, exhaustion, number formatting, final radio, replay focus/legends, restart, tutorial rescue, saved completion, campaign export, next-level transition, failed rescue and final-level selection.

Campaign feasibility: all **100 actual campaign seeds** admit a safe rescue using the real movement/current model, fixed-length moves and integer headings. Each generated route is independently replayed with the production heading vector and reef-intersection functions, then checked against the turn limit and rescue radius. The archived default-seed fixture still rescues within **1.670 km**, without grounding, while identifying all three attack categories.

Ship rendering: all **32 frames** are distinct, keep their pixels inside the 88 × 88 sprite bounds and retain the upright mast at the same anchor. Cardinal bow lights, bearing normalization and wraparound turns are checked.

Browser: the previous interface was checked at 1366 × 768, 844 × 390 and 390 × 844, including sensor-off/GHZ readings, budget exhaustion, restart, replay focus/Escape and a complete rescue. The redesigned menu and campaign were checked at 1366 × 768 and 390 × 844; language changes were exercised in all four locales, along with the level-00 rescue, next-level transition and saved progress. The captured console had no application errors. The final interface was also checked at 390 × 667, 390 × 844 and 844 × 390 with actual GPS alerts. The advance action stays visible, notices occupy their own dock row, and labels avoid the ship. In landscape, instruments scroll within their allocated area while the advance action remains fixed. An additional projection regression covers five viewport sizes, notice growth and reversible coordinates.

Export: both tracked examples come from the actual controller. The archived session retains its twelve-turn trajectory and replays 24 circuits in one local Qiskit job. The level-00 campaign session replays four turns and eight circuits in one local job, reaches the saved position (26, 31), and preserves the 8,000-measurement budget with 6,000 remaining. JavaScript and Qiskit use different random streams; matching counts are not expected.

Distribution: the Vercel configuration serves `public/` without a build step. The generated ZIP contains 38 files, including root `main.py`, the sensor module, documented dependencies and the canonical frontend. ZIP integrity, required root files and every relative HTML asset link passed validation. Each file is below 2 MB and the bundle stays below the platform's 100-file limit.

## Remaining submission checks

The official hackathon process, terms and runtime documentation were reviewed on 2026-10-10. The GitHub API reported the supporting repository as **private**. Eligibility still requires public repository visibility, an actual successful Qollab simulator run, public MIT-licensed Qollab publication, a public 2–3 minute demo and the registered captain's submission before the deadline. The local Qiskit runs do not establish execution on Qollab or IonQ. A live Vercel deployment was not verified. Keyboard and responsive checks do not establish formal accessibility certification.

The batching interface follows the [Qiskit primitives documentation](https://quantum.cloud.ibm.com/docs/en/guides/primitive-input-output). See [submission-checklist.md](submission-checklist.md) for platform tasks.

This effort is supported by Qollab & IonQ
