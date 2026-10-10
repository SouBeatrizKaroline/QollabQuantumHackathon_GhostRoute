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
