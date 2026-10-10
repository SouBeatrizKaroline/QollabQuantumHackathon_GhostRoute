"""Replay bridge regressions against the real Qiskit local sampler."""
from copy import deepcopy
import importlib.util
import json
import math
from pathlib import Path
import sys

import pytest
from qiskit.primitives import StatevectorSampler

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
spec = importlib.util.spec_from_file_location("replay_session", ROOT / "scripts/replay_session.py")
bridge = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)
from sensor import estimar_fase, prob_um


@pytest.fixture
def session():
    return json.loads((ROOT / "examples/session-seed-20261011.json").read_text(encoding="utf-8"))


class CountingSampler:
    def __init__(self):
        self.calls = 0
        self.pubs = []
        self.delegate = StatevectorSampler(seed=11)

    def run(self, pubs):
        self.calls += 1
        self.pubs = pubs
        return self.delegate.run(pubs)


def set_shots(session, allocations, modes=None):
    remaining = 6000
    for index, (record, shots) in enumerate(zip(session["registros_turnos"], allocations)):
        mode = modes[index] if modes else record["sensorMode"]
        record.update(sensorMode=mode if shots else "none", shots=shots, NX=shots // 2, NY=shots // 2)
        record["kX"] = int(shots * 0.3)
        record["kY"] = int(shots * 0.2)
        record["phaseCandidates"] = estimar_fase(record["kX"], record["NX"], record["kY"], record["NY"], 3 if mode == "ghz" else 1) if shots else []
        remaining -= shots
        record["remainingShots"] = remaining
    session["estatisticas_finais"]["shots_economizados"] = remaining


def test_whole_session_uses_one_job_and_24_small_circuits(session):
    sampler = CountingSampler()
    report = bridge.replay_session(session, sampler=sampler)
    assert sampler.calls == 1
    assert len(sampler.pubs) == 24
    assert all(pub[0].num_qubits <= 3 for pub in sampler.pubs)
    assert report["execution"]["submittedJobs"] == 1
    assert report["execution"]["officialQollabVerified"] is False
    assert len(report["readings"]) == 12
    for original, replayed in zip(session["registros_turnos"], report["trajectory"]):
        assert replayed["realAfter"] == original["realAfter"]
        assert replayed["gpsReported"] == original["gpsReported"]
    for reading in report["readings"]:
        fresh = reading["freshQiskit"]
        source = reading["sourceJavaScript"]
        n = 3 if reading["sensorMode"] == "ghz" else 1
        assert source["NX"] == fresh["NX"] and source["NY"] == fresh["NY"]
        for quadrature in ("X", "Y"):
            probability = prob_um(reading["phaseRadians"], n, quadrature)
            total = fresh["N" + quadrature]
            tolerance = 5 * math.sqrt(probability * (1 - probability) / total) + 0.025
            assert abs(fresh["k" + quadrature] / total - probability) <= tolerance


def test_mixed_shots_keep_each_pub_budget_in_one_job(session):
    allocations = [100, 250, 500, 1000, 0, 100, 250, 500, 1000, 0, 100, 250]
    modes = ["simple", "ghz"] * 6
    set_shots(session, allocations, modes)
    sampler = CountingSampler()
    report = bridge.replay_session(session, sampler=sampler)
    assert sampler.calls == 1
    assert [pub[2] for pub in sampler.pubs] == [shots // 2 for shots in allocations if shots for _ in range(2)]
    assert report["remainingShots"] == 6000 - sum(allocations)
    assert report["execution"]["maxQubits"] == 3


def test_no_measurements_and_validation_only_submit_no_jobs(session):
    sampler = CountingSampler()
    assert bridge.replay_session(session, sampler=sampler, validate_only=True)["execution"]["submittedJobs"] == 0
    set_shots(session, [0] * 12)
    report = bridge.replay_session(session, sampler=sampler)
    assert sampler.calls == 0
    assert report["readings"] == []
    assert report["remainingShots"] == 6000


@pytest.mark.parametrize("mutation", [
    lambda s: s.update(projeto="Rota Fantasma"),
    lambda s: s.update(versao="2.0.0"),
    lambda s: s.update(semente=True),
    lambda s: s.update(semente=2**32),
    lambda s: s.update(total_turnos=11),
    lambda s: s["registros_turnos"][1].update(turn=4),
    lambda s: s["registros_turnos"][1].update(sensorMode="invalid"),
    lambda s: s["registros_turnos"][1].update(shots=True),
    lambda s: s["registros_turnos"][1].update(kX=251),
    lambda s: s["registros_turnos"][1].update(NX=249),
    lambda s: s["registros_turnos"][1].update(realAfter=[float("nan"), 20]),
    lambda s: s["registros_turnos"][1].update(gpsReported=[100.01, 20]),
    lambda s: s["registros_turnos"][1].update(remainingShots=4999),
    lambda s: s["registros_turnos"][1].update(phaseCandidates=[]),
    lambda s: s["registros_turnos"][1].update(markedSuspicious="yes"),
    lambda s: s["registros_turnos"][1].update(realBefore=[0, 0]),
    lambda s: s["registros_turnos"][1]["commanded"].update(dx=0),
    lambda s: s["configuracao_missao"]["campo"]["anomalias"][0].update(raio_km=0),
    lambda s: s["configuracao_missao"]["campo"].update(base=float("inf")),
    lambda s: s["estatisticas_finais"].update(shots_economizados=1000),
    lambda s: s["estatisticas_finais"].update(distancia_capsula_km=999),
    lambda s: s["registros_turnos"].append(deepcopy(s["registros_turnos"][-1])),
])
def test_invalid_export_is_rejected_before_any_job(session, mutation):
    mutation(session)
    sampler = CountingSampler()
    with pytest.raises(bridge.SessionValidationError):
        bridge.replay_session(session, sampler=sampler)
    assert sampler.calls == 0


def test_cli_validation_report_can_be_saved_without_a_job(session, tmp_path):
    report_path = tmp_path / "nested" / "validation-report.json"
    assert bridge.main([str(ROOT / "examples/session-seed-20261011.json"), "--validate-only", "--output", str(report_path)]) == 0
    report = json.loads(report_path.read_text(encoding="utf-8"))
    assert report["valid"] is True
    assert report["execution"]["validateOnly"] is True
    assert report["execution"]["submittedJobs"] == 0


def test_json_nan_is_rejected_when_loading(tmp_path):
    malformed = tmp_path / "malformed.json"
    malformed.write_text('{"value":NaN}', encoding="utf-8")
    with pytest.raises(bridge.SessionValidationError, match="non-finite"):
        bridge.load_session(malformed)
