const { LAYER_TYPES } = require("./constants");

function getOutputDimensions({ inputWidth, inputHeight, filterSize, stride }) {
  return {
    // x << 0 is a faster version of Math.floor(x)
    outputWidth: ((inputWidth - filterSize) / stride + 1) << 0,
    outputHeight: ((inputHeight - filterSize) / stride + 1) << 0
  };
}

module.exports = {
  getOutputDimensions
};
