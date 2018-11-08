import { INPUT_TYPES, LAYER_TYPES } from './constants';
import { randomInputData } from './testing';
import { convolve } from './convolution';
import { initialControlsState, controlsReducer } from './controlsReducer';

function expectEnum(ENUM_OBJECT) {
  return expect.stringMatching(
    new RegExp('^' + Object.values(ENUM_OBJECT).join('|') + '$')
  );
}

it('initial state has the right shape', () => {
  expect(initialControlsState).toEqual(
    expect.objectContaining({
      inputType: expectEnum(INPUT_TYPES),
      inputImageIndex: expect.any(Number),
      hasRedChannel: expect.any(Boolean),
      hasGreenChannel: expect.any(Boolean),
      hasBlueChannel: expect.any(Boolean),
      layerType: expectEnum(LAYER_TYPES),
      convFilters: expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
          isEditable: expect.any(Boolean),
          filter: expect.arrayContaining([expect.any(Number)]),
          filterSize: expect.any(Number),
          errors: expect.arrayContaining([expect.any(Boolean)]),
        }),
      ]),
      convFilterIndex: expect.any(Number),
      convStride: expect.any(Number),
      poolFilterSize: expect.any(Number),
      poolStride: expect.any(Number),
      convPadding: expect.any(Number),
      scale: expect.any(Number),
      inputData: null,
      inputWidth: null,
      inputHeight: null,
      outputData: null,
      outputDataWidth: expect.any(Number),
      outputDataHeight: expect.any(Number),
    })
  );
});

const testInitialState = {
  inputType: INPUT_TYPES.IMAGE,
  inputImageIndex: 0,
  hasRedChannel: true,
  hasGreenChannel: true,
  hasBlueChannel: true,
  layerType: LAYER_TYPES.CONV,
  convFilters: [
    {
      name: 'Not editable 3x3 filter',
      isEditable: false,
      // prettier-ignore
      filter: [
        1, 2, 3,
        4, 5, 6,
        7, 8, 9
      ],
      filterSize: 3,
      // prettier-ignore
      errors: [
        false, false, false,
        false, false, false,
        false, false, false
      ]
    },
    {
      name: 'Editable 5x5 filter',
      isEditable: true,
      // prettier-ignore
      filter: [
        -0.1, -0.2, -0.3, -0.4,  -0.5,
         0.6,  0.7,  0.8,  0.9,     1,
           0,   10,   20,   30,    40,
         -15,  -20,  -25,   80,   100,
       14.98, 18.2, -2.4, 0.02, -0.01
      ],
      filterSize: 5,
      // prettier-ignore
      errors: [
        false, false, false, false, false,
        false, false, false, false, false,
        false, false, false, false, false,
        false, false, false, false, false,
        false, false, false, false, false,
      ]
    },
    {
      name: 'Editable 3x3 filter',
      isEditable: true,
      // prettier-ignore
      filter: [
        -1, -2, -3,
        -4, -5, -6,
        -7, -8, -9
      ],
      filterSize: 3,
      // prettier-ignore
      errors: [
        false, false, false,
        false, false, false,
        false, false, false
      ]
    },
  ],
  convFilterIndex: 0,
  convStride: 1,
  poolFilterSize: 2,
  poolStride: 2,
  convPadding: 1,
  scale: 1,
  inputData: null,
  inputWidth: null,
  inputHeight: null,
  outputData: null,
  outputDataWidth: 512,
  outputDataHeight: 384,
};

describe('INPUT_TYPE_CHANGE', () => {
  it('updates input type and affected parameters', () => {
    const newState = controlsReducer(
      {
        ...testInitialState,
        inputType: INPUT_TYPES.CAMERA,
        inputImageIndex: 1,
      },
      {
        type: 'INPUT_TYPE_CHANGE',
        inputType: INPUT_TYPES.IMAGE,
      }
    );

    expect(newState).toMatchObject({
      inputType: INPUT_TYPES.IMAGE,
      scale: 16,
      outputDataWidth: 32,
      outputDataHeight: 24,
    });
    expect(newState.outputData).not.toBe(testInitialState.outputData);
  });
});

