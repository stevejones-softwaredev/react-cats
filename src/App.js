import { React, useEffect, useState, createRef } from "react";
import prettyMilliseconds from 'pretty-ms';
import { MultiSelect } from "react-multi-select-component";
import EditableRow from './EditableRow.js';
import LoginControl from './LoginControl.js';
import Popup from 'reactjs-popup';
import AddRow from './AddRow.js';
import 'reactjs-popup/dist/index.css';
import "./styles.css";
import { formatInTimeZone } from 'date-fns-tz'

export default function App() {
 var initBeginTime = new Date()
 initBeginTime.setHours(initBeginTime.getHours() - 48)

 const [ catEvents, setCatEvents ] = useState([])
 const [ currentEvents, setCurrentEvents ] = useState([])
 const [ nameOptions, setNameOptions ] = useState([])
 const [ locationOptions, setLocationOptions ] = useState([])
 const [ activityOptions, setActivityOptions ] = useState([])
 const [ selectedNames, setSelectedNames ] = useState([])
 const [ selectedLocations, setSelectedLocations ] = useState([])
 const [ selectedActivities, setSelectedActivities ] = useState([])
 const [ selectedSeverities, setSelectedSeverities ] = useState([])
 const [ beginTime, setBeginTime ] = useState(initBeginTime)
 const [ endTime, setEndTime ] = useState(new Date())
 const [ currentTime, setCurrentTime] = useState(new Date());
 const [ syncTime, setSyncTime] = useState(new Date());
 const [ authenticated, setAuthenticated] = useState(false);
 const [ refreshPending, setRefreshPending] = useState(false);
 const [ showAddRow, setShowAddRow] = useState(false);
 const [ authHeader, setAuthHeader] = useState("");
 const [ addRowErrorMessage, setAddRowErrorMessage] = useState("");
 const [ showImagePopup, setShowImagePopup] = useState(false);
 const [ popupImage, setPopupImage] = useState("https://steve-jones.dev/web/technical_difficulties.gif");
 const [ popupName, setPopupName] = useState("");
 const [ popupTime, setPopupTime] = useState("");
 const [ popupActivity, setPopupActivity ] = useState("")
 
 const severityArray = [
   {value: 'ok', label: 'OK'},
   {value: 'warn', label: 'Warn'},
   {value: 'danger', label: 'Danger'}]
 
 function getCurrentElapsedStyleName(event) {
   if (event.status === 'warn') {
     return 'long-interval-data'
   } else if (event.status === 'danger') {
     return 'very-long-interval-data'
   } else {
     return 'notacat-data'
   }
 }
 
 function formatCurrentElapsedTime(elapsed) {
   var sections = elapsed.split(':')
   if (sections.length === 4) {
     var hours = Number(sections[1]) + (24 * sections[0])
     return (hours + ':' + sections[2] + ':' + sections[3])
   } else if (sections.length === 2) {
     return ('00:' + elapsed)
   } else if (sections.length === 1) {
     return ('00:00:' + elapsed)
   }

   return elapsed;
 }
 
 function timeDiffFromCurrent(wyze_ts) {
   var parsedDate = new Date(wyze_ts * 1000)
   var diff = (currentTime - parsedDate)
   
   return prettyMilliseconds(diff, {secondsDecimalDigits: 0, colonNotation: true})
 }
 
 function getDateFromTs(wyze_ts) {
   var wyzeDate = new Date(wyze_ts * 1000)
   return formatInTimeZone(wyzeDate, Intl.DateTimeFormat().resolvedOptions().timeZone, 'eeee MMMM dd, yyyy HH:mm:ss zzz')
 }

 function getTimeInputString(targetDate) {
   var localTime = new Date(targetDate.getTime() - (targetDate.getTimezoneOffset() * 60000))
   return localTime.toISOString().split('.')[0]
 }

 function beginTimeChanged(e) {
   var lowTime = new Date(e.target.value)
   setBeginTime(new Date(lowTime.getTime()))
 }

 function endTimeChanged(e) {
   var highTime = new Date(e.target.value)
   setEndTime(new Date(highTime.getTime()))
 }

 async function getCurrent() {
   var catUrl = process.env.REACT_APP_API_HOST + '/api/cats/current'

   const response = await fetch(catUrl, { credentials : "include" });
   const data = await response.json();

   setCurrentEvents(data.events)      
 }

 async function onSetComment(comment, event) {
   event.comment = comment
   patchRecord(event, false)
 }

 async function onUpdateEvent(catEvent) {
   console.log(catEvent.event_ts)
   console.log(catEvent)
   patchRecord(catEvent, true)
 }

 async function onRefresh() {
   var updateUrl = process.env.REACT_APP_API_HOST + '/api/cats/refresh'

   const headers = { 'Authorization': authHeader };
   setRefreshPending(true)
   document.body.style.cursor = 'wait';
   await fetch(updateUrl,
     {
       method: 'POST',
       headers: headers
     }
   );
   setRefreshPending(false)
   document.body.style.cursor = 'default'
   fetchNames()
   fetchLocations()
   fetchActivities()
   setSyncTime(new Date())
 }

 async function onShowAddRow() {
   setShowAddRow(true)
 }

 async function onAddRowKeyDown(event, newEvent) {
   if (event.key === 'Escape') {
     setShowAddRow(false)
   } else if (event.key === 'Enter') {
     onSubmitRow(newEvent)
   }
 }
 
 async function onCloseAddRow() {
   setShowAddRow(false)
 }

 async function onSubmitRow(newEvent) {
   var updateUrl = process.env.REACT_APP_API_HOST + '/api/cats/add_event'

   var requestBody = JSON.stringify(newEvent)
   var success = true
   const headers = { 'Authorization': authHeader };
   setRefreshPending(true)
   document.body.style.cursor = 'wait';
   await fetch(updateUrl,
     {
       method: 'POST',
       headers: headers,
       body: requestBody
     }
   ).then((response) => {
     success = (response.status === 200)
     return response.text()
   }
   ).then((data) => {
     if (!success) {
       setAddRowErrorMessage(data)
     }
   });

   document.body.style.cursor = 'default'
   setRefreshPending(false)
   if (success) {
     setAddRowErrorMessage("")
     setShowAddRow(false)
     fetchNames()
     fetchLocations()
     fetchActivities()
     setSyncTime(new Date())
     window.location.reload()
   }
}

 async function onSetRaked(raked, event) {
   event.raked = !raked
   patchRecord(event, false)
 }
 
 async function onAuthChanged(authenticated, authHeader) {
   setAuthenticated(authenticated)
   if (authenticated) {
     setAuthHeader(authHeader)
   }
 }
 
 async function patchRecord(event, reload) {
   var updateUrl = process.env.REACT_APP_API_HOST + '/api/cats/update/' + event.event_ts
   var requestBody

   if ('currentTarget' in event) {
     var domParser = new DOMParser()
     var xml = domParser.parseFromString(event.currentTarget.outerHTML, 'text/xml')
     requestBody = xml.documentElement.getAttribute('data-cat-event')
   } else {
     requestBody = JSON.stringify(event)
   }

   const headers = { 'Authorization': authHeader };
   await fetch(updateUrl,
     {
       method: 'PUT',
       body: requestBody,
       headers: headers
     }
   );
   if (reload) {
     window.location.reload()
   }
 }

 const fetchNames = async () => {
       const response = await fetch(
          process.env.REACT_APP_API_HOST + '/api/cats/list', { credentials : "include" });
       const data = await response.json();

        let nameOptions = [];

        data.names.forEach(function(arrayItem){
          var nameOption = {};
          nameOption.label = arrayItem;
          nameOption.value = arrayItem;
          nameOptions.push(nameOption);
        });

        setNameOptions(nameOptions)
 }

 const fetchLocations = async() => {
     const response = await fetch(
        process.env.REACT_APP_API_HOST + '/api/cats/locations', { credentials : "include" });
        const data = await response.json();

        let locationOptions = [];

        data.locations.forEach(function(arrayItem){
          if (arrayItem !== '') {
            var locationOption = {};
            locationOption.label = arrayItem;
            locationOption.value = arrayItem;
            locationOptions.push(locationOption);
          }
        });

        setLocationOptions(locationOptions)
 }

 const fetchActivities = async () => {
     const response = await fetch(
        process.env.REACT_APP_API_HOST + '/api/cats/activity', { credentials : "include" });
        const data = await response.json();

        let activityOptions = [];

        data.names.forEach(function(arrayItem){
          if (arrayItem !== '') {
            var activityOption = {};
            activityOption.label = getActivityIcon(arrayItem);
            activityOption.value = arrayItem;
            activityOptions.push(activityOption);
          }
        });

        setActivityOptions(activityOptions)
 }

 async function getEvents() {
   var catUrl = process.env.REACT_APP_API_HOST + '/api/cats/events?beginTime=' + (beginTime.valueOf()/1000).toFixed(0) + '&endTime=' + (endTime.valueOf()/1000).toFixed(0)

   var namesString = ''
   var locationsString = ''
   var activitiesString = ''
   var severitiesString = ''
   selectedNames.forEach(function(arrayItem){
     if (namesString.length !== 0) {
       namesString += ','
     }
     namesString += arrayItem.value
   });

   if (namesString.length !== 0) {
     catUrl += '&names=' + namesString
   }
 
   selectedLocations.forEach(function(arrayItem){
     if (locationsString.length !== 0) {
       locationsString += ','
     }
     locationsString += arrayItem.value
   });

   if (locationsString.length !== 0) {
     catUrl += '&locations=' + locationsString
   }
 
   selectedActivities.forEach(function(arrayItem){
     if (activitiesString.length !== 0) {
       activitiesString += ','
     }
     activitiesString += arrayItem.value
   });

   if (activitiesString.length !== 0) {
     catUrl += '&activity=' + activitiesString
   }

   selectedSeverities.forEach(function(arrayItem){
     if (severitiesString.length !== 0) {
       severitiesString += ','
     }
     severitiesString += arrayItem.value
   });

   if (severitiesString.length !== 0) {
     catUrl += '&severity=' + severitiesString
   }

   const response = await fetch(catUrl, { credentials : "include" });
   const data = await response.json();

   setCatEvents(data.events)      
 }

 function getTimeColumnValue(catEvent) {
   var wyzeDate = new Date(catEvent.wyze_ts * 1000)
   var timeString = formatInTimeZone(wyzeDate, Intl.DateTimeFormat().resolvedOptions().timeZone, 'eeee MMMM dd, yyyy HH:mm:ss zzz')

   if (catEvent.manual) {
     return ("*** " + timeString)
   } else {
     return timeString
   }
 }

 function getActivityIcon(activity) {
   if (activity === 'Poop') {
     return '💩'
   } else if (activity === 'Pee') {
     return '💦'
   } else {
     return ''
   }
 }

 async function onShowImage(catEvent) {
   setShowImagePopup(true)
   setPopupImage(catEvent.new_url)
   setPopupName(catEvent.cat_name)
   setPopupTime(getTimeColumnValue(catEvent))
   setPopupActivity(getActivityIcon(catEvent.cat_activity))
 }
 
 async function onHideImage(e) {
   setShowImagePopup(false)
 }
 
 useEffect(() => {
   getEvents();
   getCurrent();
}, [endTime, beginTime, nameOptions, selectedNames, selectedLocations, selectedActivities, selectedSeverities, authenticated, showAddRow]);
 
 useEffect(() => {
   // Call the function
   fetchNames()
   fetchLocations()
   fetchActivities()
   setSyncTime(new Date())
}, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const refreshInterval = setInterval(() => {

   // Call the function
     fetchNames()
     fetchLocations()
     fetchActivities()
     setSyncTime(new Date())
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, []);

 return (
   <div className="App">
     <h1>Cat Stuff</h1>
     <Popup open={showImagePopup} onClose={ onHideImage } className="image" >
       <img height="100%" width="100%" src={popupImage} />
       <p style= {{textAlign:'center' }}> { popupTime } - { popupName } {popupActivity } </p>
     </Popup>
     <LoginControl initialState={authenticated} handleAuthChange={onAuthChanged} />
     <table width="360">
     <tbody>
         {
         currentEvents.map( (currentEvent,key) =>
         <tr key={key}>
             <td className={getCurrentElapsedStyleName(currentEvent) }>{currentEvent.cat_name} last recorded {currentEvent.cat_activity} at {getDateFromTs(currentEvent.wyze_ts)} ({formatCurrentElapsedTime(timeDiffFromCurrent(currentEvent.wyze_ts))} ago) </td>
         </tr>
         )
       }
    </tbody>
    </table>
    <input type="button" value="Refresh" onClick={ onRefresh } disabled={ !authenticated || refreshPending } hidden={ !authenticated}  />
     <table width="360">
     <tbody>
     <tr>
       Names: <MultiSelect options={nameOptions} onChange={setSelectedNames } value={selectedNames} />
     </tr>
     <tr>
       Locations: <MultiSelect options={locationOptions} onChange={setSelectedLocations } value={selectedLocations} />
     </tr>
     <tr>
       Activity: <MultiSelect options={activityOptions} onChange={setSelectedActivities } value={selectedActivities} />
     </tr>
     <tr>
       Severity: <MultiSelect options={severityArray} onChange={setSelectedSeverities } value={selectedSeverities} />
     </tr>
     <tr>
      From: <input type="datetime-local" defaultValue={ getTimeInputString(beginTime) } onChange={beginTimeChanged } />
    </tr>
     <tr>
      To: <input type="datetime-local" defaultValue={ getTimeInputString(endTime) } onChange={endTimeChanged } />
    </tr>
    </tbody>
    </table>
    <br />
     <input type="button" value="Add Row" onClick={ onShowAddRow } disabled={ !authenticated || refreshPending } hidden={ !authenticated}  />
     <table>
       <thead>
         <tr>
           <th>Time</th>
           <th>Cat</th>
           <th>Activity</th>
           <th>Location</th>
           <th>Elapsed</th>
           <th className="notes-th">Notes</th>
           <th>🗑️</th>
         </tr>   
       </thead>   
       <tbody>
         {
           showAddRow &&
             <AddRow
               names={nameOptions}
               locations={locationOptions}
               activities={[{name: "💦"}, {name: "💩"}]}
               onSubmit={ onSubmitRow }
               onCancel={ onCloseAddRow }
               catEvent={ {} }
               onAddRowKeyDown={ onAddRowKeyDown }
               errorMessage={addRowErrorMessage} />
         }
         {
         catEvents.map( (catEvent,key) =>
         <EditableRow
           key={key}
           catEvent={ catEvent }
           names={ nameOptions }
           locations={ locationOptions }
           activities={ activityOptions }
           onSubmit={ onUpdateEvent }
           onAddRowKeyDown={ onUpdateEvent }
           onSetCommentHandler= { onSetComment }
           onSetRakedHandler={ onSetRaked }
           onShowImage={ onShowImage }
           authenticated={ authenticated } />
         )
       }
       </tbody>	
     </table>
     <i>Last synced {syncTime.toLocaleString()}</i>
   </div>
 );
}

