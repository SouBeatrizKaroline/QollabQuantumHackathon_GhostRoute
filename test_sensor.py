"""Testes do sensor: medições batem com a teoria e a estimação recupera a fase."""

import math

import pytest

from sensor import (LIMITE_QUBITS, Leitura, circuito_empacotado, estimar_fase,
                    incerteza_fase, ler_fase, prob_um, rodar)

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
