# Ghost Route

[English](README.md) · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · **Español**

### Cuando el GPS miente, ¿cómo traes a la tripulación de vuelta?

**Una aventura de rescate en pixel art que convierte la detección cuántica en una decisión que puedes jugar.**

Aurora-1 regresa de la órbita. Tomas el timón del **SPOOFED**, con una tripulación que rescatar, aguas peligrosas por delante y señales de navegación que no siempre merecen confianza. Tu aliada es **Quoora**, la IA de a bordo que te ayuda a comparar el GPS con un sensor cuántico simulado. Elige el rumbo, cuestiona la señal y lleva a todos a casa.

**[Jugar Ghost Route](https://ghostroutegame.vercel.app/)** · [Aprender a jugar](docs/es/game-guide.md) · [Conocer el proyecto](docs/es/project-page.md) · [Guía técnica](docs/es/technical-guide.md)

![Ghost Route: el SPOOFED navega al atardecer con un mapa táctico, controles del sensor y una radio walkie-talkie.](docs/assets/ghost-route-gameplay.png)

*Captura real del juego. Ordenador y móvil comparten la misma campaña.*

## Cien misiones. Una pregunta: ¿en qué señal confías?

| Qué encontrarás | Por qué importa |
| --- | --- |
| **100 niveles con nombres, de 00 a 99** | Empieza con un tutorial de cuatro turnos y avanza hacia desafíos gradualmente más exigentes. |
| **Sensor cuántico simulado** | Compara pruebas, administra mediciones y descubre por qué una mayor sensibilidad de fase también trae ambigüedad. |
| **Pixel art de estilo 32 bits** | Puente de mando, mares al atardecer y 64 vistas del barco que mantienen el mástil vertical. |
| **Radio walkie-talkie** | Pulsa el icono para leer mensajes. Las novedades iluminan un aviso y las alertas dejan libre el timón. |
| **Sonidos originales** | Escucha mediciones, alertas, rescate y derrota; siléncialos desde el menú. |
| **Cuatro idiomas** | Inglés, portugués de Brasil, portugués de Portugal y español, incluidos tutoriales y repetición. |
| **Repetición y exportación de decisiones** | Revisa la ruta, las lecturas sospechosas y las elecciones del sensor al terminar la misión. |

## Tu primer rescate dura cuatro turnos

1. Abre el juego y elige el **nivel 00**.
2. Mantén el **rumbo 045°, noreste**, y sigue las cuatro etapas de Quoora.
3. Selecciona el sensor **Simple**, avanza, compara los instrumentos y alcanza Aurora-1.
4. Revisa el resultado y pasa al siguiente nivel.

Cada mecánica se presenta antes de usarla, incluso al elegir directamente un nivel avanzado. La curva aumenta las corrientes poco a poco, hace crecer formaciones de rocas conocidas y exige más cuidado con los recursos y la precisión del rescate. El nivel 99 tiene las corrientes más fuertes, el menor radio de rescate y el menor presupuesto de mediciones.

## Encuentra tu punto de partida

| Quieres… | Empieza aquí |
| --- | --- |
| **Jugar o descubrir ideas cuánticas sin ecuaciones** | [Guía del jugador](docs/es/game-guide.md) |
| **Evaluar el proyecto o comprender su aportación** | [Visión general](docs/es/project-page.md) y [guion de demostración](docs/es/demo-script.md) |
| **Explorar posibilidades educativas o de colaboración** | [Visión de producto y próximos pasos](docs/es/project-page.md#vision-de-producto) |
| **Desarrollar, reproducir resultados o contribuir** | [Guía técnica](docs/es/technical-guide.md) e [informe de verificación](docs/es/qa-report.md) |

## Ciencia cuántica explicada jugando

Piensa en el sensor como otra fuente de pistas. Muestrea un modelo de huellas magnéticas y combina las lecturas con el movimiento del barco para estimar posiciones posibles. El modo **GHZ** responde al triple de la fase, pero deja tres fases candidatas. Una respuesta más sensible no garantiza una posición única y correcta.

El navegador ejecuta una **simulación educativa**. Una implementación separada en Python usa **circuitos Qiskit**, y la entrada de Qollab demuestra ambos modos en un circuito de ocho cúbits. El prototipo no acredita rendimiento de navegación en el mundo real ni una ventaja cuántica demostrada. [Consulta el modelo y las formas de ejecución](docs/es/technical-guide.md).

## Juega localmente, sin compilar

Abre [public/index.html](public/index.html) en el navegador y conserva la carpeta de recursos a su lado. No necesitas instalar dependencias del frontend. Para usar un servidor local:

~~~sh
python -m http.server 8000 --directory public
~~~

Abre **http://localhost:8000**. El sonido empieza tras una interacción. El idioma predeterminado es **BR**; elige **IN** para inglés, **PT** para portugués de Portugal o **ES** para español. El progreso y las preferencias se guardan en el navegador actual cuando el almacenamiento está disponible.

## Hecho para jugar, investigar y ampliar

El proyecto reúne una campaña jugable, decisiones de detección explícitas y registros que se pueden inspeccionar. Las verificaciones del frontend cubren reglas, traducciones, estimación, renderizado y rutas seguras en la campaña. Las pruebas de ejecución en la plataforma y de inscripción se siguen por separado en la [lista de presentación](docs/es/submission-checklist.md).

**Creado por QuantGirls para el hackathon Qollab × IonQ.** Disponible bajo la [licencia MIT](LICENSE). Los pilotos educativos, una introducción más accesible y la evaluación comparativa son próximos pasos propuestos; aún no se han demostrado tracción comercial ni resultados de aprendizaje.

This effort is supported by Qollab & IonQ

<details>
<summary>Créditos y transparencia del desarrollo</summary>

Gemini Spark ayudó con la implementación inicial; OpenAI Codex ayudó con la interfaz, arte procedural, traducciones, QA, ajustes de campaña y documentación. Claude (Anthropic) ayudó con el tema del atardecer, efectos del mapa, sprite del barco y consola del puente. Las referencias visuales aportadas por la usuaria orientaron el arte. El equipo debe confirmar las fechas de las contribuciones y la declaración final del hackathon. [Centro de documentación](docs/es/README.md).

</details>

La física se basa en técnicas existentes de Ramsey/GHZ e investigación de navegación magnética. El mapa es sintético, el estimador es clásico y los circuitos reproducen estadísticas de una fase suministrada. [Fundamentos científicos y referencias externas](docs/es/scientific-basis.md).

[Aprendizaje del sensor y progresión de la campaña](docs/es/campaign-design.md)
