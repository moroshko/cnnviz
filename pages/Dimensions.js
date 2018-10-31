import React from 'react';

export default function Dimensions(props) {
  const { width, height, padding } = props;

  return (
    <div className="container">
      {width} × {height}
      {padding > 0 && ` (+ Padding = ${padding})`}
      <style jsx>{`
        .container {
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
