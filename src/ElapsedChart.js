//ElapsedChart.js

import React, { useState } from "react";
import { Chart } from 'react-charts'

const ElapsedChart = ({ data,
                        axes,
                        visible}) => {
  function onClick() {
    console.log("Visible = " + visible)
  }

  return (
    <React.Fragment >
    {
      visible && (
        <div onClick={onClick}>
        <h1>Elapsed Time</h1>
        <div
          id="container1"
          style={{
            width: '95%',
            height: '400px'
          }}>
          <Chart data={data} axes={axes} visible="true" /><br /><br />
        </div>
        <br />
        <br />
        <br />
        <table>
          <tr>
            <td align="right">Savi - Pee</td>
            <td><div className="savi-pee-legend"></div></td>
            <td align="right">Savi - Poop</td>
            <td><div className="savi-poop-legend"></div></td>
          </tr>
          <tr>
            <td align="right">Sydney - Pee</td>
            <td><div className="sydney-pee-legend"></div></td>
            <td align="right">Sydney - Poop</td>
            <td><div className="sydney-poop-legend"></div></td>
          </tr>
        </table>
        <br />
        </div>
       )
    }
   </React.Fragment >
  )
};


export default ElapsedChart;
