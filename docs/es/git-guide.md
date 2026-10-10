# Flujo de contribución

[English](../git-guide.md) · [Português (Brasil)](../pt-BR/git-guide.md) · [Português (Portugal)](../pt-PT/git-guide.md) · **Español**

Deja los cambios listos para revisión y separa los archivos generados.

## Empezar desde una base limpia

~~~sh
git clone https://github.com/SouBeatrizKaroline/QollabQuantumHackathon_GhostRoute.git
cd QollabQuantumHackathon_GhostRoute
git status
git switch -c improve/your-change
~~~

En una copia existente, examina y conserva el trabajo local antes de actualizar. Elige un nombre que describa el cambio; el ejemplo no registra una rama existente.

## Revisar, verificar y proponer

Ejecuta las verificaciones de la guía técnica. Mantén los cuatro idiomas alineados al cambiar comportamientos. Sustituye <code>&lt;changed-files&gt;</code> por rutas explícitas. Revisa los cambios preparados y abre una propuesta hacia main con pruebas de validación.

~~~sh
git diff
git status
git add <changed-files>
git diff --cached
git commit -m "Describe the resulting behavior"
git push -u origin improve/your-change
~~~

## Código y archivos generados

El frontend está en public/. Los archivos cuánticos son main.py y sensor.py en la raíz. Los READMEs traducidos están en la raíz; las guías en docs/pt-BR/, docs/pt-PT/ y docs/es/. Las guías inglesas están directamente en docs/. No incluyas .venv/, cachés, credenciales ni dist/ generado en commits.

[Guía técnica](technical-guide.md) · [Centro de documentación](README.md)

This effort is supported by Qollab & IonQ
