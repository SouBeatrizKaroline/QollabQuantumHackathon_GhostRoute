# Submission checklist — Ghost Route

Reviewed against the official program, process, terms and runtime documentation on 2026-10-10. Team: QuantGirls. Intended theme: Quantum Playground.

This effort is supported by Qollab & IonQ

| Requirement | Evidence and remaining action |
| --- | --- |
| Qiskit and essential quantum behavior | sensor.py implements Ramsey interference, X/Y measurement and three-qubit GHZ phase amplification with ambiguity. main.py demonstrates both modes using actual Qiskit circuits. |
| Runnable project on Qollab | Root main.py is the Python entrypoint. Upload the **contents** of the extracted qollab/ folder so main.py is at the project root. Qollab calls its annotated main function automatically. |
| Selected free backend; IonQ one-job limit | main.py uses Qollab's injected backend, with four quadrature readings in one eight-qubit circuit and exactly one backend.run. Actual Qollab local and IonQ simulator runs are still required. |
| Public Qollab publication and MIT | MIT license and attribution are present. Publish on Qollab before the deadline and retain the actual public URL and successful Run result. |
| Public supporting repository | GitHub API reported the Ghost Route repository **private** on 2026-10-10. The official FAQ requires an externally hosted supporting repository to be public, MIT-licensed, dependency-documented and accessible without sign-in. Visibility was not changed during this review. |
| Project page | docs/project-page.md explains the project, sensor and run instructions. Add actual Qollab, frontend and video links before submission. |
| Public 2–3 minute video | Four narration tracks are in docs/demo-script.md. Record the working game and Qollab circuit run, upload the video and verify it opens without sign-in. A script is not a video. |
| Build-window disclosure | README lists Gemini Spark, OpenAI Codex and visual-reference assistance. Explicitly identify what existed before Oct 9, 19:00 ET and what was added during the window; the team must confirm the chronology. |
| Accessibility | Keyboard navigation, modal focus, live descriptions and reduced motion are implemented and locally tested. No formal WCAG certification is claimed. |
| Languages | EN, PT-PT, PT-BR and ES; 185 keys per locale. PT-PT is the default and the Portuguese variants use distinct wording. |
| Campaign | Levels 00–99 have distinct exported mission configurations. Tutorial 00 is a safe four-turn introduction; difficulty changes current noise, attacks, budget, route length and rescue precision. |
| Session reproducibility | Browser exports 1.1.0 campaign decisions; replay also supports archived 1.0.0 missions. The local replay validates geometry and measures fresh Qiskit counts. It is separate from the one-circuit Qollab demonstration. |
| Deadline | Official cutoff: **Oct 11, 2026, 19:00 ET** (20:00 in São Paulo). The registered captain submits the public project; registration and submission status require account evidence. |

The frontend samples Born probabilities in JavaScript. It does not call Qiskit or IonQ. Local test success and a GitHub update do not establish official publication, simulator execution or submission.

Sources: [process and FAQ](https://qollab.xyz/programs/hackathon/how-it-works), [rules and terms](https://qollab.xyz/programs/hackathon/terms), [runtime environment](https://qollab.xyz/learn/docs/runtime-environment).

