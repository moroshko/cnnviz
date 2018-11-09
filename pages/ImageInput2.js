import React, {
  Fragment,
  useState,
  useContext,
  useEffect,
  useLayoutEffect,
} from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { AppContext } from '../utils/reducer';
import {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT,
  LAYER_TYPES,
  IMAGES,
} from '../utils/constants';
import { filterChannels } from '../utils/shared';

function useImage(src) {
  const [prevSrc, setPrevSrc] = useState(null);
  const [{ image, width, height }, setState] = useState({
    image: null,
    width: null,
    height: null,
  });

  if (src !== prevSrc) {
    setPrevSrc(src);
    setState({
      image: null,
      width: null,
      height: null,
    });
  }

  useEffect(
    () => {
      const image = new Image();

      image.onload = () => {
        setState({
          image,
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      };

      image.src = src;
    },
    [src]
  );

  return [image, width, height];
}

export default function ImageInput2() {
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

  useLayoutEffect(
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
      const { data: imageData } = dataCanvasContext.getImageData(
        0,
        0,
        inputWidth,
        inputHeight
      );
      const inputData = filterChannels({
        data: imageData,
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
