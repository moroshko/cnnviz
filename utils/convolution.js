function getConvolutionOutputDimensions(inputWidth, inputHeight, filterSize) {
  return {
    outputWidth: inputWidth - filterSize + 1,
    outputHeight: inputHeight - filterSize + 1
  };
}

function convolutionStep({
  inputWidth,
  inputData,
  filterSize,
  filter,
  topLeftIndex,
  outputWidthTimes4,
  channel,
  min,
  max
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
      inputDataIndex += outputWidthTimes4;
    } else {
      inputDataIndex += 4;
    }
  }

  return {
    sum,
    min: sum < min ? sum : min,
    max: sum > max ? sum : max
  };
}

function convolve({
  inputWidth,
  inputHeight,
  inputData,
  filterSize,
  filter,
  outputWidth,
  outputHeight
}) {
  const outputSize = (outputWidth * outputHeight) << 2;
  const outputArray = new Array(outputSize);
  const lastTopLeftIndex = (inputWidth * outputHeight - filterSize) << 2;
  const filterSizeTimes4 = filterSize << 2;
  const outputWidthTimes4 = outputWidth << 2;
  let topLeftIndex = 0;
  let outputArrayIndex = 0;
  let minValues = [
    Infinity, // red
    Infinity, // green
    Infinity // blue
  ];
  let maxValues = [
    -Infinity, // red
    -Infinity, // green
    -Infinity // blue
  ];

  while (topLeftIndex <= lastTopLeftIndex) {
    // Red
    let { sum, min, max } = convolutionStep({
      inputWidth,
      inputData,
      filterSize,
      filter,
      topLeftIndex,
      outputWidthTimes4,
      channel: 0,
      min: minValues[0],
      max: maxValues[0]
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
      outputWidthTimes4,
      channel: 1,
      min: minValues[1],
      max: maxValues[1]
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
      outputWidthTimes4,
      channel: 2,
      min: minValues[2],
      max: maxValues[2]
    }));
    outputArray[outputArrayIndex++] = sum;
    minValues[2] = min;
    maxValues[2] = max;

    outputArrayIndex += 1; // skip alpha

    if ((topLeftIndex >> 2) % inputWidth === inputWidth - filterSize) {
      topLeftIndex += filterSizeTimes4;
    } else {
      topLeftIndex += 4;
    }
  }

  // Normalize
  const multipliers = [
    255 / (maxValues[0] - minValues[0]),
    255 / (maxValues[1] - minValues[1]),
    255 / (maxValues[2] - minValues[2])
  ];
  const outputData = new Uint8ClampedArray(outputSize);

  for (let channel = 0; channel < 3; channel++) {
    for (
      let outputIndex = channel, len = outputArray.length;
      outputIndex < len;
      outputIndex += 4
    ) {
      // (x + 0.5) | 0 is a faster version of Math.round(x)
      outputData[outputIndex] =
        ((outputArray[outputIndex] - minValues[channel]) *
          multipliers[channel] +
          0.5) |
        0;
    }
  }

  // set alpha channel
  for (
    let outputIndex = 3, len = outputArray.length;
    outputIndex < len;
    outputIndex += 4
  ) {
    outputData[outputIndex] = 255;
  }

  return {
    outputData
  };
}

module.exports = {
  getConvolutionOutputDimensions,
  convolve
};
