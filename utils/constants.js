const INPUT_DISPLAY_WIDTH = 512;
const INPUT_DISPLAY_HEIGHT = 384;

const INPUT_TYPES = {
  IMAGE: 'IMAGE',
  CAMERA: 'CAMERA',
};
const INPUT_TYPES_LABELS = {
  IMAGE: 'Image',
  CAMERA: 'Camera',
};

const LAYER_TYPES = {
  CONV: 'CONV',
  POOL: 'POOL',
};
const LAYER_TYPES_LABELS = {
  CONV: 'Convolution',
  POOL: 'Pooling',
};

const MAX_PADDING = 3;
const MAX_SCALE = 16;

const IMAGES = [
  {
    src: '/static/Valley-Of-Gods-Photo-By-John-B-Mueller.jpg',
    scale: 1,
  },
  {
    src: '/static/digit_4.jpg',
    scale: MAX_SCALE,
  },
];

module.exports = {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT,
  INPUT_TYPES,
  INPUT_TYPES_LABELS,
  LAYER_TYPES,
  LAYER_TYPES_LABELS,
  MAX_PADDING,
  MAX_SCALE,
  IMAGES,
};
