import { useState, useEffect, useRef } from 'react';

export function useCanvas() {
  const [context, setContext] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const context = ref.current.getContext('2d', {
      alpha: false,
    });

    setContext(context);
  }, []);

  return [ref, context];
}
