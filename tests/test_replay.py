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
    remaining = session["configuracao_missao"]["sensor"]["shots_total"]
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


def campaign_export(session, level=0, turns=4, budget=3000, speed=5.5):
    """A shorter campaign has its own movement, budget and final distance."""
    session = deepcopy(session)
    session.update(versao="1.1.0", nivel_campanha=level, total_turnos=turns)
    mission = session["configuracao_missao"]
    mission["turnos"] = turns
    mission["sensor"]["shots_total"] = budget
    mission["navio"]["velocidade_km_turno"] = speed
    session["registros_turnos"] = session["registros_turnos"][:turns]
    inertial = mission["porto"]
    for record in session["registros_turnos"]:
        radians = math.radians(record["heading"])
        dx, dy = speed * math.sin(radians), speed * math.cos(radians)
        record["commanded"] = {"dx": dx, "dy": dy}
        inertial = [max(0, min(100, inertial[0] + dx)), max(0, min(100, inertial[1] + dy))]
        record["inertial"] = inertial
    final_position = session["registros_turnos"][-1]["realAfter"] if turns else mission["porto"]
    session["estatisticas_finais"]["distancia_capsula_km"] = math.dist(final_position, mission["capsula"]["pouso_real"])
    set_shots(session, [100] * turns if budget >= turns * 100 else [0] * turns)
    return session


@pytest.mark.parametrize("level,turns,budget,speed", [(0, 4, 3000, 5.5), (99, 12, 8000, 12.0), (50, 8, 1, 7.5), (99, 12, 100000, 12.5)])
def test_campaign_version_preserves_level_and_uses_exported_limits(session, level, turns, budget, speed):
    exported = campaign_export(session, level, turns, budget, speed)
    sampler = CountingSampler()
    report = bridge.replay_session(exported, sampler=sampler, validate_only=True)
    assert sampler.calls == 0
    assert report["exportVersion"] == "1.1.0"
    assert report["campaignLevel"] == level
    assert report["totalTurns"] == turns
    assert report["remainingShots"] == exported["estatisticas_finais"]["shots_economizados"]
    assert report["trajectory"][-1]["inertial"] == exported["registros_turnos"][-1]["inertial"]


def test_campaign_replay_samples_short_mission_once_and_honors_its_budget(session):
    exported = campaign_export(session, level=7, turns=4, budget=3000)
    set_shots(exported, [100, 250, 500, 1000], ["simple", "ghz", "simple", "ghz"])
    sampler = CountingSampler()
    report = bridge.replay_session(exported, sampler=sampler)
    assert sampler.calls == 1
    assert len(sampler.pubs) == 8
    assert report["campaignLevel"] == 7
    assert report["remainingShots"] == 1150
    assert report["execution"]["officialQollabVerified"] is False
    assert [pub[2] for pub in sampler.pubs] == [50, 50, 125, 125, 250, 250, 500, 500]
    assert [reading["turn"] for reading in report["readings"]] == [1, 2, 3, 4]


@pytest.mark.parametrize("mutation", [
    lambda s: s.pop("nivel_campanha"),
    lambda s: s.update(nivel_campanha=-1),
    lambda s: s.update(nivel_campanha=100),
    lambda s: s.update(nivel_campanha=True),
    lambda s: s.update(nivel_campanha=1.5),
    lambda s: s["configuracao_missao"].update(turnos=3),
    lambda s: s["configuracao_missao"].update(turnos=13),
    lambda s: s["configuracao_missao"]["sensor"].update(shots_total=0),
    lambda s: s["configuracao_missao"]["sensor"].update(shots_total=100001),
    lambda s: s["configuracao_missao"]["sensor"].update(ghz_n=2),
    lambda s: s["configuracao_missao"]["navio"].update(velocidade_km_turno=5.49),
    lambda s: s["configuracao_missao"]["navio"].update(velocidade_km_turno=12.51),
    lambda s: s["configuracao_missao"].update(pedras={}),
    lambda s: s["configuracao_missao"].update(bancos={}),
    lambda s: s["configuracao_missao"].update(barreiras=[[[10, 10], [12, 10]]]),
    lambda s: s["configuracao_missao"].update(bancos=[[[10, 10], [12, 10], [float("inf"), 12]]]),
    lambda s: s["configuracao_missao"].update(pedras=[[[10, 10], [12, 10]]]),
    lambda s: s["configuracao_missao"].update(pedras=[[[10, 10], [12, 10], [float("inf"), 12]]]),
    lambda s: s["configuracao_missao"]["campo"]["anomalias"].pop(),
    lambda s: s["configuracao_missao"]["recife"].pop(),
    lambda s: s["configuracao_missao"]["recife"][0].__setitem__(0, float("inf")),
    lambda s: s["configuracao_missao"]["sensor"].update(shots_total=399),
    lambda s: s["registros_turnos"].append(deepcopy(s["registros_turnos"][-1])),
    lambda s: s["registros_turnos"][1].update(remainingShots=2799),
    lambda s: s["estatisticas_finais"].update(shots_economizados=6000),
])
def test_invalid_campaign_is_rejected_before_any_job(session, mutation):
    exported = campaign_export(session)
    mutation(exported)
    sampler = CountingSampler()
    with pytest.raises(bridge.SessionValidationError):
        bridge.replay_session(exported, sampler=sampler)
    assert sampler.calls == 0


@pytest.mark.parametrize("field,value", [("turnos", 4), ("shots_total", 3000)])
def test_legacy_export_cannot_claim_campaign_limits(session, field, value):
    if field == "turnos":
        session["configuracao_missao"][field] = value
    else:
        session["configuracao_missao"]["sensor"][field] = value
    with pytest.raises(bridge.SessionValidationError, match="Version 1.0.0"):
        bridge.validate_session(session)
