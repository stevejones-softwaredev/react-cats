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

 async function getEvents() {
       var catUrl = 'http://localhost:8080/api/cats/events?beginTime=' + (beginTime.valueOf()/1000).toFixed(0) + '&endTime=' + (endTime.valueOf()/1000).toFixed(0)
       
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
 
       const response = await fetch(
         'http://localhost:8080/api/cats/list');
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
         'http://localhost:8080/api/cats/activity');
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
             <td className={getClassName(catEvent.cat_name) }>{catEvent.elapsed }</td>
         </tr>
         )
       }
       </tbody>	
     </table>
   </div>
 );
}

