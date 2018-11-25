import React from 'react';

const Matrix = React.memo(props => {
  const { isEditable, rows, columns, data, errors, onChange } = props;

  return (
    <div className="container">
      <div className="top border" />
      <div className="bottom border" />
      <table>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              {Array.from({ length: columns }, (_, column) => {
                const dataIndex = row * columns + column;

                return (
                  <td key={column}>
                    <input
                      className={errors[dataIndex] && 'withError'}
                      disabled={!isEditable}
                      value={data[dataIndex]}
                      onChange={event => {
                        const newData = data.slice();

                        newData[dataIndex] = event.target.value;

                        const newErrors = newData.map(
                          d => d.trim() === '' || isNaN(Number(d))
                        );

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
      <style jsx>{`
        .container {
          border: 2px solid #000;
          border-radius: 2px;
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
    </div>
  );
});

export default Matrix;
