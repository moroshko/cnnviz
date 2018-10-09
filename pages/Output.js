export default class extends React.Component {
  canvasRef = canvas => {
    if (canvas !== null) {
      this.canvasContext = canvas.getContext("2d", {
        alpha: false
      });
    }
  };

  update(data) {
    const { width, height } = this.props;

    this.canvasContext.putImageData(
      new ImageData(new Uint8ClampedArray(data), width, height),
      0,
      0
    );
  }

  render() {
    const { width, height } = this.props;

    return <canvas width={width} height={height} ref={this.canvasRef} />;
  }
}
