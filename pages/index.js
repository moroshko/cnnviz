import ImageInput from "./ImageInput";
import CameraInput from "./CameraInput";
import Output from "./Output";
import Controls from "./Controls";
import { getOutputDimensions } from "../utils/shared";
import { convolve } from "../utils/convolution";
import { pool } from "../utils/pooling";
import {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT,
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

const IMAGES = [
  {
    src: "/static/digit_4.jpg",
    scale: 16
  },
  {
    src: "/static/Valley-Of-Gods-Photo-By-John-B-Mueller.jpg",
    scale: 1
  }
];

export default class App extends React.Component {
  constructor() {
    super();

    this.state = {
      selectedInputType: INPUT_TYPES.IMAGE,
      selectedImage: IMAGES[0],
      selectedLayerType: LAYER_TYPES.CONV,
      activeFilter: FILTERS[0],
      stride: 2
    };

    this.state.activeFilterSize =
      this.state.selectedLayerType === LAYER_TYPES.CONV
        ? Math.sqrt(FILTERS[0].length)
        : 2;

    this.state.scale =
      this.state.selectedInputType === INPUT_TYPES.IMAGE
        ? this.state.selectedImage.scale
        : 1;

    const {
      outputWidth: outputDataWidth,
      outputHeight: outputDataHeight
    } = getOutputDimensions({
      inputWidth: INPUT_DISPLAY_WIDTH / this.state.scale,
      inputHeight: INPUT_DISPLAY_HEIGHT / this.state.scale,
      layerType: this.state.selectedLayerType,
      filterSize: this.state.activeFilterSize,
      stride: this.state.stride
    });

    this.state.outputDataWidth = outputDataWidth;
    this.state.outputDataHeight = outputDataHeight;
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      selectedInputType,
      selectedImage,
      selectedLayerType,
      activeFilterSize,
      stride,
      scale,
      outputDataWidth,
      outputDataHeight
    } = this.state;

    if (
      outputDataWidth !== prevState.outputDataWidth ||
      outputDataHeight !== prevState.outputDataHeight
    ) {
      this.drawOutput();
    } else if (
      selectedInputType !== prevState.selectedInputType ||
      selectedImage !== prevState.selectedImage
    ) {
      const newScale =
        selectedInputType === INPUT_TYPES.IMAGE ? selectedImage.scale : 1;
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / newScale,
        inputHeight: INPUT_DISPLAY_HEIGHT / newScale,
        layerType: selectedLayerType,
        filterSize: activeFilterSize,
        stride
      });

      this.setState({
        outputDataWidth,
        outputDataHeight,
        scale: newScale
      });
    } else if (selectedLayerType !== prevState.selectedLayerType) {
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / scale,
        layerType: selectedLayerType,
        filterSize: activeFilterSize,
        stride
      });

      this.setState({
        outputDataWidth,
        outputDataHeight
      });
    }
  }

  drawOutput = () => {
    const {
      outputDataWidth,
      outputDataHeight,
      selectedLayerType,
      activeFilter,
      activeFilterSize,
      stride,
      scale
    } = this.state;

    const inputData = this.input.getInputData();
    let outputData;

    switch (selectedLayerType) {
      case LAYER_TYPES.CONV: {
        ({ outputData } = convolve({
          inputWidth: INPUT_DISPLAY_WIDTH / scale,
          inputHeight: INPUT_DISPLAY_HEIGHT / scale,
          inputData,
          filter: activeFilter,
          filterSize: activeFilterSize,
          outputWidth: outputDataWidth,
          outputHeight: outputDataHeight
        }));
        break;
      }

      case LAYER_TYPES.POOL: {
        ({ outputData } = pool({
          inputWidth: INPUT_DISPLAY_WIDTH / scale,
          inputHeight: INPUT_DISPLAY_HEIGHT / scale,
          inputData,
          filterSize: activeFilterSize,
          stride,
          outputWidth: outputDataWidth,
          outputHeight: outputDataHeight
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
      outputDataWidth,
      outputDataHeight,
      selectedInputType,
      selectedImage,
      selectedLayerType,
      scale
    } = this.state;

    return (
      <div>
        <div style={{ display: "flex" }}>
          <div style={{ alignSelf: "flex-start" }}>
            {selectedInputType === INPUT_TYPES.IMAGE && (
              <ImageInput
                displayWidth={INPUT_DISPLAY_WIDTH}
                displayHeight={INPUT_DISPLAY_HEIGHT}
                scale={scale}
                src={selectedImage.src}
                onUpdate={this.drawOutput}
                ref={this.inputRef}
              />
            )}
            {selectedInputType === INPUT_TYPES.CAMERA && (
              <CameraInput
                width={INPUT_DISPLAY_WIDTH}
                height={INPUT_DISPLAY_HEIGHT}
                scale={scale}
                onUpdate={this.drawOutput}
                ref={this.inputRef}
              />
            )}
          </div>
          <div style={{ alignSelf: "flex-start", marginLeft: 20 }}>
            <Output
              dataWidth={outputDataWidth}
              dataHeight={outputDataHeight}
              scale={scale}
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
