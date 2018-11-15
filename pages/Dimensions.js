import React from 'react';

export default function Dimensions(props) {
  const { title, width, height, padding } = props;

  return (
    <div className="container">
      <strong>{title}:</strong> {width} × {height}
      {padding > 0 && ` (+ Padding = ${padding})`}
      <style jsx>{`
        .container {
          line-height: 32px;
        }
      `}</style>
    </div>
  );
}
