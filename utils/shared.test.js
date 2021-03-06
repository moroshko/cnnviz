const {
  clamp,
  getOutputDimensions,
  mapToPixels,
  filterChannels,
} = require('./shared');

describe('clamp', () => {
  it("doesn't change the number", () => {
    expect(clamp(3.4, [1, 5])).toBe(3.4);
  });

  it('clamps to min', () => {
    expect(clamp(3.4, [4, 5])).toBe(4);
  });

  it('clamps to max', () => {
    expect(clamp(3.4, [1, 2])).toBe(2);
  });
});

describe('getOutputDimensions', () => {
  it('filterSize = 3, padding = 0, stride = 1', () => {
    expect(
      getOutputDimensions({
        inputWidth: 13,
        inputHeight: 8,
        filterSize: 3,
        padding: 0,
        stride: 1,
      })
    ).toEqual({
      outputWidth: 11,
      outputHeight: 6,
    });
  });

  it('filterSize = 3, padding = 0, stride = 2', () => {
    expect(
      getOutputDimensions({
        inputWidth: 13,
        inputHeight: 8,
        filterSize: 3,
        padding: 0,
        stride: 2,
      })
    ).toEqual({
      outputWidth: 6,
      outputHeight: 3,
    });
  });

  it('filterSize = 3, padding = 3, stride = 1', () => {
    expect(
      getOutputDimensions({
        inputWidth: 13,
        inputHeight: 8,
        filterSize: 3,
        padding: 3,
        stride: 1,
      })
    ).toEqual({
      outputWidth: 17,
      outputHeight: 12,
    });
  });
});

