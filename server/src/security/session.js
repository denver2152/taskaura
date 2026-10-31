export function isSessionVersionCurrent(tokenVersion,currentVersion){
  return Number(tokenVersion??0)===Number(currentVersion||0);
}
