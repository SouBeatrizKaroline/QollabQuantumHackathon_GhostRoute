"""Replay exported Ghost Route sensor decisions in one Qiskit Sampler V2 job.

Saved browser positions are retained. Qiskit produces fresh measurement counts;
its random stream is not the JavaScript random stream used by the browser.
This command does not establish that a project was run on official Qollab/IonQ.
"""
from __future__ import annotations

import argparse
import json
import math
from numbers import Integral, Real
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from qiskit.primitives import StatevectorSampler
from sensor import Leitura, circuito_leitura, estimar_fase


class SessionValidationError(ValueError):
    """An exported session is invalid or uses an unsupported schema."""


def _object(value, field):
    if not isinstance(value, dict):
        raise SessionValidationError(f"{field} must be an object")
    return value


def _integer(value, field, minimum=0, maximum=None):
    if isinstance(value, bool) or not isinstance(value, Integral) or value < minimum or (maximum is not None and value > maximum):
        raise SessionValidationError(f"{field} must be an integer in the supported range")
    return int(value)


def _number(value, field, minimum=None, maximum=None):
    if isinstance(value, bool) or not isinstance(value, Real) or not math.isfinite(value):
        raise SessionValidationError(f"{field} must be a finite number")
    if minimum is not None and value < minimum or maximum is not None and value > maximum:
        raise SessionValidationError(f"{field} is outside the supported range")
    return float(value)


def _coordinate(value, field):
    if not isinstance(value, list) or len(value) != 2:
        raise SessionValidationError(f"{field} must contain two coordinates")
    return [_number(v, f"{field}[{i}]", 0, 100) for i, v in enumerate(value)]


def _same_coordinate(actual, expected, field):
    if any(not math.isclose(a, b, rel_tol=0, abs_tol=1e-7) for a, b in zip(actual, expected)):
        raise SessionValidationError(f"{field} disagrees with the preceding movement")


def calculate_phase(field, position):
    """Use the exported magnetic field, rather than a second hard-coded mission."""
    x, y = position
    magnetic = field["base"]
    for anomaly in field["anomalias"]:
        dx, dy = x - anomaly["x"], y - anomaly["y"]
        radius = anomaly["raio_km"]
        magnetic += anomaly["amplitude"] * math.exp(-(dx * dx + dy * dy) / (2 * radius * radius))
    phase = field["kappa"] * magnetic
    if not math.isfinite(phase):
        raise SessionValidationError("The exported magnetic field produces a non-finite phase")
    return phase