describe('mapToPixels', () => {
  it('maps RGB values to [0..255] and sets alpha to 255', () => {
    expect(
      mapToPixels({
        // prettier-ignore
        dataArray: [
          -45.75, 83.03, -36.74, 124,     42.49,  -1.81, -2.25,  2,    -21.92, -27.44, 43.77,  90,
           23.27, 95.73, -64.32,  39,    -43.60, -50.80, 59.06, 15,    -91.37,  45.92, 21.61, 121
        ],
        minValues: [-91.37, -50.8, -64.32],
        maxValues: [42.49, 95.73, 59.06],
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

describe('filterChannels', () => {
  it('filters only the green channel', () => {
    expect(
      filterChannels({
        // prettier-ignore
        data: new Uint8ClampedArray([
           33, 205, 223,  24,     41, 238, 232, 249,     93,  54, 238,  66,    110,  78,  15, 117,
          156, 145, 209,  30,    175,  91, 158, 116,     17, 211, 222, 239,    223, 116, 158, 235,
           91,  49,  27, 211,    165,  61,  90, 133,     23, 121,  58, 100,    237, 104,  72,  36,
          108,   7, 192,  43,    158,  26, 128, 201,    151,  90, 217,   3,    221, 168,  55, 155,
          135,  64, 226, 128,    222,  23, 165, 208,     44, 177, 216, 183,     70, 183, 124, 198,
        ]),
        r: false,
        g: true,
        b: false,
        a: false,
      })
    ).toEqual(
      // prettier-ignore
      new Uint8ClampedArray([
        0, 205, 0, 0,    0, 238, 0, 0,    0,  54, 0, 0,    0,  78, 0, 0,
        0, 145, 0, 0,    0,  91, 0, 0,    0, 211, 0, 0,    0, 116, 0, 0,
        0,  49, 0, 0,    0,  61, 0, 0,    0, 121, 0, 0,    0, 104, 0, 0,
        0,   7, 0, 0,    0,  26, 0, 0,    0,  90, 0, 0,    0, 168, 0, 0,
        0,  64, 0, 0,    0,  23, 0, 0,    0, 177, 0, 0,    0, 183, 0, 0,
      ])
    );
  });

  it('filters red, blue, and alpha channels', () => {
    expect(
      filterChannels({
        // prettier-ignore
        data: new Uint8ClampedArray([
           33, 205, 223,  24,     41, 238, 232, 249,     93,  54, 238,  66,    110,  78,  15, 117,
          156, 145, 209,  30,    175,  91, 158, 116,     17, 211, 222, 239,    223, 116, 158, 235,
           91,  49,  27, 211,    165,  61,  90, 133,     23, 121,  58, 100,    237, 104,  72,  36,
          108,   7, 192,  43,    158,  26, 128, 201,    151,  90, 217,   3,    221, 168,  55, 155,
          135,  64, 226, 128,    222,  23, 165, 208,     44, 177, 216, 183,     70, 183, 124, 198,
        ]),
        r: true,
        g: false,
        b: true,
        a: true,
      })
    ).toEqual(
      // prettier-ignore
      new Uint8ClampedArray([
         33, 0, 223,  24,     41, 0, 232, 249,     93, 0, 238,  66,    110, 0,  15, 117,
        156, 0, 209,  30,    175, 0, 158, 116,     17, 0, 222, 239,    223, 0, 158, 235,
         91, 0,  27, 211,    165, 0,  90, 133,     23, 0,  58, 100,    237, 0,  72,  36,
        108, 0, 192,  43,    158, 0, 128, 201,    151, 0, 217,   3,    221, 0,  55, 155,
        135, 0, 226, 128,    222, 0, 165, 208,     44, 0, 216, 183,     70, 0, 124, 198,
      ])
    );
  });

  it('filters no channels', () => {
    expect(
      filterChannels({
        // prettier-ignore
        data: new Uint8ClampedArray([
           33, 205, 223,  24,     41, 238, 232, 249,     93,  54, 238,  66,    110,  78,  15, 117,
          156, 145, 209,  30,    175,  91, 158, 116,     17, 211, 222, 239,    223, 116, 158, 235,
           91,  49,  27, 211,    165,  61,  90, 133,     23, 121,  58, 100,    237, 104,  72,  36,
          108,   7, 192,  43,    158,  26, 128, 201,    151,  90, 217,   3,    221, 168,  55, 155,
          135,  64, 226, 128,    222,  23, 165, 208,     44, 177, 216, 183,     70, 183, 124, 198,
        ]),
        r: false,
        g: false,
        b: false,
        a: false,
      })
    ).toEqual(
      // prettier-ignore
      new Uint8ClampedArray([
        0, 0, 0, 0,    0, 0, 0, 0,    0, 0, 0, 0,    0, 0, 0, 0,
        0, 0, 0, 0,    0, 0, 0, 0,    0, 0, 0, 0,    0, 0, 0, 0,
        0, 0, 0, 0,    0, 0, 0, 0,    0, 0, 0, 0,    0, 0, 0, 0,
        0, 0, 0, 0,    0, 0, 0, 0,    0, 0, 0, 0,    0, 0, 0, 0,
        0, 0, 0, 0,    0, 0, 0, 0,    0, 0, 0, 0,    0, 0, 0, 0,
      ])
    );
  });

  it('filters all channels', () => {
    expect(
      filterChannels({
        // prettier-ignore
        data: new Uint8ClampedArray([
           33, 205, 223,  24,     41, 238, 232, 249,     93,  54, 238,  66,    110,  78,  15, 117,
          156, 145, 209,  30,    175,  91, 158, 116,     17, 211, 222, 239,    223, 116, 158, 235,
           91,  49,  27, 211,    165,  61,  90, 133,     23, 121,  58, 100,    237, 104,  72,  36,
          108,   7, 192,  43,    158,  26, 128, 201,    151,  90, 217,   3,    221, 168,  55, 155,
          135,  64, 226, 128,    222,  23, 165, 208,     44, 177, 216, 183,     70, 183, 124, 198,
        ]),
        r: true,
        g: true,
        b: true,
        a: true,
      })
    ).toEqual(
      // prettier-ignore
      new Uint8ClampedArray([
         33, 205, 223,  24,     41, 238, 232, 249,     93,  54, 238,  66,    110,  78,  15, 117,
        156, 145, 209,  30,    175,  91, 158, 116,     17, 211, 222, 239,    223, 116, 158, 235,
         91,  49,  27, 211,    165,  61,  90, 133,     23, 121,  58, 100,    237, 104,  72,  36,
        108,   7, 192,  43,    158,  26, 128, 201,    151,  90, 217,   3,    221, 168,  55, 155,
        135,  64, 226, 128,    222,  23, 165, 208,     44, 177, 216, 183,     70, 183, 124, 198,
      ])
    );
  });
});
