//AddRow.js
import React, { useState } from 'react';
import DateTimePicker from 'react-datetime-picker';
import Select from 'react-select'
import "./add-row.css";

const AddRow = ({ names, locations, activities, onSubmit, onAddRowKeyDown, errorMessage }) => {
  const { format } = require('date-fns');

  const [ eventTime, setEventTime] = useState(new Date());
  const [ catName, setCatName] = useState("");
  const [ activity, setActivity] = useState("");
  const [ eventLocation, setEventLocation] = useState("");
  const [ comment, setComment] = useState("");
  const [ raked, setRaked] = useState(false);
  
  function getLabels(options, field) {
    var labelList = []

    for (var option of options) {
      var val = option[field]
      labelList.push({ label: option[field], value: option[field] })
    }

    return labelList
  }
  
  const setTimeFields = (event) => {
    setEventTime(event)
  }

  const onNameSelected = (event) => {
    setCatName(event.label)
  }

  const onLocationSelected = (event) => {
    setEventLocation(event.label)
  }

  const onActivitySelected = (event) => {
    if (event.label === "💦") {
      setActivity("Pee")
    } else {
      setActivity("Poop")
    }
  }
  
  const onComponentKeyDown = (event) => {
    var catEvent = {}
    catEvent.event_ts = parseInt(eventTime.valueOf() / 1000) + ".000000"
    catEvent.human_time = format(eventTime, 'EEEE, dd-MMM-yy HH:mm:ss')
    catEvent.cat_name = catName
    catEvent.cat_activity = activity
    catEvent.location = eventLocation
    catEvent.comment = comment
    catEvent.raked = raked
    catEvent.image_url = '<https://steve-jones.dev/web/technical_difficulties.gif>'

    onAddRowKeyDown(event, catEvent)
  }

  const onCommentChanged = (event) => {
    setComment(event.target.value)
  }

  const onRakedChanged = (event) => {
    setRaked(event.target.checked)
  }
  
  const sendCatEvent = () => {
    var catEvent = {}
    catEvent.event_ts = parseInt(eventTime.valueOf() / 1000) + ".000000"
    catEvent.human_time = format(eventTime, 'EEEE, dd-MMM-yy HH:mm:ss')
    catEvent.cat_name = catName
    catEvent.cat_activity = activity
    catEvent.location = eventLocation
    catEvent.comment = comment
    catEvent.raked = raked
    catEvent.image_url = '<https://steve-jones.dev/web/technical_difficulties.gif>'

    onSubmit(catEvent)
  }

  return (
      <React.Fragment>
      {
        (errorMessage.length > 0 && (
          <tr onKeyDown={ onComponentKeyDown }>
            <td colspan="7" className="error-display" ><b>{errorMessage}</b></td>
          </tr>
        ))
      }
      <tr onKeyDown={ onComponentKeyDown }>
      <td><DateTimePicker name="eventTime" value={eventTime } onChange={setTimeFields } /></td>
      <td><Select options={getLabels(names, 'name')} textField="name" autoSelectMatches="true" onChange={onNameSelected} /></td>
      <td><Select options={getLabels(activities, 'name')} textField="name" onChange={onActivitySelected} /></td>
      <td><div style={{width: '250px'}}><Select options={getLabels(locations, 'name')} textField="name" autoSelectMatches="true" onChange={onLocationSelected} /></div></td>
      <td></td>
      <td><input type="text" onChange={onCommentChanged} value={comment} /></td>
      <td><input type="checkbox" onChange={onRakedChanged} value={raked} /></td><td><input type="button" value="Submit" onClick={ sendCatEvent } /></td>
    </tr>
    </React.Fragment>
  )
};

export default AddRow;
