import React, { useReducer } from 'react';
import Input2 from './Input2';
import Output2 from './Output2';
import Controls2 from './Controls2';
import { initialState, reducer, AppContext } from '../utils/reducer';

export default function App2() {
  const [state, dispatchChange] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatchChange }}>
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
    </AppContext.Provider>
  );
}
