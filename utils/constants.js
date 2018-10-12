const INPUT_DISPLAY_WIDTH = 512;
const INPUT_DISPLAY_HEIGHT = 384;

const INPUT_TYPES = {
  IMAGE: "IMAGE",
  CAMERA: "CAMERA"
};
const INPUT_TYPES_LABELS = {
  IMAGE: "Image",
  CAMERA: "Camera"
};

const LAYER_TYPES = {
  CONV: "CONV",
  POOL: "POOL"
};
const LAYER_TYPES_LABELS = {
  CONV: "Convolution",
  POOL: "Pooling"
};

// prettier-ignore
const CONV_FILTERS = [
  {
    name: 'Edge detection',
    filter: [
      0,  1, 0,
      1, -4, 1,
      0,  1, 0
    ]
  },
  {
    name: 'Gaussian blur',
    filter: [
      1, 2, 1,
      2, 4, 2,
      1, 2, 1
    ]
  },
  {
    name: 'Filter 3',
    filter: [
      1, 0, -1,
      2, 0, -2,
      1, 0, -1
    ]
  },
  {
    name: 'Filter 4',
    filter: [
      3, 0, -3,
      10, 0, -10,
      3, 0, -3
    ]
  }
];

module.exports = {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT,
  INPUT_TYPES,
  INPUT_TYPES_LABELS,
  LAYER_TYPES,
  LAYER_TYPES_LABELS,
  CONV_FILTERS
};
