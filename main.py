"""Qollab entrypoint: compare simple and GHZ Ramsey sensing in one job.

Qollab supplies ``backend`` from the player's QPU selection and automatically
calls the annotated ``main`` function. This module never selects a backend,
submits a job during import, or calls ``main`` a second time.
"""

from numbers import Integral

from qiskit.result import marginal_counts

from sensor import Leitura, circuito_empacotado, estimar_fase, prob_um


def main(phi: float = 1.1, shots: int = 1000):
    """Measure both quadratures for n=1 and n=3 on the selected Qollab backend."""
    if isinstance(shots, bool) or not isinstance(shots, Integral) or shots < 1:
        raise ValueError("shots must be a positive integer")
    readings = [Leitura(phi, n, quadrature) for n in (1, 3) for quadrature in ("X", "Y")]
    circuit = circuito_empacotado(readings)
    selected_backend = globals().get("backend")
    if selected_backend is None:
        raise RuntimeError("Run main.py in Qollab: its runtime supplies the backend selected in the QPU dialog")

    # All four readings share one eight-qubit circuit and one backend.run call.
    counts = selected_backend.run(circuit, shots=int(shots)).result().get_counts(circuit)
    if sum(counts.values()) != shots:
        raise RuntimeError("The backend returned a count total different from the requested shots")
    ones = [marginal_counts(counts, indices=[index]).get("1", 0) for index in range(len(readings))]
    report = {"phaseRadians": readings[0].phi, "shotsPerQuadrature": int(shots), "qubits": circuit.num_qubits, "readings": []}
    print("Ghost Route — QuantGirls")
    print("This effort is supported by Qollab & IonQ")
    print(f"One circuit, one job: {circuit.num_qubits} qubits; {shots} shots per quadrature")
    print(f"Reference phase: {readings[0].phi:.6f} rad")
    for index, n in enumerate((1, 3)):
        kx, ky = ones[2 * index:2 * index + 2]
        candidates = estimar_fase(kx, shots, ky, shots, n)
        probabilities = {axis: prob_um(readings[0].phi, n, axis) for axis in ("X", "Y")}
        report["readings"].append({"n": n, "kX": kx, "kY": ky, "theory": probabilities, "phaseCandidates": candidates})
        label = "Simple sensor" if n == 1 else "GHZ sensor"
        print(f"{label} (n={n}): X1={kx}/{shots}; Y1={ky}/{shots}")
        print(f"  Born probabilities: P_X(1)={probabilities['X']:.6f}; P_Y(1)={probabilities['Y']:.6f}")
        print("  Phase candidates (rad): " + ", ".join(f"{phase:.6f}" for phase in candidates))
    print("The GHZ response magnifies the phase and retains three possible phase candidates.")
    return report
