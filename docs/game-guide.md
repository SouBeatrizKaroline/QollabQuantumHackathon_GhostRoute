# Ghost Route game guide

Open [../public/index.html](../public/index.html), keeping the assets folder in place, or serve `public/` as a static website. There are no frontend dependencies or compilation steps.

## Mission and controls

Rescue Aurora-1 in 12 turns of 20 minutes. SPOOFED moves 7.5 km per turn plus modeled current noise. The rescue condition is a final true distance of at most 2 km from the capsule. Crossing the charted reef ends the mission.

- Choose a heading using the compass buttons or slider.
- Choose Off, Simple or GHZ and allocate measurements from the 6,000-shot budget.
- Advance to see that completed turn's observations.
- Mark the displayed, observed GPS reading as suspicious. The mark belongs to that completed turn, not the next heading choice.
- On the map, Enter or Space advances; Left/Right adjusts heading by 5°; D toggles the labeled true-position debug view; R restarts.
- Buttons, sliders and selects retain their native keyboard behavior.
- Use Fullscreen to enter fullscreen. Escape exits it. Browser permissions may restrict fullscreen or downloads in embedded previews.
- Switch English, Brazilian Portuguese or Spanish without starting a new mission.
- On narrow screens, expand or collapse the mission radio with its arrow button.

A depleted measurement budget does not prevent navigation with the sensor off. GPS consistency describes agreement with the current estimated region; it is not a guaranteed probability that a signal is honest.

## Results and replay

A perfect rescue requires reaching the capsule and identifying all three attack types. False alarms are reported separately. A rescue can succeed with missed attacks; finishing outside the rescue radius produces the deceived ending.

The replay shows actual, GPS and inertial routes, an attack timeline, measurement counts and phase candidates. The replay ship is the actual position; during ordinary play it represents the estimated position. Historical replay omits posterior heatmaps because per-turn posterior snapshots are not stored.

Export Decisions saves the mission's JSON. It preserves observations and decisions for inspection and Python circuit replay; changing the language does not translate the JSON schema.

## Checks

From the repository root:

```sh
node tests/game-core.cjs
node tests/estimator.cjs
node --test tests/localization.cjs
python -m pytest tests/test_sensor.py -q
```

These checks exercise controller rules, sensor formulas, estimation and translation coverage. Browser review still matters for layout, focus, language switching, fullscreen and actual file downloads; automated catalog tests cannot certify all rendered states or accessibility compliance.

## Quantum replay and packaging

The browser samples Born probabilities offline. [../sensor.py](../sensor.py) builds Qiskit circuits. [../scripts/replay_session.py](../scripts/replay_session.py) batches all session circuit PUBs into one sampler.run call. It uses saved world/phases and fresh Qiskit samples, rather than recreating the browser's random-number stream.

```sh
python scripts/replay_session.py examples/session-seed-20261011.json
python scripts/package_qollab.py
```

The replay script also accepts `--validate-only` and `--output <report.json>`.

The package generator writes `dist/qollab/` and `dist/ghost-route-qollab.zip`. Local tests or package generation do not establish successful execution on Qollab.

## Vercel

Import [Ghost Route on GitHub](https://github.com/SouBeatrizKaroline/QollabQuantumHackathon_GhostRoute), use the repository root, select **Other**, leave the build command empty and set the output directory to **public**. The root `vercel.json` contains these static settings.

Vercel serves the frontend only. See [Vercel's build configuration](https://vercel.com/docs/builds/configure-a-build) for the deployment controls.

## Credits

QuantGirls; user-provided visual references; original procedural pixel sprites and title; AI development assistance disclosed in the README. MIT license.

This effort is supported by Qollab & IonQ
