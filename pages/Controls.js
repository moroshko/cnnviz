import {
  INPUT_TYPES,
  INPUT_TYPES_LABELS,
  LAYER_TYPES,
  LAYER_TYPES_LABELS,
  CONV_FILTERS
} from "../utils/constants";
import Matrix from "./Matrix";

export default class Controls extends React.Component {
  matrices = [];

  onInputTypeChange = event => {
    this.props.onInputTypeChange(event.target.value);
  };

  onLayerTypeChange = event => {
    this.props.onLayerTypeChange(event.target.value);
  };

  render() {
    const {
      selectedInputType,
      selectedLayerType,
      selectedConvFilter,
      onConvFilterChange
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
          <div style={{ display: "flex" }}>
            Filter:
            {CONV_FILTERS.map((convFilter, index) => {
              const filterSize = Math.sqrt(convFilter.filter.length);

              return (
                <div style={{ marginLeft: index > 0 ? 50 : 0 }} key={index}>
                  <label>
                    <input
                      type="radio"
                      name="convFilter"
                      value={index}
                      checked={
                        CONV_FILTERS[index].name === selectedConvFilter.name
                      }
                      onChange={event => {
                        onConvFilterChange({
                          ...convFilter,
                          filter: this.matrices[event.target.value].getData()
                        });
                      }}
                    />
                    {convFilter.name}
                  </label>
                  <Matrix
                    rows={filterSize}
                    columns={filterSize}
                    initialData={convFilter.filter}
                    onUpdate={data => {
                      onConvFilterChange({
                        ...convFilter,
                        filter: data
                      });
                    }}
                    ref={matrix => {
                      if (matrix !== null) {
                        this.matrices[index] = matrix;
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}
