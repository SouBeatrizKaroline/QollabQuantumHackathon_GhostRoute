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
| 01 | Rocas y corrientes suaves, presentadas antes de usarlas. |
| 03 | Salto del GPS: desplazamiento falso repentino. |
| 06 | GHZ: mayor sensibilidad de fase con tres fases candidatas. |
| 10 | Arrecife central, coordenadas ocultas en la reentrada y deriva gradual GPS. |
| 30 | GPS congelado: una lectura puede detenerse mientras avanzas. |
| 60 | Orientación para ahorrar mediciones; la congelación puede durar más. |
| 99 | Menos recursos, menor radio de rescate y mayor ruido de corriente. |

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
