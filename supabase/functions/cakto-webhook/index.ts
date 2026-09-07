import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CAKTO_WEBHOOK_SECRET = Deno.env.get("CAKTO_WEBHOOK_SECRET") || "";
const APP_URL = Deno.env.get("APP_URL") || "";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

function normalizeEmail(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

async function findUserByEmail(email: string) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    if (user) return user;
    if (data.users.length < 1000) break;
  }
  return null;
}

async function ensureUser(email: string, name: string) {
  let user = await findUserByEmail(email);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { name, source: "cakto" }
    });
    if (error) throw error;
    user = data.user;
  }

  const displayName = name || String(user.user_metadata?.name || "").trim() || email.split("@")[0];

  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id: user.id, display_name: displayName }, { onConflict: "id" });

  if (profileError) throw profileError;
  return user;
}

async function sendPasswordSetupEmail(email: string) {
  const { error } = await admin.auth.resetPasswordForEmail(email, {
    redirectTo: APP_URL || undefined
  });
  if (error) console.warn("resetPasswordForEmail:", error.message);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();

    const suppliedSecret = String(payload?.secret || "");
    if (CAKTO_WEBHOOK_SECRET && suppliedSecret !== CAKTO_WEBHOOK_SECRET) {
      return Response.json({ ok: false, error: "invalid webhook secret" }, { status: 401 });
    }

    const event = String(payload?.event || "").trim().toLowerCase();
    const data = payload?.data || {};

    const orderId = data?.id ? String(data.id) : null;
    const refId = data?.refId ? String(data.refId) : null;
    const email = normalizeEmail(data?.customer?.email);
    const name = String(data?.customer?.name || "").trim();

    const subscriptionId =
      data?.subscription?.id
        ? String(data.subscription.id)
        : typeof data?.subscription === "string"
          ? data.subscription
          : null;

    const productId = data?.product?.id ? String(data.product.id) : null;
    const productName = String(data?.product?.name || "").trim() || null;
    const offerId = data?.offer?.id ? String(data.offer.id) : null;
    const offerName = String(data?.offer?.name || "").trim() || null;

    const statusMap: Record<string, string> = {
      purchase_approved: "active",
      subscription_created: "active",
      subscription_renewed: "active",
      subscription_canceled: "canceled",
      subscription_renewal_refused: "past_due",
      refund: "refunded",
      refunded: "refunded",
      chargeback: "chargeback",
      chargedback: "chargeback"
    };

    const activating = new Set([
      "purchase_approved",
      "subscription_created",
      "subscription_renewed"
    ]);

    const status = statusMap[event];
    if (!status) {
      return Response.json({ ok: true, ignored: true, event: event || "unknown" });
    }

    if (event === "purchase_approved" && String(data?.status || "").toLowerCase() !== "paid") {
      return Response.json(
        { ok: false, error: "purchase_approved without paid status" },
        { status: 400 }
      );
    }

    if (!orderId && !subscriptionId) {
      return Response.json(
        { ok: false, error: "missing data.id and subscription id" },
        { status: 400 }
      );
    }

    let user = email ? await findUserByEmail(email) : null;

    if (activating.has(event)) {
      if (!email) {
        return Response.json({ ok: false, error: "missing customer email" }, { status: 400 });
      }
      user = await ensureUser(email, name);
    }

    if (!user) {
      return Response.json({ ok: true, event, status, user: "not-found" });
    }

    const row = {
      user_id: user.id,
      provider: "cakto",
      provider_subscription_id: subscriptionId,
      provider_order_id: orderId,
      provider_ref_id: refId,
      customer_email: email || user.email,
      product_id: productId,
      product_name: productName,
      offer_id: offerId,
      offer_name: offerName,
      status,
      raw_event: payload,
      updated_at: new Date().toISOString()
    };

    let query = admin
      .from("subscriptions")
      .select("id")
      .eq("provider", "cakto");

    query = subscriptionId
      ? query.eq("provider_subscription_id", subscriptionId)
      : query.eq("provider_order_id", orderId);

    const { data: existing, error: existingError } = await query.maybeSingle();
    if (existingError) throw existingError;

    if (existing?.id) {
      const { error } = await admin
        .from("subscriptions")
        .update(row)
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await admin
        .from("subscriptions")
        .insert(row);
      if (error) throw error;
    }

    const firstActivation = activating.has(event) && !existing?.id;

    if (firstActivation && email) {
      await sendPasswordSetupEmail(email);
    }

    return Response.json({
      ok: true,
      event,
      status,
      user_id: user.id,
      order_id: orderId,
      ref_id: refId,
      subscription_id: subscriptionId,
      first_activation: firstActivation
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
});