def validate_session(session):
    """Validate every record before building or submitting any quantum circuits."""
    _object(session, "session")
    version = session.get("versao")
    if session.get("projeto") != "Ghost Route" or version not in ("1.0.0", "1.1.0"):
        raise SessionValidationError("Only Ghost Route export versions 1.0.0 and 1.1.0 are supported")
    campaign = version == "1.1.0"
    if campaign:
        _integer(session.get("nivel_campanha"), "nivel_campanha", 0, 99)
    _integer(session.get("semente"), "semente", 0, 2**32 - 1)
    mission = _object(session.get("configuracao_missao"), "configuracao_missao")
    max_turns = _integer(mission.get("turnos"), "turnos", 4 if campaign else 1, 12)
    if not campaign and max_turns != 12:
        raise SessionValidationError("Version 1.0.0 requires the 12-turn mission")
    port = _coordinate(mission.get("porto"), "porto")
    ship = _object(mission.get("navio"), "navio")
    speed = _number(ship.get("velocidade_km_turno"), "velocidade_km_turno")
    if speed <= 0:
        raise SessionValidationError("velocidade_km_turno must be positive")
    if campaign and not 5.5 <= speed <= 8.5:
        raise SessionValidationError("Version 1.1.0 requires a ship speed between 5.5 and 8.5 km per turn")
    _number(ship.get("ruido_corrente_km"), "ruido_corrente_km", 0)
    sensor = _object(mission.get("sensor"), "sensor")
    budget = _integer(sensor.get("shots_total"), "shots_total", 1 if campaign else 0, 100000 if campaign else None)
    if not campaign and budget != 6000:
        raise SessionValidationError("Version 1.0.0 requires a 6000-shot budget")
    if _integer(sensor.get("ghz_n"), "ghz_n", 1, 3) != 3:
        raise SessionValidationError("Ghost Route requires GHZ n=3")
    options = sensor.get("opcoes_shots")
    if not isinstance(options, list) or len(options) != 4 or [_integer(value, "opcoes_shots") for value in options] != [100, 250, 500, 1000]:
        raise SessionValidationError("Unsupported shot allocation options")
    capsule = _object(mission.get("capsula"), "capsula")
    capsule_position = _coordinate(capsule.get("pouso_real"), "pouso_real")
    if campaign:
        reef = mission.get("recife")
        if not isinstance(reef, list) or len(reef) != 4:
            raise SessionValidationError("Version 1.1.0 requires a four-vertex reef")
        for index, vertex in enumerate(reef):
            _coordinate(vertex, f"recife[{index}]")
    field = _object(mission.get("campo"), "campo")
    _number(field.get("base"), "campo.base")
    _number(field.get("kappa"), "campo.kappa")
    anomalies = field.get("anomalias")
    if not isinstance(anomalies, list) or len(anomalies) != 4:
        raise SessionValidationError("Ghost Route requires four magnetic anomalies")
    for index, anomaly in enumerate(anomalies):
        prefix = f"campo.anomalias[{index}]"
        _object(anomaly, prefix)
        _number(anomaly.get("x"), prefix + ".x", 0, 100)
        _number(anomaly.get("y"), prefix + ".y", 0, 100)
        _number(anomaly.get("amplitude"), prefix + ".amplitude")
        radius = _number(anomaly.get("raio_km"), prefix + ".raio_km")
        if radius <= 0 or not math.isfinite(radius * radius) or radius * radius == 0:
            raise SessionValidationError(prefix + ".raio_km must have a positive finite square")
    records = session.get("registros_turnos")
    if not isinstance(records, list) or len(records) > max_turns:
        raise SessionValidationError("registros_turnos must not exceed the mission's turn limit")
    if _integer(session.get("total_turnos"), "total_turnos", 0, max_turns) != len(records):
        raise SessionValidationError("total_turnos disagrees with the record count")
    previous_real, previous_inertial = port, port
    spent = 0
    for index, record in enumerate(records):
        prefix = f"registros_turnos[{index}]"
        _object(record, prefix)
        if _integer(record.get("turn"), prefix + ".turn", 1, max_turns) != index + 1:
            raise SessionValidationError(prefix + ".turn must be contiguous and start at 1")
        heading = _number(record.get("heading"), prefix + ".heading", 0)
        if heading >= 360:
            raise SessionValidationError(prefix + ".heading must be less than 360 degrees")
        commanded = _object(record.get("commanded"), prefix + ".commanded")
        dx = _number(commanded.get("dx"), prefix + ".commanded.dx")
        dy = _number(commanded.get("dy"), prefix + ".commanded.dy")
        radians = math.radians(heading)
        _same_coordinate([dx, dy], [speed * math.sin(radians), speed * math.cos(radians)], prefix + ".commanded")
        before = _coordinate(record.get("realBefore"), prefix + ".realBefore")
        after = _coordinate(record.get("realAfter"), prefix + ".realAfter")
        _same_coordinate(before, previous_real, prefix + ".realBefore")
        _coordinate(record.get("gpsReported"), prefix + ".gpsReported")
        inertial = _coordinate(record.get("inertial"), prefix + ".inertial")
        _same_coordinate(inertial, [max(0, min(100, previous_inertial[0] + dx)), max(0, min(100, previous_inertial[1] + dy))], prefix + ".inertial")
        previous_real, previous_inertial = after, inertial
        mode = record.get("sensorMode")
        if mode not in ("none", "simple", "ghz"):
            raise SessionValidationError(prefix + ".sensorMode is unsupported")
        shots = _integer(record.get("shots"), prefix + ".shots")
        if shots not in (0, 100, 250, 500, 1000) or mode == "none" and shots:
            raise SessionValidationError(prefix + ".shots is inconsistent with its sensor mode")
        nx = _integer(record.get("NX"), prefix + ".NX")
        ny = _integer(record.get("NY"), prefix + ".NY")
        if nx + ny != shots or nx != shots // 2 or ny != shots // 2:
            raise SessionValidationError(prefix + ".NX/NY must split the allocated shots equally")
        kx = _integer(record.get("kX"), prefix + ".kX", 0, nx)
        ky = _integer(record.get("kY"), prefix + ".kY", 0, ny)
        candidates = record.get("phaseCandidates")
        n = 3 if mode == "ghz" else 1
        if not isinstance(candidates, list) or len(candidates) != (n if shots else 0):
            raise SessionValidationError(prefix + ".phaseCandidates has an invalid candidate count")
        expected = estimar_fase(kx, nx, ky, ny, n) if shots else []
        for i, (candidate, reference) in enumerate(zip(candidates, expected)):
            candidate = _number(candidate, prefix + f".phaseCandidates[{i}]", 0, 2 * math.pi)
            difference = abs(candidate - reference)
            if min(difference, 2 * math.pi - difference) > 1e-7:
                raise SessionValidationError(prefix + ".phaseCandidates disagrees with the saved counts")
        for key in ("markedSuspicious", "gpsInsideHPD"):
            if not isinstance(record.get(key), bool):
                raise SessionValidationError(prefix + f".{key} must be boolean")
        spent += shots
        if spent > budget or _integer(record.get("remainingShots"), prefix + ".remainingShots", 0, budget) != budget - spent:
            raise SessionValidationError(prefix + ".remainingShots disagrees with the shot budget")
        calculate_phase(field, after)
    final = _object(session.get("estatisticas_finais"), "estatisticas_finais")
    if _integer(final.get("shots_economizados"), "shots_economizados", 0, budget) != budget - spent:
        raise SessionValidationError("Final saved shots disagree with the accumulated budget")
    if not isinstance(final.get("casco_encalhado"), bool):
        raise SessionValidationError("casco_encalhado must be boolean")
    distance = _number(final.get("distancia_capsula_km"), "distancia_capsula_km", 0)
    if not math.isclose(distance, math.dist(previous_real, capsule_position), rel_tol=0, abs_tol=1e-7):
        raise SessionValidationError("Final capsule distance disagrees with the saved trajectory")
    return session


