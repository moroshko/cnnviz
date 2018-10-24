import { Fragment } from "react";
import {
  INPUT_TYPES,
  INPUT_TYPES_LABELS,
  LAYER_TYPES,
  LAYER_TYPES_LABELS
} from "../utils/constants";
import Matrix from "./Matrix";

export default class Controls extends React.Component {
  onInputTypeChange = event => {
    this.props.onInputTypeChange(event.target.value);
  };

  onHasRedChannelChange = event => {
    this.props.onHasRedChannelChange(event.target.checked);
  };

  onHasGreenChannelChange = event => {
    this.props.onHasGreenChannelChange(event.target.checked);
  };

  onHasBlueChannelChange = event => {
    this.props.onHasBlueChannelChange(event.target.checked);
  };

  onLayerTypeChange = event => {
    this.props.onLayerTypeChange(event.target.value);
  };

  onConvStrideChange = event => {
    this.props.onConvStrideChange(parseInt(event.target.value, 10));
  };

  onConvFilterIndexChange = event => {
    const { onConvFilterIndexChange } = this.props;

    onConvFilterIndexChange(parseInt(event.target.value, 10));
  };

  onPoolFilterSizeChange = event => {
    const { onPoolFilterSizeChange } = this.props;

    onPoolFilterSizeChange(parseInt(event.target.value, 10));
  };

  onPoolStrideChange = event => {
    this.props.onPoolStrideChange(parseInt(event.target.value, 10));
  };

  render() {
    const {
      inputType,
      hasRedChannel,
      hasGreenChannel,
      hasBlueChannel,
      layerType,
      convStride,
      onConvStrideChange,
      convFilters,
      convFilterIndex,
      onConvFilterMatrixChange,
      poolFilterSize,
      poolStride,
      onPoolStrideChange
    } = this.props;

    return (
      <Fragment>
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
                  onChange={this.onInputTypeChange}
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
                onChange={this.onHasRedChannelChange}
              />
              Red
            </label>
            <label>
              <input
                type="checkbox"
                checked={hasGreenChannel}
                onChange={this.onHasGreenChannelChange}
              />
              Green
            </label>
            <label>
              <input
                type="checkbox"
                checked={hasBlueChannel}
                onChange={this.onHasBlueChannelChange}
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
                  onChange={this.onLayerTypeChange}
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
                onChange={this.onConvStrideChange}
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
                onChange={this.onPoolFilterSizeChange}
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
                onChange={this.onPoolStrideChange}
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
                      onChange={this.onConvFilterIndexChange}
                    />
                    {convFilter.name}
                  </label>
                  <Matrix
                    isEditable={convFilter.isEditable}
                    rows={convFilter.filterSize}
                    columns={convFilter.filterSize}
                    data={convFilter.filter}
                    errors={convFilter.errors}
                    onChange={(data, errors) => {
                      onConvFilterMatrixChange(index, data, errors);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <style jsx>{`
          .container {
            margin-top: 30px;
          }
          .filtersContainer {
            display: flex;
          }
        `}</style>
      </Fragment>
    );
  }
}
