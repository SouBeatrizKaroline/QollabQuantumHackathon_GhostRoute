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
