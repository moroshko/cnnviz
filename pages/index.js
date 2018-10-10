import ImageInput from "./ImageInput";
import CameraInput from "./CameraInput";
import Output from "./Output";
import Controls from "./Controls";
import { getOutputDimensions } from "../utils/shared";
import { convolve } from "../utils/convolution";
import { pool } from "../utils/pooling";
import {
  INPUT_WIDTH,
  INPUT_HEIGHT,
  INPUT_TYPES,
  INPUT_TYPES_LABELS,
  LAYER_TYPES,
  LAYER_TYPES_LABELS
} from "../utils/constants";

// prettier-ignore
const FILTERS = [
  [
    1, 0, -1,
    1, 0, -1,
    1, 0, -1
  ],
  [
    1, 0, -1,
    2, 0, -2,
    1, 0, -1
  ],
  [
    3, 0, -3,
    10, 0, -10,
    3, 0, -3
  ]
];

export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      selectedInputType: INPUT_TYPES.IMAGE,
      selectedLayerType: LAYER_TYPES.POOL,
      activeFilter: FILTERS[0],
      stride: 2
    };

    this.state.activeFilterSize =
      this.state.selectedLayerType === LAYER_TYPES.CONV
        ? Math.sqrt(FILTERS[0].length)
        : 2;

    const { outputWidth, outputHeight } = getOutputDimensions({
      inputWidth: INPUT_WIDTH,
      inputHeight: INPUT_HEIGHT,
      layerType: this.state.selectedLayerType,
      filterSize: this.state.activeFilterSize,
      stride: this.state.stride
    });

    this.state.outputWidth = outputWidth;
    this.state.outputHeight = outputHeight;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      selectedInputType,
      selectedLayerType,
      activeFilterSize,
      stride,
      outputWidth,
      outputHeight
    } = this.state;

    if (
      outputWidth !== prevState.outputWidth ||
      outputHeight !== prevState.outputHeight
    ) {
      this.drawOutput();
    } else if (selectedLayerType !== prevState.selectedLayerType) {
      const { outputWidth, outputHeight } = getOutputDimensions({
        inputWidth: INPUT_WIDTH,
        inputHeight: INPUT_HEIGHT,
        layerType: selectedLayerType,
        filterSize: activeFilterSize,
        stride
      });

      this.setState({
        outputWidth,
        outputHeight
      });
    }
  }

  drawOutput = () => {
    const {
      outputWidth,
      outputHeight,
      selectedLayerType,
      activeFilter,
      activeFilterSize,
      stride
    } = this.state;

    const inputData = this.input.getInputData();
    let outputData;

    switch (selectedLayerType) {
      case LAYER_TYPES.CONV: {
        ({ outputData } = convolve({
          inputWidth: INPUT_WIDTH,
          inputHeight: INPUT_HEIGHT,
          inputData,
          filter: activeFilter,
          filterSize: activeFilterSize,
          outputWidth,
          outputHeight
        }));
        break;
      }

      case LAYER_TYPES.POOL: {
        ({ outputData } = pool({
          inputWidth: INPUT_WIDTH,
          inputHeight: INPUT_HEIGHT,
          inputData,
          filterSize: activeFilterSize,
          stride,
          outputWidth,
          outputHeight
        }));
        break;
      }

      default: {
        throw new Error(`Unknown layer type: ${selectedLayerType}`);
      }
    }

    this.output.update(outputData);
  };

  inputRef = input => {
    if (input != null) {
      this.input = input;
    }
  };

  outputRef = output => {
    if (output != null) {
      this.output = output;
    }
  };

  onInputTypeChange = selectedInputType => {
    this.setState({
      selectedInputType
    });
  };

  onLayerTypeChange = selectedLayerType => {
    switch (selectedLayerType) {
      case LAYER_TYPES.CONV: {
        this.setState({
          selectedLayerType,
          activeFilter: FILTERS[0],
          activeFilterSize: Math.sqrt(FILTERS[0].length)
        });
        break;
      }

      case LAYER_TYPES.POOL: {
        this.setState({
          selectedLayerType,
          activeFilterSize: 2,
          stride: 2
        });
        break;
      }

      default: {
        throw new Error(`Unknown layer type: ${selectedLayerType}`);
      }
    }
  };

  render() {
    const {
      outputWidth,
      outputHeight,
      selectedInputType,
      selectedLayerType
    } = this.state;

    return (
      <div>
        <div style={{ display: "flex" }}>
          <div style={{ alignSelf: "flex-start" }}>
            {selectedInputType === INPUT_TYPES.IMAGE && (
              <ImageInput
                width={INPUT_WIDTH}
                height={INPUT_HEIGHT}
                onReady={this.drawOutput}
                ref={this.inputRef}
              />
            )}
            {selectedInputType === INPUT_TYPES.CAMERA && (
              <CameraInput
                width={INPUT_WIDTH}
                height={INPUT_HEIGHT}
                onUpdate={this.drawOutput}
                ref={this.inputRef}
              />
            )}
          </div>
          <div style={{ alignSelf: "flex-start", marginLeft: 20 }}>
            <Output
              width={outputWidth}
              height={outputHeight}
              ref={this.outputRef}
            />
          </div>
        </div>
        <Controls
          selectedInputType={selectedInputType}
          onInputTypeChange={this.onInputTypeChange}
          selectedLayerType={selectedLayerType}
          onLayerTypeChange={this.onLayerTypeChange}
        />
      </div>
    );
  }
}
