export default class Output extends React.Component {
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

  update(data) {
    const { dataWidth, dataHeight, scale } = this.props;
    const imageData = new ImageData(
      new Uint8ClampedArray(data),
      dataWidth,
      dataHeight
    );

    this.dataCanvasContext.putImageData(imageData, 0, 0);

    createImageBitmap(imageData).then(imageBitmap => {
      this.displayCanvasContext.imageSmoothingEnabled = false;
      this.displayCanvasContext.drawImage(
        imageBitmap,
        0,
        0,
        dataWidth,
        dataHeight,
        0,
        0,
        dataWidth * scale,
        dataHeight * scale
      );
    });
  }

  render() {
    const { dataWidth, dataHeight, scale } = this.props;

    return (
      <div>
        <canvas
          style={{
            display: "none"
          }}
          width={dataWidth}
          height={dataHeight}
          ref={this.dataCanvasRef}
        />
        <canvas
          width={dataWidth * scale}
          height={dataHeight * scale}
          ref={this.displayCanvasRef}
        />
      </div>
    );
  }
}
