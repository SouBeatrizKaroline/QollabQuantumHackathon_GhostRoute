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

## Campanha, balanceamento e introduções atualizados — 11 de outubro de 2026

Os níveis 01–04 reforçam o uso do sensor ensinado no tutorial 00. As mecânicas entram uma por vez, com pelo menos cinco níveis entre introduções. O destino se desloca suavemente pelo mapa; a incerteza da corrente aumenta, o orçamento diminui e a precisão exigida no resgate cresce gradualmente. A demanda de distância da rota de referência aumenta de cerca de 70% no nível 01 a 92% no 99. Essa referência usa os centros das passagens, não inclui desvios por pedras e não mede sucesso nem garante que todo jogador perceba cada nível adjacente como mais difícil.

As missões com passagens começam no 25. A partir daí, níveis terminados em 5–9 usam portões; os terminados em 0–4 têm mar aberto. Um, dois e três portões aparecem pela primeira vez em 25, 55 e 85. Cada abertura nova começa larga. As existentes estreitam e se deslocam gradualmente, sem inverter de lado a cada nível. Pedras pequenas podem exigir curvas mesmo sem muralhas. A missão final combina os desafios apresentados; as variantes em mar aberto mantêm a pressão de corrente, sensor, ataques e precisão.

O objetivo educacional continua sendo compreender o sensor: incerteza da amostragem, relação entre assinatura magnética e fase, ambiguidade, combinação de leitura com movimento e comparação de evidências independentes com o GPS. O rádio nas fases calmas sugere variar as medições; o terreno posterior dá um motivo para essas decisões. Os obstáculos são uma aplicação do aprendizado. O navegador continua uma simulação estatística educativa, sem magnetômetro físico ou vantagem quântica demonstrada.

O terreno é explicado na partida. Salto do GPS, apagão, deriva e congelamento são apresentados antes do primeiro movimento afetado. A Aurora-fantasma é explicada quando aparece pela primeira vez; um ataque durante o apagão pode não exibi-la. O jogo pausa até a confirmação do cartão. As mecânicas confirmadas são lembradas; quem pula para uma fase avançada recebe as explicações desconhecidas no momento adequado. A fantasma é um engano visual do GPS, não uma segunda cápsula física. Aproximar-se dela não resgata a Aurora-1; a vitória exige alcançar a cápsula real dentro do raio configurado.

O rádio fica separado do radar GPS, bússola, telemetria e leme. Abrir ou fechar preserva a posição do mapa e dos controles. Em celulares pequenos, ele abre temporariamente sobre o mar; mensagens longas têm rolagem dentro do rádio, e fechá-lo libera a visualização do mapa.

[Aprendizagem do sensor e progressão da campanha](campaign-design.md)
