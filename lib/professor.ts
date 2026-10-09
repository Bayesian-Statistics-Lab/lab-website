// Institutional profile and SNU Bayesian Statistics Laboratory alumni page.
// https://stat.jnu.ac.kr/stat/8942/subview.do
// https://snubayes.wordpress.com/alumni/
export const professor={id:'professor',name:'이광민',name_en:'Kwangmin Lee',role:'Professor',email:'klee564@jnu.ac.kr',photo_url:'/assets/people/kwangmin-lee.webp',scholar_author_id:'',bio:'전남대학교 통계학과 조교수',sort_order:1};
export const professorCareer=[['현재','전남대학교 통계학과 조교수'],['학력 · 2021','서울대학교 통계학 박사'],['박사학위 논문','Post-Processed Posteriors for High-Dimensional Covariances']];
export const memberGroups=[['Professor','교수'],['Postdoc','박사후연구원'],['PhD','박사과정'],['Masters','석사과정'],['Undergraduate','학부연구생'],['Alumni','졸업생'],['Researcher','연구원']];
export function groupRole(role:string){return role==='Principal Investigator'?'Professor':memberGroups.some(([key])=>key===role)?role:'Researcher'}

export const professorBiography='## Research Interests\nBayesian Inference · High-dimensional Covariance · Envelope Models · Statistical Applications\n\n## Education & Experience\n현재 | 전남대학교 통계학과 조교수\n2021 | 서울대학교 통계학 박사\n박사학위 논문 | Post-Processed Posteriors for High-Dimensional Covariances';
