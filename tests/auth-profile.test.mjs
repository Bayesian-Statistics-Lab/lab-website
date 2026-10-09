import test from 'node:test';
import assert from 'node:assert/strict';
import {callbackInput,confirmationError} from '../lib/auth-callback.ts';
import {ownPhotoPath,photoSignature} from '../lib/profile-photo.ts';
test('email callback supports code, cross-device email token and legacy session',()=>{
 assert.equal(callbackInput('?code=example','').kind,'code');
 assert.deepEqual(callbackInput('?token_hash=example&type=email',''),{kind:'token',token_hash:'example',type:'email'});
 assert.equal(callbackInput('','#access_token=example&refresh_token=example&type=signup').kind,'session');
 assert.equal(callbackInput('?code=example&next=https://untrusted.test','').kind,'code');
});
test('expired, malformed and recovery links are not treated as signup success',()=>{
 assert.equal(callbackInput('?error=access_denied','').kind,'error');
 assert.equal(callbackInput('','#error=access_denied').kind,'error');
 assert.equal(callbackInput('?token_hash=example&type=recovery','').kind,'error');
 assert.equal(callbackInput('','#access_token=example&refresh_token=example&type=recovery').kind,'empty');
 assert.equal(callbackInput('','').kind,'empty');
 assert.match(confirmationError('bad_code_verifier'),/브라우저/);
 assert.match(confirmationError('otp_expired'),/만료/);
});
test('photo paths are bound to the signed-in owner and reject traversal and PDF',()=>{
 const owner='11111111-1111-4111-8111-111111111111',other='22222222-2222-4222-8222-222222222222';
 const path=owner+'/33333333-3333-4333-8333-333333333333.png';
 assert.equal(ownPhotoPath(owner,path),true);assert.equal(ownPhotoPath(other,path),false);
 assert.equal(ownPhotoPath(owner,owner+'/../file.png'),false);assert.equal(ownPhotoPath(owner,path.replace('.png','.pdf')),false);
});
test('file signatures reject disguised documents and allow actual image headers',()=>{
 assert.equal(photoSignature(new Uint8Array([137,80,78,71,13,10,26,10]),'image/png'),true);
 assert.equal(photoSignature(new Uint8Array([255,216,255]),'image/jpeg'),true);
 assert.equal(photoSignature(new TextEncoder().encode('RIFFxxxxWEBP'),'image/webp'),true);
 assert.equal(photoSignature(new TextEncoder().encode('%PDF-1.7'),'image/png'),false);
 assert.equal(photoSignature(new Uint8Array([]),'image/jpeg'),false);
});
