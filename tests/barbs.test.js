import { describe, it, expect, beforeEach } from 'vitest';
import { select } from 'd3-selection';
import { makeBarbTemplates } from '../src/barbs.js';
import { BARB_SIZE } from '../src/constants.js';

describe('makeBarbTemplates', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = '<svg><g id="c"></g></svg>';
    container = select('#c');
  });

  it('creates a <defs> element', () => {
    makeBarbTemplates(container, 'test-barb');
    const defs = container.select('defs');
    expect(defs.empty()).toBe(false);
  });

  it('creates 20 barb templates (5 to 100 in steps of 5)', () => {
    makeBarbTemplates(container, 'test-barb');
    const groups = container.selectAll('defs g');
    expect(groups.size()).toBe(20);
  });

  it('assigns instance-prefixed IDs to each barb', () => {
    makeBarbTemplates(container, 'myprefix');
    expect(container.select('#myprefix5').empty()).toBe(false);
    expect(container.select('#myprefix50').empty()).toBe(false);
    expect(container.select('#myprefix100').empty()).toBe(false);
  });

  it('each barb has a stem line', () => {
    makeBarbTemplates(container, 'b');
    const barb25 = container.select('#b25');
    const stem = barb25.select('line');
    expect(stem.empty()).toBe(false);
    expect(+stem.attr('y2')).toBe(BARB_SIZE);
  });

  it('5 kt barb has 1 half-pennant only', () => {
    makeBarbTemplates(container, 'b');
    const barb5 = container.select('#b5');
    // stem (1 line) + half-pennant (1 line) = 2 lines, 0 polylines
    expect(barb5.selectAll('line').size()).toBe(2);
    expect(barb5.selectAll('polyline').size()).toBe(0);
  });

  it('50 kt barb has 1 flag', () => {
    makeBarbTemplates(container, 'b');
    const barb50 = container.select('#b50');
    expect(barb50.selectAll('polyline.skewt-flag').size()).toBe(1);
  });

  it('100 kt barb has 2 flags', () => {
    makeBarbTemplates(container, 'b');
    const barb100 = container.select('#b100');
    expect(barb100.selectAll('polyline.skewt-flag').size()).toBe(2);
  });

  it('25 kt barb has 2 pennants and 1 half-pennant', () => {
    makeBarbTemplates(container, 'b');
    const barb25 = container.select('#b25');
    // stem (1) + 2 pennant lines + 1 half-pennant line = 4 lines total
    expect(barb25.selectAll('line').size()).toBe(4);
    expect(barb25.selectAll('polyline').size()).toBe(0);
  });
});
