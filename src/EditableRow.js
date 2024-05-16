//EditableRow.js
import React, { useState } from "react";

import AddRow from './AddRow.js';
import BoundCheckbox from './BoundCheckbox.js';
import EditableText from './EditableText.js';

const EditableRow = ({ names,
                       locations,
                       activities,
                       authenticated,
                       errorMessage,
                       catEvent,
                       key,
                       onSubmit,
                       onAddRowKeyDown,
                       onClickOutside,
                       onSetCommentHandler,
                       onSetRakedHandler }) => {
 const { parse } = require('date-fns');

 const [ isEditing, setIsEditing] = useState(false);

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
   if (event.status === 'warn') {
     return 'long-interval-data'
   } else if (event.status === 'danger') {
     return 'very-long-interval-data'
   }
   else  {
     return getDayStyleName(event)
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

 function getTimeColumnValue(catEvent) {
   if (catEvent.manual) {
     return ("*** " + catEvent.human_time)
   } else {
     return (catEvent.human_time)
   }
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

 async function onRowClicked(event) {
   if (!authenticated) {
     return
   }
   setIsEditing(true)
 }

 async function onDismissEdit() {
   setIsEditing(false)
 }

 const onKeyDown = (event) => {
   if (event.key === 'Escape') {
     onDismissEdit(false)
   } else if (event.key === 'Enter') {
     onAddRowKeyDown(event, catEvent)
   }
 }

 return (
       <React.Fragment >
         { isEditing && (
         <AddRow
               names={names}
               locations={locations}
               activities={[{name: "💦"}, {name: "💩"}]}
               onSubmit={ onSubmit }
               onClickOutside={ onDismissEdit }
               onCancel={ onDismissEdit }
               onAddRowKeyDown={ onKeyDown }
               catEvent={ catEvent }
               errorMessage="" />)
         }
         { !isEditing && (
         <tr key={key} className={getDayStyleName(catEvent)} onDoubleClick={ onRowClicked } data-cat-event={JSON.stringify(catEvent) } >
             <td>{ getTimeColumnValue(catEvent) }</td>
             <td className={getClassName(catEvent.cat_name) }>{catEvent.cat_name }</td>
             <td><a target="top" href={catEvent.image_url }> {getActivityIcon(catEvent.cat_activity)} </a></td>
             <td>{catEvent.location }</td>
             <td className={getElapsedStyleName(catEvent) }>{normalizeElapsedTime(catEvent.elapsed) }</td>
             <td><EditableText backGroundColor="orange" textColor="white" initialText={catEvent.comment} context={catEvent } onEditComplete={ onSetCommentHandler } readOnly={!authenticated } /></td>
             <td><BoundCheckbox backGroundColor="orange" textColor="white" initialState={catEvent.raked} context={catEvent } onChangeComplete={ onSetRakedHandler } readOnly={!authenticated } /></td>
         </tr>)
         }
       </React.Fragment >
  )
};

export default EditableRow;