const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'public/assets/js/i18n.js'), 'utf8');
const texts = vm.runInNewContext(`${source}\n; TEXTOS`, {}, { timeout: 1000 });
const locales = ['en', 'pt-BR', 'pt-PT', 'es'];
const placeholders = value => (value.match(/\{\w+\}/g) || []).sort();

test('All four languages provide complete catalogs', () => {
  assert.deepEqual(Object.keys(texts).sort(), [...locales].sort());
  const englishKeys = Object.keys(texts.en).sort();
  for (const locale of locales) {
    assert.deepEqual(Object.keys(texts[locale]).sort(), englishKeys, `${locale}: missing or extra translation keys`);
    for (const key of englishKeys) {
      assert.equal(typeof texts[locale][key], 'string', `${locale}.${key}: expected a string`);
      assert.ok(texts[locale][key].trim(), `${locale}.${key}: empty translation`);
      assert.ok(!/\b(?:undefined|null)\b/.test(texts[locale][key]), `${locale}.${key}: invalid translation value`);
    }
  }
});

test('localized messages preserve every runtime placeholder', () => {
  for (const key of Object.keys(texts.en)) {
    for (const locale of locales) {
      assert.deepEqual(placeholders(texts[locale][key]), placeholders(texts.en[key]), `${locale}.${key}: interpolation mismatch`);
    }
  }
  for (const locale of locales) {
    assert.deepEqual(placeholders(texts[locale].observedReading), ['{mode}', '{shots}', '{turn}']);
    assert.deepEqual(placeholders(texts[locale].observedMark), ['{turn}']);
  }
});

test('HTML text and accessible translation bindings exist in every language', () => {
  const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
  const bindings = [...html.matchAll(/data-i18n(?:-aria|-title|-placeholder)?\s*=\s*["']([^"']+)["']/g)].map(match => match[1]);
  assert.ok(bindings.length, 'Expected translated HTML labels');
  for (const key of new Set(bindings)) {
    for (const locale of locales) {
      assert.ok(Object.hasOwn(texts[locale], key), `${locale}: HTML references missing translation ${key}`);
    }
  }
});

test('both Portuguese variants and Spanish do not retain English sensor or replay labels', () => {
  for (const locale of ['pt-BR', 'pt-PT', 'es']) {
    for (const [key, value] of Object.entries(texts[locale])) {
      const prose = value.replace(/\{\w+\}/g, '');
      assert.ok(!/\b(?:shots?|debug|replay|debriefing)\b/i.test(prose), `${locale}.${key}: untranslated English UI: ${value}`);
    }
  }
});

test('mission, observation, sensor exhaustion and replay states are translated', () => {
  const required = [
    'missionObjective', 'budgetExhausted', 'sensorOffReading', 'noMeasurement',
    'observedReading', 'observedMark', 'expandRadio', 'collapseRadio',
    'replayLegendShip', 'replayLegendTrue', 'replayLegendInertial',
    'jumpCode', 'driftCode', 'freezeCode', 'timelineExplanation', 'attributionTranslated', 'enterKey'
  ];
  for (const locale of locales) {
    for (const key of required) assert.ok(texts[locale][key], `${locale}: untranslated state ${key}`);
    assert.match(texts[locale].missionObjective, /12/);
    assert.match(texts[locale].missionObjective, /2 km/);
    const codes = ['jumpCode', 'driftCode', 'freezeCode'].map(key => texts[locale][key]);
    assert.equal(new Set(codes).size, 3, `${locale}: attack symbols must be distinct`);
    for (const code of codes) assert.ok(texts[locale].timelineExplanation.includes(`${code}:`), `${locale}: unexplained attack symbol ${code}`);
    assert.equal(texts[locale].attribution, 'This effort is supported by Qollab & IonQ');
    assert.equal(texts[locale].appTitle, 'Ghost Route');
  }
  assert.notEqual(texts['pt-BR'].attributionTranslated, texts.en.attributionTranslated);
  assert.notEqual(texts.es.attributionTranslated, texts.en.attributionTranslated);
});

