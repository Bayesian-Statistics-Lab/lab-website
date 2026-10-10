import {NextRequest,NextResponse} from 'next/server';
import {revalidatePath,revalidateTag} from 'next/cache';
import {requireAdmin} from '@/lib/supabase';
import {themeSchema} from './theme.dto';
import {createThemeRepository} from './theme.repository';
import {createThemeService} from './theme.service';
export async function getTheme(){
 const admin=await requireAdmin();if(!admin)return NextResponse.json({error:'관리자 권한이 필요합니다.'},{status:401});
 const result=await createThemeService(createThemeRepository(admin.db)).read();
 return NextResponse.json(result.error?{error:'디자인 설정을 불러오지 못했습니다.'}:{data:result.data},{status:result.error?500:200,headers:{'Cache-Control':'private, no-store'}});
}
export async function saveTheme(req:NextRequest){
 const admin=await requireAdmin();if(!admin)return NextResponse.json({error:'관리자 권한이 필요합니다.'},{status:401});
 const parsed=themeSchema.safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:'모든 색상을 6자리 HEX 형식으로 입력해주세요.'},{status:400});
 const result=await createThemeService(createThemeRepository(admin.db)).save(parsed.data);
 if(result.error)return NextResponse.json({error:'디자인 설정을 저장하지 못했습니다.'},{status:500});
 revalidateTag('lab-public');revalidatePath('/','layout');return NextResponse.json({ok:true});
}
