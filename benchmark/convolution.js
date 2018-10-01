const { performance } = require("perf_hooks");
const { convolve } = require("../utils/convolution");

const inputWidth = 400;
const inputHeight = 300;

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

function getRandomInputData(inputWidth, inputHeight) {
  const length = (inputWidth * inputHeight) << 2;
  const inputData = new Array(length);

  for (let i = 0; i < length; i++) {
    inputData[i] = getRandomNumber(0, 255);
  }

  return inputData;
}

const filterSizes = [1, 3, 5, 7];
const filters = filterSizes.map(getRandomFilter);

const count = 100;

for (let i = 0; i < filterSizes.length; i++) {
  const filterSize = filterSizes[i];
  const filter = filters[i];
  let totalTime = 0;

  for (let k = 0; k < count; k++) {
    const inputData = getRandomInputData(inputWidth, inputHeight);
    const startTime = performance.now();
    const { outputData } = convolve({
      inputWidth,
      inputHeight,
      inputData,
      filterSize,
      filter
    });
    const endTime = performance.now();

    totalTime += endTime - startTime;
  }

  const averageTime = Math.round(totalTime / count);

  console.log(`${filterSize}x${filterSize} filter: ${averageTime}ms`);
}

/*
  1x1 filter: 56ms
  3x3 filter: 104ms
  5x5 filter: 216ms
  7x7 filter: 401ms
*/
