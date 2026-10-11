# Ghost Route

[English](README.md) · **Português (Brasil)** · [Português (Portugal)](README.pt-PT.md) · [Español](README.es.md)

### Quando o GPS mente, como você traz a tripulação de volta?

**Uma aventura de resgate em pixel art que transforma o sensoriamento quântico em uma decisão que você pode jogar.**

A Aurora-1 está voltando da órbita. Você assume o leme do **SPOOFED**, com uma tripulação para resgatar, águas perigosas pela frente e sinais de navegação que nem sempre merecem confiança. Sua aliada é **Quoora**, a IA de bordo que ajuda a comparar o GPS com um sensor quântico simulado. Escolha o rumo, questione o sinal e leve todos para casa.

**[Jogar Ghost Route](https://ghostroutegame.vercel.app/)** · [Aprender a jogar](docs/pt-BR/game-guide.md) · [Conhecer o projeto](docs/pt-BR/project-page.md) · [Guia técnico](docs/pt-BR/technical-guide.md)

![Ghost Route: o SPOOFED navega ao pôr do sol, com mapa tático, controles do sensor e rádio walkie-talkie.](docs/assets/ghost-route-gameplay.png)

*Captura real do jogo. Computador e celular compartilham a mesma campanha.*

## Cem missões. Uma pergunta: em qual sinal você confia?

| O que você encontra | Por que faz diferença |
| --- | --- |
| **100 fases com nomes, de 00 a 99** | Comece com um tutorial de quatro turnos e avance para desafios gradualmente mais exigentes. |
| **Sensor quântico simulado** | Compare evidências, administre medições e descubra por que maior sensibilidade de fase também traz ambiguidade. |
| **Pixel art no estilo 32 bits** | Ponte de comando, mar ao pôr do sol e 64 vistas do navio, com o mastro sempre em pé. |
| **Rádio walkie-talkie** | Clique no ícone para ler mensagens. Novidades acendem um aviso e os alertas deixam o leme livre. |
| **Sons originais** | Ouça medições, alertas, resgate e derrota; silencie pelo menu. |
| **Quatro idiomas** | Inglês, português do Brasil, português de Portugal e espanhol, incluindo tutoriais e repetição. |
| **Repetição e exportação de decisões** | Revise a rota, as leituras suspeitas e as escolhas do sensor ao fim da missão. |

## Seu primeiro resgate leva quatro turnos

1. Abra o jogo e escolha o **nível 00**.
2. Mantenha o **rumo 045°, nordeste**, e siga as quatro etapas da Quoora.
3. Selecione o sensor **Simples**, avance, compare os instrumentos e alcance a Aurora-1.
4. Revise o resultado e passe para a próxima fase.

Cada mecânica é apresentada antes de ser usada, mesmo ao escolher uma fase avançada diretamente. A curva aumenta as correntes aos poucos, faz formações conhecidas de pedras crescerem e exige mais cuidado com recursos e precisão do resgate. O nível 99 tem as correntes mais fortes, o menor raio de resgate e o menor orçamento de medições.

## Encontre seu ponto de partida

| Você quer… | Comece por aqui |
| --- | --- |
| **Jogar ou conhecer ideias quânticas sem equações** | [Guia do jogador](docs/pt-BR/game-guide.md) |
| **Avaliar o projeto ou entender sua contribuição** | [Visão geral](docs/pt-BR/project-page.md) e [roteiro da demonstração](docs/pt-BR/demo-script.md) |
| **Explorar possibilidades educacionais ou de parceria** | [Visão de produto e próximos passos](docs/pt-BR/project-page.md#visao-de-produto) |
| **Desenvolver, reproduzir resultados ou contribuir** | [Guia técnico](docs/pt-BR/technical-guide.md) e [relatório de verificação](docs/pt-BR/qa-report.md) |

## Ciência quântica explicada pelo jogo

Pense no sensor como outra fonte de pistas. Ele amostra um modelo de assinaturas magnéticas e combina essas leituras com o movimento do navio para estimar posições possíveis. O modo **GHZ** responde ao triplo da fase, mas deixa três fases candidatas. Uma resposta mais sensível não garante uma posição única e correta.

O navegador executa uma **simulação educacional**. Uma implementação separada em Python usa **circuitos Qiskit**, e a entrada da Qollab demonstra os dois modos em um circuito de oito qubits. O protótipo não comprova desempenho de navegação no mundo real nem vantagem quântica demonstrada. [Conheça o modelo e as formas de execução](docs/pt-BR/technical-guide.md).

## Jogue localmente, sem compilar

Abra [public/index.html](public/index.html) no navegador e mantenha a pasta de recursos ao lado. Não é necessário instalar dependências do frontend. Para usar um servidor local:

~~~sh
python -m http.server 8000 --directory public
~~~

Acesse **http://localhost:8000**. O som começa após uma interação. O padrão é **BR**; escolha **IN** para inglês, **PT** para português de Portugal ou **ES** para espanhol. O progresso e as preferências ficam no navegador atual quando o armazenamento está disponível.

## Feito para jogar, investigar e ampliar

O projeto reúne uma campanha jogável, escolhas de sensoriamento explícitas e decisões que podem ser inspecionadas. As verificações do frontend cobrem regras, traduções, estimativa, renderização e rotas seguras na campanha. Evidências de execução na plataforma e de inscrição são acompanhadas separadamente na [lista de submissão](docs/pt-BR/submission-checklist.md).

**Criado pela QuantGirls para o hackathon Qollab × IonQ.** Disponível sob a [licença MIT](LICENSE). Pilotos educacionais, introduções mais acessíveis e avaliação comparativa são próximos passos propostos; tração comercial e resultados de aprendizagem ainda não foram demonstrados.

This effort is supported by Qollab & IonQ

<details>
<summary>Créditos e transparência no desenvolvimento</summary>

Gemini Spark auxiliou a implementação inicial; OpenAI Codex auxiliou interface, arte procedural, traduções, QA, refinamento da campanha e documentação. Claude (Anthropic) auxiliou o tema de pôr do sol, efeitos do mapa, sprite do navio e console da ponte. Referências visuais fornecidas pela usuária orientaram a arte. A equipe deve confirmar as datas das contribuições e a declaração final do hackathon. [Central de documentação](docs/pt-BR/README.md).

</details>

A física se baseia em técnicas existentes de Ramsey/GHZ e pesquisas de navegação magnética. O mapa é sintético, o estimador de posição é clássico e os circuitos reproduzem estatísticas de uma fase fornecida. [Fundamentos científicos e referências externas](docs/pt-BR/scientific-basis.md).
