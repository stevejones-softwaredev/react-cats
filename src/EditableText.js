// EditableText.js
import React, { useState } from 'react';
import "./editable-text.css";

const EditableText = ({ backGroundColor, textColor, initialText, context, onEditComplete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [baseText, setBaseText] = useState(initialText);
  const [text, setText] = useState(initialText);

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
    } else if (e.key == 'Escape') {
      console.log("Escape pressed")
      revert()
    }
  }
  
  function revert() {
    setIsEditing(false);
    setText(baseText)
    console.log("Text set to " + baseText)
  }

  return (
    <div onClick={handleClick} >
      {isEditing ? (
        <span width="130" >
        <input
          autoFocus
          className="notes-input"
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyPress}
        /></span>
      ) : (
        <span width="130" style={{ backgroundColor: {backGroundColor}, color: {textColor} }} className="notes-display" title={text} >{text}</span>
      )}
    </div>
  );
};

export default EditableText;
