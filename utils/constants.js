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
    editable: false,
    filter: [
      0,  1, 0,
      1, -4, 1,
      0,  1, 0
    ]
  },
  {
    name: 'Blur',
    editable: false,
    filter: [
      1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
    ]
  },
  {
    name: 'Sharpen',
    editable: false,
    filter: [
       0, -1,  0,
      -1,  5, -1,
       0, -1,  0
    ]
  },
  {
    name: 'Custom',
    editable: true,
    filter: [
       0, 0, 0,
       0, 1, 0,
       0, 0, 0
    ]
  },
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
