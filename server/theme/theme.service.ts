import {readTheme} from '../../lib/theme.ts';
import type {SiteTheme} from './theme.entity.ts';
import type {ThemeRepository} from './theme.repository.ts';
export function createThemeService(repository:ThemeRepository){return {
 async read(){const result=await repository.read();return {data:readTheme(result.data?.body),error:result.error}},
 async save(theme:SiteTheme){return repository.save(theme)},
}}
