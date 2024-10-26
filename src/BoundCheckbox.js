// BoundCheckbox.js
import React, { useState } from 'react';
import "./editable-text.css";

const BoundCheckbox = ({ backGroundColor, initialState, context, onChangeComplete, readOnly }) => {
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
    {readOnly ? (
      <span width="130" >
        <input
          type="checkbox"
          checked={initialState}
          onChange={handleChange}
          disabled />
        </span>
      ) : (
      <span width="130" >
        <input
          type="checkbox"
          checked={initialState}
          onChange={handleChange} />
        </span>
      )}
    </div>
  );
};

export default BoundCheckbox;
