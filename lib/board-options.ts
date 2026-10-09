import {sections} from './content';
export const boardOptions=[['notice','공지사항'],['news','연구실 소식'],['research','연구성과'],['academic','학술활동'],['events','행사'],...Object.entries(sections).filter(([key])=>!key.startsWith('news/')).map(([key,value])=>['page:'+key,value.title+' · 페이지 게시글'])];
