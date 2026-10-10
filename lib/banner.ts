import {page} from './data';
import {defaultBanner,readBanner} from './banner-settings';
export {defaultBanner} from './banner-settings';
export async function banner(){const row=await page('home/banner');return row?readBanner(row.title,row.body):defaultBanner}
