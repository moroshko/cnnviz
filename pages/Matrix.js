import React, { Fragment } from "react";

export default class Matrix extends React.Component {
  getDataIndex(row, column) {
    const { columns } = this.props;

    return row * columns + column;
  }

  getErrors(data) {
    return data.map(value => typeof value !== "number");
  }

  render() {
    const { isEditable, rows, columns, data, errors, onChange } = this.props;

    return (
      <Fragment>
        <div className="container">
          <div className="top border" />
          <div className="bottom border" />
          <table>
            <tbody>
              {Array.from({ length: rows }, (_, row) => (
                <tr key={row}>
                  {Array.from({ length: columns }, (_, column) => {
                    const dataIndex = this.getDataIndex(row, column);

                    return (
                      <td key={column}>
                        <input
                          className={errors[dataIndex] && "withError"}
                          type="number"
                          step={0.1}
                          disabled={!isEditable}
                          value={data[dataIndex]}
                          onChange={event => {
                            const value = parseFloat(event.target.value);
                            const newData = data.slice();

                            newData[dataIndex] = isNaN(value) ? "" : value;

                            const newErrors = this.getErrors(newData);

                            onChange(newData, newErrors);
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <style jsx>{`
          .container {
            border: 2px solid #000;
            borderradius: 2px;
            position: relative;
          }
          .border {
            position: absolute;
            left: 4px;
            right: 4px;
            height: 2px;
            background-color: #eee;
          }
          .top {
            top: -2px;
          }
          .bottom {
            bottom: -2px;
          }
          table {
            padding-right: 2px;
          }
          td {
            padding: 2px;
            width: 50px;
            height: 30px;
          }
          input {
            border: 0;
            text-align: center;
            width: 100%;
            height: 100%;
            outline-offset: 0;
          }
          input:focus {
            outline: 2px solid #3497ff;
          }
          input.withError {
            outline: 2px solid red;
          }
        `}</style>
      </Fragment>
    );
  }
}
