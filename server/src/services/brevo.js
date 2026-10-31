export async function sendVerificationCode({email, code, purpose = 'verification'}) {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) {
    throw Object.assign(new Error('Email verification is not configured. Set BREVO_API_KEY and BREVO_SENDER_EMAIL.'), {status: 503});
  }

  const senderName = process.env.BREVO_SENDER_NAME || 'TASKAURA';
  const recovery = purpose === 'password-reset';
  const subject = recovery ? 'Your TASKAURA password reset code' : 'Your TASKAURA verification code';
  const heading = recovery ? 'Reset your password' : 'Verify your email';
  const instruction = recovery
    ? 'Enter this code to reset your password. It expires in 10 minutes.'
    : 'Enter this code to finish creating your account. It expires in 10 minutes.';
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {accept: 'application/json', 'content-type': 'application/json', 'api-key': apiKey},
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      sender: {name: senderName, email: senderEmail},
      to: [{email}],
      subject,
      textContent: `${heading}: ${code}. ${instruction} If you did not request this, you can ignore this email.`,
      htmlContent: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#20211f"><div style="font-size:13px;font-weight:700;letter-spacing:2px;color:#526b57">TASKAURA</div><h1 style="font-size:22px;margin:24px 0 8px">${heading}</h1><p style="color:#666">${instruction}</p><p style="font-size:32px;font-weight:700;letter-spacing:8px;padding:18px;background:#f4f5f1;border-radius:8px;text-align:center">${code}</p><p style="font-size:12px;color:#777">If you did not request this, you can ignore this email.</p></div>`
    })
  });

  if (!response.ok) {
    let detail = '';
    try {
      const result = await response.json();
      detail = [result.code, result.message].filter(Boolean).join(': ');
    } catch {}
    detail = detail.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]').replace(/\s+/g, ' ').slice(0, 400);
    console.error(`Brevo send failed with HTTP ${response.status}${detail ? `: ${detail}` : ''}`);
    throw Object.assign(new Error('Brevo rejected the verification email. Check the API server terminal for its error code and message.'), {status: 502});
  }
}
export async function sendWorkspaceInvitation({email,workspaceName,role,inviteUrl}){
  const apiKey=process.env.BREVO_API_KEY,senderEmail=process.env.BREVO_SENDER_EMAIL;
  if(!apiKey||!senderEmail)throw new Error('Transactional email is not configured.');
  const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const safeWorkspace=escape(workspaceName),safeRole=escape(role),safeUrl=escape(inviteUrl);
  const response=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{accept:'application/json','content-type':'application/json','api-key':apiKey},signal:AbortSignal.timeout(10000),body:JSON.stringify({sender:{name:process.env.BREVO_SENDER_NAME||'TASKAURA',email:senderEmail},to:[{email}],subject:`Invitation to join ${String(workspaceName).replace(/[\r\n]/g,' ').slice(0,80)} on TASKAURA`,textContent:`You have been invited to join ${workspaceName} as a ${role}. Accept the invitation: ${inviteUrl}`,htmlContent:`<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#20211f"><div style="font-size:13px;font-weight:700;letter-spacing:2px;color:#526b57">TASKAURA</div><h1 style="font-size:22px;margin:24px 0 8px">You’re invited</h1><p>You’ve been invited to join <b>${safeWorkspace}</b> as a ${safeRole}.</p><p><a href="${safeUrl}">Accept invitation</a></p><p>This link expires in seven days. If you weren’t expecting it, you can ignore this email.</p></div>`})});
  if(!response.ok){let detail='';try{const result=await response.json();detail=[result.code,result.message].filter(Boolean).join(': ')}catch{}detail=detail.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[email]').replace(/\s+/g,' ').slice(0,400);console.error(`Brevo invitation send failed with HTTP ${response.status}${detail?`: ${detail}`:''}`);throw Object.assign(new Error('Could not send the workspace invitation email.'),{status:502});}
}