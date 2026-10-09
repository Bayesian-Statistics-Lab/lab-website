import test from 'node:test';
import assert from 'node:assert/strict';
import {academicTrack,requestedLabRole} from '../lib/membership-role.ts';
test('new lab positions remain compatible with existing academic tracks',()=>{
 assert.equal(academicTrack('Postdoc'),'PhD');assert.equal(academicTrack('Researcher'),'Masters');assert.equal(academicTrack('Alumni'),'Alumni');
 assert.equal(requestedLabRole({lab_role:'Postdoc'}),'Postdoc');assert.equal(requestedLabRole({lab_role:'Researcher'}),'Researcher');
 for(const value of ['admin','owner','Professor','',null])assert.equal(requestedLabRole({lab_role:value}),null);
 assert.equal(requestedLabRole({}),null);
});
