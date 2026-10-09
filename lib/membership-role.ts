export const membershipRoles=['Masters','PhD','Undergraduate','Alumni','Postdoc','Researcher'] as const;
// The existing academic track constraint remains compatible with older databases.
// lab_role stores the actual lab position; only an administrator can publish it.
export function academicTrack(role:string){return role==='Postdoc'?'PhD':role==='Researcher'?'Masters':role}
export function requestedLabRole(metadata:Record<string,unknown>){const role=metadata.lab_role;return typeof role==='string'&&membershipRoles.some(value=>value===role)?role:null}
