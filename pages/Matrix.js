import React, { Fragment } from "react";
import range from "lodash.range";

export default class Matrix extends React.Component {
  state = {
    data: this.props.initialData,
    errors: this.getErrors(this.props.initialData)
  };

  componentDidUpdate(prevProps, prevState) {
    const { onUpdate } = this.props;
    const { data } = this.state;

    if (data !== prevState.data) {
      onUpdate(data);
    }
  }

  getData() {
    const { data } = this.state;

    return data;
  }

  getDataIndex(row, column) {
    const { columns } = this.props;

    return row * columns + column;
  }

  getErrors(data) {
    return data.map(value => typeof value !== "number");
  }

  render() {
    const { rows, columns } = this.props;
    const { data, errors } = this.state;

    return (
      <Fragment>
        <div className="container">
          <div className="top border" />
          <div className="bottom border" />
          <table>
            <tbody>
              {range(rows).map(row => (
                <tr key={row}>
                  {range(columns).map(column => {
                    const dataIndex = this.getDataIndex(row, column);

                    return (
                      <td key={column}>
                        <input
                          className={errors[dataIndex] && "withError"}
                          type="number"
                          step={0.1}
                          value={data[dataIndex]}
                          onChange={event => {
                            const value = parseFloat(event.target.value);

                            this.setState(({ data }) => {
                              const newData = data.slice();

                              newData[dataIndex] = isNaN(value) ? "" : value;

                              const newErrors = this.getErrors(newData);

                              return {
                                data: newData,
                                errors: newErrors
                              };
                            });
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
            background-color: #fff;
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
