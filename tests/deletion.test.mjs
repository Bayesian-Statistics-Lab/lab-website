import test from 'node:test';
import assert from 'node:assert/strict';
import {deleteRecord} from '../lib/deletion.ts';
function database({data={id:'post-id'},error=null,linkError=null}={}){
 const calls=[];let table,action;
 const chain={delete(){action='delete';calls.push(['delete',table]);return this},update(value){action='update';calls.push(['update',table,value]);return this},eq(key,value){calls.push(['eq',key,value]);return this},select(value){calls.push(['select',value]);return this},maybeSingle(){return Promise.resolve({data,error})},then(resolve){return Promise.resolve({error:action==='update'?linkError:error}).then(resolve)}};
 return {calls,from(name){table=name;calls.push(['from',name]);return chain}};
}
test('post deletion removes the row and constrains member ownership',async()=>{const db=database();const result=await deleteRecord(db,'posts','post-id','author-id');assert.equal(result.data.id,'post-id');assert.deepEqual(db.calls,[['from','posts'],['delete','posts'],['eq','id','post-id'],['eq','author_id','author-id'],['select','id']]);});
test('zero affected rows and database failures cannot masquerade as deletion',async()=>{assert.equal((await deleteRecord(database({data:null}),'posts','missing')).data,null);const error={message:'denied'};assert.equal((await deleteRecord(database({data:null,error}),'posts','post-id')).error,error);});
test('member deletion preserves organization nodes by detaching the profile first',async()=>{const db=database();await deleteRecord(db,'members','member-id');assert.deepEqual(db.calls.slice(0,3),[['from','organization_nodes'],['update','organization_nodes',{member_id:null}],['eq','member_id','member-id']]);assert.deepEqual(db.calls.slice(3),[['from','members'],['delete','members'],['eq','id','member-id'],['select','id']]);});
test('failed organization unlink stops member deletion',async()=>{const db=database({linkError:{message:'denied'}});assert.ok((await deleteRecord(db,'members','member-id')).error);assert.equal(db.calls.some(call=>call[0]==='delete'),false);});