describe('INPUT_IMAGE_CHANGE', () => {
  it('updates input image and affected parameters', () => {
    const newState = controlsReducer(testInitialState, {
      type: 'INPUT_IMAGE_CHANGE',
      inputImageIndex: 1,
    });

    expect(newState).toMatchObject({
      inputImageIndex: 1,
      scale: 16,
      outputDataWidth: 32,
      outputDataHeight: 24,
    });
    expect(newState.outputData).not.toBe(testInitialState.outputData);
  });
});

describe('CHANNELS_CHANGE', () => {
  it('updates a single channel', () => {
    expect(
      controlsReducer(testInitialState, {
        type: 'CHANNELS_CHANGE',
        hasRedChannel: false,
      })
    ).toEqual(
      expect.objectContaining({
        hasRedChannel: false,
        hasGreenChannel: true,
        hasBlueChannel: true,
      })
    );
  });

  it('updates multiple channels', () => {
    expect(
      controlsReducer(testInitialState, {
        type: 'CHANNELS_CHANGE',
        hasGreenChannel: false,
        hasBlueChannel: false,
      })
    ).toEqual(
      expect.objectContaining({
        hasRedChannel: true,
        hasGreenChannel: false,
        hasBlueChannel: false,
      })
    );
  });
});

describe('LAYER_TYPE_CHANGE', () => {
  it('updates layer type and affected parameters', () => {
    const newState = controlsReducer(testInitialState, {
      type: 'LAYER_TYPE_CHANGE',
      layerType: LAYER_TYPES.POOL,
    });

    expect(newState).toMatchObject({
      layerType: LAYER_TYPES.POOL,
      outputDataWidth: 256,
      outputDataHeight: 192,
    });
    expect(newState.outputData).not.toBe(testInitialState.outputData);
  });
});

describe('CONV_STRIDE_CHANGE', () => {
  it('updates conv stride and affected parameters', () => {
    const newState = controlsReducer(testInitialState, {
      type: 'CONV_STRIDE_CHANGE',
      convStride: 2,
    });

    expect(newState).toMatchObject({
      convStride: 2,
      convPadding: 0,
      outputDataWidth: 255,
      outputDataHeight: 191,
    });
    expect(newState.outputData).not.toBe(testInitialState.outputData);
  });
});

describe('CONV_FILTER_INDEX_CHANGE', () => {
  it('updates conv filter index and affected parameters', () => {
    const newState = controlsReducer(testInitialState, {
      type: 'CONV_FILTER_INDEX_CHANGE',
      convFilterIndex: 1,
    });

    expect(newState).toMatchObject({
      convFilterIndex: 1,
      convPadding: 2,
      outputDataWidth: 512,
      outputDataHeight: 384,
    });
    expect(newState.outputData).not.toBe(testInitialState.outputData);
  });

  it('when the stride becomes invalid, updates the stride to the new max possible', () => {
    expect(
      controlsReducer(
        {
          ...testInitialState,
          convFilterIndex: 1,
          convStride: 5,
          convPadding: 0,
        },
        {
          type: 'CONV_FILTER_INDEX_CHANGE',
          convFilterIndex: 0,
        }
      )
    ).toMatchObject({
      convFilterIndex: 0,
      convStride: 3,
    });
  });
});

