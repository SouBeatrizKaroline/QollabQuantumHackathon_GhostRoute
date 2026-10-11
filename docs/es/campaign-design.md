# Aprendizaje del sensor y progresión de la campaña

[English](../game-guide.md) · [Português (Brasil)](../pt-BR/game-guide.md) · [Português (Portugal)](../pt-PT/game-guide.md) · **Español**

El objetivo educativo sigue siendo comprender el sensor: incertidumbre de muestreo, relación entre firma magnética y fase, ambigüedad, combinación de lectura y movimiento, y comparación con GPS. La radio en fases tranquilas invita a variar mediciones; el terreno posterior da sentido a esas decisiones. Los obstáculos aplican lo aprendido. El navegador sigue siendo una simulación estadística educativa, sin magnetómetro físico ni ventaja cuántica demostrada.

| Primer nivel | Qué cambia y qué practicar |
| --- | --- |
| 00 | Cuatro turnos guiados: rumbo, lectura Simple, comparación GPS y rescate. |
| 01–04 | Práctica de las mismas habilidades en mar tranquilo, sin obstáculos, corrientes, ataques ni tarjetas de mecánicas nuevas. |
| 05 | Corrientes muy suaves: medir después de avanzar y corregir el rumbo. |
| 10 | Una roca pequeña: planear una curva suave en mar abierto. |
| 25 | Primer paso ancho en banco de arena, en misiones con puertas. |
| 35 | Un salto corto del GPS: comparar la lectura con el sensor. |
| 45 | GHZ opcional: mayor sensibilidad de fase con ambigüedad; Simple sigue disponible. |
| 55 | Arrecife y segunda abertura en misiones con puertas. |
| 65 | Apagón en la reentrada: usar la elipse prevista hasta que vuelva la señal. |
| 70 | Señal falsa de Aurora: usar evidencia independiente de posición. |
| 75 | Deriva del GPS: comparar lecturas sucesivas. |
| 85 | Tercera abertura alternada en misiones con puertas. |
| 90 | Congelación del GPS: observar si la posición sigue al barco. |
| 95 | Orientación de presupuesto antes de los retos finales combinados. |
| 99 | Mayor presión conjunta: tres pasos estrechos, ocho rocas, tres tipos de ataque y precisión exigente de rescate. |

Los niveles 01–04 refuerzan el uso del sensor enseñado en el tutorial 00. Las mecánicas entran una por una, con al menos cinco niveles entre introducciones. El destino se desplaza suavemente; la incertidumbre de corriente crece, el presupuesto baja y la precisión de rescate aumenta gradualmente. La demanda de distancia de la ruta de referencia crece del 70% en el nivel 01 al 92% en el 99. La referencia usa los centros de los pasos, excluye desvíos por rocas y no mide éxito ni garantiza que cada jugador perciba todos los niveles adyacentes como más difíciles.

Las misiones con pasos empiezan en el 25. Los niveles terminados en 5–9 usan puertas; los terminados en 0–4 tienen mar abierto. Una, dos y tres puertas aparecen en 25, 55 y 85. Cada abertura nueva empieza ancha. Las existentes se estrechan y desplazan gradualmente, sin invertir de lado en cada nivel. Las rocas pequeñas pueden exigir curvas sin muros. La misión final combina los retos presentados; las variantes de mar abierto conservan la presión de corriente, sensor, ataques y precisión.

Evidencia nueva: 112 pruebas Python, nueve suites del frontend, búsqueda de rutas con semilla en los 100 niveles y exportaciones reales del controlador validadas en Python. Las pruebas exigen primeras fases tranquilas, una mecánica nueva por vez, espacio entre introducciones, cambios limitados de recursos y configuración final combinada. El navegador cubre cuatro idiomas, 21 tamaños, tutorial de cuatro turnos, fases tranquilas 01–04 y las 12 explicaciones. La observación humana sigue siendo necesaria para comprensión, frustración y dificultad percibida.

[Ramsey / GHZ](scientific-basis.md) · [QA](qa-report.md)

![Nivel 01 tranquilo: practicar el sensor sin obstáculos.](../assets/ghost-route-level01.png)

![Misión en mar abierto: rocas y corrientes pueden exigir curvas sin muros.](../assets/ghost-route-open-water.png)

