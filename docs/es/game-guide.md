# Guía del jugador

[English](../game-guide.md) · [Português (Brasil)](../pt-BR/game-guide.md) · [Português (Portugal)](../pt-PT/game-guide.md) · **Español**

**Tu misión: alcanzar Aurora-1, evitar encallar y decidir qué lecturas GPS merecen sospecha.** No necesitas conocer física cuántica.

## Empieza por el nivel 00

Abre [el juego](../../public/index.html) o la [versión online](https://ghostroutegame.vercel.app/). Elige el nivel 00 y mantén el **rumbo 045° (NE)** durante cuatro movimientos. Quoora explica el timón, sensor Simple, comparación GPS y rescate. Lee cada introducción, confirma y realiza el siguiente movimiento.

## El ciclo de decisiones

1. **Elige el rumbo.** Usa la brújula o arrastra el selector. Norte es 0°, este es 90°.
2. **Haz una lectura.** Elige Apagado o Simple; GHZ está disponible desde el nivel 45. Selecciona cuántas mediciones gastar.
3. **Avanza.** El barco recorre una distancia fija para esa misión, con la incertidumbre de la corriente. Un turno representa 20 minutos ficticios.
4. **Compara.** El barco muestra la posición estimada; el cuadrado GPS es la posición comunicada. La densidad lila muestra posibilidades, no certeza.
5. **Marca.** Si la lectura mostrada parece sospechosa, márcala después de observarla. La casilla pertenece al turno completado, no al siguiente movimiento.

Planea todo el segmento: cruzar una roca o un arrecife encalla el barco aunque el destino esté libre. Alcanza la cápsula dentro del radio indicado antes de agotar el tiempo. El rescate termina la misión en cuanto llegas.

## Una campaña gradual

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

El terreno se explica al salir. Salto del GPS, apagón, deriva y congelación se presentan antes del primer movimiento afectado. Aurora fantasma se explica cuando aparece por primera vez; un ataque durante el apagón puede no mostrarla. El juego se pausa hasta confirmar la tarjeta. Las mecánicas confirmadas se guardan; saltar a un nivel avanzado enseña las desconocidas en el momento adecuado. La fantasma es un engaño visual del GPS, no una segunda cápsula física. Acercarse a ella no rescata Aurora-1; ganar exige alcanzar la cápsula real dentro del radio configurado.

Las formaciones de rocas crecen gradualmente en lugar de cambiar al azar en cada nivel. Las rocas nuevas empiezan pequeñas. El menú muestra turnos, presupuesto, radio de rescate e índice de dificultad; este índice describe el diseño, no una tasa de éxito medida. Puedes elegir cualquier nivel, con introducciones para mecánicas desconocidas.

## Radio, sonido y controles

Pulsa el **icono de walkie-talkie** para abrir o cerrar mensajes. Un brillo y el aviso ! indican un mensaje sin leer. La radio abre sin cubrir alertas ni timón. Usa **Menú → Sonido** para activar o silenciar. El audio empieza tras una interacción.

Con el mapa enfocado: **Enter / Espacio** avanza; **Izquierda / Derecha** cambia el rumbo en 5°; **R** reinicia; **D** muestra la posición real con una identificación de depuración; **Esc** abre el menú. Los campos conservan su comportamiento normal con el teclado. La pantalla completa depende del navegador.

Idiomas: **IN** inglés, **BR** portugués de Brasil (predeterminado), **PT** portugués de Portugal, **ES** español. Las preferencias y niveles completados pertenecen a este navegador y dirección. Las restricciones de almacenamiento no impiden jugar, pero pueden impedir guardar.

![Interfaz de Ghost Route en móvil, con radio walkie-talkie.](../assets/ghost-route-mobile.png)

## Aprende del resultado

Un rescate seguro completa el nivel. El rescate perfecto también requiere marcar al menos una lectura observada de cada ataque presente; los falsos avisos se muestran por separado. La repetición muestra rutas real, GPS e inercial, momentos de ataque y recuentos de mediciones. Los mapas de probabilidad por turno no aparecen en la repetición histórica porque esas imágenes no se guardan. La exportación guarda las decisiones en JSON para inspección y repetición de circuitos en Python.

Más mediciones reducen el ruido del muestreo y consumen presupuesto. Puedes seguir navegando sin mediciones. La alerta de coherencia indica desacuerdo con la estimación, no detección garantizada de un ataque. [Comprende el modelo](technical-guide.md).

Ayuda y acciones en el menú incluye guía de navegación, reinicio y exportación de decisiones. En móvil vertical, el botón principal inicia el nivel recién elegido; en los demás casos continúa la misión o abre su repetición.

[Aprendizaje del sensor y progresión de la campaña](campaign-design.md)
