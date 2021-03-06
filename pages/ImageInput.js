import React, { Fragment, useContext, useMutationEffect } from 'react';
import useCanvas from '../hooks/useCanvas';
import useImage from '../hooks/useImage';
import { AppContext } from '../utils/reducer';
import {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT,
  LAYER_TYPES,
  IMAGES,
} from '../utils/constants';
import { filterChannels } from '../utils/shared';

export default function ImageInput() {
  const { state, dispatchChange } = useContext(AppContext);
  const {
    layerType,
    inputImageIndex,
    hasRedChannel,
    hasGreenChannel,
    hasBlueChannel,
    convPadding,
    scale,
  } = state;
  const padding = layerType === LAYER_TYPES.CONV ? convPadding : 0;
  const displayWidth = INPUT_DISPLAY_WIDTH + scale * (padding << 1);
  const displayHeight = INPUT_DISPLAY_HEIGHT + scale * (padding << 1);
  const [image, imageWidth, imageHeight] = useImage(
    IMAGES[inputImageIndex].src
  );
  const [dataCanvasRef, dataCanvasContext] = useCanvas();
  const [displayCanvasRef, displayCanvasContext] = useCanvas();

  useMutationEffect(
    () => {
      if (
        image === null ||
        imageWidth === null ||
        imageHeight === null ||
        dataCanvasContext === null ||
        displayCanvasContext === null
      ) {
        return;
      }

      dataCanvasContext.drawImage(
        image,
        padding,
        padding,
        imageWidth,
        imageHeight
      );

      const { width: inputWidth, height: inputHeight } = dataCanvasRef.current;
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
    },
    [
      image,
      imageWidth,
      imageHeight,
      padding,
      hasRedChannel,
      hasGreenChannel,
      hasBlueChannel,
      displayWidth,
      displayHeight,
    ]
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
      <style jsx>{`
        .dataCanvas {
          display: none;
        }
      `}</style>
    </Fragment>
  );
}
