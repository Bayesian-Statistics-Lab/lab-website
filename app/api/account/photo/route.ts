import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { currentAccount, privilegedDb } from '@/lib/supabase';
import { ownPhotoPath, photoLimit, photoTypes, photoSignature } from '@/lib/profile-photo';
import { revalidatePath, revalidateTag } from 'next/cache';

const upload = z.object({ name: z.string().min(1).max(255), type: z.enum(photoTypes), size: z.number().int().min(1).max(photoLimit) });
const headers = { 'Cache-Control': 'private, no-store' };
async function context() {
  const account = await currentAccount();
  if (!account) return { error: '로그인이 필요합니다.', status: 401 } as const;
  const { data: member } = await account.db.from('members').select('id').eq('user_id', account.user.id).maybeSingle();
  if (!member) return { error: '계정에 연결된 구성원 프로필이 없습니다. 관리자에게 문의해주세요.', status: 409 } as const;
  const service = privilegedDb();
  if (!service) return { error: '사진 저장 연결을 확인할 수 없습니다. 관리자에게 문의해주세요.', status: 503 } as const;
  return { account, member, service };
}
export async function POST(req: NextRequest) {
  const ctx = await context();
  if ('error' in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status, headers });
  const parsed = upload.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'JPG, PNG, WebP 이미지 중 5MB 이하 파일을 선택해주세요.' }, { status: 400, headers });
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[parsed.data.type];
  const path = `${ctx.account.user.id}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await ctx.service.storage.from('lab-media').createSignedUploadUrl(path);
  if (error || !data) return NextResponse.json({ error: '사진 업로드를 준비하지 못했습니다. 잠시 후 다시 시도해주세요.' }, { status: 503, headers });
  return NextResponse.json({ path: data.path, token: data.token }, { headers });
}
export async function PATCH(req: NextRequest) {
  const ctx = await context();
  if ('error' in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status, headers });
  const parsed = z.object({ path: z.string().max(128).nullable() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success || (parsed.data.path && !ownPhotoPath(ctx.account.user.id, parsed.data.path)))
    return NextResponse.json({ error: '본인이 업로드한 사진만 저장할 수 있습니다.' }, { status: 400, headers });
  const path = parsed.data.path;
  if (path) {
    const bucket = ctx.service.storage.from('lab-media');
    const { data: info, error: infoError } = await bucket.info(path);
    const size = info?.size ?? info?.metadata?.size ?? 0;
    const mime = info?.contentType || info?.metadata?.mimetype || '';
    if (infoError || !info || size < 1 || size > photoLimit || !photoTypes.includes(mime as typeof photoTypes[number]))
      return NextResponse.json({ error: '업로드한 사진의 형식 또는 크기를 확인해주세요.' }, { status: 400, headers });
    const { data: file, error } = await bucket.download(path);
    if (error || !file || file.size > photoLimit || !photoSignature(new Uint8Array(await file.slice(0,12).arrayBuffer()), mime))
      return NextResponse.json({ error: '올바른 이미지 파일을 선택해주세요.' }, { status: 400, headers });
  }
  const photo_url = path ? '/api/media/' + path : null;
  // This update is always scoped to the authenticated member, never a caller-supplied member ID.
  const { error } = await ctx.service.from('members').update({ photo_url }).eq('id', ctx.member.id).eq('user_id', ctx.account.user.id);
  if (error) return NextResponse.json({ error: '사진을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.' }, { status: 503, headers });
  revalidateTag('lab-public'); revalidatePath('/people'); revalidatePath('/people/' + ctx.member.id); revalidatePath('/account');
  return NextResponse.json({ ok: true, photo_url }, { headers });
}
