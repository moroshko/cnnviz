import React, { Fragment, useEffect, useContext, useRef } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useCamera } from '../hooks/useCamera';
import {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT,
  LAYER_TYPES,
} from '../utils/constants';
import { AppContext } from '../utils/reducer';

export default function CameraInput2() {
  const { state } = useContext(AppContext);
  const { layerType, convPadding, scale } = state;
  const padding = layerType === LAYER_TYPES.CONV ? convPadding : 0;
  const displayWidth = INPUT_DISPLAY_WIDTH + scale * (padding << 1);
  const displayHeight = INPUT_DISPLAY_HEIGHT + scale * (padding << 1);
  const [dataCanvasRef /*, dataCanvasContext*/] = useCanvas();
  const [displayCanvasRef /*, displayCanvasContext*/] = useCanvas();
  const stream = useCamera(displayWidth, displayHeight);
  const videoRef = useRef(null);

  useEffect(
    () => {
      if (stream !== null) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    },
    [stream]
  );

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
