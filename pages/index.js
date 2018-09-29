import { convolve } from "../utils/convolution";

const MAX_CANVAS_WIDTH = 500;

export default class extends React.Component {
  state = {
    originalWidth: 0,
    originalHeight: 0,
    outputWidth: 0,
    outputHeight: 0
  };

  componentDidMount() {
    const image = new Image();

    image.onload = () => {
      const originalWidth = Math.min(MAX_CANVAS_WIDTH, image.naturalWidth);
      const originalHeight = Math.floor(
        (originalWidth * image.naturalHeight) / image.naturalWidth
      );

      this.setState(
        {
          originalWidth,
          originalHeight
        },
        () => {
          const originalContext = this.originalCanvas.getContext("2d", {
            alpha: false
          });
          const outputContext = this.outputCanvas.getContext("2d", {
            alpha: false
          });

          originalContext.drawImage(image, 0, 0, originalWidth, originalHeight);

          const { data: originalImageData } = originalContext.getImageData(
            0,
            0,
            originalWidth,
            originalHeight
          );
          const {
            imageWidth: outputWidth,
            imageHeight: outputHeight,
            imageData: outputImageData
          } = convolve({
            imageWidth: originalWidth,
            imageHeight: originalHeight,
            // prettier-ignore
            imageData: originalImageData,
            filterSize: 3,
            // prettier-ignore
            filter: [
              1, 0, -1,
              1, 0, -1,
              1, 0, -1
            ]
          });

          this.setState(
            {
              outputWidth,
              outputHeight
            },
            () => {
              outputContext.putImageData(
                new ImageData(
                  new Uint8ClampedArray(outputImageData),
                  outputWidth,
                  outputHeight
                ),
                0,
                0
              );
            }
          );
        }
      );
    };

    image.src = "/static/Valley-Of-Gods-Photo-By-John-B-Mueller.jpeg";
  }

  render() {
    const {
      originalWidth,
      originalHeight,
      outputWidth,
      outputHeight
    } = this.state;

    return (
      <div style={{ display: "flex" }}>
        <canvas
          style={{ alignSelf: "flex-start" }}
          width={originalWidth}
          height={originalHeight}
          ref={canvas => {
            this.originalCanvas = canvas;
          }}
        />
        <canvas
          style={{ alignSelf: "flex-start", marginLeft: 20 }}
          width={outputWidth}
          height={outputHeight}
          ref={canvas => {
            this.outputCanvas = canvas;
          }}
        />
      </div>
    );
  }
}
