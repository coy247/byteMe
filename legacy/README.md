# Legacy JavaScript implementation

This directory preserves the Node.js implementation that shipped in
**ByteMe v0.1.0** (tag `v0.1.0`). It is kept for reference and to keep
the v0.1.0 release reproducible without time travel.

**The canonical implementation moving forward is Rust** — see the project
root (`Cargo.toml`, `src/`) and `CHANGELOG.md` for the v0.2.0 rewrite.

## Running the legacy code

```bash
cd legacy
npm install
npm start "01001000 01101001"   # analyze a binary string
npm run intro                    # AOL-era retro intro
npm test                         # mocha suite (8 passing)
```

## Why it's still here

- `v0.1.0` was tagged against this code. Deleting it would break the
  promise the tag makes about what's reachable.
- The retro intro (`src/intro.js`) is the canonical source for the
  ASCII banner, retro-app gags, and Matrix-rain choreography that the
  Rust port reproduces. The JS file is the design reference.
- Tests in `tests/binaryModel.test.js` document the *behavior contract*
  (e.g. all-ones returns `Infinity` ratio) the Rust port honors.

## What's NOT here

The eight historical snapshot branches (`archive/intro`,
`archive/patterns`, ...) are not in `legacy/`. They live at branch level
in this repository for git-archaeology purposes.
