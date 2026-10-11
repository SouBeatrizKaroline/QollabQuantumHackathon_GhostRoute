# Base científica, referências externas e simplificações

[English](../scientific-basis.md) · **Português (Brasil)** · [Português (Portugal)](../pt-PT/scientific-basis.md) · [Español](../es/scientific-basis.md)

Ghost Route é baseado em técnicas reais de sensoriamento e navegação quântica, numa versão educativa e simplificada. A equipe pesquisou essas técnicas a partir da notícia da Q-CTRL. A contribuição é integrá-las a um jogo de resgate; não se reivindica a invenção da interferometria de Ramsey, dos estados GHZ ou da localização bayesiana.

## Relação entre fontes e implementação

| Fundamento | Fonte | Implementação e alcance |
| --- | --- | --- |
| Interferência de Ramsey | [1] | `sensor.py` prepara superposição, codifica uma fase fornecida com RZ e mede X/Y. |
| Resposta de fase GHZ | [2–4] | Três qubits emaranhados acumulam 3φ; a decodificação conserva três fases candidatas. Maior sensibilidade local não garante posição única nem ganho prático de precisão. |
| Navegação por mapa magnético sem GPS | [5] e estudo Q-CTRL | Inspiração para comparar evidências independentes. Os testes publicados usam veículos terrestres/aéreos; o cenário marítimo do jogo é uma adaptação educativa. |
| Localização bayesiana em grade | [6] | `BayesianGridEstimator`, em `engine.js`, prevê movimento e atualiza probabilidades das células pela verossimilhança das medições. O estimador é clássico. |

## O que o protótipo simplifica

- `calcB` soma quatro anomalias gaussianas sintéticas a uma base; não é um levantamento de oceano nem mapa real do fundo do mar. `calcPhi` usa φ = κB com uma constante do jogo, sem calibração física.
- X: P(1) = sen²(nφ/2); Y: P(1) = (1 − sen(nφ))/2. São probabilidades ideais para a preparação e leitura implementadas. X/Y estimam nφ módulo 2π; GHZ n=3 deixa três **fases**, não necessariamente três posições geográficas.
- O navegador amostra distribuições binomiais. Qiskit local e a entrada Qollab reproduzem estatísticas de uma fase fornecida. Nenhum mede o campo da Terra. Uma execução Qollab em simulador ou QPU exige evidência própria; o jogo não tem sensor físico nem conexão ativa com IonQ.
- Existem flutuações de amostragem e ruído de movimento modelado. Não se modelam decoerência, erros de portas/leitura, interferência magnética ou calibração. Um backend real com ruído pode afetar os resultados dos circuitos.
- A região de credibilidade de 95% testa coerência GPS **sob o modelo**; não é um detector com 95% de acerto nem garantia de segurança. Resultados da Q-CTRL não são resultados do jogo.

## Trabalho original e atribuição externa

Campanha, narrativa de resgate, controles, apresentação visual e integração das escolhas do sensor com o replay são a contribuição do projeto. Os princípios científicos acima têm fontes externas. Citar a inspiração não significa parceria com Q-CTRL, acesso a algoritmos proprietários ou incorporação de seu hardware/software. Preserve os créditos de ferramentas, IA e referências visuais no README e confirme a cronologia das contribuições antes da submissão.


## Bibliografia

1. **Ramsey, N. F. (1950).** *A Molecular Beam Resonance Method with Separated Oscillating Fields*. Physical Review 78, 695–699. [DOI: 10.1103/PhysRev.78.695](https://doi.org/10.1103/PhysRev.78.695).
2. **Greenberger, D. M.; Horne, M. A.; Zeilinger, A. (1989).** *Going Beyond Bell's Theorem*, in *Bell's Theorem, Quantum Theory and Conceptions of the Universe*, pp. 69–72. [Republicação depositada pelos autores, arXiv:0712.0921](https://arxiv.org/abs/0712.0921) (enviada em 2007; capítulo original: 1989).
3. **Bollinger, J. J.; Itano, W. M.; Wineland, D. J.; Heinzen, D. J. (1996).** *Optimal frequency measurements with maximally correlated states*. Physical Review A 54, R4649. [DOI: 10.1103/PhysRevA.54.R4649](https://doi.org/10.1103/PhysRevA.54.R4649).
4. **Meyer, V. et al. (2001).** *Experimental Demonstration of Entanglement-Enhanced Rotation Angle Estimation Using Trapped Ions*. Physical Review Letters 86, 5870–5873. [DOI: 10.1103/PhysRevLett.86.5870](https://doi.org/10.1103/PhysRevLett.86.5870).
5. **Muradoglu, M. et al. (2025).** *Quantum-assured magnetic navigation achieves positioning accuracy better than a strategic-grade INS in airborne and ground-based field trials*. [arXiv:2504.08167v1, 10 April 2025](https://arxiv.org/abs/2504.08167v1). Preprint de pesquisa primária; identifica os testes de campo realizados.
6. **Fox, D.; Burgard, W.; Thrun, S. (1998).** *Markov Localization for Reliable Robot Navigation and People Detection*. [Instituição dos autores, Carnegie Mellon University](https://publications.ri.cmu.edu/markov-localization-for-reliable-robot-navigation-and-people-detection). Referência de localização probabilística clássica.

### Fontes da pesquisa fornecidas pela equipe

- **Q-CTRL.** [Delivering quantum advantage to airborne systems](https://q-ctrl.com/case-study/q-ctrl-delivering-quantum-advantage-to-airborne-systems). Estudo da empresa; inspiração de engenharia, não validação do Ghost Route.
- **Swayne, M. (14 April 2025), The Quantum Insider.** [Q-CTRL Overcomes GPS-denial With Quantum Sensing, Reports Quantum Advantage](https://thequantuminsider.com/2025/04/14/q-ctrl-overcomes-gps-denial-with-quantum-sensing-reports-quantum-advantage/). Cobertura jornalística secundária/comunicado de imprensa.
- **InnovationAus.** [Q-CTRL claims 'quantum advantage' with GPS-free navigation](https://innovationaus.com/?p=66343). Link fornecido pela equipe; inacessível nesta revisão, não utilizado para sustentar afirmações técnicas.

Referências conferidas em 11 de outubro de 2026, exceto as marcadas como inacessíveis. Títulos bibliográficos mantidos no idioma original.

This effort is supported by Qollab & IonQ
