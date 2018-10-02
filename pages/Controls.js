import {
  INPUT_TYPES,
  INPUT_TYPES_LABELS,
  LAYER_TYPES,
  LAYER_TYPES_LABELS
} from "../utils/constants";

export default class extends React.Component {
  onInputTypeChange = event => {
    this.props.onInputTypeChange(event.target.value);
  };

  onLayerTypeChange = event => {
    this.props.onLayerTypeChange(event.target.value);
  };

  render() {
    const { selectedInputType, selectedLayerType } = this.props;

    return (
      <div>
        <div>
          Input:
          {Object.keys(INPUT_TYPES).map(inputType => (
            <label key={inputType}>
              <input
                type="radio"
                name="input"
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
                name="layer"
                value={layerType}
                checked={layerType === selectedLayerType}
                onChange={this.onLayerTypeChange}
              />
              {LAYER_TYPES_LABELS[layerType]}
            </label>
          ))}
        </div>
      </div>
    );
  }
}
