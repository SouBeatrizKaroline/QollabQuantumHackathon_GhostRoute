"""
Gráfico das franjas de interferência do sensor (Demo 1).

Mostra a probabilidade de medir 1 (quadratura X) em função da fase φ:
linha = teoria, pontos = medições no simulador. O modo GHZ (3 qubits)
oscila 3x mais rápido: mais sensível a pequenas mudanças de campo, mas
a mesma probabilidade aparece em 3x mais fases (ambiguidade de franja).
"""

import math
from pathlib import Path
import argparse
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from sensor import Leitura, prob_um, rodar

SURFACE = "#fcfcfb"
TEXT_1 = "#0b0b0b"
TEXT_2 = "#52514e"
GRID = "#e4e3df"
SERIES = {1: "#2a78d6", 3: "#eb6834"}
NOMES = {1: "Simples (1 qubit)", 3: "Emaranhado GHZ (3 qubits)"}
MARCADOR = {1: "o", 3: "s"}   # forma diferente: identidade não depende só da cor
SHOTS = 500


def medir_curva(n, fases):
    # O simulador local cresce como 2**qubits; lotes de ate 9 qubits
    # preservam as leituras independentes sem uma matriz de 20 qubits.
    por_job = max(1, 9 // n)
    uns = []
    for i in range(0, len(fases), por_job):
        lote = [Leitura(float(p), n, "X") for p in fases[i:i + por_job]]
        uns += [u for _, u in rodar(lote, shots=SHOTS, seed=100 + i)]
    return np.array(uns) / SHOTS


def main(saida=None):
    saida = Path(saida) if saida is not None else PROJECT_ROOT / "docs" / "assets" / "ramsey-fringes.png"
    saida.parent.mkdir(parents=True, exist_ok=True)
    phi_fino = np.linspace(0, 2 * math.pi, 400)
    phi_med = np.linspace(0, 2 * math.pi, 25)

    fig, ax = plt.subplots(figsize=(9, 4.8), dpi=160)
    fig.patch.set_facecolor(SURFACE)
    ax.set_facecolor(SURFACE)

    for n in (1, 3):
        teoria = [prob_um(p, n, "X") for p in phi_fino]
        ax.plot(phi_fino, teoria, color=SERIES[n], lw=2, label=f"{NOMES[n]} — teoria",
                solid_capstyle="round", zorder=2)
        ax.plot(phi_med, medir_curva(n, phi_med), linestyle="none", marker=MARCADOR[n],
                markersize=6.5, markerfacecolor=SERIES[n], markeredgecolor=SURFACE,
                markeredgewidth=1.5, label=f"{NOMES[n]} — medido ({SHOTS} shots)", zorder=3)

    # rótulos diretos
    ax.annotate("simples", xy=(math.pi, 1.0), xytext=(math.pi, 1.08), ha="center",
                color=TEXT_1, fontsize=10)
    ax.annotate("GHZ", xy=(math.pi / 3, 1.0), xytext=(math.pi / 3, 1.08), ha="center",
                color=TEXT_1, fontsize=10)

    ticks = [0, math.pi / 2, math.pi, 3 * math.pi / 2, 2 * math.pi]
    ax.set_xticks(ticks, ["0", "π/2", "π", "3π/2", "2π"])
    ax.set_xlim(0, 2 * math.pi)
    ax.set_ylim(-0.03, 1.15)
    ax.set_yticks([0, 0.25, 0.5, 0.75, 1.0], ["0%", "25%", "50%", "75%", "100%"])
    ax.set_xlabel("Fase φ impressa pelo campo magnético (rad)", color=TEXT_2)
    ax.set_ylabel("Probabilidade de medir 1", color=TEXT_2)
    ax.grid(axis="y", color=GRID, lw=0.8)
    for lado in ("top", "right"):
        ax.spines[lado].set_visible(False)
    for lado in ("left", "bottom"):
        ax.spines[lado].set_color(GRID)
    ax.tick_params(colors=TEXT_2)

    fig.suptitle("O GHZ oscila 3× mais rápido: mais sensível, mas mais ambíguo",
                 x=0.07, ha="left", color=TEXT_1, fontsize=13, fontweight="bold")
    ax.set_title("Franjas de interferência do sensor de Ramsey, quadratura X",
                 loc="left", color=TEXT_2, fontsize=10)
    leg = ax.legend(loc="upper center", bbox_to_anchor=(0.5, -0.17), ncol=2,
                    frameon=False, fontsize=8.5, labelcolor=TEXT_2)
    fig.tight_layout()
    fig.savefig(saida, facecolor=SURFACE, bbox_inches="tight")
    plt.close(fig)
    print("Ghost Route — gráfico salvo:", saida.resolve())


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Ghost Route's Ramsey interference-fringe figure.")
    parser.add_argument("--output", type=Path, help="Output PNG path (default: docs/assets/ramsey-fringes.png)")
    main(parser.parse_args().output)
