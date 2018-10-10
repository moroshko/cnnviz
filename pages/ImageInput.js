import { getOutputDimensions } from "../utils/shared";

export default class ImageInput extends React.Component {
  componentDidMount() {
    const { onReady } = this.props;
    const image = new Image();

    image.onload = () => {
      this.image = image;

      onReady();
    };

    image.src = "/static/Valley-Of-Gods-Photo-By-John-B-Mueller.jpg";
  }

  canvasRef = canvas => {
    if (canvas !== null) {
      this.canvasContext = canvas.getContext("2d", {
        alpha: false
      });
    }
  };

  getInputData() {
    const { width, height } = this.props;

    this.canvasContext.drawImage(this.image, 0, 0, width, height);

    return this.canvasContext.getImageData(0, 0, width, height).data;
  }

  render() {
    const { width, height } = this.props;

    return <canvas width={width} height={height} ref={this.canvasRef} />;
  }
}
