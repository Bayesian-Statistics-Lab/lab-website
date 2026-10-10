import test from 'node:test';
import assert from 'node:assert/strict';
import {contentSchema} from '../lib/content-schema.ts';
import {emptyPublicationForm,publicationForm,publicationPayload,matchingPublications,visiblePublications,applyPublicationDeletion} from '../features/publications/model/publication-editor.ts';
import {publicationEditorReducer} from '../features/publications/model/publication-editor-state.ts';
import {deletePublicationBatches} from '../features/publications/model/delete-publication-batches.ts';
import {loadPublications,savePublication} from '../features/publications/api/publication-client.ts';
const id='11111111-1111-4111-8111-111111111111';
const paper={id,title:'Bayesian Analysis',authors:['Lee','Kim'],year:2026,venue:'Journal',status:'published',citation_count:10,summary:'Abstract'};
const rows=[paper,{id:'older',title:'Regression',authors:['Park'],year:2024,status:'draft',citation_count:100},{id:'unknown',title:'BAYESIAN models',authors:null,year:null,status:'draft',citation_count:null}];
function state(){return {mode:'list',form:emptyPublicationForm(),rows,editId:'',selected:[id,'older'],search:'Bayesian',order:'citation-asc',message:'',failed:false,loading:false,busy:false,toggling:'',confirmId:'bulk-publications',removing:false,deleteError:''}}

