import { useState, useEffect, useRef } from 'react';

export default function useRaf() {
  const [counter, setCounter] = useState(0);
  const rafID = useRef();

  function loop() {
    setCounter(counter => counter + 1);
    rafID.current = requestAnimationFrame(loop);
  }

  function start() {
    rafID.current = requestAnimationFrame(loop);
  }

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafID.current);
    };
  }, []);

  return [counter, start];
}
