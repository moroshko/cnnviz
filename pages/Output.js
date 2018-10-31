import React from 'react';
import { MAX_PADDING } from '../utils/constants';
import Dimensions from './Dimensions';

export default class Output extends React.Component {
  displayCanvasRef = canvas => {
    if (canvas !== null) {
      this.displayCanvasContext = canvas.getContext('2d', {
        alpha: false,
      });
    }
  };

  update(data) {
    const { dataWidth, dataHeight, scale } = this.props;
    const imageData = new ImageData(data, dataWidth, dataHeight);

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
          width={dataWidth * scale}
          height={dataHeight * scale}
          ref={this.displayCanvasRef}
        />
        <div className="dimensions">
          <Dimensions width={dataWidth} height={dataHeight} />
        </div>
        <style jsx>{`
          .dimensions {
            margin-top: ${MAX_PADDING * scale}px;
          }
        `}</style>
      </div>
    );
  }
}
