import { describe, it, expect } from 'vitest';
import {
  SKEW_ANGLE,
  BASE_PRESSURE,
  TOP_PRESSURE,
  PRESSURE_LINES,
  PRESSURE_TICKS,
  BARB_SIZE,
  DEG2RAD,
  TAN,
  MISSING_TEMP,
  KELVIN,
  POISSON,
  DEFAULT_MARGIN,
  TEMP_DOMAIN,
} from '../src/constants.js';

describe('constants', () => {
  it('SKEW_ANGLE is 55 degrees', () => {
    expect(SKEW_ANGLE).toBe(55);
  });

  it('pressure range is valid', () => {
    expect(BASE_PRESSURE).toBeGreaterThan(TOP_PRESSURE);
    expect(TOP_PRESSURE).toBe(100);
    expect(BASE_PRESSURE).toBe(1050);
  });

  it('PRESSURE_LINES are sorted descending', () => {
    for (let i = 1; i < PRESSURE_LINES.length; i++) {
      expect(PRESSURE_LINES[i]).toBeLessThan(PRESSURE_LINES[i - 1]);
    }
  });

  it('PRESSURE_TICKS do not overlap with PRESSURE_LINES', () => {
    const lineSet = new Set(PRESSURE_LINES);
    for (const tick of PRESSURE_TICKS) {
      expect(lineSet.has(tick)).toBe(false);
    }
  });

  it('BARB_SIZE is positive', () => {
    expect(BARB_SIZE).toBeGreaterThan(0);
  });

  it('DEG2RAD converts correctly', () => {
    expect(180 * DEG2RAD).toBeCloseTo(Math.PI, 10);
  });

  it('TAN matches tan(55°)', () => {
    expect(TAN).toBeCloseTo(Math.tan(55 * DEG2RAD), 10);
  });

  it('MISSING_TEMP is a large negative sentinel', () => {
    expect(MISSING_TEMP).toBeLessThan(-999);
  });

  it('KELVIN is 273.15', () => {
    expect(KELVIN).toBe(273.15);
  });

  it('POISSON is 0.286', () => {
    expect(POISSON).toBe(0.286);
  });

  it('DEFAULT_MARGIN is frozen', () => {
    expect(Object.isFrozen(DEFAULT_MARGIN)).toBe(true);
  });

  it('DEFAULT_MARGIN has all four sides', () => {
    expect(DEFAULT_MARGIN).toHaveProperty('top');
    expect(DEFAULT_MARGIN).toHaveProperty('right');
    expect(DEFAULT_MARGIN).toHaveProperty('bottom');
    expect(DEFAULT_MARGIN).toHaveProperty('left');
  });

  it('TEMP_DOMAIN has min < max', () => {
    expect(TEMP_DOMAIN[0]).toBeLessThan(TEMP_DOMAIN[1]);
  });
});
