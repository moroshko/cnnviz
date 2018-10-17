const { performance } = require("perf_hooks");
const {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT
} = require("../utils/constants");
const { getOutputDimensions } = require("../utils/shared");
const { convolve } = require("../utils/convolution");

const COUNT = 100;

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
const filterSizes = [1, 3, 5, 7];
const filters = filterSizes.map(getRandomFilter);

strides.forEach(stride => {
  filterSizes.forEach((filterSize, filterIndex) => {
    const filter = filters[filterIndex];
    let totalTime = 0;

    for (let k = 0; k < COUNT; k++) {
      const inputData = getRandomInputData();
      const startTime = performance.now();
      const { outputData } = convolve({
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
          stride
        })
      });
      const endTime = performance.now();

      totalTime += endTime - startTime;
    }

    const averageTime = (totalTime / COUNT).toFixed(2);

    console.log(
      `filterSize = ${filterSize}, stride = ${stride} ===> ${averageTime}ms`
    );
  });
});

/*
  const COUNT = 100;

  filterSize = 1, stride = 1 ===> 10.94ms
  filterSize = 3, stride = 1 ===> 28.57ms
  filterSize = 5, stride = 1 ===> 64.64ms
  filterSize = 7, stride = 1 ===> 122.84ms
  filterSize = 1, stride = 2 ===> 2.94ms
  filterSize = 3, stride = 2 ===> 7.61ms
  filterSize = 5, stride = 2 ===> 17.30ms
  filterSize = 7, stride = 2 ===> 31.40ms
  filterSize = 1, stride = 4 ===> 0.46ms
  filterSize = 3, stride = 4 ===> 1.66ms
  filterSize = 5, stride = 4 ===> 3.88ms
  filterSize = 7, stride = 4 ===> 7.56ms
*/
