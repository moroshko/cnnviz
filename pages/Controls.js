import {
  INPUT_TYPES,
  INPUT_TYPES_LABELS,
  LAYER_TYPES,
  LAYER_TYPES_LABELS,
  CONV_FILTERS
} from "../utils/constants";

export default class Controls extends React.Component {
  onInputTypeChange = event => {
    this.props.onInputTypeChange(event.target.value);
  };

  onLayerTypeChange = event => {
    this.props.onLayerTypeChange(event.target.value);
  };

  onConvFilterChange = event => {
    this.props.onConvFilterChange(CONV_FILTERS[event.target.value]);
  };

  render() {
    const {
      selectedInputType,
      selectedLayerType,
      selectedConvFilter
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
            Filter:
            {CONV_FILTERS.map((convFilter, index) => (
              <label key={index}>
                <input
                  type="radio"
                  name="convFilter"
                  value={index}
                  checked={CONV_FILTERS[index] === selectedConvFilter}
                  onChange={this.onConvFilterChange}
                />
                {convFilter.name}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  }
}
