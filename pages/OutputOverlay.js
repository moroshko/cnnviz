import React, { Fragment, useContext } from 'react';
import { LAYER_TYPES } from '../utils/constants';
import { AppContext } from '../utils/reducer';

export default function OutputOverlay() {
  const { state } = useContext(AppContext);
  const {
    layerType,
    convStride,
    poolStride,
    outputDataWidth,
    outputDataHeight,
    scale,
    inputData,
    inputOverlayGridX,
    inputOverlayGridY,
    outputData,
  } = state;
  const stride = layerType === LAYER_TYPES.CONV ? convStride : poolStride;
  const outputOverlayGridX = inputOverlayGridX / stride;
  const outputOverlayGridY = inputOverlayGridY / stride;

  return (
    <svg
      className="container"
      width={outputDataWidth * scale}
      height={outputDataHeight * scale}
    >
      {inputOverlayGridX !== null && inputOverlayGridY !== null && (
        <Fragment>
          <rect
            className="grid"
            x={outputOverlayGridX * scale}
            y={outputOverlayGridY * scale}
            width={scale}
            height={scale}
          />
          {inputData !== null && (
            <text
              className="text"
              x={outputOverlayGridX * scale + scale / 2}
              y={outputOverlayGridY * scale + scale / 2}
              stroke="red"
            >
              {
                outputData[
                  outputOverlayGridY * (outputDataWidth << 2) +
                    (outputOverlayGridX << 2)
                ]
              }
            </text>
          )}
        </Fragment>
      )}
      <style jsx>{`
        .container {
          position: absolute;
          left: 0;
          top: 0;
        }
        .grid {
          stroke: #1e9e1c;
          fill: none;
        }
        .text {
          font-size: 9px;
          text-anchor: middle;
          dominant-baseline: central;
          cursor: default;
        }
      `}</style>
    </svg>
  );
}
