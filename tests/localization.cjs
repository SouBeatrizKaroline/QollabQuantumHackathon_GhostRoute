const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'public/assets/js/i18n.js'), 'utf8');
const texts = vm.runInNewContext(`${source}\n; TEXTOS`, {}, { timeout: 1000 });
const locales = ['en', 'pt-BR', 'es'];
const placeholders = value => (value.match(/\{\w+\}/g) || []).sort();

test('English, Brazilian Portuguese and Spanish provide the same complete catalog', () => {
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

test('HTML translation bindings exist in every language', () => {
  const html = fs.readFileSync(path.join(root, 'public/index.html'), 'utf8');
  const bindings = [...html.matchAll(/data-i18n\s*=\s*["']([^"']+)["']/g)].map(match => match[1]);
  assert.ok(bindings.length, 'Expected translated HTML labels');
  for (const key of new Set(bindings)) {
    for (const locale of locales) {
      assert.ok(Object.hasOwn(texts[locale], key), `${locale}: HTML references missing translation ${key}`);
    }
  }
});

test('Portuguese and Spanish UI do not retain English shots, debug or replay labels', () => {
  for (const locale of ['pt-BR', 'es']) {
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
