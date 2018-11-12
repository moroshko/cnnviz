import React, { Fragment, useEffect, useContext, useRef } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { useCamera } from '../hooks/useCamera';
import {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT,
  LAYER_TYPES,
} from '../utils/constants';
import { AppContext } from '../utils/reducer';
import { filterChannels } from '../utils/shared';

export default function CameraInput2() {
  const { state, dispatchChange } = useContext(AppContext);
  const {
    layerType,
    hasRedChannel,
    hasGreenChannel,
    hasBlueChannel,
    convPadding,
    scale,
  } = state;
  const padding = layerType === LAYER_TYPES.CONV ? convPadding : 0;
  const displayWidth = INPUT_DISPLAY_WIDTH + scale * (padding << 1);
  const displayHeight = INPUT_DISPLAY_HEIGHT + scale * (padding << 1);
  const [dataCanvasRef, dataCanvasContext] = useCanvas();
  const [displayCanvasRef, displayCanvasContext] = useCanvas();
  const stream = useCamera(displayWidth, displayHeight);
  const videoRef = useRef(null);
  const rafRef = useRef();

  function draw() {
    const { width: inputWidth, height: inputHeight } = dataCanvasContext.canvas;

    /*
      The transformation matrix is restored to identity matrix whenever canvas
      dimensions change. Instead of tracking this change, we just set the
      transformation matrix every time before drawing.
      The matrix below performs a horizontal flip.
    */
    dataCanvasContext.setTransform(-1, 0, 0, 1, inputWidth, 0);
    dataCanvasContext.drawImage(
      videoRef.current,
      padding,
      padding,
      videoRef.current.width,
      videoRef.current.height
    );

    const { data } = dataCanvasContext.getImageData(
      0,
      0,
      inputWidth,
      inputHeight
    );
    const inputData = filterChannels({
      data,
      r: hasRedChannel,
      g: hasGreenChannel,
      b: hasBlueChannel,
      a: true,
    });

    dispatchChange({
      type: 'INPUT_DATA_CHANGE',
      inputData,
      inputWidth,
      inputHeight,
    });

    createImageBitmap(new ImageData(inputData, inputWidth, inputHeight)).then(
      imageBitmap => {
        displayCanvasContext.imageSmoothingEnabled = false;
        displayCanvasContext.drawImage(
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
      }
    );

    rafRef.current = requestAnimationFrame(draw);
  }

  useEffect(
    () => {
      if (stream !== null) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        draw();
      }

      return () => {
        cancelAnimationFrame(rafRef.current);
      };
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
