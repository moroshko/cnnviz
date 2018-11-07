import React, { useEffect, useContext } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { LAYER_TYPES, MAX_SCALE, MAX_PADDING } from '../utils/constants';
import { convolve } from '../utils/convolution';
import { pool } from '../utils/pooling';
import { ControlsContext } from '../utils/controlsReducer';

export default function Output2() {
  const [canvasRef, canvasContext] = useCanvas();
  const { controls } = useContext(ControlsContext);
  const {
    layerType,
    convFilters,
    convFilterIndex,
    convStride,
    poolFilterSize,
    poolStride,
    outputDataWidth,
    outputDataHeight,
    scale,
    inputData,
    inputWidth,
    inputHeight,
  } = controls;
  const outputWidth = outputDataWidth * scale;
  const outputHeight = outputDataHeight * scale;

  function getOutputData() {
    switch (layerType) {
      case LAYER_TYPES.CONV: {
        const { filter, filterSize } = convFilters[convFilterIndex];

        return convolve({
          inputWidth,
          inputHeight,
          inputData,
          filter,
          filterSize,
          stride: convStride,
          outputWidth: outputDataWidth,
          outputHeight: outputDataHeight,
        }).outputData;
      }

      case LAYER_TYPES.POOL: {
        return pool({
          inputWidth,
          inputHeight,
          inputData,
          filterSize: poolFilterSize,
          stride: poolStride,
          outputWidth: outputDataWidth,
          outputHeight: outputDataHeight,
        }).outputData;
      }

      default: {
        throw new Error(`Unknown layer type: ${layerType}`);
      }
    }
  }

  useEffect(
    () => {
      if (inputData === null) {
        return;
      }

      const imageData = new ImageData(
        getOutputData(),
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
    [inputData]
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
