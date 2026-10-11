# Relatório de verificação

[English](../qa-report.md) · [Português (Brasil)](../pt-BR/qa-report.md) · **Português (Portugal)** · [Español](../es/qa-report.md)

## Revisão atual — 11 de outubro de 2026

As referências científicas, declaração para submissão e critérios educativos distinguem fundamentos externos da integração original do jogo. Estatística Ramsey/GHZ, localização clássica, mapa sintético e execução Qollab independente estão explícitos.

Corrigidos: deslocamento desnecessário do menu inicial em portáteis/telemóveis comuns, ações de início duplicadas, texto da missão fora da moldura em telas intermédias/baixas e botão principal que ignorava um nível recém-selecionado. Reiniciar/exportar ficam em **Ajuda e ações**. O deslocamento interno continua em telas muito pequenas/horizontais e ajuda expandida; o conteúdo não é descartado para esconder a barra.

Validação: **108 testes Python passaram** (Python 3.12, Qiskit 2.5.2); nove suítes frontend existentes passaram, incluindo rotas viáveis nos 100 níveis. A ação do nível selecionado tem regressão do controlador. Chromium/Edge real cobre quatro idiomas nas 16 telas abaixo, redimensionamento, deslocamento, controlos nas molduras, rádio separado do leme e ajuda expandida. Exportação da repetição exercitada em telemóvel pequeno. Ligações e limites do pacote verificados; imagens atualizadas a partir do jogo em inglês.

Telas verificadas: 1920×1080, 1440×900, 1366×768, 1280×720, 1200×640, 1024×768, 900×600, 899×700, 851×600, 768×1024, 390×844, 390×667, 360×640, 320×568, 844×390, 667×375.

Execute `tests/browser-layout.cjs` opcional conforme o guia técnico. Não comprova acessibilidade exaustiva, aprendizagem, todos os aparelhos/níveis de zoom, produção ou execução Qollab/IonQ. Ligações da plataforma, backend, vídeo e submissão formal dependem da equipa/conta.

## Verificação anterior — 10 de outubro de 2026

Revisão em 2026-10-10: frontend, giro do navio, walkie-talkie, campanha gradual e documentação nos quatro idiomas.

| Área verificada | Evidência |
| --- | --- |
| Regras | Encalhe, orçamento, marcações de leituras observadas, exportação JSON e salvamento antigo. |
| Estimador | Transporte fracionário, conservação da probabilidade nos limites e regiões de credibilidade. |
| Traduções e interface | Quatro catálogos, variáveis, ligações HTML, salvamento do tutorial, progresso guardado, repetição e reinício. |
| Campanha | As 100 configurações admitem salvamento seguro com movimentos fixos, rumos inteiros e correntes com sementes definidas. |
| Navio | 64 perspetivas distintas, limites íntegros, mastro na vertical, mudanças rápidas de rumo, passagem pelo norte e estabilização. |
| Mapa e experiência | Cinco configurações de projeção; nomes, introduções, sons sintetizados, silêncio e áudio indisponível. |

O navegador foi testado com giro contínuo e abertura/fecho do rádio em 1440×900, 1366×768, 1024×768, 900×600, 844×390, 390×844, 390×667 e 768×1024, nos quatro idiomas. Foram incluídos encalhe e os dois alertas; o rádio não cobriu os controlos e nenhum erro de execução foi registado.

A documentação foi verificada quanto a ligações relativas, idiomas, caminhos e conteúdo dos pacotes. As imagens do README são capturas reais em inglês.

## Limites das evidências

Rotas possíveis não medem dificuldade percebida. Formações estáveis, crescimento gradual e restrições monotónicas de recursos precisam de partidas com jogadores para ajustes finos. Gerar áudio não certifica a qualidade subjetiva; testar teclado não certifica acessibilidade.

O backend Python não foi alterado nem testado novamente nesta etapa. Documentos antigos registavam 105 testes Python; a contagem histórica não é um resultado novo. Publicação online e execução Qollab/IonQ precisam de evidências próprias.

[Guia técnico](technical-guide.md) · [Centro de documentação](README.md)

This effort is supported by Qollab & IonQ
