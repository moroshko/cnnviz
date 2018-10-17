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

    // Flip the canvas horizontally
    this.dataCanvasContext.translate(width, 0);
    this.dataCanvasContext.scale(-1, 1);

    this.dataCanvasContext.drawImage(this.video, 0, 0, width, height);

    this.requestID = requestAnimationFrame(this.update);
  }

  update = () => {
    const { width, height, onUpdate } = this.props;

    this.dataCanvasContext.drawImage(this.video, 0, 0, width, height);

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

  dataCanvasRef = canvas => {
    if (canvas !== null) {
      this.dataCanvasContext = canvas.getContext("2d", {
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

    return this.dataCanvasContext.getImageData(0, 0, width, height).data;
  }

  render() {
    const { width, height } = this.props;

    return (
      <div>
        <canvas width={width} height={height} ref={this.dataCanvasRef} />
        <video width={width} height={height} ref={this.videoRef} />
        <div className="dimensions">
          {width} × {height}
        </div>
        <style jsx>{`
          canvas {
            display: none;
          }
          video {
            transform: rotateY(180deg);
          }
          .dimensions {
            font-size: 12px;
            text-align: right;
          }
        `}</style>
      </div>
    );
  }
}
