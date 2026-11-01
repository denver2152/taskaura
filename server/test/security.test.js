import test from 'node:test';
import assert from 'node:assert/strict';
import {hashOtp,matchesOtp} from '../src/security/otp.js';
import {isSessionVersionCurrent} from '../src/security/session.js';
import {mayChangeMemberRole,mayInviteWithRole,mayRemoveMember} from '../src/security/authorization.js';
import {productionConfigurationErrors} from '../src/config/production.js';
import {isPlausibleFocusSession} from '../src/security/focus.js';
import {csvCell,toCsv} from '../src/services/csv.js';

test('verification codes are keyed hashes bound to the account email',()=>{
  const secret='a-test-secret-with-enough-entropy';
  const hash=hashOtp('person@example.com','004219',secret);
  assert.notEqual(hash,'004219');
  assert.equal(matchesOtp(hash,'person@example.com','004219',secret),true);
  assert.equal(matchesOtp(hash,'other@example.com','004219',secret),false);
  assert.equal(matchesOtp(hash,'person@example.com','004218',secret),false);
  assert.equal(matchesOtp(hash,'person@example.com','42',secret),false);
  assert.equal(matchesOtp('not-a-hash','person@example.com','004219',secret),false);
  assert.throws(()=>hashOtp('person@example.com','004219'),/JWT_SECRET must be configured/);
  assert.throws(()=>hashOtp('person@example.com','004219','short'),/JWT_SECRET must be configured/);
});

test('password changes invalidate old token versions while allowing legacy version-zero tokens',()=>{
  assert.equal(isSessionVersionCurrent(undefined,0),true);
  assert.equal(isSessionVersionCurrent('2',2),true);
  assert.equal(isSessionVersionCurrent(1,2),false);
  assert.equal(isSessionVersionCurrent(0,1),false);
});

test('admins cannot demote owners or promote another administrator',()=>{
  assert.equal(mayChangeMemberRole('admin','owner','viewer'),false);
  assert.equal(mayChangeMemberRole('admin','member','admin'),false);
  assert.equal(mayChangeMemberRole('admin','admin','member'),false);
  assert.equal(mayChangeMemberRole('owner','member','admin'),true);
  assert.equal(mayChangeMemberRole('owner','admin','member'),true);
  assert.equal(mayChangeMemberRole('admin','member','viewer'),true);
  assert.equal(mayRemoveMember('admin','admin'),false);
  assert.equal(mayRemoveMember('owner','admin'),true);
  assert.equal(mayRemoveMember('owner','owner'),false);
});

test('only an owner can issue administrator invitations',()=>{
  assert.equal(mayInviteWithRole('admin','member'),true);
  assert.equal(mayInviteWithRole('admin','viewer'),true);
  assert.equal(mayInviteWithRole('admin','admin'),false);
  assert.equal(mayInviteWithRole('owner','admin'),true);
  assert.equal(mayInviteWithRole('member','viewer'),false);
});

test('production configuration rejects development secrets and insecure client origins',()=>{
  const base={NODE_ENV:'production',MONGODB_URI:'mongodb+srv://example.invalid/app',JWT_SECRET:'replace-with-at-least-32-random-characters',CRON_SECRET:'replace-with-a-random-secret',BREVO_API_KEY:'configured',BREVO_SENDER_EMAIL:'sender@example.com',CLIENT_URL:'http://localhost:5173'};
  const errors=productionConfigurationErrors(base).join(' ');
  assert.match(errors,/JWT_SECRET/);
  assert.match(errors,/CRON_SECRET/);
  assert.match(errors,/CLIENT_URL/);
  assert.deepEqual(productionConfigurationErrors({...base,JWT_SECRET:'r'.repeat(40),CRON_SECRET:'s'.repeat(40),CLIENT_URL:'https://app.example.com'}),[]);
  assert.deepEqual(productionConfigurationErrors({NODE_ENV:'development'}),[]);
});

test('focus sessions must match plausible elapsed time and end near the current time',()=>{
  const now=Date.now();
  const valid={durationMinutes:25,startedAt:new Date(now-25*60_000),completedAt:new Date(now)};
  assert.equal(isPlausibleFocusSession(valid,now),true);
  assert.equal(isPlausibleFocusSession({...valid,completedAt:new Date(now-10*60_000)},now),false);
  assert.equal(isPlausibleFocusSession({...valid,startedAt:new Date(now+5*60_000)},now),false);
});

test('CSV output quotes cells and neutralizes spreadsheet formulas',()=>{
  assert.equal(csvCell('=HYPERLINK("https://example.com")'), '"\'=HYPERLINK(""https://example.com"")"');
  assert.equal(csvCell('plain, text'), '"plain, text"');
  assert.equal(toCsv([['Title'],['=SUM(1,1)']]), '"Title"\r\n"\'=SUM(1,1)"');
});
