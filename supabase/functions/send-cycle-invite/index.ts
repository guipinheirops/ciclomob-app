import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const auth = req.headers.get('Authorization') || ''
  const url = Deno.env.get('SUPABASE_URL')!
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!
  const resendKey = Deno.env.get('RESEND_API_KEY')
  const from = Deno.env.get('INVITE_FROM_EMAIL') || 'Ciclo MOB <onboarding@resend.dev>'
  if (!resendKey) return Response.json({ error: 'RESEND_API_KEY não configurada' }, { status: 500 })

  const client = createClient(url, anon, { global: { headers: { Authorization: auth } } })
  const { data: userData } = await client.auth.getUser()
  if (!userData.user) return Response.json({ error: 'Não autenticado' }, { status: 401 })

  const { invitation_id, app_url } = await req.json()
  const { data: inv, error } = await client.from('cycle_invitations')
    .select('id,invitee_email,role,token,expires_at,cycles(name)')
    .eq('id', invitation_id).single()
  if (error || !inv) return Response.json({ error: error?.message || 'Convite não encontrado' }, { status: 404 })

  const link = `${String(app_url).replace(/\/$/, '')}?invite=${inv.token}`
  const role = inv.role === 'instructor' ? 'instrutora' : 'parceiro(a)'
  const cycleName = (inv as any).cycles?.name || 'um ciclo'
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from, to: [inv.invitee_email], subject: 'Convite para acompanhar um ciclo no Ciclo MOB',
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto"><h2>Você recebeu um convite</h2><p>Você foi convidado(a) como <strong>${role}</strong> para acompanhar <strong>${cycleName}</strong> no Ciclo MOB.</p><p><a href="${link}" style="display:inline-block;padding:12px 18px;background:#6F4E67;color:white;text-decoration:none;border-radius:10px">Abrir convite</a></p><p style="color:#777;font-size:12px">O convite expira em ${new Date(inv.expires_at).toLocaleDateString('pt-BR')}.</p></div>`
    })
  })
  const body = await res.text()
  return new Response(body, { status: res.status, headers: { 'Content-Type': 'application/json' } })
})
