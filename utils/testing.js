const crypto = require('crypto');

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
    inputDataWithPadding,
  };
}

function randomInputData(width, height) {
  return new Uint8ClampedArray(crypto.randomBytes((width * height) << 2));
}

module.exports = {
  addPadding,
  randomInputData,
};
