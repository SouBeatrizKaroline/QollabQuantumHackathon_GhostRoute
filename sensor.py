"""
Rota Fantasma — sensor quântico (Demo 1)

O sensor é um interferômetro de Ramsey: o campo magnético na posição real
do navio vira uma fase φ no qubit, e só a estatística de medição revela φ.

Modo simples: 1 qubit.       Probabilidade de medir 1 → sin²(φ/2)
Modo GHZ:     n qubits       → fase acumulada n·φ (mais sensível, mais ambíguo)

Duas quadraturas:
  X:  P(1) = sin²(nφ/2)        = (1 - cos nφ) / 2
  Y:  P(1) = (1 - sin nφ) / 2
Com as duas, recuperamos nφ (e não só o cosseno) via atan2.

Regra da IonQ no Qollab: 1 job por execução. Por isso todas as leituras
de um turno vão empacotadas num ÚNICO circuito, cada leitura nos seus
próprios qubits e no seu próprio registrador clássico.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

from qiskit import ClassicalRegister, QuantumCircuit, QuantumRegister
from qiskit.primitives import StatevectorSampler


# ---------------------------------------------------------------------------
# Leituras
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Leitura:
    """Uma leitura do sensor: a fase que o campo imprime, o modo e a quadratura."""
    phi: float              # fase por qubit (rad), vem do campo na posição REAL
    n: int = 1              # 1 = simples; >1 = GHZ com n qubits
    quadratura: str = "X"   # "X" ou "Y"

    def __post_init__(self):
        if self.n < 1:
            raise ValueError("n precisa ser >= 1")
        if self.quadratura not in ("X", "Y"):
            raise ValueError("quadratura precisa ser 'X' ou 'Y'")


def _aplicar_ramsey(qc: QuantumCircuit, qubits, clbit, leitura: Leitura) -> None:
    """Escreve o interferômetro de Ramsey (com GHZ se n > 1) nos qubits dados."""
    q0 = qubits[0]
    qc.h(q0)
    for q in qubits[1:]:              # prepara GHZ: (|00..0> + |11..1>)/√2
        qc.cx(q0, q)
    for q in qubits:                  # o campo imprime a fase em cada qubit
        qc.rz(leitura.phi, q)
    for q in reversed(qubits[1:]):    # desfaz o emaranhamento
        qc.cx(q0, q)
    if leitura.quadratura == "Y":
        qc.sdg(q0)
    qc.h(q0)
    qc.measure(q0, clbit)


def circuito_leitura(leitura: Leitura) -> QuantumCircuit:
    """Circuito de uma leitura isolada (bom para mostrar na página e no vídeo)."""
    q = QuantumRegister(leitura.n, "q")
    c = ClassicalRegister(1, "c")
    qc = QuantumCircuit(q, c, name=f"ramsey_n{leitura.n}_{leitura.quadratura}")
    _aplicar_ramsey(qc, list(q), c[0], leitura)
    return qc


# Teto de qubits por circuito. Simuladores de vetor de estado dobram a memória
# a cada qubit (20 qubits ≈ 16 MB; 30 ≈ 16 GB), e o simulador da IonQ também
# tem limite. Um turno típico (X + Y, GHZ até 5) usa no máximo 10.
LIMITE_QUBITS = 20


def circuito_empacotado(leituras: list[Leitura]) -> QuantumCircuit:
    """
    Todas as leituras num circuito só (regra da IonQ: 1 job por execução).
    Cada leitura i ganha seus próprios qubits e o registrador clássico 'm{i}'.
    """
    total = sum(lt.n for lt in leituras)
    if total > LIMITE_QUBITS:
        raise ValueError(
            f"{total} qubits num circuito passa do limite de {LIMITE_QUBITS}. "
            "Reduza o n do GHZ ou o número de leituras por turno."
        )
    regs_q, regs_c = [], []
    for i, lt in enumerate(leituras):
        regs_q.append(QuantumRegister(lt.n, f"s{i}"))
        regs_c.append(ClassicalRegister(1, f"m{i}"))
    qc = QuantumCircuit(*regs_q, *regs_c, name="turno")
    for lt, rq, rc in zip(leituras, regs_q, regs_c):
        _aplicar_ramsey(qc, list(rq), rc[0], lt)
    return qc


# ---------------------------------------------------------------------------
# Execução
# ---------------------------------------------------------------------------

def rodar(leituras: list[Leitura], shots: int = 1000, sampler=None, seed: int | None = None):
    """
    Roda as leituras num único job e devolve, para cada leitura, (zeros, uns).

    `sampler`: qualquer Sampler V2 do Qiskit. Sem argumento, usa o simulador
    local exato (StatevectorSampler). No Qollab, troque pelo sampler do
    backend escolhido (por ex. o simulador da IonQ).
    """
    if sampler is None:
        sampler = StatevectorSampler(seed=seed)
    qc = circuito_empacotado(leituras)
    resultado = sampler.run([qc], shots=shots).result()[0]
    saida = []
    for i in range(len(leituras)):
        contagens = getattr(resultado.data, f"m{i}").get_counts()
        uns = contagens.get("1", 0)
        saida.append((shots - uns, uns))
    return saida


# ---------------------------------------------------------------------------
# Teoria e estimação
# ---------------------------------------------------------------------------

def prob_um(phi: float, n: int = 1, quadratura: str = "X") -> float:
    """Probabilidade teórica de medir 1."""
    if quadratura == "X":
        return math.sin(n * phi / 2) ** 2
    return (1 - math.sin(n * phi)) / 2


def estimar_fase(uns_x: int, shots_x: int, uns_y: int, shots_y: int, n: int = 1) -> list[float]:
    """
    Estima φ a partir das contagens nas quadraturas X e Y.

    Devolve TODAS as fases candidatas em [0, 2π): o interferômetro só
    conhece n·φ módulo 2π, então há n candidatas igualmente espaçadas
    (ambiguidade de franja). n = 1 → uma candidata; GHZ → várias.
    """
    cos_nphi = 1 - 2 * (uns_x / shots_x)
    sin_nphi = 1 - 2 * (uns_y / shots_y)
    nphi = math.atan2(sin_nphi, cos_nphi) % (2 * math.pi)
    return sorted(((nphi + 2 * math.pi * k) / n) % (2 * math.pi) for k in range(n))


def incerteza_fase(shots: int, n: int = 1) -> float:
    """
    Desvio padrão aproximado da estimativa de φ (rad).
    Limite quântico padrão ~ 1/√shots; com GHZ, ~ 1/(n·√shots) (limite de Heisenberg).
    """
    return 1 / (n * math.sqrt(shots))


def leituras_par(phi: float, n: int = 1) -> list[Leitura]:
    """Atalho: as duas quadraturas de uma mesma leitura."""
    return [Leitura(phi, n, "X"), Leitura(phi, n, "Y")]


def ler_fase(phi: float, n: int = 1, shots: int = 1000, sampler=None, seed: int | None = None) -> list[float]:
    """Mede X e Y num único job e devolve as fases candidatas."""
    (_, ux), (_, uy) = rodar(leituras_par(phi, n), shots=shots, sampler=sampler, seed=seed)
    return estimar_fase(ux, shots, uy, shots, n)


if __name__ == "__main__":
    phi_real = 1.1
    for n in (1, 3):
        cands = ler_fase(phi_real, n=n, shots=2000, seed=7)
        print(f"n={n}  φ real={phi_real:.3f}  candidatas={[round(c, 3) for c in cands]}")
    print(circuito_leitura(Leitura(phi_real, 3, "X")).draw())
