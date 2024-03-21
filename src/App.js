import { React, useEffect, useState, createRef } from "react";
import DateTimePicker from 'react-datetime-picker';
import Multiselect from 'multiselect-react-dropdown';
import "./styles.css";
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

export default function App() {
 var initBeginTime = new Date()
 initBeginTime.setHours(initBeginTime.getHours() - 48)
 
 const [ catEvents, setCatEvents ] = useState([])
 const [ nameOptions, setNameOptions ] = useState([])
 const [ activityOptions, setActivityOptions ] = useState([])
 const [ beginTime, setBeginTime ] = useState(initBeginTime)
 const [ endTime, setEndTime ] = useState(new Date())
 
 const namesRef = createRef();
 const activitiesRef = createRef();
 
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
   var hourTime = normalizeElapsedTime(event.elapsed)
   var hours = parseInt(hourTime.substring(0, hourTime.search(':')))
   console.log("Elapsed: " + event.elapsed + " has hour count " + hours)

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
     return 'savi-data'
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
     return 'sydney-data'
   } else
     return 'notacat-data'
 }
 
 function normalizeElapsedTime(elapsed) {
   var spaceIndex = elapsed.search(' ')
   
   if (-1 == spaceIndex) {
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
   
   return newElapsed
 }

 async function getEvents() {
   var catUrl = process.env.REACT_APP_API_HOST + '/api/cats/events?beginTime=' + (beginTime.valueOf()/1000).toFixed(0) + '&endTime=' + (endTime.valueOf()/1000).toFixed(0)

   var namesString = ""
   var activitiesString = ""
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

   const response = await fetch(catUrl);
   const data = await response.json();

   setCatEvents(data.events)      
 }
 
 useEffect(() => {
   getEvents();
}, [endTime, beginTime, nameOptions, namesRef.current, activitiesRef.current]);
 
 useEffect(() => {
   const fetchNames = async () => {
 
       console.log(process.env.REACT_APP_API_HOST)
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
}, []);

 return (
   <div className="App">
     <h1>Cat Stuff</h1>
     <table width="360">
     <tr>
       Names: <Multiselect name="targetNames" options={nameOptions} ref={namesRef} onSelect={getEvents } onRemove={getEvents } displayValue="name" selectedValues={nameOptions} />
     </tr>
     <tr>
       Activity: <Multiselect name="targetActivies" options={activityOptions} ref={activitiesRef} onSelect={getEvents } onRemove={getEvents } displayValue="name" selectedValues={activityOptions} />
     </tr>
     <tr>
      From: <DateTimePicker name="beginTime" value={beginTime } onChange={setBeginTime } />
    </tr>
     <tr>
      To: <DateTimePicker name="endTime" value={endTime } onChange={setEndTime } />
    </tr>
    </table>
     <table>
       <thead>
         <tr>
           <th>Time</th>
           <th>Cat</th>
           <th>Activity</th>
           <th>Location</th>
           <th>Elapsed</th>
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
         </tr>
         )
       }
       </tbody>	
     </table>
   </div>
 );
}

