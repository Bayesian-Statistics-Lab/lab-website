export type Entry = {title:string;date:string;excerpt?:string;category?:string;slug?:string};
export const site = {ko:'베이즈통계 연구실',en:'Bayesian Statistics Laboratory',university:'전남대학교 통계학과',professor:'이광민',email:'klee564@jnu.ac.kr',phone:'062-530-3496',room:'자연과학대학 1호관 210호',address:'광주광역시 북구 용봉로 77, 전남대학교'};
export const nav = [
 {title:'소개',href:'/about/greetings',links:[['인사말','/about/greetings'],['연구실 소개','/about/introduction'],['연혁','/about/history'],['조직도','/about/organization'],['구성원','/people']]},
 {title:'연구 분야',href:'/research',links:[['연구 분야','/research'],['연구 프로젝트','/centers']]},
 {title:'연구지원',href:'/support/regulations',links:[['규정','/support/regulations'],['서식','/support/forms']]},
 {title:'논문',href:'/publications',links:[['논문 목록','/publications']]},
 {title:'공지사항',href:'/notice',links:[]},
 {title:'연구실 소식',href:'/news',links:[['전체 소식','/news'],['연구성과','/news/research'],['학술활동','/news/academic'],['행사','/news/events']]},
 {title:'오시는 길',href:'/location',links:[]}
];
export const sections:Record<string,{title:string;lead:string;body:string}> = {
 'about/greetings':{title:'인사말',lead:'Bayesian Statistics Laboratory',body:'전남대학교 통계학과 이광민 교수님 연구실 홈페이지입니다. 연구실 소개 인사말은 관리자가 직접 작성하여 게시할 수 있습니다.'},
 'about/introduction':{title:'연구실 소개',lead:'Statistics, Uncertainty, Discovery',body:'베이즈 통계학을 중심으로 데이터에 내재된 불확실성을 연구합니다. 연구실의 비전과 소개글은 관리자 페이지에서 업데이트할 수 있습니다.'},
 'about/history':{title:'연혁',lead:'Our History',body:'연구실 연혁은 관리자 페이지에서 연도별로 등록할 수 있습니다. 확인되지 않은 이력은 표시하지 않습니다.'},
 'about/organization':{title:'조직도',lead:'Organization',body:'교수·대학원생·졸업생 등의 연구실 구성 정보를 확인할 수 있습니다.'},
 'research':{title:'연구 분야',lead:'Research Areas',body:'고차원 공분산에 대한 베이즈 추론, Envelope model의 베이즈 추론, 이산형 반응변수를 갖는 고차원 회귀모형 추론, 최적 포트폴리오 추정을 연구 분야로 소개합니다.'},
 'centers':{title:'연구 프로젝트',lead:'Research Projects',body:'진행 중인 연구 과제와 프로젝트를 관리자가 등록하는 페이지입니다.'},
 'support/regulations':{title:'규정',lead:'Research Support',body:'연구실 운영 규정을 등록하고 열람할 수 있습니다.'},
 'support/forms':{title:'서식',lead:'Forms & Downloads',body:'연구실에서 사용하는 서식과 첨부 자료를 등록할 수 있습니다.'},
 'news/research':{title:'연구성과',lead:'Research Highlights',body:'연구 논문 및 연구 성과에 대한 소식을 모아볼 수 있습니다.'},
 'news/academic':{title:'학술활동',lead:'Academic Activities',body:'세미나, 학회 발표 등 학술 활동을 소개합니다.'},
 'news/events':{title:'행사',lead:'Events',body:'연구실 행사와 주요 일정을 소개합니다.'}
};
