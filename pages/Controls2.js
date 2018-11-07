import React, { useContext } from 'react';
import {
  INPUT_TYPES,
  INPUT_TYPES_LABELS,
  LAYER_TYPES,
  LAYER_TYPES_LABELS,
  IMAGES,
} from '../utils/constants';
import { ControlsContext } from '../utils/controlsReducer';
import Matrix from './Matrix';

export default function Controls2() {
  const { controls, dispatchControlsChange } = useContext(ControlsContext);
  const {
    inputType,
    inputImageIndex,
    hasRedChannel,
    hasGreenChannel,
    hasBlueChannel,
    layerType,
    convStride,
    convFilters,
    convFilterIndex,
    poolFilterSize,
    poolStride,
  } = controls;

  function dispatchString(type, key) {
    return event => {
      dispatchControlsChange({
        type,
        [key]: event.target.value,
      });
    };
  }

  function dispatchNumber(type, key) {
    return event => {
      dispatchControlsChange({
        type,
        [key]: Number(event.target.value),
      });
    };
  }

  function dispatchBoolean(type, key) {
    return event => {
      dispatchControlsChange({
        type,
        [key]: event.target.checked,
      });
    };
  }

  return (
    <div className="container">
      <div>
        Input:
        {Object.keys(INPUT_TYPES).map(_inputType => (
          <label key={_inputType}>
            <input
              type="radio"
              name="inputType"
              value={_inputType}
              checked={_inputType === inputType}
              onChange={dispatchString('INPUT_TYPE_CHANGE', 'inputType')}
            />
            {INPUT_TYPES_LABELS[_inputType]}
          </label>
        ))}
      </div>
      {inputType === INPUT_TYPES.IMAGE && (
        <div className="inputImagesContainer">
          {IMAGES.map((image, index) => (
            <label key={index}>
              <input
                type="radio"
                name="inputImage"
                value={index}
                checked={index === inputImageIndex}
                onChange={dispatchNumber(
                  'INPUT_IMAGE_CHANGE',
                  'inputImageIndex'
                )}
              />
              {image.name}
            </label>
          ))}
        </div>
      )}
      <div>
        Channels:
        <label>
          <input
            type="checkbox"
            checked={hasRedChannel}
            onChange={dispatchBoolean('CHANNELS_CHANGE', 'hasRedChannel')}
          />
          Red
        </label>
        <label>
          <input
            type="checkbox"
            checked={hasGreenChannel}
            onChange={dispatchBoolean('CHANNELS_CHANGE', 'hasGreenChannel')}
          />
          Green
        </label>
        <label>
          <input
            type="checkbox"
            checked={hasBlueChannel}
            onChange={dispatchBoolean('CHANNELS_CHANGE', 'hasBlueChannel')}
          />
          Blue
        </label>
      </div>
      <div>
        Layer:
        {Object.keys(LAYER_TYPES).map(_layerType => (
          <label key={_layerType}>
            <input
              type="radio"
              name="layerType"
              value={_layerType}
              checked={_layerType === layerType}
              onChange={dispatchString('LAYER_TYPE_CHANGE', 'layerType')}
            />
            {LAYER_TYPES_LABELS[_layerType]}
          </label>
        ))}
      </div>
      {layerType === LAYER_TYPES.CONV && (
        <div>
          Stride:
          <input
            type="range"
            min="1"
            max={convFilters[convFilterIndex].filterSize}
            value={convStride}
            onChange={dispatchNumber('CONV_STRIDE_CHANGE', 'convStride')}
          />
          {convStride}
        </div>
      )}
      {layerType === LAYER_TYPES.POOL && (
        <div>
          Filter Size:
          <input
            type="range"
            min="1"
            max="5"
            value={poolFilterSize}
            onChange={dispatchNumber(
              'POOL_FILTER_SIZE_CHANGE',
              'poolFilterSize'
            )}
          />
          {poolFilterSize}
        </div>
      )}
      {layerType === LAYER_TYPES.POOL && (
        <div>
          Stride:
          <input
            type="range"
            min="1"
            max="5"
            value={poolStride}
            onChange={dispatchNumber('POOL_STRIDE_CHANGE', 'poolStride')}
          />
          {poolStride}
        </div>
      )}
      {layerType === LAYER_TYPES.CONV && (
        <div className="filtersContainer">
          Filter:
          {convFilters.map((convFilter, index) => (
            <div style={{ marginLeft: index > 0 ? 50 : 0 }} key={index}>
              <label>
                <input
                  type="radio"
                  name="convFilter"
                  value={index}
                  checked={index === convFilterIndex}
                  onChange={dispatchNumber(
                    'CONV_FILTER_INDEX_CHANGE',
                    'convFilterIndex'
                  )}
                />
                {convFilter.name}
              </label>
              <Matrix
                isEditable={convFilter.isEditable}
                rows={convFilter.filterSize}
                columns={convFilter.filterSize}
                data={convFilter.filter}
                errors={convFilter.errors}
                onChange={(filter, errors) => {
                  dispatchControlsChange({
                    type: 'CONV_FILTER_MATRIX_CHANGE',
                    convFilterIndex: index,
                    filter,
                    errors,
                  });
                }}
              />
            </div>
          ))}
        </div>
      )}
      <style jsx>{`
        .container {
          margin-top: 30px;
        }
        .inputImagesContainer {
          padding-left: 38px;
        }
        .filtersContainer {
          display: flex;
        }
      `}</style>
    </div>
  );
}
