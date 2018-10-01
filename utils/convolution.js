const CHANNEL = {
  R: 0,
  G: 1,
  B: 2
};

function getImageDataIndex({ inputWidth, channel, row, column }) {
  return row * (inputWidth << 2) + (column << 2) + channel;
}

function getImageDataIterator({
  inputWidth,
  inputData,
  channel,
  left,
  top,
  width,
  height
}) {
  let endIndex = getImageDataIndex({
    inputWidth,
    channel,
    row: top + height - 1,
    column: left + width - 1
  });
  let index;
  let row = top;
  let column = left;

  return {
    next: () => {
      index = getImageDataIndex({
        inputWidth,
        channel,
        row,
        column
      });

      const result =
        index > endIndex
          ? {
              done: true
            }
          : {
              value: inputData[index],
              done: index === endIndex
            };

      if (column === left + width - 1) {
        column = left;
        row += 1;
      } else {
        column += 1;
      }

      return result;
    }
  };
}

function convolveChannel({
  inputWidth,
  inputHeight,
  inputData,
  channel,
  filterSize,
  filter
}) {
  const data = [];
  let minValue = Number.MAX_SAFE_INTEGER;
  let maxValue = Number.MIN_SAFE_INTEGER;
  let left = 0;
  let top = 0;

  do {
    const iterator = getImageDataIterator({
      inputWidth,
      inputData,
      channel,
      left,
      top,
      width: filterSize,
      height: filterSize
    });

    let resultValue = 0;
    let filterIndex = 0;
    let item;

    do {
      item = iterator.next();

      if (item.value !== undefined) {
        resultValue += filter[filterIndex++] * item.value;
      }
    } while (!item.done);

    data.push(resultValue);

    if (resultValue < minValue) {
      minValue = resultValue;
    }

    if (resultValue > maxValue) {
      maxValue = resultValue;
    }

    if (left === inputWidth - filterSize) {
      left = 0;
      top += 1;
    } else {
      left += 1;
    }
  } while (top <= inputHeight - filterSize);

  return {
    data,
    minValue,
    maxValue
  };
}

function convolve({ inputWidth, inputHeight, inputData, filterSize, filter }) {
  const results = Object.values(CHANNEL).map(channel =>
    convolveChannel({
      inputWidth,
      inputHeight,
      inputData,
      channel,
      filterSize,
      filter
    })
  );
  const multipliers = results.map(
    ({ minValue, maxValue }) => 255 / (maxValue - minValue)
  );
  const data = [];

  for (let i = 0, len = results[0].data.length; i < len; i++) {
    for (let channel = 0; channel < 3; channel++) {
      data.push(
        Math.round(
          (results[channel].data[i] - results[channel].minValue) *
            multipliers[channel]
        )
      );
    }

    data.push(255); // alpha
  }

  return {
    outputData: data
  };
}

module.exports = {
  CHANNEL,
  convolveChannel,
  convolve
};
