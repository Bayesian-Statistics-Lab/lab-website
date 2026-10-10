import type {SupabaseClient} from '@supabase/supabase-js';
import {themePage} from './theme.entity.ts';
import type {SiteTheme} from './theme.entity.ts';
export interface ThemeRepository{read():Promise<{data:{body:string}|null;error:unknown}>;save(theme:SiteTheme):Promise<{error:unknown}>}
export function createThemeRepository(db:SupabaseClient):ThemeRepository{return {
 async read(){return db.from('pages').select('body').eq('slug',themePage.slug).maybeSingle()},
 async save(theme){return db.from('pages').upsert({...themePage,body:JSON.stringify(theme),status:'published',updated_at:new Date().toISOString()},{onConflict:'slug'})},
}}
