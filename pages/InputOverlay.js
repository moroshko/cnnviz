import React, { Fragment, useContext, useCallback } from 'react';
import {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT,
  LAYER_TYPES,
} from '../utils/constants';
import { clamp } from '../utils/shared';
import { AppContext } from '../utils/reducer';

export default function InputOverlay() {
  const { state, dispatchChange } = useContext(AppContext);
  const {
    layerType,
    convFilters,
    convFilterIndex,
    convPadding,
    poolFilterSize,
    scale,
    inputData,
    inputWidth,
    inputHeight,
    inputOverlayGridX,
    inputOverlayGridY,
  } = state;
  const filterSize =
    layerType === LAYER_TYPES.CONV
      ? convFilters[convFilterIndex].filterSize
      : poolFilterSize;
  const halfFilterSize = filterSize >> 1;
  const padding = layerType === LAYER_TYPES.CONV ? convPadding : 0;
  const displayWidth = INPUT_DISPLAY_WIDTH + scale * (padding << 1);
  const displayHeight = INPUT_DISPLAY_HEIGHT + scale * (padding << 1);
  const maxInputOverlayGridX = inputWidth - filterSize;
  const maxInputOverlayGridY = inputHeight - filterSize;
  const onMouseMove = useCallback(
    event => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) / scale);
      const y = Math.floor((event.clientY - rect.top) / scale);
      const newInputOverlayGridX = clamp(x - halfFilterSize, [
        0,
        maxInputOverlayGridX,
      ]);
      const newInputOverlayGridY = clamp(y - halfFilterSize, [
        0,
        maxInputOverlayGridY,
      ]);

      if (
        newInputOverlayGridX !== inputOverlayGridX ||
        newInputOverlayGridY !== inputOverlayGridY
      ) {
        dispatchChange({
          type: 'OVERLAY_GRID_POSITION_CHANGE',
          inputOverlayGridX: newInputOverlayGridX,
          inputOverlayGridY: newInputOverlayGridY,
        });
      }
    },
    [
      scale,
      halfFilterSize,
      maxInputOverlayGridX,
      maxInputOverlayGridY,
      inputOverlayGridX,
      inputOverlayGridY,
    ]
  );
  const onMouseLeave = useCallback(() => {
    dispatchChange({
      type: 'OVERLAY_GRID_POSITION_CHANGE',
      inputOverlayGridX: null,
      inputOverlayGridY: null,
    });
  }, []);

  return (
    <svg
      className="container"
      width={displayWidth}
      height={displayHeight}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <defs>
        <pattern
          id="gridPattern"
          x={0}
          y={0}
          width={scale}
          height={scale}
          patternUnits="userSpaceOnUse"
        >
          <rect
            className="gridPatternRect"
            x={0}
            y={0}
            width={scale}
            height={scale}
          />
        </pattern>
      </defs>
      {inputOverlayGridX !== null && inputOverlayGridY !== null && (
        <Fragment>
          <rect
            className="grid"
            x={inputOverlayGridX * scale}
            y={inputOverlayGridY * scale}
            width={filterSize * scale}
            height={filterSize * scale}
          />
          {inputData !== null &&
            Array.from({ length: filterSize * filterSize }, (_, i) => {
              const x = inputOverlayGridX + (i % filterSize);
              const y = inputOverlayGridY + Math.floor(i / filterSize);

              return (
                <text
                  className="text"
                  x={x * scale + scale / 2}
                  y={y * scale + scale / 2}
                  stroke="red"
                  key={i}
                >
                  {inputData[y * (inputWidth << 2) + (x << 2)]}
                </text>
              );
            })}
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
          fill: url(#gridPattern);
        }
        .gridPatternRect {
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
