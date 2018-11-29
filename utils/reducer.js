import React from 'react';
import round from 'lodash.round';
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
import { gaussianBlur } from './filters';

function roundToString(number) {
  return String(round(number, 4));
}

const INITIAL_CONV_FILTERS = [
  {
    name: 'Edge detection',
    isEditable: true,
    // prettier-ignore
    filter: [
      1, 0, -1,
      2, 0, -2,
      1, 0, -1
    ].map(roundToString)
  },
  {
    name: 'Gaussian Blur (σ = 10)',
    isEditable: true,
    knobs: [
      {
        leftLabel: filterSize => `Size = ${filterSize}`,
        min: 3,
        max: 9,
        step: 2,
        value: 7,
      },
    ],
    filterFn: filterSize => gaussianBlur(filterSize, 10).map(roundToString),
  },
].map(convFilter => {
  const filter = convFilter.filterFn
    ? convFilter.filterFn(...convFilter.knobs.map(knob => knob.value))
    : convFilter.filter;

  return {
    ...convFilter,
    filterSize: Math.sqrt(filter.length),
    filter,
    errors: filter.map(_ => false),
  };
});

function getConvPadding({ convFilters, convFilterIndex, convStride }) {
  return (convFilters[convFilterIndex].filterSize - convStride) >> 1;
}

function getScale({ inputType, inputImageIndex }) {
  return inputType === INPUT_TYPES.IMAGE ? IMAGES[inputImageIndex].scale : 1;
}

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

const initialState = {
  inputType: INPUT_TYPES.IMAGE,
  inputImageIndex: 1,
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
  overlayGridX: 0,
  overlayGridY: 0,
  outputData: null,
};

initialState.convPadding = getConvPadding(initialState);
initialState.scale = getScale(initialState);

const {
  outputWidth: outputDataWidth,
  outputHeight: outputDataHeight,
} = getOutputDimensions({
  inputWidth: INPUT_DISPLAY_WIDTH / initialState.scale,
  inputHeight: INPUT_DISPLAY_HEIGHT / initialState.scale,
  ...getLayerSpecificParams(initialState),
});

initialState.outputDataWidth = outputDataWidth;
initialState.outputDataHeight = outputDataHeight;

function getOutputData(state) {
  const {
    layerType,
    convFilters,
    convFilterIndex,
    convStride,
    poolFilterSize,
    poolStride,
    inputData,
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
        filter: filter.map(x => Number(x)),
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

function reducer(state, action) {
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
      const newState = {
        ...state,
        inputType,
        scale: newScale,
        outputDataWidth,
        outputDataHeight,
      };
      const outputData = getOutputData(newState);

      return {
        ...newState,
        outputData,
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
      const newState = {
        ...state,
        inputImageIndex,
        scale: newScale,
        outputDataWidth,
        outputDataHeight,
      };
      const outputData = getOutputData(newState);

      return {
        ...newState,
        outputData,
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
      const newState = {
        ...state,
        layerType,
        outputDataWidth,
        outputDataHeight,
      };
      const outputData = getOutputData(newState);

      return {
        ...newState,
        outputData,
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
      const newState = {
        ...state,
        convStride,
        convPadding: newConvPadding,
        outputDataWidth,
        outputDataHeight,
      };
      const outputData = getOutputData(newState);

      return {
        ...newState,
        outputData,
      };
    }

    case 'CONV_FILTER_INDEX_CHANGE': {
      const { convFilterIndex } = action;
      const { convFilters, convStride, scale } = state;
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
      const outputData = getOutputData(newState);

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

      const { convStride, scale } = state;
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

      const outputData = getOutputData(newState);

      return {
        ...newState,
        outputData,
      };
    }

    case 'CONV_FILTER_KNOB_CHANGE': {
      const { convFilterIndex, knobIndex, value } = action;
      const { convFilters, convStride, scale } = state;
      const convFilter = convFilters[convFilterIndex];
      const { filterFn, knobs } = convFilter;
      const newKnobs = [...knobs];

      newKnobs[knobIndex] = {
        ...knobs[knobIndex],
        value,
      };

      const filter = filterFn(...newKnobs.map(knob => knob.value));
      const filterSize = Math.sqrt(filter.length);
      const newConvFilters = [...convFilters];

      newConvFilters[convFilterIndex] = {
        ...convFilter,
        filter,
        filterSize,
        knobs: newKnobs,
      };

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

      const outputData = getOutputData(newState);

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
      const newState = {
        ...state,
        poolFilterSize,
        outputDataWidth,
        outputDataHeight,
      };
      const outputData = getOutputData(newState);

      return {
        ...newState,
        outputData,
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
      const newState = {
        ...state,
        poolStride,
        outputDataWidth,
        outputDataHeight,
      };
      const outputData = getOutputData(newState);

      return {
        ...newState,
        outputData,
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
      const outputData = getOutputData(newState);

      return {
        ...newState,
        outputData,
      };
    }

    case 'OVERLAY_GRID_POSITION_CHANGE': {
      const { overlayGridX, overlayGridY } = action;

      return {
        ...state,
        overlayGridX,
        overlayGridY,
      };
    }

    default: {
      return state;
    }
  }
}

const AppContext = React.createContext(null);

export { initialState, reducer, AppContext };
