# Guia técnico

[English](../technical-guide.md) · **Português (Brasil)** · [Português (Portugal)](../pt-PT/technical-guide.md) · [Español](../es/technical-guide.md)

**Reproduza o modelo, execute as verificações e diferencie a simulação do navegador da execução de circuitos.** Execute os comandos na raiz do repositório.

## Três formas de execução

| Caminho | O que executa | Que evidência fornece |
| --- | --- | --- |
| Navegador | HTML/CSS/Canvas e amostragem JavaScript das probabilidades analíticas de Born. | Missões jogáveis e decisões exportadas, sem Qiskit ou tarefa de hardware. |
| Python local | [sensor.py](../../sensor.py) e simulação Qiskit; repetição opcional de circuitos JSON. | Comparação entre circuito e modelo no backend local usado. |
| Qollab | [main.py](../../main.py) com o backend injetado pela plataforma. | Só uma execução real comprova que o projeto rodou lá. |

## Modelo do sensor

Um campo magnético simplificado associa a posição à fase φ. As medições X e Y usam:

~~~text
P_X(1 | φ, n) = (1 − cos(nφ)) / 2
P_Y(1 | φ, n) = (1 − sin(nφ)) / 2
~~~

Simples usa n=1; GHZ usa n=3 e três qubits emaranhados. A resposta ao triplo da fase também cria três fases candidatas. Uma leitura escalar não identifica sozinha uma posição bidimensional única. A grade bayesiana combina sua verossimilhança com o movimento previsto. A região de credibilidade de 95% testa coerência, não a probabilidade de o GPS ser honesto.

![Figura das franjas de Ramsey gerada a partir do modelo.](../assets/ramsey-fringes.png)

## Navegador e verificações do frontend

Abra [public/index.html](../../public/index.html) ou sirva public com <code>python -m http.server 8000 --directory public</code>. Não é necessário compilar nem instalar pacotes do frontend. Use Node.js:

~~~sh
node tests/game-core.cjs
node tests/estimator.cjs
node --test tests/localization.cjs
node tests/ui-state.cjs
node tests/campaign.cjs
node tests/ship-rendering.cjs
node tests/map-layout.cjs
node tests/experience.cjs
node tests/progression.cjs
~~~

A busca de rotas verifica segmentos completos, distâncias fixas, rumos inteiros e correntes com sementes definidas. Ela não mede a dificuldade percebida nem resultados de aprendizagem.

## Preparação do Python local

Use Python 3.10 ou posterior e [requirements.txt](../../requirements.txt). Qiskit está limitado a >=2.5.2 e <3; as versões das outras dependências não estão fixadas.

~~~sh
python -m venv .venv
~~~

**Windows:** <code>.venv\Scripts\activate</code>  
**macOS / Linux:** <code>source .venv/bin/activate</code>

~~~sh
python -m pip install -r requirements.txt
python sensor.py
python -m pytest tests -q
python scripts/plot_fringes.py
~~~

No Windows, [setup_and_test.bat](../../scripts/setup_and_test.bat) oferece o fluxo de preparação. O script de franjas recria a ilustração acima.

## Exportação e repetição

A exportação preserva posições, fases, comandos, medições e configuração da campanha. A repetição Python valida o mundo registrado e faz **novas amostragens** nas fases salvas. Python e JavaScript usam geradores aleatórios diferentes; sementes iguais não garantem contagens iguais.

~~~sh
python scripts/replay_session.py examples/session-seed-20261011.json
python scripts/replay_session.py examples/session-level-00.json --validate-only
python scripts/replay_session.py examples/session-level-00.json --output dist/replay-report.json
python scripts/package_qollab.py
~~~

São aceitas exportações antigas 1.0.0 e de campanha 1.1.0. O exemplo antigo conserva a missão original de doze turnos, não a configuração atual de todas as fases. <code>--validate-only</code> não envia tarefas de circuitos. A repetição real agrupa os circuitos em uma chamada sampler.run. Essa repetição de múltiplos circuitos é diferente da entrada da Qollab.

## Entrada da Qollab e pacote

<code>main.py</code> reúne leituras X/Y Simples/GHZ em **um circuito de oito qubits e uma chamada backend.run**. Depende do backend injetado, não escolhe um na importação e não chama main manualmente. Gere o pacote, preserve a raiz e siga o fluxo atual da plataforma. A saída fica em <code>dist/qollab/</code> e <code>dist/ghost-route-qollab.zip</code>, ignorados pelo Git. Confirme a execução e os links públicos na [lista de submissão](submission-checklist.md).

## Hospedagem estática e mapa do código

