"""Run the Qollab entrypoint with a real local Qiskit backend, not the platform."""

import ast
import importlib.util
import math
from pathlib import Path
import sys

import pytest
from qiskit.providers.basic_provider import BasicSimulator

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
spec = importlib.util.spec_from_file_location("qollab_entry", ROOT / "main.py")
entry = importlib.util.module_from_spec(spec)
spec.loader.exec_module(entry)


class CountingBackend:
    def __init__(self):
        self.calls = []
        self.delegate = BasicSimulator()

    def run(self, circuit, shots):
        self.calls.append((circuit, shots))
        return self.delegate.run(circuit, shots=shots, seed_simulator=41)


def test_entrypoint_honors_selected_backend_with_one_combined_circuit(monkeypatch, capsys):
    backend = CountingBackend()
    monkeypatch.setattr(entry, "backend", backend, raising=False)
    report = entry.main(phi=1.1, shots=2000)
    assert len(backend.calls) == 1
    circuit, shots = backend.calls[0]
    assert shots == 2000
    assert circuit.num_qubits == 8 and circuit.num_clbits == 4
    assert [register.name for register in circuit.cregs] == ["m0", "m1", "m2", "m3"]
    assert report["shotsPerQuadrature"] == shots
    assert [reading["n"] for reading in report["readings"]] == [1, 3]
    for reading in report["readings"]:
        n = reading["n"]
        assert len(reading["phaseCandidates"]) == n
        assert min(abs(candidate - 1.1) for candidate in reading["phaseCandidates"]) < 0.1
        for quadrature in ("X", "Y"):
            probability = reading["theory"][quadrature]
            tolerance = 5 * math.sqrt(probability * (1 - probability) / shots) + 0.01
            assert abs(reading["k" + quadrature] / shots - probability) < tolerance
    output = capsys.readouterr().out
    assert "This effort is supported by Qollab & IonQ" in output
    assert "one job" in output and "three possible phase candidates" in output


@pytest.mark.parametrize("phi,shots", [
    (float("nan"), 100), (float("inf"), 100), (True, 100), ("1.1", 100),
    (1.1, 0), (1.1, -1), (1.1, True), (1.1, 100.5), (1.1, "100"),
])
def test_bad_inputs_are_rejected_before_any_job(monkeypatch, phi, shots):
    backend = CountingBackend()
    monkeypatch.setattr(entry, "backend", backend, raising=False)
    with pytest.raises(ValueError):
        entry.main(phi=phi, shots=shots)
    assert backend.calls == []


def test_entrypoint_requires_qollab_injected_backend(monkeypatch):
    monkeypatch.delattr(entry, "backend", raising=False)
    with pytest.raises(RuntimeError, match="Qollab.*supplies the backend"):
        entry.main()


def test_import_does_not_run_a_job_or_call_qollab_main_twice():
    backend = CountingBackend()
    isolated = importlib.util.module_from_spec(spec)
    isolated.backend = backend
    spec.loader.exec_module(isolated)
    assert backend.calls == []
    source = (ROOT / "main.py").read_text(encoding="utf-8")
    assert "def main(phi: float = 1.1, shots: int = 1000):" in source
    tree = ast.parse(source)
    assert not any(isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "main" for node in ast.walk(tree))
    assert "StatevectorSampler" not in source and "BasicSimulator" not in source
