const { performance } = require('perf_hooks');
const {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT,
} = require('../utils/constants');
const { getOutputDimensions } = require('../utils/shared');
const { convolve } = require('../utils/convolution');

const COUNT = 50;

function getRandomNumber(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function getRandomFilter(filterSize) {
  const length = filterSize * filterSize;
  const filter = new Array(length);

  for (let i = 0; i < length; i++) {
    filter[i] = getRandomNumber(-10, 10);
  }

  return filter;
}

function getRandomInputData() {
  const length = (INPUT_DISPLAY_WIDTH * INPUT_DISPLAY_HEIGHT) << 2;
  const inputData = new Uint8ClampedArray(length);

  for (let i = 0; i < length; i++) {
    inputData[i] = getRandomNumber(0, 255);
  }

  return inputData;
}

const strides = [1, 2, 4];
const filterSizes = [1, 3, 5, 7, 9, 11, 13, 15];
const filters = filterSizes.map(getRandomFilter);

strides.forEach(stride => {
  filterSizes.forEach((filterSize, filterIndex) => {
    const filter = filters[filterIndex];
    let totalTime = 0;

    for (let k = 0; k < COUNT; k++) {
      const inputData = getRandomInputData();
      const startTime = performance.now();

      convolve({
        inputWidth: INPUT_DISPLAY_WIDTH,
        inputHeight: INPUT_DISPLAY_HEIGHT,
        inputData,
        filter,
        filterSize,
        stride,
        ...getOutputDimensions({
          inputWidth: INPUT_DISPLAY_WIDTH,
          inputHeight: INPUT_DISPLAY_HEIGHT,
          filterSize,
          padding: 0,
          stride,
        }),
      });

      const endTime = performance.now();

      totalTime += endTime - startTime;
    }

    const averageTime = (totalTime / COUNT).toFixed(2);

    // eslint-disable-next-line no-console
    console.log(
      `filterSize = ${filterSize}, stride = ${stride} ===> ${averageTime}ms`
    );
  });
});

/*
  const COUNT = 50;

  filterSize = 1, stride = 1 ===> 12.05ms
  filterSize = 3, stride = 1 ===> 29.04ms
  filterSize = 5, stride = 1 ===> 65.38ms
  filterSize = 7, stride = 1 ===> 124.12ms
  filterSize = 9, stride = 1 ===> 194.15ms
  filterSize = 11, stride = 1 ===> 280.80ms
  filterSize = 13, stride = 1 ===> 391.49ms
  filterSize = 15, stride = 1 ===> 529.55ms
  filterSize = 1, stride = 2 ===> 3.00ms
  filterSize = 3, stride = 2 ===> 7.37ms
  filterSize = 5, stride = 2 ===> 16.56ms
  filterSize = 7, stride = 2 ===> 31.23ms
  filterSize = 9, stride = 2 ===> 48.73ms
  filterSize = 11, stride = 2 ===> 70.50ms
  filterSize = 13, stride = 2 ===> 97.87ms
  filterSize = 15, stride = 2 ===> 133.85ms
  filterSize = 1, stride = 4 ===> 0.51ms
  filterSize = 3, stride = 4 ===> 1.65ms
  filterSize = 5, stride = 4 ===> 3.92ms
  filterSize = 7, stride = 4 ===> 7.70ms
  filterSize = 9, stride = 4 ===> 11.99ms
  filterSize = 11, stride = 4 ===> 17.69ms
  filterSize = 13, stride = 4 ===> 24.66ms
  filterSize = 15, stride = 4 ===> 33.51ms
*/
