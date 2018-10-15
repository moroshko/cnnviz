const { LAYER_TYPES } = require("./constants");
const { getOutputDimensions } = require("./shared");

describe("getOutputDimensions", () => {
  it("filterSize = 3 and stride = 1", () => {
    expect(
      getOutputDimensions({
        inputWidth: 13,
        inputHeight: 8,
        filterSize: 3,
        stride: 1
      })
    ).toEqual({
      outputWidth: 11,
      outputHeight: 6
    });
  });

  it("filterSize = 3 and stride = 2", () => {
    expect(
      getOutputDimensions({
        inputWidth: 13,
        inputHeight: 8,
        filterSize: 3,
        stride: 2
      })
    ).toEqual({
      outputWidth: 6,
      outputHeight: 3
    });
  });
});
