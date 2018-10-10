const { LAYER_TYPES } = require("./constants");
const { getOutputDimensions } = require("./shared");

describe("getOutputDimensions", () => {
  it("CONV layer", () => {
    expect(
      getOutputDimensions({
        inputWidth: 13,
        inputHeight: 8,
        layerType: LAYER_TYPES.CONV,
        filterSize: 3
      })
    ).toEqual({
      outputWidth: 11,
      outputHeight: 6
    });
  });

  it("POOL layer", () => {
    expect(
      getOutputDimensions({
        inputWidth: 13,
        inputHeight: 8,
        layerType: LAYER_TYPES.POOL,
        filterSize: 3,
        stride: 2
      })
    ).toEqual({
      outputWidth: 6,
      outputHeight: 3
    });
  });
});
