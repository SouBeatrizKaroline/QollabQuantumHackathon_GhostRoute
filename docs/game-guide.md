# Ghost Route game guide

Open [../public/index.html](../public/index.html), keeping the assets folder in place, or serve `public/` as a static website. There are no frontend dependencies or compilation steps.

## Mission and controls

Rescue Aurora-1 while steering SPOOFED around the charted reef. The campaign contains **100 levels, 00–99**. Level 00 is a guided four-turn introduction: keep a northeast heading while Quoora explains the helm, sensor and GPS comparison. Early voyages gradually extend across the chart. Rocks and gentle currents start at level 01, GPS jumps at 03, GHZ at 06, the central reef / blackout / GPS drift at 10, and GPS freeze at 30. GHZ is unavailable before level 06. Each mechanic is explained before use, including when jumping to an advanced level. Subsequent levels add more rocks, false signals, stronger currents, fewer sensor measurements and a smaller rescue radius.

Use **Menu** to choose any level. Its briefing shows the mission's turn limit, measurement budget and rescue radius. Missions last 4–12 turns, each representing 20 minutes. Speed and current noise depend on the selected level. To complete a level, finish inside its rescue radius without crossing the reef or a rock; completed levels receive a check mark. A successful rescue offers **Next level**.

Language, selected level and completed levels are saved locally when this browser permits storage. They are specific to the current browser and site. Storage restrictions do not prevent playing, but preferences and completion marks may be lost after reloading.

- Choose a heading using the compass buttons or slider.
- Choose Off, Simple or GHZ and allocate measurements from the level's available budget.
- Advance to see that completed turn's observations.
- Mark the displayed, observed GPS reading as suspicious. The mark belongs to that completed turn, not the next heading choice.
- On the map, Enter or Space advances; Left/Right adjusts heading by 5°; D toggles the labeled true-position debug view; R restarts. Escape opens or closes the mission menu.
- Buttons, sliders and selects retain their native keyboard behavior.
- Use Fullscreen to enter fullscreen. Escape exits it. Browser permissions may restrict fullscreen or downloads in embedded previews.
- Switch **Português (Brasil)**, **English** or **Español** without starting a new mission. Brazilian Portuguese is the default.
- On narrow screens, expand or collapse the mission radio with its arrow button.

A depleted measurement budget does not prevent navigation with the sensor off. GPS consistency describes agreement with the current estimated region; it is not a guaranteed probability that a signal is honest.

The menu includes a navigation guide, language and fullscreen controls, restart and decision export. The game uses its own pixel ship emblem and nautical palette. SPOOFED has 32 pixel-art viewing directions, with an upright mast and a wake that follows its heading. Reduced-motion preferences disable the animated turn transition.

The archived example session uses the original mission: twelve turns, 7.5 km per turn, a 6,000-measurement budget and a 2 km rescue radius. Those fixed values describe that example, rather than every campaign level.

## Results and replay

A perfect rescue requires reaching the capsule and identifying every attack type present in the selected mission. Level 00 has no attacks; later levels introduce GPS jump, drift and freeze attacks. False alarms are reported separately. A rescue can succeed with missed attacks; finishing outside the rescue radius produces the deceived ending.

The replay shows actual, GPS and inertial routes, an attack timeline, measurement counts and phase candidates. The replay ship is the actual position; during ordinary play it represents the estimated position. Historical replay omits posterior heatmaps because per-turn posterior snapshots are not stored.

Export Decisions saves the mission's JSON. It preserves observations and decisions for inspection and Python circuit replay; changing the language does not translate the JSON schema.

## Checks

From the repository root:

```sh
node tests/game-core.cjs
node tests/estimator.cjs
node --test tests/localization.cjs
node tests/ui-state.cjs
node tests/campaign.cjs
node tests/ship-rendering.cjs
node tests/map-layout.cjs
python -m pytest tests/test_sensor.py -q
```

These checks exercise controller rules, sensor formulas, estimation and translation coverage. Browser review still matters for layout, focus, language switching, fullscreen and actual file downloads; automated catalog tests cannot certify all rendered states or accessibility compliance.

## Quantum replay and packaging

The browser samples Born probabilities offline. [../sensor.py](../sensor.py) builds Qiskit circuits. [../main.py](../main.py) is the Qollab Run entry point: it uses the platform's injected backend with one combined eight-qubit circuit containing simple and GHZ measurements in both X and Y bases. Platform execution still needs to be verified on Qollab.

[../scripts/replay_session.py](../scripts/replay_session.py) batches all session circuit PUBs into one sampler.run call. It uses saved world/phases and fresh Qiskit samples, rather than recreating the browser's random-number stream. Campaign exports include their selected mission configuration. The supplied example remains the original twelve-turn mission.

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


## Sound and languages

The mission menu and bridge language selectors offer BR (Brazilian Portuguese), PT (European Portuguese), IN (English) and ES (Spanish). The selected language applies to introductions, radio, menus and replay. Each of the 100 levels has a distinct name.

Use the menu Sound button to enable or mute original synthesized effects. The browser requires an interaction before audio starts. Audio availability does not affect gameplay. Language, sound, progress and acknowledged introductions are remembered when browser storage is available.
