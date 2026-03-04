import { range } from 'd3-array';
import { line } from 'd3-shape';
import {
  BASE_PRESSURE,
  TOP_PRESSURE,
  PRESSURE_LINES,
  TAN,
  KELVIN,
  POISSON,
} from './constants.js';

/**
 * Draw the skew-T background grid: clipping path, isotherms, isobars, dry adiabats, and axes.
 * @param {import('d3-selection').Selection} skewtbg - Background <g> element
 * @param {import('./scales.js').Scales} scales
 * @param {string} clipId - Unique clip-path ID for this instance
 */
export function drawBackground(skewtbg, scales, clipId) {
  const { w, h, x, y, xAxis, yAxis, yAxis2 } = scales;
  const clipUrl = `url(#${clipId})`;

  // Clipping path
  skewtbg
    .append('clipPath')
    .attr('id', clipId)
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', w)
    .attr('height', h);

  // Skewed temperature lines (isotherms)
  skewtbg
    .selectAll('.templine')
    .data(range(-100, 45, 10))
    .enter()
    .append('line')
    .attr('x1', (d) => x(d) - 0.5 + (y(BASE_PRESSURE) - y(100)) / TAN)
    .attr('x2', (d) => x(d) - 0.5)
    .attr('y1', 0)
    .attr('y2', h)
    .attr('class', (d) => (d === 0 ? 'skewt-tempzero' : 'skewt-gridline'))
    .attr('clip-path', clipUrl);

  // Logarithmic pressure lines (isobars)
  skewtbg
    .selectAll('.pressureline')
    .data(PRESSURE_LINES)
    .enter()
    .append('line')
    .attr('x1', 0)
    .attr('x2', w)
    .attr('y1', (d) => y(d))
    .attr('y2', (d) => y(d))
    .attr('class', 'skewt-gridline');

  // Dry adiabats
  const pp = range(TOP_PRESSURE, BASE_PRESSURE + 1, 10);
  const dryad = range(-30, 240, 20);
  const all = dryad.map((theta) => pp.map(() => theta));

  /** @type {import('d3-shape').Line<number>} */
  const dryline = /** @type {any} */ (line())
    .x((/** @type {number} */ d, /** @type {number} */ i) => {
      const tempK = (KELVIN + d) / Math.pow(1000 / pp[i], POISSON) - KELVIN;
      return x(tempK) + (y(BASE_PRESSURE) - y(pp[i])) / TAN;
    })
    .y((/** @type {number} */ _d, /** @type {number} */ i) => y(pp[i]));

  skewtbg
    .selectAll('.dryadiabatline')
    .data(all)
    .enter()
    .append('path')
    .attr('class', 'skewt-gridline')
    .attr('clip-path', clipUrl)
    .attr('d', /** @type {any} */ (dryline));

  // Right edge line
  skewtbg
    .append('line')
    .attr('x1', w - 0.5)
    .attr('x2', w - 0.5)
    .attr('y1', 0)
    .attr('y2', h)
    .attr('class', 'skewt-gridline');

  // Axes
  skewtbg
    .append('g')
    .attr('class', 'skewt-axis skewt-x')
    .attr('transform', `translate(0,${h - 0.5})`)
    .call(/** @type {any} */ (xAxis));

  skewtbg
    .append('g')
    .attr('class', 'skewt-axis skewt-y')
    .attr('transform', 'translate(-0.5,0)')
    .call(/** @type {any} */ (yAxis));

  skewtbg
    .append('g')
    .attr('class', 'skewt-axis skewt-y skewt-ticks')
    .attr('transform', 'translate(-0.5,0)')
    .call(/** @type {any} */ (yAxis2));
}
