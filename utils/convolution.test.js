const { getConvolutionOutputDimensions, convolve } = require("./convolution");

describe("getConvolutionOutputDimensions", () => {
  it("returns the correct output width and height", () => {
    expect(
      getConvolutionOutputDimensions({
        inputWidth: 11,
        inputHeight: 8,
        filterSize: 3
      })
    ).toEqual({
      outputWidth: 9,
      outputHeight: 6
    });
  });
});

describe("convolve", () => {
  it("filterSize = 3", () => {
    expect(
      convolve({
        inputWidth: 4,
        inputHeight: 5,
        // prettier-ignore
        inputData: [
           33, 205, 223,  24,     41, 238, 232, 249,     93,  54, 238,  66,     110,  78,  15, 117,
          156, 145, 209,  30,    175,  91, 158, 116,     17, 211, 222, 239,     223, 116, 158, 235,
           91,  49,  27, 211,    165,  61,  90, 133,     23, 121,  58, 100,     237, 104,  72,  36,
          108,   7, 192,  43,    158,  26, 128, 201,    151,  90, 217,   3,     221, 168,  55, 155,
          135,  64, 226, 128,    222,  23, 165, 208,     44, 177, 216, 183,      70, 183, 124, 198,
        ],
        /*
          Red channel:                 Green channel:               Blue channel:

           33    41    93   110        205   238    54    78        223   232   238    15
          156   175    17   223        145    91   211   116        209   158   222   158
           91   165    23   237         49    61   121   104         27    90    58    72
          108   158   151   221          7    26    90   168        192   128   217    55
          135   222    44    70         64    23   177   183        226   165   216   124
        */
        filterSize: 3,
        // prettier-ignore
        filter: [
          4,  6, -8,
          3,  0,  6,
          7, -1,  2
        ],
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
});
