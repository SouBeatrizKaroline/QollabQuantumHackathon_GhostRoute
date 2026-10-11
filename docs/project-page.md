# Project overview — for judges, educators and partners

**English** · [Português (Brasil)](pt-BR/project-page.md) · [Português (Portugal)](pt-PT/project-page.md) · [Español](es/project-page.md)

**Ghost Route makes uncertainty playable.** A rescue story gives a concrete reason to compare navigation signals, manage a simulated quantum sensor and learn from the consequences.

## The experience

The player steers SPOOFED to the Aurora-1 capsule while deceptive GPS readings and physical hazards challenge the route. Quoora explains each new mechanic. One hundred named missions move from a safe tutorial to stronger currents, more constrained passages and tighter rescue precision. Four languages, original sounds and responsive pixel art support a broad audience.

The core loop is **steer → measure → compare → decide → replay**. The replay makes hidden attacks visible and exports decisions for further investigation.

## What the quantum contribution actually is

Ramsey interference determines X/Y measurement probabilities. Three-qubit GHZ changes the response to 3φ and leaves three phase candidates. A Bayesian position grid combines measurements and motion; GPS consistency is checked against a 95% credible region. The sensing tradeoff affects the player's decisions rather than serving as decoration.

The browser samples the model analytically. Separate Qiskit code supports circuit evaluation, and a Qollab entry point combines Simple/GHZ X/Y in one eight-qubit job. Actual platform execution needs its own evidence. [Technical details](technical-guide.md).

## Evidence at a glance

| Claim | Where to inspect it |
| --- | --- |
| Playable campaign and introductions | [Player guide](game-guide.md), public/ |
| Quantum model and circuit implementation | sensor.py, main.py, [technical guide](technical-guide.md) |
| Reproducible decisions | JSON export and scripts/replay_session.py |
| Tested scope and limitations | [Verification report](qa-report.md) |
| Submission materials and missing evidence | [Checklist](submission-checklist.md) |

## Product vision

The strongest next step is an **educational pilot**: test whether players can explain ambiguity, recognize unreliable readings and make better measurement-budget decisions after play.

Potential extensions include teacher-led lesson plans, configurable scenarios and comparisons against classical navigation strategies. These are proposed developments, not shipped features. A training product for operational maritime use would require separate validation and domain expertise.

Partnership or investment discussions should start with the playable prototype and a measurable pilot plan. This repository does not claim revenue, users, validated market demand or demonstrated learning gains.

## A useful evaluation sequence

Play level 00, open an advanced mission, compare Simple/GHZ behavior, inspect a saved decision export and review the circuit code. Use the [demo script](demo-script.md) for a short presentation.

QuantGirls · [MIT license](../LICENSE) · [Credits](../README.md)

This effort is supported by Qollab & IonQ

## Scientific origin and submission disclosure

The sensor is an educational model of established Ramsey/GHZ techniques, inspired by magnetic navigation research. The maritime scenario and synthetic map adapt those ideas for play. The Bayesian grid is classical; neither the browser nor the circuit entry point measures a real magnetic field. [Scientific basis, source-to-code mapping and full bibliography](scientific-basis.md).

For the hackathon, the original contribution is the playable integration and sensing tradeoff, not new physics or a reproduction of Ironstone Opal. External work and AI assistance are disclosed separately. Keep these references with the published project page and package.

## Ready-to-adapt submission summary

**Ghost Route — QuantGirls · intended theme: Quantum Playground.** A four-language pixel-art rescue game about deciding which navigation evidence to trust when GPS is deceptive. Players steer, budget simulated measurements, compare Simple/GHZ ambiguity and inspect their decisions in replay. The browser runs an analytical educational model; a separate Qiskit entry point demonstrates Simple/GHZ X/Y in one eight-qubit circuit and one backend job.

- Play: https://ghostroutegame.vercel.app/
- Source: https://github.com/SouBeatrizKaroline/QollabQuantumHackathon_GhostRoute
- Scientific references: [full bibliography](scientific-basis.md).
- Qollab project URL, backend/run evidence and video: **pending team confirmation**; fill in actual links before submitting.

## Educational pilot acceptance criteria

Proposed pilot: observe whether new players finish level 00 without assistance, explain why GHZ creates ambiguity, and compare uncertain readings before acting. Collect completion, assistance requests and pre/post understanding; do not treat these as measured outcomes yet. Interface release criteria: no unnecessary menu scrolling at supported screen sizes, readable language variants, controls free of overlap, and accessible help/replay when content needs scrolling.
