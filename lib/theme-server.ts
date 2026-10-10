import {page} from './data';
import {readTheme} from './theme';
export async function siteTheme(){const row=await page('settings/theme');return readTheme(row?.body)}
