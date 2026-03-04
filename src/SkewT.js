import { select } from 'd3-selection';
import { line } from 'd3-shape';
import { BASE_PRESSURE, TOP_PRESSURE, MISSING_TEMP, TAN, DEFAULT_MARGIN } from './constants.js';
import { convert } from './utils.js';
import { createScales } from './scales.js';
import { drawBackground } from './background.js';
import { makeBarbTemplates } from './barbs.js';
import { drawToolTips } from './tooltips.js';

let instanceCounter = 0;

/**
 * @typedef {Object} SoundingDatum
 * @property {number} press - Pressure in millibars
 * @property {number} hght  - Height in meters
 * @property {number} temp  - Temperature in °C
 * @property {number} dwpt  - Dew point in °C
 * @property {number} wdir  - Wind direction in degrees
 * @property {number} wspd  - Wind speed in m/s
 */

/**
 * @typedef {Object} SkewTOptions
 * @property {'kt'|'kmh'|'ms'} [unit='kt'] - Wind speed display unit
 * @property {{top:number, right:number, bottom:number, left:number}} [margin] - Chart margins
 */

/**
 * Interactive Skew-T Log-P diagram.
 *
 * @example
 * import { SkewT } from 'skewt';
 * const chart = new SkewT('#diagram');
 * chart.plot(soundingData);
 */
export class SkewT {
  /** @type {import('d3-selection').Selection} */
  #wrapper;
  /** @type {import('d3-selection').Selection} */
  #svg;
  /** @type {import('d3-selection').Selection} */
  #container;
  /** @type {import('d3-selection').Selection} */
  #skewtbg;
  /** @type {import('d3-selection').Selection} */
  #skewtgroup;
  /** @type {import('d3-selection').Selection} */
  #barbgroup;
  /** @type {import('./scales.js').Scales | null} */
  #scales = null;
  /** @type {SoundingDatum[]} */
  #data = [];
  /** @type {string} */
  #id;
  /** @type {string} */
  #clipId;
  /** @type {string} */
  #barbPrefix;
  /** @type {{top:number, right:number, bottom:number, left:number}} */
  #margin;
  /** @type {'kt'|'kmh'|'ms'} */
  #unit;
  /** @type {ResizeObserver | null} */
  #resizeObserver = null;

  /**
   * Create a new Skew-T diagram.
   * @param {string | Element} selector - CSS selector or DOM element for the container
   * @param {SkewTOptions} [options={}]
   */
  constructor(selector, options = {}) {
    // Validate selector
    if (typeof selector === 'string') {
      this.#wrapper = select(selector);
    } else if (selector instanceof Element) {
      this.#wrapper = select(selector);
    } else {
      throw new TypeError('SkewT: selector must be a CSS selector string or a DOM Element');
    }

    if (this.#wrapper.empty()) {
      throw new Error(`SkewT: no element found for selector "${selector}"`);
    }

    // Instance-scoped IDs
    this.#id = `skewt-${++instanceCounter}`;
    this.#clipId = `${this.#id}-clip`;
    this.#barbPrefix = `${this.#id}-barb`;

    // Merge options
    this.#margin = options.margin
      ? { ...DEFAULT_MARGIN, ...options.margin }
      : { ...DEFAULT_MARGIN };
    this.#unit = options.unit || 'kt';

    // Build SVG structure
    this.#svg = this.#wrapper.append('svg').attr('id', this.#id).attr('class', 'skewt-container');
    this.#container = this.#svg.append('g').attr('id', `${this.#id}-container`);
    this.#skewtbg = this.#container
      .append('g')
      .attr('id', `${this.#id}-bg`)
      .attr('class', 'skewt-bg');
    this.#skewtgroup = this.#container.append('g').attr('class', 'skewt-lines');
    this.#barbgroup = this.#container.append('g').attr('class', 'skewt-windbarb');

    // Initial render
    this.#render();

    // Observe container resizes (replaces window.onresize)
    this.#resizeObserver = new ResizeObserver(() => this.#render());
    this.#resizeObserver.observe(this.#wrapper.node());
  }

