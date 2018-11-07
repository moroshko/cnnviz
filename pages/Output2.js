import React, { useEffect, useContext } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { MAX_SCALE, MAX_PADDING } from '../utils/constants';
import { ControlsContext } from '../utils/controlsReducer';

export default function Output2() {
  const [canvasRef, canvasContext] = useCanvas();
  const { controls } = useContext(ControlsContext);
  const { outputDataWidth, outputDataHeight, scale, outputData } = controls;
  const outputWidth = outputDataWidth * scale;
  const outputHeight = outputDataHeight * scale;

  useEffect(
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
      <canvas width={outputWidth} height={outputHeight} ref={canvasRef} />
      <style jsx>{`
        .container {
          flex-shrink: 0;
          width: ${outputWidth}px;
          height: ${outputHeight}px;
          transform: translateY(${MAX_PADDING * MAX_SCALE}px);
          margin-left: 20px;
          background-color: white;
        }
      `}</style>
    </div>
  );
}