test('publication form preserves existing summary, authors, year and nullable link normalization',()=>{
 const form=publicationForm({...paper,doi:null,paper_url:null});
 assert.equal(form.authors,'Lee\nKim');assert.equal(form.year,'2026');assert.equal(form.summary,'Abstract');assert.equal(form.doi,'');assert.equal(form.paper_url,'');assert.equal(form.status,'published');
 const payload=publicationPayload(form,id);assert.equal(contentSchema.safeParse(payload).success,true);assert.deepEqual(payload.authors,['Lee','Kim']);assert.equal(payload.year,2026);assert.equal(payload.id,id);
});
test('a new paper remains a draft and does not create a summary until that field is edited',()=>{
 const form=emptyPublicationForm();form.title='New paper';
 const payload=publicationPayload(form,'');assert.equal(payload.status,'draft');assert.equal(payload.id,undefined);assert.equal(payload.summary,undefined);assert.equal(payload.year,null);assert.deepEqual(payload.authors,[]);
 assert.equal(contentSchema.safeParse(payload).success,true);
 assert.equal(publicationPayload({...form,summary:''},'').summary,'');
});
test('publication payload trims blank author lines and retains DOI, link and explicit summary edits',()=>{
 const payload=publicationPayload({...emptyPublicationForm(),title:'Title',authors:' Lee \n\n Kim\n ',year:'2025',doi:'10.1/x',paper_url:'https://example.com',summary:'',status:'published'},id);
 assert.deepEqual(payload.authors,['Lee','Kim']);assert.equal(payload.year,2025);assert.equal(payload.summary,'');assert.equal(payload.paper_url,'https://example.com');
});
test('search matches titles and authors case-insensitively and does not change the source list',()=>{
 assert.deepEqual(matchingPublications(rows,'bayesian').map(row=>row.id),[id,'unknown']);assert.deepEqual(matchingPublications(rows,'KIM').map(row=>row.id),[id]);assert.deepEqual(matchingPublications(rows,'nothing'),[]);assert.deepEqual(rows.map(row=>row.id),[id,'older','unknown']);
});
test('year and both citation orders keep unknown citation counts last',()=>{
 assert.deepEqual(visiblePublications(rows,'','year').map(row=>row.id),[id,'older','unknown']);assert.deepEqual(visiblePublications(rows,'','citation-asc').map(row=>row.id),[id,'older','unknown']);assert.deepEqual(visiblePublications(rows,'','citation-desc').map(row=>row.id),['older',id,'unknown']);
 assert.deepEqual(visiblePublications(rows,'Bayesian','citation-desc').map(row=>row.id),[id,'unknown']);
});
test('editing and resetting preserve search, order and current selection',()=>{
 const initial=state();const edit=publicationEditorReducer(initial,{type:'edit',row:paper});assert.equal(edit.mode,'form');assert.equal(edit.editId,id);assert.equal(edit.form.summary,'Abstract');assert.equal(edit.search,initial.search);assert.deepEqual(edit.selected,initial.selected);
 const fresh=publicationEditorReducer(edit,{type:'new'});assert.equal(fresh.editId,'');assert.deepEqual(fresh.form,emptyPublicationForm());assert.equal(fresh.order,initial.order);assert.deepEqual(initial.form,emptyPublicationForm());
});
test('confirmed deleted IDs alone are removed from the list, selection and active editing target',()=>{
 const initial={...state(),editId:id};const next=publicationEditorReducer(initial,{type:'deleted',ids:[id]});assert.deepEqual(next.rows.map(row=>row.id),['older','unknown']);assert.deepEqual(next.selected,['older']);assert.equal(next.editId,'');assert.equal(next.confirmId,'bulk-publications');assert.equal(initial.rows.length,3);
 assert.equal(applyPublicationDeletion(rows,[id,'older'],'older',[id]).editId,'older');
});
test('publication state changes update only the returned paper status',()=>{
 const initial=state();const next=publicationEditorReducer(initial,{type:'status',row:{...paper,status:'draft'}});assert.equal(next.rows[0].status,'draft');assert.equal(next.rows[0].summary,'Abstract');assert.deepEqual(next.rows[1],initial.rows[1]);assert.equal(initial.rows[0].status,'published');
});
test('bulk deletion sends sequential batches of at most 100 and updates each completed batch immediately',async()=>{
 const ids=Array.from({length:205},(_,i)=>String(i)),events=[];
 const warning=await deletePublicationBatches(ids,async batch=>{events.push(['request',batch]);return {deleted:batch,warning:batch[0]==='100'?'partial':''}},deleted=>events.push(['deleted',deleted]));
 assert.deepEqual(events.map(([kind,batch])=>[kind,batch.length]),[['request',100],['deleted',100],['request',100],['deleted',100],['request',5],['deleted',5]]);assert.deepEqual(events[2][1],ids.slice(100,200));assert.equal(warning,'partial');
});
test('a later deletion failure retains successful removals and does not issue subsequent requests',async()=>{
 const ids=Array.from({length:205},(_,i)=>String(i));let calls=0;const deleted=[];
 await assert.rejects(deletePublicationBatches(ids,async batch=>{calls++;if(calls===2)throw Error('denied');return {deleted:batch.slice(0,10),warning:'partial'}},batch=>deleted.push(...batch)),/denied/);
 assert.equal(calls,2);assert.deepEqual(deleted,ids.slice(0,10));
});
test('zero affected deletions keep selection and the last nonempty server warning is preserved',async()=>{
 const ids=Array.from({length:201},(_,i)=>String(i));let calls=0;let current=state();
 const warning=await deletePublicationBatches(ids,async()=>({deleted:[],warning:['first','last',''][calls++]}),deleted=>{current=publicationEditorReducer(current,{type:'deleted',ids:deleted})});assert.equal(warning,'last');assert.deepEqual(current.selected,state().selected);assert.equal(current.rows.length,3);
});
test('list requests retain the content endpoint and inline ID/slug query contracts',async()=>{
 const urls=[];const transport=async url=>{urls.push(url);return new Response(JSON.stringify({data:[paper]}))};
 assert.deepEqual(await loadPublications({},transport),[paper]);await loadPublications({id},transport);await loadPublications({id,slug:'a/b'},transport);
 assert.deepEqual(urls,['/api/v1/admin/content?type=publications','/api/v1/admin/content?type=publications&id='+id,'/api/v1/admin/content?type=publications&slug=a%2Fb']);
});
test('create and edit requests retain POST/PATCH and their normalized publication payloads',async()=>{
 const calls=[];const transport=async(url,options)=>{calls.push([url,options.method,JSON.parse(options.body)]);return new Response(JSON.stringify({data:paper}))};
 const form={...emptyPublicationForm(),title:'New'};await savePublication(publicationPayload(form,''),transport);await savePublication(publicationPayload(publicationForm(paper),id),transport);
 assert.deepEqual(calls.map(([url,method])=>[url,method]),[['/api/v1/admin/content','POST'],['/api/v1/admin/content','PATCH']]);assert.equal(calls[0][2].id,undefined);assert.equal(calls[0][2].summary,undefined);assert.equal(calls[1][2].id,id);assert.equal(calls[1][2].summary,'Abstract');
});
test('publication content requests propagate server errors and preserve empty-list fallback',async()=>{
 const failed=async()=>new Response(JSON.stringify({error:'not allowed'}),{status:401});await assert.rejects(loadPublications({},failed),/not allowed/);await assert.rejects(savePublication(publicationPayload({...emptyPublicationForm(),title:'New'},''),failed),/not allowed/);
 assert.deepEqual(await loadPublications({},async()=>new Response('{}')),[]);
});

test('sequential row selections retain previously selected and filtered-out papers',()=>{
 let current=state();current=publicationEditorReducer(current,{type:'select-row',id:'unknown',checked:true});current=publicationEditorReducer(current,{type:'select-row',id:'new',checked:true});assert.deepEqual(current.selected,[id,'older','unknown','new']);
 current=publicationEditorReducer(current,{type:'select-row',id:'older',checked:false});assert.deepEqual(current.selected,[id,'unknown','new']);
});
