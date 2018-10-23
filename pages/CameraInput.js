import { Fragment } from "react";
import { MAX_PADDING } from "../utils/constants";

export default class CameraInput extends React.Component {
  componentDidMount() {
    const { displayWidth, displayHeight } = this.props;

    navigator.mediaDevices
      .getUserMedia({
        video: { displayWidth, displayHeight },
        audio: false
      })
      .then(stream => {
        this.stream = stream;

        this.video.srcObject = stream;
        this.video.play();

        this.update();
      })
      .catch(console.error);
  }

  getData() {
    if (!this.displayCanvasContext) {
      return {
        inputWidth: null,
        inputHeight: null,
        inputData: null
      };
    }

    const {
      width: inputWidth,
      height: inputHeight
    } = this.displayCanvasContext.canvas;
    const { data: inputData } = this.displayCanvasContext.getImageData(
      0,
      0,
      inputWidth,
      inputHeight
    );

    return {
      inputWidth,
      inputHeight,
      inputData
    };
  }

  update = () => {
    const { padding, onUpdate } = this.props;

    /*
      The transformation matrix is restored to identity matrix whenever canvas
      dimensions change. Instead of tracking this change, we just set the
      transformation matrix every time before drawing.
      The matrix below performs a horizontal flip of the image.
    */
    // prettier-ignore
    this.displayCanvasContext.setTransform(-1, 0, 0, 1, this.displayCanvasContext.canvas.width, 0);

    this.displayCanvasContext.drawImage(
      this.video,
      padding,
      padding,
      this.video.width,
      this.video.height
    );

    onUpdate();

    this.requestID = requestAnimationFrame(this.update);
  };

  componentWillUnmount() {
    cancelAnimationFrame(this.requestID);

    if (this.stream != null) {
      // stop the camera
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  displayCanvasRef = canvas => {
    if (canvas !== null) {
      this.displayCanvasContext = canvas.getContext("2d", {
        alpha: false
      });
    }
  };

  videoRef = video => {
    if (video != null) {
      this.video = video;
    }
  };

  render() {
    const { displayWidth, displayHeight, padding, scale } = this.props;
    const displayCanvasTranslate = (MAX_PADDING - padding) * scale;
    const containerWhitespace = displayCanvasTranslate << 1;

    return (
      <Fragment>
        <div className="container">
          <canvas
            className="displayCanvas"
            width={displayWidth / scale}
            height={displayHeight / scale}
            ref={this.displayCanvasRef}
          />
          <video
            width={displayWidth - scale * (padding << 1)}
            height={displayHeight - scale * (padding << 1)}
            ref={this.videoRef}
          />
        </div>
        <style jsx>{`
          .container {
            width: ${displayWidth + containerWhitespace}px;
            height: ${displayHeight + containerWhitespace}px;
          }
          .displayCanvas {
            transform: translate(
              ${displayCanvasTranslate}px,
              ${displayCanvasTranslate}px
            );
          }
          video {
            display: none;
          }
        `}</style>
      </Fragment>
    );
  }
}
