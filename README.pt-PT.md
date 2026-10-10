# Ghost Route

[English](README.md) · [Português (Brasil)](README.pt-BR.md) · **Português (Portugal)** · [Español](README.es.md)

### Quando o GPS mente, como trazes a tripulação de volta?

**Uma aventura de salvamento em pixel art que transforma o sensoriamento quântico numa decisão que podes jogar.**

A Aurora-1 está a regressar da órbita. Assumes o leme do **SPOOFED**, com uma tripulação para salvar, águas perigosas pela frente e sinais de navegação que nem sempre merecem confiança. A tua aliada é **Quoora**, a IA de bordo que te ajuda a comparar o GPS com um sensor quântico simulado. Escolhe o rumo, questiona o sinal e traz todos de volta.

**[Jogar Ghost Route](https://ghostroutegame.vercel.app/)** · [Aprender a jogar](docs/pt-PT/game-guide.md) · [Conhecer o projeto](docs/pt-PT/project-page.md) · [Guia técnico](docs/pt-PT/technical-guide.md)

![Ghost Route: o SPOOFED navega ao pôr do sol, com mapa tático, controlos do sensor e rádio walkie-talkie.](docs/assets/ghost-route-gameplay.png)

*Captura real do jogo. O computador e o telemóvel partilham a mesma campanha.*

## Cem missões. Uma pergunta: em que sinal confias?

| O que encontras | Porque faz a diferença |
| --- | --- |
| **100 níveis com nomes, de 00 a 99** | Começa com um tutorial de quatro turnos e avança para desafios gradualmente mais exigentes. |
| **Sensor quântico simulado** | Compara evidências, gere medições e descobre porque uma maior sensibilidade de fase também traz ambiguidade. |
| **Pixel art ao estilo de 32 bits** | Ponte de comando, mar ao pôr do sol e 64 vistas do navio, com o mastro sempre na vertical. |
| **Rádio walkie-talkie** | Clica no ícone para ler mensagens. As novidades acendem um aviso e os alertas deixam o leme livre. |
| **Sons originais** | Ouve medições, alertas, salvamento e derrota; desliga o som no menu. |
| **Quatro idiomas** | Inglês, português do Brasil, português de Portugal e espanhol, incluindo tutoriais e repetição. |
| **Repetição e exportação de decisões** | Revê a rota, as leituras suspeitas e as escolhas do sensor no fim da missão. |

## O teu primeiro salvamento demora quatro turnos

1. Abre o jogo e escolhe o **nível 00**.
2. Mantém o **rumo 045°, nordeste**, e segue as quatro etapas da Quoora.
3. Seleciona o sensor **Simples**, avança, compara os instrumentos e alcança a Aurora-1.
4. Revê o resultado e passa ao próximo nível.

Cada mecânica é apresentada antes de ser usada, mesmo quando escolhes um nível avançado diretamente. A curva aumenta as correntes aos poucos, faz crescer formações de pedras já conhecidas e exige mais cuidado com os recursos e a precisão do salvamento. O nível 99 tem as correntes mais fortes, o menor raio de salvamento e o menor orçamento de medições.

## Encontra o teu ponto de partida

| Queres… | Começa aqui |
| --- | --- |
| **Jogar ou conhecer ideias quânticas sem equações** | [Guia do jogador](docs/pt-PT/game-guide.md) |
| **Avaliar o projeto ou compreender o seu contributo** | [Visão geral](docs/pt-PT/project-page.md) e [guião da demonstração](docs/pt-PT/demo-script.md) |
| **Explorar possibilidades educativas ou de parceria** | [Visão de produto e próximos passos](docs/pt-PT/project-page.md#visao-de-produto) |
| **Desenvolver, reproduzir resultados ou contribuir** | [Guia técnico](docs/pt-PT/technical-guide.md) e [relatório de verificação](docs/pt-PT/qa-report.md) |

## Ciência quântica explicada através do jogo

Pensa no sensor como outra fonte de pistas. Amostra um modelo de assinaturas magnéticas e combina essas leituras com o movimento do navio para estimar posições possíveis. O modo **GHZ** responde ao triplo da fase, mas deixa três fases candidatas. Uma resposta mais sensível não garante uma posição única e correta.

O navegador executa uma **simulação educativa**. Uma implementação separada em Python usa **circuitos Qiskit**, e a entrada da Qollab demonstra os dois modos num circuito de oito qubits. O protótipo não comprova desempenho de navegação no mundo real nem vantagem quântica demonstrada. [Conhece o modelo e as formas de execução](docs/pt-PT/technical-guide.md).

## Joga localmente, sem compilar

Abre [public/index.html](public/index.html) no navegador e mantém a pasta de recursos ao lado. Não é necessário instalar dependências do frontend. Para usar um servidor local:

~~~sh
python -m http.server 8000 --directory public
~~~

Acede a **http://localhost:8000**. O som começa após uma interação. O idioma predefinido é **BR**; escolhe **IN** para inglês, **PT** para português de Portugal ou **ES** para espanhol. O progresso e as preferências ficam no navegador atual quando o armazenamento está disponível.

## Feito para jogar, investigar e ampliar

O projeto reúne uma campanha jogável, escolhas de sensoriamento explícitas e decisões que podem ser inspecionadas. As verificações do frontend cobrem regras, traduções, estimativa, renderização e rotas seguras na campanha. As evidências de execução na plataforma e de inscrição são acompanhadas separadamente na [lista de submissão](docs/pt-PT/submission-checklist.md).

**Criado pela QuantGirls para o hackathon Qollab × IonQ.** Disponível sob a [licença MIT](LICENSE). Pilotos educativos, introduções mais acessíveis e avaliação comparativa são próximos passos propostos; a tração comercial e os resultados de aprendizagem ainda não foram demonstrados.

This effort is supported by Qollab & IonQ

<details>
<summary>Créditos e transparência no desenvolvimento</summary>

Gemini Spark apoiou a implementação inicial; OpenAI Codex apoiou a interface, arte procedural, traduções, QA, refinamento da campanha e documentação. Claude (Anthropic) apoiou o tema de pôr do sol, efeitos do mapa, sprite do navio e consola da ponte. As referências visuais fornecidas pela utilizadora orientaram a arte. A equipa deve confirmar as datas dos contributos e a declaração final do hackathon. [Centro de documentação](docs/pt-PT/README.md).

</details>
