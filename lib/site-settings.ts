import {z} from 'zod';
export const settingsSchemas={history:z.object({entries:z.array(z.object({date:z.string().trim().min(1).max(80),events:z.array(z.string().trim().min(1).max(1000)).min(1).max(30)})).max(100)}),auth:z.object({image:z.string().max(2048).refine(v=>v.startsWith('/assets/')||v.startsWith('/api/media/')||/^https:\/\//.test(v)),caption:z.string().trim().max(200).default('Exploring uncertainty, building insight.')})};
export const defaultAuthImage={image:'/assets/illustrations/posterior.svg',caption:'Exploring uncertainty, building insight.'};
export function readHistory(body:string){try{const parsed=settingsSchemas.history.safeParse(JSON.parse(body));return parsed.success?parsed.data.entries:null}catch{return null}}
