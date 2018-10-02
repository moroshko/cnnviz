import Controls from "./Controls";
import { getConvolutionOutputDimensions, convolve } from "../utils/convolution";
import { getPoolingOutputDimensions, pool } from "../utils/pooling";
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

export default class extends React.Component {
  constructor() {
    super();

    this.state = {
      inputWidth: INPUT_WIDTH,
      inputHeight: INPUT_HEIGHT,
      selectedInputType: INPUT_TYPES.IMAGE,
      selectedLayerType: LAYER_TYPES.POOL,
      activeFilter: FILTERS[0]
    };

    this.state.activeFilterSize =
      this.state.selectedLayerType === LAYER_TYPES.CONV
        ? Math.sqrt(FILTERS[0].length)
        : 2;

    this.state = {
      ...this.state,
      ...this.getOutputDimensions(this.state)
    };
  }

  componentDidMount() {
    this.initInput();
  }

  stopCamera() {
    cancelAnimationFrame(this.requestID);

    if (this.cameraStream != null) {
      this.cameraStream.getTracks().forEach(track => track.stop());
    }
  }

  initInput() {
    const { selectedInputType } = this.state;

    switch (selectedInputType) {
      case INPUT_TYPES.IMAGE: {
        this.stopCamera();
        this.initImageInput();
        break;
      }

      case INPUT_TYPES.CAMERA: {
        this.initCameraInput();
        break;
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.selectedInputType !== prevState.selectedInputType) {
      this.initInput();
    } else if (this.state.selectedLayerType !== prevState.selectedLayerType) {
      this.setState({
        ...this.getOutputDimensions(this.state)
      });
    }
  }

  getOutputDimensions(state) {
    const { selectedLayerType, activeFilterSize } = state;

    switch (selectedLayerType) {
      case LAYER_TYPES.CONV: {
        return getConvolutionOutputDimensions(
          INPUT_WIDTH,
          INPUT_HEIGHT,
          activeFilterSize
        );
      }

      case LAYER_TYPES.POOL: {
        return getPoolingOutputDimensions(
          INPUT_WIDTH,
          INPUT_HEIGHT,
          activeFilterSize,
          2 // stride
        );
      }

      default: {
        throw Error(`Unknown layer type: ${selectedLayerType}`);
      }
    }
  }

  drawOutput(inputElement) {
    const {
      inputWidth,
      inputHeight,
      outputWidth,
      outputHeight,
      selectedLayerType,
      activeFilter,
      activeFilterSize
    } = this.state;

    this.inputContext.drawImage(inputElement, 0, 0, inputWidth, inputHeight);

    const { data: inputData } = this.inputContext.getImageData(
      0,
      0,
      inputWidth,
      inputHeight
    );
    let outputData;

    switch (selectedLayerType) {
      case LAYER_TYPES.CONV: {
        ({ outputData } = convolve({
          inputWidth,
          inputHeight,
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
          inputWidth,
          inputHeight,
          inputData,
          filterSize: 2,
          stride: 2,
          outputWidth,
          outputHeight
        }));
        break;
      }

      default: {
        throw Error(`Unknown layer type: ${selectedLayerType}`);
      }
    }

    this.outputContext.putImageData(
      new ImageData(
        new Uint8ClampedArray(outputData),
        outputWidth,
        outputHeight
      ),
      0,
      0
    );
  }

  initImageInput() {
    const image = new Image();

    image.onload = () => {
      this.setState(
        state => ({
          inputWidth: INPUT_WIDTH,
          inputHeight: INPUT_HEIGHT,
          ...this.getOutputDimensions(state)
        }),
        () => {
          this.drawOutput(image);
        }
      );
    };

    image.src = "/static/Valley-Of-Gods-Photo-By-John-B-Mueller.jpg";
  }

  initCameraInput() {
    navigator.mediaDevices
      .getUserMedia({
        video: { width: INPUT_WIDTH, height: INPUT_HEIGHT },
        audio: false
      })
      .then(stream => {
        this.cameraStream = stream;
        this.cameraVideo.srcObject = stream;
        this.cameraVideo.play();
      })
      .catch(console.error);

    this.setState(
      state => ({
        inputWidth: INPUT_WIDTH,
        inputHeight: INPUT_HEIGHT,
        ...this.getOutputDimensions(state)
      }),
      () => {
        const { inputWidth } = this.state;

        // Flip canvas horizontally
        this.inputContext.translate(inputWidth, 0);
        this.inputContext.scale(-1, 1);

        this.requestID = requestAnimationFrame(this.drawOutputInALoop);
      }
    );
  }

  drawOutputInALoop = () => {
    this.drawOutput(this.cameraVideo);

    this.requestID = requestAnimationFrame(this.drawOutputInALoop);
  };

  inputCanvasRef = canvas => {
    if (canvas !== null) {
      this.inputContext = canvas.getContext("2d", {
        alpha: false
      });
    }
  };

  videoRef = video => {
    if (video != null) {
      this.cameraVideo = video;
    }
  };

  outputCanvasRef = canvas => {
    if (canvas !== null) {
      this.outputContext = canvas.getContext("2d", {
        alpha: false
      });
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
          activeFilterSize: 2
        });
        break;
      }

      default: {
        throw Error(`Unknown layer type: ${selectedLayerType}`);
      }
    }
  };

  render() {
    const {
      inputWidth,
      inputHeight,
      outputWidth,
      outputHeight,
      selectedInputType,
      selectedLayerType
    } = this.state;

    return (
      <div>
        <div style={{ display: "flex" }}>
          <canvas
            style={{
              alignSelf: "flex-start",
              display:
                selectedInputType === INPUT_TYPES.CAMERA ? "none" : "block"
            }}
            width={inputWidth}
            height={inputHeight}
            ref={this.inputCanvasRef}
          />
          {selectedInputType === INPUT_TYPES.CAMERA && (
            <video
              style={{ transform: "rotateY(180deg)" }}
              width={INPUT_WIDTH}
              height={INPUT_HEIGHT}
              ref={this.videoRef}
            />
          )}
          <canvas
            style={{ alignSelf: "flex-start", marginLeft: 20 }}
            width={outputWidth}
            height={outputHeight}
            ref={this.outputCanvasRef}
          />
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
