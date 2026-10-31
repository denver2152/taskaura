const dayMs=24*60*60*1000;

export function nextOccurrenceDate(dueDate,recurrence){
  if(!dueDate||!recurrence||recurrence.frequency==='none')return null;
  const next=new Date(dueDate),interval=recurrence.interval||1;
  if(recurrence.frequency==='daily')next.setUTCDate(next.getUTCDate()+interval);
  else if(recurrence.frequency==='weekly')next.setUTCDate(next.getUTCDate()+7*interval);
  else if(recurrence.frequency==='monthly'){
    const day=next.getUTCDate();next.setUTCDate(1);next.setUTCMonth(next.getUTCMonth()+interval);
    const lastDay=new Date(Date.UTC(next.getUTCFullYear(),next.getUTCMonth()+1,0)).getUTCDate();next.setUTCDate(Math.min(day,lastDay));
  }else return null;
  return new Date(Date.UTC(next.getUTCFullYear(),next.getUTCMonth(),next.getUTCDate()));
}

export function startDateForOccurrence(startDate,dueDate,nextDueDate){
  if(!startDate||!dueDate||!nextDueDate)return nextDueDate;
  const offset=Math.round((new Date(dueDate)-new Date(startDate))/dayMs);
  const nextStart=new Date(nextDueDate);nextStart.setUTCDate(nextStart.getUTCDate()-offset);return nextStart;
}
