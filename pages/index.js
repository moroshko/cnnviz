import { convolve } from "../utils/convolution";

const MAX_IMAGE_WIDTH = 512;
const VIDEO_WIDTH = 512;
const VIDEO_HEIGHT = 384;

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

const INPUT_TYPES = {
  IMAGE: "IMAGE",
  CAMERA: "CAMERA"
};

const INPUT_TYPES_LABELS = {
  IMAGE: "Image",
  CAMERA: "Camera"
};

export default class extends React.Component {
  state = {
    inputWidth: 0,
    inputHeight: 0,
    outputWidth: 0,
    outputHeight: 0,
    activeFilter: FILTERS[0],
    activeFilterSize: Math.sqrt(FILTERS[0].length),
    selectedInputType: INPUT_TYPES.CAMERA
  };

  componentDidMount() {
    this.initInput();
  }

  initInput() {
    const { selectedInputType } = this.state;

    switch (selectedInputType) {
      case INPUT_TYPES.IMAGE: {
        cancelAnimationFrame(this.requestID);
        this.cameraStream.getTracks().forEach(track => track.stop());

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
    }
  }

  drawOutput(inputElement) {
    const {
      inputWidth,
      inputHeight,
      outputWidth,
      outputHeight,
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
    const { outputData } = convolve({
      inputWidth,
      inputHeight,
      inputData,
      filter: activeFilter,
      filterSize: activeFilterSize
    });

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
      const inputWidth = Math.min(MAX_IMAGE_WIDTH, image.naturalWidth);
      const inputHeight = Math.floor(
        (inputWidth * image.naturalHeight) / image.naturalWidth
      );

      this.setState(
        ({ activeFilterSize }) => ({
          inputWidth,
          inputHeight,
          outputWidth: inputWidth - activeFilterSize + 1,
          outputHeight: inputHeight - activeFilterSize + 1
        }),
        () => {
          this.drawOutput(image);
        }
      );
    };

    image.src = "/static/Valley-Of-Gods-Photo-By-John-B-Mueller.jpeg";
  }

  initCameraInput() {
    navigator.mediaDevices
      .getUserMedia({
        video: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
        audio: false
      })
      .then(stream => {
        this.cameraStream = stream;
        this.cameraVideo.srcObject = stream;
        this.cameraVideo.play();
      })
      .catch(console.error);

    this.setState(
      ({ activeFilterSize }) => ({
        inputWidth: VIDEO_WIDTH,
        inputHeight: VIDEO_HEIGHT,
        outputWidth: VIDEO_WIDTH - activeFilterSize + 1,
        outputHeight: VIDEO_HEIGHT - activeFilterSize + 1
      }),
      () => {
        const { inputWidth } = this.state;

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

  outputCanvasRef = canvas => {
    if (canvas !== null) {
      this.outputContext = canvas.getContext("2d", {
        alpha: false
      });
    }
  };

  onInputTypeChange = event => {
    this.setState({
      selectedInputType: event.target.value
    });
  };

  render() {
    const {
      inputWidth,
      inputHeight,
      outputWidth,
      outputHeight,
      selectedInputType
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
              width={VIDEO_WIDTH}
              height={VIDEO_HEIGHT}
              ref={video => {
                this.cameraVideo = video;
              }}
            />
          )}
          <canvas
            style={{ alignSelf: "flex-start", marginLeft: 20 }}
            width={outputWidth}
            height={outputHeight}
            ref={this.outputCanvasRef}
          />
        </div>
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
      </div>
    );
  }
}
