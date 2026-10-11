# Guía del jugador

[English](../game-guide.md) · [Português (Brasil)](../pt-BR/game-guide.md) · [Português (Portugal)](../pt-PT/game-guide.md) · **Español**

**Tu misión: alcanzar Aurora-1, evitar encallar y decidir qué lecturas GPS merecen sospecha.** No necesitas conocer física cuántica.

## Empieza por el nivel 00

Abre [el juego](../../public/index.html) o la [versión online](https://ghostroutegame.vercel.app/). Elige el nivel 00 y mantén el **rumbo 045° (NE)** durante cuatro movimientos. Quoora explica el timón, sensor Simple, comparación GPS y rescate. Lee cada introducción, confirma y realiza el siguiente movimiento.

## El ciclo de decisiones

1. **Elige el rumbo.** Usa la brújula o arrastra el selector. Norte es 0°, este es 90°.
2. **Haz una lectura.** Elige Apagado o Simple; GHZ está disponible desde el nivel 06. Selecciona cuántas mediciones gastar.
3. **Avanza.** El barco recorre una distancia fija para esa misión, con la incertidumbre de la corriente. Un turno representa 20 minutos ficticios.
4. **Compara.** El barco muestra la posición estimada; el cuadrado GPS es la posición comunicada. La densidad lila muestra posibilidades, no certeza.
5. **Marca.** Si la lectura mostrada parece sospechosa, márcala después de observarla. La casilla pertenece al turno completado, no al siguiente movimiento.

Planea todo el segmento: cruzar una roca o un arrecife encalla el barco aunque el destino esté libre. Alcanza la cápsula dentro del radio indicado antes de agotar el tiempo. El rescate termina la misión en cuanto llegas.

## Una campaña gradual

| Primer nivel | Nuevo desafío |
| --- | --- |
| 00 | Cuatro turnos seguros de tutorial, sin ataques ni ruido de corriente. |
| 01 | Un paso ancho en banco de arena y corrientes suaves. |
| 02 | Rocas en la aproximación al paso. |
| 03 | Salto del GPS y señal falsa de Aurora. |
| 06 | GHZ: mayor sensibilidad de fase con tres fases candidatas. |
| 10 | Dos pasos alternados, muros de arrecife, apagón en la reentrada y deriva del GPS. |
| 30 | GPS congelado: una lectura puede detenerse mientras avanzas. |
| 40 | Tres pasos alternados; las aberturas se estrechan gradualmente. |
| 60 | Orientación para ahorrar mediciones; la congelación puede durar más. |
| 99 | Menos recursos, menor radio de rescate y mayor ruido de corriente. |

La ruta cruza una puerta en los niveles 01–09, dos en 10–39 y tres en 40–99. La distancia por movimiento considera la ruta por los centros de los pasos. La ruta de referencia consume aproximadamente el 78% de la distancia disponible en el nivel 01 y el 92% en el 99, con aumento suave incluso al cambiar el número de puertas. Los principiantes tienen mayor margen de maniobra. La referencia no incluye todos los desvíos por rocas y no representa una ruta óptima ni dificultad medida con jugadores. Corrientes, pasos estrechos, menos mediciones y menor radio de rescate aumentan la presión posterior.

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
