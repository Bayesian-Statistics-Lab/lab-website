import {defaultBrand} from '../../lib/brand.ts';
import {z} from 'zod';
const color=z.string().regex(/^#[0-9a-f]{6}$/i,'6자리 HEX 색상을 입력해주세요.');
export const themeSchema=z.object({primary:color,heading:color,text:color,surface:color,soft:color,brandName:z.string().trim().min(1).max(60).refine(value=>!value.includes('\n'),'연구실 이름은 한 줄로 입력해주세요.').default(defaultBrand.brandName),brandSubtitle:z.string().trim().max(200).default(defaultBrand.brandSubtitle)}).strict();
