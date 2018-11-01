import React, { useState, useContext, useEffect, useRef } from 'react';
import { ControlsContext } from '../utils/controlsReducer';
import { MAX_PADDING } from '../utils/constants';
import { filterChannels } from '../utils/shared';

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
    inputImage,
    hasRedChannel,
    hasGreenChannel,
    hasBlueChannel,
    scale,
  } = controls;
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imageRef = useRef(null);
  const image = imageRef.current;
  //console.log('render', { src: inputImage.src, image, isImageLoaded });
  const [dataCanvasRef, dataCanvasContext] = useCanvas();
  const [displayCanvasRef, displayCanvasContext] = useCanvas();
  const displayCanvasTranslate = (MAX_PADDING - padding) * scale;
  const containerWhitespace = displayCanvasTranslate << 1;

  useEffect(() => {
    if (
      !isImageLoaded ||
      dataCanvasContext === null ||
      displayCanvasContext === null
    ) {
      return;
    }

    //console.log('update', image);
    dataCanvasContext.drawImage(
      image,
      padding,
      padding,
      image.naturalWidth,
      image.naturalHeight
    );

    const { width: inputWidth, height: inputHeight } = dataCanvasRef.current;
    //console.log({ inputWidth, inputHeight });
    const { data: imageData } = dataCanvasContext.getImageData(
      0,
      0,
      inputWidth,
      inputHeight
    );
    //console.log(imageData);
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

  //console.log('rendering with src =', inputImage.src);

  return (
    <div className="container">
      <img
        src={inputImage.src}
        onLoad={() => {
          //console.log('yo');
          setIsImageLoaded(true);
        }}
        onError={() => {
          //console.log('Error:', error);
        }}
        ref={imageRef}
      />
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
        img {
          display: none;
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
