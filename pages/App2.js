import React, { useReducer } from 'react';
import Input2 from './Input2';
import Output2 from './Output2';
import Controls2 from './Controls2';
import {
  initialControlsState,
  controlsReducer,
  ControlsContext,
} from '../utils/controlsReducer';

export default function App2() {
  const [controls, dispatchControlsChange] = useReducer(
    controlsReducer,
    initialControlsState
  );

  return (
    <ControlsContext.Provider value={{ controls, dispatchControlsChange }}>
      <div className="container">
        <div className="inputAndOutputContainer">
          <Input2 />
          <Output2 />
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
