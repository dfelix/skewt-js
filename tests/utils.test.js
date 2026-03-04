import { describe, it, expect } from 'vitest';
import { convert } from '../src/utils.js';

describe('convert', () => {
  it('converts m/s to knots', () => {
    expect(convert(1, 'kt')).toBeCloseTo(1.9438, 3);
  });

  it('converts m/s to km/h', () => {
    expect(convert(1, 'kmh')).toBeCloseTo(3.6, 1);
  });

  it('returns m/s for unknown unit', () => {
    expect(convert(10, 'ms')).toBe(10);
  });

  it('handles zero', () => {
    expect(convert(0, 'kt')).toBe(0);
    expect(convert(0, 'kmh')).toBe(0);
  });

  it('handles negative values', () => {
    expect(convert(-5, 'kt')).toBeCloseTo(-9.719, 2);
  });

  it('scales linearly', () => {
    const single = convert(1, 'kt');
    const double = convert(2, 'kt');
    expect(double).toBeCloseTo(single * 2, 10);
  });
});
