# Ghost Route

> **Quantum Hackathon Project — Qollab × IonQ 2026**  
> **Team:** QuantGirls  
> **Theme:** Quantum Playground  
> **Attribution:** *This effort is supported by Qollab & IonQ*  
> **License:** MIT License  

---


## Fullscreen web game

Ghost Route now has a fullscreen 16-bit pixel-art ocean, an animated ship, compass, radar, mission radio and keyboard controls. English, Brazilian Portuguese and Spanish can be switched during play. The game's name is **Ghost Route** in every language; the rescue cutter is **SPOOFED**.

Open `index.html` with `main.css`, `main.js` and `js/` beside it, or serve this repository as a static website. No frontend dependencies or build step are required. See [WEB_GAME.md](WEB_GAME.md) for controls, tests and Vercel settings.

The browser frontend samples the Ramsey Born probabilities in JavaScript. It does **not** execute Qiskit. The existing Python sensor and Qollab runner remain separate; a frontend deployment does not verify the official Qollab execution or submission.

![Ghost Route fullscreen navigation](docs/ghost-route-preview.jpg)

## 🌊 1. Project Overview & Background

**Ghost Route** is an interactive, 16-bit retro naval navigation tactical game that bridges quantum metrology with maritime security. Set in the South Atlantic in 2031, the player navigates the rescue cutter **SPOOFED**, dispatched ~300 km off the northeastern coast of Brazil to retrieve three astronauts aboard the **Aurora-1** space capsule after orbital atmospheric reentry.

In this maritime sector, an invisible adversary—**The Ghost**—actively spoofs satellite GPS signals. The vessel's conventional receivers report plausible yet falsified positioning data designed to lure the rescue cutter into treacherous seabed reefs.

The only trustworthy instrument aboard is **QUOORA**, a cybernetic quantum navigation assistant equipped with an onboard quantum magnetometer that measures the Earth's crustal magnetic fingerprint via simulated **Ramsey interferometry** and **Greenberger-Horne-Zeilinger (GHZ) entangled states**.

> *"The GPS always seems right. That is exactly why it is dangerous."*

---

## 🎮 2. Features & 16-Bit Retro Art Direction

- **16-Bit CRT Tactical Aesthetic:** Modeled after vintage naval tactical consoles and 16-bit arcade monitors with scanline simulation, deep navy (`#050c18`) and cobalt ocean tones (`#061325`), cyan radar glowing telemetry (`#00f0ff`), and an authentic radar compass rose.
- **Procedural Naval Cutter Sprite:** 16-bit pixel-art cutter *SPOOFED* complete with hull shading, naval bridge cabin, navigational bow light, rotating radar mast, and dynamic water wake.
- **Expressive Robot Avatar:** QUOORA features five 16-bit pixel-art emotional states:
  - `neutral`: Steady cyan visor for regular navigation.
  - `happy`: Uplifted brow and cheerful visor when calibrated or nearing rescue.
  - `thoughtful`: Single raised brow and amber data-processing sensor.
  - `worried`: Drooped brows and amber alert when GPS discrepancies grow.
  - `alert`: Red flashing warning eyes and open alarm beacon during reef proximity or major GPS jumps.
- **Modular Asset Architecture (`AssetRegistry`):** Sprite drawing is separate from the movement and sensing logic. The cutter is drawn in `TacticalMapRenderer.makeShip`; the Quoora avatar is drawn by `AssetRegistry.drawQuooraAvatar`. These renderers can be adapted for custom PNG or Aseprite assets.

---

## 🔬 3. Quantum Physics & Metrology

### Ramsey Interferometry
The seabed magnetic scalar field $B(x, y)$ is modeled across a 100 × 100 km grid with four Gaussian magnetic anomalies:
$$B(x, y) = B_{\text{base}} + \sum_{i=1}^4 A_i \exp\left(-\frac{(x - x_i)^2 + (y - y_i)^2}{2 r_i^2}\right)$$
The accumulated quantum phase shift is $\phi(x, y) = \kappa \cdot B(x, y)$ (with $\kappa = 1.0$, $B_{\text{base}} = 2.0$).

### Sensor Modes
1. **Simple Mode ($n = 1$):** Single-qubit Ramsey cycle.
   $$P_X(\phi) = \sin^2\left(\frac{\phi}{2}\right), \quad P_Y(\phi) = \frac{1 - \sin(\phi)}{2}$$
2. **GHZ Entangled Mode ($n = 3$):** 3-qubit maximally entangled Greenberger-Horne-Zeilinger state $|GHZ\rangle = \frac{|000\rangle + |111\rangle}{\sqrt{2}}$. The ideal measurement probabilities depend on the amplified phase:
   $$P_X(\phi) = \sin^2\left(\frac{3\phi}{2}\right), \quad P_Y(\phi) = \frac{1 - \sin(3\phi)}{2}$$

### Scientific Honesty & 3-Fold Phase Ambiguity
- While GHZ state measurement yields $3\times$ higher phase sensitivity, the periodic trigonometric response wraps every $2\pi/3$, creating three candidate phases:
  $$\phi_k = \frac{\text{atan2}(\sin, \cos) \pmod{2\pi} + 2\pi k}{3}, \quad k \in \{0, 1, 2\}$$
