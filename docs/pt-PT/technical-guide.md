# Guia técnico

[English](../technical-guide.md) · [Português (Brasil)](../pt-BR/technical-guide.md) · **Português (Portugal)** · [Español](../es/technical-guide.md)

**Reproduz o modelo, executa as verificações e distingue a simulação do navegador da execução de circuitos.** Executa os comandos na raiz do repositório.

## Três formas de execução

| Caminho | O que executa | Que evidência fornece |
| --- | --- | --- |
| Navegador | HTML/CSS/Canvas e amostragem JavaScript das probabilidades analíticas de Born. | Missões jogáveis e decisões exportadas, sem Qiskit ou tarefa de hardware. |
| Python local | [sensor.py](../../sensor.py) e simulação Qiskit; repetição opcional de circuitos JSON. | Comparação entre circuito e modelo no backend local utilizado. |
| Qollab | [main.py](../../main.py) com o backend injetado pela plataforma. | Só uma execução real comprova que o projeto foi executado lá. |

## Modelo do sensor

Um campo magnético simplificado associa a posição à fase φ. As medições X e Y usam:

~~~text
P_X(1 | φ, n) = (1 − cos(nφ)) / 2
P_Y(1 | φ, n) = (1 − sin(nφ)) / 2
~~~

Simples usa n=1; GHZ usa n=3 e três qubits entrelaçados. A resposta ao triplo da fase também cria três fases candidatas. Uma leitura escalar não identifica por si só uma posição bidimensional única. A grelha bayesiana combina a sua verosimilhança com o movimento previsto. A região de credibilidade de 95% testa coerência, não a probabilidade de o GPS ser honesto.

![Figura das franjas de Ramsey gerada a partir do modelo.](../assets/ramsey-fringes.png)

## Navegador e verificações do frontend

Abre [public/index.html](../../public/index.html) ou serve public com <code>python -m http.server 8000 --directory public</code>. Não é necessário compilar nem instalar pacotes do frontend. Usa Node.js:

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

A pesquisa de rotas verifica segmentos completos, distâncias fixas, rumos inteiros e correntes com sementes definidas. Não mede a dificuldade percebida nem os resultados de aprendizagem.

## Preparação do Python local

Usa Python 3.10 ou posterior e [requirements.txt](../../requirements.txt). Qiskit está limitado a >=2.5.2 e <3; as versões das outras dependências não estão fixadas.

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

A exportação preserva posições, fases, comandos, medições e configuração da campanha. A repetição Python valida o mundo registado e faz **novas amostragens** nas fases guardadas. Python e JavaScript usam geradores aleatórios diferentes; sementes iguais não garantem contagens iguais.

~~~sh
python scripts/replay_session.py examples/session-seed-20261011.json
python scripts/replay_session.py examples/session-level-00.json --validate-only
python scripts/replay_session.py examples/session-level-00.json --output dist/replay-report.json
python scripts/package_qollab.py
~~~

São aceites exportações antigas 1.0.0 e de campanha 1.1.0. O exemplo antigo conserva a missão original de doze turnos, não a configuração atual de todos os níveis. <code>--validate-only</code> não envia tarefas de circuitos. A repetição real agrupa os circuitos numa chamada sampler.run. Esta repetição de múltiplos circuitos é diferente da entrada da Qollab.

## Entrada da Qollab e pacote

<code>main.py</code> reúne leituras X/Y Simples/GHZ em **um circuito de oito qubits e uma chamada backend.run**. Depende do backend injetado, não escolhe um na importação e não chama main manualmente. Gera o pacote, preserva a raiz e segue o fluxo atual da plataforma. A saída fica em <code>dist/qollab/</code> e <code>dist/ghost-route-qollab.zip</code>, ignorados pelo Git. Confirma a execução e os links públicos na [lista de submissão](submission-checklist.md).

## Alojamento estático e mapa do código

