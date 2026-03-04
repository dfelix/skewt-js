import { scaleLinear, scaleLog } from 'd3-scale';
import { axisBottom, axisLeft, axisRight } from 'd3-axis';
import { format } from 'd3-format';
import {
  BASE_PRESSURE,
  TOP_PRESSURE,
  PRESSURE_LINES,
  PRESSURE_TICKS,
  TEMP_DOMAIN,
} from './constants.js';

/**
 * @typedef {Object} Scales
 * @property {number} w - Inner width (minus margins)
 * @property {number} h - Inner height (minus margins)
 * @property {import('d3-scale').ScaleLinear<number,number>} x - Temperature scale
 * @property {import('d3-scale').ScaleLogarithmic<number,number>} y - Pressure scale
 * @property {Function} xAxis
 * @property {Function} yAxis
 * @property {Function} yAxis2
 */

/**
 * Create D3 scales and axes for a given container size.
 * @param {number} width - Container width in px
 * @param {{top:number, right:number, bottom:number, left:number}} margin
 * @returns {Scales}
 */
export function createScales(width, margin) {
  const w = width - margin.left - margin.right;
  const h = width - margin.top - margin.bottom;

  const x = scaleLinear().range([0, w]).domain(TEMP_DOMAIN);
  const y = scaleLog().range([0, h]).domain([TOP_PRESSURE, BASE_PRESSURE]);

  const xAxis = axisBottom(x).tickSize(0).ticks(10);
  const yAxis = axisLeft(y).tickSize(0).tickValues(PRESSURE_LINES).tickFormat(format('.0f'));
  const yAxis2 = axisRight(y).tickSize(5).tickValues(PRESSURE_TICKS).tickFormat(() => '');

  return { w, h, x, y, xAxis, yAxis, yAxis2 };
}
