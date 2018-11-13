import { useState, useEffect } from 'react';

export function useRaf() {
  let [counter, setCounter] = useState(0);
  let rafID;

  function loop() {
    setCounter(counter => counter + 1);
    rafID = requestAnimationFrame(loop);
  }

  function start() {
    rafID = requestAnimationFrame(loop);
  }

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafID);
    };
  }, []);

  return [counter, start];
}
