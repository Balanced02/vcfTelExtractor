# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-07-14

Full rewrite in TypeScript with a spec-compliant vCard parser. This is a major
release with breaking changes — see **Migrating from 1.x** below.

### Added
- Direct parsing of raw vCard **string** content via both `extractTel(string)`
  and the new synchronous, browser-safe `parseVcard(string, options?)` export.
- **Isomorphic** support: a dedicated browser entry point (`dist/browser`) that
  never touches `fs`, plus a Node entry point that reads files or strings.
- **Dual package**: ESM (`import`) and CommonJS (`require()`) with generated
  type declarations (`.d.ts`).
- RFC 6350 **line unfolding**, **unescaping** (`\n`, `\,`, `\;`, `\\`), and
  correct colon handling so values containing `:` (e.g. URLs) parse intact.
- Optional **phone-number normalization** to E.164 via `libphonenumber-js`
  (`normalize: true`, with an optional `countryCode`), plus a custom
  `normalize` callback.
- **Multi-value fields**: repeated properties collect into arrays by default
  (`multiValueMode: 'array'`), or keep only the last value (`'last'`).
- Custom key **`mappings`** to rename/extend the default field mapping.
- Opt-in property **parameters** metadata via `params: true`
  (e.g. `TEL;TYPE=CELL` → `params: { number: [{ TYPE: ['CELL'] }] }`).

### Changed
- **BREAKING**: minimum supported Node.js is now `>=18.0.0`.
- **BREAKING**: `onlyNumbers` now derives numbers from parsed `TEL` fields
  (structured) instead of a whole-file regex scan; output strings are stripped
  of spaces/hyphens.
- Package entry points now resolve to compiled output in `dist/`.

### Fixed
- Correct single-pass unescaping (no double-processing of `\\`).

### Migrating from 1.x
- Requires Node.js 18+.
- Default output for repeated fields is now an **array**; pass
  `multiValueMode: 'last'` to restore 1.x single-value behaviour.
- `extractTel` still accepts a file path in Node, but now also accepts raw
  vCard string content.

## [1.0.0] - 2023-09-30

- Initial published release: extract telephone numbers and selected fields
  from a vCard file path.

[2.0.0]: https://github.com/Balanced02/vcfTelExtractor/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/Balanced02/vcfTelExtractor/releases/tag/v1.0.0
