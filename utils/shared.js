function clamp(num, [min, max]) {
  return Math.min(max, Math.max(min, num));
}

function getOutputDimensions({
  inputWidth,
  inputHeight,
  filterSize,
  padding,
  stride,
}) {
  const twicePadding = padding << 1;

  return {
    // x << 0 is a faster version of Math.floor(x)
    outputWidth: ((inputWidth - filterSize + twicePadding) / stride + 1) << 0,
    outputHeight: ((inputHeight - filterSize + twicePadding) / stride + 1) << 0,
  };
}

function mapToPixels({ dataArray, minValues, maxValues }) {
  const dataArrayLength = dataArray.length;
  const multipliers = [
    255 / (maxValues[0] - minValues[0]),
    255 / (maxValues[1] - minValues[1]),
    255 / (maxValues[2] - minValues[2]),
  ];
  const result = new Uint8ClampedArray(dataArrayLength);

  for (let channel = 0; channel < 3; channel++) {
    for (let i = channel; i < dataArrayLength; i += 4) {
      // (x + 0.5) | 0 is a faster version of Math.round(x)
      result[i] =
        ((dataArray[i] - minValues[channel]) * multipliers[channel] + 0.5) | 0;
    }
  }

  // set alpha channel
  for (let i = 3; i < dataArrayLength; i += 4) {
    result[i] = 255;
  }

  return result;
}

function filterChannels({ data, r, g, b, a }) {
  const channels = (r << 3) | (g << 2) | (b << 1) | a;
  const dataLength = data.length;
  const result = new Uint8ClampedArray(dataLength);

  for (let i = 0; i < dataLength; i++) {
    if (((1 << ((3 - i) & 3)) & channels) > 0) {
      result[i] = data[i];
    }
  }

  return result;
}

module.exports = {
  clamp,
  getOutputDimensions,
  mapToPixels,
  filterChannels,
};
