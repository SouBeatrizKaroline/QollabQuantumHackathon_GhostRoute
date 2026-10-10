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
