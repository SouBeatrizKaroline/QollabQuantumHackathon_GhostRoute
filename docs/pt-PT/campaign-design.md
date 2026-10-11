# Aprendizagem do sensor e progressão da campanha

[English](../game-guide.md) · [Português (Brasil)](../pt-BR/game-guide.md) · **Português (Portugal)** · [Español](../es/game-guide.md)

O objetivo educativo continua a ser compreender o sensor: incerteza da amostragem, relação entre assinatura magnética e fase, ambiguidade, combinação de leitura com movimento e comparação com o GPS. O rádio nas fases calmas sugere variar as medições; o terreno posterior dá um motivo a estas decisões. Os obstáculos aplicam a aprendizagem. O navegador continua uma simulação estatística educativa, sem magnetómetro físico ou vantagem quântica demonstrada.

| Primeiro nível | O que muda e o que praticar |
| --- | --- |
| 00 | Quatro turnos guiados: rumo, leitura Simples, comparação GPS e salvamento. |
| 01–04 | Prática das mesmas competências em mar calmo, sem obstáculos, correntes, ataques ou cartões de novas mecânicas. |
| 05 | Correntes muito suaves: medir depois de avançar e corrigir o rumo. |
| 10 | Uma pedra pequena: planear uma curva suave em mar aberto. |
| 25 | Primeira passagem larga em banco de areia, nas missões com portões. |
| 35 | Um salto curto do GPS: comparar a leitura com o sensor. |
| 45 | GHZ opcional: maior sensibilidade de fase com ambiguidade; Simples continua disponível. |
| 55 | Recife e segunda abertura nas missões com portões. |
| 65 | Apagão na reentrada: usar a elipse prevista até o sinal voltar. |
| 70 | Sinal falso da Aurora: usar evidências independentes da posição. |
| 75 | Deriva do GPS: comparar leituras sucessivas. |
| 85 | Terceira abertura alternada nas missões com portões. |
| 90 | Congelamento do GPS: observar se a posição acompanha o navio. |
| 95 | Orientação sobre o orçamento antes dos desafios finais combinados. |
| 99 | Maior pressão conjunta: três passagens estreitas, oito pedras, três tipos de ataque e precisão exigente no salvamento. |

Os níveis 01–04 reforçam o uso do sensor ensinado no tutorial 00. As mecânicas entram uma de cada vez, com pelo menos cinco níveis entre introduções. O destino desloca-se suavemente; a incerteza da corrente aumenta, o orçamento diminui e a precisão exigida no salvamento cresce gradualmente. A procura de distância da rota de referência aumenta de cerca de 70% no nível 01 a 92% no 99. A referência usa os centros das passagens, não inclui desvios por pedras e não mede sucesso nem garante que cada jogador perceba todos os níveis adjacentes como mais difíceis.

As missões com passagens começam no 25. Os níveis terminados em 5–9 usam portões; os terminados em 0–4 têm mar aberto. Um, dois e três portões surgem em 25, 55 e 85. Cada abertura nova começa larga. As existentes estreitam e deslocam-se gradualmente, sem inverter de lado em cada nível. Pedras pequenas podem exigir curvas sem muralhas. A missão final combina os desafios apresentados; as variantes de mar aberto mantêm a pressão de corrente, sensor, ataques e precisão.

Evidência nova: 112 testes Python, nove suítes do frontend, busca de rotas com semente nos 100 níveis e exportações reais do controlador validadas em Python. Os testes exigem fases iniciais calmas, uma mecânica nova de cada vez, intervalo entre introduções, mudanças limitadas nos recursos e configuração final combinada. O navegador cobre quatro idiomas, 21 tamanhos, tutorial de quatro turnos, níveis calmos 01–04 e as 12 explicações. Observação humana continua necessária para compreensão, frustração e dificuldade percebida.

[Ramsey / GHZ](scientific-basis.md) · [QA](qa-report.md)

![Nível 01 calmo: praticar o sensor sem obstáculos.](../assets/ghost-route-level01.png)

![Missão em mar aberto: pedras e correntes podem exigir curvas sem muralhas.](../assets/ghost-route-open-water.png)

