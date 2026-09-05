# Ciclo MOB PWA v16

PWA mobile-first para organização do acompanhamento do ciclo, com identidade própria e recursos de autenticação, notificações e relatórios.

## Novidades da v3

- Acesso real com Supabase Auth: autenticar contas existentes, recuperar senha, persistir sessão e sair
- Modo demonstração para testar sem configurar backend
- Web Push com Push API + Service Worker + VAPID
- Assinatura de push vinculada ao usuário no Supabase com RLS
- Edge Function `send-reminders` para disparar lembretes com o PWA fechado
- Horário e timezone salvos por assinatura
- Notificação de teste no próprio dispositivo
- Geração direta de relatório PDF com jsPDF
- Exportação CSV e backup JSON
- Novo dark mode roxo-amarronzado/ameixa-cacau

## Recursos preservados

- Registro diário de sensação, aparência, sangramento, PBI manual e anotações
- Edição e exclusão
- Calendário mensal
- Estimativa organizacional de ciclo e fases
- Gráfico descritivo
- Linha do tempo
- Área educativa e progresso
- Compartilhamento conceitual e chat local
- PWA instalável e cache offline

## Rodar localmente

```bash
cd cyclecare-pwa
python3 -m http.server 4174
```

Abra `http://localhost:4174`.

Sem configurar o Supabase, use **Usar modo demonstração**.

## Ativar login e push em produção

Consulte `SETUP_SUPABASE.md`.

## Aviso de produto

As estimativas de calendário e fases são apenas organizacionais/educativas. O app não classifica automaticamente fertilidade, não deve ser usado isoladamente para evitar ou buscar gravidez e não substitui orientação qualificada ou atendimento de saúde.

## Ajustes de interface v4
- Menu inferior com 6 colunas, ícones maiores e rótulos sem quebra de linha.
- Modo de aparência movido para Perfil; botão de instalação removido da interface.
- Linha do tempo com ações de editar/excluir por ícones alinhados à direita.
- Módulos de Aprender com telas internas completas e botão voltar no cabeçalho.

## Novidades da v10

- Múltiplos ciclos independentes com seletor e criação de novos ciclos.
- Migração automática dos registros locais existentes para o ciclo atual.
- Sincronização de ciclos e registros com Supabase quando autenticado.
- Convites reais por ciclo para parceiro(a) e instrutora, com token, expiração, aceitação e revogação.
- Acesso compartilhado em modo somente leitura protegido por RLS.
- Envio opcional de convite por e-mail via Edge Function + Resend.
- Gráfico adaptativo: as barras ocupam toda a largura do card, sem reservar colunas vazias.


## Acesso na v10

A interface pública de criação de conta foi removida. O app mantém apenas acesso por e-mail/senha para contas previamente provisionadas no Supabase, recuperação de senha e modo demonstração.


## v14
- Login mobile redesenhado.
- Primeiro login direciona para configuração do Perfil após consentimento.
- Estimativa organizacional só aparece após configuração do ciclo.
- Sino na Home abre a tela Lembretes e exibe indicador de notificação não lida.
- Botão de backup simplificado para “Baixar backup”.

## v18 — visualização Padrão MOB
A aba Gráfico agora possui dois modos: **Observações** (gráfico anterior) e **Padrão MOB** (selos manuais por dia). O registro diário ganhou os campos opcionais `Selo do gráfico` e `Marcação especial` (Pico, +1, +2, +3). Para Supabase, execute novamente `supabase/schema.sql` para adicionar `chart_stamp` e `peak_marker`.


## v23
- Gráfico MOB sem cabeçalho mensal, com Dia do ciclo destacado antes do selo, tipografia ampliada e cards brancos no tema claro.
- Botão flutuante de adicionar removido.
- Lembretes adicionado ao menu principal após Aprender.
