import React, { StrictMode } from 'react';
import App2 from './App2';

export default function Index() {
  return (
    <StrictMode>
      <App2 />
      <style jsx global>{`
        body {
          margin: 0;
        }
      `}</style>
    </StrictMode>
  );
}
