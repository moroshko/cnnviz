import React, { useReducer } from 'react';
import Input from './Input';
import Output from './Output';
import Controls from './Controls';
import { initialState, reducer, AppContext } from '../utils/reducer';

export default function App2() {
  const [state, dispatchChange] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatchChange }}>
      <div className="container">
        <div className="inputAndOutputContainer">
          <Input />
          <Output />
        </div>
        <Controls />
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
    </AppContext.Provider>
  );
}
