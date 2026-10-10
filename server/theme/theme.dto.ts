import {z} from 'zod';
const color=z.string().regex(/^#[0-9a-f]{6}$/i,'6자리 HEX 색상을 입력해주세요.');
export const themeSchema=z.object({primary:color,heading:color,text:color,surface:color,soft:color}).strict();
