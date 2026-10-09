import test from 'node:test';import assert from 'node:assert/strict';
import {safeReturnPath} from '../lib/navigation.ts';
import {cleanRichHtml,normalizeBody,bodyExcerpt,richTextPrefix} from '../lib/rich-text.ts';
test('login preserves a local destination and blocks external and auth loop destinations',()=>{
 assert.equal(safeReturnPath('/write?category=academic'),'/write?category=academic');
 assert.equal(safeReturnPath('/publications?q=Bayes#results'),'/publications?q=Bayes#results');
 for(const path of [null,'https://evil.test','//evil.test','/\\evil.test','/admin/login?next=/admin','/auth/callback','/register'])assert.equal(safeReturnPath(path),'/');
});
test('rich posts preserve formatting and remove scripts, event handlers and unsafe links',()=>{
 const html=cleanRichHtml('<h2>Heading</h2><p><strong>Bold</strong><a href="javascript:alert(1)" onclick="bad()">Link</a><script>alert(1)</script><img src="x" onerror="bad()"></p>');
 assert.match(html,/<h2>Heading<\/h2>/);assert.match(html,/<strong>Bold<\/strong>/);
 assert.doesNotMatch(html,/script|javascript|onclick|onerror|<img/);
 const safe=cleanRichHtml('<a href="https://example.com" target="_blank">Paper</a>');assert.match(safe,/rel="noopener noreferrer"/);
});
test('legacy plain text stays unchanged and rich excerpts contain no markup',()=>{
 const text='Legacy <example>\nNext line';assert.equal(normalizeBody(text),text);
 const rich=richTextPrefix+'<p><strong>Research</strong> news</p>';
 assert.equal(bodyExcerpt(rich),'Research news');assert.equal(normalizeBody(rich),rich);
});
