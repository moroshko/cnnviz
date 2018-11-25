const memoize = require('lodash.memoize');

const gaussianBlur = memoize(
  (size, sigma) => {
    const twoSigmaSquare = 2 * sigma * sigma;
    const divisor = Math.PI * twoSigmaSquare;
    const m = (size - 1) >> 1;
    const kernel = [];

    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        const squareDistance = (x - m) * (x - m) + (y - m) * (y - m);
        const gaussian = Math.exp(-squareDistance / twoSigmaSquare) / divisor;

        kernel.push(gaussian);
      }
    }

    const sum = kernel.reduce((acc, gaussian) => acc + gaussian);

    return kernel.map(gaussian => gaussian / sum);
  },
  (size, sigma) => `${size},${sigma}`
);

module.exports = {
  gaussianBlur,
};
