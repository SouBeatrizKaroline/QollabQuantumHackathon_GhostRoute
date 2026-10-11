# Ghost Route

[English](README.md) · **Português (Brasil)** · [Português (Portugal)](README.pt-PT.md) · [Español](README.es.md)

> **This effort is supported by Qollab & IonQ**

**Equipe: QuantGirls**

- Beatriz Karoline Cordeiro da Silva
- Daiane Fonseca
- Sonia Janara Silva Barros

**Para jurados e leitores:** [Proposta do projeto](#o-problema-e-nossa-contribuição) · [Como executar](#jogue-localmente-sem-compilar) · [Créditos](#créditos-e-transparência-no-desenvolvimento) · [Referências](#referências-e-atribuição-externa)

### Quando o GPS mente, como você traz a tripulação de volta?

**Uma aventura de resgate em pixel art que transforma o sensoriamento quântico em uma decisão que você pode jogar.**

A Aurora-1 está voltando da órbita. Você assume o leme do **SPOOFED**, com uma tripulação para resgatar, águas perigosas pela frente e sinais de navegação que nem sempre merecem confiança. Sua aliada é **Quoora**, a IA de bordo que ajuda a comparar o GPS com um sensor quântico simulado. Escolha o rumo, questione o sinal e leve todos para casa.

**[Jogar Ghost Route](https://ghostroutegame.vercel.app/)** · [Aprender a jogar](docs/pt-BR/game-guide.md) · [Conhecer o projeto](docs/pt-BR/project-page.md) · [Guia técnico](docs/pt-BR/technical-guide.md)

![Ghost Route: o SPOOFED navega ao pôr do sol, com mapa tático, controles do sensor e rádio walkie-talkie.](docs/assets/ghost-route-gameplay.png)

*Captura real do jogo. Computador e celular compartilham a mesma campanha.*

## O problema e nossa contribuição

O GPS pode mostrar uma posição falsa quando seu sinal é manipulado, prática chamada **spoofing**. Ghost Route transforma esse problema em uma aventura acessível: a pessoa compara pistas de navegação, decide quando medir e aprende como a incerteza afeta suas escolhas.

Nossa contribuição é integrar ideias científicas existentes a uma história, campanha, interface e repetição de decisões jogáveis. Os fundamentos científicos e as ferramentas externas estão creditados abaixo. **O jogo no navegador é uma simulação educacional; o projeto separado em Python demonstra circuitos quânticos.** O protótipo não é um equipamento de navegação para embarcações reais.

Para educadores, o projeto oferece uma forma de discutir incerteza e sensoriamento quântico pela experiência. Para parceiros e investidores, o próximo passo proposto é um piloto educacional com resultados de aprendizagem mensuráveis. Receita, demanda de mercado e ganhos de aprendizagem ainda não foram demonstrados.

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

Pense no sensor como outra fonte de pistas. Ele amostra um modelo de assinaturas magnéticas e combina essas leituras com o movimento do navio para estimar posições possíveis. O modo **GHZ** usa três qubits emaranhados, unidades quânticas ligadas entre si, e responde ao triplo da fase, mas deixa três fases candidatas. Neste modelo, fase é o ângulo que representa o sinal magnético simulado. Uma resposta mais sensível não garante uma posição única e correta.

O navegador executa uma **simulação educacional**. Uma implementação separada em Python usa **circuitos Qiskit**, e a entrada da Qollab demonstra os dois modos em um circuito de oito qubits. O protótipo não comprova desempenho de navegação no mundo real nem vantagem quântica demonstrada. [Conheça o modelo e as formas de execução](docs/pt-BR/technical-guide.md).

## Jogue localmente, sem compilar

Abra [public/index.html](public/index.html) no navegador e mantenha a pasta de recursos ao lado. Não é necessário instalar dependências do frontend. Para usar um servidor local:

~~~sh
python -m http.server 8000 --directory public
~~~

Acesse **http://localhost:8000**. O som começa após uma interação. O padrão é **BR**; escolha **IN** para inglês, **PT** para português de Portugal ou **ES** para espanhol. O progresso e as preferências ficam no navegador atual quando o armazenamento está disponível.

## Execute a demonstração dos circuitos quânticos

Na raiz do repositório, use **Python 3.10 ou superior**:

~~~sh
python -m venv .venv
~~~

Ative o ambiente: Windows: `.venv\Scripts\activate`; macOS/Linux: `source .venv/bin/activate`.

~~~sh
python -m pip install -r requirements.txt
python sensor.py
~~~

Essa demonstração local compara estimativas de fase dos modos Simples e GHZ no simulador do Qiskit e imprime um circuito. **Ela não executa no hardware da IonQ.**

Para a Qollab, gere a distribuição com `python scripts/package_qollab.py`. Mantenha `main.py`, `sensor.py` e `requirements.txt` na raiz do projeto, inclua a licença e a documentação, selecione o backend na Qollab e execute a entrada da plataforma. `main.py` espera o backend fornecido pela Qollab; `python main.py` não é a demonstração local. A entrada reúne os dois modos e suas leituras X/Y em um circuito de oito qubits e um único job. Consulte o [guia técnico](docs/pt-BR/technical-guide.md) e a [documentação oficial do ambiente](https://qollab.xyz/learn/docs/runtime-environment).

## Feito para jogar, investigar e ampliar

O projeto reúne uma campanha jogável, escolhas de sensoriamento explícitas e decisões que podem ser inspecionadas. As verificações do frontend cobrem regras, traduções, estimativa, renderização e rotas seguras na campanha. Evidências de execução na plataforma e de inscrição são acompanhadas separadamente na [lista de submissão](docs/pt-BR/submission-checklist.md).

**Criado pela QuantGirls para o hackathon Qollab × IonQ.** Disponível sob a [licença MIT](LICENSE). Pilotos educacionais, introduções mais acessíveis e avaliação comparativa são próximos passos propostos; tração comercial e resultados de aprendizagem ainda não foram demonstrados.


## Créditos e transparência no desenvolvimento

O projeto combina o trabalho de design e integração da equipe com métodos científicos existentes, dependências externas e assistência de IA. O repositório registra:

| Participante ou fonte | Uso registrado |
| --- | --- |
| **QuantGirls** | Design e integração da narrativa de resgate, campanha, escolhas do sensor, interface e repetição. |
| **Gemini Spark** | Assistência na implementação inicial. |
| **OpenAI Codex** | Assistência na interface, arte procedural, traduções, QA, refinamento da campanha e documentação, incluindo esta revisão do README. |
| **Claude (Anthropic)** | Assistência no tema de pôr do sol, efeitos animados do mapa, sprite do navio e console da ponte. |
| **Referências visuais fornecidas pela usuária** | Inspiração para a direção de arte; as origens individuais e eventuais reutilizações ainda precisam de confirmação da equipe. |
| **Qiskit, NumPy e Matplotlib** | Dependências externas de Python; Pytest apoia os testes. Veja [requirements.txt](requirements.txt) e as referências oficiais abaixo. |
| **Playwright** | Verificações opcionais no navegador; não é necessário para jogar. |

As citações científicas identificam os fundamentos do modelo. Elas não comprovam que código de artigos, circuitos de tutoriais ou textos de outros repositórios foram copiados, nem que Ghost Route reproduz a implementação da Q-CTRL. Se código, circuitos, explicações, imagens ou templates foram copiados ou adaptados, declare a fonte, autoria, arquivos afetados, forma de uso e licença aplicável junto ao material correspondente. Uma bibliografia geral não substitui essa declaração.

**A equipe ainda precisa confirmar:** as datas exatas das contribuições e o trabalho realizado durante o período do hackathon; eventuais códigos ou templates preexistentes; a origem específica das referências visuais; e materiais externos copiados ou adaptados além das fontes já registradas. Este README não certifica que o inventário de reutilizações esteja completo.

## Referências e atribuição externa

A lista abaixo reúne no README principal as referências já registradas no repositório. O documento de [fundamentos científicos e relação entre fontes e código](docs/pt-BR/scientific-basis.md) explica seu uso em mais detalhe.

| Fundamento externo | Uso no Ghost Route |
| --- | --- |
| **Interferometria de Ramsey — [1]** | Superposição, codificação de fase e leituras X/Y em [sensor.py](sensor.py). |
| **Estados GHZ e estimativa de fase — [2–4]** | Resposta de fase com três qubits e múltiplas fases candidatas. Maior sensibilidade, sozinha, não comprova melhor localização. |
| **Navegação magnética — [5], Q-CTRL e links de pesquisa** | Inspiração para comparar evidências independentes de navegação. O mapa marítimo do jogo é sintético. |
| **Localização probabilística clássica — [6]** | Previsão de movimento e atualização por medições na grade bayesiana em [engine.js](public/assets/js/engine.js). |

### Bibliografia científica

1. **Ramsey, N. F. (1950).** *A Molecular Beam Resonance Method with Separated Oscillating Fields*. Physical Review 78, 695–699. [DOI: 10.1103/PhysRev.78.695](https://doi.org/10.1103/PhysRev.78.695).
2. **Greenberger, D. M.; Horne, M. A.; Zeilinger, A. (1989).** *Going Beyond Bell's Theorem*, in *Bell's Theorem, Quantum Theory and Conceptions of the Universe*, pp. 69–72. [Author-deposited reprint, arXiv:0712.0921](https://arxiv.org/abs/0712.0921) (uploaded in 2007; original chapter: 1989).
3. **Bollinger, J. J.; Itano, W. M.; Wineland, D. J.; Heinzen, D. J. (1996).** *Optimal frequency measurements with maximally correlated states*. Physical Review A 54, R4649. [DOI: 10.1103/PhysRevA.54.R4649](https://doi.org/10.1103/PhysRevA.54.R4649).
4. **Meyer, V. et al. (2001).** *Experimental Demonstration of Entanglement-Enhanced Rotation Angle Estimation Using Trapped Ions*. Physical Review Letters 86, 5870–5873. [DOI: 10.1103/PhysRevLett.86.5870](https://doi.org/10.1103/PhysRevLett.86.5870).
5. **Muradoglu, M. et al. (2025).** *Quantum-assured magnetic navigation achieves positioning accuracy better than a strategic-grade INS in airborne and ground-based field trials*. [arXiv:2504.08167v1, 10 April 2025](https://arxiv.org/abs/2504.08167v1). Preprint de pesquisa primária que descreve os ensaios de campo.
6. **Fox, D.; Burgard, W.; Thrun, S. (1998).** *Markov Localization for Reliable Robot Navigation and People Detection*. [Author institution, Carnegie Mellon University](https://publications.ri.cmu.edu/markov-localization-for-reliable-robot-navigation-and-people-detection). Referência de localização probabilística clássica.

### Caminho de pesquisa fornecido pela equipe

- **Q-CTRL.** [Delivering quantum advantage to airborne systems](https://q-ctrl.com/case-study/q-ctrl-delivering-quantum-advantage-to-airborne-systems). Estudo de caso da empresa; inspiração de engenharia, não validação do Ghost Route.
- **Swayne, M. (14 April 2025), The Quantum Insider.** [Q-CTRL Overcomes GPS-denial With Quantum Sensing, Reports Quantum Advantage](https://thequantuminsider.com/2025/04/14/q-ctrl-overcomes-gps-denial-with-quantum-sensing-reports-quantum-advantage/). Cobertura secundária de notícia/comunicado de imprensa.
- **InnovationAus.** [Q-CTRL claims 'quantum advantage' with GPS-free navigation](https://innovationaus.com/?p=66343). Link de pesquisa fornecido pela equipe e marcado como inacessível na revisão registrada; não sustenta afirmações técnicas aqui.


Os títulos bibliográficos foram preservados no idioma original. Os resultados publicados de navegação magnética não podem ser transferidos automaticamente para o jogo.

### Referências de software e plataforma

- **Qollab:** [processo e FAQ](https://qollab.xyz/programs/hackathon/how-it-works), [termos do hackathon](https://qollab.xyz/programs/hackathon/terms), [registro](https://qollab.xyz/programs/hackathon/register) e [ambiente de execução](https://qollab.xyz/learn/docs/runtime-environment).
- **Qiskit:** [documentação oficial](https://quantum.cloud.ibm.com/docs/) e [entradas e saídas das primitivas](https://quantum.cloud.ibm.com/docs/en/guides/primitive-input-output). Construção de circuitos e amostragem local.
- **NumPy:** [documentação oficial](https://numpy.org/doc/). Apoio numérico às ferramentas Python.
- **Matplotlib:** [documentação oficial](https://matplotlib.org/stable/). Gráficos do modelo.
- **Pytest:** [documentação oficial](https://docs.pytest.org/). Verificação em Python.
- **Playwright:** [documentação oficial](https://playwright.dev/docs/intro). Verificação opcional no navegador.
- **Vercel:** [configuração de build](https://vercel.com/docs/builds/configure-a-build). Configuração da hospedagem do jogo.

### Situação da submissão ao hackathon

A atribuição de apoio exigida está no início deste README. Referências e créditos registrados de IA e dependências estão visíveis sem abrir uma seção oculta.

O **link do projeto na Qollab, a evidência de execução real no backend e o vídeo público de demonstração** ainda dependem de confirmação da equipe na [lista de submissão](docs/pt-BR/submission-checklist.md). Confirme a cronologia e o inventário de reutilizações antes de enviar. A demonstração web e as verificações locais, por si só, não comprovam execução na plataforma ou submissão formal. Consulte os termos oficiais vigentes para o conjunto completo de requisitos.

### Licença

O projeto está disponível sob a [licença MIT](LICENSE), que também preserva a atribuição de apoio exigida. Dependências externas e eventuais materiais reutilizados mantêm suas respectivas licenças e obrigações de atribuição.
