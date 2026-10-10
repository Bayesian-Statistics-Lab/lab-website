import test from 'node:test';
import assert from 'node:assert/strict';
import {boardOptions,boardPath,postPath} from '../lib/board-options.ts';
import {canWriteBoard,canManagePost} from '../lib/permissions.ts';
import {postNumbers} from '../lib/board-pagination.ts';
test('forms board links stay inside research support and existing post routes are preserved',()=>{
 assert.ok(boardOptions.some(([key])=>key==='forms'));
 assert.equal(boardPath('forms'),'/support/forms');assert.equal(postPath('forms','one'),'/support/forms/one');
 assert.equal(postPath('notice','one'),'/notice/one');assert.equal(postPath('events','one'),'/news/one');assert.equal(postPath('page:about/introduction','one'),'/about/introduction');
});
test('only administrators can write or manage forms, including approved authors',()=>{
 const member={role:'member',approved:true,user:{id:'author'}};
 const post={category:'forms',author_id:'author'};
 for(const account of [null,member,{...member,approved:false}]){assert.equal(canWriteBoard(account,'forms'),false);assert.equal(canManagePost(account,post),false)}
 for(const role of ['admin','owner']){const account={...member,role};assert.equal(canWriteBoard(account,'forms'),true);assert.equal(canManagePost(account,post),true)}
});
test('forms post numbers are sequential independently from news and notices',()=>{
 assert.deepEqual(postNumbers([{id:'a',category:'forms'},{id:'n',category:'news'},{id:'b',category:'forms'},{id:'c',category:'notice'}]),{a:1,n:1,b:2,c:1});
});
