import React, { Fragment } from "react";

export default class Dimensions extends React.Component {
  render() {
    const { width, height, padding } = this.props;

    return (
      <Fragment>
        <div className="container">
          {width} × {height}
          {padding > 0 && ` (+ Padding = ${padding})`}
        </div>
        <style jsx>{`
          .container {
            font-size: 12px;
          }
        `}</style>
      </Fragment>
    );
  }
}
