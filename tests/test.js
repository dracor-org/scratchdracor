// Headless test for scratchDraCor: loads the extension with a minimal mock of
// the Scratch global and calls the blocks against https://dracor.org.
// Run with: node tests/test.js   (Node 18+, no dependencies)
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

let extension = null;
const requests = [];

globalThis.Scratch = {
  ArgumentType: { STRING: 'string', NUMBER: 'number' },
  BlockType: { REPORTER: 'reporter', LABEL: 'label' },
  extensions: { register: (ext) => (extension = ext) },
  fetch: (url, options) => {
    requests.push(url);
    return fetch(url, options);
  }
};

const source = fs.readFileSync(path.join(__dirname, '..', 'scratchdracor.js'), 'utf8');
vm.runInThisContext(source, { filename: 'scratchdracor.js' });

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test('extension info is valid', async () => {
  const info = extension.getInfo();
  assert.strictEqual(info.id, 'scratchdracor');
  for (const b of info.blocks) {
    if (typeof b === 'object' && b.opcode) {
      assert.strictEqual(typeof extension[b.opcode], 'function', 'missing ' + b.opcode);
      for (const arg of (b.text.match(/\[(\w+)\]/g) || []).map((s) => s.slice(1, -1))) {
        assert.ok(b.arguments && b.arguments[arg], b.opcode + ': argument ' + arg + ' not declared');
      }
    }
  }
});

test('corpora', async () => {
  const n = await extension.numberOfCorpora();
  assert.ok(typeof n === 'number' && n > 10, 'number of corpora: ' + n);
  const names = await extension.corpusNames({ SEP: '|' });
  assert.ok(names.split('|').includes('ger'));
  assert.strictEqual(names.split('|').length, n);
  assert.strictEqual(await extension.corpusNameNumber({ N: 1 }), names.split('|')[0]);
  assert.strictEqual(await extension.corpusNameNumber({ N: 0 }), '');
});

test('German corpus', async () => {
  assert.strictEqual(await extension.corpusTitle({ CORPUS: 'ger' }), 'German Drama Corpus');
  const n = await extension.numberOfPlays({ CORPUS: 'ger' });
  assert.ok(n > 500, 'plays in ger: ' + n);
  const names = (await extension.playNames({ CORPUS: 'ger', SEP: '\n' })).split('\n');
  assert.strictEqual(names.length, n);
  assert.ok(names.includes('lessing-emilia-galotti'));
  assert.strictEqual(await extension.playNameNumber({ CORPUS: 'ger', N: 2 }), names[1]);
});

const EG = { CORPUS: 'ger', PLAY: 'lessing-emilia-galotti' };

test('Emilia Galotti metadata', async () => {
  assert.strictEqual(await extension.playTitle(EG), 'Emilia Galotti');
  assert.strictEqual(await extension.playAuthors(EG), 'Gotthold Ephraim Lessing');
  assert.strictEqual(await extension.playYear(EG), 1772);
  assert.strictEqual(await extension.playId(EG), 'ger000088');
});

test('Emilia Galotti characters', async () => {
  assert.strictEqual(await extension.numberOfCharacters(EG), 13);
  const names = (await extension.characterNames({ ...EG, SEP: ', ' })).split(', ');
  assert.strictEqual(names.length, 13);
  assert.ok(names.includes('Emilia') && names.includes('Marinelli'));
  assert.strictEqual(await extension.characterNameNumber({ ...EG, N: 1 }), names[0]);
  assert.strictEqual(await extension.characterNameNumber({ ...EG, N: 14 }), '');
  const byName = await extension.characterWords({ ...EG, CHARACTER: 'Emilia' });
  assert.ok(typeof byName === 'number' && byName > 1000, 'Emilia words: ' + byName);
  assert.strictEqual(await extension.characterWords({ ...EG, CHARACTER: 'emilia' }), byName);
  assert.strictEqual(await extension.characterWords({ ...EG, CHARACTER: 'Hamlet' }), '');
});

test('Emilia Galotti metrics', async () => {
  const density = await extension.playMetric({ ...EG, METRIC: 'density' });
  assert.ok(Math.abs(density - 0.3718) < 0.001, 'density: ' + density);
  assert.strictEqual(await extension.playMetric({ ...EG, METRIC: 'size' }), 13);
  assert.strictEqual(typeof (await extension.playMetric({ ...EG, METRIC: 'diameter' })), 'number');
  assert.strictEqual(await extension.playMetric({ ...EG, METRIC: 'nonsense' }), '');
});

test('spoken text by female characters', async () => {
  const text = await extension.spokenText({ ...EG, SEX: 'FEMALE', MAX: 100 });
  assert.strictEqual(Array.from(text).length, 100);
  assert.ok(text.startsWith('Wer sprengte da in den Hof?'), text);
  const full = await extension.spokenText({ ...EG, SEX: 'FEMALE', MAX: 0 });
  assert.ok(full.length > 10000 && full.startsWith(text));
});

test('DraCor ID ger000088', async () => {
  assert.strictEqual(await extension.corpusForId({ ID: 'ger000088' }), 'ger');
  assert.strictEqual(await extension.playNameForId({ ID: 'ger000088' }), 'lessing-emilia-galotti');
});

test('seneca-medea in rom and eng has different IDs', async () => {
  const rom = await extension.playId({ CORPUS: 'rom', PLAY: 'seneca-medea' });
  const eng = await extension.playId({ CORPUS: 'eng', PLAY: 'seneca-medea' });
  assert.ok(/^rom\d{6}$/.test(rom), 'rom: ' + rom);
  assert.ok(/^eng\d{6}$/.test(eng), 'eng: ' + eng);
  assert.notStrictEqual(rom, eng);
});

test('unknown things give empty strings, not crashes', async () => {
  assert.strictEqual(await extension.playTitle({ CORPUS: 'ger', PLAY: 'no-such-play' }), '');
  assert.ok((await extension.lastError()).includes('404'), 'last error: ' + (await extension.lastError()));
  assert.strictEqual(await extension.numberOfCharacters({ CORPUS: 'ger', PLAY: 'no-such-play' }), '');
  assert.strictEqual(await extension.numberOfPlays({ CORPUS: 'xyz' }), '');
  assert.strictEqual(await extension.playNameForId({ ID: 'ger999999' }), '');
  assert.strictEqual(await extension.playTitle({}), '');
});

test('cache: repeated calls make no new requests', async () => {
  const before = requests.length;
  await extension.playTitle(EG);
  await extension.numberOfCharacters(EG);
  await extension.numberOfPlays({ CORPUS: 'ger' });
  assert.strictEqual(requests.length, before);
});

(async () => {
  let failed = 0;
  for (const t of tests) {
    try {
      await t.fn();
      console.log('ok     ' + t.name);
    } catch (err) {
      failed++;
      console.log('FAILED ' + t.name + '\n       ' + err.message);
    }
  }
  console.log('\n' + (tests.length - failed) + '/' + tests.length + ' tests passed, ' + requests.length + ' GET requests');
  process.exit(failed ? 1 : 0);
})();
