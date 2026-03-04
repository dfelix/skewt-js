/**
 * Convert wind speed from m/s to another unit.
 * @param {number} msValue - Wind speed in meters per second
 * @param {'kt'|'kmh'|'ms'} unit - Target unit
 * @returns {number} Converted wind speed
 */
export function convert(msValue, unit) {
  switch (unit) {
    case 'kt':
      return msValue * 1.943844492;
    case 'kmh':
      return msValue * 3.6;
    default:
      return msValue;
  }
}
