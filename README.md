# Ghost Route

**English** · [Português (Brasil)](README.pt-BR.md) · [Português (Portugal)](README.pt-PT.md) · [Español](README.es.md)

### When your GPS lies, how will you bring them home?

**A pixel-art rescue adventure that turns quantum sensing into a decision you can play.**

Aurora-1 is returning from orbit. You are at the helm of **SPOOFED**, with a crew to rescue, dangerous waters ahead and navigation signals you cannot always trust. Your ally is **Quoora**, an onboard AI that helps you compare the GPS with a simulated quantum sensor. Choose your heading, question the signal and bring everyone home.

**[Play Ghost Route](https://ghostroutegame.vercel.app/)** · [Learn to play](docs/game-guide.md) · [Explore the project](docs/project-page.md) · [Technical guide](docs/technical-guide.md)

![Ghost Route: SPOOFED navigating a sunset sea with a tactical map, sensor controls and a walkie-talkie radio.](docs/assets/ghost-route-gameplay.png)

*Actual gameplay capture. Desktop and mobile layouts share the same campaign.*

## A hundred missions. One question: which signal do you trust?

| What you get | Why it matters |
| --- | --- |
| **100 named levels, 00–99** | Start with a four-turn tutorial, then face gradually tighter navigation challenges. |
| **A simulated quantum sensor** | Compare evidence, manage measurements and discover why greater phase sensitivity comes with ambiguity. |
| **32-bit-era pixel art** | A nautical bridge, sunset seas and 64 directional ship views that keep the mast upright. |
| **A walkie-talkie mission radio** | Click the icon to read messages. New messages glow; alerts stay clear of the helm. |
| **Original sound effects** | Hear measurements, warnings, rescue and failure; mute them from the menu. |
| **Four languages** | English, Brazilian Portuguese, European Portuguese and Spanish, including tutorials and replay. |
| **Replay and decision export** | Review your route, suspicious readings and sensor choices after each mission. |

## Your first rescue takes four turns

1. Open the game and choose **level 00**.
2. Keep a **045° northeast heading** and follow Quoora's four tutorial steps.
3. Select the **Simple** sensor, advance, compare the instruments and reach Aurora-1.
4. Review the result and move to the next level.

New mechanics are introduced before use, even if you choose a later level directly. The difficulty curve gradually increases currents, grows familiar rock formations and tightens resources and rescue precision. Level 99 has the strongest currents, smallest rescue radius and lowest measurement budget.

## Choose your way into the project

| You are here to… | Start here |
| --- | --- |
| **Play or discover quantum ideas without equations** | [Player guide](docs/game-guide.md) |
| **Judge the project or understand its contribution** | [Project overview](docs/project-page.md) and [demo script](docs/demo-script.md) |
| **Explore educational or partnership potential** | [Product vision and next steps](docs/project-page.md#product-vision) |
| **Build, reproduce results or contribute** | [Technical guide](docs/technical-guide.md) and [verification report](docs/qa-report.md) |

## Quantum science, explained through play

Think of the sensor as another source of clues. It samples a model of magnetic fingerprints and combines those readings with the ship's movement to estimate possible positions. **GHZ** mode responds to three times the phase, but leaves three candidate phases. A sharper response is not an automatic, unambiguous position fix.

The browser runs an **educational simulation**. A separate Python implementation uses **Qiskit circuits**, and a Qollab entry point demonstrates both sensor modes in one eight-qubit circuit. This prototype does not establish real-world navigation performance or a demonstrated quantum advantage. [See the model and execution paths](docs/technical-guide.md).

## Play locally, without a build step

Open [public/index.html](public/index.html) in your browser, keeping its assets folder beside it. No frontend installation is required. For a local server:

~~~sh
python -m http.server 8000 --directory public
~~~

Open **http://localhost:8000**. Sound starts after user interaction. The game defaults to **BR**; select **IN** for English, **PT** for European Portuguese or **ES** for Spanish. Progress and preferences are saved in the current browser when storage is available.

## Built to be played, inspected and extended

The project combines a playable campaign, explicit sensing tradeoffs and inspectable decisions. Frontend checks cover mission rules, localization, estimation, rendering and safe rescue routes across the campaign. Platform execution and submission evidence are tracked separately in the [submission checklist](docs/submission-checklist.md).

**Created by QuantGirls for the Qollab × IonQ hackathon.** Released under the [MIT license](LICENSE). Educational pilots, more accessible onboarding and comparative evaluation are proposed next steps; commercial traction and learning outcomes have not been established.

This effort is supported by Qollab & IonQ

<details>
<summary>Credits and development transparency</summary>

Gemini Spark assisted the initial implementation; OpenAI Codex assisted the interface, procedural art, localization, QA, campaign refinement and documentation. Claude (Anthropic) assisted the sunset theme, animated map effects, ship sprite and cockpit console. User-provided visual references informed the art direction. The team must confirm contribution dates and the final hackathon disclosure. [Documentation hub](docs/README.md).

</details>
