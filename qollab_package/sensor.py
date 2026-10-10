"""
Rota Fantasma — Quantum Ramsey Interferometry Sensor
Qollab × IonQ Quantum Hackathon 2026 — Team QuantGirls

Attribution: This effort is supported by Qollab & IonQ
License: MIT License
"""

import numpy as np

# Mission Magnetic Field Parameters
KAPPA = 1.0
B_BASE = 2.0
ANOMALIES = [
    {"x": 25.0, "y": 30.0, "amplitude": 2.5, "raio_km": 9.0},
    {"x": 45.0, "y": 45.0, "amplitude": -1.8, "raio_km": 12.0},
    {"x": 60.0, "y": 65.0, "amplitude": 2.0, "raio_km": 8.0},
    {"x": 75.0, "y": 80.0, "amplitude": -1.5, "raio_km": 10.0}
]

def calculate_magnetic_field(x: float, y: float) -> float:
    """
    Computes scalar seabed magnetic field B(x, y) with 4 Gaussian anomalies.
    B(x, y) = base + sum(amplitude_i * exp(-d_i^2 / (2 * radius_i^2)))
    """
    b = B_BASE
    for a in ANOMALIES:
        dx = x - a["x"]
        dy = y - a["y"]
        d2 = dx * dx + dy * dy
        r2 = a["raio_km"] * a["raio_km"]
        b += a["amplitude"] * np.exp(-d2 / (2.0 * r2))
    return float(b)

def calculate_phase(x: float, y: float) -> float:
    """Computes accumulated phase phi(x, y) = kappa * B(x, y)."""
    return float(KAPPA * calculate_magnetic_field(x, y))

def theoretical_probabilities(phi: float, n: int = 1):
    """
    Computes Born-rule measurement probabilities for Ramsey interferometry.
    pX = sin^2(n * phi / 2)
    pY = (1 - sin(n * phi)) / 2
    """
    pX = np.sin(n * phi / 2.0) ** 2
    pY = (1.0 - np.sin(n * phi)) / 2.0
    return float(pX), float(pY)

def reconstruct_phase_candidates(kx: int, nx: int, ky: int, ny: int, n: int = 1):
    """
    Reconstructs candidate phase estimates from measurement counts.
    cos(n * phi) ~ 1 - 2 * kx / nx
    sin(n * phi) ~ 1 - 2 * ky / ny
    phaseN = atan2(sin, cos) mod 2pi
    phi_k = (phaseN + 2pi * k) / n, for k = 0 ... n - 1
    """
    cos_val = 1.0 - 2.0 * (kx / max(1, nx))
    sin_val = 1.0 - 2.0 * (ky / max(1, ny))

    # Clamp to valid trigonometric bounds
    cos_val = np.clip(cos_val, -1.0, 1.0)
    sin_val = np.clip(sin_val, -1.0, 1.0)

    phase_n = np.arctan2(sin_val, cos_val) % (2.0 * np.pi)
    candidates = [float((phase_n + 2.0 * np.pi * k) / n) for k in range(n)]
    return candidates

def build_qiskit_ramsey_circuit(phi: float, n: int = 1, quadrature: str = 'X'):
    """
    Constructs a Qiskit QuantumCircuit for Ramsey interferometry.
    For n=1 (single qubit):
      |0> -> H -> Rz(phi) -> H (or S^dagger H for Y) -> Measure
    For n=3 (GHZ state):
      |000> -> H on q0, CX(0,1), CX(0,2) -> Rz(phi) on all qubits -> Entanglement uncoupling -> H -> Measure
    """
    try:
        from qiskit import QuantumCircuit
    except ImportError:
        return None

    if n == 1:
        qc = QuantumCircuit(1, 1)
        qc.h(0)
        qc.rz(phi, 0)
        if quadrature == 'Y':
            qc.sdg(0)
        qc.h(0)
        qc.measure(0, 0)
        return qc
    elif n == 3:
        qc = QuantumCircuit(3, 1)
        qc.h(0)
        qc.cx(0, 1)
        qc.cx(1, 2)
        for q in range(3):
            qc.rz(phi, q)
        if quadrature == 'Y':
            qc.rz(-np.pi / 2.0, 0)
        qc.cx(1, 2)
        qc.cx(0, 1)
        qc.h(0)
        qc.measure(0, 0)
        return qc
    else:
        raise ValueError(f"Unsupported mode n={n}. Only n=1 and n=3 supported.")
