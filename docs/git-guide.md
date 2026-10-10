# Contribution workflow

**English** · [Português (Brasil)](pt-BR/git-guide.md) · [Português (Portugal)](pt-PT/git-guide.md) · [Español](es/git-guide.md)

Make changes reviewable and keep generated files separate.

## Get a clean starting point

~~~sh
git clone https://github.com/SouBeatrizKaroline/QollabQuantumHackathon_GhostRoute.git
cd QollabQuantumHackathon_GhostRoute
git status
git switch -c improve/your-change
~~~

For an existing checkout, inspect and preserve local work before pulling. Use a branch name describing the change; the example is not a record of an existing branch.

## Review, verify and propose

Run the relevant checks in the technical guide. Keep all four documentation languages aligned when changing behavior. Replace <code>&lt;changed-files&gt;</code> with explicit paths. Review the staged diff and open a pull request into main with validation evidence.

~~~sh
git diff
git status
git add <changed-files>
git diff --cached
git commit -m "Describe the resulting behavior"
git push -u origin improve/your-change
~~~

## Source and generated files

The web source is public/. Quantum sources are root main.py and sensor.py. Translated READMEs live at the root; guides live in docs/pt-BR/, docs/pt-PT/ and docs/es/. English guides stay directly in docs/. Keep .venv/, caches, credentials and generated dist/ out of commits.

[Technical guide](technical-guide.md) · [Documentation hub](README.md)

This effort is supported by Qollab & IonQ
