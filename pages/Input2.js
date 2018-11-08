import React, { useContext } from 'react';
import Dimensions2 from './Dimensions2';
import ImageInput2 from './ImageInput2';
import CameraInput2 from './CameraInput2';
import {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT,
  INPUT_TYPES,
  LAYER_TYPES,
  MAX_SCALE,
  MAX_PADDING,
} from '../utils/constants';
import { ControlsContext } from '../utils/controlsReducer';

export default function Input2() {
  const { controls } = useContext(ControlsContext);
  const { inputType, layerType, convPadding, scale } = controls;
  const padding = layerType === LAYER_TYPES.CONV ? convPadding : 0;
  const displayWidth = INPUT_DISPLAY_WIDTH + scale * (padding << 1);
  const displayHeight = INPUT_DISPLAY_HEIGHT + scale * (padding << 1);
  const containerPadding = MAX_PADDING * MAX_SCALE - padding * scale;

  return (
    <div className="container">
      <Dimensions2
        title="Input"
        width={displayWidth / scale - (padding << 1)}
        height={displayHeight / scale - (padding << 1)}
        padding={padding}
      />
      <div className="content">
        {inputType === INPUT_TYPES.IMAGE && <ImageInput2 />}
        {inputType === INPUT_TYPES.CAMERA && <CameraInput2 />}
      </div>
      <style jsx>{`
        .container {
          padding-top: ${containerPadding}px;
          padding-left: ${containerPadding}px;
        }
        .content {
          width: ${displayWidth + containerPadding}px;
          height: ${displayHeight + containerPadding}px;
        }
      `}</style>
    </div>
  );
}
