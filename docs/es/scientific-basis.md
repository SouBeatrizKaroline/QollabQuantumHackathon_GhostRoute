# Base científica, referencias externas y simplificaciones

[English](../scientific-basis.md) · [Português (Brasil)](../pt-BR/scientific-basis.md) · [Português (Portugal)](../pt-PT/scientific-basis.md) · **Español**

Ghost Route se basa en técnicas reales de sensado y navegación cuántica, en una versión educativa y simplificada. El equipo las investigó a partir de la noticia de Q-CTRL. Su contribución es integrarlas en un juego de rescate; no reivindica la invención de Ramsey, los estados GHZ ni la localización bayesiana.

## Relación entre fuentes e implementación

| Fundamento | Fuente | Implementación y alcance |
| --- | --- | --- |
| Interferencia de Ramsey | [1] | `sensor.py` prepara superposición, codifica una fase suministrada con RZ y mide X/Y. |
| Respuesta de fase GHZ | [2–4] | Tres qubits entrelazados acumulan 3φ; la decodificación conserva tres fases candidatas. Mayor sensibilidad local no garantiza una posición única ni mejor precisión práctica. |
| Navegación por mapa magnético sin GPS | [5] y estudio Q-CTRL | Inspiración para comparar evidencias independientes. Los ensayos publicados usan vehículos terrestres/aéreos; el escenario marítimo es una adaptación educativa. |
| Localización bayesiana en cuadrícula | [6] | `BayesianGridEstimator`, en `engine.js`, predice movimiento y actualiza probabilidades por la verosimilitud de las mediciones. El estimador es clásico. |

## Simplificaciones del prototipo

- `calcB` suma cuatro anomalías gaussianas sintéticas a una base; no es un mapa real del fondo marino. `calcPhi` usa φ = κB con una constante del juego, sin calibración física.
- X: P(1) = sen²(nφ/2); Y: P(1) = (1 − sen(nφ))/2. Son probabilidades ideales de la preparación y lectura implementadas. X/Y estiman nφ módulo 2π; GHZ n=3 deja tres **fases**, no necesariamente tres posiciones geográficas.
- El navegador genera muestras binomiales. Qiskit local y la entrada Qollab reproducen estadísticas de una fase suministrada; no miden el campo terrestre. Ejecutar Qollab en simulador o QPU requiere evidencia propia. El juego no tiene sensor físico ni conexión activa con IonQ.
- Existen fluctuaciones de muestreo y ruido de movimiento modelado. No se modelan decoherencia, errores de puertas/lectura, interferencia magnética ni calibración. Un backend real con ruido puede afectar los circuitos.
- La región creíble del 95% evalúa coherencia GPS **bajo el modelo**; no garantiza un 95% de detección ni seguridad. Los resultados de Q-CTRL no son resultados del juego.

## Trabajo original y atribución externa

Campaña, narrativa, controles, presentación visual e integración de decisiones del sensor con la repetición son la contribución del proyecto. Los principios científicos tienen fuentes externas. La cita no implica asociación con Q-CTRL, acceso a algoritmos propietarios ni uso de su hardware/software. Conservar los créditos de herramientas, IA y referencias visuales del README y confirmar la cronología de contribuciones antes del envío.


## Bibliografía

1. **Ramsey, N. F. (1950).** *A Molecular Beam Resonance Method with Separated Oscillating Fields*. Physical Review 78, 695–699. [DOI: 10.1103/PhysRev.78.695](https://doi.org/10.1103/PhysRev.78.695).
2. **Greenberger, D. M.; Horne, M. A.; Zeilinger, A. (1989).** *Going Beyond Bell's Theorem*, in *Bell's Theorem, Quantum Theory and Conceptions of the Universe*, pp. 69–72. [Reimpresión depositada por los autores, arXiv:0712.0921](https://arxiv.org/abs/0712.0921) (subida en 2007; capítulo original: 1989).
3. **Bollinger, J. J.; Itano, W. M.; Wineland, D. J.; Heinzen, D. J. (1996).** *Optimal frequency measurements with maximally correlated states*. Physical Review A 54, R4649. [DOI: 10.1103/PhysRevA.54.R4649](https://doi.org/10.1103/PhysRevA.54.R4649).
4. **Meyer, V. et al. (2001).** *Experimental Demonstration of Entanglement-Enhanced Rotation Angle Estimation Using Trapped Ions*. Physical Review Letters 86, 5870–5873. [DOI: 10.1103/PhysRevLett.86.5870](https://doi.org/10.1103/PhysRevLett.86.5870).
5. **Muradoglu, M. et al. (2025).** *Quantum-assured magnetic navigation achieves positioning accuracy better than a strategic-grade INS in airborne and ground-based field trials*. [arXiv:2504.08167v1, 10 April 2025](https://arxiv.org/abs/2504.08167v1). Preprint de investigación primaria; identifica los ensayos de campo.
6. **Fox, D.; Burgard, W.; Thrun, S. (1998).** *Markov Localization for Reliable Robot Navigation and People Detection*. [Institución de los autores, Carnegie Mellon University](https://publications.ri.cmu.edu/markov-localization-for-reliable-robot-navigation-and-people-detection). Referencia de localización probabilística clásica.

### Fuentes de investigación aportadas por el equipo

- **Q-CTRL.** [Delivering quantum advantage to airborne systems](https://q-ctrl.com/case-study/q-ctrl-delivering-quantum-advantage-to-airborne-systems). Estudio de la empresa; inspiración, no validación de Ghost Route.
- **Swayne, M. (14 April 2025), The Quantum Insider.** [Q-CTRL Overcomes GPS-denial With Quantum Sensing, Reports Quantum Advantage](https://thequantuminsider.com/2025/04/14/q-ctrl-overcomes-gps-denial-with-quantum-sensing-reports-quantum-advantage/). Cobertura periodística secundaria/comunicado de prensa.
- **InnovationAus.** [Q-CTRL claims 'quantum advantage' with GPS-free navigation](https://innovationaus.com/?p=66343). Enlace aportado por el equipo; inaccesible durante la revisión, no utilizado para respaldar afirmaciones técnicas.

Referencias verificadas el 11 de octubre de 2026, salvo las marcadas inaccesibles. Títulos en el idioma original.

This effort is supported by Qollab & IonQ
