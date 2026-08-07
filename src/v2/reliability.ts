export async function withTimeout<T>(promise:Promise<T>,milliseconds=15000,label="Request"):Promise<T>{let timer:ReturnType<typeof setTimeout>|undefined;try{return await Promise.race([promise,new Promise<T>((_,reject)=>{timer=setTimeout(()=>reject(new Error(`${label} timed out. Check your connection and try again.`)),milliseconds);})]);}finally{if(timer)clearTimeout(timer);}}

export async function retry<T>(operation:()=>Promise<T>,attempts=2){let last:unknown;for(let index=0;index<attempts;index++){try{return await operation();}catch(error){last=error;if(index<attempts-1)await new Promise(resolve=>setTimeout(resolve,500*(index+1)));}}throw last;}

const errorCode=(error:unknown)=>typeof error==="object"&&error&&"code"in error?String(error.code).toLowerCase():"";

export const messageFor=(error:unknown)=>{
  const code=errorCode(error);
  if(code.includes("storage/unauthorized"))return"We couldn't add that photo. Your other changes are still here—confirm you still belong to this Space and try again.";
  if(code.includes("permission-denied"))return"This isn't available to this account. Your access may have changed—ask the Space owner to check your invitation or membership.";
  if(code.includes("unauthenticated")||code.includes("user-token-expired"))return"Your sign-in needs a quick refresh. Sign in again, then retry—your draft is still here.";
  if(code.includes("unavailable")||code.includes("network-request-failed"))return"You're offline or SideQuest can't connect right now. Reconnect and try again—your draft is still here.";
  if(code.includes("not-found"))return"We couldn't find that Space or Quest. It may have been moved or removed.";
  if(code.includes("deadline-exceeded")||code.includes("resource-exhausted"))return"SideQuest is taking longer than usual. Wait a moment, then try again—nothing was saved twice.";
  if(code.includes("email-already"))return"That email already has an account. Try signing in instead.";
  if(code.includes("invalid-credential"))return"That email and password don't match an account yet.";
  const message=error instanceof Error?error.message:"";
  if(/invite/i.test(message)&&/(expired|invalid|not found)/i.test(message))return"This invitation is no longer available. Ask the Space owner for a new one.";
  if(/timed out/i.test(message))return"SideQuest is taking longer than expected. Check your connection and try again—your draft is still here.";
  return"Something interrupted that. Please try again—anything you entered is still here.";
};
