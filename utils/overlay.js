const { clamp } = require('./shared');

function getGridPosition({
  inputWidth,
  inputHeight,
  filterSize,
  stride,
  inputX,
  inputY,
}) {
  const n = (filterSize - stride + 1) >> 1;
  const maxOutputOverlayGridX = Math.floor((inputWidth - filterSize) / stride);
  const outputOverlayGridX = clamp(Math.floor((inputX - n) / stride), [
    0,
    maxOutputOverlayGridX,
  ]);
  const maxOutputOverlayGridY = Math.floor((inputHeight - filterSize) / stride);
  const outputOverlayGridY = clamp(Math.floor((inputY - n) / stride), [
    0,
    maxOutputOverlayGridY,
  ]);
  const inputOverlayGridX = outputOverlayGridX * stride;
  const inputOverlayGridY = outputOverlayGridY * stride;

  return {
    inputOverlayGridX,
    inputOverlayGridY,
    outputOverlayGridX,
    outputOverlayGridY,
  };
}

module.exports = {
  getGridPosition,
};
