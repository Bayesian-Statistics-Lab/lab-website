import type {SiteDesign} from '@/lib/site-design';
export async function loadTheme(){const response=await fetch('/api/v1/admin/theme');const result=await response.json();if(!response.ok)throw Error(result.error||'불러오기 실패');return result.data as SiteDesign}
export async function saveTheme(theme:SiteDesign){const response=await fetch('/api/v1/admin/theme',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(theme)});const result=await response.json();if(!response.ok)throw Error(result.error||'저장 실패')}
