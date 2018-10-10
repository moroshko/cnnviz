const { LAYER_TYPES } = require("./constants");
const { getConvolutionOutputDimensions } = require("./convolution");
const { getPoolingOutputDimensions } = require("./pooling");

function getOutputDimensions({
  inputWidth,
  inputHeight,
  layerType,
  filterSize,
  stride
}) {
  switch (layerType) {
    case LAYER_TYPES.CONV: {
      return getConvolutionOutputDimensions({
        inputWidth,
        inputHeight,
        filterSize
      });
    }

    case LAYER_TYPES.POOL: {
      return getPoolingOutputDimensions({
        inputWidth,
        inputHeight,
        filterSize,
        stride
      });
    }

    default: {
      throw new Error(`Unknown layer type: ${layerType}`);
    }
  }
}

module.exports = {
  getOutputDimensions
};
