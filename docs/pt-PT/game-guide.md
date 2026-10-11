# Guia do jogador

[English](../game-guide.md) · [Português (Brasil)](../pt-BR/game-guide.md) · **Português (Portugal)** · [Español](../es/game-guide.md)

**A tua missão: alcançar a Aurora-1, evitar o encalhe e decidir quais as leituras GPS que merecem suspeita.** Não precisas de conhecer física quântica.

## Começa pelo nível 00

Abre [o jogo](../../public/index.html) ou a [versão online](https://ghostroutegame.vercel.app/). Escolhe o nível 00 e mantém o **rumo 045° (NE)** durante quatro movimentos. A Quoora explica o leme, sensor Simples, comparação com o GPS e salvamento. Lê cada introdução, confirma e faz o próximo movimento.

## O ciclo de decisões

1. **Escolhe o rumo.** Usa a bússola ou arrasta o seletor. Norte é 0°, este é 90°.
2. **Faz uma leitura.** Escolhe Desligado ou Simples; GHZ fica disponível no nível 45. Seleciona quantas medições gastar.
3. **Avança.** O navio percorre uma distância fixa para aquela missão, com a incerteza da corrente. Um turno representa 20 minutos fictícios.
4. **Compara.** O navio mostra a posição estimada; o quadrado GPS é a posição comunicada. A densidade lilás mostra possibilidades, não certeza.
5. **Assinala.** Se a leitura apresentada parecer suspeita, assinala-a depois de a observares. A caixa pertence ao turno concluído, não ao próximo movimento.

Planeia todo o segmento: atravessar uma pedra ou um recife encalha o navio mesmo que o destino esteja livre. Alcança a cápsula dentro do raio indicado antes de acabar o tempo. O salvamento encerra a missão assim que chegas.

## Uma campanha gradual

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

O terreno é explicado na partida. Salto do GPS, apagão, deriva e congelamento são apresentados antes do primeiro movimento afetado. A Aurora-fantasma é explicada quando surge pela primeira vez; um ataque durante o apagão pode não a mostrar. O jogo pausa até à confirmação. As mecânicas confirmadas ficam guardadas; saltar para um nível avançado apresenta as explicações desconhecidas no momento adequado. A fantasma é um engano visual do GPS, não uma segunda cápsula física. Aproximar-se dela não salva a Aurora-1; a vitória exige alcançar a cápsula verdadeira dentro do raio configurado.

As formações de pedras crescem gradualmente, em vez de mudar aleatoriamente em cada nível. As pedras novas começam pequenas. O menu mostra turnos, orçamento, raio de salvamento e índice de dificuldade; este índice descreve o projeto, não uma taxa de sucesso medida. Podes escolher qualquer nível, com introduções para mecânicas desconhecidas.

## Rádio, som e controlos

Clica no **ícone de walkie-talkie** para abrir ou fechar mensagens. Um brilho e o aviso ! indicam uma mensagem ainda não lida. O rádio abre sem cobrir alertas ou leme. Usa **Menu → Som** para ativar ou desligar. O áudio começa após uma interação.

Com o mapa em foco: **Enter / Espaço** avança; **Esquerda / Direita** muda o rumo em 5°; **R** reinicia; **D** mostra a posição verdadeira com uma identificação de depuração; **Esc** abre o menu. Os campos mantêm o comportamento normal do teclado. O ecrã inteiro depende do navegador.

Idiomas: **IN** inglês, **BR** português do Brasil (predefinido), **PT** português de Portugal, **ES** espanhol. Preferências e níveis concluídos pertencem a este navegador e endereço. As restrições de armazenamento não impedem jogar, mas podem impedir guardar.

![Interface de Ghost Route no telemóvel, com rádio walkie-talkie.](../assets/ghost-route-mobile.png)

## Aprende com o resultado

Um salvamento seguro conclui o nível. O salvamento perfeito também exige assinalar pelo menos uma leitura observada de cada ataque presente; os falsos alarmes são apresentados separadamente. A repetição mostra rotas verdadeira, GPS e inercial, momentos dos ataques e contagens de medições. O mapa de probabilidade de cada turno não aparece na repetição histórica porque essas imagens não são guardadas. A exportação guarda as decisões em JSON para inspeção e repetição dos circuitos em Python.

Mais medições reduzem o ruído de amostragem e gastam o orçamento. Ainda podes navegar sem medições. O alerta de coerência indica discordância com a estimativa, não deteção garantida de ataque. [Compreende o modelo](technical-guide.md).

Ajuda e ações no menu contém guia de navegação, reinício e exportação de decisões. Na vertical, o botão principal inicia o nível recém-selecionado; nos restantes casos continua a missão ou abre a repetição.

[Aprendizagem do sensor e progressão da campanha](campaign-design.md)
