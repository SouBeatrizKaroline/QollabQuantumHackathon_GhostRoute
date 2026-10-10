"""Testes do sensor: medições batem com a teoria e a estimação recupera a fase."""

import math
import os
from pathlib import Path
import subprocess
import sys

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sensor import (LIMITE_QUBITS, Leitura, circuito_empacotado, circuito_leitura,
                    demonstrar_sensor, estimar_fase,
                    incerteza_fase, ler_fase, prob_um, rodar)
from qiskit.primitives import StatevectorSampler

SHOTS = 4000


def _dist_circular(a, b):
    d = abs(a - b) % (2 * math.pi)
    return min(d, 2 * math.pi - d)


@pytest.mark.parametrize("n", [1, 2, 3, 5])
@pytest.mark.parametrize("quad", ["X", "Y"])
def test_probabilidade_bate_com_teoria(n, quad):
    fases = [0.0, 0.4, 1.1, 2.0, 3.0, 4.5, 6.0]
    por_job = max(1, LIMITE_QUBITS // n)
    resultados = []
    for i in range(0, len(fases), por_job):
        lote = [Leitura(phi, n, quad) for phi in fases[i:i + por_job]]
        resultados += rodar(lote, shots=SHOTS, seed=11 + i)
    for phi, (_, uns) in zip(fases, resultados):
        p_med = uns / SHOTS
        p_teo = prob_um(phi, n, quad)
        tol = 4 * math.sqrt(p_teo * (1 - p_teo) / SHOTS) + 0.005  # ~4 desvios
        assert abs(p_med - p_teo) <= tol, (phi, n, quad, p_med, p_teo)


@pytest.mark.parametrize("n", [1, 3])
def test_estimacao_recupera_fase(n):
    for phi in [0.3, 1.1, 2.5, 4.0, 5.7]:
        cands = ler_fase(phi, n=n, shots=SHOTS, seed=3)
        assert len(cands) == n
        melhor = min(_dist_circular(c, phi) for c in cands)
        assert melhor <= 5 * incerteza_fase(SHOTS, n) + 0.01, (phi, n, cands)


def test_ghz_tem_candidatas_igualmente_espacadas():
    cands = estimar_fase(1000, 2000, 1000, 2000, n=4)
    passos = [cands[i + 1] - cands[i] for i in range(3)]
    for p in passos:
        assert p == pytest.approx(2 * math.pi / 4, abs=1e-9)


def test_empacotamento_um_circuito_qubits_somados():
    leituras = [Leitura(0.5, 1, "X"), Leitura(0.5, 3, "Y"), Leitura(1.0, 2, "X")]
    qc = circuito_empacotado(leituras)
    assert qc.num_qubits == 6
    assert qc.num_clbits == 3
    assert [c.name for c in qc.cregs] == ["m0", "m1", "m2"]


def test_limite_de_qubits_da_erro_claro():
    with pytest.raises(ValueError, match="limite"):
        circuito_empacotado([Leitura(0.1, 5, "X")] * 5)  # 25 qubits


def test_leituras_independentes_no_mesmo_job():
    # fases bem diferentes no mesmo circuito não podem se misturar
    leituras = [Leitura(0.0, 1, "X"), Leitura(math.pi, 1, "X")]
    (z0, u0), (z1, u1) = rodar(leituras, shots=1000, seed=5)
    assert u0 == 0      # φ=0 → sempre 0
    assert z1 == 0      # φ=π → sempre 1


@pytest.mark.parametrize("phi", [float("nan"), float("inf"), -float("inf"), True, "1.1"])
def test_fase_invalida_da_erro_claro(phi):
    with pytest.raises(ValueError, match="finito"):
        Leitura(phi)
    with pytest.raises(ValueError, match="finito"):
        prob_um(phi)


@pytest.mark.parametrize("n", [0, -1, 1.5, True, "3"])
def test_numero_de_qubits_precisa_ser_inteiro_positivo(n):
    with pytest.raises(ValueError, match="inteiro positivo"):
        Leitura(1.1, n)
    with pytest.raises(ValueError, match="inteiro positivo"):
        estimar_fase(2, 10, 3, 10, n)


@pytest.mark.parametrize("quadratura", ["Z", "x", "", None])
def test_quadratura_invalida_nao_vira_y_silenciosamente(quadratura):
    with pytest.raises(ValueError, match="quadratura"):
        prob_um(1.1, quadratura=quadratura)


@pytest.mark.parametrize("shots", [0, -1, 1.5, True, "1000"])
def test_shots_invalidos_nao_enviam_job(shots):
    class RejectAnyJob:
        def run(self, *_args, **_kwargs):
            pytest.fail("Invalid shot allocation reached the sampler")

    with pytest.raises(ValueError, match="inteiro positivo"):
        rodar([Leitura(0.5)], shots=shots, sampler=RejectAnyJob())
    with pytest.raises(ValueError, match="inteiro positivo"):
        incerteza_fase(shots)


def test_leituras_vazias_ou_invalidas_nao_criam_circuito():
    for leituras in ([], None, ["not a reading"]):
        with pytest.raises(ValueError, match="Leitura"):
            circuito_empacotado(leituras)
    with pytest.raises(ValueError, match="limite"):
        circuito_leitura(Leitura(0.1, LIMITE_QUBITS + 1))


@pytest.mark.parametrize("contagem", [-1, 11, 2.5, True])
def test_contagem_invalida_nao_gera_fase(contagem):
    with pytest.raises(ValueError, match="inteiro entre"):
        estimar_fase(contagem, 10, 3, 10)
    with pytest.raises(ValueError, match="inteiro entre"):
        estimar_fase(3, 10, contagem, 10)


def test_demo_simple_e_ghz_usa_um_unico_job():
    class CountingSampler:
        def __init__(self):
            self.sampler = StatevectorSampler(seed=7)
            self.calls = 0

        def run(self, pubs, **kwargs):
            self.calls += 1
            assert len(pubs) == 1
            assert pubs[0].num_qubits == 8
            return self.sampler.run(pubs, **kwargs)

    sampler = CountingSampler()
    candidatas = demonstrar_sensor(1.1, shots=2000, sampler=sampler)
    assert sampler.calls == 1
    for n in (1, 3):
        assert len(candidatas[n]) == n
        assert min(_dist_circular(c, 1.1) for c in candidatas[n]) <= 5 * incerteza_fase(2000, n) + 0.01


def test_demo_cli_funciona_com_encoding_legado_do_windows():
    environment = dict(os.environ, PYTHONIOENCODING="cp1252")
    result = subprocess.run(
        [sys.executable, str(Path(__file__).resolve().parents[1] / "sensor.py")],
        capture_output=True, encoding="utf-8", env=environment, check=False,
    )
    assert result.returncode == 0, result.stderr
    assert "n=1" in result.stdout and "n=3" in result.stdout
