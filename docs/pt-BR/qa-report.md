# Relatório de verificação

[English](../qa-report.md) · **Português (Brasil)** · [Português (Portugal)](../pt-PT/qa-report.md) · [Español](../es/qa-report.md)

## Revisão atual — 11 de outubro de 2026

As referências científicas, a declaração para submissão e os critérios de produto educacional agora distinguem fundamentos externos da integração original do jogo. Estatística Ramsey/GHZ, localização clássica, mapa sintético e execução Qollab independente estão explícitos.

Corrigidos: rolagem desnecessária no menu inicial de notebooks/celulares comuns, ações duplicadas de início no celular, textos da missão saindo da moldura em telas intermediárias/baixas e botão principal que ignorava um nível recém-selecionado. Reiniciar/exportar ficam em **Ajuda e ações**. A rolagem interna continua disponível em telas muito pequenas/deitadas e na ajuda expandida; o conteúdo do menu não é descartado para esconder a barra.

Validação: **108 testes Python passaram** (Python 3.12, Qiskit 2.5.2); as nove suítes existentes do frontend passaram, incluindo rotas viáveis nos 100 níveis. A ação do nível selecionado tem regressão do controlador. Verificações reais Chromium/Edge cobrem quatro idiomas nas 16 telas abaixo, redimensionamento, rolagem, controles nas molduras, rádio sem cobrir leme e ajuda expandida. A exportação do replay também foi exercitada em celular pequeno. Links da documentação e limites do pacote gerado foram conferidos. Imagens atualizadas a partir de jogo real em inglês.

Telas verificadas: 1920×1080, 1440×900, 1366×768, 1280×720, 1200×640, 1024×768, 900×600, 899×700, 851×600, 768×1024, 390×844, 390×667, 360×640, 320×568, 844×390, 667×375.

Execute `tests/browser-layout.cjs` opcional conforme o guia técnico. Isso não comprova acessibilidade exaustiva, aprendizagem, todos os aparelhos/níveis de zoom, implantação em produção ou execução Qollab/IonQ. Links da plataforma, evidência de backend, vídeo e submissão formal continuam dependendo da equipe/conta.

## Verificação anterior — 10 de outubro de 2026

Revisão em 2026-10-10: frontend, giro do navio, walkie-talkie, campanha gradual e documentação nos quatro idiomas.

| Área verificada | Evidência |
| --- | --- |
| Regras | Encalhe, orçamento, marcações de leituras observadas, exportação JSON e resgate antigo. |
| Estimador | Transporte fracionário, conservação da probabilidade nos limites e regiões de credibilidade. |
| Traduções e interface | Quatro catálogos, variáveis, ligações HTML, resgate do tutorial, progresso salvo, repetição e reinício. |
| Campanha | As 100 configurações admitem resgate seguro com movimentos fixos, rumos inteiros e correntes com sementes definidas. |
| Navio | 64 perspectivas distintas, limites íntegros, mastro em pé, mudanças rápidas de rumo, passagem pelo norte e estabilização. |
| Mapa e experiência | Cinco configurações de projeção; nomes, introduções, sons sintetizados, silêncio e áudio indisponível. |

O navegador foi testado com giro contínuo e abertura/fechamento do rádio em 1440×900, 1366×768, 1024×768, 900×600, 844×390, 390×844, 390×667 e 768×1024, nos quatro idiomas. Foram incluídos encalhe e os dois alertas; o rádio não cobriu os controles e nenhum erro de execução foi registrado.

A documentação foi verificada quanto a links relativos, idiomas, caminhos e conteúdo dos pacotes. As imagens do README são capturas reais em inglês.

## Limites das evidências

Rotas possíveis não medem dificuldade percebida. Formações estáveis, crescimento gradual e restrições monotônicas de recursos precisam de partidas com jogadores para ajustes finos. Gerar áudio não certifica a qualidade subjetiva; testar teclado não certifica acessibilidade.

O backend Python não foi alterado nem testado novamente nesta etapa. Documentos antigos registravam 105 testes Python; a contagem histórica não é um resultado novo. Publicação online e execução Qollab/IonQ precisam de evidências próprias.

[Guia técnico](technical-guide.md) · [Central de documentação](README.md)

This effort is supported by Qollab & IonQ
