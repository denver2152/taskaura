import test from 'node:test';
import assert from 'node:assert/strict';
import {hashOtp,matchesOtp} from '../src/security/otp.js';
import {isSessionVersionCurrent} from '../src/security/session.js';

test('verification codes are keyed hashes bound to the account email',()=>{
  const secret='a-test-secret-with-enough-entropy';
  const hash=hashOtp('person@example.com','004219',secret);
  assert.notEqual(hash,'004219');
  assert.equal(matchesOtp(hash,'person@example.com','004219',secret),true);
  assert.equal(matchesOtp(hash,'other@example.com','004219',secret),false);
  assert.equal(matchesOtp(hash,'person@example.com','004218',secret),false);
  assert.equal(matchesOtp(hash,'person@example.com','42',secret),false);
  assert.equal(matchesOtp('not-a-hash','person@example.com','004219',secret),false);
});

test('password changes invalidate old token versions while allowing legacy version-zero tokens',()=>{
  assert.equal(isSessionVersionCurrent(undefined,0),true);
  assert.equal(isSessionVersionCurrent('2',2),true);
  assert.equal(isSessionVersionCurrent(1,2),false);
  assert.equal(isSessionVersionCurrent(0,1),false);
});
