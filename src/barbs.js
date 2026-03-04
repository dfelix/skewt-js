import { range } from 'd3-array';
import { BARB_SIZE } from './constants.js';

/**
 * Create SVG <defs> with wind barb templates for speeds 5–100 kt in 5 kt increments.
 * @param {import('d3-selection').Selection} container - Parent <g> to append <defs> into
 * @param {string} prefix - Instance-unique prefix for barb IDs (e.g. "barb5-abc123")
 */
export function makeBarbTemplates(container, prefix) {
  const speeds = range(5, 105, 5);
  const barbdef = container.append('defs');

  for (const speed of speeds) {
    const thisbarb = barbdef.append('g').attr('id', `${prefix}${speed}`);
    const flags = Math.floor(speed / 50);
    const pennants = Math.floor((speed - flags * 50) / 10);
    const halfpennants = Math.floor((speed - flags * 50 - pennants * 10) / 5);
    let px = BARB_SIZE;

    // Stem
    thisbarb
      .append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', BARB_SIZE);

    // Flags (50 kt each)
    for (let i = 0; i < flags; i++) {
      thisbarb
        .append('polyline')
        .attr('points', `0,${px} -10,${px} 0,${px - 4}`)
        .attr('class', 'skewt-flag');
      px -= 7;
    }

    // Pennants (10 kt each)
    for (let i = 0; i < pennants; i++) {
      thisbarb
        .append('line')
        .attr('x1', 0)
        .attr('x2', -10)
        .attr('y1', px)
        .attr('y2', px + 4);
      px -= 3;
    }

    // Half-pennants (5 kt each)
    for (let i = 0; i < halfpennants; i++) {
      thisbarb
        .append('line')
        .attr('x1', 0)
        .attr('x2', -5)
        .attr('y1', px)
        .attr('y2', px + 2);
      px -= 3;
    }
  }
}
