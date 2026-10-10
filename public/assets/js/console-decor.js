/*
 * Ghost Route — bridge console decoration (desktop "cockpit" layout only).
 *
 * Purely visual. Cables, button plates, toggle switches and screws are drawn as
 * SVG measured from the real panel positions, so they follow every screen size:
 *   - a back layer (behind the panels) holds the cables, which disappear behind
 *     instruments and into the window frame;
 *   - a front layer (above the frame) holds screws, lit buttons and switches.
 * Nothing here is interactive and both layers are hidden from assistive tech.
 *
 * MIT License — QuantGirls Team. This effort is supported by Qollab & IonQ.
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined' ||
      typeof document.createElementNS !== 'function' || typeof window.matchMedia !== 'function') return;

  const NS = 'http://www.w3.org/2000/svg';
  const cockpit = window.matchMedia('(min-width:1200px) and (min-height:640px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let back = null, front = null, frame = 0;

  const CABLES = {
    red:    ['#e04848', '#8a2020'],
    yellow: ['#f2c230', '#8a6a10'],
    green:  ['#4cc46a', '#1f6a30'],
    blue:   ['#4a8ef0', '#1f3f8a'],
    orange: ['#ff8a3d', '#8a3a10'],
    grey:   ['#a6afbe', '#4c5466']
  };

  function el(tag, attrs, parent) {
    const node = document.createElementNS(NS, tag);
    for (const key in attrs) node.setAttribute(key, attrs[key]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function layer(className) {
    const svg = el('svg', { class: 'console-deco ' + className, 'aria-hidden': 'true', focusable: 'false' });
    const defs = el('defs', {}, svg);
    const metal = el('radialGradient', { id: className + '-screw', cx: '35%', cy: '30%', r: '70%' }, defs);
    el('stop', { offset: '0%', 'stop-color': '#ffffff' }, metal);
    el('stop', { offset: '45%', 'stop-color': '#c3cad6' }, metal);
    el('stop', { offset: '100%', 'stop-color': '#5a6273' }, metal);
    const plate = el('linearGradient', { id: className + '-plate', x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
    el('stop', { offset: '0%', 'stop-color': '#dfe5ee' }, plate);
    el('stop', { offset: '50%', 'stop-color': '#98a1b2' }, plate);
    el('stop', { offset: '100%', 'stop-color': '#5a6273' }, plate);
    return svg;
  }

  // A cable: dark outline, shaded body, colored core and a thin specular highlight.
  function cable(g, d, color) {
    const [bright, shade] = CABLES[color];
    el('path', { d, fill: 'none', stroke: '#120d1c', 'stroke-width': 10, 'stroke-linecap': 'round' }, g);
    el('path', { d, fill: 'none', stroke: shade, 'stroke-width': 7.5, 'stroke-linecap': 'round' }, g);
    el('path', { d, fill: 'none', stroke: bright, 'stroke-width': 4.5, 'stroke-linecap': 'round' }, g);
    el('path', { d, fill: 'none', stroke: '#ffffff66', 'stroke-width': 1.5, 'stroke-linecap': 'round', transform: 'translate(-1,-1.5)' }, g);
  }

  // A slotted screw head; the slot angle varies so the screws don't look stamped.
  function screw(g, x, y, seed, r = 5) {
    el('circle', { cx: x + 1, cy: y + 1.5, r: r + 1, fill: '#0b071799' }, g);
    el('circle', { cx: x, cy: y, r: r + 1, fill: '#2a2f3a' }, g);
    el('circle', { cx: x, cy: y, r, fill: 'url(#deco-front-screw)' }, g);
    const a = ((seed * 47) % 180) * Math.PI / 180, dx = Math.cos(a) * (r - 1), dy = Math.sin(a) * (r - 1);
    el('line', { x1: x - dx, y1: y - dy, x2: x + dx, y2: y + dy, stroke: '#3a404d', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, g);
    el('line', { x1: x - dx + .6, y1: y - dy + .8, x2: x + dx + .6, y2: y + dy + .8, stroke: '#ffffff55', 'stroke-width': .7 }, g);
  }

  function screwsAround(g, rect, inset, seed) {
    const pts = [[rect.left + inset, rect.top + inset], [rect.right - inset, rect.top + inset],
                 [rect.left + inset, rect.bottom - inset], [rect.right - inset, rect.bottom - inset]];
    pts.forEach(([x, y], i) => screw(g, x, y, seed + i));
  }

  // A small steel plate with square lit push-buttons, like the reference art.
  function buttonPlate(g, x, y, colors) {
    const w = 14 + colors.length * 26, h = 30;
    el('rect', { x: x + 2, y: y + 3, width: w, height: h, rx: 6, fill: '#0b071799' }, g);
    el('rect', { x, y, width: w, height: h, rx: 6, fill: 'url(#deco-front-plate)', stroke: '#2a2f3a', 'stroke-width': 2 }, g);
    screw(g, x + 6, y + 6, 3, 2.6); screw(g, x + w - 6, y + h - 6, 7, 2.6);
    colors.forEach((c, i) => {
      const bx = x + 12 + i * 26, by = y + 6;
      el('rect', { x: bx - 2, y: by - 2, width: 22, height: 22, rx: 4, fill: '#1a1d26' }, g);
      el('rect', { x: bx, y: by, width: 18, height: 18, rx: 3, fill: c[1], class: i === 1 ? 'deco-blink' : '' }, g);
      el('rect', { x: bx + 2, y: by + 2, width: 14, height: 12, rx: 2, fill: c[0], class: i === 1 ? 'deco-blink' : '' }, g);
      el('rect', { x: bx + 3, y: by + 3, width: 6, height: 3, rx: 1, fill: '#ffffffaa' }, g);
    });
    return w;
  }

  // A toggle switch on its own base plate.
  function toggle(g, x, y, up) {
    el('rect', { x: x - 9, y: y - 12, width: 18, height: 24, rx: 4, fill: 'url(#deco-front-plate)', stroke: '#2a2f3a', 'stroke-width': 1.5 }, g);
    el('circle', { cx: x, cy: y, r: 5, fill: '#2a2f3a' }, g);
    const ty = up ? y - 11 : y + 11;
    el('line', { x1: x, y1: y, x2: x, y2: ty, stroke: '#dfe5ee', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, g);
    el('circle', { cx: x, cy: ty, r: 3.2, fill: up ? '#ff6b6b' : '#c3cad6', stroke: '#2a2f3a', 'stroke-width': 1 }, g);
  }

  function draw() {
    frame = 0;
    const shell = document.getElementById('game-shell');
    if (!shell) return;
    if (!back) {
      back = layer('deco-back'); front = layer('deco-front');
      shell.appendChild(back); shell.appendChild(front);
    }
    back.replaceChildren(back.firstChild); front.replaceChildren(front.firstChild);
    const show = cockpit.matches;
    back.style.display = front.style.display = show ? 'block' : 'none';
    if (!show) return;

    const s = shell.getBoundingClientRect();
    const rel = sel => {
      const node = document.querySelector(sel);
      if (!node || getComputedStyle(node).display === 'none') return null;
      const r = node.getBoundingClientRect();
      return { left: r.left - s.left, top: r.top - s.top, right: r.right - s.left, bottom: r.bottom - s.top, width: r.width, height: r.height };
    };
    const W = s.width, H = s.height;
    for (const svg of [back, front]) { svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H); }
    const consoleH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--console-h')) || 196;
    const top = H - consoleH;
    const radar = rel('.radar-widget'), radio = rel('.radio-widget'), dock = rel('.navigation-dock'), hud = rel('.hud-top');
    const bg = el('g', {}, back), fg = el('g', {}, front);

    // 1. Cable bundle climbing the left side of the bridge window, into the wall.
    if (radar) {
      ['red', 'yellow', 'green', 'blue'].forEach((c, i) => {
        const sx = radar.left + 34 + i * 10, sy = radar.top + 30, x = 18 + i * 8, endY = top - 120 - i * 22;
        cable(bg, `M${sx},${sy} C${sx},${top - 6} ${x},${top + 4} ${x},${top - 40} L${x},${endY + 16} Q${x},${endY} ${-14},${endY - 6}`, c);
      });
    }
    // 2. Cables looping over the gap between the radar and the radio.
    if (radar && radio) {
      [['orange', 18], ['grey', 9]].forEach(([c, lift], i) => {
        const a = [radar.right - 26 - i * 12, radar.top + 14], b = [radio.left + 26 + i * 14, radio.top + 14];
        cable(bg, `M${a[0]},${a[1]} C${a[0] + 10},${top - lift} ${b[0] - 10},${top - lift} ${b[0]},${b[1]}`, c);
      });
    }
    // 3. Cables strung between the radio and the helm console.
    if (radio && dock) {
      [['red', 16], ['blue', 26], ['yellow', 8]].forEach(([c, lift], i) => {
        const a = [radio.right - 40 - i * 22, radio.top + 12], b = [dock.left + 40 + i * 28, dock.top + 12];
        cable(bg, `M${a[0]},${a[1]} C${a[0] + 30},${top - lift} ${b[0] - 30},${top - lift} ${b[0]},${b[1]}`, c);
      });
      // A loose cable running along the console's top edge to the right side of the dock.
      const y = top + 8;
      cable(bg, `M${dock.left + dock.width * .55},${dock.top + 10} C${dock.left + dock.width * .6},${y - 22} ${dock.right - 90},${y - 18} ${dock.right - 40},${dock.top + 10}`, 'green');
    }

    // 4. Screws: console panels, the console itself, the bridge window frame and the HUD.
    let seed = 1;
    for (const r of [radar, radio, dock]) if (r) { screwsAround(fg, r, 9, seed); seed += 5; }
    screwsAround(fg, { left: 0, top, right: W, bottom: H }, 9, 40);
    const win = { top: hud ? hud.bottom : 72, bottom: top };
    for (let y = win.top + 70; y < win.bottom - 40; y += 150) { screw(fg, 7, y, seed++, 4); screw(fg, W - 7, y, seed++, 4); }
    for (let x = 140; x < W - 100; x += 260) screw(fg, x, win.bottom - 6, seed++, 4);
    if (hud) { screw(fg, 10, 12, 91, 4.5); screw(fg, W - 10, 12, 92, 4.5); }

    // 5. Lit button plate mounted on the helm console, plus toggle switches.
    if (dock) {
      buttonPlate(fg, dock.left + dock.width * .5 - 46, dock.top - 26,
        [['#ff6b6b', '#8a2020'], ['#7be08a', '#1f6a30'], ['#ffd166', '#8a6a10']]);
    }
    if (radio) {
      toggle(fg, radio.right - 58, radio.top - 8, true);
      toggle(fg, radio.right - 32, radio.top - 8, false);
    }
    if (radar) buttonPlate(fg, radar.left + radar.width / 2 - 33, radar.top - 24, [['#7be08a', '#1f6a30'], ['#4a8ef0', '#1f3f8a']]);
  }

  function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
  window.addEventListener('resize', schedule);
  cockpit.addEventListener?.('change', schedule);
  reduced.addEventListener?.('change', schedule);
  if (typeof ResizeObserver === 'function') {
    const start = () => { const shell = document.getElementById('game-shell'); if (shell) new ResizeObserver(schedule).observe(shell); schedule(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  } else {
    window.addEventListener('load', schedule);
  }
  if (document.fonts?.ready) document.fonts.ready.then(schedule);
})();
