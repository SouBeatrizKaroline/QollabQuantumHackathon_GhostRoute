# Verification report

**English** · [Português (Brasil)](pt-BR/qa-report.md) · [Português (Portugal)](pt-PT/qa-report.md) · [Español](es/qa-report.md)

## Current review — 11 October 2026

The scientific references, submission disclosure and educational product criteria now distinguish external foundations from original game integration. Ramsey/GHZ statistics, classical localization, synthetic mapping and independent Qollab execution are explicit.

Fixed: unnecessary initial-menu scrolling on common laptop/phone sizes, duplicate mobile start actions, mission text outside the HUD at intermediate/short sizes, and a primary menu action that previously ignored a newly selected level. Restart/export now sit under **Help and actions**. Scrolling remains available inside menus on very small/landscape screens and when help is expanded; hiding overflow is not used to discard menu content.

Validation: **108 Python tests passed** (Python 3.12, Qiskit 2.5.2); all nine existing frontend suites passed, including campaign route feasibility for 100 levels. The selected-level action has a controller regression. Real Chromium/Edge checks cover four languages at the 16 sizes below, live resizing, menu overflow, controls within their frames, radio/helm separation and expanded help. Small-phone replay export was also exercised. Documentation links and generated-package limits were checked. Screenshots were refreshed from actual English gameplay.

Browser matrix: 1920×1080, 1440×900, 1366×768, 1280×720, 1200×640, 1024×768, 900×600, 899×700, 851×600, 768×1024, 390×844, 390×667, 360×640, 320×568, 844×390, 667×375.

Run the optional `tests/browser-layout.cjs` as described in the technical guide. These checks do not establish exhaustive accessibility compliance, learning outcomes, every device/zoom setting, production deployment or Qollab/IonQ execution. Live platform links, backend evidence, video and formal submission remain team/account actions.

## Earlier verification — 10 October 2026

Reviewed on 2026-10-10: frontend, ship turning, walkie-talkie, gradual campaign and four-language documentation.

| Verified area | Evidence |
| --- | --- |
| Mission rules | Grounding, budget handling, observed suspicion marks, JSON export and archived rescue. |
| Estimator | Fractional transport, probability conservation at boundaries and credible regions. |
| Localization and UI | Four catalogs, placeholders, HTML bindings, tutorial rescue, progress saving, replay and restart. |
| Campaign | All 100 configurations admit safe rescue with fixed-length moves, integer headings and seeded current noise. |
| Ship | 64 distinct perspectives, intact bounds, upright mast, rapid retargeting, north crossings and settling. |
| Map and experience | Five projection fixtures; names, introductions, synthesized effects, mute and unavailable audio. |

Browser checks exercised continuous steering and radio opening/closing at 1440×900, 1366×768, 1024×768, 900×600, 844×390, 390×844, 390×667 and 768×1024, in all four languages. Grounding and both warnings were included; the radio stayed clear of controls and no page execution errors were captured.

Documentation checks cover relative links, language navigation, source paths and package contents. README images are real English gameplay captures.

## Limits of the evidence

Route feasibility does not measure human-perceived difficulty. Stable formations, gradual obstacle growth and monotonic resource constraints need player sessions for fine tuning. Audio generation does not certify subjective mix quality; keyboard checks do not certify accessibility.

The Python backend was not changed or re-tested in this iteration. Older documents reported 105 Python tests; that historical count is not a fresh result. Live deployment and Qollab/IonQ execution need separate evidence.

[Technical guide](technical-guide.md) · [Documentation hub](README.md)

This effort is supported by Qollab & IonQ
