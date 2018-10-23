const { LAYER_TYPES } = require("./constants");
const { getOutputDimensions, addPadding, mapToPixels } = require("./shared");

describe("getOutputDimensions", () => {
  it("filterSize = 3, padding = 0, stride = 1", () => {
    expect(
      getOutputDimensions({
        inputWidth: 13,
        inputHeight: 8,
        filterSize: 3,
        padding: 0,
        stride: 1
      })
    ).toEqual({
      outputWidth: 11,
      outputHeight: 6
    });
  });

  it("filterSize = 3, padding = 0, stride = 2", () => {
    expect(
      getOutputDimensions({
        inputWidth: 13,
        inputHeight: 8,
        filterSize: 3,
        padding: 0,
        stride: 2
      })
    ).toEqual({
      outputWidth: 6,
      outputHeight: 3
    });
  });

  it("filterSize = 3, padding = 3, stride = 1", () => {
    expect(
      getOutputDimensions({
        inputWidth: 13,
        inputHeight: 8,
        filterSize: 3,
        padding: 3,
        stride: 1
      })
    ).toEqual({
      outputWidth: 17,
      outputHeight: 12
    });
  });
});

describe("addPadding", () => {
  it("padding = 0", () => {
    expect(
      addPadding({
        inputWidth: 4,
        inputHeight: 5,
        // prettier-ignore
        inputData: new Uint8ClampedArray([
           33, 205, 223,  24,     41, 238, 232, 249,     93,  54, 238,  66,     110,  78,  15, 117,
          156, 145, 209,  30,    175,  91, 158, 116,     17, 211, 222, 239,     223, 116, 158, 235,
           91,  49,  27, 211,    165,  61,  90, 133,     23, 121,  58, 100,     237, 104,  72,  36,
          108,   7, 192,  43,    158,  26, 128, 201,    151,  90, 217,   3,     221, 168,  55, 155,
          135,  64, 226, 128,    222,  23, 165, 208,     44, 177, 216, 183,      70, 183, 124, 198,
        ]),
        padding: 0
      })
    ).toEqual({
      inputWidthWithPadding: 4,
      inputHeightWithPadding: 5,
      // prettier-ignore
      inputDataWithPadding: new Uint8ClampedArray([
         33, 205, 223,  24,     41, 238, 232, 249,     93,  54, 238,  66,     110,  78,  15, 117,
        156, 145, 209,  30,    175,  91, 158, 116,     17, 211, 222, 239,     223, 116, 158, 235,
         91,  49,  27, 211,    165,  61,  90, 133,     23, 121,  58, 100,     237, 104,  72,  36,
        108,   7, 192,  43,    158,  26, 128, 201,    151,  90, 217,   3,     221, 168,  55, 155,
        135,  64, 226, 128,    222,  23, 165, 208,     44, 177, 216, 183,      70, 183, 124, 198,
      ])
    });
  });

  it("padding = 2", () => {
    expect(
      addPadding({
        inputWidth: 4,
        inputHeight: 5,
        // prettier-ignore
        inputData: new Uint8ClampedArray([
           33, 205, 223,  24,     41, 238, 232, 249,     93,  54, 238,  66,     110,  78,  15, 117,
          156, 145, 209,  30,    175,  91, 158, 116,     17, 211, 222, 239,     223, 116, 158, 235,
           91,  49,  27, 211,    165,  61,  90, 133,     23, 121,  58, 100,     237, 104,  72,  36,
          108,   7, 192,  43,    158,  26, 128, 201,    151,  90, 217,   3,     221, 168,  55, 155,
          135,  64, 226, 128,    222,  23, 165, 208,     44, 177, 216, 183,      70, 183, 124, 198,
        ]),
        padding: 2
      })
    ).toEqual({
      inputWidthWithPadding: 8,
      inputHeightWithPadding: 9,
      // prettier-ignore
      inputDataWithPadding: new Uint8ClampedArray([
        0, 0, 0, 0,    0, 0, 0, 0,      0,   0,   0,   0,      0,   0,   0,   0,      0,   0,   0,   0,      0,   0,   0,   0,    0, 0, 0, 0,    0, 0, 0, 0,
        0, 0, 0, 0,    0, 0, 0, 0,      0,   0,   0,   0,      0,   0,   0,   0,      0,   0,   0,   0,      0,   0,   0,   0,    0, 0, 0, 0,    0, 0, 0, 0,
        0, 0, 0, 0,    0, 0, 0, 0,     33, 205, 223,  24,     41, 238, 232, 249,     93,  54, 238,  66,    110,  78,  15, 117,    0, 0, 0, 0,    0, 0, 0, 0,
        0, 0, 0, 0,    0, 0, 0, 0,    156, 145, 209,  30,    175,  91, 158, 116,     17, 211, 222, 239,    223, 116, 158, 235,    0, 0, 0, 0,    0, 0, 0, 0,
        0, 0, 0, 0,    0, 0, 0, 0,     91,  49,  27, 211,    165,  61,  90, 133,     23, 121,  58, 100,    237, 104,  72,  36,    0, 0, 0, 0,    0, 0, 0, 0,
        0, 0, 0, 0,    0, 0, 0, 0,    108,   7, 192,  43,    158,  26, 128, 201,    151,  90, 217,   3,    221, 168,  55, 155,    0, 0, 0, 0,    0, 0, 0, 0,
        0, 0, 0, 0,    0, 0, 0, 0,    135,  64, 226, 128,    222,  23, 165, 208,     44, 177, 216, 183,     70, 183, 124, 198,    0, 0, 0, 0,    0, 0, 0, 0,
        0, 0, 0, 0,    0, 0, 0, 0,      0,   0,   0,   0,      0,   0,   0,   0,      0,   0,   0,   0,      0,   0,   0,   0,    0, 0, 0, 0,    0, 0, 0, 0,
        0, 0, 0, 0,    0, 0, 0, 0,      0,   0,   0,   0,      0,   0,   0,   0,      0,   0,   0,   0,      0,   0,   0,   0,    0, 0, 0, 0,    0, 0, 0, 0
      ])
    });
  });
});

describe("mapToPixels", () => {
  it("maps RGB values to [0..255] and sets alpha to 255", () => {
    expect(
      mapToPixels({
        // prettier-ignore
        dataArray: [
          -45.75, 83.03, -36.74, 124,     42.49,  -1.81, -2.25,  2,    -21.92, -27.44, 43.77,  90,
           23.27, 95.73, -64.32,  39,    -43.60, -50.80, 59.06, 15,    -91.37,  45.92, 21.61, 121
        ],
        minValues: [-91.37, -50.8, -64.32],
        maxValues: [42.49, 95.73, 59.06]
      })
    ).toEqual(
      // prettier-ignore
      new Uint8ClampedArray([
         87, 233, 57, 255,    255, 85, 128, 255,    132,  41, 223, 255,
        218, 255,  0, 255,     91,  0, 255, 255,      0, 168, 178, 255
      ])
    );
  });
});
