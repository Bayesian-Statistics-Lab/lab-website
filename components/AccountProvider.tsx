"use client";
import {createContext,useContext,useEffect,useState} from 'react';
export type Account={role:string;approved:boolean;user:{id:string}};
const Context=createContext<{account:Account|null;loading:boolean}>({account:null,loading:true});
export function useAccount(){return useContext(Context)}
export default function AccountProvider({children}:{children:React.ReactNode}){const [account,setAccount]=useState<Account|null>(null),[loading,setLoading]=useState(true);useEffect(()=>{const controller=new AbortController();fetch('/api/session',{signal:controller.signal,cache:'no-store'}).then(r=>r.json()).then(j=>setAccount(j.account||null)).catch(()=>{}).finally(()=>setLoading(false));return()=>controller.abort()},[]);return <Context.Provider value={{account,loading}}>{children}</Context.Provider>}
