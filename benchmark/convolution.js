const { performance } = require("perf_hooks");
const { INPUT_WIDTH, INPUT_HEIGHT } = require("../utils/constants");
const {
  getConvolutionOutputDimensions,
  convolve
} = require("../utils/convolution");

const COUNT = 300;

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
  const length = (INPUT_WIDTH * INPUT_HEIGHT) << 2;
  const inputData = new Array(length);

  for (let i = 0; i < length; i++) {
    inputData[i] = getRandomNumber(0, 255);
  }

  return inputData;
}

const filterSizes = [1, 3, 5, 7];
const filters = filterSizes.map(getRandomFilter);

for (let i = 0; i < filterSizes.length; i++) {
  const filterSize = filterSizes[i];
  const filter = filters[i];
  let totalTime = 0;

  for (let k = 0; k < COUNT; k++) {
    const inputData = getRandomInputData();
    const startTime = performance.now();
    const { outputData } = convolve({
      inputWidth: INPUT_WIDTH,
      inputHeight: INPUT_HEIGHT,
      inputData,
      filterSize,
      filter,
      ...getConvolutionOutputDimensions({
        inputWidth: INPUT_WIDTH,
        inputHeight: INPUT_HEIGHT,
        filterSize
      })
    });
    const endTime = performance.now();

    totalTime += endTime - startTime;
  }

  const averageTime = Math.round(totalTime / COUNT);

  console.log(`${filterSize}x${filterSize} filter: ${averageTime}ms`);
}

/*
  const COUNT = 300;

  1x1 filter: 10ms
  3x3 filter: 30ms
  5x5 filter: 70ms
  7x7 filter: 130ms
*/
