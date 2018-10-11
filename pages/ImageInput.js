import { getOutputDimensions } from "../utils/shared";

export default class ImageInput extends React.Component {
  componentDidMount() {
    const { src } = this.props;

    this.image = new Image();
    this.image.onload = this.update;
    this.image.src = src;
  }

  componentDidUpdate(prevProps) {
    const { displayWidth, displayHeight, scale } = this.props;

    if (
      displayWidth !== prevProps.displayWidth ||
      displayHeight !== prevProps.displayHeight ||
      scale !== prevProps.scale
    ) {
      this.update();
    }
  }

  update = () => {
    const { displayWidth, displayHeight, onUpdate } = this.props;
    const {
      width: dataWidth,
      height: dataHeight
    } = this.dataCanvasContext.canvas;

    this.dataCanvasContext.drawImage(this.image, 0, 0, dataWidth, dataHeight);

    this.displayCanvasContext.imageSmoothingEnabled = false;
    this.displayCanvasContext.drawImage(
      this.image,
      0,
      0,
      dataWidth,
      dataHeight,
      0,
      0,
      displayWidth,
      displayHeight
    );

    onUpdate();
  };

  dataCanvasRef = canvas => {
    if (canvas !== null) {
      this.dataCanvasContext = canvas.getContext("2d", {
        alpha: false
      });
    }
  };

  displayCanvasRef = canvas => {
    if (canvas !== null) {
      this.displayCanvasContext = canvas.getContext("2d", {
        alpha: false
      });
    }
  };

  getInputData() {
    const {
      width: dataWidth,
      height: dataHeight
    } = this.dataCanvasContext.canvas;

    return this.dataCanvasContext.getImageData(0, 0, dataWidth, dataHeight)
      .data;
  }

  render() {
    const { displayWidth, displayHeight, scale } = this.props;

    return (
      <div>
        <canvas
          style={{
            display: "none"
          }}
          width={displayWidth / scale}
          height={displayHeight / scale}
          ref={this.dataCanvasRef}
        />
        <canvas
          width={displayWidth}
          height={displayHeight}
          ref={this.displayCanvasRef}
        />
      </div>
    );
  }
}
