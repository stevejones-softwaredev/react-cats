//AddRow.js
import React, { useState } from 'react';
import Combobox from "react-widgets/Combobox";
import DateTimePicker from 'react-datetime-picker';

const AddRow = ({ names, locations, activities, onSubmit, onAddRowKeyDown }) => {
  const { format } = require('date-fns');

  const [ eventTime, setEventTime] = useState(new Date());
  const [ catName, setCatName] = useState("");
  const [ activity, setActivity] = useState("");
  const [ eventLocation, setEventLocation] = useState("");
  const [ comment, setComment] = useState("");
  const [ raked, setRaked] = useState(false);
  
  function printObject(obj) {
    for (var prop in obj) {
      console.log(prop + ": " + obj[prop])
    }
  }
  
  const setTimeFields = (event) => {
    setEventTime(event)
  }

  const onNameSelected = (event) => {
    setCatName(event.name)
  }

  const onLocationSelected = (event) => {
    printObject(event)
    setEventLocation(event.name)
  }

  const onActivitySelected = (event) => {
    printObject(event)
    if (event.name === "💦") {
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
    printObject(catEvent)

    onSubmit(catEvent)
  }

  return (
    <tr onKeyDown={ onComponentKeyDown }>
      <td><DateTimePicker name="eventTime" value={eventTime } onChange={setTimeFields } /></td>
      <td><Combobox data={names} textField="name" autoSelectMatches="true" onSelect={onNameSelected} /></td>
      <td><Combobox data={activities} textField="name" onSelect={onActivitySelected} /></td>
      <td><Combobox data={locations} textField="name" autoSelectMatches="true" onSelect={onLocationSelected} /></td>
      <td></td>
      <td><input type="text" onChange={onCommentChanged} value={comment} /></td>
      <td><input type="checkbox" onChange={onRakedChanged} value={raked} /></td><td><input type="button" value="Submit" onClick={ sendCatEvent } /></td>
    </tr>
  )
};

export default AddRow;
