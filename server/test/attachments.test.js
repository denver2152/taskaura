import test from 'node:test';
import assert from 'node:assert/strict';
import {allowedAttachmentTypes,detectedAttachmentType,sanitizeAttachmentFilename} from '../src/security/attachments.js';

test('attachment signatures accept only supported safe content types',()=>{
  assert.equal(detectedAttachmentType(Buffer.from('%PDF-1.7')), 'application/pdf');
  assert.equal(detectedAttachmentType(Buffer.from([137,80,78,71,13,10,26,10])), 'image/png');
  assert.equal(detectedAttachmentType(Buffer.from([255,216,255,0])), 'image/jpeg');
  assert.equal(detectedAttachmentType(Buffer.concat([Buffer.from('RIFF'),Buffer.alloc(4),Buffer.from('WEBP')])), 'image/webp');
  assert.equal(detectedAttachmentType(Buffer.from('<svg onload="alert(1)">')), null);
  assert.equal(allowedAttachmentTypes.has('image/svg+xml'), false);
});

test('attachment filename sanitization strips path traversal and control characters',()=>{
  assert.equal(sanitizeAttachmentFilename('../../private\r\n.pdf'),'private__.pdf');
  assert.equal(sanitizeAttachmentFilename(''), 'attachment');
  assert.ok(sanitizeAttachmentFilename('a'.repeat(300)).length<=180);
});
