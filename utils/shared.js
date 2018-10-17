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

function addPadding({
  inputWidth,
  inputHeight,
  inputData,
  padding,
  outputWidth,
  outputHeight
}) {
  const outputSize = (outputWidth * outputHeight) << 2;
  const outputData = new Uint8ClampedArray(outputSize);
  let inputDataIndex = 0;
  const inputDataIndexStep = inputWidth << 2;
  let outputDataIndex = ((outputWidth + 1) * padding) << 2;
  const outputDataIndexStep = outputWidth << 2;

  for (let h = 0; h < inputHeight; h++) {
    outputData.set(
      inputData.subarray(inputDataIndex, inputDataIndex + inputDataIndexStep),
      outputDataIndex
    );

    inputDataIndex += inputDataIndexStep;
    outputDataIndex += outputDataIndexStep;
  }

  return {
    outputData
  };
}

module.exports = {
  getOutputDimensions,
  addPadding
};
