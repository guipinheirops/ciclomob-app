import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CAKTO_WEBHOOK_SECRET = Deno.env.get("CAKTO_WEBHOOK_SECRET") || "";
const APP_URL = Deno.env.get("APP_URL") || "";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const pick = (obj:any, paths:string[]) => {
  for (const path of paths) {
    let v:any=obj;
    for (const key of path.split(".")) v=v?.[key];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return null;
};

async function findUserByEmail(email:string) {
  for (let page=1; page<=20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user=data.users.find(u => u.email?.toLowerCase()===email.toLowerCase());
    if (user) return user;
    if (data.users.length < 1000) break;
  }
  return null;
}

async function ensureUser(email:string, name:string) {
  let user=await findUserByEmail(email);
  if (!user) {
    const { data, error }=await admin.auth.admin.createUser({
      email, email_confirm: true, user_metadata: { name, source: "cakto" }
    });
    if (error) throw error;
    user=data.user;
  }
  await admin.from("profiles").upsert({
    id:user.id, display_name:name || user.user_metadata?.name || email.split("@")[0]
  }, { onConflict:"id" });

  // Envia o e-mail para a usuária definir sua própria senha.
  const { error: resetError }=await admin.auth.resetPasswordForEmail(email, {
    redirectTo: APP_URL || undefined
  });
  if (resetError) console.warn("resetPasswordForEmail", resetError.message);
  return user;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed",{status:405});
  try {
    const body=await req.json();
    const supplied=req.headers.get("x-cakto-secret")
      || req.headers.get("x-webhook-secret")
      || pick(body,["secret","webhook.secret","fields.secret"]);
    if (CAKTO_WEBHOOK_SECRET && supplied !== CAKTO_WEBHOOK_SECRET)
      return new Response("Unauthorized",{status:401});

    const event=String(pick(body,["event","event_type","type","data.event","event.custom_id"]) || "");
    const email=String(pick(body,[
      "customer.email","data.customer.email","buyer.email","data.buyer.email",
      "order.customer.email","data.order.customer.email","email"
    ]) || "").trim().toLowerCase();
    const name=String(pick(body,[
      "customer.name","data.customer.name","buyer.name","data.buyer.name",
      "order.customer.name","data.order.customer.name","name"
    ]) || "").trim();

    const subscriptionId=pick(body,["subscription.id","data.subscription.id","subscription_id"]);
    const orderId=pick(body,["order.id","data.order.id","order_id","id"]);
    const productId=pick(body,["product.id","data.product.id","order.product.id","data.order.product.id"]);
    const offerId=pick(body,["offer.id","data.offer.id","order.offer.id","data.order.offer.id"]);

    const activating=["purchase_approved","subscription_created","subscription_renewed"];
    const statusMap:Record<string,string>={
      purchase_approved:"active", subscription_created:"active", subscription_renewed:"active",
      subscription_canceled:"canceled", subscription_renewal_refused:"past_due",
      refund:"refunded", chargeback:"chargeback"
    };
    const status=statusMap[event];
    if (!status) return Response.json({ok:true,ignored:event||"unknown"});

    let user=null;
    if (activating.includes(event)) {
      if (!email) return Response.json({ok:false,error:"customer email missing"},{status:400});
      user=await ensureUser(email,name);
    } else if (email) {
      user=await findUserByEmail(email);
    }

    if (!user) return Response.json({ok:true,event,status,user:"not-found"});

    const row={
      user_id:user.id, provider:"cakto", provider_subscription_id:subscriptionId ? String(subscriptionId) : null,
      provider_order_id:orderId ? String(orderId) : null, customer_email:email || user.email,
      product_id:productId ? String(productId) : null, offer_id:offerId ? String(offerId) : null,
      status, raw_event:body, updated_at:new Date().toISOString()
    };

    let q;
    if (subscriptionId) {
      q=admin.from("subscriptions").upsert(row,{onConflict:"provider,provider_subscription_id"});
    } else {
      // Compras sem subscription_id são atualizadas pelo pedido quando possível.
      const { data:existing }=await admin.from("subscriptions").select("id")
        .eq("provider","cakto").eq("provider_order_id",String(orderId||"")).maybeSingle();
      q=existing?.id
        ? admin.from("subscriptions").update(row).eq("id",existing.id)
        : admin.from("subscriptions").insert(row);
    }
    const { error }=await q;
    if (error) throw error;

    return Response.json({ok:true,event,status,user_id:user.id});
  } catch (e) {
    console.error(e);
    return Response.json({ok:false,error:e instanceof Error?e.message:String(e)},{status:500});
  }
});
