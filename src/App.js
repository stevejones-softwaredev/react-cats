import { React, useEffect, useState, createRef } from "react";
import prettyMilliseconds from 'pretty-ms';
import DateTimePicker from 'react-datetime-picker';
import Multiselect from 'multiselect-react-dropdown';
import EditableText from './EditableText.js';
import "./styles.css";
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

export default function App() {
 var initBeginTime = new Date()
 initBeginTime.setHours(initBeginTime.getHours() - 48)
 
 const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay))
 const { parse } = require("date-fns");
 const [ catEvents, setCatEvents ] = useState([])
 const [ currentEvents, setCurrentEvents ] = useState([])
 const [ nameOptions, setNameOptions ] = useState([])
 const [ activityOptions, setActivityOptions ] = useState([])
 const [ beginTime, setBeginTime ] = useState(initBeginTime)
 const [ endTime, setEndTime ] = useState(new Date())
 const [ currentTime, setCurrentTime] = useState(new Date());
 const [ syncTime, setSyncTime] = useState(new Date());
 
 const severityArray = [
   {key: "ok", display: "OK"},
   {key: "warn", display: "Warn"},
   {key: "danger", display: "Danger"}]
 
 const namesRef = createRef();
 const activitiesRef = createRef();
 const severitiesRef = createRef();
 
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
 
 function getElapsedStyleName(event) {
   if (event.status == 'warn') {
     return 'long-interval-data'
   } else if (event.status == 'danger') {
     return 'very-long-interval-data'
   }
   else if (event.cat_name === 'Savi') {
     return 'savi-data'
   } else if (event.cat_name === 'Sydney') {
       return 'sydney-data'
   } else {
     return 'notacat-data'
   }
 }
 
 function getCurrentElapsedStyleName(event) {
   var hourTime = normalizeElapsedTime(event.elapsed)
   var hours = parseInt(hourTime.substring(0, hourTime.search(':')))

   if (event.cat_name === 'Savi') {
     if (event.cat_activity === 'Pee') {
       if (hours > 24) {
         return 'very-long-interval-data'
       } else if (hours > 16) {
         return 'long-interval-data'
       }
     } else if (event.cat_activity === 'Poop') {
       if (hours > 48) {
         return 'very-long-interval-data'
       } else if (hours > 36) {
         return 'long-interval-data'
       }
     }
   } else if (event.cat_name === 'Sydney') {
     if (event.cat_activity === 'Pee') {
       if (hours > 24) {
         return 'very-long-interval-data'
       } else if (hours > 16) {
         return 'long-interval-data'
       }
     } else if (event.cat_activity === 'Poop') {
       if (hours > 36) {
         return 'very-long-interval-data'
       } else if (hours > 24) {
         return 'long-interval-data'
       }
     }
   }
   
   return 'notacat-data'
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
 
 function stripDecimal(inVal) {
   var outVal = inVal
   var dotIndex = outVal.search('\\.')
   if (dotIndex !== -1) {
     outVal = outVal.substring(0, dotIndex)
   }
   
   return outVal
 }
 
 function timeDiffFromCurrent(human_time) {
   var trunc = human_time.lastIndexOf(' ')
   var parsedDate = parse(human_time.substr(0, trunc), 'EEEE, d-MMM-yy HH:mm:ss', new Date())
   var diff = (Date.now() - parsedDate)
   
   return prettyMilliseconds(diff, {secondsDecimalDigits: 0})
 }
 
 async function getCurrent() {
   var catUrl = process.env.REACT_APP_API_HOST + '/api/cats/current'

   const response = await fetch(catUrl);
   const data = await response.json();

   setCurrentEvents(data.events)      
 }

 async function onSetComment(comment, event) {
   var updateUrl = process.env.REACT_APP_API_HOST + '/api/cats/update/' + event.event_ts
   
   event.Comment = comment
   console.log(event)
   
   var requestBody = JSON.stringify(event)
   console.log(requestBody)
   const response = await fetch(updateUrl,
     {
       method: 'PUT',
       body: requestBody
     }
   );

//   await sleepNow(1000)
//   getEvents();
 }

 async function getEvents() {
   var catUrl = process.env.REACT_APP_API_HOST + '/api/cats/events?beginTime=' + (beginTime.valueOf()/1000).toFixed(0) + '&endTime=' + (endTime.valueOf()/1000).toFixed(0)

   var namesString = ""
   var activitiesString = ""
   var severitiesString = ""
   namesRef.current.getSelectedItems().forEach(function(arrayItem){
     if (namesString.length !== 0) {
       namesString += ","
     }
     namesString += arrayItem.name
   });

   if (namesString.length !== 0) {
     catUrl += "&names=" + namesString
   }
 
   activitiesRef.current.getSelectedItems().forEach(function(arrayItem){
     if (activitiesString.length !== 0) {
       activitiesString += ","
     }
     activitiesString += arrayItem.name
   });

   if (activitiesString.length !== 0) {
     catUrl += "&activity=" + activitiesString
   }

   severitiesRef.current.getSelectedItems().forEach(function(arrayItem){
     if (severitiesString.length !== 0) {
       severitiesString += ","
     }
     severitiesString += arrayItem.key
   });

   if (severitiesString.length !== 0) {
     catUrl += "&severity=" + severitiesString
   }

   const response = await fetch(catUrl);
   const data = await response.json();

   setCatEvents(data.events)      
 }
 
 useEffect(() => {
   getEvents();
   getCurrent();
}, [endTime, beginTime, nameOptions, namesRef.current, activitiesRef.current, severitiesRef.current]);
 
 useEffect(() => {
   const fetchNames = async () => {
         const response = await fetch(
            process.env.REACT_APP_API_HOST + '/api/cats/list');
         const data = await response.json();
          
          let nameOptions = [];
          
          data.names.forEach(function(arrayItem){
            var nameOption = {};
            nameOption.name = arrayItem;
            nameOptions.push(nameOption);
          });

          setNameOptions(nameOptions)      
   }
 
   const fetchActivities = async () => {
 
       const response = await fetch(
          process.env.REACT_APP_API_HOST + '/api/cats/activity');
          const data = await response.json();
          
          let activityOptions = [];
          
          data.names.forEach(function(arrayItem){
            if (arrayItem !== "") {
              var activityOption = {};
              activityOption.name = arrayItem;
              activityOptions.push(activityOption);
            }
          });

          setActivityOptions(activityOptions)      
   }
 
   // Call the function
   fetchNames();
   fetchActivities();
   setSyncTime(new Date())
}, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
   const fetchNames = async () => {
 
       const response = await fetch(
          process.env.REACT_APP_API_HOST + '/api/cats/list');
          const data = await response.json();
          
          let nameOptions = [];
          
          data.names.forEach(function(arrayItem){
            if ((arrayItem !== "") && (arrayItem != 'NotACat')) {
              var nameOption = {};
              nameOption.name = arrayItem;
              nameOptions.push(nameOption);
            }
          });

          setNameOptions(nameOptions)      
   }
 
   const fetchActivities = async () => {
 
       const response = await fetch(
          process.env.REACT_APP_API_HOST + '/api/cats/activity');
          const data = await response.json();
          
          let activityOptions = [];
          
          data.names.forEach(function(arrayItem){
            if ((arrayItem !== "") && (arrayItem != 'Neither')) {
              var activityOption = {};
              activityOption.name = arrayItem;
              activityOptions.push(activityOption);
            }
          });

          setActivityOptions(activityOptions)      
   }
 
   // Call the function
     fetchNames();
     fetchActivities();
     setSyncTime(new Date())
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, []);

 return (
   <div className="App">
     <h1>Cat Stuff</h1>
     <table width="360">
     <tbody>
         {
         currentEvents.map( (currentEvent,key) =>
         <tr key={key}>
             <td className={getCurrentElapsedStyleName(currentEvent) }>{currentEvent.cat_name} last recorded {currentEvent.cat_activity} at {currentEvent.human_time} ({timeDiffFromCurrent(currentEvent.human_time)} ago) </td>
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
         </tr>   
       </thead>   
       <tbody>
         {
         catEvents.map( (catEvent,key) =>
         <tr key={key}>
             <td className={getClassName(catEvent.cat_name) }>{catEvent.human_time }</td>
             <td className={getClassName(catEvent.cat_name) }>{catEvent.cat_name }</td>
             <td className={getClassName(catEvent.cat_name) }><a target="top" href={catEvent.image_url }>{getActivityIcon(catEvent.cat_activity)}</a></td>
             <td className={getClassName(catEvent.cat_name) }>{catEvent.location }</td>
             <td className={getElapsedStyleName(catEvent) }>{normalizeElapsedTime(catEvent.elapsed) }</td>
             <td className={getClassName(catEvent.cat_name)}><EditableText backGroundColor="orange" textColor="white" initialText={catEvent.comment} context={catEvent } onEditComplete={onSetComment } /></td>
         </tr>
         )
       }
       </tbody>	
     </table>
     <i>Last synced {syncTime.toLocaleString()}</i>
   </div>
 );
}

