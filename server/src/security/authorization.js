export function mayChangeMemberRole(actorRole,targetRole,nextRole){
  if(!['owner','admin'].includes(actorRole)||targetRole==='owner')return false;
  return nextRole!=='admin'||actorRole==='owner';
}
