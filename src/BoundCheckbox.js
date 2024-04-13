// BoundCheckbox.js
import React, { useState } from 'react';
import "./editable-text.css";

const BoundCheckbox = ({ backGroundColor, initialState, context, onChangeComplete }) => {
  const [checked, setChecked] = useState(initialState);

  const handleChange = (event) => {
    setChecked(!checked)
    onChangeComplete(checked, context)
  };

  return (
    <div>
      <span width="130" >
        <input
          disabled="true"
          type="checkbox"
          checked={checked}
          onChange={handleChange}
        /></span>
    </div>
  );
};

export default BoundCheckbox;
