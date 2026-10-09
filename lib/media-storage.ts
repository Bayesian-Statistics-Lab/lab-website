import {privilegedDb} from './supabase';
export async function allowGifUploads(){
 const db=privilegedDb();if(!db)throw Error('GIF 업로드 저장소 연결을 확인해주세요.');
 const {data,error}=await db.storage.getBucket('lab-media');if(error||!data)throw Error('이미지 저장소를 확인할 수 없습니다.');
 const types=data.allowed_mime_types;if(!types?.length||types.includes('image/gif'))return;
 const {error:updateError}=await db.storage.updateBucket('lab-media',{public:data.public,fileSizeLimit:data.file_size_limit,allowedMimeTypes:[...types,'image/gif']});
 if(updateError)throw Error('GIF 형식을 저장소에 등록하지 못했습니다.');
}
