const { mapToPixels } = require('./shared');

function convolutionStep({
  inputWidth,
  inputData,
  filterSize,
  filter,
  topLeftIndex,
  inputDataIndexNextRowStep,
  channel,
  min,
  max,
}) {
  const lastInputDataIndex =
    topLeftIndex + (((inputWidth + 1) * (filterSize - 1)) << 2);
  let inputDataIndex = topLeftIndex;
  let filterIndex = 0;
  let sum = 0;

  while (inputDataIndex <= lastInputDataIndex) {
    sum += inputData[inputDataIndex + channel] * filter[filterIndex++];

    if (
      ((inputDataIndex - topLeftIndex) >> 2) %
      inputWidth ===
      filterSize - 1
    ) {
      inputDataIndex += inputDataIndexNextRowStep;
    } else {
      inputDataIndex += 4;
    }
  }

  return {
    sum,
    min: sum < min ? sum : min,
    max: sum > max ? sum : max,
  };
}

function convolve({
  inputWidth,
  inputData,
  filterSize,
  filter,
  stride,
  outputWidth,
  outputHeight,
}) {
  const outputSize = (outputWidth * outputHeight) << 2;
  const outputArray = new Array(outputSize);
  const topLeftIndexStep = stride << 2;
  const lastTopLeftIndexOnFirstRow = ((outputWidth - 1) * stride) << 2;
  const inputWidthTimes4 = inputWidth << 2;
  const topLeftIndexNextRowStep =
    inputWidthTimes4 * stride - lastTopLeftIndexOnFirstRow;
  const inputDataIndexNextRowStep = (inputWidth - filterSize + 1) << 2;
  const lastTopLeftIndex =
    (inputWidth * ((outputHeight - 1) * stride + 1) - filterSize) << 2;
  let topLeftIndex = 0;
  let outputArrayIndex = 0;
  const minValues = [
    Infinity, // red
    Infinity, // green
    Infinity, // blue
  ];
  const maxValues = [
    -Infinity, // red
    -Infinity, // green
    -Infinity, // blue
  ];

  while (topLeftIndex <= lastTopLeftIndex) {
    // Red
    let { sum, min, max } = convolutionStep({
      inputWidth,
      inputData,
      filterSize,
      filter,
      topLeftIndex,
      inputDataIndexNextRowStep,
      channel: 0,
      min: minValues[0],
      max: maxValues[0],
    });
    outputArray[outputArrayIndex++] = sum;
    minValues[0] = min;
    maxValues[0] = max;

    // Green
    ({ sum, min, max } = convolutionStep({
      inputWidth,
      inputData,
      filterSize,
      filter,
      topLeftIndex,
      inputDataIndexNextRowStep,
      channel: 1,
      min: minValues[1],
      max: maxValues[1],
    }));
    outputArray[outputArrayIndex++] = sum;
    minValues[1] = min;
    maxValues[1] = max;

    // Blue
    ({ sum, min, max } = convolutionStep({
      inputWidth,
      inputData,
      filterSize,
      filter,
      topLeftIndex,
      inputDataIndexNextRowStep,
      channel: 2,
      min: minValues[2],
      max: maxValues[2],
    }));
    outputArray[outputArrayIndex++] = sum;
    minValues[2] = min;
    maxValues[2] = max;

    outputArrayIndex += 1; // skip alpha

    if (topLeftIndex % inputWidthTimes4 === lastTopLeftIndexOnFirstRow) {
      topLeftIndex += topLeftIndexNextRowStep;
    } else {
      topLeftIndex += topLeftIndexStep;
    }
  }

  return {
    outputData: mapToPixels({
      dataArray: outputArray,
      minValues,
      maxValues,
    }),
  };
}

module.exports = {
  convolve,
};
