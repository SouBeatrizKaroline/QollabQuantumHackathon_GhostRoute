# Base científica, referências externas e simplificações

[English](../scientific-basis.md) · [Português (Brasil)](../pt-BR/scientific-basis.md) · **Português (Portugal)** · [Español](../es/scientific-basis.md)

Ghost Route baseia-se em técnicas reais de deteção e navegação quântica, numa versão educativa e simplificada. A equipa pesquisou-as a partir da notícia da Q-CTRL. A contribuição é a sua integração num jogo de resgate; não se reivindica a invenção da interferometria de Ramsey, dos estados GHZ ou da localização bayesiana.

## Relação entre fontes e implementação

| Fundamento | Fonte | Implementação e alcance |
| --- | --- | --- |
| Interferência de Ramsey | [1] | `sensor.py` prepara sobreposição, codifica uma fase fornecida com RZ e mede X/Y. |
| Resposta de fase GHZ | [2–4] | Três qubits entrelaçados acumulam 3φ; a descodificação mantém três fases candidatas. Maior sensibilidade local não garante uma posição única ou melhor precisão prática. |
| Navegação por mapa magnético sem GPS | [5] e estudo Q-CTRL | Inspiração para comparar evidências independentes. Os ensaios publicados usam veículos terrestres/aéreos; o cenário marítimo é uma adaptação educativa. |
| Localização bayesiana em grelha | [6] | `BayesianGridEstimator`, em `engine.js`, prevê o movimento e atualiza probabilidades das células pela verosimilhança das medições. O estimador é clássico. |

## Simplificações do protótipo

- `calcB` soma quatro anomalias gaussianas sintéticas a uma base; não é um mapa real do fundo do mar. `calcPhi` usa φ = κB com uma constante do jogo, sem calibração física.
- X: P(1) = sen²(nφ/2); Y: P(1) = (1 − sen(nφ))/2. São probabilidades ideais da preparação e leitura implementadas. X/Y estimam nφ módulo 2π: GHZ n=3 dá três **fases**, não necessariamente três posições geográficas.
- O navegador amostra distribuições binomiais. Qiskit local e a entrada Qollab reproduzem estatísticas de uma fase fornecida; não medem o campo terrestre. A execução Qollab em simulador ou QPU exige evidência própria. O jogo não tem sensor físico nem ligação ativa à IonQ.
- Há flutuações de amostragem e ruído de movimento modelado. Não se modelam decoerência, erros de portas/leitura, interferência magnética ou calibração. Um backend real com ruído pode afetar os circuitos.
- A região de credibilidade de 95% testa coerência GPS **sob o modelo**; não garante 95% de deteção de ataques nem segurança. Os resultados da Q-CTRL não são resultados do jogo.

## Trabalho original e atribuição externa

A campanha, narrativa, controlos, apresentação visual e integração das escolhas do sensor com a repetição são a contribuição do projeto. Os princípios científicos têm fontes externas. A citação não implica parceria com a Q-CTRL, acesso a algoritmos proprietários ou uso do seu hardware/software. Preserve os créditos de ferramentas, IA e referências visuais no README e confirme a cronologia das contribuições antes da submissão.


## Bibliografia

1. **Ramsey, N. F. (1950).** *A Molecular Beam Resonance Method with Separated Oscillating Fields*. Physical Review 78, 695–699. [DOI: 10.1103/PhysRev.78.695](https://doi.org/10.1103/PhysRev.78.695).
2. **Greenberger, D. M.; Horne, M. A.; Zeilinger, A. (1989).** *Going Beyond Bell's Theorem*, in *Bell's Theorem, Quantum Theory and Conceptions of the Universe*, pp. 69–72. [Republicação depositada pelos autores, arXiv:0712.0921](https://arxiv.org/abs/0712.0921) (enviada em 2007; capítulo original: 1989).
3. **Bollinger, J. J.; Itano, W. M.; Wineland, D. J.; Heinzen, D. J. (1996).** *Optimal frequency measurements with maximally correlated states*. Physical Review A 54, R4649. [DOI: 10.1103/PhysRevA.54.R4649](https://doi.org/10.1103/PhysRevA.54.R4649).
4. **Meyer, V. et al. (2001).** *Experimental Demonstration of Entanglement-Enhanced Rotation Angle Estimation Using Trapped Ions*. Physical Review Letters 86, 5870–5873. [DOI: 10.1103/PhysRevLett.86.5870](https://doi.org/10.1103/PhysRevLett.86.5870).
5. **Muradoglu, M. et al. (2025).** *Quantum-assured magnetic navigation achieves positioning accuracy better than a strategic-grade INS in airborne and ground-based field trials*. [arXiv:2504.08167v1, 10 April 2025](https://arxiv.org/abs/2504.08167v1). Preprint de investigação primária; identifica os ensaios de campo.
6. **Fox, D.; Burgard, W.; Thrun, S. (1998).** *Markov Localization for Reliable Robot Navigation and People Detection*. [Instituição dos autores, Carnegie Mellon University](https://publications.ri.cmu.edu/markov-localization-for-reliable-robot-navigation-and-people-detection). Referência de localização probabilística clássica.

### Fontes de pesquisa fornecidas pela equipa

- **Q-CTRL.** [Delivering quantum advantage to airborne systems](https://q-ctrl.com/case-study/q-ctrl-delivering-quantum-advantage-to-airborne-systems). Estudo da empresa; inspiração, não validação do Ghost Route.
- **Swayne, M. (14 April 2025), The Quantum Insider.** [Q-CTRL Overcomes GPS-denial With Quantum Sensing, Reports Quantum Advantage](https://thequantuminsider.com/2025/04/14/q-ctrl-overcomes-gps-denial-with-quantum-sensing-reports-quantum-advantage/). Cobertura jornalística secundária/comunicado de imprensa.
- **InnovationAus.** [Q-CTRL claims 'quantum advantage' with GPS-free navigation](https://innovationaus.com/?p=66343). Ligação fornecida pela equipa; inacessível nesta revisão, não usada para sustentar afirmações técnicas.

Referências verificadas em 11 de outubro de 2026, salvo as marcadas como inacessíveis. Títulos mantidos no idioma original.

This effort is supported by Qollab & IonQ
