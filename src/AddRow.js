//AddRow.js
import React, { useState, useEffect, useRef } from 'react';
import DateTimePicker from 'react-datetime-picker';
import Select from 'react-select'
import moment from 'moment';
import { enUS } from 'date-fns/locale/en-US'
import "./add-row.css";

const AddRow = ({ names, locations, activities, onSubmit, onCancel, onAddRowKeyDown, errorMessage, catEvent }) => {
  const { format } = require('date-fns-tz');
  var initialTime, initialDate

  if (catEvent && catEvent.event_ts) {
    initialTime = String(catEvent.event_ts)
  } else {
    initialTime = String(new Date().valueOf())
  }

  if (catEvent && catEvent.human_time) {
    initialDate = moment(catEvent.human_time, 'dddd, DD-MMM-YYYY HH:mm:ss').toDate()
  } else {
    initialDate = new Date()
  }

  const [ eventTime, setEventTime] = useState(initialTime);
  const [ humanTime, setHumanTime] = useState(initialDate);
  const [ catName, setCatName] = useState(catEvent.cat_name);
  const [ activity, setActivity] = useState(catEvent.cat_activity);
  const [ eventLocation, setEventLocation] = useState(catEvent.location);
  const [ comment, setComment] = useState(catEvent.comment);
  const [ raked, setRaked] = useState(catEvent.raked);
  const [ manual, setManual] = useState(catEvent.manual);
  
  const componentRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (componentRef.current && !componentRef.current.contains(event.target)) {
        onCancel && onCancel();
      }
    };
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [ onCancel ]);

  function getLabels(options, field) {
    var labelList = []

    for (var option of options) {
      labelList.push({ label: option[field], value: option[field] })
    }

    return labelList
  }

  function createDefaultValue(initial) {
    if (initial === "Pee") {
      return ({ label: "💦", value: "💦" })
    } else if (initial === "Poop") {
      return ({ label: "💩", value: "💩" })
    } else {
      return ({ label: initial, value: initial })
    }
  }

  function getCatName() {
    if (catEvent && catEvent.cat_name) {
      return createDefaultValue(catEvent.cat_name)
    }

    return createDefaultValue(catName)
  }

  function getCatActivity() {
    if (catEvent && catEvent.cat_activity) {
      return createDefaultValue(catEvent.cat_activity)
    }

    return createDefaultValue(activity)
  }

  function getLocation() {
    if (catEvent && catEvent.location) {
      return createDefaultValue(catEvent.location)
    }

    return createDefaultValue(eventLocation)
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
    catEvent.event_ts = eventTime
    catEvent.human_time = format(humanTime, 'EEEE, dd-MMM-yy HH:mm:ss zzz', {
      timeZone: 'America/New_York',
      locale: enUS
    }).valueOf()
    catEvent.cat_name = catName
    catEvent.cat_activity = activity
    catEvent.location = eventLocation
    catEvent.comment = comment
    catEvent.raked = raked
    catEvent.manual = manual
    catEvent.image_url = '<https://steve-jones.dev/web/technical_difficulties.gif>'

    onAddRowKeyDown(event, catEvent)
  }

  const onCommentChanged = (event) => {
    catEvent.comment = event.target.value
    setComment(event.target.value)
  }

  const onRakedChanged = (event) => {
    catEvent.raked = event.target.checked
    setRaked(event.target.checked)
  }
  
  const sendCatEvent = () => {
    var catEvent = {}
    catEvent.event_ts = eventTime
    catEvent.human_time = format(humanTime, 'EEEE, dd-MMM-yy HH:mm:ss zzz', {
      timeZone: 'America/New_York',
      locale: enUS
    }).valueOf()
    catEvent.cat_name = catName
    catEvent.cat_activity = activity
    catEvent.location = eventLocation
    catEvent.comment = comment
    catEvent.raked = raked
    catEvent.manual = manual
    catEvent.image_url = '<https://steve-jones.dev/web/technical_difficulties.gif>'

    onSubmit(catEvent)
  }

  const closeWidget = () => {
    onCancel()
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
      <tr onKeyDown={ onComponentKeyDown } ref={ componentRef } data-cat-event={JSON.stringify(catEvent) } >
      <td><DateTimePicker name="eventTime" value={ humanTime } onChange={setHumanTime } /></td>
      <td><Select options={getLabels(names, 'name')} textField="name" autoSelectMatches="true" onChange={onNameSelected} defaultValue={ getCatName() } /></td>
      <td><Select options={getLabels(activities, 'name')} textField="name" onChange={onActivitySelected} defaultValue={ getCatActivity() } /></td>
      <td><div style={{width: '250px'}}>
         <Select options={getLabels(locations, 'name')} textField="name" autoSelectMatches="true" onChange={onLocationSelected} defaultValue={ getLocation() } />
      </div></td>
      <td>{catEvent.elapsed}</td>
      <td><input type="text" onChange={onCommentChanged} value={ catEvent.comment } /></td>
      <td><input type="checkbox" onChange={onRakedChanged} checked={ catEvent.raked } /></td>
      <td><input type="button" value="Submit" onClick={ sendCatEvent } /><br /><input type="button" onClick={ closeWidget } value="Cancel"  /></td>
    </tr>
    </React.Fragment>
  )
};

export default AddRow;
