//EditableRow.js
import React, { useState } from "react";

import AddRow from './AddRow.js';
import BoundCheckbox from './BoundCheckbox.js';
import EditableText from './EditableText.js';
import { formatInTimeZone } from 'date-fns-tz'

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
                       onSetRakedHandler,
                       onShowImage }) => {
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
   var parsedDate = new Date(event.wyze_ts * 1000)
   var utcOffset = parsedDate.getTimezoneOffset()
   var dayCount = Math.floor((parsedDate.valueOf() - (utcOffset * 60000) ) / (60 * 60 * 24 * 1000))
   if (dayCount % 2 === 0) {
     return 'even-data'
   } else {
     return 'odd-data'
   }
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
 
 async function onImageClick() {
   onShowImage(catEvent)
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
             <td onClick={onImageClick} className="activity-td" >{getActivityIcon(catEvent.cat_activity)} </td>
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
