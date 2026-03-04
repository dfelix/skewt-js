# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-03-04

### Breaking Changes
- **ES module package** — now distributed as ESM + CJS via npm; no longer a global script
- **D3 v7** — migrated from D3 v3/v4 global bundle to modular D3 v7 subpackages
- **CSS class prefix** — all CSS classes now prefixed with `skewt-` (e.g. `templine` → `skewt-temp`)
- **Constructor** — now accepts `options` object instead of positional arguments
- **Wind speed input** — `wspd` must be in m/s; display unit controlled by `unit` option
- **ES2022 required** — uses private class fields (`#`); drops support for IE and legacy browsers

### Added
- `destroy()` method to fully remove the diagram and release resources
- `convert()` utility exported for wind speed unit conversion
- CSS custom properties for theming (`--skewt-temp-color`, `--skewt-dwpt-color`, etc.)
- TypeScript declarations (`.d.ts`) auto-generated from JSDoc
- ResizeObserver for per-instance responsive resize (replaces global `window.onresize`)
- Instance-scoped SVG IDs — multiple diagrams on the same page no longer conflict
- Interactive tooltips showing temperature, dew point, height, and wind speed on hover
- Comprehensive test suite (74 tests, 100% line coverage)

### Fixed
- Data mutation bug — `skewtline.reverse()` no longer mutates the input array
- Memory leak — tooltip overlay elements are properly cleaned up on re-plot
- Multi-instance ID collisions — clip paths and barb defs use unique per-instance prefixes

### Changed
- Source restructured into focused modules: `SkewT.js`, `background.js`, `barbs.js`, `tooltips.js`, `scales.js`, `constants.js`, `utils.js`
- Build tooling: tsup (bundler), vitest (tests), eslint 9 (linting), prettier (formatting)

## [1.0.0] - 2016-08-12

### Added
- Created examples
- Added tooltips

### Fixed
- SkewT chart is now responsive
- Small CSS fix

### Changed
- SkewT now uses CSS selector instead of DOM element
- Finished skew-T plot features

## [0.0.1] - 2015-10-06

### Added
- Created skew-T log-P background isobars, isotherms and dry adiabats
- Created scales and wind barbs
- Created temp and dew plots based on GFS-based array
