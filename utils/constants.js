const INPUT_WIDTH = 512;
const INPUT_HEIGHT = 384;

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

module.exports = {
  INPUT_WIDTH,
  INPUT_HEIGHT,
  INPUT_TYPES,
  INPUT_TYPES_LABELS,
  LAYER_TYPES,
  LAYER_TYPES_LABELS
};