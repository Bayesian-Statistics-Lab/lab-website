import test from 'node:test';import assert from 'node:assert/strict';
import {ownImagePath,imageSignature} from '../lib/media.ts';
import {cleanRichHtml,richMediaPaths,richTextPrefix} from '../lib/rich-text.ts';
const owner='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',other='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',file='cccccccc-cccc-4ccc-8ccc-cccccccccccc.gif';
test('GIF images require real GIF87a or GIF89a signatures',()=>{
 assert.equal(imageSignature(new TextEncoder().encode('GIF89a'),'image/gif'),true);assert.equal(imageSignature(new TextEncoder().encode('GIF87a'),'image/gif'),true);assert.equal(imageSignature(new TextEncoder().encode('<html>'),'image/gif'),false);
});
test('image ownership excludes another account, traversal and PDFs',()=>{
 assert.equal(ownImagePath(owner,owner+'/'+file),true);assert.equal(ownImagePath(owner,other+'/'+file),false);assert.equal(ownImagePath(owner,owner+'/../'+file),false);assert.equal(ownImagePath(owner,owner+'/'+file.replace('gif','pdf')),false);
});
test('rich images keep a safe source, remove executable content and expose only image references',()=>{
 const src='/api/media/'+owner+'/'+file;
 const html=cleanRichHtml('<img src="'+src+'" alt="Research" onerror="bad()"><img src="data:text/html,bad"><img src="javascript:bad()">');
 assert.match(html,/alt="Research"/);assert.doesNotMatch(html,/onerror|javascript|data:/);
 assert.deepEqual(richMediaPaths(richTextPrefix+html),[owner+'/'+file]);assert.deepEqual(richMediaPaths('<p>'+src+'</p>'),[]);
});
