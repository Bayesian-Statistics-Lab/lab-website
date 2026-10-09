import test from 'node:test';
import assert from 'node:assert/strict';
import {editableStrings} from '../lib/editor.ts';
import {contentSchema} from '../lib/content-schema.ts';
test('an existing member with database nulls can be saved as an alumnus',()=>{const record={name_en:null,email:null,photo_url:null,scholar_author_id:null};const payload={type:'members',title:'Existing member',role:'Alumni',status:'published',...editableStrings(record)};assert.equal(contentSchema.safeParse(payload).success,true);});
test('unsafe photo protocols still fail after editor normalization',()=>{const payload={type:'members',title:'Existing member',role:'Alumni',...editableStrings({photo_url:'javascript:alert(1)'})};assert.equal(contentSchema.safeParse(payload).success,false);});
