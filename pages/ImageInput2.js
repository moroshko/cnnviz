import React, { useState, useContext, useEffect, useRef } from 'react';
import { ControlsContext } from '../utils/controlsReducer';
import { MAX_SCALE, MAX_PADDING, IMAGES } from '../utils/constants';
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

function useCanvas() {
  const [context, setContext] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const context = ref.current.getContext('2d', {
      alpha: false,
    });

    setContext(context);
  }, []);

  return [ref, context];
}

export default function ImageInput2(props) {
  const { displayWidth, displayHeight, padding } = props;
  const { controls } = useContext(ControlsContext);
  const {
    inputImageIndex,
    hasRedChannel,
    hasGreenChannel,
    hasBlueChannel,
    scale,
  } = controls;
  const [image, imageWidth, imageHeight] = useImage(
    IMAGES[inputImageIndex].src
  );
  const [dataCanvasRef, dataCanvasContext] = useCanvas();
  const [displayCanvasRef, displayCanvasContext] = useCanvas();
  const displayCanvasTranslate = MAX_PADDING * MAX_SCALE - padding * scale;
  const containerWhitespace = displayCanvasTranslate << 1;

  useEffect(() => {
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
  });

  return (
    <div className="container">
      <canvas
        className="dataCanvas"
        width={displayWidth / scale}
        height={displayHeight / scale}
        ref={dataCanvasRef}
      />
      <canvas
        className="displayCanvas"
        width={displayWidth}
        height={displayHeight}
        ref={displayCanvasRef}
      />
      <style jsx>{`
        .container {
          width: ${displayWidth + containerWhitespace}px;
          height: ${displayHeight + containerWhitespace}px;
        }
        .dataCanvas {
          display: none;
        }
        .displayCanvas {
          transform: translate(
            ${displayCanvasTranslate}px,
            ${displayCanvasTranslate}px
          );
        }
      `}</style>
    </div>
  );
}
