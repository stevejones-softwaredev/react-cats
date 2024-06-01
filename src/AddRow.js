//AddRow.js
import React, { useState, useEffect, useRef } from 'react';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select'
import "./add-row.css";

const AddRow = ({ names, locations, activities, onSubmit, onCancel, onAddRowKeyDown, errorMessage, catEvent }) => {
  var initialTime, initialDate

  if (catEvent && catEvent.event_ts) {
    initialTime = String(catEvent.event_ts)
  } else {
    initialTime = String(new Date().valueOf())
  }

  console.log(catEvent)
  if (catEvent && catEvent.wyze_ts) {
    console.log("Wyze ts: " + (catEvent.wyze_ts * 1000))
    initialDate = new Date(catEvent.wyze_ts * 1000)
  } else {
    initialDate = new Date()
  }

  console.log('Initial Date: ' + initialDate.toLocaleString())

  const [ eventTime, setEventTime] = useState(initialTime);
  const [ wyzeTs, setWyzeTs] = useState(initialDate);
  const [ catName, setCatName] = useState(catEvent.cat_name);
  const [ activity, setActivity] = useState(catEvent.cat_activity);
  const [ eventLocation, setEventLocation] = useState(catEvent.location);
  const [ comment, setComment] = useState(catEvent.comment);
  const [ raked, setRaked] = useState(catEvent.raked);
  const [ manual] = useState(catEvent.manual);
  
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

  function getCatOptions(options) {
    var catList = getLabels(options, 'name')
    catList.push({ label: 'NotACat', value: 'NotACat' })
    return catList
  }

  function getActivityOptions(options) {
    var activityList = getLabels(options, 'name')
    activityList.push({ label: 'Neither', value: 'Neither' })
    return activityList
  }

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

 function getTimeInputString(targetDate) {
   var localTime = new Date(targetDate.getTime() - (targetDate.getTimezoneOffset() * 60000))
   console.log(localTime.toISOString().split('.')[0])
   return localTime.toISOString().split('.')[0]
 }

 function eventTimeChanged(e) {
   var eventTime = new Date(e.target.value)
   setWyzeTs(new Date(eventTime.getTime()))
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
    } else if (event.label === "💩") {
      setActivity("Poop")
    } else {
      setActivity(event.label)
    }
  }
  
  const onComponentKeyDown = (event) => {
    var catEvent = {}
    catEvent.event_ts = eventTime
    catEvent.wyze_ts = Math.floor(wyzeTs.getTime() / 1000)
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
    catEvent.wyze_ts = Math.floor(wyzeTs.getTime() / 1000)
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
      <td><input type="datetime-local" defaultValue={ getTimeInputString(initialDate) } onChange={eventTimeChanged } /></td>
      <td><Select options={getCatOptions(names)} textField="name" autoSelectMatches="true" onChange={onNameSelected} defaultValue={ getCatName() } /></td>
      <td><Select options={getActivityOptions(activities)} textField="name" onChange={onActivitySelected} defaultValue={ getCatActivity() } /></td>
      <td><div style={{width: '250px'}}>
         <CreatableSelect options={getLabels(locations, 'name')} textField="name" autoSelectMatches="true" onChange={onLocationSelected} defaultValue={ getLocation() } />
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