## Nombres de los niveles de campaña

Cada título refleja la ruta y el aprendizaje de esa etapa. El nombre no añade una mecánica ni promete una posición exacta.

| Nivel | Título |
| --- | --- |
| 00 | Primer viaje |
| 01 | Aguas tranquilas |
| 02 | Rumbo a Aurora |
| 03 | Leer el mar |
| 04 | Confianza en el rumbo |
| 05 | Primera corriente |
| 06 | Corregir el rumbo |
| 07 | Medir y ajustar |
| 08 | Seguir la corriente |
| 09 | Equilibrio en el mar |
| 10 | Primer desvío |
| 11 | Rodear la roca |
| 12 | Curva suave |
| 13 | Espacio para maniobrar |
| 14 | Ruta entre rocas |
| 15 | Mirar adelante |
| 16 | Maniobra cuidadosa |
| 17 | Leer antes de girar |
| 18 | Trazar una curva |
| 19 | Rumbo bajo control |
| 20 | Mar abierto, ruta libre |
| 21 | Elegir el desvío |
| 22 | Curvas y lecturas |
| 23 | Preparar la maniobra |
| 24 | Camino seguro |
| 25 | Primer paso |
| 26 | Entre bancos de arena |
| 27 | Encontrar la abertura |
| 28 | Curva en el paso |
| 29 | Más allá del banco |
| 30 | Vuelta al mar abierto |
| 31 | Lecturas en movimiento |
| 32 | Desvío planeado |
| 33 | Ruta y estimación |
| 34 | Preparar la travesía |
| 35 | Primera señal falsa |
| 36 | Paso bajo sospecha |
| 37 | Revisar los instrumentos |
| 38 | Curva con evidencias |
| 39 | Más allá del GPS |
| 40 | Señales en mar abierto |
| 41 | Comparar para navegar |
| 42 | Rumbo con incertidumbre |
| 43 | Desvío de la señal falsa |
| 44 | Lecturas independientes |
| 45 | Conocer GHZ |
| 46 | Sensibilidad en el paso |
| 47 | Fases y caminos |
| 48 | Resolver la ambigüedad |
| 49 | Comparar modos |
| 50 | GHZ en mar abierto |
| 51 | Historial y lectura |
| 52 | Elegir la evidencia |
| 53 | Sensibilidad con cuidado |
| 54 | Preparar dos curvas |
| 55 | Segundo paso |
| 56 | Arena y arrecife |
| 57 | Aberturas alternadas |
| 58 | Una curva a la vez |
| 59 | Travesía del arrecife |
| 60 | Horizonte abierto |
| 61 | Rocas y evidencias |
| 62 | Rumbo bien estimado |
| 63 | Maniobra entre señales |
| 64 | Lectura para el rescate |
| 65 | Silencio en la reentrada |
| 66 | Rumbo a la elipse |
| 67 | Esperar la señal |
| 68 | Travesía sin contacto |
| 69 | Reencontrar Aurora |
| 70 | Primera Aurora fantasma |
| 71 | Dos señales en el horizonte |
| 72 | Buscar la Aurora real |
| 73 | Evidencias para el rescate |
| 74 | Ecos y rocas |
| 75 | Primera deriva falsa |
| 76 | Error que se acumula |
| 77 | Corregir entre pasos |
| 78 | Rastrear el desvío |
| 79 | Curvas bajo engaño |
| 80 | Ecos en mar abierto |
| 81 | Revisar la trayectoria |
| 82 | Estimar bajo presión |
| 83 | Separar las señales |
| 84 | Preparar el eslalon |
| 85 | Tercer paso |
| 86 | Tres curvas en el mar |
| 87 | Eslalon entre señales |
| 88 | Alternar con precisión |
| 89 | Travesía en tres etapas |
| 90 | Primer GPS congelado |
| 91 | Barco en movimiento |
| 92 | Detectar la posición inmóvil |
| 93 | Lecturas bajo engaño |
| 94 | Último mar abierto |
| 95 | Cada medición cuenta |
| 96 | Precisión en los pasos |
| 97 | Últimas curvas |
| 98 | Rescate bajo presión |
| 99 | Ruta fantasma final |
