import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@example.com',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!
)

function currentHHMM(timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone, hour: '2-digit', minute: '2-digit', hour12: false
  }).formatToParts(new Date())
  const hour = parts.find(p => p.type === 'hour')?.value || '00'
  const minute = parts.find(p => p.type === 'minute')?.value || '00'
  return `${hour}:${minute}`
}

Deno.serve(async () => {
  const { data: rows, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('active', true)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  let sent = 0
  const expired: string[] = []
  for (const row of rows || []) {
    const expected = String(row.reminder_time).slice(0, 5)
    if (currentHHMM(row.timezone || 'America/Sao_Paulo') !== expected) continue
    try {
      await webpush.sendNotification({
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth }
      }, JSON.stringify({
        title: 'Ciclo MOB',
        body: 'Hora de registrar suas observações de hoje.',
        url: './',
        tag: 'cycleseed-daily'
      }))
      sent++
    } catch (e: any) {
      if (e?.statusCode === 404 || e?.statusCode === 410) expired.push(row.id)
      else console.error('Push error', row.id, e)
    }
  }

  if (expired.length) await supabase.from('push_subscriptions').delete().in('id', expired)
  return Response.json({ checked: rows?.length || 0, sent, removed: expired.length })
})
