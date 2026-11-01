import {createHmac,randomInt,timingSafeEqual} from 'node:crypto';

export function makeOtp(){
  return String(randomInt(0,1_000_000)).padStart(6,'0');
}

export function hashOtp(email,code,secret){
  if(typeof secret!=='string'||secret.length<32)throw Object.assign(new Error('JWT_SECRET must be configured with at least 32 characters to protect verification codes.'),{status:503});
  return createHmac('sha256',secret).update(`${email}:${code}`).digest('hex');
}

export function matchesOtp(expectedHash,email,code,secret){
  if(!/^[0-9]{6}$/.test(code)||!/^[a-f0-9]{64}$/i.test(expectedHash||''))return false;
  const expected=Buffer.from(expectedHash,'hex');
  const actual=Buffer.from(hashOtp(email,code,secret),'hex');
  return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
