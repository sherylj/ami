/**
 * @module helpers/pixelmap
 */
export default class PixelMap {
  constructor() {
    this._map = new Map();
    this._min = -99999.0;
    this._max = 99999.0;
    this._total = 0.0;
    this._raw = 0.0;
    this._mean = 0.0;
  }

  addPixel(pixel, value) {
    this._map.set(pixel, value);
  }

  getPixelValue(pixel) {
    return this._map.get(pixel);
  }

  getpixelmap() {
    return this._map;
  }

  calculateMinMax() {
    const keys = Array.from(this._map.keys());
    this._max = Math.max.apply(null, keys);
    this._min = Math.min.apply(null, keys);
    this._range = this._max - this._min;
    this._lowerBound = this._min;
    this._upperBound = this._max;
  }

  calculateTotalMean() {
    for (const [key, value] of this._map.entries()) {
      if (key >= this._lowerBound && key <= this._upperBound) {
        this._raw += key * value;
        this._total += value;
      }
    }
    this._mean = (this._raw / this._total);
  }

  calculateStandardDeviation() {
    if (this._total !== 0.0) {
      let sum = 0.0;
      for (const [key, value] of this._map.entries()) {
        if (key >= this._lowerBound && key <= this._upperBound) {
          for (let i = 0; i < value; i++) {
            const x = (key - this._mean);
            sum += (x * x);
          }
        }
      }
      this._stdDev = Math.sqrt(sum / this._total);
    }
  }
}