test('Portuguese variants have regional wording', () => {
  assert.equal(Object.hasOwn(texts, 'pt-PT'), true);
  assert.match(texts['pt-PT'].fullscreen, /Ecrã/);
  assert.match(texts['pt-PT'].gameSettings, /Definições/);
  assert.match(texts['pt-BR'].fullscreen, /Tela/);
  assert.match(texts['pt-BR'].gameSettings, /Configurações/);
});

test('menu, campaign, tutorial and accessible controls are complete in all four languages', () => {
  const required = [
    'menuLabel', 'menuEyebrow', 'menuTitle', 'menuIntro', 'menuStart', 'menuContinue',
    'menuClose', 'menuLanguage', 'menuFullscreen', 'menuRestart', 'menuExport', 'menuSettings',
    'menuGuide', 'menuGuideHeading', 'menuGuideHeadingBody', 'menuGuideSensor', 'menuGuideSensorBody',
    'menuGuideAdvance', 'menuGuideAdvanceBody', 'menuKeyboard', 'menuCampaign', 'menuLevel',
    'menuProgress', 'menuStartLevel', 'menuDifficulty', 'menuBrandLine', 'menuUtilityAria',
    'menuNavigationAria', 'menuRadioAria', 'menuLevelSelect', 'levelName', 'levelTutorial',
    'levelBeginner', 'levelIntermediate', 'levelAdvanced', 'levelExpert', 'levelBrief',
    'progressLabel', 'levelCompleted', 'nextLevel', 'campaignComplete', 'tutorialHeading',
    'tutorialSensor', 'tutorialGps', 'tutorialRescue', 'levelIntro', 'trainingMode', 'levelNotCompleted'
  ];
  for (const locale of locales) {
    for (const key of required) assert.ok(texts[locale][key], `${locale}: missing menu or campaign label ${key}`);
    assert.deepEqual(placeholders(texts[locale].levelBrief), ['{budget}', '{radius}', '{turns}']);
    assert.deepEqual(placeholders(texts[locale].levelIntro), ['{radius}', '{turns}']);
    assert.deepEqual(placeholders(texts[locale].progressLabel), ['{completed}']);
    assert.deepEqual(placeholders(texts[locale].levelCompleted), ['{level}']);
    assert.match(texts[locale].tutorialHeading, /045°.*NE/);
    assert.match(texts[locale].progressLabel, /100/);
    assert.match(texts[locale].campaignComplete, /100/);
  }
});

test('language selectors expose all four locales and default to Brazilian Portuguese', () => {
  const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
  assert.match(html, /<html\b[^>]*lang=["']pt-BR["']/);
  for (const id of ['lang-select', 'menu-lang-select']) {
    const select = html.match(new RegExp(`<select\\b[^>]*\\bid=["']${id}["'][^>]*>([\\s\\S]*?)</select>`));
    assert.ok(select, `Missing language selector ${id}`);
    const options = [...select[1].matchAll(/<option\b([^>]*)>\s*([^<]+)\s*<\/option>/g)];
    assert.deepEqual(options.map(option => option[1].match(/value=["']([^"']+)["']/)?.[1]).sort(), [...locales].sort());
    const selected = options.filter(option => /\bselected\b/.test(option[1]));
    assert.equal(selected.length, 1, `${id}: expected a default selected language`);
    assert.match(selected[0][1], /value=["']pt-BR["']/);
  }
});

test('runtime catalog lookups in the app and map renderer have translations', () => {
  const app = fs.readFileSync(path.join(root, 'public/assets/js/app.js'), 'utf8');
  const engine = fs.readFileSync(path.join(root, 'public/assets/js/engine.js'), 'utf8');
  const keys = new Set([...`${app}\n${engine}`.matchAll(/\bt\.([A-Za-z_][A-Za-z_0-9]*)/g)].map(match => match[1]));
  assert.ok(keys.size > 40, 'Expected dynamic labels from mission states and map rendering');
  for (const key of keys) {
    for (const locale of locales) assert.ok(Object.hasOwn(texts[locale], key), `${locale}: missing runtime translation ${key}`);
  }
});
