// EditableText.js
import React, { useState } from 'react';
import "./editable-text.css";

const EditableText = ({ backGroundColor, textColor, initialText, context, onEditComplete, readOnly }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [baseText, setBaseText] = useState(initialText)
  const [text, setText] = useState(initialText)

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onEditComplete(text, context)
    setBaseText(text)
  };
  
  const handleKeyPress = e => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === 'Escape') {
      revert()
    }
  }
  
  function getClassName() {
    return (readOnly ? "notes-display-readonly" : "notes-display")
  }

  function revert() {
    setIsEditing(false);
    setText(baseText)
  }

  return (
    <div onClick={handleClick} >
      {(isEditing && !readOnly) ? (
        <span width="90%" >
        <input
          autoFocus
          className="notes-input"
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyPress}
        /></span>
      ) : (
        <span width="90%" style={{ backgroundColor: {backGroundColor}, color: {textColor} }} className={getClassName()} title={initialText} >{initialText}</span>
      )}
    </div>
  );
};

export default EditableText;
