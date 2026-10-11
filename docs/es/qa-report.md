# Informe de verificación

[English](../qa-report.md) · [Português (Brasil)](../pt-BR/qa-report.md) · [Português (Portugal)](../pt-PT/qa-report.md) · **Español**

## Revisión actual — 11 de octubre de 2026

Referencias científicas, declaración para el envío y criterios educativos distinguen fundamentos externos de la integración original. Estadística Ramsey/GHZ, localización clásica, mapa sintético y ejecución Qollab independiente están explícitos.

Corregidos: desplazamiento innecesario del menú inicial en portátiles/móviles comunes, acciones duplicadas de inicio, texto fuera del HUD en pantallas intermedias/bajas y botón principal que ignoraba un nivel recién elegido. Reiniciar/exportar están en **Ayuda y acciones**. Se conserva desplazamiento interno en pantallas pequeñas/horizontales y ayuda ampliada; no se descarta contenido para ocultar barras.

Validación: **108 pruebas Python pasaron** (Python 3.12, Qiskit 2.5.2); nueve suites frontend existentes pasaron, incluidas rutas viables de 100 niveles. La acción del nivel seleccionado tiene regresión del controlador. Chromium/Edge real cubre cuatro idiomas en las 16 pantallas siguientes, redimensionamiento, desplazamiento, controles dentro de marcos, radio separado del timón y ayuda ampliada. Se comprobó exportación de repetición en móvil pequeño. Enlaces y límites del paquete verificados; imágenes actualizadas desde juego real en inglés.

Pantallas verificadas: 1920×1080, 1440×900, 1366×768, 1280×720, 1200×640, 1024×768, 900×600, 899×700, 851×600, 768×1024, 390×844, 390×667, 360×640, 320×568, 844×390, 667×375.

Ejecutar `tests/browser-layout.cjs` opcional según la guía. No prueba accesibilidad exhaustiva, aprendizaje, todos los dispositivos/niveles de zoom, producción ni ejecución Qollab/IonQ. Enlaces de plataforma, backend, vídeo y envío formal dependen del equipo/cuenta.

## Verificación anterior — 10 de octubre de 2026

Revisión el 2026-10-10: frontend, giro del barco, walkie-talkie, campaña gradual y documentación en cuatro idiomas.

| Área verificada | Prueba |
| --- | --- |
| Reglas | Encallamiento, presupuesto, marcas de lecturas observadas, exportación JSON y rescate antiguo. |
| Estimador | Transporte fraccionario, conservación de la probabilidad en los límites y regiones de credibilidad. |
| Traducciones e interfaz | Cuatro catálogos, variables, enlaces HTML, rescate del tutorial, progreso guardado, repetición y reinicio. |
| Campaña | Las 100 configuraciones admiten rescate seguro con movimientos fijos, rumbos enteros y corrientes con semillas definidas. |
| Barco | 64 perspectivas distintas, límites íntegros, mástil vertical, cambios rápidos de rumbo, paso por el norte y estabilización. |
| Mapa y experiencia | Cinco configuraciones de proyección; nombres, introducciones, sonidos sintetizados, silencio y audio no disponible. |

El navegador se probó con giro continuo y apertura/cierre de radio en 1440×900, 1366×768, 1024×768, 900×600, 844×390, 390×844, 390×667 y 768×1024, en los cuatro idiomas. Se incluyeron encallamiento y ambas alertas; la radio no cubrió los controles y no se registraron errores de ejecución.

La documentación se verificó en enlaces relativos, idiomas, rutas y contenido de paquetes. Las imágenes del README son capturas reales en inglés.

## Límites de las pruebas

Las rutas posibles no miden dificultad percibida. Las formaciones estables, el crecimiento gradual y las restricciones monotónicas necesitan partidas con jugadores para afinarse. Generar audio no certifica calidad subjetiva; probar teclado no certifica accesibilidad.

El backend Python no se modificó ni se volvió a probar en esta etapa. Los documentos anteriores registraban 105 pruebas Python; ese dato histórico no es un resultado nuevo. Publicación online y ejecución Qollab/IonQ necesitan pruebas propias.

[Guía técnica](technical-guide.md) · [Centro de documentación](README.md)

This effort is supported by Qollab & IonQ
