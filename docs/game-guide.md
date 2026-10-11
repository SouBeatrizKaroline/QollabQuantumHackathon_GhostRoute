# Player guide

**English** · [Português (Brasil)](pt-BR/game-guide.md) · [Português (Portugal)](pt-PT/game-guide.md) · [Español](es/game-guide.md)

**Your job: reach Aurora-1, avoid grounding and decide which GPS readings deserve suspicion.** No quantum background is needed.

## Start with level 00

Open [the game](../public/index.html) or the [online frontend](https://ghostroutegame.vercel.app/). Choose level 00 and keep the heading at **045° (NE)** for four moves. Quoora explains the helm, Simple sensor, GPS comparison and rescue. Read each introduction, acknowledge it and make the next move.

## The decision loop

1. **Steer.** Select a compass direction or drag the heading slider. North is 0°, east 90°.
2. **Measure.** Choose Off or Simple; GHZ becomes available at level 06. Select how many measurements to spend.
3. **Advance.** The ship moves one fixed distance for the selected mission, plus current uncertainty. A turn represents 20 fictional minutes.
4. **Compare.** The ship represents the estimated position; the GPS square is the reported position. Lilac density shows possible positions, not certainty.
5. **Mark.** If the displayed GPS reading looks suspicious, mark it after observing it. The checkbox belongs to the completed turn, not the next move.

Plan the entire movement segment: crossing a rock or reef grounds the ship even if the destination is clear. Reach the capsule within the briefing's rescue radius before time runs out. Rescue ends the mission as soon as you arrive.

## A gradual campaign

| First level | New challenge |
| --- | --- |
| 00 | Four safe tutorial turns; no attacks or current noise. |
| 01 | Rocks and gentle currents, introduced before use. |
| 03 | A GPS jump: a sudden false offset. |
| 06 | GHZ mode: greater phase sensitivity with three candidate phases. |
| 10 | A central reef, hidden rescue coordinates during reentry and gradual GPS drift. |
| 30 | GPS freeze: a reading can stop while you move. |
| 60 | Guidance for conserving a tighter measurement budget; freeze can last longer. |
| 99 | The tightest resources and rescue radius, and strongest current noise. |

Existing rock formations grow gradually instead of being randomly replaced every level. New rocks start small. The menu shows the turn limit, budget, rescue radius and a difficulty index; it is a design index, not a measured player success rate. You can choose any level, and unfamiliar mechanics are still introduced.

## Radio, sound and controls

Click the **walkie-talkie icon** to open or close messages. A glow and ! badge indicate an unread mission moment. The radio opens clear of alerts and the helm. Use **Menu → Sound** to mute or enable effects. Browser audio begins after an interaction.

With the map focused: **Enter / Space** advances; **Left / Right** changes heading by 5°; **R** restarts; **D** shows the explicitly labeled true-position debug view; **Esc** opens the menu. Input controls retain their native keyboard behavior. Fullscreen support depends on the browser.

Language codes: **IN** English, **BR** Brazilian Portuguese (default), **PT** European Portuguese, **ES** Spanish. Preferences and completed levels belong to this browser and origin. Storage restrictions do not stop play, but may prevent saving.

![Ghost Route mobile layout with the walkie-talkie radio.](assets/ghost-route-mobile.png)

## Learn from the result

A safe rescue completes the level. A perfect rescue also marks at least one observed reading for each attack present in that mission; false alarms are reported separately. Replay reveals actual, GPS and inertial routes, attack timing and measurement counts. Historical replay omits posterior heatmaps because per-turn snapshots are not stored. Export saves decisions as JSON for inspection and Python circuit replay.

More measurements reduce sampling noise but use the budget. Sensor exhaustion still permits navigation. A GPS consistency warning means disagreement with the estimate; it is not a guaranteed attack detector. [Understand the model](technical-guide.md).

Help and actions in the mission menu contains the navigation guide, restart and decision export. On compact portrait screens, the main button starts the newly selected level; otherwise it continues the current mission or opens its replay.
