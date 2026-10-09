import {z} from 'zod';
export const profileDetailsSchema=z.object({current_affiliation:z.string().trim().max(160).default(''),current_position:z.string().trim().max(120).default(''),affiliation:z.string().trim().max(120).default('전남대학교'),education_level:z.enum(['undergraduate','graduate','other']).default('undergraduate'),college:z.string().trim().max(120).default(''),department:z.string().trim().max(120).default(''),student_id:z.string().trim().max(40).default(''),phone:z.string().trim().max(40).default(''),public_student_id:z.boolean().default(false),public_phone:z.boolean().default(false)});
export type ProfileDetails=z.infer<typeof profileDetailsSchema>;
export function profileDetails(value:unknown):ProfileDetails{const parsed=profileDetailsSchema.safeParse(value);return parsed.success?parsed.data:profileDetailsSchema.parse({})}
export function publicProfileDetails(value:ProfileDetails){return {...value,student_id:value.public_student_id?value.student_id:'',phone:value.public_phone?value.phone:''}}
export function profileDetailsSlug(memberId:string){return 'settings/member/'+memberId}
