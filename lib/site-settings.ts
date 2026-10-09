import {z} from 'zod';
export const settingsSchemas={history:z.object({entries:z.array(z.object({date:z.string().trim().min(1).max(80),events:z.array(z.string().trim().min(1).max(1000)).min(1).max(30)})).max(100)}),auth:z.object({image:z.string().max(2048).refine(v=>v.startsWith('/assets/')||v.startsWith('/api/media/')||/^https:\/\//.test(v)),caption:z.string().trim().max(200).default('Exploring uncertainty, building insight.')})};
export const defaultAuthImage={image:'/assets/illustrations/login-still-life.webp',caption:'빛과 유리의 곡선으로 표현한 연구와 탐구'};
export function readHistory(body:string){try{const parsed=settingsSchemas.history.safeParse(JSON.parse(body));return parsed.success?sortHistory(parsed.data.entries):null}catch{return null}}

export function historyDateKey(value:string){const parts=value.match(/\d+/g)?.map(Number)||[];return (parts[0]||0)*10000+(parts[1]||0)*100+(parts[2]||0)}
export function sortHistory<T extends {date:string}>(entries:T[]):T[]{return [...entries].sort((a,b)=>historyDateKey(b.date)-historyDateKey(a.date))}
