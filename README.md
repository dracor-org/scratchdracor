# scratchDraCor

Blocks for the [DraCor API](https://dracor.org/doc/api/): a custom extension
for [TurboWarp](https://turbowarp.org), the Scratch editor that can load
extensions of its own. With it, you can put plays from
[DraCor](https://dracor.org), the Drama Corpora Project, into a Scratch-style
program: ask for the title of a play, count its characters, let a sprite say
the first lines spoken by its women, or compare the network density of two
tragedies.

scratchDraCor is the youngest sibling of
[PyDraCor](https://github.com/dracor-org/pydracor) (Python),
[rdracor](https://github.com/dracor-org/rdracor) (R) and
[basicDraCor](https://github.com/dracor-org/basicdracor) (BASIC). It is meant
for learners and school students who think in blocks.

```
when green flag clicked
say (join (title of play [ger] [lessing-emilia-galotti]) (join [ has ] (join (number of characters of play [ger] [lessing-emilia-galotti]) [ characters.])))
→ "Emilia Galotti has 13 characters."
```

scratchDraCor was written by Ingo Börner with [Claude Code](https://claude.com/claude-code).

## Quick start

Open this link in a web browser (Chrome, Firefox, Edge or Safari, also on a
tablet):

<https://turbowarp.org/editor?extension=https://dracor-org.github.io/scratchdracor/scratchdracor.js>

TurboWarp opens with the DraCor blocks already loaded. Nothing needs to be
installed, and you do not need an account.

## A short guide to TurboWarp

TurboWarp looks and works like Scratch. If you have never used either, this is
all you need for scratchDraCor:

1. **Find the blocks.** The coloured circles on the far left are the block
   categories. Click **DraCor** (the dark blue DraCor symbol at the bottom of
   the list) to see the DraCor blocks.
2. **Try a block.** Click on a round block in the palette, for example
   `title of play [ger] [lessing-emilia-galotti]`. A bubble shows its answer
   (`Emilia Galotti`). The first answer may take a moment, because the block
   asks DraCor over the internet.
3. **Change the inputs.** Click into the white fields of a block and type
   another corpus or play name, e.g. `shake` and `hamlet`. You find these
   names in the address of a play on dracor.org, e.g.
   `https://dracor.org/shake/hamlet`.
4. **Build a script.** Drag blocks from the palette into the large area in
   the middle. Round DraCor blocks fit into the white fields of other blocks,
   e.g. into `say [Hello!]` from the **Looks** category, or into `join [] []`
   from **Operators**. Put `when green flag clicked` from **Events** on top.
5. **Run it.** Click the green flag above the stage (top right). The sprite
   on the stage says the answer.
6. **Use variables and lists.** In **Variables** you can make variables and
   lists to collect answers, for example all character names of a play (see
   the example below).
7. **Save your project.** Use **File > Save as…** (in some browsers the item
   is called **Save to your computer**). You get an `.sb3` file. To continue later, open the link above and use **File > Load
   from your computer**. The project remembers that it uses scratchDraCor.
8. **Open the example.** Download
   [`examples/emilia-galotti.sb3`](examples/emilia-galotti.sb3) and load it
   with **File > Load from your computer**. Click the green flag: the sprite
   finds out who speaks most in Lessing's *Emilia Galotti*.

The menus may appear in your browser's language (e.g. **Datei > Von deinem
Computer hochladen** in German). TurboWarp's own documentation is at
<https://docs.turbowarp.org/>.

## Why TurboWarp and not Scratch?

The official Scratch website (scratch.mit.edu) does not allow custom
extensions, and none of its built-in extensions can ask a web API for data.
TurboWarp is a free, compatible Scratch editor that can load custom
extensions written in JavaScript. Projects made there are normal `.sb3` files,
but projects that use scratchDraCor only run in TurboWarp (or in the
TurboWarp Packager), not on scratch.mit.edu.

## Who runs TurboWarp? (Notes for schools)

TurboWarp is open source (GPL-3.0, MPL-2.0 and MIT, depending on the part) and
not affiliated with Scratch or MIT. Its
[privacy policy](https://turbowarp.org/privacy.html) (as of 27 September 2025)
describes it as "an open source project ran by volunteers"; it names no legal
entity or country and has no imprint. The contact address is
contact@turbowarp.org. According to the policy, TurboWarp collects little
data: IP addresses only in case of abuse, anonymous view counts that can be
switched off, and anonymous aggregated usage numbers. Where the servers are
located is not stated.

For use in schools, data protection officers usually want to know who is
responsible for a service and where the data is processed. If turbowarp.org
is not acceptable, there are two alternatives:

- **TurboWarp Desktop** ([desktop.turbowarp.org](https://desktop.turbowarp.org/))
  runs as an app on Windows, macOS and Linux. It can load scratchDraCor from a
  file (choose **Files** in step 4 below).
- **Your own copy of the editor.** The TurboWarp editor can be built from
  [its source code](https://github.com/TurboWarp/scratch-gui) and hosted by a
  school or institution
  ([build instructions](https://docs.turbowarp.org/development/getting-started)).

In every case, the DraCor blocks send their requests to the DraCor API at
dracor.org, and the extension itself is loaded from GitHub Pages when you use
the link above.

## Loading the extension in TurboWarp

scratchDraCor is a single file, `scratchdracor.js`. It works **sandboxed**, so
you do not need to tick "Run extension without sandbox".

1. Open the TurboWarp editor: <https://turbowarp.org/editor>.
2. Click the **Add Extension** button at the bottom left (the blue button with
   the blocks and the plus sign).
3. Scroll down to the end of the list and choose **Custom Extension**.
4. The dialog **Load Custom Extension** opens. It has three ways of loading:
   - **URL**: paste the address of `scratchdracor.js` on the web. This only
     works once the file is hosted somewhere with HTTPS, for example on GitHub
     Pages (see below). Links to `raw.githubusercontent.com` do not work.
   - **Files**: choose `scratchdracor.js` from your computer (for example after
     downloading this repository as a ZIP file).
   - **Text**: paste the content of `scratchdracor.js`.
5. Leave **Run extension without sandbox** unticked and click **Load**.
6. A new red category **DraCor** appears in the block palette.

If the file is hosted on the web, a link can open TurboWarp with the extension
already loaded, using TurboWarp's `extension` URL parameter:

```
https://turbowarp.org/editor?extension=https://dracor-org.github.io/scratchdracor/scratchdracor.js
```


### Sandboxed or unsandboxed?

Sandboxed extensions run in an isolated frame and may only fetch data from
websites that allow it (CORS). The DraCor API does allow it, so sandboxed
mode is enough and is the safer choice. The extension also works unsandboxed;
TurboWarp may then ask you once whether the project may connect to
`dracor.org`.

## Blocks

All blocks are reporters (round blocks). They wait until DraCor has answered,
so a script pauses for a moment the first time it asks for something.
Answers are kept in memory for the rest of the session, so asking again is
instant. Reload the page to clear this cache.

Plays are named by **corpus name** and **play name**, as in the DraCor API,
for example `ger` and `lessing-emilia-galotti`. You find these names in the
web address of a play on dracor.org
(<https://dracor.org/ger/lessing-emilia-galotti>). Play names are unique only
within a corpus: `seneca-medea` exists in `rom` and in `eng`. The **DraCor ID**
(e.g. `ger000088`) is unique across DraCor.

| Block | Example answer |
|---|---|
| **Corpora** | |
| `number of corpora` | `24` |
| `corpus names separated by [, ]` | `als, am, ar, bash, …` |
| `corpus name number (1)` | `als` |
| `title of corpus [ger]` | `German Drama Corpus` |
| `number of plays in corpus [ger]` | `788` |
| `play names in corpus [ger] separated by [, ]` | `anonym-der-deutsche-student, …` |
| `play name number (1) in corpus [ger]` | `anonym-der-deutsche-student` |
| **Plays** | |
| `title of play [ger] [lessing-emilia-galotti]` | `Emilia Galotti` |
| `authors of play [ger] [lessing-emilia-galotti]` | `Gotthold Ephraim Lessing` |
| `year of play [ger] [lessing-emilia-galotti]` | `1772` (DraCor's `yearNormalized`) |
| `DraCor ID of play [ger] [lessing-emilia-galotti]` | `ger000088` |
| `network (density ▾) of play [ger] [lessing-emilia-galotti]` | `0.3717948717948718` |
| `spoken text of play [ger] [lessing-emilia-galotti] by (all ▾) characters, first (500) letters` | `Wer sprengte da in den Hof? …` |
| **Characters** | |
| `number of characters of play [ger] [lessing-emilia-galotti]` | `13` |
| `character names of play [ger] [lessing-emilia-galotti] separated by [, ]` | `Der Prinz, Der Kammerdiener, …` |
| `character name number (1) of play [ger] [lessing-emilia-galotti]` | `Der Prinz` |
| `number of words spoken by [Emilia] in play [ger] [lessing-emilia-galotti]` | `1702` |
| **DraCor IDs** | |
| `corpus of DraCor ID [ger000088]` | `ger` |
| `play name of DraCor ID [ger000088]` | `lessing-emilia-galotti` |
| `last DraCor error` | `HTTP 404 for https://dracor.org/api/v1/…` |

Example answers are from November 2026; DraCor keeps growing, so counts can
change.

Notes on some blocks:

- **Lists.** Scratch cannot turn a text into a list by itself, and a sandboxed
  extension cannot write into Scratch lists. So every list comes in two
  forms: as one text with a separator of your choice (handy for `say`), and as
  a `… number (n)` block that you can use in a loop to fill a Scratch list
  (see the example below). Counting starts at 1, as in Scratch lists. The
  order is the order in which the API sends the items.
- **network (…)** offers the play-level metrics of the API endpoint
  `/metrics`: `density`, `diameter`, `averageDegree`, `averageClustering`,
  `averagePathLength`, `maxDegree`, `numEdges`, `numConnectedComponents`,
  `size` (number of nodes) and `wikipediaLinkCount`.
- **spoken text** returns what the characters say, without stage directions
  and speaker names. Choose `all`, `female`, `male` or `unknown` (the
  characters' sex as encoded in the play). The text is cut after the given
  number of letters; `0` gives the whole text, which can be very long.
- **number of words spoken by […]** accepts the character's name as shown by
  `character names …` (e.g. `Emilia`) or its ID in the play (e.g.
  `der_prinz`), in upper or lower case.
- **Errors.** If something is not found (a typo in a corpus or play name, an
  unknown ID) or the network is down, a block answers with an empty text
  instead of stopping your project. `last DraCor error` tells you what went
  wrong.

## Example: who talks most in Emilia Galotti?

Described in words, as you would build it from blocks:

1. Make a list `characters` and the variables `i`, `best` and `most words`.
2. When the green flag is clicked: delete all of `characters`, set `i` to 1,
   set `most words` to 0.
3. Repeat `number of characters of play [ger] [lessing-emilia-galotti]` times:
   - add `character name number (i) of play [ger] [lessing-emilia-galotti]` to
     `characters`;
   - if `number of words spoken by (item i of characters) in play [ger]
     [lessing-emilia-galotti]` is greater than `most words`, set `most words`
     to it and `best` to `item i of characters`;
   - change `i` by 1.
4. Say `join best (join " speaks most: " (join most words " words"))`.

The sprite says *"Marinelli speaks most: 4343 words"*. Only one request to
DraCor is needed for the whole loop, because the extension remembers the
answer. Then try the same for another play, or compare Emilia (1702 words)
with Orsina (2111 words).

More ideas: let the cat say the first 200 letters spoken by women; draw a bar
for each play of a corpus with its network density; turn a DraCor ID typed by
the user (with `ask and wait`) into title and author.

## Limitations

- Runs in TurboWarp (and projects packaged with the TurboWarp Packager), not
  on scratch.mit.edu.
- Needs an internet connection; answers come from the live API at
  `https://dracor.org/api/v1`.
- In sandboxed mode, every block takes at least one frame, even when the answer
  is cached, so loops over hundreds of plays are slow.
- Only a selection of the API is covered: no TEI, no co-presence networks as
  edges, no character relations, no stage directions, no corpus metadata
  tables. For research, use PyDraCor, rdracor or the API directly.
- The extension uses only GET requests. Please be gentle with the DraCor
  server: avoid loops that ask for spoken text of hundreds of plays.
- The cache lives in memory until the page is reloaded; changes on
  dracor.org are not seen before that.
- The extension has been tested headlessly with Node.js (see below), not yet
  by clicking through the TurboWarp editor in every browser.

## Tests

The tests load `scratchdracor.js` in Node.js (version 18 or newer, no
dependencies) with a minimal stand-in for TurboWarp's `Scratch` object, call
the blocks against dracor.org and check known values (e.g. `ger000088` is
`ger` / `lessing-emilia-galotti`, Emilia Galotti has 13 characters,
`seneca-medea` has different IDs in `rom` and `eng`, unknown plays give an
empty text). They need about 15 GET requests.

```sh
node tests/test.js
```

To try the extension in a real browser, load `scratchdracor.js` via **Files**
as described above, click on a few blocks in the palette (a click on a
reporter shows its answer in a bubble) and build the example script.

## Licence

MIT, see [LICENSE](LICENSE). Copyright (c) 2026 dracor.org.

If you use scratchDraCor in teaching or research, please cite it using
[CITATION.cff](CITATION.cff).
