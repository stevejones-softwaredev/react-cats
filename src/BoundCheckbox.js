// BoundCheckbox.js
import React, { useState } from 'react';
import "./editable-text.css";

const BoundCheckbox = ({ backGroundColor, initialState, context, onChangeComplete, readOnly, label }) => {
  const [checked, setChecked] = useState(initialState);

  const handleChange = (event) => {
    setChecked(!checked)
    onChangeComplete(checked, context)
  };

  const handleClick = (event) => {
    event.stopPropagation()
  };

  return (
    <div onClick={handleClick}>
      <span width="130" >
        <input
          type="checkbox"
          checked={initialState}
          onChange={handleChange}
          disabled={readOnly} />
        </span>
        <label>{label}</label>
    </div>
  );
};

export default BoundCheckbox;
