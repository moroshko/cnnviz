import { StrictMode } from "react";
import isEqual from "lodash.isequal";
import Input from "./Input";
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
      inputType: INPUT_TYPES.IMAGE,
      inputImage: IMAGES[1],
      hasRedChannel: true,
      hasGreenChannel: true,
      hasBlueChannel: true,
      layerType: LAYER_TYPES.CONV,
      convFilters: INITIAL_CONV_FILTERS,
      convFilterIndex: 0,
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
    const { convFilters, convFilterIndex, convStride } = this.state;

    return (convFilters[convFilterIndex].filterSize - convStride) >> 1;
  }

  getScale() {
    const { inputType, inputImage } = this.state;

    return inputType === INPUT_TYPES.IMAGE ? inputImage.scale : 1;
  }

  getLayerSpecificParams(state) {
    const { layerType } = state;

    switch (layerType) {
      case LAYER_TYPES.CONV: {
        const { convFilters, convFilterIndex, convPadding, convStride } = state;

        return {
          filterSize: convFilters[convFilterIndex].filterSize,
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
        throw new Error(`Unknown layer type: ${layerType}`);
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      inputType,
      inputImage,
      layerType,
      convFilters,
      convFilterIndex,
      convStride,
      poolFilterSize,
      poolStride
    } = this.state;

    if (
      inputType !== prevState.inputType ||
      inputImage !== prevState.inputImage ||
      layerType !== prevState.layerType ||
      (!isEqual(
        convFilters[convFilterIndex].filter,
        prevState.convFilters[prevState.convFilterIndex].filter
      ) &&
        convFilters[convFilterIndex].errors.every(error => error === false)) ||
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
    const { outputDataWidth, outputDataHeight, layerType, scale } = this.state;

    const { inputWidth, inputHeight, inputData } = this.input.getData();

    if (inputData === null) {
      return;
    }

    let outputData;

    switch (layerType) {
      case LAYER_TYPES.CONV: {
        const { convFilters, convFilterIndex, convStride } = this.state;
        const { filter, filterSize } = convFilters[convFilterIndex];

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
        throw new Error(`Unknown layer type: ${layerType}`);
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

  onInputTypeChange = inputType => {
    this.setState({
      inputType
    });
  };

  onHasRedChannelChange = hasRedChannel => {
    this.setState({
      hasRedChannel
    });
  };

  onHasGreenChannelChange = hasGreenChannel => {
    this.setState({
      hasGreenChannel
    });
  };

  onHasBlueChannelChange = hasBlueChannel => {
    this.setState({
      hasBlueChannel
    });
  };

  onLayerTypeChange = layerType => {
    this.setState({
      layerType
    });
  };

  onConvStrideChange = convStride => {
    this.setState({
      convStride
    });
  };

  onConvFilterIndexChange = convFilterIndex => {
    this.setState(state => ({
      convFilterIndex,
      convStride: Math.min(
        state.convStride,
        state.convFilters[convFilterIndex].filterSize
      )
    }));
  };

  onConvFilterMatrixChange = (convFilterIndex, filter, errors) => {
    this.setState(state => {
      const filterSize = Math.sqrt(filter.length);
      const convFilters = [...state.convFilters];

      convFilters[convFilterIndex] = {
        ...convFilters[convFilterIndex],
        filter,
        errors
      };

      if (errors.some(error => error === true)) {
        return {
          convFilterIndex,
          convFilters,
          convStride: Math.min(
            state.convStride,
            convFilters[convFilterIndex].filterSize
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
        convFilterIndex,
        convFilters,
        convStride: Math.min(
          state.convStride,
          convFilters[convFilterIndex].filterSize
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
      inputType,
      inputImage,
      hasRedChannel,
      hasGreenChannel,
      hasBlueChannel,
      layerType,
      convPadding,
      convStride,
      convFilters,
      convFilterIndex,
      poolFilterSize,
      poolStride,
      scale
    } = this.state;
    const inputPadding = layerType === LAYER_TYPES.CONV ? convPadding : 0;
    const displayWidth = INPUT_DISPLAY_WIDTH + scale * (inputPadding << 1);
    const displayHeight = INPUT_DISPLAY_HEIGHT + scale * (inputPadding << 1);

    return (
      <StrictMode>
        <div className="container">
          <div className="inputAndOutputContainer">
            <div className="inputContainer">
              <Input
                inputType={inputType}
                displayWidth={displayWidth}
                displayHeight={displayHeight}
                padding={inputPadding}
                scale={scale}
                inputImage={inputImage}
                hasRedChannel={hasRedChannel}
                hasGreenChannel={hasGreenChannel}
                hasBlueChannel={hasBlueChannel}
                onUpdate={this.drawOutput}
                ref={this.inputRef}
              />
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
            inputType={inputType}
            onInputTypeChange={this.onInputTypeChange}
            hasRedChannel={hasRedChannel}
            onHasRedChannelChange={this.onHasRedChannelChange}
            hasGreenChannel={hasGreenChannel}
            onHasGreenChannelChange={this.onHasGreenChannelChange}
            hasBlueChannel={hasBlueChannel}
            onHasBlueChannelChange={this.onHasBlueChannelChange}
            layerType={layerType}
            onLayerTypeChange={this.onLayerTypeChange}
            convStride={convStride}
            onConvStrideChange={this.onConvStrideChange}
            convFilters={convFilters}
            convFilterIndex={convFilterIndex}
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
      </StrictMode>
    );
  }
}
