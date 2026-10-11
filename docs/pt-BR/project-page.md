# Visão geral — para jurados, educadores e parceiros

[English](../project-page.md) · **Português (Brasil)** · [Português (Portugal)](../pt-PT/project-page.md) · [Español](../es/project-page.md)

**Ghost Route transforma a incerteza em uma experiência jogável.** A história de resgate dá um motivo concreto para comparar sinais de navegação, administrar um sensor quântico simulado e aprender com as consequências.

## A experiência

O jogador conduz o SPOOFED até a cápsula Aurora-1 enquanto leituras GPS falsas e obstáculos desafiam a rota. Quoora explica cada mecânica nova. Cem missões com nomes vão de um tutorial seguro a correntes mais fortes, passagens mais restritas e maior precisão no resgate. Quatro idiomas, sons originais e pixel art responsiva ampliam o acesso.

O ciclo central é **escolher rumo → medir → comparar → decidir → rever**. A repetição revela ataques ocultos e exporta decisões para investigação.

## Qual é a contribuição quântica

A interferência de Ramsey determina as probabilidades de medição X/Y. O GHZ de três qubits muda a resposta para 3φ e deixa três fases candidatas. Uma grade bayesiana combina medições e movimento; a coerência GPS é comparada com uma região de credibilidade de 95%. A escolha do sensor interfere nas decisões do jogador, em vez de ser apenas decoração.

O navegador amostra o modelo analiticamente. Um código Qiskit separado permite avaliar circuitos, e a entrada da Qollab reúne X/Y Simples/GHZ em uma tarefa de oito qubits. A execução na plataforma precisa de evidência própria. [Detalhes técnicos](technical-guide.md).

## Evidências para consultar

| Afirmação | Onde verificar |
| --- | --- |
| Campanha jogável e introduções | [Guia do jogador](game-guide.md), public/ |
| Modelo quântico e circuitos | sensor.py, main.py, [guia técnico](technical-guide.md) |
| Decisões reproduzíveis | Exportação JSON e scripts/replay_session.py |
| Escopo verificado e limitações | [Relatório](qa-report.md) |
| Materiais e evidências de submissão | [Lista de verificação](submission-checklist.md) |

<a id="visao-de-produto"></a>

## Visão de produto

O próximo passo mais útil é um **piloto educacional**: verificar se, depois de jogar, as pessoas explicam a ambiguidade, reconhecem leituras pouco confiáveis e usam melhor o orçamento de medições.

Extensões possíveis incluem planos de aula, cenários configuráveis e comparação com estratégias clássicas de navegação. São propostas futuras, não recursos entregues. Um produto para treinamento marítimo operacional exigiria validação específica e especialistas do setor.

Conversas sobre parceria ou investimento devem começar pelo protótipo e por um plano de piloto mensurável. Este repositório não afirma ter receita, usuários, demanda de mercado validada ou ganhos de aprendizagem demonstrados.

## Uma sequência útil de avaliação

Jogue o nível 00, abra uma missão avançada, compare Simples/GHZ, inspecione uma exportação de decisões e leia os circuitos. Use o [roteiro](demo-script.md) para uma apresentação curta.

QuantGirls · [Licença MIT](../../LICENSE) · [Créditos](../../README.pt-BR.md)

This effort is supported by Qollab & IonQ

## Origem científica e declaração para submissão

O sensor é um modelo educativo de técnicas estabelecidas de Ramsey/GHZ, inspirado em pesquisas de navegação magnética. O cenário marítimo e o mapa sintético adaptam essas ideias ao jogo. A grade bayesiana é clássica; navegador e circuitos não medem um campo magnético real. [Base científica, relação com o código e bibliografia completa](scientific-basis.md).

Para o hackathon, a contribuição original é a integração jogável e a escolha entre sensores, sem reivindicar física nova ou reprodução do Ironstone Opal. Trabalho externo e assistência de IA têm declarações separadas. Mantenha as referências na página publicada e no pacote.

## Resumo para adaptar à submissão

**Ghost Route — QuantGirls · tema pretendido: Quantum Playground.** Jogo de resgate em pixel art e quatro idiomas sobre decidir em quais evidências de navegação confiar quando o GPS mente. O jogador escolhe o rumo, administra medições simuladas, compara a ambiguidade Simples/GHZ e inspeciona suas decisões no replay. O navegador executa um modelo educativo analítico; uma entrada Qiskit separada demonstra X/Y Simples/GHZ em um circuito de oito qubits e uma tarefa de backend.

- Jogar: https://ghostroutegame.vercel.app/
- Código: https://github.com/SouBeatrizKaroline/QollabQuantumHackathon_GhostRoute
- Referências científicas: [bibliografia completa](scientific-basis.md).
- URL do projeto Qollab, backend/evidência de execução e vídeo: **pendentes de confirmação da equipe**; preencher com links reais antes de enviar.

## Critérios de aceitação do piloto educacional

Piloto proposto: observar se jogadores novos concluem o nível 00 sem ajuda, explicam a ambiguidade GHZ e comparam leituras incertas antes de agir. Coletar conclusão, pedidos de ajuda e compreensão antes/depois; ainda não são resultados medidos. Para liberar a interface: menu sem rolagem desnecessária nas telas suportadas, idiomas legíveis, controles sem sobreposição e acesso a ajuda/replay quando a rolagem for necessária.
