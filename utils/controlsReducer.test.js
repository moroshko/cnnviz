import { INPUT_TYPES, LAYER_TYPES } from './constants';
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
      inputImage: expect.objectContaining({
        src: expect.any(String),
        scale: expect.any(Number),
      }),
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
      outputDataWidth: expect.any(Number),
      outputDataHeight: expect.any(Number),
    })
  );
});

const testInitialState = {
  inputType: INPUT_TYPES.IMAGE,
  inputImage: {
    src: 'some src',
    scale: 1,
  },
  hasRedChannel: true,
  hasGreenChannel: true,
  hasBlueChannel: true,
  layerType: LAYER_TYPES.CONV,
  convFilters: [
    {
      name: '3x3 filter',
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
      name: '5x5 filter',
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
  ],
  convFilterIndex: 0,
  convStride: 1,
  poolFilterSize: 2,
  poolStride: 2,
  convPadding: 1,
  scale: 1,
  outputDataWidth: 512,
  outputDataHeight: 384,
};

describe('UPDATE_INPUT_TYPE', () => {
  it('updates input type and affected parameters', () => {
    expect(
      controlsReducer(
        {
          ...testInitialState,
          inputType: INPUT_TYPES.CAMERA,
          inputImage: {
            src: 'some other src',
            scale: 16,
          },
        },
        {
          type: 'UPDATE_INPUT_TYPE',
          inputType: INPUT_TYPES.IMAGE,
        }
      )
    ).toMatchObject({
      inputType: INPUT_TYPES.IMAGE,
      scale: 16,
      outputDataWidth: 32,
      outputDataHeight: 24,
    });
  });
});

describe('UPDATE_CHANNELS', () => {
  it('updates a single channel', () => {
    expect(
      controlsReducer(testInitialState, {
        type: 'UPDATE_CHANNELS',
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
        type: 'UPDATE_CHANNELS',
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

describe('UPDATE_LAYER_TYPE', () => {
  it('updates layer type and affected parameters', () => {
    expect(
      controlsReducer(testInitialState, {
        type: 'UPDATE_LAYER_TYPE',
        layerType: LAYER_TYPES.POOL,
      })
    ).toMatchObject({
      layerType: LAYER_TYPES.POOL,
      outputDataWidth: 256,
      outputDataHeight: 192,
    });
  });
});

describe('UPDATE_CONV_STRIDE', () => {
  it('updates conv stride and affected parameters', () => {
    expect(
      controlsReducer(testInitialState, {
        type: 'UPDATE_CONV_STRIDE',
        convStride: 2,
      })
    ).toMatchObject({
      convStride: 2,
      convPadding: 0,
      outputDataWidth: 255,
      outputDataHeight: 191,
    });
  });
});

describe('UPDATE_CONV_FILTER_INDEX', () => {
  it('updates conv filter index', () => {
    expect(
      controlsReducer(testInitialState, {
        type: 'UPDATE_CONV_FILTER_INDEX',
        convFilterIndex: 1,
      })
    ).toMatchObject({
      convFilterIndex: 1,
    });
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
          type: 'UPDATE_CONV_FILTER_INDEX',
          convFilterIndex: 0,
        }
      )
    ).toMatchObject({
      convFilterIndex: 0,
      convStride: 3,
    });
  });
});

describe('UPDATE_CONV_FILTER_MATRIX', () => {
  it('does not update the conv filter when the filter is not editable', () => {
    expect(
      controlsReducer(testInitialState, {
        type: 'UPDATE_CONV_FILTER_MATRIX',
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
      }).convFilters[0]
    ).toEqual(testInitialState.convFilters[0]);
  });

  it('updates conv filter with errors', () => {
    expect(
      controlsReducer(testInitialState, {
        type: 'UPDATE_CONV_FILTER_MATRIX',
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
      }).convFilters[1]
    ).toEqual({
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
  });

  it('updates conv filter and other affected parameters', () => {
    const newState = controlsReducer(
      {
        ...testInitialState,
        convFilterIndex: 1,
        convStride: 5,
        convPadding: 0,
      },
      {
        type: 'UPDATE_CONV_FILTER_MATRIX',
        convFilterIndex: 1,
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

    expect(newState.convFilters[1]).toEqual({
      ...testInitialState.convFilters[1],
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
      convStride: 3,
      convPadding: 0,
      outputDataWidth: 170,
      outputDataHeight: 128,
    });
  });
});

describe('UPDATE_POOL_FILTER_SIZE', () => {
  it('updates pool filter size and affected parameters', () => {
    expect(
      controlsReducer(
        {
          ...testInitialState,
          layerType: LAYER_TYPES.POOL,
        },
        {
          type: 'UPDATE_POOL_FILTER_SIZE',
          poolFilterSize: 3,
        }
      )
    ).toMatchObject({
      poolFilterSize: 3,
      outputDataWidth: 255,
      outputDataHeight: 191,
    });
  });
});

describe('UPDATE_POOL_STRIDE', () => {
  it('updates pool stride and affected parameters', () => {
    expect(
      controlsReducer(
        {
          ...testInitialState,
          layerType: LAYER_TYPES.POOL,
        },
        {
          type: 'UPDATE_POOL_STRIDE',
          poolStride: 1,
        }
      )
    ).toMatchObject({
      poolStride: 1,
      outputDataWidth: 511,
      outputDataHeight: 383,
    });
  });
});
