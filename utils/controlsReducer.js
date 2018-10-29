import {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT,
  INPUT_TYPES,
  LAYER_TYPES
} from "./constants";
import { getOutputDimensions } from "./shared";

const IMAGES = [
  {
    src: "/static/digit_4.jpg",
    scale: 16
  },
  {
    src: "/static/Valley-Of-Gods-Photo-By-John-B-Mueller.jpg",
    scale: 1
  }
];

// prettier-ignore
const INITIAL_CONV_FILTERS = [
  {
    name: 'Edge detection',
    isEditable: false,
    filter: [
      0,  1, 0,
      1, -4, 1,
      0,  1, 0
    ]
  },
  {
    name: 'Blur',
    isEditable: false,
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
    isEditable: false,
    filter: [
       0, -1,  0,
      -1,  5, -1,
       0, -1,  0
    ]
  },
  {
    name: 'Custom (editable)',
    isEditable: true,
    filter: [
       0, 0, 0,
       0, 1, 0,
       0, 0, 0
    ]
  },
].map(convFilter => ({
  ...convFilter,
  filterSize: Math.sqrt(convFilter.filter.length),
  errors: convFilter.filter.map(_ => false)
}));

// TODO: Search for duplicates of this function
function getConvPadding({ convFilters, convFilterIndex, convStride }) {
  return (convFilters[convFilterIndex].filterSize - convStride) >> 1;
}

// TODO: Search for duplicates of this function
function getScale({ inputType, inputImage }) {
  return inputType === INPUT_TYPES.IMAGE ? inputImage.scale : 1;
}

// TODO: Search for duplicates of this function
function getLayerSpecificParams(state) {
  const { layerType } = state;

  switch (layerType) {
    case LAYER_TYPES.CONV: {
      const { convFilters, convFilterIndex, convPadding, convStride } = state;

      return {
        filterSize: convFilters[convFilterIndex].filterSize,
        padding: convPadding,
        stride: convStride
      };
    }

    case LAYER_TYPES.POOL: {
      const { poolFilterSize, poolStride } = state;

      return {
        filterSize: poolFilterSize,
        padding: 0,
        stride: poolStride
      };
    }

    default: {
      throw new Error(`Unknown layer type: ${layerType}`);
    }
  }
}

const initialControlsState = {
  inputType: INPUT_TYPES.IMAGE,
  inputImage: IMAGES[1],
  hasRedChannel: true,
  hasGreenChannel: true,
  hasBlueChannel: true,
  layerType: LAYER_TYPES.CONV,
  convFilters: INITIAL_CONV_FILTERS,
  convFilterIndex: 0,
  convStride: 1,
  poolFilterSize: 2,
  poolStride: 2
};

initialControlsState.convPadding = getConvPadding(initialControlsState);
initialControlsState.scale = getScale(initialControlsState);

const {
  outputWidth: outputDataWidth,
  outputHeight: outputDataHeight
} = getOutputDimensions({
  inputWidth: INPUT_DISPLAY_WIDTH / initialControlsState.scale,
  inputHeight: INPUT_DISPLAY_HEIGHT / initialControlsState.scale,
  ...getLayerSpecificParams(initialControlsState)
});

initialControlsState.outputDataWidth = outputDataWidth;
initialControlsState.outputDataHeight = outputDataHeight;

function controlsReducer(state, action) {
  switch (action.type) {
    case "UPDATE_INPUT_TYPE": {
      const { inputType } = action;
      const { inputImage } = state;
      const newScale = getScale({ inputType, inputImage });
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / newScale,
        inputHeight: INPUT_DISPLAY_HEIGHT / newScale,
        ...getLayerSpecificParams(state)
      });

      return {
        ...state,
        inputType,
        scale: newScale,
        outputDataWidth,
        outputDataHeight
      };
    }

    case "UPDATE_CHANNELS": {
      const { hasRedChannel, hasGreenChannel, hasBlueChannel } = action;

      return {
        ...state,
        hasRedChannel:
          hasRedChannel == null ? state.hasRedChannel : hasRedChannel,
        hasGreenChannel:
          hasGreenChannel == null ? state.hasGreenChannel : hasGreenChannel,
        hasBlueChannel:
          hasBlueChannel == null ? state.hasBlueChannel : hasBlueChannel
      };
    }

    case "UPDATE_LAYER_TYPE": {
      const { layerType } = action;
      const { scale } = state;
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / scale,
        ...getLayerSpecificParams({
          ...state,
          layerType
        })
      });

      return {
        ...state,
        layerType,
        outputDataWidth,
        outputDataHeight
      };
    }

    case "UPDATE_CONV_STRIDE": {
      const { convStride } = action;
      const { convFilters, convFilterIndex, scale } = state;
      const newConvPadding = getConvPadding({
        convFilters,
        convFilterIndex,
        convStride
      });
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / scale,
        filterSize: convFilters[convFilterIndex].filterSize,
        padding: newConvPadding,
        stride: convStride
      });

      return {
        ...state,
        convStride,
        convPadding: newConvPadding,
        outputDataWidth,
        outputDataHeight
      };
    }

    case "UPDATE_CONV_FILTER_INDEX": {
      const { convFilters, convStride } = state;
      const { convFilterIndex } = action;
      const newConvStride = Math.min(
        convStride,
        convFilters[convFilterIndex].filterSize
      );

      return {
        ...state,
        convFilterIndex,
        convStride: newConvStride
      };
    }

    case "UPDATE_CONV_FILTER_MATRIX": {
      const { convFilters } = state;
      const { convFilterIndex, filter, errors } = action;

      if (!convFilters[convFilterIndex].isEditable) {
        return state;
      }

      const filterSize = Math.sqrt(filter.length);
      const newConvFilters = [...convFilters];

      newConvFilters[convFilterIndex] = {
        ...newConvFilters[convFilterIndex],
        filter,
        filterSize,
        errors
      };

      if (errors.some(error => error === true)) {
        return {
          ...state,
          convFilters: newConvFilters
        };
      }

      const { convStride, scale } = state;
      const newConvStride = Math.min(convStride, filterSize);
      const newConvPadding = getConvPadding({
        convFilters: newConvFilters,
        convFilterIndex,
        convStride: newConvStride
      });
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / scale,
        filterSize,
        padding: newConvPadding,
        stride: newConvStride
      });

      return {
        ...state,
        convFilters: newConvFilters,
        convStride: newConvStride,
        convPadding: newConvPadding,
        outputDataWidth,
        outputDataHeight
      };

      return state;
    }

    case "UPDATE_POOL_FILTER_SIZE": {
      const { poolFilterSize } = action;
      const { poolStride, scale } = state;
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / scale,
        filterSize: poolFilterSize,
        padding: 0,
        stride: poolStride
      });

      return {
        ...state,
        poolFilterSize,
        outputDataWidth,
        outputDataHeight
      };
    }

    case "UPDATE_POOL_STRIDE": {
      const { poolStride } = action;
      const { poolFilterSize, scale } = state;
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / scale,
        filterSize: poolFilterSize,
        padding: 0,
        stride: poolStride
      });

      return {
        ...state,
        poolStride,
        outputDataWidth,
        outputDataHeight
      };
    }

    default: {
      return state;
    }
  }
}

export { initialControlsState, controlsReducer };
