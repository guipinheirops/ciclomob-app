import webpush from "npm:web-push@3.6.7";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL=Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY=Deno.env.get("VAPID_PUBLIC_KEY")||"";
const VAPID_PRIVATE_KEY=Deno.env.get("VAPID_PRIVATE_KEY")||"";
const VAPID_SUBJECT=Deno.env.get("VAPID_SUBJECT")||"mailto:contato@cuidadosdamulher.com.br";
const CRON_SECRET=Deno.env.get("REMINDER_CRON_SECRET")||"";

const admin=createClient(SUPABASE_URL,SERVICE_ROLE_KEY,{auth:{persistSession:false}});
webpush.setVapidDetails(VAPID_SUBJECT,VAPID_PUBLIC_KEY,VAPID_PRIVATE_KEY);

function localParts(timeZone:string){
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date());
  const get=(type:string)=>parts.find(p=>p.type===type)?.value||"";
  return {date:`${get("year")}-${get("month")}-${get("day")}`,time:`${get("hour")}:${get("minute")}`};
}

Deno.serve(async(req)=>{
  if(req.method!=="POST")return new Response("Method not allowed",{status:405});
  if(CRON_SECRET&&req.headers.get("x-cron-secret")!==CRON_SECRET)return new Response("Unauthorized",{status:401});

  const {data:subs,error}=await admin.from("push_subscriptions").select("*").eq("active",true);
  if(error)throw error;

  let sent=0,skipped=0,expired=0,failed=0;
  for(const s of subs||[]){
    try{
      const tz=s.timezone||"America/Sao_Paulo";
      const local=localParts(tz);
      const target=String(s.reminder_time||"20:30:00").slice(0,5);
      if(local.time!==target||s.last_notified_local_date===local.date){skipped++;continue}

      const subscription={endpoint:s.endpoint,keys:{p256dh:s.p256dh,auth:s.auth}};
      const payload=JSON.stringify({
        title:"Ciclo MOB",
        body:"Hora do seu registro diário. Como foi sua observação hoje?",
        icon:"https://app.ciclomob.cuidadosdamulher.com.br/icons/icon-192.png",
        badge:"https://app.ciclomob.cuidadosdamulher.com.br/icons/icon-192.png",
        tag:"ciclo-mob-reminder",
        data:{url:"https://app.ciclomob.cuidadosdamulher.com.br/"}
      });

      await webpush.sendNotification(subscription,payload);
      await admin.from("push_subscriptions").update({last_notified_local_date:local.date,updated_at:new Date().toISOString()}).eq("id",s.id);
      sent++;
    }catch(err){
      const status=Number((err as any)?.statusCode||0);
      if(status===404||status===410){
        await admin.from("push_subscriptions").update({active:false,updated_at:new Date().toISOString()}).eq("id",s.id);
        expired++;
      }else{
        console.error("push failed",s.id,err);
        failed++;
      }
    }
  }
  return Response.json({ok:true,sent,skipped,expired,failed});
});
