import {z} from 'zod';
import {membershipRoles,academicTrack} from './membership-role.ts';
import {profileDetailsSchema} from './profile-details.ts';
export const signupSchema=z.object({email:z.email().trim().max(254),password:z.string().min(10).max(128),name:z.string().trim().min(1).max(100),name_en:z.string().trim().max(100),lab_role:z.enum(membershipRoles),scholar_author_id:z.string().regex(/^[A-Za-z0-9_-]{6,64}$/).or(z.literal('')).nullable(),bio:z.string().trim().max(5000),public_email:z.boolean(),profile_details:profileDetailsSchema}).strict();
export function signupMetadata(value:z.infer<typeof signupSchema>){return {display_name:value.name,name_en:value.name_en,academic_role:academicTrack(value.lab_role),lab_role:value.lab_role,scholar_author_id:value.scholar_author_id,bio:value.bio,public_email:value.public_email,profile_details:value.profile_details}}
