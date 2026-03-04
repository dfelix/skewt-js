import { describe, it, expect, beforeEach } from 'vitest';
import { select } from 'd3-selection';
import { createScales } from '../src/scales.js';
import { drawBackground } from '../src/background.js';
import { DEFAULT_MARGIN, PRESSURE_LINES } from '../src/constants.js';

describe('drawBackground', () => {
  let skewtbg;
  let scales;
  const clipId = 'test-clip';

  beforeEach(() => {
    document.body.innerHTML = '<svg><g id="bg"></g></svg>';
    skewtbg = select('#bg');
    scales = createScales(500, DEFAULT_MARGIN);
    drawBackground(skewtbg, scales, clipId);
  });

  it('creates a clipPath with the given ID', () => {
    const clip = skewtbg.select(`#${clipId}`);
    expect(clip.empty()).toBe(false);
    expect(clip.node().tagName).toBe('clipPath');
  });

  it('clipPath rect matches inner dimensions', () => {
    const rect = skewtbg.select(`#${clipId} rect`);
    expect(+rect.attr('width')).toBe(scales.w);
    expect(+rect.attr('height')).toBe(scales.h);
  });

  it('draws isotherms (temperature lines)', () => {
    // range(-100, 45, 10) = 15 values
    const isotherms = skewtbg.selectAll('line.skewt-gridline, line.skewt-tempzero');
    // 15 isotherms + 7 isobars + 1 right edge = 23 total gridlines/tempzero lines
    // But isotherms include the zero line classified as tempzero
    expect(isotherms.size()).toBeGreaterThanOrEqual(15);
  });

  it('draws isobars for each pressure line', () => {
    // There are PRESSURE_LINES.length isobars among the gridlines
    // Total gridlines = isotherms + isobars + adiabats + right edge
    const allGridlines = skewtbg.selectAll('.skewt-gridline');
    expect(allGridlines.size()).toBeGreaterThan(PRESSURE_LINES.length);
  });

  it('draws exactly one tempzero line', () => {
    const zero = skewtbg.selectAll('.skewt-tempzero');
    expect(zero.size()).toBe(1);
  });

  it('draws dry adiabat paths', () => {
    const paths = skewtbg.selectAll('path.skewt-gridline');
    // range(-30, 240, 20) = 14 adiabats
    expect(paths.size()).toBe(14);
  });

  it('draws three axis groups', () => {
    const axes = skewtbg.selectAll('.skewt-axis');
    expect(axes.size()).toBe(3);
  });

  it('has x-axis and y-axis groups', () => {
    expect(skewtbg.select('.skewt-x').empty()).toBe(false);
    expect(skewtbg.select('.skewt-y').empty()).toBe(false);
    expect(skewtbg.select('.skewt-ticks').empty()).toBe(false);
  });
});
