# Hackathon references and project decisions

Project: **Ghost Route** · Team: QuantGirls · Track intention: Quantum Playground

This effort is supported by Qollab & IonQ

## Official references

Use the current official pages when preparing the submission:

- [Hackathon program](https://qollab.xyz/programs/hackathon)
- [Timeline and process](https://qollab.xyz/programs/hackathon/how-it-works)
- [Rules and terms](https://qollab.xyz/programs/hackathon/terms)
- [Runtime environment](https://qollab.xyz/learn/docs/runtime-environment)
- [JS / Qiskit projects](https://qollab.xyz/learn/docs/js-qiskit-projects)
- [Circuit compilation and backends](https://qollab.xyz/learn/docs/how-your-circuit-is-compiled)
- [Error mitigation](https://qollab.xyz/learn/docs/error-mitigation)
- [Creating a project](https://qollab.xyz/learn/building-your-first-qollab-project/create-project)

These are source links, not evidence that a particular uploaded version ran successfully. Confirm the current deadline, required submission artifacts and runtime limits on the platform. This revision does not establish a newly verified deadline or platform execution result.

## Project implementation decisions

| Area | Ghost Route implementation |
| --- | --- |
| Browser game | Maintained in `public/`; static Vercel deployment uses output directory `public` and no build. |
| Quantum entrypoint | Canonical root `sensor.py` builds Qiskit circuits. Browser sensing uses offline Born sampling. |
| Session verification | `scripts/replay_session.py` takes saved positions/phases as references and batches all circuit PUBs in one sampler.run call. Python samples are fresh, not identical to JavaScript outcomes. |
| Distribution | `scripts/package_qollab.py` generates ignored `dist/qollab/` and `dist/ghost-route-qollab.zip`; there is no maintained second source copy. |
| Model | A fictional 100 × 100 km field, 12 turns, current noise, a reef and programmed GPS attacks. It is a teaching model, not an operational navigation system. |
| Sensor trade-off | Simple and three-qubit GHZ phase responses; GHZ phase ambiguity is retained. Scalar readings do not identify a unique coordinate. |
| Language | English, Brazilian Portuguese and Spanish catalog in `public/assets/js/i18n.js`. Proper names retain their spelling. |
| Accessibility | Keyboard controls, readable contrast, focus and reduced motion are implementation goals. Formal conformance requires a broader audit. |
| Attribution and licensing | MIT license; exact Qollab/IonQ attribution preserved. |
| Demo and project page | Drafts in `docs/demo-script.md` and `docs/project-page.md`; upload and public-link validation remain submission tasks. |

## Disclosures

Gemini Spark assisted the initial project. OpenAI Codex assisted the fullscreen pixel-art interface, localization, QA and repository organization. The team's visual references guided the art direction. Review this account against actual contributions before publishing.

The frontend uses native HTML, CSS and Canvas without external runtime libraries. Python dependencies are declared in `requirements.txt`: Qiskit, NumPy, Matplotlib and pytest. Do not describe the Python environment as dependency-free or fix its Qiskit version to a stale 1.x label.
