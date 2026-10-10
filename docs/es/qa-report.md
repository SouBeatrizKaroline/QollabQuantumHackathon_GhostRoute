# Informe de verificación

[English](../qa-report.md) · [Português (Brasil)](../pt-BR/qa-report.md) · [Português (Portugal)](../pt-PT/qa-report.md) · **Español**

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
