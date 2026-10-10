# Official Submission Checklist — Qollab × IonQ Quantum Hackathon 2026

> **Team:** QuantGirls  
> **Project:** Rota Fantasma (Ghost Route)  
> **Attribution:** *This effort is supported by Qollab & IonQ*  
> **License:** MIT License  

---

| Official Requirement | Criteria & Details | Delivered Artifact / Proof |
| :--- | :--- | :--- |
| **Qiskit Framework Integration** | Project must model quantum circuits and run on Qollab/IonQ simulators. | `sensor.py`, `test_sensor.py`, and `grafico_franjas.py` implementing Ramsey interferometry ($n=1$ and GHZ $n=3$). |
| **Attribution Statement** | Must include `"This effort is supported by Qollab & IonQ"` verbatim. | Included in all source code headers, UI footer in `index.html`, and `README.md`. |
| **Open Source Licensing** | MIT License for all code and documentation. | `LICENSE` file containing standard MIT terms with QuantGirls Team attribution. |
| **UI Accessibility** | WCAG AA / AAA compliance, $\ge 4.5:1$ contrast ratio, font floor $\ge 14\text{ px}$, full keyboard navigation, ARIA live region. | Implemented in `index.html` with semantic controls, shortcuts (`Enter`, `Arrows`, `D`, `R`), high-contrast 16-bit theme, and `aria-live="polite"` announcer. |
| **Trilingual Localization** | Complete interface in English, Brazilian Portuguese, and Spanish. | Embedded dictionary `TEXTOS` in `index.html` supporting dynamic language switching without game reset. |
| **Qollab Packaging Format** | Qollab JS format requires top-level `index.html`, `main.js`, `main.css`. No inline `<script>` tags in sandbox. | Standalone `index.html` alongside dedicated `qollab_package/` directory. |
| **IonQ Compute Execution Model** | One job per code run; 500-shot floor for debiasing; no job spamming per click. | Browser samples exact Born-rule distributions; Python batch circuit provides verifiable single-job execution. |
| **Scientific Accuracy** | Ramsey interferometry with single qubit and GHZ states, 3-fold phase ambiguity, Bayesian grid updating. | Formalized in `sensor.py` and `BayesianGridEstimator` in `index.html`. |
| **2–3 Minute Demo Video Plan** | Public video link opening without sign-in. | Complete narration script with Quoora as narrator and trilingual subtitles in `DEMO_SCRIPT.md`. |
| **Official Project Page Text** | Comprehensive text covering problem, gameplay, quantum contribution, and reproduction instructions. | Prepared in `PROJECT_PAGE.md`. |
| **Reproducible Export & Validation** | JSON export containing seed, decisions, and measurement outcomes. | Built-in "Export Decisions (JSON)" button in replay debriefing dialog. |
