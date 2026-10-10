import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/supabase';
import { changePublicationStatusSchema, deletePublicationsSchema } from './publication.dto';
import { createPublicationRepository } from './publication.repository';
import { createPublicationService } from './publication.service';

function invalidatePublicContent() {
  revalidateTag('lab-public');
  revalidatePath('/', 'layout');
}

export async function changePublicationStatus(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
  const parsed = changePublicationStatusSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: '논문을 확인해주세요.' }, { status: 400 });
  const service = createPublicationService(createPublicationRepository(admin.db));
  const result = await service.changeStatus(parsed.data);
  if (result.kind === 'failed') return NextResponse.json({ error: '공개 상태를 변경하지 못했습니다.' }, { status: 400 });
  // A summary failure still changes the paper: invalidate before returning the error.
  invalidatePublicContent();
  return NextResponse.json(result.summaryUpdated ? { data: result.publication } : {
    error: '논문 상태는 변경했지만 요약 상태를 갱신하지 못했습니다. 다시 시도해주세요.',
  }, { status: result.summaryUpdated ? 200 : 500 });
}

export async function deleteSelectedPublications(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
  const parsed = deletePublicationsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: '삭제할 논문을 선택해주세요.' }, { status: 400 });
  const service = createPublicationService(createPublicationRepository(admin.db));
  const result = await service.deleteSelected(parsed.data);
  if (result.kind === 'failed') return NextResponse.json({ error: '논문을 삭제하지 못했습니다.' }, { status: 500 });
  if (result.kind === 'none') return NextResponse.json({ error: '삭제된 논문이 없습니다. 권한과 목록을 확인해주세요.' }, { status: 409 });
  invalidatePublicContent();
  const warning = !result.summaryCleaned ? '논문은 삭제됐지만 남은 요약 정보를 정리하지 못했습니다.' :
    result.partial ? '일부 논문은 이미 삭제되었거나 접근할 수 없습니다.' : '';
  return NextResponse.json({ deleted: result.deleted, warning });
}
