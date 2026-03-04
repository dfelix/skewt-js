/** @type {number} Skew angle in degrees */
export const SKEW_ANGLE = 55;

/** @type {number} Base pressure in millibars */
export const BASE_PRESSURE = 1050;

/** @type {number} Top pressure in millibars */
export const TOP_PRESSURE = 100;

/** @type {number[]} Labeled pressure lines */
export const PRESSURE_LINES = [1000, 850, 700, 500, 300, 200, 100];

/** @type {number[]} Tick-only pressure lines */
export const PRESSURE_TICKS = [950, 900, 800, 750, 650, 600, 550, 450, 400, 350, 250, 150];

/** @type {number} Wind barb stem length in px */
export const BARB_SIZE = 25;

/** @type {number} Degrees-to-radians conversion factor */
export const DEG2RAD = Math.PI / 180;

/** @type {number} Tangent of the skew angle */
export const TAN = Math.tan(SKEW_ANGLE * DEG2RAD);

/** @type {number} Sentinel value for missing temperature data */
export const MISSING_TEMP = -1000;

/** @type {number} Kelvin offset */
export const KELVIN = 273.15;

/** @type {number} Poisson exponent for dry adiabats */
export const POISSON = 0.286;

/** @type {{top: number, right: number, bottom: number, left: number}} Default margins */
export const DEFAULT_MARGIN = Object.freeze({ top: 30, right: 40, bottom: 20, left: 35 });

/** @type {[number, number]} Temperature domain in °C */
export const TEMP_DOMAIN = [-45, 50];
