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

  onLayerTypeChange = event => {
    this.props.onLayerTypeChange(event.target.value);
  };

  onConvStrideChange = event => {
    this.props.onConvStrideChange(parseInt(event.target.value, 10));
  };

  onPoolStrideChange = event => {
    this.props.onPoolStrideChange(parseInt(event.target.value, 10));
  };

  onConvFilterIndexChange = event => {
    const { onConvFilterIndexChange } = this.props;

    onConvFilterIndexChange(parseInt(event.target.value, 10));
  };

  render() {
    const {
      selectedInputType,
      selectedLayerType,
      convStride,
      onConvStrideChange,
      convFilters,
      selectedConvFilterIndex,
      onConvFilterMatrixChange,
      poolStride,
      onPoolStrideChange
    } = this.props;

    return (
      <div>
        <div>
          Input:
          {Object.keys(INPUT_TYPES).map(inputType => (
            <label key={inputType}>
              <input
                type="radio"
                name="inputType"
                value={inputType}
                checked={inputType === selectedInputType}
                onChange={this.onInputTypeChange}
              />
              {INPUT_TYPES_LABELS[inputType]}
            </label>
          ))}
        </div>
        <div>
          Layer:
          {Object.keys(LAYER_TYPES).map(layerType => (
            <label key={layerType}>
              <input
                type="radio"
                name="layerType"
                value={layerType}
                checked={layerType === selectedLayerType}
                onChange={this.onLayerTypeChange}
              />
              {LAYER_TYPES_LABELS[layerType]}
            </label>
          ))}
        </div>
        {selectedLayerType === LAYER_TYPES.CONV && (
          <div>
            Stride:
            <input
              type="range"
              min="1"
              max="5"
              value={convStride}
              onChange={this.onConvStrideChange}
            />
            {convStride}
          </div>
        )}
        {selectedLayerType === LAYER_TYPES.POOL && (
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
        {selectedLayerType === LAYER_TYPES.CONV && (
          <div style={{ display: "flex" }}>
            Filter:
            {convFilters.map((convFilter, index) => (
              <div style={{ marginLeft: index > 0 ? 50 : 0 }} key={index}>
                <label>
                  <input
                    type="radio"
                    name="convFilter"
                    value={index}
                    checked={index === selectedConvFilterIndex}
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
    );
  }
}
