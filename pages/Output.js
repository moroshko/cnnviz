import React, { useMutationEffect, useContext } from 'react';
import useCanvas from '../hooks/useCanvas';
import { MAX_SCALE, MAX_PADDING } from '../utils/constants';
import { AppContext } from '../utils/reducer';
import Dimensions from './Dimensions';
import OutputOverlay from './OutputOverlay';

export default function Output() {
  const [canvasRef, canvasContext] = useCanvas();
  const { state } = useContext(AppContext);
  const { outputDataWidth, outputDataHeight, scale, outputData } = state;
  const outputWidth = outputDataWidth * scale;
  const outputHeight = outputDataHeight * scale;

  useMutationEffect(
    () => {
      if (outputData === null) {
        return;
      }

      const imageData = new ImageData(
        outputData,
        outputDataWidth,
        outputDataHeight
      );

      createImageBitmap(imageData).then(imageBitmap => {
        canvasContext.imageSmoothingEnabled = false;
        canvasContext.drawImage(
          imageBitmap,
          0,
          0,
          outputDataWidth,
          outputDataHeight,
          0,
          0,
          outputWidth,
          outputHeight
        );
      });
    },
    [outputData]
  );

  return (
    <div className="container">
      <Dimensions
        title="Output"
        width={outputDataWidth}
        height={outputDataHeight}
      />
      <div className="content">
        <canvas width={outputWidth} height={outputHeight} ref={canvasRef} />
        {scale === MAX_SCALE && <OutputOverlay />}
      </div>
      <style jsx>{`
        .container {
          flex-shrink: 0;
          margin-top: ${MAX_PADDING * MAX_SCALE}px;
          margin-left: 20px;
        }
        .content {
          position: relative;
        }
      `}</style>
    </div>
  );
}
