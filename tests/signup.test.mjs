import test from 'node:test';
import assert from 'node:assert/strict';
import {signupSchema,signupMetadata} from '../lib/signup.ts';
const signup={email:'member@example.com',password:'long-password',name:'신청자',name_en:'Member',lab_role:'Researcher',scholar_author_id:'',bio:'',public_email:false,profile_details:{}};
test('signup accepts member positions and keeps administrative access out of metadata',()=>{const input=signupSchema.parse(signup),metadata=signupMetadata(input);assert.equal(metadata.lab_role,'Researcher');assert.equal(metadata.academic_role,'Masters');assert.equal(metadata.display_name,'신청자');assert.equal('role' in metadata,false);assert.equal('membership_status' in metadata,false)});
test('signup cannot request administrator role, self approval or another user ID',()=>{for(const extra of [{lab_role:'admin'},{lab_role:'owner'},{lab_role:'Professor'},{role:'admin'},{membership_status:'approved'},{id:'another-account'}])assert.equal(signupSchema.safeParse({...signup,...extra}).success,false)});
test('invalid email, weak password and oversized fields fail before account creation',()=>{for(const extra of [{email:'invalid'},{password:'short'},{name:''},{bio:'x'.repeat(5001)}])assert.equal(signupSchema.safeParse({...signup,...extra}).success,false)});
