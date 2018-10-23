const { addPadding, mapToPixels } = require("./shared");
const { convolve } = require("./convolution");

// prettier-ignore
const inputData = new Uint8ClampedArray([
   33, 205, 223,  24,     41, 238, 232, 249,     93,  54, 238,  66,     110,  78,  15, 117,
  156, 145, 209,  30,    175,  91, 158, 116,     17, 211, 222, 239,     223, 116, 158, 235,
   91,  49,  27, 211,    165,  61,  90, 133,     23, 121,  58, 100,     237, 104,  72,  36,
  108,   7, 192,  43,    158,  26, 128, 201,    151,  90, 217,   3,     221, 168,  55, 155,
  135,  64, 226, 128,    222,  23, 165, 208,     44, 177, 216, 183,      70, 183, 124, 198,
]);
/*
  Red channel:                 Green channel:               Blue channel:

   33    41    93   110        205   238    54    78        223   232   238    15
  156   175    17   223        145    91   211   116        209   158   222   158
   91   165    23   237         49    61   121   104         27    90    58    72
  108   158   151   221          7    26    90   168        192   128   217    55
  135   222    44    70         64    23   177   183        226   165   216   124
*/

describe("convolve", () => {
  it("filterSize = 3 with integer values", () => {
    expect(
      convolve({
        inputWidth: 4,
        inputHeight: 5,
        inputData,
        filterSize: 3,
        // prettier-ignore
        filter: [
          4,  6, -8,
          3,  0,  6,
          7, -1,  2
        ],
        stride: 1,
        outputWidth: 2,
        outputHeight: 3
      })
    ).toEqual({
      /*
        Red channel:       Green channel:      Blue channel:

         722   3311        4041   2135         2554   4374
        2849   2332         514   1937         2087   2191
        3211   2352         934   1574         3911   2033
      */
      // prettier-ignore
      outputData: new Uint8ClampedArray([
          0, 255,  57, 255,       255, 117, 255, 255,
        209,   0,   6, 255,       159, 103,  17, 255,
        245,  30, 205, 255,       161,  77,   0, 255
      ])
    });
  });

  it("filterSize = 2 with float values", () => {
    expect(
      convolve({
        inputWidth: 4,
        inputHeight: 5,
        inputData,
        filterSize: 2,
        // prettier-ignore
        filter: [
          0.125, 0.5,
          -0.25, 0.1
        ],
        stride: 1,
        outputWidth: 3,
        outputHeight: 4
      })
    ).toEqual({
      // prettier-ignore
      outputData: new Uint8ClampedArray([
         21, 255, 211, 255,     33, 119, 255, 255,    170,  10,   6, 255,
        199, 125, 211, 255,      0, 247, 224, 255,    255, 140, 196, 255,
        166,  81,  35, 255,     30, 153,  66, 255,    208, 133,   0, 255,
        163,   0, 100, 255,     96, 130, 207, 255,    244, 150,  35, 255
      ])
    });
  });

  it("filterSize = 3 with stride = 2", () => {
    expect(
      convolve({
        inputWidth: 4,
        inputHeight: 5,
        inputData,
        filterSize: 3,
        // prettier-ignore
        filter: [
          4,  6, -8,
          3,  0,  6,
          7, -1,  2
        ],
        stride: 2,
        outputWidth: 1,
        outputHeight: 2
      })
    ).toEqual({
      /*
        Red channel:       Green channel:      Blue channel:

          722               4041                2554
         3211                934                3911
      */
      // prettier-ignore
      outputData: new Uint8ClampedArray([
          0, 255,   0, 255,
        255,   0, 255, 255
      ])
    });
  });

  it("identity filterSize = 7 with padding = 3", () => {
    const {
      inputWidthWithPadding,
      inputHeightWithPadding,
      inputDataWithPadding
    } = addPadding({
      inputWidth: 4,
      inputHeight: 5,
      inputData,
      padding: 3
    });

    expect(
      convolve({
        inputWidth: inputWidthWithPadding,
        inputHeight: inputHeightWithPadding,
        inputData: inputDataWithPadding,
        filterSize: 7,
        // prettier-ignore
        filter: [
          0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 1, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0,
          0, 0, 0, 0, 0, 0, 0,
        ],
        stride: 1,
        outputWidth: 4,
        outputHeight: 5
      })
    ).toEqual({
      outputData: mapToPixels({
        dataArray: inputData,
        minValues: [17, 7, 15],
        maxValues: [237, 238, 238]
      })
    });
  });
});
