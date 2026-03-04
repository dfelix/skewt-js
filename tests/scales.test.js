import { describe, it, expect } from 'vitest';
import { createScales } from '../src/scales.js';
import { DEFAULT_MARGIN, BASE_PRESSURE, TOP_PRESSURE } from '../src/constants.js';

describe('createScales', () => {
  const width = 500;
  const scales = createScales(width, DEFAULT_MARGIN);

  it('computes inner dimensions from width and margin', () => {
    expect(scales.w).toBe(width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right);
    expect(scales.h).toBe(width - DEFAULT_MARGIN.top - DEFAULT_MARGIN.bottom);
  });

  it('x scale maps temperature domain to pixel range', () => {
    expect(scales.x(-45)).toBe(0);
    expect(scales.x(50)).toBe(scales.w);
  });

  it('y scale maps pressure domain logarithmically', () => {
    expect(scales.y(TOP_PRESSURE)).toBe(0);
    expect(scales.y(BASE_PRESSURE)).toBe(scales.h);
  });

  it('y scale is monotonically increasing for increasing pressure', () => {
    const y200 = scales.y(200);
    const y500 = scales.y(500);
    const y1000 = scales.y(1000);
    expect(y200).toBeLessThan(y500);
    expect(y500).toBeLessThan(y1000);
  });

  it('returns axis generators', () => {
    expect(typeof scales.xAxis).toBe('function');
    expect(typeof scales.yAxis).toBe('function');
    expect(typeof scales.yAxis2).toBe('function');
  });

  it('works with custom margins', () => {
    const custom = { top: 10, right: 10, bottom: 10, left: 10 };
    const s = createScales(400, custom);
    expect(s.w).toBe(380);
    expect(s.h).toBe(380);
  });
});