## Nomes dos níveis da campanha

Cada título acompanha a rota e a aprendizagem dessa etapa. O nome não acrescenta uma mecânica nem promete uma posição exata.

| Nível | Título |
| --- | --- |
| 00 | Primeira viagem |
| 01 | Águas tranquilas |
| 02 | Rumo à Aurora |
| 03 | Ler o mar |
| 04 | Confiança no rumo |
| 05 | Primeira corrente |
| 06 | Corrigir o rumo |
| 07 | Medir e ajustar |
| 08 | Acompanhar a corrente |
| 09 | Equilíbrio no mar |
| 10 | Primeiro desvio |
| 11 | Contornar a pedra |
| 12 | Curva suave |
| 13 | Espaço para manobrar |
| 14 | Rota entre pedras |
| 15 | Olhar adiante |
| 16 | Manobra cuidadosa |
| 17 | Ler antes de virar |
| 18 | Traçar uma curva |
| 19 | Rumo sob controlo |
| 20 | Mar aberto, rota livre |
| 21 | Escolher o desvio |
| 22 | Entre curvas e leituras |
| 23 | Preparar a manobra |
| 24 | Caminho seguro |
| 25 | Primeira passagem |
| 26 | Entre bancos de areia |
| 27 | Encontrar a abertura |
| 28 | Curva na passagem |
| 29 | Além do banco |
| 30 | De volta ao mar aberto |
| 31 | Leituras em movimento |
| 32 | Contorno planeado |
| 33 | Rota e estimativa |
| 34 | Preparar a travessia |
| 35 | Primeiro sinal falso |
| 36 | Passagem sob suspeita |
| 37 | Conferir os instrumentos |
| 38 | Curva com evidências |
| 39 | Além do GPS |
| 40 | Sinais em mar aberto |
| 41 | Comparar para navegar |
| 42 | Rumo com incerteza |
| 43 | Desvio do sinal falso |
| 44 | Leituras independentes |
| 45 | Conhecer o GHZ |
| 46 | Sensibilidade na passagem |
| 47 | Fases e caminhos |
| 48 | Resolver a ambiguidade |
| 49 | Comparar modos |
| 50 | GHZ em mar aberto |
| 51 | Histórico e leitura |
| 52 | Escolher a evidência |
| 53 | Sensibilidade com cuidado |
| 54 | Preparar duas curvas |
| 55 | Segunda passagem |
| 56 | Entre areia e recife |
| 57 | Aberturas alternadas |
| 58 | Uma curva de cada vez |
| 59 | Travessia do recife |
| 60 | Horizonte aberto |
| 61 | Pedras e evidências |
| 62 | Rumo bem estimado |
| 63 | Manobra entre sinais |
| 64 | Leitura para o resgate |
| 65 | Silêncio na reentrada |
| 66 | Rumo à elipse |
| 67 | Esperar o sinal |
| 68 | Travessia sem contato |
| 69 | Reencontrar a Aurora |
| 70 | Primeira Aurora-fantasma |
| 71 | Dois sinais no horizonte |
| 72 | Procurar a Aurora real |
| 73 | Evidências para o resgate |
| 74 | Entre ecos e pedras |
| 75 | Primeira deriva falsa |
| 76 | Erro que se acumula |
| 77 | Corrigir entre passagens |
| 78 | Rastrear o desvio |
| 79 | Curvas sob engano |
| 80 | Ecos em mar aberto |
| 81 | Conferir a trajetória |
| 82 | Estimar sob pressão |
| 83 | Separar os sinais |
| 84 | Preparar o slalom |
| 85 | Terceira passagem |
| 86 | Três curvas no mar |
| 87 | Slalom entre sinais |
| 88 | Alternar com precisão |
| 89 | Travessia em três etapas |
| 90 | Primeiro GPS congelado |
| 91 | Navio em movimento |
| 92 | Detectar a posição parada |
| 93 | Leituras sob engano |
| 94 | Último mar aberto |
| 95 | Cada medição conta |
| 96 | Precisão nas passagens |
| 97 | Últimas curvas |
| 98 | Resgate sob pressão |
| 99 | Rota fantasma final |
