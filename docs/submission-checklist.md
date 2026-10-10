# Submission checklist — Ghost Route

Team: QuantGirls · Qollab × IonQ hackathon · MIT license

This effort is supported by Qollab & IonQ

This checklist separates prepared artifacts from actions that still need platform or submission evidence. Review the current [official terms](https://qollab.xyz/programs/hackathon/terms) before submitting.

| Item | Repository evidence | Submission action |
| --- | --- | --- |
| Quantum implementation | Root `sensor.py`; Ramsey and GHZ tests in `tests/test_sensor.py` | Run the Python entrypoint in the intended Qollab environment and retain the actual result. |
| Analytical/circuit agreement | Python tests and `scripts/replay_session.py` | Report fresh Qiskit counts, not a claim that browser and Python RNGs produce identical counts. |
| Job batching | Replay script sends all session circuit PUBs in one sampler.run call | Confirm compatibility with the selected Qollab backend and its current shot/qubit limits. |
| Generated package | `scripts/package_qollab.py` creates ignored `dist/qollab/` and `dist/ghost-route-qollab.zip` | Generate it, inspect it and test the actual uploaded project. Generation alone is not platform verification. |
| Web frontend | `public/index.html`, `public/assets/js/`, `public/assets/css/game.css` | Test the deployed URL; keep its offline Born sampling distinct from Qiskit execution. |
| Three languages | `public/assets/js/i18n.js` and `tests/localization.cjs` | Check rendered buttons, radio, alerts, final outcomes and replay in all three languages. |
| Accessibility | Semantic controls, focus styling, live text and reduced-motion handling | Check keyboard focus and screen-reader behavior. Do not claim certified WCAG AA/AAA compliance without a complete audit. |
| Export | Decisions JSON and `examples/session-seed-20261011.json` | Download a real session and run the replay script against it. |
| Fringes | `scripts/plot_fringes.py` and `docs/assets/ramsey-fringes.png` | Regenerate the plot with the documented environment when using it as experimental evidence. |
| MIT license and attribution | `LICENSE`, README and UI attribution | Preserve the exact sentence above in the submission. |
| Project description | [project-page.md](project-page.md) | Add the actual project URL, run evidence and deployment link. |
| Demo | [demo-script.md](demo-script.md) | Record the game and circuit execution; supply the required public video link. A script is not a submitted video. |
| Contribution disclosure | README describes Gemini Spark, OpenAI Codex and visual-reference assistance | Confirm completeness, existing assets and work performed during the allowed period. |
| Deadline and eligibility | [Official hackathon program](https://qollab.xyz/programs/hackathon) | Confirm the current cutoff, timezone, track and eligibility on the platform. |
