export async function boundedBytes(response:Response,max=10*1024*1024){
 if(!response.ok||!response.body)throw Error('Media unavailable');
 if(Number(response.headers.get('content-length'))>max){await response.body.cancel();throw Error('Media too large')}
 const chunks:Uint8Array[]=[];let total=0;const reader=response.body.getReader();
 try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>max)throw Error('Media too large');chunks.push(value)}}finally{await reader.cancel()}
 const result=new Uint8Array(total);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.length}return result;
}
export async function streamMedia(url:string,cacheControl:string){
 const upstream=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(20000)});
 if(!upstream.ok||!upstream.body)return new Response(null,{status:502,headers:{'Cache-Control':'no-store'}});
 const headers=new Headers({'Cache-Control':cacheControl,'X-Content-Type-Options':'nosniff'});
 for(const key of ['content-type','content-length','etag','last-modified']){const value=upstream.headers.get(key);if(value)headers.set(key,value)}
 return new Response(upstream.body,{headers});
}
