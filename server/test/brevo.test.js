import test from 'node:test';
import assert from 'node:assert/strict';
import {sendVerificationCode} from '../src/services/brevo.js';

test('Brevo network failures return a safe, actionable registration error',async()=>{
  const previousKey=process.env.BREVO_API_KEY;
  const previousSender=process.env.BREVO_SENDER_EMAIL;
  const previousFetch=globalThis.fetch;
  process.env.BREVO_API_KEY='test-api-key';
  process.env.BREVO_SENDER_EMAIL='sender@example.com';
  globalThis.fetch=async()=>{throw Object.assign(new TypeError('private network detail'),{cause:{code:'ENETUNREACH'}})};
  try{
    await assert.rejects(sendVerificationCode({email:'person@example.com',code:'123456'}),error=>{
      assert.equal(error.status,502);
      assert.match(error.message,/Could not reach Brevo/);
      assert.doesNotMatch(error.message,/private network detail|test-api-key/);
      return true;
    });
  }finally{
    if(previousKey===undefined)delete process.env.BREVO_API_KEY;else process.env.BREVO_API_KEY=previousKey;
    if(previousSender===undefined)delete process.env.BREVO_SENDER_EMAIL;else process.env.BREVO_SENDER_EMAIL=previousSender;
    globalThis.fetch=previousFetch;
  }
});
