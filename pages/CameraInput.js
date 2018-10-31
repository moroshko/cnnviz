import React, { Fragment } from 'react';
import { MAX_PADDING } from '../utils/constants';
import { filterChannels } from '../utils/shared';

export default class CameraInput extends React.Component {
  componentDidMount() {
    const { displayWidth, displayHeight } = this.props;

    navigator.mediaDevices
      .getUserMedia({
        video: { displayWidth, displayHeight },
        audio: false,
      })
      .then(stream => {
        this.stream = stream;

        this.video.srcObject = stream;
        this.video.play();

        this.update();
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }

  componentDidUpdate(prevProps) {
    const { hasRedChannel, hasGreenChannel, hasBlueChannel } = this.props;

    if (
      hasRedChannel !== prevProps.hasRedChannel ||
      hasGreenChannel !== prevProps.hasGreenChannel ||
      hasBlueChannel !== prevProps.hasBlueChannel
    ) {
      this.update();
    }
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.requestID);

    if (this.stream != null) {
      // stop the camera
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  getData() {
    if (!this.dataCanvasContext) {
      return {
        inputWidth: null,
        inputHeight: null,
        inputData: null,
      };
    }

    const { hasRedChannel, hasGreenChannel, hasBlueChannel } = this.props;
    const {
      width: inputWidth,
      height: inputHeight,
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
      a: true,
    });

    return {
      inputWidth,
      inputHeight,
      inputData,
    };
  }

  update = () => {
    const { displayWidth, displayHeight, padding, onUpdate } = this.props;

    if (!this.video) {
      return;
    }

    /*
      The transformation matrix is restored to identity matrix whenever canvas
      dimensions change. Instead of tracking this change, we just set the
      transformation matrix every time before drawing.
      The matrix below performs a horizontal flip.
    */
    // prettier-ignore
    this.dataCanvasContext.setTransform(-1, 0, 0, 1, this.dataCanvasContext.canvas.width, 0);
    this.dataCanvasContext.drawImage(
      this.video,
      padding,
      padding,
      this.video.width,
      this.video.height
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

    this.requestID = requestAnimationFrame(this.update);
  };

  dataCanvasRef = canvas => {
    if (canvas !== null) {
      this.dataCanvasContext = canvas.getContext('2d', {
        alpha: false,
      });
    }
  };

  displayCanvasRef = canvas => {
    if (canvas !== null) {
      this.displayCanvasContext = canvas.getContext('2d', {
        alpha: false,
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
          .dataCanvas {
            display: none;
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
