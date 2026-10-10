# Guía técnica

[English](../technical-guide.md) · [Português (Brasil)](../pt-BR/technical-guide.md) · [Português (Portugal)](../pt-PT/technical-guide.md) · **Español**

**Reproduce el modelo, ejecuta las verificaciones y distingue la simulación del navegador de la ejecución de circuitos.** Ejecuta los comandos desde la raíz del repositorio.

## Tres formas de ejecución

| Camino | Qué ejecuta | Qué prueba aporta |
| --- | --- | --- |
| Navegador | HTML/CSS/Canvas y muestreo JavaScript de probabilidades analíticas de Born. | Misiones jugables y decisiones exportadas, sin Qiskit ni trabajos de hardware. |
| Python local | [sensor.py](../../sensor.py) y simulación Qiskit; repetición opcional de circuitos JSON. | Comparación entre circuito y modelo en el backend local utilizado. |
| Qollab | [main.py](../../main.py) con el backend proporcionado por la plataforma. | Solo una ejecución real acredita que el proyecto se ejecutó allí. |

## Modelo del sensor

Un campo magnético simplificado relaciona la posición con la fase φ. Las mediciones X e Y usan:

~~~text
P_X(1 | φ, n) = (1 − cos(nφ)) / 2
P_Y(1 | φ, n) = (1 − sin(nφ)) / 2
~~~

Simple usa n=1; GHZ usa n=3 y tres cúbits entrelazados. La respuesta al triple de la fase también crea tres fases candidatas. Una lectura escalar no identifica por sí sola una posición bidimensional única. La cuadrícula bayesiana combina su verosimilitud con el movimiento previsto. La región de credibilidad del 95% prueba coherencia, no la probabilidad de que el GPS sea honesto.

![Figura de las franjas de Ramsey generada a partir del modelo.](../assets/ramsey-fringes.png)

## Navegador y verificaciones del frontend

Abre [public/index.html](../../public/index.html) o sirve public con <code>python -m http.server 8000 --directory public</code>. No hace falta compilar ni instalar paquetes del frontend. Usa Node.js:

~~~sh
node tests/game-core.cjs
node tests/estimator.cjs
node --test tests/localization.cjs
node tests/ui-state.cjs
node tests/campaign.cjs
node tests/ship-rendering.cjs
node tests/map-layout.cjs
node tests/experience.cjs
node tests/progression.cjs
~~~

La búsqueda de rutas verifica segmentos completos, distancias fijas, rumbos enteros y corrientes con semillas definidas. No mide la dificultad percibida ni los resultados de aprendizaje.

## Preparación de Python local

Usa Python 3.10 o posterior y [requirements.txt](../../requirements.txt). Qiskit está limitado a >=2.5.2 y <3; las versiones de las demás dependencias no están fijadas.

~~~sh
python -m venv .venv
~~~

**Windows:** <code>.venv\Scripts\activate</code>  
**macOS / Linux:** <code>source .venv/bin/activate</code>

~~~sh
python -m pip install -r requirements.txt
python sensor.py
python -m pytest tests -q
python scripts/plot_fringes.py
~~~

En Windows, [setup_and_test.bat](../../scripts/setup_and_test.bat) ofrece el flujo de preparación. El script de franjas regenera la ilustración anterior.

## Exportación y repetición

La exportación conserva posiciones, fases, órdenes, mediciones y configuración de campaña. La repetición Python valida el mundo registrado y toma **nuevas muestras** en las fases guardadas. Python y JavaScript usan generadores aleatorios distintos; semillas iguales no garantizan recuentos iguales.

~~~sh
python scripts/replay_session.py examples/session-seed-20261011.json
python scripts/replay_session.py examples/session-level-00.json --validate-only
python scripts/replay_session.py examples/session-level-00.json --output dist/replay-report.json
python scripts/package_qollab.py
~~~

Se admiten exportaciones antiguas 1.0.0 y de campaña 1.1.0. El ejemplo antiguo conserva la misión original de doce turnos, no la configuración actual de todos los niveles. <code>--validate-only</code> no envía trabajos de circuitos. La repetición real agrupa los circuitos en una llamada sampler.run. Esta repetición de varios circuitos es distinta de la entrada de Qollab.

## Entrada de Qollab y paquete

<code>main.py</code> reúne lecturas X/Y Simple/GHZ en **un circuito de ocho cúbits y una llamada backend.run**. Depende del backend proporcionado, no selecciona uno al importar ni llama a main manualmente. Genera el paquete, conserva su raíz y sigue el flujo actual de la plataforma. La salida queda en <code>dist/qollab/</code> y <code>dist/ghost-route-qollab.zip</code>, ignorados por Git. Confirma la ejecución y los enlaces públicos en la [lista de presentación](submission-checklist.md).

## Alojamiento estático y mapa del código

En Vercel, [vercel.json](../../vercel.json) sirve **public/**: framework Other, sin orden de compilación, raíz del repositorio. El sensor Python necesita un entorno propio.

| Archivo | Responsabilidad |
| --- | --- |
| public/assets/js/engine.js | Física, configuración de niveles, estimación y 64 perspectivas del barco. |
| public/assets/js/app.js | Controles, repetición, traducciones y posición de la radio. |
| public/assets/js/i18n.js | Cuatro catálogos completos de la interfaz. |
| public/assets/js/onboarding.js | Nombres de niveles e introducciones. |
| public/assets/js/audio.js | Sonidos sintetizados y comportamiento de silencio. |
| public/assets/css/game.css | Puente adaptable y presentación del walkie-talkie. |
| main.py / sensor.py | Entrada de Qollab y modelo cuántico reutilizable. |
| scripts/ / tests/ | Repetición, empaquetado y verificación. |

Consulta el alcance de las pruebas en el [informe](qa-report.md). “32 bits” indica el estilo visual, no la arquitectura de un ejecutable Windows.
