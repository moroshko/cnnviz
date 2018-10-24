import { Fragment } from "react";
import { MAX_PADDING } from "../utils/constants";
import { filterChannels } from "../utils/shared";

export default class ImageInput extends React.Component {
  state = {
    imageWidth: null,
    imageHeight: null
  };

  componentDidMount() {
    const { src } = this.props;

    this.image = new Image();
    this.image.onload = () => {
      this.setState(
        {
          imageWidth: this.image.naturalWidth,
          imageHeight: this.image.naturalHeight
        },
        this.update
      );
    };
    this.image.src = src;
  }

  componentDidUpdate(prevProps) {
    const {
      displayWidth,
      displayHeight,
      padding,
      scale,
      hasRedChannel,
      hasGreenChannel,
      hasBlueChannel
    } = this.props;

    if (
      displayWidth !== prevProps.displayWidth ||
      displayHeight !== prevProps.displayHeight ||
      padding !== prevProps.padding ||
      scale !== prevProps.scale ||
      hasRedChannel !== prevProps.hasRedChannel ||
      hasGreenChannel !== prevProps.hasGreenChannel ||
      hasBlueChannel !== prevProps.hasBlueChannel
    ) {
      this.update();
    }
  }

  getData() {
    if (!this.dataCanvasContext) {
      return {
        inputWidth: null,
        inputHeight: null,
        inputData: null
      };
    }

    const { hasRedChannel, hasGreenChannel, hasBlueChannel } = this.props;
    const {
      width: inputWidth,
      height: inputHeight
    } = this.dataCanvasContext.canvas;
    const { data: imageData } = this.dataCanvasContext.getImageData(
      0,
      0,
      inputWidth,
      inputHeight
    );
    const inputData = filterChannels({
      data: imageData,
      r: hasRedChannel,
      g: hasGreenChannel,
      b: hasBlueChannel,
      a: true
    });

    return {
      inputWidth,
      inputHeight,
      inputData
    };
  }

  update = () => {
    const { displayWidth, displayHeight, padding, onUpdate } = this.props;
    const { imageWidth, imageHeight } = this.state;

    if (imageWidth === null || imageHeight === null) {
      return;
    }

    this.dataCanvasContext.drawImage(
      this.image,
      padding,
      padding,
      imageWidth,
      imageHeight
    );

    const { inputData, inputWidth, inputHeight } = this.getData();
    const imageData = new ImageData(inputData, inputWidth, inputHeight);

    createImageBitmap(imageData).then(imageBitmap => {
      this.displayCanvasContext.imageSmoothingEnabled = false;
      this.displayCanvasContext.drawImage(
        imageBitmap,
        0,
        0,
        inputWidth,
        inputHeight,
        0,
        0,
        displayWidth,
        displayHeight
      );
    });

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

  render() {
    const { displayWidth, displayHeight, padding, scale } = this.props;
    const { imageWidth, imageHeight } = this.state;
    const displayCanvasTranslate = (MAX_PADDING - padding) * scale;
    const containerWhitespace = displayCanvasTranslate << 1;

    return (
      <Fragment>
        <div className="container">
          <canvas
            className="dataCanvas"
            width={displayWidth / scale}
            height={displayHeight / scale}
            ref={this.dataCanvasRef}
          />
          <canvas
            className="displayCanvas"
            width={displayWidth}
            height={displayHeight}
            ref={this.displayCanvasRef}
          />
        </div>
        <style jsx>{`
          .container {
            width: ${displayWidth + containerWhitespace}px;
            height: ${displayHeight + containerWhitespace}px;
          }
          .dataCanvas {
            display: none;
          }
          .displayCanvas {
            transform: translate(
              ${displayCanvasTranslate}px,
              ${displayCanvasTranslate}px
            );
          }
        `}</style>
      </Fragment>
    );
  }
}
