// Name: scratchDraCor
// ID: scratchdracor
// Description: Blocks for the DraCor API (https://dracor.org): drama corpora, plays, characters, spoken text and network metrics.
// By: Ingo Börner, written with Claude Code
// License: MIT

/*
 * scratchDraCor - a TurboWarp custom extension for the DraCor API.
 *
 * Copyright (c) 2026 dracor.org
 * MIT License, see LICENSE.
 *
 * Works sandboxed (the default in TurboWarp) and unsandboxed. All requests
 * are GET requests to https://dracor.org/api/v1, which allows cross-origin
 * requests (Access-Control-Allow-Origin: *).
 */
(function (Scratch) {
  'use strict';

  const API = 'https://dracor.org/api/v1';

  // The DraCor symbol (from dracor-org/dracor-frontend, public/favicon.svg),
  // on a white disc for the category menu and in white on the blocks.
  const DRACOR_PATH =
    'M377.72,143A192.18,192.18,0,0,0,192,0H0V384H192A192.25,192.25,0,0,0,377.72,143ZM157.67,226.33a48.52,48.52,0,0,0,68.66,0c.69-.69,1.35-1.39,2-2.11A48.3,48.3,0,0,0,238,207.45H352.37a165.21,165.21,0,0,1-2.5,16.77A159.33,159.33,0,0,1,345.49,241C324.71,306,263.76,353.1,192,353.1H30.9V207.45H69.31A123.75,123.75,0,0,0,305.66,241H263.48a86.5,86.5,0,1,1,0-98h42.18A123.7,123.7,0,0,0,69.31,176.55H30.9V30.9H192c71.76,0,132.71,47.15,153.49,112.11a159.33,159.33,0,0,1,4.38,16.77,165.21,165.21,0,0,1,2.5,16.77H238a48.3,48.3,0,0,0-9.72-16.77c-.64-.72-1.3-1.42-2-2.11a48.55,48.55,0,0,0-68.66,68.66Z';
  const svgIcon = (bg, fg) =>
    'data:image/svg+xml;base64,' +
    btoa(
      '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="-48 -48 480 480">' +
        (bg ? '<circle cx="192" cy="192" r="236" fill="' + bg + '"/>' : '') +
        '<path fill-rule="evenodd" fill="' + fg + '" d="' + DRACOR_PATH + '"/>' +
        '</svg>'
    );
  const MENU_ICON = svgIcon('#ffffff', '#1F2448');
  const BLOCK_ICON = svgIcon(null, '#ffffff');

  const METRICS = [
    'density',
    'diameter',
    'averageDegree',
    'averageClustering',
    'averagePathLength',
    'maxDegree',
    'numEdges',
    'numConnectedComponents',
    'size',
    'wikipediaLinkCount'
  ];

  // Scratch.fetch is TurboWarp's wrapper around fetch (it asks the user for
  // permission where needed). Fall back to plain fetch elsewhere.
  const doFetch = (url, options) =>
    typeof Scratch.fetch === 'function'
      ? Scratch.fetch(url, options)
      : fetch(url, options);

  // Session cache: URL -> Promise of the parsed response (or null if the
  // server said "not found"). Network errors are not cached, so they can be
  // retried.
  const cache = new Map();
  let lastError = '';

  // Percent-encode one path segment; an empty input is an error (no request).
  const enc = (s) => {
    const v = s === null || s === undefined ? '' : String(s).trim();
    if (!v) throw new Error('empty corpus, play or ID');
    return encodeURIComponent(v);
  };

  function get(path, asText) {
    const url = API + path;
    const key = (asText ? 'text:' : 'json:') + url;
    if (cache.has(key)) return cache.get(key);
    const promise = doFetch(url, {
      headers: { Accept: asText ? 'text/plain' : 'application/json' }
    })
      .then((res) => {
        if (!res.ok) {
          lastError = 'HTTP ' + res.status + ' for ' + url;
          return null;
        }
        lastError = '';
        return asText ? res.text() : res.json();
      })
      .catch((err) => {
        cache.delete(key);
        lastError = 'Request failed: ' + url + ' (' + (err && err.message ? err.message : err) + ')';
        return null;
      });
    cache.set(key, promise);
    return promise;
  }

  const getCorpora = () => get('/corpora');
  const getCorpus = (c) => get('/corpora/' + enc(c));
  const getPlay = (c, p) => get('/corpora/' + enc(c) + '/plays/' + enc(p));
  const getCharacters = (c, p) => get('/corpora/' + enc(c) + '/plays/' + enc(p) + '/characters');
  const getMetrics = (c, p) => get('/corpora/' + enc(c) + '/plays/' + enc(p) + '/metrics');
  const getById = (id) => get('/id/' + enc(id));

  // Reporter values must be strings, numbers or booleans, never null.
  const str = (v) => (v === null || v === undefined ? '' : typeof v === 'number' ? v : String(v));

  // Scratch counts list items from 1.
  function nth(arr, n) {
    const i = Math.floor(Number(n)) - 1;
    if (!Array.isArray(arr) || !(i >= 0) || i >= arr.length) return '';
    return str(arr[i]);
  }

  function join(arr, sep) {
    if (!Array.isArray(arr)) return '';
    return arr.map((x) => String(x)).join(String(sep));
  }

  // Wrap every block so it never throws and never returns null/undefined.
  const safe = (fn) =>
    async function (args) {
      try {
        return str(await fn(args || {}));
      } catch (err) {
        lastError = 'Error: ' + (err && err.message ? err.message : err);
        return '';
      }
    };

  function findCharacter(characters, who) {
    if (!Array.isArray(characters)) return null;
    const w = String(who).trim().toLowerCase();
    return (
      characters.find((ch) => String(ch.id).toLowerCase() === w) ||
      characters.find((ch) => String(ch.name).toLowerCase() === w) ||
      null
    );
  }

  const corpusNames = async () => {
    const d = await getCorpora();
    return Array.isArray(d) ? d.map((c) => c.name) : null;
  };
  const playNames = async (c) => {
    const d = await getCorpus(c);
    return d && Array.isArray(d.plays) ? d.plays.map((p) => p.name) : null;
  };
  const characterNames = async (c, p) => {
    const d = await getCharacters(c, p);
    return Array.isArray(d) ? d.map((ch) => ch.name || ch.id) : null;
  };

  const CORPUS = { type: Scratch.ArgumentType.STRING, defaultValue: 'ger' };
  const PLAY = { type: Scratch.ArgumentType.STRING, defaultValue: 'lessing-emilia-galotti' };
  const SEP = { type: Scratch.ArgumentType.STRING, defaultValue: ', ' };
  const N = { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 };
  const R = Scratch.BlockType.REPORTER;

  class ScratchDraCor {
    constructor() {
      // Block implementations, wrapped so that they never crash a project.
      const impl = {
        numberOfCorpora: async () => {
          const names = await corpusNames();
          return names ? names.length : '';
        },
        corpusNames: async ({ SEP }) => join(await corpusNames(), SEP),
        corpusNameNumber: async ({ N }) => nth(await corpusNames(), N),
        corpusTitle: async ({ CORPUS }) => {
          const d = await getCorpus(CORPUS);
          return d ? d.title : '';
        },
        numberOfPlays: async ({ CORPUS }) => {
          const names = await playNames(CORPUS);
          return names ? names.length : '';
        },
        playNames: async ({ CORPUS, SEP }) => join(await playNames(CORPUS), SEP),
        playNameNumber: async ({ CORPUS, N }) => nth(await playNames(CORPUS), N),
        playTitle: async ({ CORPUS, PLAY }) => {
          const d = await getPlay(CORPUS, PLAY);
          return d ? d.title : '';
        },
        playAuthors: async ({ CORPUS, PLAY }) => {
          const d = await getPlay(CORPUS, PLAY);
          if (!d || !Array.isArray(d.authors)) return '';
          return d.authors.map((a) => a.fullname || a.name).join(', ');
        },
        playYear: async ({ CORPUS, PLAY }) => {
          const d = await getPlay(CORPUS, PLAY);
          return d ? d.yearNormalized : '';
        },
        playId: async ({ CORPUS, PLAY }) => {
          const d = await getPlay(CORPUS, PLAY);
          return d ? d.id : '';
        },
        numberOfCharacters: async ({ CORPUS, PLAY }) => {
          const names = await characterNames(CORPUS, PLAY);
          return names ? names.length : '';
        },
        characterNames: async ({ CORPUS, PLAY, SEP }) => join(await characterNames(CORPUS, PLAY), SEP),
        characterNameNumber: async ({ CORPUS, PLAY, N }) => nth(await characterNames(CORPUS, PLAY), N),
        characterWords: async ({ CHARACTER, CORPUS, PLAY }) => {
          const ch = findCharacter(await getCharacters(CORPUS, PLAY), CHARACTER);
          return ch ? ch.numOfWords : '';
        },
        spokenText: async ({ CORPUS, PLAY, SEX, MAX }) => {
          const sex = String(SEX).toUpperCase();
          const query = ['FEMALE', 'MALE', 'UNKNOWN'].includes(sex) ? '?sex=' + sex : '';
          const text = await get('/corpora/' + enc(CORPUS) + '/plays/' + enc(PLAY) + '/spoken-text' + query, true);
          if (typeof text !== 'string') return '';
          const max = Math.floor(Number(MAX));
          return max > 0 ? Array.from(text).slice(0, max).join('') : text;
        },
        playNameForId: async ({ ID }) => {
          const d = await getById(ID);
          return d ? d.name : '';
        },
        corpusForId: async ({ ID }) => {
          const d = await getById(ID);
          return d ? d.corpus : '';
        },
        playMetric: async ({ METRIC, CORPUS, PLAY }) => {
          if (!METRICS.includes(String(METRIC))) {
            lastError = 'Unknown metric: ' + METRIC;
            return '';
          }
          const d = await getMetrics(CORPUS, PLAY);
          return d ? d[METRIC] : '';
        },
        lastError: () => lastError
      };
      for (const name of Object.keys(impl)) this[name] = safe(impl[name]);
    }

    getInfo() {
      return {
        id: 'scratchdracor',
        name: 'DraCor',
        color1: '#b03a48',
        color2: '#8f2f3a',
        color3: '#6e242d',
        menuIconURI: MENU_ICON,
        blockIconURI: BLOCK_ICON,
        docsURI: 'https://github.com/dracor-org/scratchdracor',
        blocks: [
          { blockType: Scratch.BlockType.LABEL, text: 'Corpora' },
          { opcode: 'numberOfCorpora', blockType: R, text: 'number of corpora' },
          { opcode: 'corpusNames', blockType: R, text: 'corpus names separated by [SEP]', arguments: { SEP } },
          { opcode: 'corpusNameNumber', blockType: R, text: 'corpus name number [N]', arguments: { N } },
          { opcode: 'corpusTitle', blockType: R, text: 'title of corpus [CORPUS]', arguments: { CORPUS } },
          { opcode: 'numberOfPlays', blockType: R, text: 'number of plays in corpus [CORPUS]', arguments: { CORPUS } },
          {
            opcode: 'playNames',
            blockType: R,
            text: 'play names in corpus [CORPUS] separated by [SEP]',
            arguments: { CORPUS, SEP }
          },
          {
            opcode: 'playNameNumber',
            blockType: R,
            text: 'play name number [N] in corpus [CORPUS]',
            arguments: { N, CORPUS }
          },
          '---',
          { blockType: Scratch.BlockType.LABEL, text: 'Plays' },
          { opcode: 'playTitle', blockType: R, text: 'title of play [CORPUS] [PLAY]', arguments: { CORPUS, PLAY } },
          { opcode: 'playAuthors', blockType: R, text: 'authors of play [CORPUS] [PLAY]', arguments: { CORPUS, PLAY } },
          { opcode: 'playYear', blockType: R, text: 'year of play [CORPUS] [PLAY]', arguments: { CORPUS, PLAY } },
          { opcode: 'playId', blockType: R, text: 'DraCor ID of play [CORPUS] [PLAY]', arguments: { CORPUS, PLAY } },
          {
            opcode: 'playMetric',
            blockType: R,
            text: 'network [METRIC] of play [CORPUS] [PLAY]',
            arguments: {
              METRIC: { type: Scratch.ArgumentType.STRING, menu: 'metrics', defaultValue: 'density' },
              CORPUS,
              PLAY
            }
          },
          {
            opcode: 'spokenText',
            blockType: R,
            text: 'spoken text of play [CORPUS] [PLAY] by [SEX] characters, first [MAX] letters',
            arguments: {
              CORPUS,
              PLAY,
              SEX: { type: Scratch.ArgumentType.STRING, menu: 'sex', defaultValue: 'all' },
              MAX: { type: Scratch.ArgumentType.NUMBER, defaultValue: 500 }
            }
          },
          '---',
          { blockType: Scratch.BlockType.LABEL, text: 'Characters' },
          {
            opcode: 'numberOfCharacters',
            blockType: R,
            text: 'number of characters of play [CORPUS] [PLAY]',
            arguments: { CORPUS, PLAY }
          },
          {
            opcode: 'characterNames',
            blockType: R,
            text: 'character names of play [CORPUS] [PLAY] separated by [SEP]',
            arguments: { CORPUS, PLAY, SEP }
          },
          {
            opcode: 'characterNameNumber',
            blockType: R,
            text: 'character name number [N] of play [CORPUS] [PLAY]',
            arguments: { N, CORPUS, PLAY }
          },
          {
            opcode: 'characterWords',
            blockType: R,
            text: 'number of words spoken by [CHARACTER] in play [CORPUS] [PLAY]',
            arguments: {
              CHARACTER: { type: Scratch.ArgumentType.STRING, defaultValue: 'Emilia' },
              CORPUS,
              PLAY
            }
          },
          '---',
          { blockType: Scratch.BlockType.LABEL, text: 'DraCor IDs' },
          {
            opcode: 'corpusForId',
            blockType: R,
            text: 'corpus of DraCor ID [ID]',
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'ger000088' } }
          },
          {
            opcode: 'playNameForId',
            blockType: R,
            text: 'play name of DraCor ID [ID]',
            arguments: { ID: { type: Scratch.ArgumentType.STRING, defaultValue: 'ger000088' } }
          },
          '---',
          { opcode: 'lastError', blockType: R, text: 'last DraCor error', disableMonitor: false }
        ],
        menus: {
          metrics: { acceptReporters: true, items: METRICS },
          sex: {
            acceptReporters: true,
            items: [
              { text: 'all', value: 'all' },
              { text: 'female', value: 'FEMALE' },
              { text: 'male', value: 'MALE' },
              { text: 'unknown', value: 'UNKNOWN' }
            ]
          }
        }
      };
    }
  }

  Scratch.extensions.register(new ScratchDraCor());
})(Scratch);
