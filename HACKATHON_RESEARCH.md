# Official Hackathon Investigation & Requirements Checklist

> **Hackathon:** Qollab × IonQ Quantum Hackathon (Session 2026.10.09)  
> **Theme:** Quantum Playground  
> **Team:** QuantGirls  
> **Attribution:** *This effort is supported by Qollab & IonQ*  
> **License:** MIT License  

---

## 1. Verified Official Hackathon Information & Sources

Based on verification of the official platform pages:
- **Hackathon Overview & Program:** [Qollab Hackathon Program](https://qollab.xyz/programs/hackathon)
- **How It Works, Timeline & Prizes:** [Qollab How It Works](https://qollab.xyz/programs/hackathon/how-it-works)
- **Official Rules & Terms:** [Qollab Hackathon Terms](https://qollab.xyz/programs/hackathon/terms)
- **Compute Backends & IonQ Compilation:** [Qollab Docs — Compute Backends & Compilation](https://qollab.xyz/learn/docs/how-your-circuit-is-compiled)
- **Runtime Environment:** [Qollab Docs — Runtime Environment](https://qollab.xyz/learn/docs/runtime-environment)
- **JS / Qiskit Projects Guide:** [Qollab Docs — JS / Qiskit Projects](https://qollab.xyz/learn/docs/js-qiskit-projects)
- **Error Mitigation & Debiasing (500-Shot Floor):** [Qollab Docs — Error Mitigation](https://qollab.xyz/learn/docs/error-mitigation)
- **Project Publishing & Packaging:** [Qollab Docs — Create a Project](https://qollab.xyz/learn/building-your-first-qollab-project/create-project)

---

## 2. Requirements Checklist: Official vs. Design Choices

| Category | Requirement | Source / Rule | Classification | Status & Verification |
| :--- | :--- | :--- | :--- | :--- |
| **Deadlines** | Published Deadline: **Oct 11, 2026, at 19:00 ET** (20:00 Brasília time). Internal team target: **17:00 Brasília time**. | Official Terms & Schedule | **Official Requirement** | Verified against official timeline. 48-hour global build window (starts Oct 9 at 19:00 ET). |
| **Licensing** | Must be open-source under the **MIT License** for code and documentation. | Official Terms §1 | **Official Requirement** | Applied in `LICENSE`, `README.md`, and top of `index.html`. |
| **Attribution** | Mandatory verbatim sentence: `"This effort is supported by Qollab & IonQ"` | Official Terms §1 | **Official Requirement** | Embedded in source code header, UI footer, documentation, and metadata. |
| **Quantum Framework** | Must use the **Qiskit** framework and run on Qollab's free simulators / IonQ simulator. | Official Terms §2 | **Official Requirement** | Quantum Ramsey interferometry sensor modeled with Qiskit circuits (Python `sensor.py` and exact Born-rule sampling in JS). |
| **Compute / Backends** | IonQ execution model: 1 job per code run; 500-shot floor for debiasing. Backend provided via runtime variable. | Qollab Runtime & Backend Docs | **Official Requirement** | Do not submit jobs on every gameplay click; provide replay/verification batch circuit runner. |
| **Packaging (Qollab JS)** | Qollab JS runner requires top-level `index.html` and `main.js` (with optional `main.css`). Inline `<script>` tags inside HTML do NOT execute in the sandboxed iframe. | Qollab JS Projects Doc | **Official Requirement** | Separate Qollab package provided alongside single-file offline build. |
| **Accessibility** | Follow industry UI accessibility best practices: high contrast ($\ge 4.5:1$), readable typography ($\ge 14\text{ px}$ floor), visible focus, full keyboard support, `aria-live`. | Official Terms §2 & WCAG AA | **Official Requirement** | Implemented with semantic HTML, high-contrast palette, keyboard navigation, and live screen reader announcer. |
| **Demo & Documentation** | 2–3 minute demo video (public link opening without sign-in), project page detailing problem, quantum contribution, and reproduction instructions. | Official Terms §2 | **Official Requirement** | Planned for submission delivery package. |
| **Disclosures** | Mandatory disclosure of AI assistance, pre-existing code, templates, and third-party sources. Judging evaluates what team adds during window. | Official Terms §2 | **Official Requirement** | Disclosed in README and project submission. |
| **Game Theme & Setting** | South Atlantic 2031 rescue mission, *Aurora-1* capsule, vessel *SPOOFED*, navigator *QUOORA*, GPS spoofing by *The Ghost*. | QuantGirls Design | **Design Choice** | Fictional narrative aligned with "Quantum Playground" theme. |
| **Coordinate System** | 100 × 100 km grid, 0° North, 10 km grid lines, 7.5 km displacement per turn over 12 turns. | QuantGirls Design | **Design Choice** | Tailored to match physical drift rates and sensor measurement budget. |
| **Trilingual Support** | Complete playable interface in English, Brazilian Portuguese, and Spanish. | QuantGirls Design | **Design Choice** | Built-in zero-dependency translation dictionary `TEXTOS`. |

---

## 3. Disclosures

- **AI Assistance:** Gemini Spark utilized as collaborative developer and game designer assisting the QuantGirls team with implementation, localization, documentation, and mathematical modeling.
- **Templates & Pre-existing Code:** None. All game logic, Canvas 2D renderers, physics math, and documentation were created specifically for this hackathon submission.
- **Third-Party Libraries:** Zero runtime external dependencies. Pure vanilla JavaScript, HTML5 Canvas 2D, and CSS3 for frontend; standard Qiskit 1.x / NumPy for quantum simulation backend.
