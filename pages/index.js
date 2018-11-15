import React, { StrictMode } from 'react';
import App from './App';

export default function Index() {
  return (
    <StrictMode>
      <App />
      <style jsx global>{`
        body {
          margin: 0;
        }
      `}</style>
    </StrictMode>
  );
}
