import React, { useContext } from 'react';
import Dimensions from './Dimensions';
import ImageInput from './ImageInput';
import CameraInput from './CameraInput';
import InputOverlay from './InputOverlay';
import {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT,
  INPUT_TYPES,
  LAYER_TYPES,
  MAX_SCALE,
  MAX_PADDING,
} from '../utils/constants';
import { AppContext } from '../utils/reducer';

export default function Input() {
  const { state } = useContext(AppContext);
  const { inputType, layerType, convPadding, scale } = state;
  const padding = layerType === LAYER_TYPES.CONV ? convPadding : 0;
  const displayWidth = INPUT_DISPLAY_WIDTH + scale * (padding << 1);
  const displayHeight = INPUT_DISPLAY_HEIGHT + scale * (padding << 1);
  const containerPadding = MAX_PADDING * MAX_SCALE - padding * scale;

  return (
    <div className="container">
      <Dimensions
        title="Input"
        width={displayWidth / scale - (padding << 1)}
        height={displayHeight / scale - (padding << 1)}
        padding={padding}
      />
      <div className="content">
        {inputType === INPUT_TYPES.IMAGE && <ImageInput />}
        {inputType === INPUT_TYPES.CAMERA && <CameraInput />}
        {scale === MAX_SCALE && <InputOverlay />}
      </div>
      <style jsx>{`
        .container {
          padding-top: ${containerPadding}px;
          padding-left: ${containerPadding}px;
        }
        .content {
          position: relative;
          width: ${displayWidth + containerPadding}px;
          height: ${displayHeight + containerPadding}px;
        }
      `}</style>
    </div>
  );
}
