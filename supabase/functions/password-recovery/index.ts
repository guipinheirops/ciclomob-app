import nodemailer from "npm:nodemailer@6.9.16";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL=Deno.env.get("APP_URL")||"https://app.ciclomob.cuidadosdamulher.com.br";
const SMTP_HOST=Deno.env.get("ZOHO_SMTP_HOST")||"smtp.zoho.com";
const SMTP_PORT=Number(Deno.env.get("ZOHO_SMTP_PORT")||"465");
const SMTP_USER=Deno.env.get("ZOHO_SMTP_USER")||"";
const SMTP_PASSWORD=Deno.env.get("ZOHO_SMTP_PASSWORD")||"";
const FROM_EMAIL=Deno.env.get("ZOHO_FROM_EMAIL")||SMTP_USER;
const FROM_NAME=Deno.env.get("ZOHO_FROM_NAME")||"Ciclo MOB";

const admin=createClient(SUPABASE_URL,SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const mailer=nodemailer.createTransport({host:SMTP_HOST,port:SMTP_PORT,secure:SMTP_PORT===465,auth:{user:SMTP_USER,pass:SMTP_PASSWORD}});

const cors={
 "Access-Control-Allow-Origin":"*",
 "Access-Control-Allow-Headers":"content-type",
 "Access-Control-Allow-Methods":"POST, OPTIONS"
};

async function findUser(email:string){
 for(let page=1;page<=20;page++){
  const {data,error}=await admin.auth.admin.listUsers({page,perPage:1000});
  if(error)throw error;
  const user=data.users.find(u=>u.email?.toLowerCase()===email.toLowerCase());
  if(user)return user;
  if(data.users.length<1000)break;
 }
 return null;
}

function html(actionLink:string){
 return `<!doctype html><html><body style="margin:0;background:#f7f2f5;font-family:Arial,Helvetica,sans-serif;color:#241b22"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f2f5;padding:24px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border-radius:24px;overflow:hidden"><tr><td style="padding:30px 24px 14px;text-align:center"><img src="${APP_URL}/icons/logo-ciclo-mob.png" width="58" alt="Ciclo MOB" style="display:block;margin:0 auto 10px"><div style="font-size:26px;font-weight:700">Ciclo MOB</div><div style="font-size:14px;color:#7d6676;margin-top:5px">Observe. Conheça. Cuide.</div></td></tr><tr><td style="padding:18px 24px 8px"><h1 style="margin:0 0 14px;font-size:29px;line-height:1.15;color:#6f4e67">Redefina sua senha</h1><p style="font-size:16px;line-height:1.6;margin:0 0 12px">Recebemos uma solicitação para redefinir a senha da sua conta Ciclo MOB.</p><p style="font-size:16px;line-height:1.6;margin:0 0 20px">Toque no botão abaixo para criar uma nova senha com segurança.</p></td></tr><tr><td style="padding:0 24px 24px"><a href="${actionLink}" style="display:block;background:#6f4e67;color:#fff;text-decoration:none;text-align:center;font-weight:700;font-size:17px;padding:16px 18px;border-radius:14px">Redefinir minha senha →</a><div style="text-align:center;color:#8b7886;font-size:12px;line-height:1.5;margin-top:12px">Este link é seguro e válido por tempo limitado.</div></td></tr><tr><td style="padding:18px 24px 28px;border-top:1px solid #eee4ea"><p style="font-size:13px;line-height:1.6;margin:0">Se você não solicitou a redefinição, ignore este e-mail. Sua senha atual continuará válida.</p><p style="font-size:12px;color:#8b7886;margin:18px 0 0">Ciclo MOB por Cuidados da Mulher</p></td></tr></table></td></tr></table></body></html>`;
}

Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return new Response("Method not allowed",{status:405,headers:cors});
 try{
  const body=await req.json().catch(()=>({}));
  const email=String(body?.email||"").trim().toLowerCase();
  if(!email||!email.includes("@"))return Response.json({ok:true},{headers:cors});

  const user=await findUser(email);
  if(user){
   const {data,error}=await admin.auth.admin.generateLink({
    type:"recovery",
    email,
    options:{redirectTo:`${APP_URL}?setup_password=1`}
   });
   if(error)throw error;
   const link=data?.properties?.action_link;
   if(!link)throw new Error("Não foi possível gerar o link de recuperação.");
   if(!SMTP_USER||!SMTP_PASSWORD)throw new Error("Configuração de e-mail indisponível.");
   await mailer.sendMail({
    from:`${FROM_NAME} <${FROM_EMAIL}>`,
    to:email,
    subject:"Redefina sua senha do Ciclo MOB",
    html:html(link),
    text:`Redefina sua senha do Ciclo MOB: ${link}`
   });
  }

  // Always return success to avoid exposing whether the account exists.
  return Response.json({ok:true},{headers:cors});
 }catch(error){
  console.error(error);
  return Response.json({ok:false,error:"Não foi possível enviar o e-mail de recuperação. Tente novamente em alguns minutos."},{status:500,headers:cors});
 }
});
