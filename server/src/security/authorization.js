export function mayChangeMemberRole(actorRole,targetRole,nextRole){
  if(!['owner','admin'].includes(actorRole)||targetRole==='owner')return false;
  if(targetRole==='admin'&&actorRole!=='owner')return false;
  return nextRole!=='admin'||actorRole==='owner';
}

export function mayRemoveMember(actorRole,targetRole){
  if(!['owner','admin'].includes(actorRole)||targetRole==='owner')return false;
  return targetRole!=='admin'||actorRole==='owner';
}

export function mayInviteWithRole(actorRole,inviteRole){
  if(!['owner','admin'].includes(actorRole))return false;
  return inviteRole!=='admin'||actorRole==='owner';
}
