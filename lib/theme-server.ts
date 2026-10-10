import {page} from './data';
import {readDesign} from './site-design';
export async function siteTheme(){const row=await page('settings/theme');return readDesign(row?.body)}
