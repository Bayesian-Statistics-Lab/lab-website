import {readDesign} from '../../lib/site-design.ts';
import type {SiteDesign} from './theme.entity.ts';
import type {ThemeRepository} from './theme.repository.ts';
export function createThemeService(repository:ThemeRepository){return {
 async read(){const result=await repository.read();return {data:readDesign(result.data?.body),error:result.error}},
 async save(theme:SiteDesign){return repository.save(theme)},
}}
