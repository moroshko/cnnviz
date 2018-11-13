import { useState, useEffect } from 'react';

export default function useImage(src) {
  const [prevSrc, setPrevSrc] = useState(null);
  const [{ image, width, height }, setState] = useState({
    image: null,
    width: null,
    height: null,
  });

  if (src !== prevSrc) {
    setPrevSrc(src);
    setState({
      image: null,
      width: null,
      height: null,
    });
  }

  useEffect(
    () => {
      const image = new Image();

      image.onload = () => {
        setState({
          image,
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      };

      image.src = src;
    },
    [src]
  );

  return [image, width, height];
}
