import { React, useEffect, useState, createRef } from "react";
import prettyMilliseconds from 'pretty-ms';
import DateTimePicker from 'react-datetime-picker';
import Multiselect from 'multiselect-react-dropdown';
import EditableText from './EditableText.js';
import BoundCheckbox from './BoundCheckbox.js';
import LoginControl from './LoginControl.js';
import "./styles.css";
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

export default function App() {
 var initBeginTime = new Date()
 initBeginTime.setHours(initBeginTime.getHours() - 48)
 
 const { parse } = require('date-fns');
 const [ catEvents, setCatEvents ] = useState([])
 const [ currentEvents, setCurrentEvents ] = useState([])
 const [ nameOptions, setNameOptions ] = useState([])
 const [ locationOptions, setLocationOptions ] = useState([])
 const [ activityOptions, setActivityOptions ] = useState([])
 const [ beginTime, setBeginTime ] = useState(initBeginTime)
 const [ endTime, setEndTime ] = useState(new Date())
 const [ currentTime, setCurrentTime] = useState(new Date());
 const [ syncTime, setSyncTime] = useState(new Date());
 const [ authenticated, setAuthenticated] = useState(false);
 const [ authHeader, setAuthHeader] = useState("");
 
 const severityArray = [
   {key: 'ok', display: 'OK'},
   {key: 'warn', display: 'Warn'},
   {key: 'danger', display: 'Danger'}]
 
 const namesRef = createRef()
 const locationsRef = createRef()
 const activitiesRef = createRef()
 const severitiesRef = createRef()
 
 function getActivityIcon(activity) {
   if (activity === 'Poop') {
     return '💩'
   } else if (activity === 'Pee') {
     return '💦'
   } else {
     return ''
   }
 }

 function getClassName(name) {
   if (name === 'Savi') {
     return 'savi-data'
   } else if (name === 'Sydney') {
     return 'sydney-data'
   } else {
     return 'notacat-data'
   }
 }
 
 function getDayStyleName(event) {
   var trunc = event.human_time.lastIndexOf(' ')
   var tz = event.human_time.substr(trunc + 1)
   var utcOffset
   if (tz ==='EDT') {
     utcOffset = 14400000
   } else if (tz === 'EST') {
     utcOffset = 18000000
   }
   var parsedDate = parse(event.human_time.substr(0, trunc), 'EEEE, d-MMM-yy HH:mm:ss', new Date())
   var dayCount = Math.floor((parsedDate.valueOf() - utcOffset) / (60 * 60 * 24 * 1000))
   if (dayCount % 2 === 0) {
     return 'even-data'
   } else {
     return 'odd-data'
   }
 }
 
 function getElapsedStyleName(event) {
   if (event.status === 'warn') {
     return 'long-interval-data'
   } else if (event.status === 'danger') {
     return 'very-long-interval-data'
   }
   else  {
     return getDayStyleName(event)
   }
 }
 
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
 
 function normalizeElapsedTime(elapsed) {
   var spaceIndex = elapsed.search(' ')
   
   if (-1 === spaceIndex) {
     return elapsed
   }

   var dayCount = parseInt(elapsed.substring(0, spaceIndex))
   dayCount *= 24
   var parse = elapsed.substring(spaceIndex+1)
   spaceIndex = parse.search(' ')
   parse = parse.substring(spaceIndex+1)
   var hourIndex = parse.search(':')
   dayCount += parseInt(parse.substring(0, hourIndex))
   
   var newElapsed = dayCount.toString()
   newElapsed += parse.substring(hourIndex)
   
   var dotIndex = newElapsed.search('\\.')
   if (dotIndex !== -1) {
     newElapsed = newElapsed.substring(0, dotIndex)
   }
   
   return newElapsed
 }
 
 function timeDiffFromCurrent(human_time) {
   var trunc = human_time.lastIndexOf(' ')
   var parsedDate = parse(human_time.substr(0, trunc), 'EEEE, d-MMM-yy HH:mm:ss', new Date())
   var diff = (currentTime - parsedDate)
   
   return prettyMilliseconds(diff, {secondsDecimalDigits: 0, colonNotation: true})
 }
 
 async function getCurrent() {
   var catUrl = process.env.REACT_APP_API_HOST + '/api/cats/current'

   const response = await fetch(catUrl, { credentials : "include" });
   const data = await response.json();

   setCurrentEvents(data.events)      
 }

 async function onSetComment(comment, event) {
   event.comment = comment
   patchRecord(event)   
 }
 
 async function onSetRaked(raked, event) {
   event.raked = !raked
   patchRecord(event)   
 }
 
 async function onAuthChanged(authenticated, authHeader) {
   setAuthenticated(authenticated)
   if (authenticated) {
     setAuthHeader(authHeader)
   }
 }
 
 async function patchRecord(event) {
   var updateUrl = process.env.REACT_APP_API_HOST + '/api/cats/update/' + event.event_ts
   
   var requestBody = JSON.stringify(event)
   console.log(requestBody)
   const headers = { 'Authorization': authHeader };
   await fetch(updateUrl,
     {
       method: 'PUT',
       body: requestBody,
       headers: headers
     }
   );
 }

 async function getEvents() {
   var catUrl = process.env.REACT_APP_API_HOST + '/api/cats/events?beginTime=' + (beginTime.valueOf()/1000).toFixed(0) + '&endTime=' + (endTime.valueOf()/1000).toFixed(0)

   var namesString = ''
   var locationsString = ''
   var activitiesString = ''
   var severitiesString = ''
   namesRef.current.getSelectedItems().forEach(function(arrayItem){
     if (namesString.length !== 0) {
       namesString += ','
     }
     namesString += arrayItem.name
   });

   if (namesString.length !== 0) {
     catUrl += '&names=' + namesString
   }
 
   locationsRef.current.getSelectedItems().forEach(function(arrayItem){
     if (locationsString.length !== 0) {
       locationsString += ','
     }
     locationsString += arrayItem.name
   });

   if (locationsString.length !== 0) {
     catUrl += '&locations=' + locationsString
   }
 
   activitiesRef.current.getSelectedItems().forEach(function(arrayItem){
     if (activitiesString.length !== 0) {
       activitiesString += ','
     }
     activitiesString += arrayItem.name
   });

   if (activitiesString.length !== 0) {
     catUrl += '&activity=' + activitiesString
   }

   severitiesRef.current.getSelectedItems().forEach(function(arrayItem){
     if (severitiesString.length !== 0) {
       severitiesString += ','
     }
     severitiesString += arrayItem.key
   });

   if (severitiesString.length !== 0) {
     catUrl += '&severity=' + severitiesString
   }

   const response = await fetch(catUrl, { credentials : "include" });
   const data = await response.json();

   setCatEvents(data.events)      
 }
 
 useEffect(() => {
   getEvents();
   getCurrent();
}, [endTime, beginTime, nameOptions, namesRef.current, locationsRef.current, activitiesRef.current, severitiesRef.current, authenticated]);
 
 useEffect(() => {
   const fetchNames = async () => {
         const response = await fetch(
            process.env.REACT_APP_API_HOST + '/api/cats/list', { credentials : "include" });
         const data = await response.json();
          
          let nameOptions = [];
          
          data.names.forEach(function(arrayItem){
            var nameOption = {};
            nameOption.name = arrayItem;
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
              locationOption.name = arrayItem;
              locationOptions.push(locationOption);
            }
          });

          const headers = await response.headers

          console.log("Location API call response headers: " + response.headers.get('Authorization'));
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
              activityOption.name = arrayItem;
              activityOptions.push(activityOption);
            }
          });

          setActivityOptions(activityOptions)      
   }
 
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
   const fetchNames = async () => {
 
       const response = await fetch(
          process.env.REACT_APP_API_HOST + '/api/cats/list', { credentials : "include" });
          const data = await response.json();
          
          let nameOptions = [];
          
          data.names.forEach(function(arrayItem){
            if ((arrayItem !== '') && (arrayItem !== 'NotACat')) {
              var nameOption = {};
              nameOption.name = arrayItem;
              nameOptions.push(nameOption);
            }
          });

          setNameOptions(nameOptions)      
   }
 
   const fetchLocations = async() => {
       const response = await fetch(
          process.env.REACT_APP_API_HOST + '/api/cats/locations', { credentials : "include" });
          const data = await response.json();

          let locationOptions = [];

          data.locations.forEach(function(arrayItem){
            if ((arrayItem !== '') && (arrayItem !== 'Neither')) {
              var locationOption = {};
              locationOption.name = arrayItem;
              locationOptions.push(locationOption);
            }
          });

          const headers = await response.headers

          console.log("Location API call response headers: " + response.headers.get('Authorization'));

          console.log("Setting options");
          setLocationOptions(locationOptions)
   }
 
   const fetchActivities = async () => {
       const response = await fetch(
          process.env.REACT_APP_API_HOST + '/api/cats/activity', { credentials : "include" });
          const data = await response.json();
          
          let activityOptions = [];
          
          data.names.forEach(function(arrayItem){
            if ((arrayItem !== '') && (arrayItem !== 'Neither')) {
              var activityOption = {};
              activityOption.name = arrayItem;
              activityOptions.push(activityOption);
            }
          });

          setActivityOptions(activityOptions)      
   }
 
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
     <LoginControl initialState={authenticated} handleAuthChange={onAuthChanged} />
     <table width="360">
     <tbody>
         {
         currentEvents.map( (currentEvent,key) =>
         <tr key={key}>
             <td className={getCurrentElapsedStyleName(currentEvent) }>{currentEvent.cat_name} last recorded {currentEvent.cat_activity} at {currentEvent.human_time} ({formatCurrentElapsedTime(timeDiffFromCurrent(currentEvent.human_time))} ago) </td>
         </tr>
         )
       }
    </tbody>
    </table>
     <table width="360">
     <tbody>
     <tr>
       Names: <Multiselect id="names" name="targetNames" options={nameOptions} ref={namesRef} onSelect={getEvents } onRemove={getEvents } displayValue="name" selectedValues={nameOptions} />
     </tr>
     <tr>
       Locations: <Multiselect id="locations" name="targetLocations" options={locationOptions} ref={locationsRef} onSelect={getEvents } onRemove={getEvents } displayValue="name" selectedValues={locationOptions} />
     </tr>
     <tr>
       Activity: <Multiselect id="activities" name="targetActivies" options={activityOptions} ref={activitiesRef} onSelect={getEvents } onRemove={getEvents } displayValue="name" selectedValues={activityOptions} />
     </tr>
     <tr>
       Severity: <Multiselect id="severity" name="targetSeverity" options={severityArray} displayValue="display" ref={severitiesRef} onSelect={getEvents } onRemove={getEvents }  selectedValues={severityArray} />
     </tr>
     <tr>
      From: <DateTimePicker name="beginTime" value={beginTime } onChange={setBeginTime } />
    </tr>
     <tr>
      To: <DateTimePicker name="endTime" value={endTime } onChange={setEndTime } />
    </tr>
    </tbody>
    </table>
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
         catEvents.map( (catEvent,key) =>
         <tr key={key} className={getDayStyleName(catEvent)}>
             <td>{catEvent.human_time }</td>
             <td className={getClassName(catEvent.cat_name) }>{catEvent.cat_name }</td>
             <td><a target="top" href={catEvent.image_url }> {getActivityIcon(catEvent.cat_activity)} </a></td>
             <td>{catEvent.location }</td>
             <td className={getElapsedStyleName(catEvent) }>{normalizeElapsedTime(catEvent.elapsed) }</td>
             <td><EditableText backGroundColor="orange" textColor="white" initialText={catEvent.comment} context={catEvent } onEditComplete={onSetComment } readOnly={!authenticated } /></td>
             <td><BoundCheckbox backGroundColor="orange" textColor="white" initialState={catEvent.raked} context={catEvent } onChangeComplete={onSetRaked } readOnly={!authenticated } /></td>
         </tr>
         )
       }
       </tbody>	
     </table>
     <i>Last synced {syncTime.toLocaleString()}</i>
   </div>
 );
}

