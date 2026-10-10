# Guia do jogador

[English](../game-guide.md) · **Português (Brasil)** · [Português (Portugal)](../pt-PT/game-guide.md) · [Español](../es/game-guide.md)

**Sua missão: alcançar a Aurora-1, evitar o encalhe e decidir quais leituras do GPS merecem suspeita.** Não precisa conhecer física quântica.

## Comece pelo nível 00

Abra [o jogo](../../public/index.html) ou a [versão online](https://ghostroutegame.vercel.app/). Escolha o nível 00 e mantenha o **rumo 045° (NE)** durante quatro movimentos. Quoora explica o leme, sensor Simples, comparação com o GPS e resgate. Leia cada introdução, confirme e faça o próximo movimento.

## O ciclo de decisões

1. **Escolha o rumo.** Use a bússola ou arraste o seletor. Norte é 0°, leste é 90°.
2. **Faça uma leitura.** Escolha Desligado ou Simples; GHZ fica disponível no nível 06. Selecione quantas medições gastar.
3. **Avance.** O navio percorre uma distância fixa para aquela missão, com a incerteza da corrente. Um turno representa 20 minutos fictícios.
4. **Compare.** O navio mostra a posição estimada; o quadrado GPS é a posição informada. A densidade lilás mostra possibilidades, não certeza.
5. **Marque.** Se a leitura exibida parecer suspeita, marque-a depois de observá-la. A caixa pertence ao turno concluído, não ao próximo movimento.

Planeje todo o segmento: cruzar uma pedra ou um recife encalha o navio mesmo que o destino esteja livre. Alcance a cápsula dentro do raio indicado antes que o tempo termine. O resgate encerra a missão assim que você chega.

## Uma campanha gradual

| Primeiro nível | Novo desafio |
| --- | --- |
| 00 | Quatro turnos seguros de tutorial, sem ataques nem ruído de corrente. |
| 01 | Pedras e correntes leves, apresentadas antes de usar. |
| 03 | Salto do GPS: deslocamento falso repentino. |
| 06 | GHZ: maior sensibilidade de fase com três fases candidatas. |
| 10 | Recife central, coordenadas ocultas na reentrada e deriva gradual do GPS. |
| 30 | GPS congelado: a leitura pode parar enquanto você avança. |
| 60 | Orientação para economizar medições; o congelamento pode durar mais. |
| 99 | Menos recursos, menor raio de resgate e maior ruído de corrente. |

As formações de pedras crescem gradualmente, em vez de mudar aleatoriamente a cada fase. Pedras novas começam pequenas. O menu mostra turnos, orçamento, raio de resgate e índice de dificuldade; esse índice descreve o projeto, não uma taxa de sucesso medida. É possível escolher qualquer fase, com introduções para mecânicas desconhecidas.

## Rádio, som e controles

Clique no **ícone de walkie-talkie** para abrir ou fechar mensagens. Um brilho e o aviso ! indicam uma mensagem ainda não lida. O rádio abre sem cobrir alertas ou leme. Use **Menu → Som** para ativar ou silenciar. O áudio começa após uma interação.

Com o mapa em foco: **Enter / Espaço** avança; **Esquerda / Direita** muda o rumo em 5°; **R** reinicia; **D** mostra a posição real com uma identificação de depuração; **Esc** abre o menu. Os campos mantêm o comportamento normal do teclado. Tela cheia depende do navegador.

Idiomas: **IN** inglês, **BR** português do Brasil (padrão), **PT** português de Portugal, **ES** espanhol. Preferências e fases concluídas pertencem a este navegador e endereço. Restrições de armazenamento não impedem jogar, mas podem impedir salvar.

![Interface de Ghost Route no celular, com rádio walkie-talkie.](../assets/ghost-route-mobile.png)

## Aprenda com o resultado

Um resgate seguro conclui a fase. O resgate perfeito também exige marcar ao menos uma leitura observada de cada ataque presente; falsos alarmes são informados separadamente. A repetição mostra rotas real, GPS e inercial, horários dos ataques e contagens de medições. O mapa de probabilidade de cada turno não aparece na repetição histórica porque essas imagens não são armazenadas. A exportação salva as decisões em JSON para inspeção e repetição dos circuitos em Python.

Mais medições reduzem o ruído de amostragem e gastam o orçamento. Você ainda pode navegar sem medições. O alerta de coerência indica discordância com a estimativa, não detecção garantida de ataque. [Entenda o modelo](technical-guide.md).
