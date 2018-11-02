import React, { useContext } from 'react';
import {
  INPUT_TYPES,
  INPUT_TYPES_LABELS,
  LAYER_TYPES,
  LAYER_TYPES_LABELS,
} from '../utils/constants';
import { ControlsContext } from '../utils/controlsReducer';
import Matrix from './Matrix';

export default function Controls2() {
  const { controls, dispatchControlsChange } = useContext(ControlsContext);
  const {
    inputType,
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
              onChange={dispatchString('UPDATE_INPUT_TYPE', 'inputType')}
            />
            {INPUT_TYPES_LABELS[_inputType]}
          </label>
        ))}
      </div>
      <div>
        Channels:
        <label>
          <input
            type="checkbox"
            checked={hasRedChannel}
            onChange={dispatchBoolean('UPDATE_CHANNELS', 'hasRedChannel')}
          />
          Red
        </label>
        <label>
          <input
            type="checkbox"
            checked={hasGreenChannel}
            onChange={dispatchBoolean('UPDATE_CHANNELS', 'hasGreenChannel')}
          />
          Green
        </label>
        <label>
          <input
            type="checkbox"
            checked={hasBlueChannel}
            onChange={dispatchBoolean('UPDATE_CHANNELS', 'hasBlueChannel')}
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
              onChange={dispatchString('UPDATE_LAYER_TYPE', 'layerType')}
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
            onChange={dispatchNumber('UPDATE_CONV_STRIDE', 'convStride')}
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
              'UPDATE_POOL_FILTER_SIZE',
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
            onChange={dispatchNumber('UPDATE_POOL_STRIDE', 'poolStride')}
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
                    'UPDATE_CONV_FILTER_INDEX',
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
                    type: 'UPDATE_CONV_FILTER_MATRIX',
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
        .filtersContainer {
          display: flex;
        }
      `}</style>
    </div>
  );
}