- A single scalar field reading identifies an **isomagnetic contour line**, not a unique geographic coordinate.
- The onboard **2D Bayesian Grid Estimator** (100 × 100 cells, 1 km resolution) updates the posterior distribution in log space using the binomial measurement likelihoods of both quadratures ($X$ and $Y$), filtering out false candidates over successive turns.

---

## ⚓ 4. Tactical Gameplay & Mission Parameters

- **Turn System:** 12 discrete turns (20 minutes per turn). Ship speed: $7.5\text{ km/turn}$.
- **Ocean Current Noise:** Gaussian current drift with $\sigma = 0.3\text{ km}$ per axis applied to true ship movement.
- **Inertial Dead Reckoning:** Kinematic dead reckoning without noise, with an uncertainty radius expanding as $r = 0.2 + 0.6 \times \text{turn}$ km.
- **Energy Budget:** 6,000 total measurement shots. Players select between 100, 250, 500, or 1,000 shots per reading.
- **Deceptive GPS Spoofing Attacks:**
  - **Turn 4 (Jump):** GPS abruptly jumps $6\text{ km}$ West.
  - **Turns 6–10 (Drift):** Sneak attack accumulating $+0.28\text{ km East}$ and $-0.28\text{ km South}$ per active turn.
  - **Turns 9–10 (Freeze):** GPS coordinates freeze at the Turn 8 position during thick fog while underlying drift continues.
  - **Turns 1–3 and 11–12:** Honest GPS signals.
- **Hazardous Reef Collision:** The reef polygon `[[38, 50], [48, 50], [48, 56], [38, 56]]` is checked using continuous line-segment intersection. Any segment crossing causes immediate grounding.

---

## 🏆 5. Mission Endings & Interactive Replay

1. **PERFECT RESCUE:** Reached the capsule within $2.0\text{ km}$ at Turn 12, with all 3 spoofing attacks flagged. False alarms are reported separately.
2. **RESCUE:** Capsule recovered within $2.0\text{ km}$, but at least one spoofing attack went undetected.
3. **DECEIVED:** Arrived at spoofed coordinates $> 2.0\text{ km}$ away from the real capsule.
4. **AGROUND:** Vessel grounded on the hazardous reef polygon.

### Interactive Replay Scrubber
- Scrub turn-by-turn through all 12 turns.
- Displays all three routes: True path (solid green), Spoofed GPS path (dashed amber), and Inertial path (dotted blue).
- Clickable measurement nodes showing binomial histograms ($k_X/N_X$ and $k_Y/N_Y$) and recovered phase candidates.
- Export all session data to standardized JSON format.

---

## 🌐 6. Trilingual Localization

The game features on-the-fly language switching via an integrated dictionary `TEXTOS`:
- **English (`en`):** Full English localization.
- **Brazilian Portuguese (`pt-BR`):** Original Portuguese briefing and dialogue.
- **Spanish (`es`):** Complete Spanish localization.

Language selection preserves all active game variables, seeds, and replay timelines.

---

## ♿ 7. Accessibility Features

- High-contrast tactical palette with visible keyboard focus.
- Responsive controls, with a collapsible radio panel on narrow screens.
- Full keyboard support: `Enter`/`Space` (advance), `Left`/`Right` Arrows (steer ±5°), `D` (toggle debug), `R` (restart).
- Screen reader `aria-live="polite"` telemetry announcer.
- Respects `prefers-reduced-motion` settings.

---

## 📁 8. Project Structure & Deliverables

```
├── index.html                   # Static 16-bit browser game loader
├── sensor.py                    # Quantum Ramsey interferometry Qiskit/Python sensor
├── test_sensor.py               # Unit test suite verifying Born-rule statistics
├── grafico_franjas.py           # Script plotting Ramsey interference fringes
├── requirements.txt             # Python dependencies (qiskit, numpy, matplotlib)
├── example_session_seed_20261011.json # Reproducible export sample
├── qollab_package/              # Qollab iframe sandbox distribution
│   ├── index.html               # Clean HTML loader without inline scripts
│   ├── main.js                  # Modular client-side game engine
│   ├── main.css                 # 16-bit retro tactical CRT styles
│   ├── sensor.py                # Companion Python quantum backend
│   └── requirements.txt         # Runner requirements
├── HACKATHON_RESEARCH.md        # Official rules, deadline, and source links
├── GIT_INSTRUCTIONS.md          # Guide for syncing with GitHub
├── PROJECT_PAGE.md              # English project page text for Qollab
├── DEMO_SCRIPT.md               # 2-3 minute video demonstration script
├── SUBMISSION_CHECKLIST.md      # Hackathon verification matrix
└── LICENSE                      # MIT Open Source License
```

---

## 🚀 9. How to Run

### Offline Web Version
Open `index.html` in a browser while keeping `main.css`, `main.js` and the `js/` directory beside it. No server or internet connection is required.

### Python Quantum Tests
```bash
python test_sensor.py
python grafico_franjas.py
```

---

## 📜 10. License & Attribution

MIT License — Copyright (c) 2026 QuantGirls Team.  
*This effort is supported by Qollab & IonQ.*


AI assistance: OpenAI Codex assisted the fullscreen UI, procedural sprites, localization and JavaScript regression checks. User-provided visual references guided the art direction.
