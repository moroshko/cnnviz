import React from 'react';
import {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT,
  INPUT_TYPES,
  LAYER_TYPES,
  IMAGES,
} from './constants';
import { getOutputDimensions } from './shared';
import { convolve } from './convolution';
import { pool } from './pooling';

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
function getScale({ inputType, inputImageIndex }) {
  return inputType === INPUT_TYPES.IMAGE ? IMAGES[inputImageIndex].scale : 1;
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
        stride: convStride,
      };
    }

    case LAYER_TYPES.POOL: {
      const { poolFilterSize, poolStride } = state;

      return {
        filterSize: poolFilterSize,
        padding: 0,
        stride: poolStride,
      };
    }

    default: {
      throw new Error(`Unknown layer type: ${layerType}`);
    }
  }
}

const initialControlsState = {
  inputType: INPUT_TYPES.IMAGE,
  inputImageIndex: 0,
  hasRedChannel: true,
  hasGreenChannel: true,
  hasBlueChannel: true,
  layerType: LAYER_TYPES.CONV,
  convFilters: INITIAL_CONV_FILTERS,
  convFilterIndex: 0,
  convStride: 1,
  poolFilterSize: 2,
  poolStride: 2,
  inputData: null,
  inputWidth: null,
  inputHeight: null,
  outputData: null,
};

initialControlsState.convPadding = getConvPadding(initialControlsState);
initialControlsState.scale = getScale(initialControlsState);

const {
  outputWidth: outputDataWidth,
  outputHeight: outputDataHeight,
} = getOutputDimensions({
  inputWidth: INPUT_DISPLAY_WIDTH / initialControlsState.scale,
  inputHeight: INPUT_DISPLAY_HEIGHT / initialControlsState.scale,
  ...getLayerSpecificParams(initialControlsState),
});

initialControlsState.outputDataWidth = outputDataWidth;
initialControlsState.outputDataHeight = outputDataHeight;

function getOutputData(state, inputData) {
  const {
    layerType,
    convFilters,
    convFilterIndex,
    convStride,
    poolFilterSize,
    poolStride,
    inputWidth,
    inputHeight,
    outputDataWidth,
    outputDataHeight,
  } = state;

  switch (layerType) {
    case LAYER_TYPES.CONV: {
      const { filter, filterSize } = convFilters[convFilterIndex];

      return convolve({
        inputWidth,
        inputHeight,
        inputData,
        filter,
        filterSize,
        stride: convStride,
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight,
      }).outputData;
    }

    case LAYER_TYPES.POOL: {
      return pool({
        inputWidth,
        inputHeight,
        inputData,
        filterSize: poolFilterSize,
        stride: poolStride,
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight,
      }).outputData;
    }

    default: {
      throw new Error(`Unknown layer type: ${layerType}`);
    }
  }
}