Na Vercel, [vercel.json](../../vercel.json) serve **public/**: framework Other, sem comando de compilação, raiz do repositório. O sensor Python precisa de um ambiente próprio.

| Arquivo | Responsabilidade |
| --- | --- |
| public/assets/js/engine.js | Física, configuração das fases, estimativa e 64 perspectivas do navio. |
| public/assets/js/app.js | Controles, repetição, traduções e posição do rádio. |
| public/assets/js/i18n.js | Quatro catálogos completos da interface. |
| public/assets/js/onboarding.js | Nomes das fases e introduções. |
| public/assets/js/audio.js | Sons sintetizados e comportamento de silenciar. |
| public/assets/css/game.css | Ponte responsiva e apresentação do walkie-talkie. |
| main.py / sensor.py | Entrada da Qollab e modelo quântico reutilizável. |
| scripts/ / tests/ | Repetição, empacotamento e verificação. |

Veja o escopo dos testes no [relatório](qa-report.md). “32 bits” indica o estilo visual, não a arquitetura de um executável Windows.

[Base científica e referências externas](scientific-basis.md) — Ghost Route é baseado em técnicas reais de sensoriamento e navegação quântica, numa versão educativa e simplificada. A equipe pesquisou essas técnicas a partir da notícia da Q-CTRL. A contribuição é integrá-las a um jogo de resgate; não se reivindica a invenção da interferometria de Ramsey, dos estados GHZ ou da localização bayesiana.

## Compatibilidade com o runtime e regressão no navegador

[Documentação do runtime Qollab](https://qollab.xyz/learn/docs/runtime-environment) conferida em 11 de outubro de 2026: Python importa módulos da raiz, a seleção de backend é injetada e IonQ permite uma tarefa por execução. Limites: 100 arquivos, 2 MB por arquivo. O arquivo gerado é um pacote de distribuição; preserve o conteúdo e a raiz ao enviar. Para a demonstração Python mínima, envie `main.py`, `sensor.py`, `requirements.txt`, licença MIT e documentação explicativa. Não envie `.venv`, caches ou resultados locais de testes.

`public/index.html` é o jogo hospedado externamente. Não funciona sem adaptação como projeto JS na Qollab: essa superfície ignora tags de script e carrega `main.js`/`main.css`. A entrada Qollab entregue é Python. Armazenamento e áudio do jogo externo são separados do ambiente Qollab, que não oferece armazenamento local persistente.

Verificação opcional em navegador real: instalar Playwright localmente (`npm install --no-save playwright` e `npx playwright install chromium`) e executar `node tests/browser-layout.cjs`. Pode selecionar Chromium/Edge existente com `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. Playwright é dependência de desenvolvimento; não é necessário para jogar ou executar Python. O teste cobre os quatro idiomas, redimensionamento, rolagem do menu, ação do nível selecionado, controles dentro das molduras, separação do rádio e acesso à ajuda expandida.

As contagens de recursos diferem: o navegador divide o orçamento total escolhido entre X e Y. Python `shots` define repetições por quadratura; em `main.py`, as quatro leituras compartilham cada repetição de circuito. Não são custos físicos idênticos nem evidência de vantagem quântica.

## Campanha, balanceamento e introduções atualizados — 11 de outubro de 2026

Os níveis 01–04 reforçam o uso do sensor ensinado no tutorial 00. As mecânicas entram uma por vez, com pelo menos cinco níveis entre introduções. O destino se desloca suavemente pelo mapa; a incerteza da corrente aumenta, o orçamento diminui e a precisão exigida no resgate cresce gradualmente. A demanda de distância da rota de referência aumenta de cerca de 70% no nível 01 a 92% no 99. Essa referência usa os centros das passagens, não inclui desvios por pedras e não mede sucesso nem garante que todo jogador perceba cada nível adjacente como mais difícil.

As missões com passagens começam no 25. A partir daí, níveis terminados em 5–9 usam portões; os terminados em 0–4 têm mar aberto. Um, dois e três portões aparecem pela primeira vez em 25, 55 e 85. Cada abertura nova começa larga. As existentes estreitam e se deslocam gradualmente, sem inverter de lado a cada nível. Pedras pequenas podem exigir curvas mesmo sem muralhas. A missão final combina os desafios apresentados; as variantes em mar aberto mantêm a pressão de corrente, sensor, ataques e precisão.

O objetivo educacional continua sendo compreender o sensor: incerteza da amostragem, relação entre assinatura magnética e fase, ambiguidade, combinação de leitura com movimento e comparação de evidências independentes com o GPS. O rádio nas fases calmas sugere variar as medições; o terreno posterior dá um motivo para essas decisões. Os obstáculos são uma aplicação do aprendizado. O navegador continua uma simulação estatística educativa, sem magnetômetro físico ou vantagem quântica demonstrada.

O terreno é explicado na partida. Salto do GPS, apagão, deriva e congelamento são apresentados antes do primeiro movimento afetado. A Aurora-fantasma é explicada quando aparece pela primeira vez; um ataque durante o apagão pode não exibi-la. O jogo pausa até a confirmação do cartão. As mecânicas confirmadas são lembradas; quem pula para uma fase avançada recebe as explicações desconhecidas no momento adequado. A fantasma é um engano visual do GPS, não uma segunda cápsula física. Aproximar-se dela não resgata a Aurora-1; a vitória exige alcançar a cápsula real dentro do raio configurado.

O rádio fica separado do radar GPS, bússola, telemetria e leme. Abrir ou fechar preserva a posição do mapa e dos controles. Em celulares pequenos, ele abre temporariamente sobre o mar; mensagens longas têm rolagem dentro do rádio, e fechá-lo libera a visualização do mapa.

## Verificação dos tutoriais no navegador

`tests/browser-onboarding.cjs` verifica o resgate real nos quatro turnos do nível 00, cartões traduzidos, pausa durante explicações e sequência dos diálogos do sensor e das mecânicas em 1336×605, 390×667, 320×568 e 667×375, nos quatro idiomas. Execute com a mesma configuração Playwright da suíte de layout.

`node tests/browser-qa.cjs` exercita resgate e falha reais, marcação GPS final, falsos alarmes, download JSON, ajuda do sensor e disponibilidade de GHZ antes/depois do nível 45 e do esgotamento de medições. Cobre os quatro idiomas em 1366×768, 1336×605, 320×568 e 667×375, com a mesma configuração Playwright.

[Aprendizagem do sensor e progressão da campanha](campaign-design.md)
