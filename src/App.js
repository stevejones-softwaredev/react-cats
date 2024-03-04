import { React, useEffect, useState, createRef } from "react";
import DateTimePicker from 'react-datetime-picker';
import Multiselect from 'multiselect-react-dropdown';
import "./styles.css";
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';

export default function App() {
 var initBeginTime = new Date()
 initBeginTime.setHours(initBeginTime.getHours() - 12)
 
 const [ catEvents, setCatEvents ] = useState([])
 const [ nameOptions, setNameOptions ] = useState([])
 const [ beginTime, setBeginTime ] = useState(initBeginTime)
 const [ endTime, setEndTime ] = useState(new Date())
 
 const namesRef = createRef();
 
 async function getEvents() {
       var weatherUrl = 'http://localhost:8080/api/cats/events?beginTime=' + (beginTime.valueOf()/1000).toFixed(0) + '&endTime=' + (endTime.valueOf()/1000).toFixed(0)
       
       var namesString = ""
       console.log(namesRef.current.getSelectedItems())
       namesRef.current.getSelectedItems().forEach(function(arrayItem){
         if (namesString.length !== 0) {
           namesString += ","
         }
         namesString += arrayItem.name
       });

//       if (namesString.length !== 0) {
//         weatherUrl += "&locations=" + namesString
//       }
 
       const response = await fetch(weatherUrl);
       const data = await response.json();

       setCatEvents(data.events)      
 }
 
 useEffect(() => {
   getEvents();
}, [endTime, beginTime, nameOptions, namesRef.current]);
 
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
 
   // Call the function
   fetchNames();
}, []);

 return (
   <div className="App">
     <h1>Cat Stuff</h1>
     <table width="360">
     <tr>
       Names: <Multiselect name="targetNames" options={nameOptions} ref={namesRef} onSelect={getEvents } onRemove={getEvents } displayValue="name" selectedValues={nameOptions} />
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
             <td className={catEvent.cat_name === 'Savi' ? 'savi-data' : 'sydney-data' }>{catEvent.human_time }</td>
             <td className={catEvent.cat_name === 'Savi' ? 'savi-data' : 'sydney-data' }>{catEvent.cat_name }</td>
             <td className={catEvent.cat_name === 'Savi' ? 'savi-data' : 'sydney-data' }>{catEvent.cat_activity }</td>
             <td className={catEvent.cat_name === 'Savi' ? 'savi-data' : 'sydney-data' }>{catEvent.location }</td>
             <td className={catEvent.cat_name === 'Savi' ? 'savi-data' : 'sydney-data' }>{catEvent.elapsed }</td>
         </tr>
         )
       }
       </tbody>	
     </table>
   </div>
 );
}

