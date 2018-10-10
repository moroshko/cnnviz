import { Fragment } from "react";
import { getOutputDimensions } from "../utils/shared";

export default class CameraInput extends React.Component {
  componentDidMount() {
    const { width, height } = this.props;

    navigator.mediaDevices
      .getUserMedia({
        video: { width, height },
        audio: false
      })
      .then(stream => {
        this.stream = stream;
        this.video.srcObject = stream;
        this.video.play();
      })
      .catch(console.error);

    // Flip canvas horizontally
    this.canvasContext.translate(width, 0);
    this.canvasContext.scale(-1, 1);

    this.requestID = requestAnimationFrame(this.triggerUpdates);
  }

  triggerUpdates = () => {
    const { onUpdate } = this.props;

    onUpdate();

    this.requestID = requestAnimationFrame(this.triggerUpdates);
  };

  componentWillUnmount() {
    cancelAnimationFrame(this.requestID);

    if (this.stream != null) {
      // stop the camera
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  canvasRef = canvas => {
    if (canvas !== null) {
      this.canvasContext = canvas.getContext("2d", {
        alpha: false
      });
    }
  };

  videoRef = video => {
    if (video != null) {
      this.video = video;
    }
  };

  getInputData() {
    const { width, height } = this.props;

    this.canvasContext.drawImage(this.video, 0, 0, width, height);

    return this.canvasContext.getImageData(0, 0, width, height).data;
  }

  render() {
    const { width, height } = this.props;

    return (
      <Fragment>
        <canvas
          style={{
            display: "none"
          }}
          width={width}
          height={height}
          ref={this.canvasRef}
        />
        <video
          style={{ transform: "rotateY(180deg)" }}
          width={width}
          height={height}
          ref={this.videoRef}
        />
      </Fragment>
    );
  }
}
