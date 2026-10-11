# Scientific basis, external references and simplifications

**English** · [Português (Brasil)](pt-BR/scientific-basis.md) · [Português (Portugal)](pt-PT/scientific-basis.md) · [Español](es/scientific-basis.md)

Ghost Route is based on real quantum sensing and navigation techniques in an educational, simplified form. The team researched them after reading the Q-CTRL news. The contribution is their integration into a rescue game; the team does not claim to have invented Ramsey interferometry, GHZ states or Bayesian localization.

## How the sources relate to the implementation

| Foundation | Source | Implementation and scope |
| --- | --- | --- |
| Ramsey interference | [1] | `sensor.py` prepares superposition, encodes a supplied phase with RZ and reads X/Y. |
| GHZ phase response | [2–4] | Three entangled qubits accumulate 3φ; decoding retains three phase candidates. Higher local phase sensitivity does not guarantee a unique position or a practical precision advantage. |
| Magnetic map matching without GPS | [5] and Q-CTRL case study | Inspiration for comparing independent navigation evidence. Published tests concern airborne/ground vehicles; Ghost Route's maritime setting is an educational adaptation. |
| Bayesian grid localization | [6] | `BayesianGridEstimator` in `engine.js` predicts movement and updates cell probabilities from the measurement likelihood. This estimator is classical. |

## What the prototype simplifies

- `calcB` adds four synthetic Gaussian anomalies to a baseline; it is not an ocean survey or a real seabed map. `calcPhi` uses φ = κB with a game constant, rather than a calibrated physical sensor.
- X: P(1) = sin²(nφ/2); Y: P(1) = (1 − sin(nφ))/2. These are the ideal probabilities for the implemented preparation/readout convention. X/Y together estimate nφ modulo 2π; GHZ n=3 therefore gives three **phases**, not necessarily three geographic locations.
- The browser draws binomial samples. Local Qiskit and the Qollab entry point reproduce the statistics of a supplied phase. Neither measures Earth's field. Qollab execution on a simulator or QPU requires its own run evidence; the game has no live sensor or IonQ connection.
- Finite-shot sampling and modeled movement noise exist. Decoherence, gate/readout errors, magnetic interference and sensor calibration are not modeled. An actual noisy backend can affect circuit results.
- The 95% credible region tests GPS consistency **under the model**; it is not a 95% spoofing detector or a safety guarantee. Results from Q-CTRL cannot be transferred to this game.

## Original work and external attribution

The campaign, rescue narrative, controls, visual presentation and integration of sensing choices with replay are the project's contribution. The scientific principles above are externally sourced. Citation identifies inspiration; it does not assert a partnership with Q-CTRL, access to proprietary algorithms, or incorporation of its hardware/software. Keep software/AI/visual credits in the README and confirm the contribution timeline with the team before submission.


## Bibliography

1. **Ramsey, N. F. (1950).** *A Molecular Beam Resonance Method with Separated Oscillating Fields*. Physical Review 78, 695–699. [DOI: 10.1103/PhysRev.78.695](https://doi.org/10.1103/PhysRev.78.695).
2. **Greenberger, D. M.; Horne, M. A.; Zeilinger, A. (1989).** *Going Beyond Bell's Theorem*, in *Bell's Theorem, Quantum Theory and Conceptions of the Universe*, pp. 69–72. [Author-deposited reprint, arXiv:0712.0921](https://arxiv.org/abs/0712.0921) (uploaded in 2007; original chapter: 1989).
3. **Bollinger, J. J.; Itano, W. M.; Wineland, D. J.; Heinzen, D. J. (1996).** *Optimal frequency measurements with maximally correlated states*. Physical Review A 54, R4649. [DOI: 10.1103/PhysRevA.54.R4649](https://doi.org/10.1103/PhysRevA.54.R4649).
4. **Meyer, V. et al. (2001).** *Experimental Demonstration of Entanglement-Enhanced Rotation Angle Estimation Using Trapped Ions*. Physical Review Letters 86, 5870–5873. [DOI: 10.1103/PhysRevLett.86.5870](https://doi.org/10.1103/PhysRevLett.86.5870).
5. **Muradoglu, M. et al. (2025).** *Quantum-assured magnetic navigation achieves positioning accuracy better than a strategic-grade INS in airborne and ground-based field trials*. [arXiv:2504.08167v1, 10 April 2025](https://arxiv.org/abs/2504.08167v1). Primary research preprint; identifies the actual field trials.
6. **Fox, D.; Burgard, W.; Thrun, S. (1998).** *Markov Localization for Reliable Robot Navigation and People Detection*. [Author institution, Carnegie Mellon University](https://publications.ri.cmu.edu/markov-localization-for-reliable-robot-navigation-and-people-detection). Classical probabilistic localization reference.

### Research trail supplied by the team

- **Q-CTRL.** [Delivering quantum advantage to airborne systems](https://q-ctrl.com/case-study/q-ctrl-delivering-quantum-advantage-to-airborne-systems). Company case study; engineering inspiration, not validation of Ghost Route.
- **Swayne, M. (14 April 2025), The Quantum Insider.** [Q-CTRL Overcomes GPS-denial With Quantum Sensing, Reports Quantum Advantage](https://thequantuminsider.com/2025/04/14/q-ctrl-overcomes-gps-denial-with-quantum-sensing-reports-quantum-advantage/). Secondary news/press-release coverage.
- **InnovationAus.** [Q-CTRL claims 'quantum advantage' with GPS-free navigation](https://innovationaus.com/?p=66343). Team-supplied research link; inaccessible during this review, so not used to support technical claims.

References checked on 11 October 2026 unless explicitly marked inaccessible. Bibliographic titles stay in their original language.

This effort is supported by Qollab & IonQ
