# Fluxo de contribuição

[English](../git-guide.md) · **Português (Brasil)** · [Português (Portugal)](../pt-PT/git-guide.md) · [Español](../es/git-guide.md)

Deixe as mudanças revisáveis e separe arquivos gerados.

## Começar de uma base limpa

~~~sh
git clone https://github.com/SouBeatrizKaroline/QollabQuantumHackathon_GhostRoute.git
cd QollabQuantumHackathon_GhostRoute
git status
git switch -c improve/your-change
~~~

Em uma cópia existente, examine e preserve o trabalho local antes de atualizar. Escolha um nome que descreva a mudança; o exemplo não registra uma branch existente.

## Revisar, verificar e propor

Execute as verificações do guia técnico. Mantenha os quatro idiomas alinhados ao alterar comportamentos. Substitua <code>&lt;changed-files&gt;</code> por caminhos explícitos. Revise as mudanças preparadas e abra uma proposta para main com evidências de validação.

~~~sh
git diff
git status
git add <changed-files>
git diff --cached
git commit -m "Describe the resulting behavior"
git push -u origin improve/your-change
~~~

## Código e arquivos gerados

O frontend fica em public/. Os arquivos quânticos são main.py e sensor.py na raiz. READMEs traduzidos ficam na raiz; guias em docs/pt-BR/, docs/pt-PT/ e docs/es/. Os guias ingleses ficam diretamente em docs/. Não inclua .venv/, caches, credenciais nem dist/ gerado em commits.

[Guia técnico](technical-guide.md) · [Central de documentação](README.md)

This effort is supported by Qollab & IonQ
