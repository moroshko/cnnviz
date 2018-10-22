import { Fragment } from "react";
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
  LAYER_TYPES_LABELS,
  MAX_PADDING
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
    name: 'Custom (editable)',
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
      selectedInputType: INPUT_TYPES.CAMERA,
      selectedImage: IMAGES[0],
      selectedLayerType: LAYER_TYPES.CONV,
      convFilters: INITIAL_CONV_FILTERS,
      selectedConvFilterIndex: 3,
      convStride: 1,
      poolFilterSize: 2,
      poolStride: 2
    };

    this.state.convPadding = this.getConvPadding();
    this.state.scale = this.getScale();

    const {
      outputWidth: outputDataWidth,
      outputHeight: outputDataHeight
    } = getOutputDimensions({
      inputWidth: INPUT_DISPLAY_WIDTH / this.state.scale,
      inputHeight: INPUT_DISPLAY_HEIGHT / this.state.scale,
      ...this.getLayerSpecificParams(this.state)
    });

    this.state.outputDataWidth = outputDataWidth;
    this.state.outputDataHeight = outputDataHeight;
  }

  getConvPadding() {
    const { convFilters, selectedConvFilterIndex, convStride } = this.state;

    return (convFilters[selectedConvFilterIndex].filterSize - convStride) >> 1;
  }

  getScale() {
    const { selectedInputType, selectedImage } = this.state;

    return selectedInputType === INPUT_TYPES.IMAGE ? selectedImage.scale : 1;
  }

  getLayerSpecificParams(state) {
    const { selectedLayerType } = state;

    switch (selectedLayerType) {
      case LAYER_TYPES.CONV: {
        const {
          convFilters,
          selectedConvFilterIndex,
          convPadding,
          convStride
        } = state;

        return {
          filterSize: convFilters[selectedConvFilterIndex].filterSize,
          padding: convPadding,
          stride: convStride
        };
      }

      case LAYER_TYPES.POOL: {
        const { poolFilterSize, poolStride } = state;

        return {
          filterSize: poolFilterSize,
          padding: 0,
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
      poolFilterSize,
      poolStride
    } = this.state;

    if (
      selectedInputType !== prevState.selectedInputType ||
      selectedImage !== prevState.selectedImage ||
      selectedLayerType !== prevState.selectedLayerType ||
      (!isEqual(
        convFilters[selectedConvFilterIndex].filter,
        prevState.convFilters[prevState.selectedConvFilterIndex].filter
      ) &&
        convFilters[selectedConvFilterIndex].errors.every(
          error => error === false
        )) ||
      convStride !== prevState.convStride ||
      poolFilterSize !== prevState.poolFilterSize ||
      poolStride !== prevState.poolStride
    ) {
      const newConvPadding = this.getConvPadding();
      const newScale = this.getScale();
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / newScale,
        inputHeight: INPUT_DISPLAY_HEIGHT / newScale,
        ...this.getLayerSpecificParams({
          ...this.state,
          convPadding: newConvPadding
        })
      });

      this.setState(
        {
          outputDataWidth,
          outputDataHeight,
          convPadding: newConvPadding,
          scale: newScale
        },
        this.drawOutput
      );
    }
  }

  drawOutput = () => {
    const {
      outputDataWidth,
      outputDataHeight,
      selectedLayerType,
      scale
    } = this.state;

    const { inputWidth, inputHeight, inputData } = this.input.getInputData();

    if (inputData === null) {
      return;
    }

    let outputData;

    switch (selectedLayerType) {
      case LAYER_TYPES.CONV: {
        const { convFilters, selectedConvFilterIndex, convStride } = this.state;
        const { filter, filterSize } = convFilters[selectedConvFilterIndex];

        ({ outputData } = convolve({
          inputWidth,
          inputHeight,
          inputData: inputData,
          filter,
          filterSize,
          stride: convStride,
          outputWidth: outputDataWidth,
          outputHeight: outputDataHeight
        }));
        break;
      }

      case LAYER_TYPES.POOL: {
        const { poolFilterSize, poolStride } = this.state;

        ({ outputData } = pool({
          inputWidth,
          inputHeight,
          inputData,
          filterSize: poolFilterSize,
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

  onConvStrideChange = convStride => {
    this.setState({
      convStride
    });
  };

  onConvFilterIndexChange = selectedConvFilterIndex => {
    this.setState(state => ({
      selectedConvFilterIndex,
      convStride: Math.min(
        state.convStride,
        state.convFilters[selectedConvFilterIndex].filterSize
      )
    }));
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
          convFilters,
          convStride: Math.min(
            state.convStride,
            convFilters[selectedConvFilterIndex].filterSize
          )
        };
      }

      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / state.scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / state.scale,
        filterSize,
        padding: state.convPadding,
        stride: state.convStride
      });

      return {
        selectedConvFilterIndex,
        convFilters,
        convStride: Math.min(
          state.convStride,
          convFilters[selectedConvFilterIndex].filterSize
        ),
        outputDataWidth,
        outputDataHeight
      };
    });
  };

  onPoolFilterSizeChange = poolFilterSize => {
    this.setState(state => {
      const {
        outputWidth: outputDataWidth,
        outputHeight: outputDataHeight
      } = getOutputDimensions({
        inputWidth: INPUT_DISPLAY_WIDTH / state.scale,
        inputHeight: INPUT_DISPLAY_HEIGHT / state.scale,
        filterSize: poolFilterSize,
        padding: 0,
        stride: state.poolStride
      });

      return {
        poolFilterSize,
        outputDataWidth,
        outputDataHeight
      };
    });
  };

  onPoolStrideChange = poolStride => {
    this.setState({
      poolStride
    });
  };

  render() {
    const {
      outputDataWidth,
      outputDataHeight,
      selectedInputType,
      selectedImage,
      selectedLayerType,
      convPadding,
      convStride,
      convFilters,
      selectedConvFilterIndex,
      poolFilterSize,
      poolStride,
      scale
    } = this.state;
    const inputPadding =
      selectedLayerType === LAYER_TYPES.CONV ? convPadding : 0;
    const displayWidth = INPUT_DISPLAY_WIDTH + scale * (inputPadding << 1);
    const displayHeight = INPUT_DISPLAY_HEIGHT + scale * (inputPadding << 1);

    return (
      <Fragment>
        <div className="container">
          <div className="inputAndOutputContainer">
            <div className="inputContainer">
              {selectedInputType === INPUT_TYPES.IMAGE && (
                <ImageInput
                  displayWidth={displayWidth}
                  displayHeight={displayHeight}
                  padding={inputPadding}
                  scale={scale}
                  src={selectedImage.src}
                  onUpdate={this.drawOutput}
                  ref={this.inputRef}
                />
              )}
              {selectedInputType === INPUT_TYPES.CAMERA && (
                <CameraInput
                  displayWidth={displayWidth}
                  displayHeight={displayHeight}
                  padding={inputPadding}
                  scale={scale}
                  onUpdate={this.drawOutput}
                  ref={this.inputRef}
                />
              )}
            </div>
            <div className="outputContainer">
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
            convStride={convStride}
            onConvStrideChange={this.onConvStrideChange}
            convFilters={convFilters}
            selectedConvFilterIndex={selectedConvFilterIndex}
            onConvFilterIndexChange={this.onConvFilterIndexChange}
            onConvFilterMatrixChange={this.onConvFilterMatrixChange}
            poolFilterSize={poolFilterSize}
            onPoolFilterSizeChange={this.onPoolFilterSizeChange}
            poolStride={poolStride}
            onPoolStrideChange={this.onPoolStrideChange}
          />
        </div>
        <style jsx global>{`
          body {
            margin: 0;
          }
        `}</style>
        <style jsx>{`
          .container {
            padding: 10px;
            background-color: #eee;
          }
          .inputAndOutputContainer {
            display: flex;
          }
          .inputContainer {
            align-self: flex-start;
          }
          .outputContainer {
            align-self: flex-start;
            margin-left: 20px;
            transform: translateY(${MAX_PADDING * scale}px);
          }
        `}</style>
      </Fragment>
    );
  }
}
