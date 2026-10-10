# Verification report

**English** · [Português (Brasil)](pt-BR/qa-report.md) · [Português (Portugal)](pt-PT/qa-report.md) · [Español](es/qa-report.md)

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