describe('CONV_FILTER_MATRIX_CHANGE', () => {
  it('does not update the conv filter when the filter is not editable', () => {
    const newState = controlsReducer(testInitialState, {
      type: 'CONV_FILTER_MATRIX_CHANGE',
      convFilterIndex: 0,
      // prettier-ignore
      filter: [
        1, 2, 3,
        4, 5, 6,
        7, 8, 100
      ],
      // prettier-ignore
      errors: [
        false, false, false,
        false, false, false,
        false, false, false
      ]
    });

    expect(newState.convFilters[0]).toEqual(testInitialState.convFilters[0]);
    expect(newState.outputData).toBe(testInitialState.outputData);
  });

  it('updates conv filter with errors', () => {
    const newState = controlsReducer(testInitialState, {
      type: 'CONV_FILTER_MATRIX_CHANGE',
      convFilterIndex: 1,
      // prettier-ignore
      filter: [
         -0.1, -0.2, -0.3, -0.4,  -0.5,
          0.6,  0.7,  0.8,  0.9,     1,
            0,   10,   20,   30,    40,
          -15,  -20,  -25,   80,   100,
        14.98, 18.2, -2.4, 0.02, "-0.01abc"
      ],
      // prettier-ignore
      errors: [
        false, false, false, false, false,
        false, false, false, false, false,
        false, false, false, false, false,
        false, false, false, false, false,
        false, false, false, false, true,
      ]
    });

    expect(newState.convFilters[1]).toEqual({
      ...testInitialState.convFilters[1],
      // prettier-ignore
      filter: [
         -0.1, -0.2, -0.3, -0.4,  -0.5,
          0.6,  0.7,  0.8,  0.9,     1,
            0,   10,   20,   30,    40,
          -15,  -20,  -25,   80,   100,
        14.98, 18.2, -2.4, 0.02, "-0.01abc"
      ],
      // prettier-ignore
      errors: [
        false, false, false, false, false,
        false, false, false, false, false,
        false, false, false, false, false,
        false, false, false, false, false,
        false, false, false, false, true,
      ]
    });
    expect(newState.outputData).toBe(testInitialState.outputData);
  });

  it('updates conv filter and affected parameters', () => {
    const newState = controlsReducer(
      {
        ...testInitialState,
        convFilterIndex: 1,
        convStride: 5,
        convPadding: 0,
      },
      {
        type: 'CONV_FILTER_MATRIX_CHANGE',
        convFilterIndex: 2,
        // prettier-ignore
        filter: [
          10, 20, 30,
          40, 50, 60,
          70, 80, 90
        ],
        // prettier-ignore
        errors: [
          false, false, false,
          false, false, false,
          false, false, false
        ]
      }
    );

    expect(newState.convFilters[2]).toEqual({
      ...testInitialState.convFilters[2],
      // prettier-ignore
      filter: [
        10, 20, 30,
        40, 50, 60,
        70, 80, 90
      ],
      filterSize: 3,
      // prettier-ignore
      errors: [
        false, false, false,
        false, false, false,
        false, false, false
      ]
    });
    expect(newState).toMatchObject({
      convFilterIndex: 2,
      convStride: 3,
      convPadding: 0,
      outputDataWidth: 170,
      outputDataHeight: 128,
    });
    expect(newState.outputData).not.toBe(testInitialState.outputData);
  });
});

describe('POOL_FILTER_SIZE_CHANGE', () => {
  it('updates pool filter size and affected parameters', () => {
    const newState = controlsReducer(
      {
        ...testInitialState,
        layerType: LAYER_TYPES.POOL,
      },
      {
        type: 'POOL_FILTER_SIZE_CHANGE',
        poolFilterSize: 3,
      }
    );

    expect(newState).toMatchObject({
      poolFilterSize: 3,
      outputDataWidth: 255,
      outputDataHeight: 191,
    });
    expect(newState.outputData).not.toBe(testInitialState.outputData);
  });
});

describe('POOL_STRIDE_CHANGE', () => {
  it('updates pool stride and affected parameters', () => {
    const newState = controlsReducer(
      {
        ...testInitialState,
        layerType: LAYER_TYPES.POOL,
      },
      {
        type: 'POOL_STRIDE_CHANGE',
        poolStride: 1,
      }
    );

    expect(newState).toMatchObject({
      poolStride: 1,
      outputDataWidth: 511,
      outputDataHeight: 383,
    });
    expect(newState.outputData).not.toBe(testInitialState.outputData);
  });
});

describe('INPUT_DATA_CHANGE', () => {
  it('updates input data and affected parameters', () => {
    const inputWidth = 514;
    const inputHeight = 386;
    const inputData = randomInputData(inputWidth, inputHeight);
    const {
      convFilters,
      convFilterIndex,
      convStride,
      outputDataWidth,
      outputDataHeight,
    } = testInitialState;
    const { filter, filterSize } = convFilters[convFilterIndex];
    const { outputData } = convolve({
      inputWidth,
      inputHeight,
      inputData,
      filter,
      filterSize,
      stride: convStride,
      outputWidth: outputDataWidth,
      outputHeight: outputDataHeight,
    });
    const newState = controlsReducer(testInitialState, {
      type: 'INPUT_DATA_CHANGE',
      inputData,
      inputWidth,
      inputHeight,
    });

    expect(newState.inputData).toBe(inputData);
    expect(newState).toMatchObject({
      inputWidth,
      inputHeight,
    });
    expect(newState.outputData).toEqual(outputData);
  });
});
