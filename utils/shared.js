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

module.exports = {
  getOutputDimensions,
  addPadding
};
