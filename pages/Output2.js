import React, { useContext } from 'react';
import { MAX_SCALE, MAX_PADDING } from '../utils/constants';
import { ControlsContext } from '../utils/controlsReducer';

export default function Output2() {
  const { controls } = useContext(ControlsContext);
  const { outputDataWidth, outputDataHeight, scale } = controls;
  const outputWidth = outputDataWidth * scale;
  const outputHeight = outputDataHeight * scale;

  return (
    <div className="container">
      <canvas width={outputWidth} height={outputHeight} />
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
