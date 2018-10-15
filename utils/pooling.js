function poolStep({
  inputWidth,
  inputData,
  filterSize,
  topLeftIndex,
  inputDataIndexNextRowStep,
  channel
}) {
  const lastInputDataIndex =
    topLeftIndex + (((inputWidth + 1) * (filterSize - 1)) << 2);
  let inputDataIndex = topLeftIndex;
  let max = -Infinity;

  while (inputDataIndex <= lastInputDataIndex) {
    if (inputData[inputDataIndex + channel] > max) {
      max = inputData[inputDataIndex + channel];
    }

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

  return max;
}

function pool({
  inputWidth,
  inputHeight,
  inputData,
  filterSize,
  stride,
  outputWidth,
  outputHeight
}) {
  const outputSize = (outputWidth * outputHeight) << 2;
  const outputData = new Uint8ClampedArray(outputSize);
  const topLeftIndexStep = stride << 2;
  const lastTopLeftIndexOnFirstRow = ((outputWidth - 1) * stride) << 2;
  const inputWidthTimes4 = inputWidth << 2;
  const topLeftIndexNextRowStep =
    inputWidthTimes4 * stride - lastTopLeftIndexOnFirstRow;
  const inputDataIndexNextRowStep = (inputWidth - filterSize + 1) << 2;
  const lastTopLeftIndex =
    (inputWidth * ((outputHeight - 1) * stride + 1) - filterSize) << 2;
  const filterSizeTimes4 = filterSize << 2;
  const outputWidthTimes4 = outputWidth << 2;
  let topLeftIndex = 0;
  let outputDataIndex = 0;

  while (topLeftIndex <= lastTopLeftIndex) {
    for (let channel = 0; channel < 3; channel++) {
      outputData[outputDataIndex++] = poolStep({
        inputWidth,
        inputData,
        filterSize,
        topLeftIndex,
        inputDataIndexNextRowStep,
        channel
      });
    }

    outputData[outputDataIndex++] = 255; // alpha

    if (topLeftIndex % inputWidthTimes4 === lastTopLeftIndexOnFirstRow) {
      topLeftIndex += topLeftIndexNextRowStep;
    } else {
      topLeftIndex += topLeftIndexStep;
    }
  }

  return {
    outputData
  };
}

module.exports = {
  pool
};
