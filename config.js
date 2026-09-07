// Configuração pública do projeto Supabase do Ciclo MOB.
// A publishable key pode ficar no frontend; a service_role NUNCA deve ser colocada aqui.
window.CYCLESEED_CONFIG = {
  SUPABASE_URL: 'https://heglcvgpverqfmqpdyok.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_jkZYWhDMKTbq6hKph4Ml-g_PKrzkUJd',
  // Será configurada na etapa de Web Push.
  VAPID_PUBLIC_KEY: 'BPJPG3RH9lSPMkFjHKYF8JM4AHZLJajmXnvMBy62D_oKVstlDNk3iwpubRExVzqWR4P0oboMFU184jYdE0kxVFA',
  // Será configurada quando publicarmos a Edge Function de convites por e-mail.
  INVITE_EMAIL_FUNCTION: ''
};
