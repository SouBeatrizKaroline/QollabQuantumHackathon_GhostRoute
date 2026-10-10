# Hackathon references and implementation decisions

Reviewed on 2026-10-10 using official HTML pages and the program text supplied by the team.

This effort is supported by Qollab & IonQ

The [process and FAQ](https://qollab.xyz/programs/hackathon/how-it-works) require a public, runnable Qiskit project on Qollab under MIT, a project explanation, a public 2–3 minute demo and disclosure of starting code. A supporting frontend is permitted elsewhere, but its repository must be public without sign-in, MIT-licensed and dependency-documented.

The [rules](https://qollab.xyz/programs/hackathon/terms) set the build window to Oct 9–11, 2026, 19:00 ET to 19:00 ET. They require the exact attribution above. Intended theme: Quantum Playground. Sensor interference and GHZ ambiguity affect navigation; quantum behavior is more than random-number generation. This is a fictional teaching model, without a claim of operational navigation accuracy or demonstrated quantum advantage over a strong classical baseline.

The [runtime documentation](https://qollab.xyz/learn/docs/runtime-environment) specifies root main.py for Python projects, the pre-created backend, annotated one-line main signatures and one backend job per IonQ run. The earlier sensor-only package lacked that entrypoint. main.py now packs n=1 X/Y and n=3 X/Y into one eight-qubit circuit, uses the selected backend and is not called manually. Running the actual upload on Qollab remains necessary.

| Area | Implementation |
| --- | --- |
| Frontend | Native HTML/CSS/Canvas in public/, with static Vercel output public/ and no build step. |
| Brand | Original Ghost Route beacon/ship mark, naval palette and pixel interface; SPOOFED remains the vessel name. |
| Ship | 32 cached pixel perspectives; upright mast, fixed anchor and shortest-path bearing transitions. |
| Campaign | 100 deterministic configurations, levels 00–99, four-turn guided introduction, then progressively harder currents, attacks, resources and rescue precision. |
| Languages | English, Portuguese Portugal (default), Portuguese Brazil and Spanish; 185 matching keys. |
| Qiskit sensor | Canonical sensor.py module and Qollab main.py entrypoint. Browser sampling stays distinct from actual circuit execution. |
| Local verification | scripts/replay_session.py supports campaign 1.1.0 and archived 1.0.0, validates before submitting and batches circuits in one Sampler V2 call. Its multiple-circuit replay is not advertised as the Qollab demo. |
| Distribution | scripts/package_qollab.py generates ignored dist/qollab/ and dist/ghost-route-qollab.zip, without a maintained duplicate source. |

GitHub was private when checked. Public repository visibility, Qollab publication and successful free simulator runs, final video, verified prior-work disclosure and captain submission remain external eligibility steps. See [submission-checklist.md](submission-checklist.md).

