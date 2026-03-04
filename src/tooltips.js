import { bisector } from 'd3-array';
import { pointer } from 'd3-selection';
import { BASE_PRESSURE, TAN } from './constants.js';
import { convert } from './utils.js';

const bisectPress = bisector((d) => d.press).left;

/**
 * Create interactive tooltip overlay for a sounding line.
 *
 * @param {import('d3-selection').Selection} skewtgroup - Group containing skew-T data lines
 * @param {import('d3-selection').Selection} container - Parent container for the overlay rect
 * @param {import('./scales.js').Scales} scales
 * @param {Array<{press:number, hght:number, temp:number, dwpt:number, wdir:number, wspd:number}>} skewtline - Sounding data points (not mutated)
 * @param {'kt'|'kmh'|'ms'} unit - Display unit for wind speed
 */
export function drawToolTips(skewtgroup, container, scales, skewtline, unit) {
  const { w, x, y } = scales;

  // Copy + reverse so pressure is ascending for bisector (original is NOT mutated)
  const lines = [...skewtline].reverse();

  // Temperature focus
  const tmpcfocus = skewtgroup
    .append('g')
    .attr('class', 'skewt-focus skewt-tmpc')
    .style('display', 'none');
  tmpcfocus.append('circle').attr('r', 4);
  tmpcfocus.append('text').attr('x', 9).attr('dy', '.35em');

  // Dew point focus
  const dwpcfocus = skewtgroup
    .append('g')
    .attr('class', 'skewt-focus skewt-dwpc')
    .style('display', 'none');
  dwpcfocus.append('circle').attr('r', 4);
  dwpcfocus.append('text').attr('x', -9).attr('text-anchor', 'end').attr('dy', '.35em');

  // Height focus
  const hghtfocus = skewtgroup
    .append('g')
    .attr('class', 'skewt-focus')
    .style('display', 'none');
  hghtfocus.append('text').attr('x', 0).attr('text-anchor', 'start').attr('dy', '.35em');

  // Wind speed focus
  const wspdfocus = skewtgroup
    .append('g')
    .attr('class', 'skewt-focus skewt-windspeed')
    .style('display', 'none');
  wspdfocus.append('text').attr('x', 0).attr('text-anchor', 'start').attr('dy', '.35em');

  // Overlay rect for mouse events
  container
    .append('rect')
    .attr('class', 'skewt-overlay')
    .attr('width', w)
    .attr('height', scales.h)
    .on('mouseover', () => {
      tmpcfocus.style('display', null);
      dwpcfocus.style('display', null);
      hghtfocus.style('display', null);
      wspdfocus.style('display', null);
    })
    .on('mouseout', () => {
      tmpcfocus.style('display', 'none');
      dwpcfocus.style('display', 'none');
      hghtfocus.style('display', 'none');
      wspdfocus.style('display', 'none');
    })
    .on('mousemove', (event) => {
      const y0 = y.invert(pointer(event)[1]);
      const i = bisectPress(lines, y0, 1, lines.length - 1);
      const d0 = lines[i - 1];
      const d1 = lines[i];
      const d = y0 - d0.press > d1.press - y0 ? d1 : d0;

      const skew = (y(BASE_PRESSURE) - y(d.press)) / TAN;
      tmpcfocus.attr('transform', `translate(${x(d.temp) + skew},${y(d.press)})`);
      dwpcfocus.attr('transform', `translate(${x(d.dwpt) + skew},${y(d.press)})`);
      hghtfocus.attr('transform', `translate(0,${y(d.press)})`);
      wspdfocus.attr('transform', `translate(${w - 65},${y(d.press)})`);

      tmpcfocus.select('text').text(`${Math.round(d.temp)}°C`);
      dwpcfocus.select('text').text(`${Math.round(d.dwpt)}°C`);
      hghtfocus.select('text').text(`-- ${Math.round(d.hght)} m`);
      wspdfocus
        .select('text')
        .text(`${Math.round(convert(d.wspd, unit) * 10) / 10} ${unit}`);
    });
}
