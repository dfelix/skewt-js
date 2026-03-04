# skewt

Interactive Skew-T Log-P diagram for atmospheric sounding data, built with D3.js.

[![npm version](https://img.shields.io/npm/v/skewt.svg)](https://www.npmjs.com/package/skewt)
[![license](https://img.shields.io/npm/l/skewt.svg)](./LICENSE)

## Install

```bash
npm install skewt
```

## Quick Start

### ES Modules

```js
import { SkewT } from 'skewt';
import 'skewt/style.css';

const chart = new SkewT('#diagram');
chart.plot(soundingData);
```

### CommonJS

```js
const { SkewT } = require('skewt');
```

### Script Tag (CDN)

```html
<link rel="stylesheet" href="https://unpkg.com/skewt/dist/skewt.css" />
<script src="https://unpkg.com/skewt/dist/index.iife.js"></script>
<script>
  var chart = new skewt.SkewT('#diagram');
  chart.plot(soundingData);
</script>
```

## Data Format

Input data follows the GSD Sounding Format. Each object in the array represents one pressure level:

```js
const sounding = [
  {
    press: 1000.0, // pressure in millibars (hPa)
    hght: 173.0,   // height in meters
    temp: 14.1,    // temperature in °C
    dwpt: 6.5,     // dew point in °C
    wdir: 8.0,     // wind direction in degrees
    wspd: 6.173,   // wind speed in m/s
  },
  {
    press: 975.0,
    hght: 386.0,
    temp: 12.1,
    dwpt: 5.6,
    wdir: 10.0,
    wspd: 7.716,
  },
  // ...
];
```

All wind speeds must be provided in **meters per second** (m/s). The `unit` option controls the display unit only.

## API

### `new SkewT(selector, options?)`

Creates a new Skew-T diagram inside the given container.

| Parameter | Type | Description |
|-----------|------|-------------|
| `selector` | `string \| Element` | CSS selector or DOM element for the container |
| `options` | `object` | Optional configuration (see below) |

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `unit` | `'kt' \| 'kmh' \| 'ms'` | `'kt'` | Wind speed display unit |
| `margin` | `{ top, right, bottom, left }` | `{ top: 30, right: 40, bottom: 20, left: 35 }` | Chart margins in pixels |

```js
const chart = new SkewT('#diagram', {
  unit: 'kmh',
  margin: { top: 30, right: 50, bottom: 20, left: 40 },
});
```

### `chart.plot(data)`

Plot sounding data onto the diagram. Draws temperature line, dew point line, and wind barbs.

```js
chart.plot(soundingData);
```

### `chart.clear()`

Clear plotted data (lines, barbs, tooltips) while keeping the background grid.

### `chart.destroy()`

Remove the diagram from the DOM and release all resources (ResizeObserver, SVG elements).

### `convert(value, unit)`

Utility function to convert wind speed from m/s.

```js
import { convert } from 'skewt';

convert(10, 'kt');  // 19.4384
convert(10, 'kmh'); // 36
convert(10, 'ms');  // 10
```

## Theming

The diagram uses CSS custom properties for easy theming. Override them on the `.skewt-container` element:

```css
.skewt-container {
  --skewt-temp-color: #e74c3c;
  --skewt-dwpt-color: #2ecc71;
  --skewt-grid-color: #ddd;
  --skewt-zero-color: #aaa;
  --skewt-axis-color: #333;
  --skewt-barb-color: #333;
  --skewt-font-size: 11px;
  --skewt-tooltip-font-size: 10px;
}
```

## Features

- Responsive — automatically redraws on container resize
- Multiple instances — each diagram has isolated SVG IDs
- Interactive tooltips — hover to see temperature, dew point, height, and wind speed
- Wind barbs — standard meteorological barbs (5–100 kt)
- Themeable — CSS custom properties for all colors and sizes
- Tree-shakeable — modular D3.js v7 imports
- Typed — ships TypeScript declarations (`.d.ts`)
- Dual format — ESM and CommonJS builds

## Browser Support

Requires a browser with ES2022 support (private class fields). All modern browsers are supported.

## License

[MIT](./LICENSE)
