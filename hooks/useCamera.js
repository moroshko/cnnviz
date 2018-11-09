import { useState, useEffect } from 'react';

export function useCamera(width, height) {
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let currentStream = null;

    navigator.mediaDevices
      .getUserMedia({
        video: { width, height },
        audio: false,
      })
      .then(stream => {
        currentStream = stream;
        setStream(stream);
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error.message);
      });

    return () => {
      if (currentStream !== null) {
        // stop the camera
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return stream;
}
