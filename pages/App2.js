import React, { useReducer } from 'react';
import ImageInput2 from './ImageInput2';
import Controls2 from './Controls2';
import {
  initialControlsState,
  controlsReducer,
  ControlsContext,
} from '../utils/controlsReducer';
import {
  INPUT_DISPLAY_WIDTH,
  INPUT_DISPLAY_HEIGHT,
  LAYER_TYPES,
} from '../utils/constants';

export default function App2() {
  const [controls, dispatchControlsChange] = useReducer(
    controlsReducer,
    initialControlsState
  );
  const { layerType, convPadding, scale } = controls;
  const inputPadding = layerType === LAYER_TYPES.CONV ? convPadding : 0;
  const displayWidth = INPUT_DISPLAY_WIDTH + scale * (inputPadding << 1);
  const displayHeight = INPUT_DISPLAY_HEIGHT + scale * (inputPadding << 1);

  return (
    <ControlsContext.Provider value={{ controls, dispatchControlsChange }}>
      <div className="container">
        <div className="inputAndOutputContainer">
          <ImageInput2
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            padding={inputPadding}
          />
        </div>
        <Controls2 />
        <style jsx>{`
          .container {
            padding: 10px;
            background-color: #eee;
          }
          .inputAndOutputContainer {
            display: flex;
          }
        `}</style>
      </div>
    </ControlsContext.Provider>
  );
}