function controlsReducer(state, action) {
  switch (action.type) {
    case 'INPUT_TYPE_CHANGE': {
      const { inputType } = action;
      const { inputImageIndex } = state;
      const newScale = getScale({ inputType, inputImageIndex });
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight,
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / newScale,
        inputHeight: INPUT_DISPLAY_HEIGHT / newScale,
        ...getLayerSpecificParams(state),
      });

      return {
        ...state,
        inputType,
        scale: newScale,
        outputDataWidth,
        outputDataHeight,
      };
    }

    case 'INPUT_IMAGE_CHANGE': {
      const { inputImageIndex } = action;
      const { inputType } = state;
      const newScale = getScale({
        inputType,
        inputImageIndex,
      });
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight,
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / newScale,
        inputHeight: INPUT_DISPLAY_HEIGHT / newScale,
        ...getLayerSpecificParams(state),
      });

      return {
        ...state,
        inputImageIndex,
        scale: newScale,
        outputDataWidth,
        outputDataHeight,
      };
    }

    case 'CHANNELS_CHANGE': {
      const { hasRedChannel, hasGreenChannel, hasBlueChannel } = action;

      return {
        ...state,
        hasRedChannel:
          hasRedChannel == null ? state.hasRedChannel : hasRedChannel,
        hasGreenChannel:
          hasGreenChannel == null ? state.hasGreenChannel : hasGreenChannel,
        hasBlueChannel:
          hasBlueChannel == null ? state.hasBlueChannel : hasBlueChannel,
      };
    }

    case 'LAYER_TYPE_CHANGE': {
      const { scale } = state;
      const { layerType } = action;
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight,
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / scale,
        ...getLayerSpecificParams({
          ...state,
          layerType,
        }),
      });

      return {
        ...state,
        layerType,
        outputDataWidth,
        outputDataHeight,
      };
    }

    case 'CONV_STRIDE_CHANGE': {
      const { convStride } = action;
      const { convFilters, convFilterIndex, scale } = state;
      const newConvPadding = getConvPadding({
        convFilters,
        convFilterIndex,
        convStride,
      });
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight,
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / scale,
        filterSize: convFilters[convFilterIndex].filterSize,
        padding: newConvPadding,
        stride: convStride,
      });

      return {
        ...state,
        convStride,
        convPadding: newConvPadding,
        outputDataWidth,
        outputDataHeight,
      };
    }

    case 'CONV_FILTER_INDEX_CHANGE': {
      const { convFilterIndex } = action;
      const { convFilters, convStride, scale, inputData } = state;
      const newConvStride = Math.min(
        convStride,
        convFilters[convFilterIndex].filterSize
      );
      const newConvPadding = getConvPadding({
        convFilters,
        convFilterIndex,
        convStride: newConvStride,
      });
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight,
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / scale,
        filterSize: convFilters[convFilterIndex].filterSize,
        padding: newConvPadding,
        stride: newConvStride,
      });
      const newState = {
        ...state,
        convFilterIndex,
        convStride: newConvStride,
        convPadding: newConvPadding,
        outputDataWidth,
        outputDataHeight,
      };
      const outputData = getOutputData(newState, inputData);

      return {
        ...newState,
        outputData,
      };
    }

    case 'CONV_FILTER_MATRIX_CHANGE': {
      const { convFilterIndex, filter, errors } = action;
      const { convFilters } = state;

      if (!convFilters[convFilterIndex].isEditable) {
        return state;
      }

      const filterSize = Math.sqrt(filter.length);
      const newConvFilters = [...convFilters];

      newConvFilters[convFilterIndex] = {
        ...newConvFilters[convFilterIndex],
        filter,
        filterSize,
        errors,
      };

      if (errors.some(error => error === true)) {
        return {
          ...state,
          convFilters: newConvFilters,
        };
      }

      const { convStride, scale, inputData } = state;
      const newConvStride = Math.min(convStride, filterSize);
      const newConvPadding = getConvPadding({
        convFilters: newConvFilters,
        convFilterIndex,
        convStride: newConvStride,
      });
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight,
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / scale,
        filterSize,
        padding: newConvPadding,
        stride: newConvStride,
      });
      const newState = {
        ...state,
        convFilters: newConvFilters,
        convFilterIndex,
        convStride: newConvStride,
        convPadding: newConvPadding,
        outputDataWidth,
        outputDataHeight,
      };
      const outputData = getOutputData(newState, inputData);

      return {
        ...newState,
        outputData,
      };
    }

    case 'POOL_FILTER_SIZE_CHANGE': {
      const { poolFilterSize } = action;
      const { poolStride, scale } = state;
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight,
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / scale,
        filterSize: poolFilterSize,
        padding: 0,
        stride: poolStride,
      });

      return {
        ...state,
        poolFilterSize,
        outputDataWidth,
        outputDataHeight,
      };
    }

    case 'POOL_STRIDE_CHANGE': {
      const { poolStride } = action;
      const { poolFilterSize, scale } = state;
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight,
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / scale,
        filterSize: poolFilterSize,
        padding: 0,
        stride: poolStride,
      });

      return {
        ...state,
        poolStride,
        outputDataWidth,
        outputDataHeight,
      };
    }

    case 'INPUT_DATA_CHANGE': {
      const { inputData, inputWidth, inputHeight } = action;
      const newState = {
        ...state,
        inputData,
        inputWidth,
        inputHeight,
      };
      const outputData = getOutputData(newState, inputData);

      return {
        ...newState,
        outputData,
      };
    }

    default: {
      return state;
    }
  }
}

const ControlsContext = React.createContext(null);

export { initialControlsState, controlsReducer, ControlsContext };