Na Vercel, [vercel.json](../../vercel.json) serve **public/**: framework Other, sem comando de compilação, raiz do repositório. O sensor Python precisa de um ambiente próprio.

| Ficheiro | Responsabilidade |
| --- | --- |
| public/assets/js/engine.js | Física, configuração dos níveis, estimativa e 64 perspetivas do navio. |
| public/assets/js/app.js | Controlos, repetição, traduções e posição do rádio. |
| public/assets/js/i18n.js | Quatro catálogos completos da interface. |
| public/assets/js/onboarding.js | Nomes dos níveis e introduções. |
| public/assets/js/audio.js | Sons sintetizados e comportamento de desligar o som. |
| public/assets/css/game.css | Ponte responsiva e apresentação do walkie-talkie. |
| main.py / sensor.py | Entrada da Qollab e modelo quântico reutilizável. |
| scripts/ / tests/ | Repetição, empacotamento e verificação. |

Consulta o âmbito dos testes no [relatório](qa-report.md). “32 bits” indica o estilo visual, não a arquitetura de um executável Windows.

[Base científica e referências externas](scientific-basis.md) — Ghost Route baseia-se em técnicas reais de deteção e navegação quântica, numa versão educativa e simplificada. A equipa pesquisou-as a partir da notícia da Q-CTRL. A contribuição é a sua integração num jogo de resgate; não se reivindica a invenção da interferometria de Ramsey, dos estados GHZ ou da localização bayesiana.

## Compatibilidade com o runtime e regressão no navegador

[Documentação do runtime Qollab](https://qollab.xyz/learn/docs/runtime-environment) verificada em 11 de outubro de 2026: Python importa módulos da raiz, recebe o backend selecionado e IonQ permite uma tarefa por execução. Limites: 100 ficheiros, 2 MB por ficheiro. O pacote é para distribuição; preserve o conteúdo e a raiz. Para demonstração Python mínima envie `main.py`, `sensor.py`, `requirements.txt`, licença MIT e documentação. Não envie `.venv`, caches ou resultados locais.

`public/index.html` é o jogo alojado externamente. Exige adaptação para projeto JS Qollab: essa superfície ignora tags de script e carrega `main.js`/`main.css`. A entrada Qollab entregue é Python. Armazenamento e áudio do jogo externo são separados do ambiente Qollab, que não oferece armazenamento local persistente.

Verificação opcional em navegador real: instalar Playwright (`npm install --no-save playwright` e `npx playwright install chromium`) e executar `node tests/browser-layout.cjs`. Selecione Chromium/Edge existente com `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. É dependência de desenvolvimento; não é necessária para jogar ou executar Python. O teste cobre quatro idiomas, redimensionamento, deslocamento do menu, ação do nível selecionado, controlos nas molduras, rádio e ajuda expandida.

As contagens diferem: o navegador divide o orçamento total entre X e Y. Python `shots` define repetições por quadratura; em `main.py`, quatro leituras partilham cada repetição. Não são custos físicos idênticos nem evidência de vantagem quântica.

## Campanha, equilíbrio e introduções atualizados — 11 de outubro de 2026

Os níveis 01–04 reforçam o uso do sensor ensinado no tutorial 00. As mecânicas entram uma de cada vez, com pelo menos cinco níveis entre introduções. O destino desloca-se suavemente; a incerteza da corrente aumenta, o orçamento diminui e a precisão exigida no salvamento cresce gradualmente. A procura de distância da rota de referência aumenta de cerca de 70% no nível 01 a 92% no 99. A referência usa os centros das passagens, não inclui desvios por pedras e não mede sucesso nem garante que cada jogador perceba todos os níveis adjacentes como mais difíceis.

As missões com passagens começam no 25. Os níveis terminados em 5–9 usam portões; os terminados em 0–4 têm mar aberto. Um, dois e três portões surgem em 25, 55 e 85. Cada abertura nova começa larga. As existentes estreitam e deslocam-se gradualmente, sem inverter de lado em cada nível. Pedras pequenas podem exigir curvas sem muralhas. A missão final combina os desafios apresentados; as variantes de mar aberto mantêm a pressão de corrente, sensor, ataques e precisão.

O objetivo educativo continua a ser compreender o sensor: incerteza da amostragem, relação entre assinatura magnética e fase, ambiguidade, combinação de leitura com movimento e comparação com o GPS. O rádio nas fases calmas sugere variar as medições; o terreno posterior dá um motivo a estas decisões. Os obstáculos aplicam a aprendizagem. O navegador continua uma simulação estatística educativa, sem magnetómetro físico ou vantagem quântica demonstrada.

O terreno é explicado na partida. Salto do GPS, apagão, deriva e congelamento são apresentados antes do primeiro movimento afetado. A Aurora-fantasma é explicada quando surge pela primeira vez; um ataque durante o apagão pode não a mostrar. O jogo pausa até à confirmação. As mecânicas confirmadas ficam guardadas; saltar para um nível avançado apresenta as explicações desconhecidas no momento adequado. A fantasma é um engano visual do GPS, não uma segunda cápsula física. Aproximar-se dela não salva a Aurora-1; a vitória exige alcançar a cápsula verdadeira dentro do raio configurado.

O rádio fica separado do radar GPS, bússola, telemetria e leme. Abrir ou fechar preserva a posição da carta e dos controlos. Em telemóveis pequenos, abre temporariamente sobre o mar; mensagens longas têm deslocamento dentro do rádio, e fechá-lo liberta a carta.

## Verificação dos tutoriais no navegador

`tests/browser-onboarding.cjs` verifica o salvamento real nos quatro turnos do nível 00, cartões traduzidos, pausa e sequência dos diálogos do sensor e das mecânicas em 1336×605, 390×667, 320×568 e 667×375 nos quatro idiomas. Usa a mesma configuração Playwright da suíte de layout.

`node tests/browser-qa.cjs` exercita salvamento e falha reais, marcação GPS final, falsos alarmes, transferência JSON, ajuda do sensor e disponibilidade de GHZ antes/depois do nível 45 e do esgotamento de medições. Cobre quatro idiomas em 1366×768, 1336×605, 320×568 e 667×375, com a mesma configuração Playwright.

[Aprendizagem do sensor e progressão da campanha](campaign-design.md)