def load_session(path):
    def reject_constant(value):
        raise SessionValidationError(f"JSON contains the non-finite constant {value}")
    with Path(path).open(encoding="utf-8") as stream:
        return validate_session(json.load(stream, parse_constant=reject_constant))


def replay_session(session, sampler=None, validate_only=False):
    """Retain the saved world trajectory and resample its sensing decisions."""
    validate_session(session)
    records = session["registros_turnos"]
    report = {
        "project": "Ghost Route", "exportVersion": session["versao"], "seed": session["semente"],
        "valid": True, "totalTurns": len(records), "remainingShots": session["estatisticas_finais"]["shots_economizados"],
        "execution": {"submittedJobs": 0, "circuitCount": 0, "maxQubits": 0, "validateOnly": validate_only,
                      "officialQollabVerified": False, "samplerClass": None},
        "measurementNote": "Saved JavaScript counts and fresh Qiskit counts use different random streams; matching counts are not expected.",
        "trajectory": [{key: record[key] for key in ("turn", "heading", "realBefore", "realAfter", "gpsReported", "inertial", "markedSuspicious")} for record in records],
        "readings": [],
    }
    if session["versao"] == "1.1.0":
        report["campaignLevel"] = session["nivel_campanha"]
    if validate_only:
        return report
    field = session["configuracao_missao"]["campo"]
    pubs, selected = [], []
    for record in records:
        if not record["shots"]:
            continue
        n = 3 if record["sensorMode"] == "ghz" else 1
        phase = calculate_phase(field, record["realAfter"])
        pubs.extend([(circuito_leitura(Leitura(phase, n, "X")), None, record["NX"]),
                     (circuito_leitura(Leitura(phase, n, "Y")), None, record["NY"])])
        selected.append((record, phase, n))
    if not pubs:
        return report
    if sampler is None:
        sampler = StatevectorSampler(seed=session["semente"])
    # One job for the entire session. Each PUB retains its own shot allocation;
    # each circuit needs at most three qubits, instead of an enormous tensor product.
    results = sampler.run(pubs).result()
    if len(results) != len(pubs):
        raise RuntimeError("The sampler returned an unexpected number of PUB results")
    report["execution"].update(submittedJobs=1, circuitCount=len(pubs), maxQubits=max(n for _, _, n in selected), samplerClass=type(sampler).__name__)
    for index, (record, phase, n) in enumerate(selected):
        counts_x = results[2 * index].data.c.get_counts()
        counts_y = results[2 * index + 1].data.c.get_counts()
        if sum(counts_x.values()) != record["NX"] or sum(counts_y.values()) != record["NY"]:
            raise RuntimeError("The sampler returned counts inconsistent with the requested PUB shots")
        kx, ky = counts_x.get("1", 0), counts_y.get("1", 0)
        report["readings"].append({
            "turn": record["turn"], "sensorMode": record["sensorMode"], "shots": record["shots"], "phaseRadians": phase,
            "sourceJavaScript": {key: record[key] for key in ("kX", "NX", "kY", "NY", "phaseCandidates")},
            "freshQiskit": {"kX": kx, "NX": record["NX"], "kY": ky, "NY": record["NY"],
                             "phaseCandidates": estimar_fase(kx, record["NX"], ky, record["NY"], n)},
        })
    return report


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("session", type=Path, help="JSON downloaded using Export decisions")
    parser.add_argument("--output", type=Path, help="Save the report as JSON")
    parser.add_argument("--validate-only", action="store_true", help="Validate the export without submitting a quantum job")
    args = parser.parse_args(argv)
    try:
        report = replay_session(load_session(args.session), validate_only=args.validate_only)
    except (SessionValidationError, json.JSONDecodeError, OSError) as error:
        parser.error(str(error))
    payload = json.dumps(report, ensure_ascii=False, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(payload + "\n", encoding="utf-8")
    else:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8")
        print(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
