export function createSignupLimiter(windowMs=60_000,maxAttempts=5){
 const entries=new Map<string,{count:number;expires:number}>();
 const key=(ip:string,email:string)=>JSON.stringify([ip,email.trim().toLowerCase()]);
 return {
  check(ip:string,email:string,now=Date.now()){
   for(const [id,value] of entries)if(value.expires<=now)entries.delete(id);
   const id=key(ip,email),entry=entries.get(id)||{count:0,expires:now+windowMs};
   if(entry.count>=maxAttempts)return Math.ceil((entry.expires-now)/1000);
   entry.count++;entries.set(id,entry);return 0;
  },
  clear(ip:string,email:string){entries.delete(key(ip,email))}
 }
}
