import isEqual from "lodash.isequal";
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
const INITIAL_CONV_FILTERS = [
  {
    name: 'Edge detection',
    isEditable: false,
    filter: [
      0,  1, 0,
      1, -4, 1,
      0,  1, 0
    ]
  },
  {
    name: 'Blur',
    isEditable: false,
    filter: [
      1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
    ]
  },
  {
    name: 'Sharpen',
    isEditable: false,
    filter: [
       0, -1,  0,
      -1,  5, -1,
       0, -1,  0
    ]
  },
  {
    name: 'Custom',
    isEditable: true,
    filter: [
       0, 0, 0,
       0, 1, 0,
       0, 0, 0
    ]
  },
].map(convFilter => ({
  ...convFilter,
  filterSize: Math.sqrt(convFilter.filter.length),
  errors: convFilter.filter.map(_ => false)
}));

const INITIAL_POOL_FILTERS = [
  {
    filterSize: 2
  },
  {
    filterSize: 4
  },
  {
    filterSize: 8
  }
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
      selectedImage: IMAGES[1],
      selectedLayerType: LAYER_TYPES.CONV,
      convFilters: INITIAL_CONV_FILTERS,
      selectedConvFilterIndex: 3,
      convStride: 2,
      poolFilters: INITIAL_POOL_FILTERS,
      selectedPoolFilterIndex: 0,
      poolStride: 2
    };

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
      ...this.getLayerSpecificParams(this.state)
    });

    this.state.outputDataWidth = outputDataWidth;
    this.state.outputDataHeight = outputDataHeight;
  }

  getLayerSpecificParams(state) {
    const { selectedLayerType } = state;

    switch (selectedLayerType) {
      case LAYER_TYPES.CONV: {
        const { convFilters, selectedConvFilterIndex, convStride } = state;

        return {
          filterSize: convFilters[selectedConvFilterIndex].filterSize,
          stride: convStride
        };
      }

      case LAYER_TYPES.POOL: {
        const { poolFilters, selectedPoolFilterIndex, poolStride } = state;

        return {
          filterSize: poolFilters[selectedPoolFilterIndex].filterSize,
          stride: poolStride
        };
      }

      default: {
        throw new Error(`Unknown layer type: ${selectedLayerType}`);
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      selectedInputType,
      selectedImage,
      selectedLayerType,
      convFilters,
      selectedConvFilterIndex,
      convStride,
      poolFilters,
      selectedPoolFilterIndex,
      poolStride,
      scale,
      outputDataWidth,
      outputDataHeight
    } = this.state;

    if (
      outputDataWidth !== prevState.outputDataWidth ||
      outputDataHeight !== prevState.outputDataHeight ||
      selectedConvFilterIndex !== prevState.selectedConvFilterIndex ||
      (!isEqual(
        convFilters[selectedConvFilterIndex].filter,
        prevState.convFilters[prevState.selectedConvFilterIndex].filter
      ) &&
        convFilters[selectedConvFilterIndex].errors.every(
          error => error === false
        )) ||
      selectedPoolFilterIndex !== prevState.selectedPoolFilterIndex ||
      !isEqual(
        poolFilters[selectedPoolFilterIndex].filterSize,
        prevState.poolFilters[prevState.selectedPoolFilterIndex].filterSize
      )
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
        ...this.getLayerSpecificParams(this.state)
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
        ...this.getLayerSpecificParams(this.state)
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
      scale
    } = this.state;

    const inputData = this.input.getInputData();
    let outputData;

    switch (selectedLayerType) {
      case LAYER_TYPES.CONV: {
        const { convFilters, selectedConvFilterIndex } = this.state;
        const { filter, filterSize } = convFilters[selectedConvFilterIndex];

        ({ outputData } = convolve({
          inputWidth: INPUT_DISPLAY_WIDTH / scale,
          inputHeight: INPUT_DISPLAY_HEIGHT / scale,
          inputData,
          filter,
          filterSize,
          outputWidth: outputDataWidth,
          outputHeight: outputDataHeight
        }));
        break;
      }

      case LAYER_TYPES.POOL: {
        const { poolFilters, selectedPoolFilterIndex, poolStride } = this.state;
        const { filterSize } = poolFilters[selectedPoolFilterIndex];

        ({ outputData } = pool({
          inputWidth: INPUT_DISPLAY_WIDTH / scale,
          inputHeight: INPUT_DISPLAY_HEIGHT / scale,
          inputData,
          filterSize,
          stride: poolStride,
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
    this.setState({
      selectedLayerType
    });
  };

  onConvFilterIndexChange = selectedConvFilterIndex => {
    this.setState(state => {
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / state.scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / state.scale,
        layerType: state.selectedLayerType,
        filterSize: state.convFilters[selectedConvFilterIndex].filterSize,
        stride: state.convStride
      });

      return {
        selectedConvFilterIndex,
        outputDataWidth,
        outputDataHeight
      };
    });
  };

  onConvFilterMatrixChange = (selectedConvFilterIndex, filter, errors) => {
    this.setState(state => {
      const filterSize = Math.sqrt(filter.length);
      const convFilters = [...state.convFilters];

      convFilters[selectedConvFilterIndex] = {
        ...convFilters[selectedConvFilterIndex],
        filter,
        errors
      };

      if (errors.some(error => error === true)) {
        return {
          selectedConvFilterIndex,
          convFilters
        };
      }

      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / state.scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / state.scale,
        layerType: state.selectedLayerType,
        filterSize,
        stride: state.convStride
      });

      return {
        selectedConvFilterIndex,
        convFilters,
        outputDataWidth,
        outputDataHeight
      };
    });
  };

  render() {
    const {
      outputDataWidth,
      outputDataHeight,
      selectedInputType,
      selectedImage,
      selectedLayerType,
      convFilters,
      selectedConvFilterIndex,
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
          convFilters={convFilters}
          selectedConvFilterIndex={selectedConvFilterIndex}
          onConvFilterIndexChange={this.onConvFilterIndexChange}
          onConvFilterMatrixChange={this.onConvFilterMatrixChange}
        />
      </div>
    );
  }
}
