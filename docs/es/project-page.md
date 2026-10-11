# Visión general — para jurados, educadores y colaboradores

[English](../project-page.md) · [Português (Brasil)](../pt-BR/project-page.md) · [Português (Portugal)](../pt-PT/project-page.md) · **Español**

**Ghost Route convierte la incertidumbre en una experiencia jugable.** La historia de rescate ofrece una razón concreta para comparar señales de navegación, administrar un sensor cuántico simulado y aprender de las consecuencias.

## La experiencia

El jugador conduce el SPOOFED hasta la cápsula Aurora-1 mientras lecturas GPS falsas y obstáculos desafían la ruta. Quoora explica cada nueva mecánica. Cien misiones con nombres van de un tutorial seguro a corrientes más fuertes, pasos más restringidos y mayor precisión de rescate. Cuatro idiomas, sonidos originales y pixel art adaptable amplían el acceso.

El ciclo central es **elegir rumbo → medir → comparar → decidir → revisar**. La repetición revela ataques ocultos y exporta decisiones para investigarlas.

## Cuál es la aportación cuántica

La interferencia de Ramsey determina las probabilidades de medición X/Y. El GHZ de tres cúbits cambia la respuesta a 3φ y deja tres fases candidatas. Una cuadrícula bayesiana combina mediciones y movimiento; la coherencia GPS se compara con una región de credibilidad del 95%. La elección del sensor influye en las decisiones del jugador, en lugar de ser solo decoración.

El navegador muestrea el modelo analíticamente. Un código Qiskit separado permite evaluar circuitos, y la entrada de Qollab reúne X/Y Simple/GHZ en un trabajo de ocho cúbits. La ejecución en la plataforma necesita pruebas propias. [Detalles técnicos](technical-guide.md).

## Pruebas para consultar

| Afirmación | Dónde verificar |
| --- | --- |
| Campaña jugable e introducciones | [Guía del jugador](game-guide.md), public/ |
| Modelo cuántico y circuitos | sensor.py, main.py, [guía técnica](technical-guide.md) |
| Decisiones reproducibles | Exportación JSON y scripts/replay_session.py |
| Alcance verificado y limitaciones | [Informe](qa-report.md) |
| Materiales y pruebas de presentación | [Lista de verificación](submission-checklist.md) |

<a id="vision-de-producto"></a>

## Visión de producto

El siguiente paso más útil es un **piloto educativo**: verificar si, después de jugar, las personas explican la ambigüedad, reconocen lecturas poco fiables y utilizan mejor el presupuesto de mediciones.

Las posibles extensiones incluyen planes de clase, escenarios configurables y comparación con estrategias clásicas de navegación. Son propuestas futuras, no funciones entregadas. Un producto para formación marítima operativa necesitaría validación específica y especialistas del sector.

Las conversaciones sobre colaboración o inversión deben partir del prototipo y de un plan de piloto medible. Este repositorio no afirma tener ingresos, usuarios, demanda de mercado validada ni mejoras de aprendizaje demostradas.

## Una secuencia útil de evaluación

Juega el nivel 00, abre una misión avanzada, compara Simple/GHZ, inspecciona una exportación de decisiones y lee los circuitos. Usa el [guion](demo-script.md) para una presentación breve.

QuantGirls · [Licencia MIT](../../LICENSE) · [Créditos](../../README.es.md)

This effort is supported by Qollab & IonQ

## Origen científico y declaración para el envío

El sensor es un modelo educativo de técnicas establecidas de Ramsey/GHZ, inspirado en investigación de navegación magnética. El escenario marítimo y el mapa sintético adaptan esas ideas al juego. La cuadrícula bayesiana es clásica; navegador y circuitos no miden un campo magnético real. [Base científica, relación con el código y bibliografía completa](scientific-basis.md).

Para el hackathon, la contribución original es la integración jugable y la elección entre sensores, sin reivindicar física nueva ni una reproducción de Ironstone Opal. Trabajo externo y asistencia de IA se declaran por separado. Mantener referencias en la página publicada y el paquete.

## Resumen para adaptar al envío

**Ghost Route — QuantGirls · tema previsto: Quantum Playground.** Juego de rescate en pixel art y cuatro idiomas sobre decidir en qué evidencias confiar cuando el GPS miente. El jugador elige rumbo, administra mediciones simuladas, compara la ambigüedad Simple/GHZ e inspecciona decisiones en la repetición. El navegador ejecuta un modelo educativo analítico; una entrada Qiskit separada demuestra X/Y Simple/GHZ en un circuito de ocho qubits y un trabajo de backend.

- Jugar: https://ghostroutegame.vercel.app/
- Código: https://github.com/SouBeatrizKaroline/QollabQuantumHackathon_GhostRoute
- Referencias: [bibliografía completa](scientific-basis.md).
- URL del proyecto Qollab, backend/evidencia de ejecución y vídeo: **pendientes de confirmación del equipo**; completar con enlaces reales antes del envío.

## Criterios de aceptación del piloto educativo

Piloto propuesto: observar si nuevos jugadores completan el nivel 00 sin ayuda, explican la ambigüedad GHZ y comparan lecturas inciertas antes de actuar. Recoger finalización, solicitudes de ayuda y comprensión antes/después; todavía no son resultados medidos. La interfaz debe tener menú sin desplazamiento innecesario en pantallas admitidas, idiomas legibles, controles sin superposición y acceso a ayuda/repetición cuando haga falta desplazarse.

## Campaña, equilibrio e introducciones actualizados — 11 de octubre de 2026

La ruta cruza una puerta en los niveles 01–09, dos en 10–39 y tres en 40–99. La distancia por movimiento considera la ruta por los centros de los pasos. La ruta de referencia consume aproximadamente el 78% de la distancia disponible en el nivel 01 y el 92% en el 99, con aumento suave incluso al cambiar el número de puertas. Los principiantes tienen mayor margen de maniobra. La referencia no incluye todos los desvíos por rocas y no representa una ruta óptima ni dificultad medida con jugadores. Corrientes, pasos estrechos, menos mediciones y menor radio de rescate aumentan la presión posterior.

El terreno se explica al salir. Salto del GPS, apagón, deriva y congelación se presentan antes del primer movimiento afectado. Aurora fantasma se explica cuando aparece por primera vez; un ataque durante el apagón puede no mostrarla. El juego se pausa hasta confirmar la tarjeta. Las mecánicas confirmadas se guardan; saltar a un nivel avanzado enseña las desconocidas en el momento adecuado. La fantasma es un engaño visual del GPS, no una segunda cápsula física. Acercarse a ella no rescata Aurora-1; ganar exige alcanzar la cápsula real dentro del radio configurado.

La radio queda separada del radar GPS, brújula, telemetría y timón. Abrir o cerrar conserva la posición del mapa y los controles. En móviles pequeños se abre temporalmente sobre el mar; los mensajes largos se desplazan dentro de la radio, y cerrarla libera el mapa.
