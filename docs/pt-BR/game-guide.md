# Guia do jogador

[English](../game-guide.md) · **Português (Brasil)** · [Português (Portugal)](../pt-PT/game-guide.md) · [Español](../es/game-guide.md)

**Sua missão: alcançar a Aurora-1, evitar o encalhe e decidir quais leituras do GPS merecem suspeita.** Não precisa conhecer física quântica.

## Comece pelo nível 00

Abra [o jogo](../../public/index.html) ou a [versão online](https://ghostroutegame.vercel.app/). Escolha o nível 00 e mantenha o **rumo 045° (NE)** durante quatro movimentos. Quoora explica o leme, sensor Simples, comparação com o GPS e resgate. Leia cada introdução, confirme e faça o próximo movimento.

## O ciclo de decisões

1. **Escolha o rumo.** Use a bússola ou arraste o seletor. Norte é 0°, leste é 90°.
2. **Faça uma leitura.** Escolha Desligado ou Simples; GHZ fica disponível no nível 45. Selecione quantas medições gastar.
3. **Avance.** O navio percorre uma distância fixa para aquela missão, com a incerteza da corrente. Um turno representa 20 minutos fictícios.
4. **Compare.** O navio mostra a posição estimada; o quadrado GPS é a posição informada. A densidade lilás mostra possibilidades, não certeza.
5. **Marque.** Se a leitura exibida parecer suspeita, marque-a depois de observá-la. A caixa pertence ao turno concluído, não ao próximo movimento.

Planeje todo o segmento: cruzar uma pedra ou um recife encalha o navio mesmo que o destino esteja livre. Alcance a cápsula dentro do raio indicado antes que o tempo termine. O resgate encerra a missão assim que você chega.

## Uma campanha gradual

| Primeiro nível | O que muda e o que praticar |
| --- | --- |
| 00 | Quatro turnos guiados: rumo, leitura Simples, comparação GPS e resgate. |
| 01–04 | Prática das mesmas habilidades em mar calmo, sem obstáculos, correntes, ataques ou cartões de novas mecânicas. |
| 05 | Correntes muito leves: medir depois de avançar e corrigir o rumo. |
| 10 | Uma pedra pequena: planejar uma curva suave em mar aberto. |
| 25 | Primeira passagem larga em banco de areia, nas missões com portões. |
| 35 | Um salto curto do GPS: comparar a leitura exibida com o sensor. |
| 45 | GHZ opcional: maior sensibilidade de fase com ambiguidade; Simples continua disponível. |
| 55 | Recife e segunda abertura nas missões com portões. |
| 65 | Apagão na reentrada: usar a elipse prevista até o sinal voltar. |
| 70 | Sinal falso da Aurora: usar evidências independentes da posição, além da aparência. |
| 75 | Deriva do GPS: comparar leituras sucessivas. |
| 85 | Terceira abertura alternada nas missões com portões. |
| 90 | Congelamento do GPS: observar se a posição informada acompanha o navio. |
| 95 | Orientação de orçamento antes dos desafios finais combinados. |
| 99 | Maior pressão conjunta: três passagens estreitas, oito pedras, três tipos de ataque e precisão de resgate exigente. |

Os níveis 01–04 reforçam o uso do sensor ensinado no tutorial 00. As mecânicas entram uma por vez, com pelo menos cinco níveis entre introduções. O destino se desloca suavemente pelo mapa; a incerteza da corrente aumenta, o orçamento diminui e a precisão exigida no resgate cresce gradualmente. A demanda de distância da rota de referência aumenta de cerca de 70% no nível 01 a 92% no 99. Essa referência usa os centros das passagens, não inclui desvios por pedras e não mede sucesso nem garante que todo jogador perceba cada nível adjacente como mais difícil.

O terreno é explicado na partida. Salto do GPS, apagão, deriva e congelamento são apresentados antes do primeiro movimento afetado. A Aurora-fantasma é explicada quando aparece pela primeira vez; um ataque durante o apagão pode não exibi-la. O jogo pausa até a confirmação do cartão. As mecânicas confirmadas são lembradas; quem pula para uma fase avançada recebe as explicações desconhecidas no momento adequado. A fantasma é um engano visual do GPS, não uma segunda cápsula física. Aproximar-se dela não resgata a Aurora-1; a vitória exige alcançar a cápsula real dentro do raio configurado.

As formações de pedras crescem gradualmente, em vez de mudar aleatoriamente a cada fase. Pedras novas começam pequenas. O menu mostra turnos, orçamento, raio de resgate e índice de dificuldade; esse índice descreve o projeto, não uma taxa de sucesso medida. É possível escolher qualquer fase, com introduções para mecânicas desconhecidas.

## Rádio, som e controles

Clique no **ícone de walkie-talkie** para abrir ou fechar mensagens. Um brilho e o aviso ! indicam uma mensagem ainda não lida. O rádio abre sem cobrir alertas ou leme. Use **Menu → Som** para ativar ou silenciar. O áudio começa após uma interação.

Com o mapa em foco: **Enter / Espaço** avança; **Esquerda / Direita** muda o rumo em 5°; **R** reinicia; **D** mostra a posição real com uma identificação de depuração; **Esc** abre o menu. Os campos mantêm o comportamento normal do teclado. Tela cheia depende do navegador.

Idiomas: **IN** inglês, **BR** português do Brasil (padrão), **PT** português de Portugal, **ES** espanhol. Preferências e fases concluídas pertencem a este navegador e endereço. Restrições de armazenamento não impedem jogar, mas podem impedir salvar.

![Interface de Ghost Route no celular, com rádio walkie-talkie.](../assets/ghost-route-mobile.png)

## Aprenda com o resultado

Um resgate seguro conclui a fase. O resgate perfeito também exige marcar ao menos uma leitura observada de cada ataque presente; falsos alarmes são informados separadamente. A repetição mostra rotas real, GPS e inercial, horários dos ataques e contagens de medições. O mapa de probabilidade de cada turno não aparece na repetição histórica porque essas imagens não são armazenadas. A exportação salva as decisões em JSON para inspeção e repetição dos circuitos em Python.

Mais medições reduzem o ruído de amostragem e gastam o orçamento. Você ainda pode navegar sem medições. O alerta de coerência indica discordância com a estimativa, não detecção garantida de ataque. [Entenda o modelo](technical-guide.md).

Ajuda e ações no menu contém o guia de navegação, reinício e exportação de decisões. Em celular na vertical, o botão principal inicia o nível recém-selecionado; nos demais casos continua a missão ou abre seu replay.

[Aprendizagem do sensor e progressão da campanha](campaign-design.md)
