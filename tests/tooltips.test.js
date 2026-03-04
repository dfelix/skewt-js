import { describe, it, expect, beforeEach } from 'vitest';
import { select } from 'd3-selection';
import { createScales } from '../src/scales.js';
import { drawToolTips } from '../src/tooltips.js';
import { DEFAULT_MARGIN } from '../src/constants.js';
import sounding from './fixtures/sounding.json';

describe('drawToolTips', () => {
  let skewtgroup;
  let container;
  let scales;

  beforeEach(() => {
    document.body.innerHTML = '<svg><g id="container"><g id="skewt"></g></g></svg>';
    container = select('#container');
    skewtgroup = select('#skewt');
    scales = createScales(500, DEFAULT_MARGIN);
  });

  it('creates 4 focus groups', () => {
    drawToolTips(skewtgroup, container, scales, sounding, 'kt');
    const focusGroups = skewtgroup.selectAll('.skewt-focus');
    expect(focusGroups.size()).toBe(4);
  });

  it('creates an overlay rect', () => {
    drawToolTips(skewtgroup, container, scales, sounding, 'kt');
    const overlay = container.select('.skewt-overlay');
    expect(overlay.empty()).toBe(false);
    expect(+overlay.attr('width')).toBe(scales.w);
  });

  it('does NOT mutate the input array', () => {
    const original = sounding.map((d) => ({ ...d }));
    drawToolTips(skewtgroup, container, scales, sounding, 'kt');
    expect(sounding).toEqual(original);
  });

  it('focus groups start hidden', () => {
    drawToolTips(skewtgroup, container, scales, sounding, 'kt');
    skewtgroup.selectAll('.skewt-focus').each(function () {
      expect(select(this).style('display')).toBe('none');
    });
  });

  it('tmpc and dwpc focus groups have circles', () => {
    drawToolTips(skewtgroup, container, scales, sounding, 'kt');
    expect(skewtgroup.select('.skewt-tmpc circle').empty()).toBe(false);
    expect(skewtgroup.select('.skewt-dwpc circle').empty()).toBe(false);
  });

  it('mouseover shows focus groups', () => {
    drawToolTips(skewtgroup, container, scales, sounding, 'kt');
    const overlay = container.select('.skewt-overlay').node();
    overlay.dispatchEvent(new Event('mouseover'));
    skewtgroup.selectAll('.skewt-focus').each(function () {
      // display should be cleared (null → '' or removed)
      expect(select(this).style('display')).not.toBe('none');
    });
  });

  it('mouseout hides focus groups', () => {
    drawToolTips(skewtgroup, container, scales, sounding, 'kt');
    const overlay = container.select('.skewt-overlay').node();
    overlay.dispatchEvent(new Event('mouseover'));
    overlay.dispatchEvent(new Event('mouseout'));
    skewtgroup.selectAll('.skewt-focus').each(function () {
      expect(select(this).style('display')).toBe('none');
    });
  });

  it('mousemove updates focus positions and text', () => {
    drawToolTips(skewtgroup, container, scales, sounding, 'kt');
    const overlay = container.select('.skewt-overlay').node();
    // Simulate a mousemove at a y position within the chart
    const midY = scales.h / 2;
    const event = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: midY,
    });
    // D3 pointer() uses event.clientX/Y relative to the target's bounding rect.
    // In jsdom, getBoundingClientRect returns zeros, so pointer returns [clientX, clientY].
    overlay.dispatchEvent(event);

    // The tmpc focus should now have a transform attribute set
    const tmpcTransform = skewtgroup.select('.skewt-tmpc').attr('transform');
    expect(tmpcTransform).toContain('translate');

    // Text should contain °C
    const tmpcText = skewtgroup.select('.skewt-tmpc text').text();
    expect(tmpcText).toContain('°C');

    // Wind speed text should contain 'kt'
    const wspdText = skewtgroup.select('.skewt-windspeed text').text();
    expect(wspdText).toContain('kt');
  });
});
