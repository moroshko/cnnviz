import React, { Fragment, useContext, useRef } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT,
  LAYER_TYPES,
} from '../utils/constants';
import { ControlsContext } from '../utils/controlsReducer';

export default function CameraInput2() {
  const { controls } = useContext(ControlsContext);
  const { layerType, convPadding, scale } = controls;
  const padding = layerType === LAYER_TYPES.CONV ? convPadding : 0;
  const displayWidth = INPUT_DISPLAY_WIDTH + scale * (padding << 1);
  const displayHeight = INPUT_DISPLAY_HEIGHT + scale * (padding << 1);
  const [dataCanvasRef /*, dataCanvasContext*/] = useCanvas();
  const [displayCanvasRef /*, displayCanvasContext*/] = useCanvas();
  const videoRef = useRef(null);

  return (
    <Fragment>
      <canvas
        className="dataCanvas"
        width={displayWidth / scale}
        height={displayHeight / scale}
        ref={dataCanvasRef}
      />
      <canvas
        width={displayWidth}
        height={displayHeight}
        ref={displayCanvasRef}
      />
      <video
        width={INPUT_DISPLAY_WIDTH}
        height={INPUT_DISPLAY_HEIGHT}
        ref={videoRef}
      />
      <style jsx>{`
        .dataCanvas {
          display: none;
        }
        video {
          display: none;
        }
      `}</style>
    </Fragment>
  );
}