  /**
   * Plot sounding data onto the diagram.
   * @param {SoundingDatum[]} data - Array of sounding data points
   */
  plot(data) {
    if (!Array.isArray(data)) {
      throw new TypeError('SkewT.plot: data must be an array');
    }

    // Store an immutable copy
    this.#data = data.map((d) => ({ ...d }));

    this.#drawData();
  }

  /**
   * Clear the plotted data lines, wind barbs, and tooltips.
   */
  clear() {
    this.#data = [];
    this.#clearPlot();
  }

  /**
   * Fully remove the diagram from the DOM and release all resources.
   */
  destroy() {
    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }
    this.#svg.remove();
    this.#data = [];
    this.#scales = null;
  }

  // ---------------------------------------------------------------------------
  // Private methods
  // ---------------------------------------------------------------------------

  /** Recalculate scales and redraw everything. */
  #render() {
    const width = parseInt(this.#wrapper.style('width'), 10) - 10;

    this.#scales = createScales(width, this.#margin);
    const { w, h } = this.#scales;

    // Size the SVG
    this.#svg
      .attr('width', w + this.#margin.right + this.#margin.left)
      .attr('height', h + this.#margin.top + this.#margin.bottom);

    this.#container.attr(
      'transform',
      `translate(${this.#margin.left},${this.#margin.top})`,
    );

    // Clear and redraw background
    this.#skewtbg.selectAll('*').remove();
    drawBackground(this.#skewtbg, this.#scales, this.#clipId);

    // Recreate barb defs
    this.#container.selectAll('defs').remove();
    makeBarbTemplates(this.#container, this.#barbPrefix);

    // Re-plot data if we have any
    this.#drawData();
  }

  /** Draw data lines, wind barbs, and tooltips from this.#data. */
  #drawData() {
    this.#clearPlot();

    if (this.#data.length === 0 || !this.#scales) return;

    const { w, x, y } = this.#scales;
    const clipUrl = `url(#${this.#clipId})`;

    // Filter valid sounding points
    const skewtline = this.#data.filter(
      (d) => d.temp > MISSING_TEMP && d.dwpt > MISSING_TEMP,
    );

    if (skewtline.length === 0) return;

    // Temperature line
    /** @type {import('d3-shape').Line<SoundingDatum>} */
    const templine = /** @type {any} */ (line())
      .x((d) => x(d.temp) + (y(BASE_PRESSURE) - y(d.press)) / TAN)
      .y((d) => y(d.press));

    this.#skewtgroup
      .selectAll('.templines')
      .data([skewtline])
      .enter()
      .append('path')
      .attr('class', 'skewt-temp skewt-skline')
      .attr('clip-path', clipUrl)
      .attr('d', /** @type {any} */ (templine));

    // Dew point line
    /** @type {import('d3-shape').Line<SoundingDatum>} */
    const dewline = /** @type {any} */ (line())
      .x((d) => x(d.dwpt) + (y(BASE_PRESSURE) - y(d.press)) / TAN)
      .y((d) => y(d.press));

    this.#skewtgroup
      .selectAll('.tempdewlines')
      .data([skewtline])
      .enter()
      .append('path')
      .attr('class', 'skewt-dwpt skewt-skline')
      .attr('clip-path', clipUrl)
      .attr('d', /** @type {any} */ (dewline));

    // Wind barbs
    const barbs = skewtline.filter(
      (d) => d.wdir >= 0 && d.wspd >= 0 && d.press >= TOP_PRESSURE,
    );

    this.#barbgroup
      .selectAll('.barbs')
      .data(barbs)
      .enter()
      .append('use')
      .attr('href', (d) => {
        const kt = Math.round(convert(d.wspd, 'kt') / 5) * 5;
        return `#${this.#barbPrefix}${kt}`;
      })
      .attr(
        'transform',
        (d) => `translate(${w},${y(d.press)}) rotate(${d.wdir + 180})`,
      );

    // Tooltips
    drawToolTips(
      this.#skewtgroup,
      this.#container,
      this.#scales,
      skewtline,
      this.#unit,
    );
  }

  /** Remove data lines, barbs, tooltip focus elements, and overlay. */
  #clearPlot() {
    this.#skewtgroup.selectAll('path').remove();
    this.#skewtgroup.selectAll('.skewt-focus').remove();
    this.#barbgroup.selectAll('use').remove();
    this.#container.selectAll('.skewt-overlay').remove();
  }
}
