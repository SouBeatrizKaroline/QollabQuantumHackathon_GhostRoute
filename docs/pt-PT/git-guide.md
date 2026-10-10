# Fluxo de contribuição

[English](../git-guide.md) · [Português (Brasil)](../pt-BR/git-guide.md) · **Português (Portugal)** · [Español](../es/git-guide.md)

Deixa as alterações prontas para revisão e separa os ficheiros gerados.

## Começar de uma base limpa

~~~sh
git clone https://github.com/SouBeatrizKaroline/QollabQuantumHackathon_GhostRoute.git
cd QollabQuantumHackathon_GhostRoute
git status
git switch -c improve/your-change
~~~

Numa cópia existente, examina e preserva o trabalho local antes de atualizar. Escolhe um nome que descreva a alteração; o exemplo não regista uma branch existente.

## Rever, verificar e propor

Executa as verificações do guia técnico. Mantém os quatro idiomas alinhados ao alterar comportamentos. Substitui <code>&lt;changed-files&gt;</code> por caminhos explícitos. Revê as alterações preparadas e abre uma proposta para main com evidências de validação.

~~~sh
git diff
git status
git add <changed-files>
git diff --cached
git commit -m "Describe the resulting behavior"
git push -u origin improve/your-change
~~~

## Código e ficheiros gerados

O frontend fica em public/. Os ficheiros quânticos são main.py e sensor.py na raiz. Os READMEs traduzidos ficam na raiz; os guias em docs/pt-BR/, docs/pt-PT/ e docs/es/. Os guias ingleses ficam diretamente em docs/. Não incluas .venv/, caches, credenciais nem dist/ gerado em commits.

[Guia técnico](technical-guide.md) · [Centro de documentação](README.md)

This effort is supported by Qollab & IonQ
