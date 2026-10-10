import test from 'node:test';
import assert from 'node:assert/strict';
import {createPublicationService} from '../server/publications/publication.service.ts';
import {changePublicationStatusSchema,deletePublicationsSchema} from '../server/publications/publication.dto.ts';
import {changePublicationStatus,deletePublications} from '../features/publications/api/publication-client.ts';
const id='11111111-1111-4111-8111-111111111111';
function fixture(overrides={}){
 const calls=[];
 const repository={
  async changeStatus(id,status){calls.push(['status',id,status]);return {data:{id,status},error:null}},
  async changeSummaryStatus(id,status){calls.push(['summaryStatus',id,status]);return {error:null}},
  async deleteByIds(ids){calls.push(['delete',ids]);return {data:ids.map(id=>({id})),error:null}},
  async deleteSummaries(ids){calls.push(['summaries',ids]);return {error:null}},
  ...overrides,
 };
 return {calls,service:createPublicationService(repository)};
}
test('publication DTOs preserve UUID, status and batch size validation',()=>{
 assert.equal(changePublicationStatusSchema.safeParse({id,status:'published'}).success,true);
 assert.equal(changePublicationStatusSchema.safeParse({id,status:'public'}).success,false);
 assert.equal(changePublicationStatusSchema.safeParse({id:'bad',status:'draft'}).success,false);
 assert.equal(deletePublicationsSchema.safeParse({ids:[]}).success,false);
 assert.equal(deletePublicationsSchema.safeParse({ids:Array(100).fill(id)}).success,true);
 assert.equal(deletePublicationsSchema.safeParse({ids:Array(101).fill(id)}).success,false);
});
test('publication status updates the linked summary after the paper mutation',async()=>{
 const {service,calls}=fixture();assert.deepEqual(await service.changeStatus({id,status:'draft'}),{kind:'changed',publication:{id,status:'draft'},summaryUpdated:true});assert.deepEqual(calls,[['status',id,'draft'],['summaryStatus',id,'draft']]);
});
test('zero changed rows and DB errors stop summary updates',async()=>{
 for(const result of [{data:null,error:null},{data:null,error:{message:'denied'}}]){
  const {service,calls}=fixture({changeStatus:async()=>result});assert.deepEqual(await service.changeStatus({id,status:'published'}),{kind:'failed'});assert.deepEqual(calls,[]);
 }
});
test('summary status failure retains the successful paper mutation as a partial result',async()=>{
 const {service}=fixture({changeSummaryStatus:async()=>({error:{message:'denied'}})});const result=await service.changeStatus({id,status:'published'});assert.equal(result.kind,'changed');assert.equal(result.publication.status,'published');assert.equal(result.summaryUpdated,false);
});
test('publication deletion deduplicates IDs and cleans up only rows actually deleted',async()=>{
 const {service,calls}=fixture({deleteByIds:async ids=>{calls.push(['delete',ids]);return {data:[{id:'first'}],error:null}}});assert.deepEqual(await service.deleteSelected({ids:['first','first','second']}),{kind:'deleted',deleted:['first'],summaryCleaned:true,partial:true});assert.deepEqual(calls,[['delete',['first','second']],['summaries',['first']]]);
});
test('failed and zero-row deletion never clean up summaries',async()=>{
 for(const [response,kind] of [[{data:null,error:{message:'denied'}},'failed'],[{data:[],error:null},'none'],[{data:null,error:null},'none']]){
  const {service,calls}=fixture({deleteByIds:async()=>response});assert.deepEqual(await service.deleteSelected({ids:[id]}),{kind});assert.deepEqual(calls,[]);
 }
});
test('summary cleanup failure retains deleted IDs and the partial deletion flag',async()=>{
 const {service}=fixture({deleteSummaries:async()=>({error:{message:'denied'}})});assert.deepEqual(await service.deleteSelected({ids:[id]}),{kind:'deleted',deleted:[id],summaryCleaned:false,partial:false});
});
test('publication client preserves endpoint, HTTP verb, request body and warnings',async()=>{
 const calls=[];const transport=async(url,options)=>{calls.push([url,options.method,JSON.parse(options.body),options.headers]);return new Response(JSON.stringify(options.method==='PATCH'?{data:{id,status:'published'}}:{deleted:[id],warning:'partial'}),{status:200})};
 assert.deepEqual(await changePublicationStatus(id,'published',transport),{data:{id,status:'published'}});
 assert.deepEqual(await deletePublications([id],transport),{deleted:[id],warning:'partial'});
 assert.deepEqual(calls,[['/api/v1/admin/publications/status','PATCH',{id,status:'published'},{'content-type':'application/json'}],['/api/v1/admin/publications/delete','DELETE',{ids:[id]},{'content-type':'application/json'}]]);
});
test('publication client preserves server error messages, including partial status failure',async()=>{
 const transport=async()=>new Response(JSON.stringify({error:'summary update failed'}),{status:500});await assert.rejects(changePublicationStatus(id,'published',transport),/summary update failed/);await assert.rejects(deletePublications([id],transport),/summary update failed/);
});
