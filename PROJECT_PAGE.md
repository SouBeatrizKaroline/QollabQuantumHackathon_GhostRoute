# Rota Fantasma (Ghost Route) — Project Page

> **Hackathon Submission:** Qollab × IonQ Quantum Hackathon 2026  
> **Track:** Quantum Playground  
> **Team:** QuantGirls  
> **Attribution:** *This effort is supported by Qollab & IonQ*  
> **License:** MIT License  

---

## 🌟 Executive Summary

**Rota Fantasma** is an interactive, 16-bit retro nautical tactical game that explores quantum sensing as an alternative to vulnerable satellite navigation. Set in the South Atlantic in 2031, the player navigates the rescue ship **SPOOFED** through spoofed GPS signals to retrieve the astronauts of the **Aurora-1** space capsule. The only uncompromised positioning system on board is **QUOORA**, an experimental quantum sensor measuring geomagnetic seabed anomalies via simulated Ramsey interferometry and Greenberger-Horne-Zeilinger (GHZ) entangled states.

---

## 🔬 The Real-World Problem: GPS Vulnerability vs. Quantum Geomagnetic Navigation

Civilian and military navigation rely heavily on Global Navigation Satellite Systems (GNSS/GPS). However, GNSS signals are exceptionally faint (~$-160\text{ dBW}$ at the Earth's surface) and unencrypted, making them susceptible to **GPS Spoofing**—attacks where transmitters broadcast falsified satellite signals to covertly steer vessels off course or into navigational hazards without triggering loss-of-signal alarms.

**Quantum Magnetometry** offers a spoof-proof alternative:
- The Earth's crust possesses local, immutable magnetic anomaly maps created by ancient seabed geology.
- An onboard cold-atom or trapped-ion quantum magnetometer reads the local magnetic scalar field $B(x, y)$ in real-time.
- Because magnetic crustal anomalies cannot be spoofed remotely from satellite orbits, matching sensor readings against bathymetric magnetic charts provides autonomous positioning that cannot be jammed or hijacked.

---

## ⚛️ Essential Quantum Contribution: Ramsey Interferometry & Entangled GHZ States

The game models physical quantum sensing rather than decorative randomness:

### 1. Quantum Sensing Mechanics
A scalar magnetic field $B(x, y)$ induces an energy Zeeman shift $\Delta E \propto B(x, y)$, causing accumulated phase $\phi(x, y) = \kappa \cdot B(x, y)$ over interrogation time $\tau$.
In Ramsey interferometry:
- **Simple Mode ($n=1$):** Single qubit initialized in $\frac{|0\rangle + |1\rangle}{\sqrt{2}}$. After phase accumulation, measurements in the $X$ and $Y$ bases yield Born-rule probabilities:
  $$P_X(\phi) = \sin^2\left(\frac{\phi}{2}\right), \quad P_Y(\phi) = \frac{1 - \sin(\phi)}{2}$$
- **GHZ Entangled Mode ($n=3$):** A 3-qubit entangled state $\frac{|000\rangle + |111\rangle}{\sqrt{2}}$ accumulates phase at three times the rate:
  $$P_X(\phi) = \sin^2\left(\frac{3\phi}{2}\right), \quad P_Y(\phi) = \frac{1 - \sin(3\phi)}{2}$$
  This reaches the fundamental **Heisenberg Limit** ($\Delta \phi \sim 1/N$), offering a $3\times$ improvement in phase estimation precision over standard shot noise ($\Delta \phi \sim 1/\sqrt{N}$).

### 2. Scientific Honesty & The 3-Fold Phase Ambiguity
The game teaches real quantum metrology trade-offs:
- While GHZ states offer steeper interference fringes, the periodic trigonometric response wraps every $2\pi/3$, creating three candidate phases $\{\phi_0, \phi_1, \phi_2\}$ on the unit circle.
- A single magnetic scalar value defines an **isomagnetic contour line**, not a unique GPS coordinate.
- The onboard 2D **Bayesian Grid Estimator** integrates kinematic dead-reckoning drift with binomial measurement likelihoods in log-space, narrowing down the 95% Highest Posterior Density (HPD) credible region turn-by-turn.

---

## 🎮 Gameplay & Mechanics

1. **Strategic Energy Budget:** The vessel has a strict budget of **6,000 shots** across 12 turns (20 minutes per turn). Players must conserve shots for critical decision moments.
2. **Three Deceptive GPS Attacks:**
   - **Jump (Turn 4):** A sudden $-6\text{ km}$ westward displacement.
   - **Drift (Turns 6–10):** A slow, insidious accumulation of $+0.28\text{ km/turn East}$ and $-0.28\text{ km/turn South}$.
   - **Freeze (Turns 9–10):** GPS coordinates freeze at the Turn 8 position during thick fog, while the underlying current pushes the ship toward an uncharted reef.
3. **Hazardous Reef Polygon:** True vessel trajectory must avoid the reef `[[38, 50], [48, 50], [48, 56], [38, 56]]`. Segment-based collision detection terminates the mission if grounded.
4. **Endings & Scoreboard:**
   - **Perfect Rescue:** Reached capsule within $2.0\text{ km}$ at Turn 12 with all 3 attacks flagged and zero false alarms.
   - **Rescue:** Astronauts recovered, but at least one spoofing attack went undetected.
   - **Deceived:** Arrived at spoofed coordinates $>2.0\text{ km}$ from the real capsule.
   - **Aground:** Hull grounded on the reef.
5. **Interactive Replay Scrubber:** Scrutinize the 12 turns, compare True vs. GPS vs. Inertial routes, and inspect binomial histogram measurements for every shot taken.

---

## 🕹️ How to Run

### Option A: Standalone Browser Game (Zero Dependencies)
1. Double-click `index.html`.
2. Runs offline in any standard browser without internet, node.js, or compilation.

### Option B: Qollab Sandboxed Platform
- Open the project in Qollab's JS/Qiskit runner using the pre-packaged files in `qollab_package/` (`index.html`, `main.js`, `main.css`).

### Option C: Qiskit Python Verification
- Execute `python test_sensor.py` to run unit test suites validating Born-rule sampling and GHZ phase reconstruction.
- Execute `python grafico_franjas.py` to plot Ramsey interference fringes.
