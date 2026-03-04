import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { select } from 'd3-selection';
import { SkewT } from '../src/index.js';
import sounding from './fixtures/sounding.json';

/**
 * jsdom doesn't compute layout, so `wrapper.style('width')` returns ''.
 * We set an explicit inline width so parseInt() in #render() works.
 */
function createContainer(id = 'diagram') {
  const div = document.createElement('div');
  div.id = id;
  div.style.width = '500px';
  document.body.appendChild(div);
  return div;
}

describe('SkewT', () => {
  let container;
  let chart;

  beforeEach(() => {
    document.body.innerHTML = '';
    container = createContainer();
  });

  afterEach(() => {
    if (chart) {
      try { chart.destroy(); } catch (_e) { /* already destroyed */ }
      chart = null;
    }
  });

  // ── Constructor ──

  describe('constructor', () => {
    it('creates an SVG inside the container', () => {
      chart = new SkewT('#diagram');
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg.classList.contains('skewt-container')).toBe(true);
    });

    it('accepts a DOM element instead of a selector', () => {
      chart = new SkewT(container);
      expect(container.querySelector('svg')).not.toBeNull();
    });

    it('throws on invalid selector type', () => {
      expect(() => new SkewT(42)).toThrow(TypeError);
    });

    it('throws on empty selector match', () => {
      expect(() => new SkewT('#nonexistent')).toThrow(/no element found/);
    });

    it('builds the full SVG group structure', () => {
      chart = new SkewT('#diagram');
      const svg = select(container).select('svg');
      expect(svg.select('.skewt-bg').empty()).toBe(false);
      expect(svg.select('.skewt-lines').empty()).toBe(false);
      expect(svg.select('.skewt-windbarb').empty()).toBe(false);
    });

    it('draws background on construction', () => {
      chart = new SkewT('#diagram');
      const svg = select(container).select('svg');
      // Background should have gridlines and axes
      expect(svg.selectAll('.skewt-gridline').size()).toBeGreaterThan(0);
      expect(svg.selectAll('.skewt-axis').size()).toBe(3);
    });

    it('creates barb defs on construction', () => {
      chart = new SkewT('#diagram');
      const svg = select(container).select('svg');
      expect(svg.select('defs').empty()).toBe(false);
      expect(svg.selectAll('defs g').size()).toBe(20);
    });
  });

  // ── plot() ──

  describe('plot', () => {
    it('draws temperature and dew point paths', () => {
      chart = new SkewT('#diagram');
      chart.plot(sounding);
      const svg = select(container).select('svg');
      expect(svg.select('.skewt-temp').empty()).toBe(false);
      expect(svg.select('.skewt-dwpt').empty()).toBe(false);
    });

    it('draws wind barb <use> elements', () => {
      chart = new SkewT('#diagram');
      chart.plot(sounding);
      const svg = select(container).select('svg');
      const barbs = svg.selectAll('.skewt-windbarb use');
      expect(barbs.size()).toBeGreaterThan(0);
    });

    it('creates tooltip focus groups', () => {
      chart = new SkewT('#diagram');
      chart.plot(sounding);
      const svg = select(container).select('svg');
      expect(svg.selectAll('.skewt-focus').size()).toBe(4);
    });

    it('creates an overlay rect', () => {
      chart = new SkewT('#diagram');
      chart.plot(sounding);
      const svg = select(container).select('svg');
      expect(svg.select('.skewt-overlay').empty()).toBe(false);
    });

    it('throws on non-array input', () => {
      chart = new SkewT('#diagram');
      expect(() => chart.plot('bad')).toThrow(TypeError);
      expect(() => chart.plot(null)).toThrow(TypeError);
    });

    it('handles empty array without error', () => {
      chart = new SkewT('#diagram');
      expect(() => chart.plot([])).not.toThrow();
      const svg = select(container).select('svg');
      expect(svg.select('.skewt-temp').empty()).toBe(true);
    });

    it('does NOT mutate the original data', () => {
      chart = new SkewT('#diagram');
      const original = sounding.map((d) => ({ ...d }));
      chart.plot(sounding);
      expect(sounding).toEqual(original);
    });

    it('replaces previous plot when called again', () => {
      chart = new SkewT('#diagram');
      chart.plot(sounding);
      chart.plot(sounding);
      const svg = select(container).select('svg');
      // Should still be exactly 1 temp path and 1 dwpt path
      expect(svg.selectAll('.skewt-temp').size()).toBe(1);
      expect(svg.selectAll('.skewt-dwpt').size()).toBe(1);
      // Should still be exactly 4 focus groups (not 8)
      expect(svg.selectAll('.skewt-focus').size()).toBe(4);
    });

    it('filters out data with missing temps', () => {
      chart = new SkewT('#diagram');
      const dataWithMissing = [
        ...sounding,
        { press: 500, hght: 5000, temp: -9999, dwpt: -9999, wdir: 0, wspd: 0 },
      ];
      chart.plot(dataWithMissing);
      // Should not crash and should still render
      const svg = select(container).select('svg');
      expect(svg.select('.skewt-temp').empty()).toBe(false);
    });
  });

  // ── clear() ──

  describe('clear', () => {
    it('removes data lines and barbs', () => {
      chart = new SkewT('#diagram');
      chart.plot(sounding);
      chart.clear();
      const svg = select(container).select('svg');
      expect(svg.select('.skewt-temp').empty()).toBe(true);
      expect(svg.select('.skewt-dwpt').empty()).toBe(true);
      expect(svg.selectAll('.skewt-windbarb use').size()).toBe(0);
    });

    it('removes tooltip elements', () => {
      chart = new SkewT('#diagram');
      chart.plot(sounding);
      chart.clear();
      const svg = select(container).select('svg');
      expect(svg.selectAll('.skewt-focus').size()).toBe(0);
      expect(svg.select('.skewt-overlay').empty()).toBe(true);
    });

    it('preserves background', () => {
      chart = new SkewT('#diagram');
      chart.plot(sounding);
      chart.clear();
      const svg = select(container).select('svg');
      expect(svg.selectAll('.skewt-gridline').size()).toBeGreaterThan(0);
      expect(svg.selectAll('.skewt-axis').size()).toBe(3);
    });
  });

  // ── destroy() ──

  describe('destroy', () => {
    it('removes the SVG from the DOM', () => {
      chart = new SkewT('#diagram');
      chart.destroy();
      expect(container.querySelector('svg')).toBeNull();
      chart = null; // prevent afterEach double-destroy
    });
  });

  // ── Multi-instance ──

  describe('multi-instance', () => {
    it('two instances have unique SVG IDs', () => {
      const div2 = createContainer('diagram2');
      chart = new SkewT('#diagram');
      const chart2 = new SkewT('#diagram2');

      const id1 = container.querySelector('svg').id;
      const id2 = div2.querySelector('svg').id;
      expect(id1).not.toBe(id2);

      chart2.destroy();
    });

    it('two instances have separate clip paths', () => {
      const div2 = createContainer('diagram2');
      chart = new SkewT('#diagram');
      const chart2 = new SkewT('#diagram2');

      const clips = document.querySelectorAll('clipPath');
      const ids = [...clips].map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length); // all unique

      chart2.destroy();
    });

    it('destroying one instance does not affect the other', () => {
      const div2 = createContainer('diagram2');
      chart = new SkewT('#diagram');
      const chart2 = new SkewT('#diagram2');

      chart2.destroy();
      expect(container.querySelector('svg')).not.toBeNull();
      expect(div2.querySelector('svg')).toBeNull();
    });
  });

  // ── Options ──

  describe('options', () => {
    it('defaults to knots unit', () => {
      chart = new SkewT('#diagram');
      // Indirectly test: plot data and check the windspeed tooltip focus exists
      chart.plot(sounding);
      const svg = select(container).select('svg');
      expect(svg.select('.skewt-windspeed').empty()).toBe(false);
    });

    it('accepts custom margin', () => {
      chart = new SkewT('#diagram', { margin: { top: 50 } });
      // Should not crash — SVG is created
      expect(container.querySelector('svg')).not.toBeNull();
    });
  });
});
