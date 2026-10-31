import test from 'node:test';
import assert from 'node:assert/strict';
import {Task,WorkspaceInvite,PasswordReset,FocusSession,User} from '../src/models/index.js';

test('authentication secrets remain excluded from default model selection',()=>{
  assert.equal(User.schema.path('password').options.select,false);
  assert.equal(PasswordReset.schema.path('otpHash').options.select,false);
  assert.equal(WorkspaceInvite.schema.path('tokenHash').options.select,false);
});

test('one-time code and invitation records expire automatically',()=>{
  assert.equal(PasswordReset.schema.path('expiresAt').options.index.expires,0);
  assert.equal(WorkspaceInvite.schema.path('expiresAt').options.index.expires,0);
});

test('task model supports all statuses and bounded time entries',()=>{
  assert.deepEqual(Task.schema.path('status').enumValues,['Backlog','To Do','In Progress','In Review','Completed','Cancelled']);
  assert.equal(Task.schema.path('timeEntries').$embeddedSchemaType.schema.path('minutes').options.max,1440);
});

test('focus sessions are restricted to one user's workspace and unique client session ids',()=>{
  assert.equal(FocusSession.schema.path('workspace').options.required,true);
  assert.equal(FocusSession.schema.path('user').options.required,true);
  assert.equal(FocusSession.schema.path('kind').enumValues.includes('focus'),true);
  assert.equal(FocusSession.schema.indexes().some(([keys,options])=>keys.workspace===1&&keys.user===1&&keys.sessionId===1&&options.unique),true);
});
