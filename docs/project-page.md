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
