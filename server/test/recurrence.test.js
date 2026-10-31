import test from 'node:test';
import assert from 'node:assert/strict';
import {nextOccurrenceDate,startDateForOccurrence} from '../src/services/recurrence.js';

test('daily and weekly recurrence intervals advance the UTC calendar date',()=>{
  const due=new Date('2026-05-10T00:00:00.000Z');
  assert.equal(nextOccurrenceDate(due,{frequency:'daily',interval:2}).toISOString(),'2026-05-12T00:00:00.000Z');
  assert.equal(nextOccurrenceDate(due,{frequency:'weekly',interval:2}).toISOString(),'2026-05-24T00:00:00.000Z');
});

test('monthly recurrence clamps month-end dates and preserves task duration',()=>{
  const due=new Date('2026-01-31T00:00:00.000Z'),next=nextOccurrenceDate(due,{frequency:'monthly',interval:1});
  assert.equal(next.toISOString(),'2026-02-28T00:00:00.000Z');
  assert.equal(startDateForOccurrence(new Date('2026-01-28T00:00:00.000Z'),due,next).toISOString(),'2026-02-25T00:00:00.000Z');
});

test('disabled recurrence returns no next occurrence',()=>{
  assert.equal(nextOccurrenceDate(new Date(),{frequency:'none',interval:1}),null);
});
