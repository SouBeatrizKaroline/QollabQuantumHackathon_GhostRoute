# Visão geral — para jurados, educadores e parceiros

[English](../project-page.md) · [Português (Brasil)](../pt-BR/project-page.md) · **Português (Portugal)** · [Español](../es/project-page.md)

**Ghost Route transforma a incerteza numa experiência jogável.** A história de salvamento dá um motivo concreto para comparar sinais de navegação, gerir um sensor quântico simulado e aprender com as consequências.

## A experiência

O jogador conduz o SPOOFED até à cápsula Aurora-1 enquanto leituras GPS falsas e obstáculos desafiam a rota. A Quoora explica cada mecânica nova. Cem missões com nomes vão de um tutorial seguro a correntes mais fortes, passagens mais restritas e maior precisão no salvamento. Quatro idiomas, sons originais e pixel art responsiva alargam o acesso.

O ciclo central é **escolher rumo → medir → comparar → decidir → rever**. A repetição revela ataques ocultos e exporta decisões para investigação.

## Qual é o contributo quântico

A interferência de Ramsey determina as probabilidades de medição X/Y. O GHZ de três qubits muda a resposta para 3φ e deixa três fases candidatas. Uma grelha bayesiana combina medições e movimento; a coerência GPS é comparada com uma região de credibilidade de 95%. A escolha do sensor influencia as decisões do jogador, em vez de ser apenas decoração.

O navegador amostra o modelo analiticamente. Um código Qiskit separado permite avaliar circuitos, e a entrada da Qollab reúne X/Y Simples/GHZ numa tarefa de oito qubits. A execução na plataforma precisa de evidência própria. [Detalhes técnicos](technical-guide.md).

## Evidências a consultar

| Afirmação | Onde verificar |
| --- | --- |
| Campanha jogável e introduções | [Guia do jogador](game-guide.md), public/ |
| Modelo quântico e circuitos | sensor.py, main.py, [guia técnico](technical-guide.md) |
| Decisões reproduzíveis | Exportação JSON e scripts/replay_session.py |
| Âmbito verificado e limitações | [Relatório](qa-report.md) |
| Materiais e evidências de submissão | [Lista de verificação](submission-checklist.md) |

<a id="visao-de-produto"></a>

## Visão de produto

O próximo passo mais útil é um **piloto educativo**: verificar se, depois de jogar, as pessoas explicam a ambiguidade, reconhecem leituras pouco fiáveis e usam melhor o orçamento de medições.

Extensões possíveis incluem planos de aula, cenários configuráveis e comparação com estratégias clássicas de navegação. São propostas futuras, não funcionalidades entregues. Um produto para formação marítima operacional exigiria validação específica e especialistas do setor.

Conversas sobre parceria ou investimento devem começar pelo protótipo e por um plano de piloto mensurável. Este repositório não afirma ter receitas, utilizadores, procura de mercado validada ou ganhos de aprendizagem demonstrados.

## Uma sequência útil de avaliação

Joga o nível 00, abre uma missão avançada, compara Simples/GHZ, inspeciona uma exportação de decisões e lê os circuitos. Usa o [guião](demo-script.md) para uma apresentação curta.

QuantGirls · [Licença MIT](../../LICENSE) · [Créditos](../../README.pt-PT.md)

This effort is supported by Qollab & IonQ

## Origem científica e declaração para submissão

O sensor é um modelo educativo de técnicas estabelecidas de Ramsey/GHZ, inspirado em investigação de navegação magnética. O cenário marítimo e o mapa sintético adaptam essas ideias ao jogo. A grelha bayesiana é clássica; o navegador e os circuitos não medem um campo magnético real. [Base científica, relação com o código e bibliografia completa](scientific-basis.md).

Para o hackathon, a contribuição original é a integração jogável e a escolha entre sensores, sem reivindicar física nova ou uma reprodução do Ironstone Opal. Trabalho externo e assistência de IA são declarados separadamente. Preserve as referências na página publicada e no pacote.

## Resumo para adaptar à submissão

**Ghost Route — QuantGirls · tema pretendido: Quantum Playground.** Jogo de resgate em pixel art e quatro idiomas sobre decidir em que evidências de navegação confiar quando o GPS mente. O jogador escolhe o rumo, gere medições simuladas, compara a ambiguidade Simples/GHZ e inspeciona decisões na repetição. O navegador executa um modelo educativo analítico; uma entrada Qiskit separada demonstra X/Y Simples/GHZ num circuito de oito qubits e uma tarefa de backend.

- Jogar: https://ghostroutegame.vercel.app/
- Código: https://github.com/SouBeatrizKaroline/QollabQuantumHackathon_GhostRoute
- Referências: [bibliografia completa](scientific-basis.md).
- URL do projeto Qollab, backend/evidência de execução e vídeo: **por confirmar pela equipa**; preencher com ligações reais antes de enviar.

## Critérios de aceitação do piloto educativo

Piloto proposto: observar se novos jogadores concluem o nível 00 sem ajuda, explicam a ambiguidade GHZ e comparam leituras incertas antes de agir. Recolher conclusão, pedidos de ajuda e compreensão antes/depois; ainda não são resultados medidos. A interface deve ter menu sem deslocamento desnecessário nas telas suportadas, idiomas legíveis, controlos sem sobreposição e acesso à ajuda/repetição quando for necessário deslocar o conteúdo.

## Campanha, equilíbrio e introduções atualizados — 11 de outubro de 2026

A rota atravessa um portão nos níveis 01–09, dois em 10–39 e três em 40–99. A distância por movimento considera a rota pelos centros das passagens. A rota de referência utiliza cerca de 78% da distância disponível no nível 01 e 92% no nível 99, com aumento suave nas transições de portões. Os principiantes dispõem de maior margem de manobra. A referência não inclui todos os desvios por pedras, nem representa uma rota ótima ou dificuldade medida com jogadores. Correntes, passagens estreitas, menos medições e menor raio de salvamento aumentam a pressão nos níveis posteriores.

O terreno é explicado na partida. Salto do GPS, apagão, deriva e congelamento são apresentados antes do primeiro movimento afetado. A Aurora-fantasma é explicada quando surge pela primeira vez; um ataque durante o apagão pode não a mostrar. O jogo pausa até à confirmação. As mecânicas confirmadas ficam guardadas; saltar para um nível avançado apresenta as explicações desconhecidas no momento adequado. A fantasma é um engano visual do GPS, não uma segunda cápsula física. Aproximar-se dela não salva a Aurora-1; a vitória exige alcançar a cápsula verdadeira dentro do raio configurado.

O rádio fica separado do radar GPS, bússola, telemetria e leme. Abrir ou fechar preserva a posição da carta e dos controlos. Em telemóveis pequenos, abre temporariamente sobre o mar; mensagens longas têm deslocamento dentro do rádio, e fechá-lo liberta a carta.
