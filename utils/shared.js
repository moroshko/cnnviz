const { LAYER_TYPES } = require("./constants");

function getOutputDimensions({
  inputWidth,
  inputHeight,
  filterSize,
  padding,
  stride
}) {
  const twicePadding = padding << 1;

  return {
    // x << 0 is a faster version of Math.floor(x)
    outputWidth: ((inputWidth - filterSize + twicePadding) / stride + 1) << 0,
    outputHeight: ((inputHeight - filterSize + twicePadding) / stride + 1) << 0
  };
}

function addPadding({ inputWidth, inputHeight, inputData, padding }) {
  const inputWidthWithPadding = inputWidth + (padding << 1);
  const inputHeightWithPadding = inputHeight + (padding << 1);
  const outputSize = (inputWidthWithPadding * inputHeightWithPadding) << 2;
  const inputDataWithPadding = new Uint8ClampedArray(outputSize);
  let inputDataIndex = 0;
  const inputDataIndexStep = inputWidth << 2;
  let outputDataIndex = ((inputWidthWithPadding + 1) * padding) << 2;
  const outputDataIndexStep = inputWidthWithPadding << 2;

  for (let h = 0; h < inputHeight; h++) {
    inputDataWithPadding.set(
      inputData.subarray(inputDataIndex, inputDataIndex + inputDataIndexStep),
      outputDataIndex
    );

    inputDataIndex += inputDataIndexStep;
    outputDataIndex += outputDataIndexStep;
  }

  return {
    inputWidthWithPadding,
    inputHeightWithPadding,
    inputDataWithPadding
  };
}

function mapToPixels({ dataArray, minValues, maxValues }) {
  const dataArrayLength = dataArray.length;
  const multipliers = [
    255 / (maxValues[0] - minValues[0]),
    255 / (maxValues[1] - minValues[1]),
    255 / (maxValues[2] - minValues[2])
  ];
  const result = new Uint8ClampedArray(dataArrayLength);

  for (let channel = 0; channel < 3; channel++) {
    for (let i = channel; i < dataArrayLength; i += 4) {
      // (x + 0.5) | 0 is a faster version of Math.round(x)
      result[i] =
        ((dataArray[i] - minValues[channel]) * multipliers[channel] + 0.5) | 0;
    }
  }

  // set alpha channel
  for (let i = 3; i < dataArrayLength; i += 4) {
    result[i] = 255;
  }

  return result;
}

function filterChannels({ data, r, g, b, a }) {
  const channels = (r << 3) | (g << 2) | (b << 1) | a;
  const dataLength = data.length;
  const result = new Uint8ClampedArray(dataLength);

  for (let i = 0; i < dataLength; i++) {
    if (((1 << ((3 - i) & 3)) & channels) > 0) {
      result[i] = data[i];
    }
  }

  return result;
}

module.exports = {
  getOutputDimensions,
  addPadding,
  mapToPixels,
  filterChannels
};
