import {page} from './data';import {defaultResearchAreas,parseResearchAreas} from './research-areas';
export async function researchAreas(){const row=await page('settings/research');if(!row)return defaultResearchAreas;try{return parseResearchAreas(JSON.parse(row.body||'{}'))}catch{return defaultResearchAreas}}
