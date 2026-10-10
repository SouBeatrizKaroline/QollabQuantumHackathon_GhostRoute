# Git workflow

The repository is [SouBeatrizKaroline/QollabQuantumHackathon_GhostRoute](https://github.com/SouBeatrizKaroline/QollabQuantumHackathon_GhostRoute).

## Get the current project

```sh
git clone https://github.com/SouBeatrizKaroline/QollabQuantumHackathon_GhostRoute.git
cd QollabQuantumHackathon_GhostRoute
git status
```

For an existing checkout, inspect your local changes before pulling. Keep changes you need by committing or stashing them.

## Review and publish changes

```sh
git switch -c fix/game-qa
git diff
git status
```

Run the checks described in [../README.md](../README.md). Stage the files you intend to publish, review the staged diff, commit, and push the branch:

```sh
git add public main.py sensor.py scripts tests docs README.md requirements.txt vercel.json .gitignore examples
git diff --cached
git commit -m "fix: improve game QA and localization"
git push -u origin fix/game-qa
```

Open a pull request into `main` for review. The commands above are a suggested workflow, not a record that a branch or commit has already been published.

## Generated and local files

Keep `.venv/`, Python caches and `dist/` out of Git. Qollab distributions are generated with `python scripts/package_qollab.py`; the maintained web source lives in `public/`, the Qollab entrypoint is root `main.py`, and `sensor.py` contains the reusable quantum sensor.

There is no required Git bundle or legacy archive in this project.

This effort is supported by Qollab & IonQ
