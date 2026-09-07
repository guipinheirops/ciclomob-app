const launchSplashStarted=performance.now();function dismissLaunchSplash(){const s=document.querySelector('#launchSplash');if(!s)return;const w=Math.max(0,850-(performance.now()-launchSplashStarted));setTimeout(()=>{s.classList.add('is-hidden');setTimeout(()=>s.remove(),320)},w)}
const app = document.querySelector('#app');
const title = document.querySelector('#pageTitle');
const backBtn = document.querySelector('#backBtn');
const homeBellBtn = document.querySelector('#homeBellBtn');
const nav = [...document.querySelectorAll('.nav-item')];
const TODAY = new Date().toISOString().slice(0,10);
const authShell = document.querySelector('#authShell');
const appShell = document.querySelector('#appShell');
const config = window.CYCLESEED_CONFIG || {};
const supabaseReady = Boolean(config.SUPABASE_URL && config.SUPABASE_PUBLISHABLE_KEY && window.supabase?.createClient);
const db = supabaseReady ? window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}) : null;
const CONSENT_VERSION='v1';

const lessons = [
  {id:'cycles',title:'1. Entenda os ciclos',time:'5 min',text:'Comece entendendo que o acompanhamento é construído ciclo a ciclo e que cada novo ciclo possui seu próprio histórico.',sections:[
    ['O método é acompanhado por ciclos','No Ciclo MOB, as observações ficam organizadas dentro de ciclos. Isso permite revisar a sequência completa de registros sem misturar informações de períodos diferentes.'],
    ['O primeiro dia é a referência','Para organizar o acompanhamento no aplicativo, o primeiro dia de sangramento menstrual informado é usado como Dia 1 e início de um novo ciclo. Registrar corretamente essa data é essencial para que calendário, histórico e duração do ciclo permaneçam coerentes.'],
    ['Quando um novo ciclo começa','Ao iniciar um novo ciclo, o anterior é encerrado e preservado como histórico. Se houver dúvida sobre como identificar ou registrar o início do ciclo segundo o Método de Ovulação Billings, confirme com uma instrutora qualificada.']
  ]},
  {id:'observe',title:'2. Aprenda o que observar',time:'6 min',text:'Diferencie sensação, aparência e sangramento antes de começar a interpretar o histórico.',sections:[
    ['Sensação','Registre aquilo que você percebe durante as atividades do dia, usando uma descrição consistente e fiel ao que foi percebido.'],
    ['Aparência','A aparência corresponde ao aspecto observado. Mantenha sensação e aparência em campos separados para que a sequência do ciclo fique clara.'],
    ['Sangramento','Registre o sangramento diariamente. No começo de um novo ciclo, confira com atenção a data usada como primeiro dia, pois ela será a referência daquele ciclo no aplicativo.']
  ]},
  {id:'routine',title:'3. Registre todos os dias',time:'5 min',text:'Crie uma rotina para construir uma sequência diária confiável dentro de cada ciclo.',sections:[
    ['Escolha um horário','Defina um horário realista para revisar o dia. O lembrete diário pode ser configurado na tela Lembretes.'],
    ['Registre no mesmo dia','Faça o registro enquanto as percepções ainda estão recentes. Evite reconstruir vários dias apenas pela memória.'],
    ['Mantenha cada ciclo completo','A utilidade do histórico depende da sequência. Procure registrar desde o primeiro dia do ciclo e continuar diariamente até o início do próximo.']
  ]},
  {id:'pbi',title:'4. Conheça o PBI',time:'6 min',text:'Entenda o que significa Padrão Básico de Infertilidade e por que ele não deve ser marcado sem aprendizado adequado.',sections:[
    ['O que é PBI','PBI significa Padrão Básico de Infertilidade. No app, a marcação é manual e serve apenas para registrar uma identificação feita pela usuária conforme seu aprendizado do método.'],
    ['Não conclua pelo aplicativo','O Ciclo MOB não identifica PBI, fertilidade ou infertilidade automaticamente. As informações do gráfico são descritivas.'],
    ['Aprenda com orientação','A identificação e aplicação das regras do Método de Ovulação Billings devem ser aprendidas com orientação qualificada, especialmente antes de usar os registros para decisões reprodutivas.']
  ]},
  {id:'review',title:'5. Revise o ciclo completo',time:'7 min',text:'Use o gráfico, o calendário e o resumo para revisar a sequência de observações do ciclo selecionado.',sections:[
    ['Calendário','Use o calendário para localizar dias registrados e conferir onde aquele registro se encontra dentro do ciclo.'],
    ['Gráfico','Revise os registros em sequência, observando dia do ciclo, selo, sensação, aparência, sangramento e Pico. O app não interpreta fertilidade automaticamente.'],
    ['Resumo','Use o resumo para consultar uma visão descritiva das categorias registradas no ciclo selecionado.']
  ]},
  {id:'stamps',title:'6. Conheça os selos do gráfico',time:'5 min',text:'Aprenda o significado visual dos selos usados para organizar os registros no Gráfico MOB.',sections:[
    ['• Vermelho','Usado no gráfico para identificar registros marcados manualmente como sangramento.'],
    ['I Verde','Usado para a marcação manual de padrão seco conforme o aprendizado do método.'],
    ['O Branco','Usado para registros associados à observação de muco conforme a classificação manual da usuária.'],
    ['= Amarelo','Usado para uma marcação manual de padrão conforme o aprendizado e a orientação recebida.'],
    ['? Sem selo','Indica que aquele registro ainda não recebeu uma classificação visual no gráfico.']
  ]},
  {id:'sharing',title:'7. Compartilhe com responsabilidade',time:'4 min',text:'Use o histórico como apoio ao acompanhamento com parceiro(a), instrutora ou profissional.',sections:[
    ['Você controla o acesso','Compartilhe somente com pessoas em quem confia e revise periodicamente as permissões concedidas.'],
    ['Instrutora','Uma instrutora qualificada pode ajudar no aprendizado e na aplicação das regras do método a partir das observações registradas.'],
    ['Privacidade','Os registros podem conter informações íntimas. Proteja sua conta, seus PDFs e backups e revogue acessos que não sejam mais necessários.']
  ]}
];

function startOfSeedPeriod(){const d=new Date();d.setDate(d.getDate()-8);return d.toISOString().slice(0,10)}
function seedRecords(){const today=new Date(),arr=[];for(let i=12;i>=0;i--){const d=new Date(today);d.setDate(today.getDate()-i);arr.push({id:crypto.randomUUID(),date:d.toISOString().slice(0,10),sensation:['Seca','Úmida','Molhada','Escorregadia'][i%4],appearance:['Sem observação','Opaca','Transparente','Elástica'][i%4],bleeding:i>=8&&i<=12?['Leve','Moderado','Moderado','Leve','Leve'][12-i]:'Não',pbi:i===3,chartStamp:(i>=8&&i<=12?'red':(i%4===0?'green':i===3?'yellow':'white')),peakMarker:(i===1?'peak':''),notes:i===1?'Observação feita à noite.':'',createdAt:Date.now()})}return arr}
const initialSettings=JSON.parse(localStorage.getItem('cycleseed.settings')||'null')||{reminder:true,reminderTime:'20:30',partner:false,professional:true,theme:'light',cycleLength:28,periodLength:5,lastPeriod:startOfSeedPeriod(),profileName:'',cycleConfigured:false};
const initialRecords=JSON.parse(localStorage.getItem('cycleseed.records')||'null')||seedRecords();
let initialCycles=JSON.parse(localStorage.getItem('cycleseed.cycles')||'null');
if(!Array.isArray(initialCycles)||!initialCycles.length)initialCycles=[{id:crypto.randomUUID(),name:'Ciclo atual',startDate:initialSettings.lastPeriod,endDate:null,cycleLength:Number(initialSettings.cycleLength)||28,periodLength:Number(initialSettings.periodLength)||5,accessRole:'owner',ownerId:null}];
const initialActiveCycleId=localStorage.getItem('cycleseed.activeCycleId')||initialCycles[0].id;
initialRecords.forEach(r=>{if(!r.cycleId)r.cycleId=initialActiveCycleId});
const inviteFromUrl=new URLSearchParams(location.search).get('invite');if(inviteFromUrl)localStorage.setItem('cycleseed.pendingInvite',inviteFromUrl);
let deferredInstallPrompt=null;
const state={route:'today',previousRoute:'today',lessonId:null,editRecordId:null,user:null,authMode:'login',authReset:false,authResetSent:false,passwordSetup:false,passwordSaving:false,demoMode:false,authLoading:false,cloudLoading:false,cycleTab:'chart',calendarCursor:new Date(new Date().getFullYear(),new Date().getMonth(),1),records:initialRecords,cycles:initialCycles,activeCycleId:initialCycles.some(c=>c.id===initialActiveCycleId)?initialActiveCycleId:initialCycles[0].id,invitations:[],memberships:[],pendingInvite:(new URLSearchParams(location.search).get('invite')||localStorage.getItem('cycleseed.pendingInvite')),messages:JSON.parse(localStorage.getItem('cycleseed.messages')||'null')||[{from:'instructor',text:'Olá! Você pode registrar suas observações do dia e enviar suas dúvidas por aqui.'}],completedLessons:JSON.parse(localStorage.getItem('cycleseed.lessons')||'[]'),cloudConsentAccepted:false,accountLoaded:false,reminderUnread:localStorage.getItem('cycleseed.reminder.unread')==='1',settings:initialSettings};
function save(){localStorage.setItem('cycleseed.records',JSON.stringify(state.records));localStorage.setItem('cycleseed.cycles',JSON.stringify(state.cycles));localStorage.setItem('cycleseed.activeCycleId',state.activeCycleId);localStorage.setItem('cycleseed.messages',JSON.stringify(state.messages));localStorage.setItem('cycleseed.settings',JSON.stringify(state.settings));localStorage.setItem('cycleseed.lessons',JSON.stringify(state.completedLessons))}
function activeCycle(){return state.cycles.find(c=>c.id===state.activeCycleId)||state.cycles[0]}
function orderedCycles(){return [...state.cycles].sort((a,b)=>a.startDate.localeCompare(b.startDate))}
function currentOpenCycle(){return [...state.cycles].filter(c=>(c.accessRole||'owner')==='owner'&&!c.endDate).sort((a,b)=>b.startDate.localeCompare(a.startDate))[0]||null}
function cycleDisplayName(c){if(!c)return 'Ciclo';const list=orderedCycles(),idx=list.findIndex(x=>x.id===c.id),custom=(c.name||'').trim();if(custom&&custom.toLowerCase()!=='ciclo atual'&&!/^ciclo\s*\d+$/i.test(custom))return custom;return `Ciclo ${idx>=0?idx+1:1}`}
function activeRecords(){return state.records.filter(r=>r.cycleId===state.activeCycleId)}
function canEditActiveCycle(){const c=activeCycle();return Boolean(c&&(c.accessRole||'owner')==='owner'&&!c.endDate)}
function canEditRecord(r){const c=state.cycles.find(c=>c.id===r?.cycleId);return Boolean(c&&(c.accessRole||'owner')==='owner'&&!c.endDate)}
function cycleLength(){return Number(activeCycle()?.cycleLength||state.settings.cycleLength||28)}
function periodLength(){return Number(activeCycle()?.periodLength||state.settings.periodLength||5)}
function cycleLabel(c){const role=c.accessRole&&c.accessRole!=='owner'?` · ${c.accessRole==='partner'?'Parceiro(a)':'Instrutora'}`:'';return `${c.name||'Ciclo'} · ${fmtDate(c.startDate,{day:'2-digit',month:'short',year:'numeric'})}${role}`}
function esc(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function fmtDate(s,opts={day:'2-digit',month:'short'}){return new Intl.DateTimeFormat('pt-BR',opts).format(new Date(s+'T12:00:00'))}
function toast(text){const el=document.createElement('div');el.className='toast';el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),2200)}
function route(r){state.previousRoute=state.route;if(r==='reminders')markReminderUnread(false);if(r==='today'){const open=currentOpenCycle();if(open)state.activeCycleId=open.id}state.route=r;nav.forEach(b=>b.classList.toggle('active',b.dataset.route===r));render();requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:'auto'}))}
nav.forEach(b=>b.addEventListener('click',()=>{if(b.dataset.route==='cycle')state.cycleTab='chart';route(b.dataset.route)}));
function daysBetween(a,b){return Math.floor((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000)}
function addDays(s,n){const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function cycleDay(date=TODAY){const c=activeCycle();if(!c)return null;const diff=daysBetween(c.startDate,date);if(diff<0||(c.endDate&&date>c.endDate))return null;return diff+1}
function estimatedPhase(day){const len=cycleLength(),p=periodLength();if(!day)return 'Antes do ciclo configurado';if(day<=p)return 'Menstrual';if(day<=Math.max(p+1,len-15))return 'Folicular';if(day<=Math.max(p+2,len-12))return 'Ovulatória estimada';return 'Lútea'}
function countStreak(){const dates=new Set(activeRecords().map(r=>r.date));let c=0,d=new Date();while(dates.has(d.toISOString().slice(0,10))){c++;d.setDate(d.getDate()-1)}return c}
function todayView(){
 const c=currentOpenCycle()||activeCycle();if(c&&state.activeCycleId!==c.id)state.activeCycleId=c.id;
 const records=c?state.records.filter(r=>r.cycleId===c.id):[];
 const current=records.find(r=>r.date===TODAY),day=c?Math.max(1,daysBetween(c.startDate,TODAY)+1):null,progress=Math.round(state.completedLessons.length/lessons.length*100);
 const editable=Boolean(c&&(c.accessRole||'owner')==='owner'&&!c.endDate);
 return `<section class="hero-card branded-feature-card today-organized-card"><div class="hero-row"><div><span class="pill">${esc(cycleDisplayName(c))}</span><h2>${current?'Seu dia está organizado':'Como foi sua observação hoje?'}</h2><p class="muted">Registre o que você observou. Estimativas de calendário são apenas organizacionais e não substituem interpretação individual ou orientação profissional.</p></div></div></section>
 <div class="grid-3"><div class="metric-card metric-card-static"><span class="label">Dia do ciclo</span><strong>${day||'—'}</strong><small>${estimatedPhase(day)}</small></div><div class="metric-card metric-card-static"><span class="label">Sequência</span><strong>${countStreak()}</strong><small>dias registrados</small></div><div class="metric-card metric-card-static"><span class="label">Aprendizado</span><strong>${progress}%</strong><small>${state.completedLessons.length}/${lessons.length} módulos</small></div></div>
 <div class="section-title"><h3>Registro diário</h3></div>
 ${editable?(current?`<section class="card record-complete-card"><div class="record-complete-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m6.5 12.3 3.5 3.5 7.8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div><span class="label">REGISTRO CONCLUÍDO</span><h3>Observação de hoje salva</h3><p class="muted">Seu registro foi salvo com sucesso e já está disponível no Gráfico.</p></div></section>`:`<section class="card"><form id="recordForm" class="stack">
  <div class="field"><label>Data</label><input name="date" type="date" value="${TODAY}" required></div>
  <div class="field"><label>Sensação</label><select name="sensation">${['Seca','Úmida','Molhada','Escorregadia','Outra'].map(x=>`<option>${x}</option>`).join('')}</select></div>
  <div class="field"><label>Aparência observada</label><select name="appearance">${['Sem observação','Opaca','Transparente','Elástica','Outra'].map(x=>`<option>${x}</option>`).join('')}</select></div>
  <div class="grid-2"><div class="field"><label>Sangramento</label><select name="bleeding">${['Não','Leve','Moderado','Intenso'].map(x=>`<option>${x}</option>`).join('')}</select></div><div class="field"><label>PBI</label><select name="pbi"><option value="false">Não marcar</option><option value="true">Marcar manualmente</option></select></div></div>
  <div class="grid-2 mob-entry-fields"><div class="field"><label>Selo do gráfico</label><select name="chartStamp"><option value="">Não classificado</option><option value="red">Vermelho · sangramento</option><option value="green">Verde · seco</option><option value="white">Branco · muco</option><option value="yellow">Amarelo · padrão marcado</option></select></div><div class="field"><label>Marcação especial</label><select name="peakMarker"><option value="">Nenhuma</option><option value="peak">Pico</option><option value="plus1">Pico +1</option><option value="plus2">Pico +2</option><option value="plus3">Pico +3</option></select></div></div>
  <p class="field-help">Use estas marcações somente conforme seu aprendizado do Método Billings. O app não classifica fertilidade automaticamente.</p>
  <div class="field"><label>Anotações</label><textarea name="notes" placeholder="Horário, sensação ao longo do dia, observações..."></textarea></div>
  <button class="primary" type="submit">Salvar registro</button>
 </form></section>`):`<section class="card readonly-card"><strong>Ciclo encerrado</strong><p class="muted">Os registros desse ciclo permanecem disponíveis para consulta. Volte ao ciclo atual para fazer o registro de hoje.</p></section>`}
 <section class="card accent-card"><div><span class="label">PRÓXIMO PASSO</span><h3>${progress===100?'Aprendizado concluído':'Continue aprendendo'}</h3><p class="muted">Conteúdo educativo em módulos curtos, com progresso salvo.</p></div><button class="secondary" data-go="learn">Abrir trilha</button></section>`
}
function cycleManager(){
 const ordered=orderedCycles(),c=activeCycle(),idx=Math.max(0,ordered.findIndex(x=>x.id===c?.id)),prev=ordered[idx-1],next=ordered[idx+1];
 const period=c?`${fmtDate(c.startDate,{day:'2-digit',month:'short',year:'numeric'})} ${c.endDate?`→ ${fmtDate(c.endDate,{day:'2-digit',month:'short',year:'numeric'})}`:'→ Em andamento'}`:'';
 return `<section class="card cycle-manager cycle-carousel"><span class="label">CICLO SELECIONADO</span><div class="cycle-carousel-row"><button class="cycle-arrow" data-cycle-move="-1" ${prev?'':'disabled'} aria-label="Ciclo anterior"><svg viewBox="0 0 24 24" fill="none"><path d="m14.5 5-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="cycle-carousel-copy"><strong>${esc(cycleDisplayName(c))}</strong><small>${esc(period)}</small><span class="cycle-state ${c?.endDate?'closed':'open'}">${c?.endDate?'Encerrado':'Atual'}</span></div><button class="cycle-arrow" data-cycle-move="1" ${next?'':'disabled'} aria-label="Próximo ciclo"><svg viewBox="0 0 24 24" fill="none"><path d="m9.5 5 7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><div class="cycle-position" aria-label="${idx+1} de ${ordered.length}">${ordered.map((x,i)=>`<i class="${i===idx?'active':''}"></i>`).join('')}</div></section>`
}
function cycleView(){return `${cycleManager()}<div class="segmented"><button data-cycle-tab="chart" class="${state.cycleTab==='chart'?'active':''}">Gráfico</button><button data-cycle-tab="calendar" class="${state.cycleTab==='calendar'?'active':''}">Calendário</button><button data-cycle-tab="summary" class="${state.cycleTab==='summary'?'active':''}">Resumo</button></div>${state.cycleTab==='calendar'?calendarView():state.cycleTab==='chart'?historyView():summaryView()}`}
function calendarView(){
 const cur=state.calendarCursor,y=cur.getFullYear(),m=cur.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0),offset=(first.getDay()+6)%7;
 const cells=[];for(let i=0;i<offset;i++)cells.push('<div></div>');
 for(let d=1;d<=last.getDate();d++){const date=new Date(y,m,d,12).toISOString().slice(0,10),rec=activeRecords().find(r=>r.date===date),cd=cycleDay(date);let cls='calendar-day';if(date===TODAY)cls+=' today';if(rec)cls+=' has-record';if(rec?.bleeding!=='Não'&&rec)cls+=' bleeding';cells.push(`<button class="${cls}" data-date="${date}"><span>${d}</span>${cd?`<small>D${cd}</small>`:''}${rec?'<i></i>':''}</button>`)}
 const monthLabel=new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(cur).replace(/\s+de\s+/i,' / ');
 const nextPeriod=nextEstimatedPeriod();
 const estimateCard=(state.demoMode||state.settings.cycleConfigured===true)?`<section class="card next-cycle-card"><div class="summary-row"><div><span class="label">Estimativa organizacional</span><h3 style="margin:.25rem 0">Próximo início de ciclo</h3><p class="muted">${fmtDate(nextPeriod,{day:'2-digit',month:'long',year:'numeric'})}</p></div><div class="cycle-badge">${cycleLength()}d</div></div><div class="notice">A previsão usa apenas a duração média configurada. Não deve ser usada para determinar fertilidade, evitar gravidez ou tomar decisões médicas.</div></section>`:'';
 return `<section class="card"><div class="calendar-head"><button class="icon-btn mini" data-month="-1">‹</button><h3>${monthLabel}</h3><button class="icon-btn mini" data-month="1">›</button></div><div class="weekdays">${['SEG','TER','QUA','QUI','SEX','SÁB','DOM'].map(x=>`<span>${x}</span>`).join('')}</div><div class="calendar-grid">${cells.join('')}</div><div class="legend"><span><i class="dot record-dot"></i> Registro</span><span><i class="dot bleed-dot"></i> Sangramento</span></div></section>${estimateCard}`
}
function nextEstimatedPeriod(){const c=activeCycle();return c?addDays(c.startDate,cycleLength()):TODAY}
function chartView(){return mobChartView()}
function mobStampMeta(r){
 const map={red:{label:'Vermelho',symbol:'•',short:'Sangramento'},green:{label:'Verde',symbol:'I',short:'Seco'},white:{label:'Branco',symbol:'O',short:'Muco'},yellow:{label:'Amarelo',symbol:'=',short:'Padrão marcado'}};
 return map[r.chartStamp]||{label:'Não classificado',symbol:'?',short:'Sem selo'}
}
function peakLabel(v){return ({peak:'Pico',plus1:'+1',plus2:'+2',plus3:'+3'})[v]||''}
function mobChartView(){
 const sorted=[...activeRecords()].sort((a,b)=>a.date.localeCompare(b.date));
 const legend='';
 if(!sorted.length)return `<section class="card mob-list-card"><div class="chart-title"><div><span class="label">PADRÃO MOB</span><h3>Registros do ciclo</h3><p class="muted">Adicione registros para visualizar a lista.</p></div></div>${legend}<div class="empty-chart-message">Nenhum registro neste ciclo.</div></section>`;
 const cycle=activeCycle(),cycleClosed=!!cycle?.endDate;
 const rows=sorted.map(r=>{
   const m=mobStampMeta(r),cycleD=Math.max(1,daysBetween(cycle.startDate,r.date)+1),peak=peakLabel(r.peakMarker)||'—';
   return `<article class="mob-list-row ${cycleClosed?'cycle-closed-record':''}">
    <div class="mob-list-date">${fmtDate(r.date,{day:'2-digit',month:'2-digit',year:'numeric'})}</div>
    <div class="mob-list-main">
     <span class="mob-list-stamp ${r.chartStamp||'unclassified'}" title="${esc(m.label)}" aria-label="Selo ${esc(m.label)}"><b>${m.symbol}</b></span>
     <div class="mob-list-value"><small>Dia</small><strong>${cycleD}</strong></div>
     <div class="mob-list-value"><small>Sensação</small><strong>${esc(r.sensation||'—')}</strong></div>
     <div class="mob-list-value"><small>Aparência</small><strong>${esc(r.appearance||'—')}</strong></div>
     <div class="mob-list-value"><small>Sangramento</small><strong>${esc(r.bleeding||'—')}</strong></div>
     <div class="mob-list-value"><small>Pico</small><strong>${peak}</strong></div>
    </div>
   </article>`
 }).join('');
 return `<section class="card mob-list-card"><div class="chart-title"><div><span class="label">PADRÃO MOB</span><h3>Registros do ciclo</h3><p class="muted">Selos e marcações informados manualmente, organizados em sequência diária.</p></div><button id="exportBtn" class="secondary">CSV</button></div>${legend}<div class="mob-list">${rows}</div></section>
 <section class="notice mob-chart-note">Os selos e a marcação de Pico são informados manualmente. Esta visualização não determina fertilidade automaticamente e não é apresentada como gráfico oficial ou aprovado pela WOOMB.</section>`
}
function summaryView(){const sorted=[...activeRecords()].sort((a,b)=>a.date.localeCompare(b.date)),last=sorted.slice(-31);return `<section class="hero-card branded-feature-card summary-personal-card"><span class="pill">Resumo pessoal</span><h2>${last.length} registros recentes</h2><p class="muted">Uma visão descritiva do que foi anotado. Não há classificação automática de fertilidade.</p></section><div class="grid-2"><section class="card"><span class="label">Sangramento</span><div class="metric">${last.filter(r=>r.bleeding!=='Não').length}</div><span class="label">dias registrados</span></section><section class="card"><span class="label">PBI manual</span><div class="metric">${last.filter(r=>r.pbi).length}</div><span class="label">marcações</span></section></div><section class="card"><h3 style="margin-top:0">Categorias mais registradas</h3>${['Seca','Úmida','Molhada','Escorregadia'].map(k=>{const n=last.filter(r=>r.sensation===k).length;return `<div class="stat-line"><span>${k}</span><div><i style="width:${last.length?n/last.length*100:0}%"></i></div><strong>${n}</strong></div>`}).join('')}</section>`}
function recordItem(r){const m=mobStampMeta(r),day=cycleDay(r.date),peak=peakLabel(r.peakMarker);return `<article class="timeline-item mob-timeline-item"><div class="timeline-marker mob-timeline-marker"><span class="mob-list-stamp ${r.chartStamp||'unclassified'}"><b>${m.symbol}</b></span></div><div class="timeline-card"><div class="timeline-head"><div><p class="mob-record-date">${fmtDate(r.date,{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}</p></div>${canEditRecord(r)?`<div class="timeline-actions"><button class="action-icon edit-icon" data-edit="${r.id}" aria-label="Editar registro"><svg viewBox="0 0 24 24" fill="none"><path d="M4 20h4.2L19 9.2 14.8 5 4 15.8V20Z" stroke="currentColor" stroke-width="1.8"/></svg></button><button class="action-icon danger-icon" data-delete="${r.id}" aria-label="Excluir registro"><svg viewBox="0 0 24 24" fill="none"><path d="M6.5 8.2h11l-.7 11.1a1.8 1.8 0 0 1-1.8 1.7H9a1.8 1.8 0 0 1-1.8-1.7L6.5 8.2Z" stroke="currentColor" stroke-width="1.8"/></svg></button></div>`:''}</div><div class="mob-timeline-grid"><div><small>Dia do ciclo</small><strong>${day}</strong></div><div><small>Sensação</small><strong>${esc(r.sensation||'—')}</strong></div><div><small>Aparência</small><strong>${esc(r.appearance||'—')}</strong></div><div><small>Sangramento</small><strong>${esc(r.bleeding||'—')}</strong></div><div><small>Pico</small><strong>${esc(peak)}</strong></div></div>${r.notes?`<div class="chips"><span>${esc(r.notes)}</span></div>`:''}</div></article>`}
function historyView(){
 const sorted=[...activeRecords()].sort((a,b)=>b.date.localeCompare(a.date));
 const legend='';
 if(!sorted.length)return `<section class="mob-graph-view">${legend}<div class="mob-empty-state"><strong>Nenhum registro neste ciclo</strong><p>Adicione seu primeiro registro para começar a formar a linha do ciclo.</p></div><div class="notice mob-graph-notice">Os selos são informados manualmente e não representam interpretação automática de fertilidade.</div></section>`;
 const rows=sorted.map(r=>{const meta=mobStampMeta(r),day=cycleDay(r.date)||'—',peak=peakLabel(r.peakMarker)||'—',editable=canEditRecord(r);return `<article class="mob-graph-row ${editable?'is-editable':''}" ${editable?`data-edit="${r.id}" role="button" tabindex="0" aria-label="Editar registro de ${fmtDate(r.date,{day:'2-digit',month:'2-digit',year:'numeric'})}"`:''}><div class="mob-cycle-day"><small>Dia</small><strong>${day}</strong></div><span class="mob-graph-stamp ${r.chartStamp||'unclassified'}" title="${esc(meta.label)}"><b>${meta.symbol}</b></span><div class="mob-graph-content"><span class="mob-graph-date">${fmtDate(r.date,{day:'2-digit',month:'2-digit',year:'numeric'})}</span><div class="mob-graph-details mob-graph-details-stacked"><div class="mob-detail-column"><div><small>Sensação</small><strong>${esc(r.sensation||'—')}</strong></div><div><small>Aparência</small><strong>${esc(r.appearance||'—')}</strong></div></div><div class="mob-detail-column"><div><small>Sangramento</small><strong>${esc(r.bleeding||'—')}</strong></div><div><small>Pico</small><strong class="mob-graph-peak ${peak==='—'?'empty':''}">${esc(peak)}</strong></div></div></div></div></article>`}).join('');
 return `<section class="mob-graph-view">${legend}<div class="mob-month-list mob-flat-list">${rows}</div><div class="notice mob-graph-notice">Os selos são informados manualmente e não representam interpretação automática de fertilidade.</div></section>`
}
function editView(){
 const r=activeRecords().find(x=>x.id===state.editRecordId);
 if(!r)return `<section class="card"><h3>Registro não encontrado</h3><p class="muted">O registro pode ter sido removido.</p><button class="secondary" data-go="history">Voltar à linha do tempo</button></section>`;
 return `<section class="hero-card edit-hero"><span class="pill">Edição</span><h2>Atualize o registro</h2><p class="muted">Revise os dados abaixo e salve as alterações.</p></section><section class="card"><form id="editRecordForm" class="stack">
  <div class="field"><label>Data</label><input name="date" type="date" value="${r.date}" required></div>
  <div class="field"><label>Sensação</label><select name="sensation">${['Seca','Úmida','Molhada','Escorregadia','Outra'].map(x=>`<option ${r.sensation===x?'selected':''}>${x}</option>`).join('')}</select></div>
  <div class="field"><label>Aparência observada</label><select name="appearance">${['Sem observação','Opaca','Transparente','Elástica','Outra'].map(x=>`<option ${r.appearance===x?'selected':''}>${x}</option>`).join('')}</select></div>
  <div class="grid-2"><div class="field"><label>Sangramento</label><select name="bleeding">${['Não','Leve','Moderado','Intenso'].map(x=>`<option ${r.bleeding===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="field"><label>PBI</label><select name="pbi"><option value="false" ${!r.pbi?'selected':''}>Não marcar</option><option value="true" ${r.pbi?'selected':''}>Marcar manualmente</option></select></div></div>
  <div class="grid-2 mob-entry-fields"><div class="field"><label>Selo do gráfico</label><select name="chartStamp">${[['','Não classificado'],['red','Vermelho · sangramento'],['green','Verde · seco'],['white','Branco · muco'],['yellow','Amarelo · padrão marcado']].map(([v,l])=>`<option value="${v}" ${String(r.chartStamp||'')===v?'selected':''}>${l}</option>`).join('')}</select></div><div class="field"><label>Marcação especial</label><select name="peakMarker">${[['','Nenhuma'],['peak','Pico'],['plus1','Pico +1'],['plus2','Pico +2'],['plus3','Pico +3']].map(([v,l])=>`<option value="${v}" ${String(r.peakMarker||'')===v?'selected':''}>${l}</option>`).join('')}</select></div></div>
  <p class="field-help">A classificação é manual e deve seguir seu aprendizado do Método Billings.</p>
  <div class="field"><label>Anotações</label><textarea name="notes" placeholder="Horário, sensação ao longo do dia, observações...">${esc(r.notes||'')}</textarea></div>
  <button class="primary" type="submit">Salvar alterações</button>
 </form></section>`
}
function learnView(){const pct=Math.round(state.completedLessons.length/lessons.length*100);return `<section class="hero-card branded-feature-card"><span class="pill">Trilha educativa</span><h2>${pct}% concluído</h2><div class="progress"><i style="width:${pct}%"></i></div><p class="muted"><strong>O acompanhamento é organizado ciclo a ciclo.</strong> Comece entendendo o Dia 1 e depois aprenda a registrar diariamente. A aplicação prática do Método de Ovulação Billings deve seguir orientação qualificada.</p></section><div class="lesson-list">${lessons.map((l,i)=>{const done=state.completedLessons.includes(l.id);return `<button class="lesson ${done?'done':''}" data-open-lesson="${l.id}"><span class="lesson-num">${done?'✓':i+1}</span><span><strong>${l.title}</strong><small>${l.time} · ${l.text}</small></span><b>›</b></button>`}).join('')}</div><div class="learn-support-grid"><a class="learn-support-card" href="https://www.cenplafam.com/pt-br/metodo-de-ovulacao-billings/" target="_blank" rel="noopener noreferrer"><span class="learn-support-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M4 5.5c2.7-.9 5.35-.55 8 1.05v13c-2.65-1.6-5.3-1.95-8-1.05v-13Zm16 0c-2.7-.9-5.35-.55-8 1.05v13c2.65-1.6 5.3-1.95 8-1.05v-13Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span><strong>Conheça o Método Billings</strong><small>Conteúdo de apoio da CENPLAFAM WOOMB Brasil</small></span><b>↗</b></a><a class="learn-support-card instructor" href="https://www.cenplafam.com/pt-br/quero-ser-uma-usuaria/" target="_blank" rel="noopener noreferrer"><span class="learn-support-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm6.5 1.5a3 3 0 1 0 0-6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M3.5 20c.4-3.7 2.25-5.7 5.5-5.7s5.1 2 5.5 5.7M15 15.1c3.1 0 4.8 1.7 5.2 4.9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></span><span><strong>Fale com uma instrutora</strong><small>Encontre orientação para aprender o MOB corretamente</small></span><b>↗</b></a></div>`}
function lessonView(){const lesson=lessons.find(l=>l.id===state.lessonId)||lessons[0],done=state.completedLessons.includes(lesson.id);return `<section class="hero-card lesson-hero"><span class="pill">Módulo · ${esc(lesson.time)}</span><h2>${esc(lesson.title)}</h2><p class="muted">${esc(lesson.text)}</p></section><div class="lesson-content">${lesson.sections.map(([heading,text],i)=>`<section class="card lesson-section"><span class="lesson-step">${String(i+1).padStart(2,'0')}</span><h3>${esc(heading)}</h3><p>${esc(text)}</p></section>`).join('')}</div><section class="notice learning-notice">Este conteúdo é educativo e serve para organizar o aprendizado. A aplicação do Método de Ovulação Billings deve seguir orientação qualificada.</section><button class="${done?'secondary':'primary'} lesson-complete" data-complete-lesson="${lesson.id}">${done?'✓ Módulo concluído':'Marcar módulo como concluído'}</button>`}
function supportView(){return `<section class="hero-card"><span class="pill">Compartilhamento</span><h2>Parceiro(a) e profissional</h2><p class="muted">Controle quem pode acompanhar seus registros. Compartilhe apenas com pessoas de confiança e revise os acessos periodicamente.</p></section><section class="card"><div class="share-person"><div class="avatar">P</div><div><strong>Profissional / instrutora</strong><small>${state.settings.professional?'Acesso autorizado':'Sem acesso'}</small></div><button class="switch ${state.settings.professional?'on':''}" data-setting="professional"></button></div><div class="share-person"><div class="avatar">♡</div><div><strong>Parceiro(a)</strong><small>${state.settings.partner?'Somente leitura':'Sem acesso'}</small></div><button class="switch ${state.settings.partner?'on':''}" data-setting="partner"></button></div></section>`}

function prepareRealUserState(userId){
 const markerKey='cycleseed.cloud.user',previous=localStorage.getItem(markerKey);
 if(previous===userId)return;
 const theme=state.settings.theme||'light';
 state.records=[];state.cycles=[];state.activeCycleId='';state.completedLessons=[];state.cloudConsentAccepted=false;state.accountLoaded=false;
 state.settings={reminder:false,reminderTime:'20:30',partner:false,professional:true,theme,cycleLength:28,periodLength:5,lastPeriod:TODAY,profileName:'',cycleConfigured:false};
 localStorage.setItem(markerKey,userId);save();
}
async function loadAccountCloud(){
 if(!db||!state.user||state.demoMode)return;
 const uid=state.user.id;
 try{
  const [profileRes,consentRes,learningRes,settingsRes]=await Promise.all([
   db.from('profiles').select('display_name,timezone,cycle_length,period_length,last_period_start,onboarding_completed').eq('user_id',uid).maybeSingle(),
   db.from('user_consents').select('accepted_at,revoked_at').eq('user_id',uid).eq('consent_version',CONSENT_VERSION).maybeSingle(),
   db.from('learning_progress').select('lesson_id').eq('user_id',uid),
   db.from('user_settings').select('theme,reminder_enabled,reminder_time').eq('user_id',uid).maybeSingle()
  ]);
  for(const result of [profileRes,consentRes,learningRes,settingsRes])if(result.error)throw result.error;
  const profile=profileRes.data;if(profile){state.settings.profileName=profile.display_name||'';state.settings.cycleLength=Number(profile.cycle_length)||28;state.settings.periodLength=Number(profile.period_length)||5;state.settings.lastPeriod=profile.last_period_start||state.settings.lastPeriod||TODAY;state.settings.cycleConfigured=Boolean(profile.onboarding_completed)}
  const cloudSettings=settingsRes.data;if(cloudSettings){if(['light','dark'].includes(cloudSettings.theme))state.settings.theme=cloudSettings.theme;state.settings.reminder=Boolean(cloudSettings.reminder_enabled);state.settings.reminderTime=String(cloudSettings.reminder_time||'20:30').slice(0,5)}
  state.completedLessons=(learningRes.data||[]).map(x=>x.lesson_id).filter(id=>lessons.some(l=>l.id===id));
  state.cloudConsentAccepted=Boolean(consentRes.data?.accepted_at&&!consentRes.data?.revoked_at);state.accountLoaded=true;
  document.documentElement.dataset.theme=state.settings.theme;save();
 }catch(err){console.warn('Account cloud load',err);state.accountLoaded=true;toast('Não foi possível carregar todas as preferências da conta')}
}
async function saveProfileCloud(onboardingCompleted=state.settings.cycleConfigured){
 if(!db||!state.user||state.demoMode)return;
 const payload={user_id:state.user.id,display_name:state.settings.profileName||null,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'America/Sao_Paulo',cycle_length:Number(state.settings.cycleLength)||28,period_length:Number(state.settings.periodLength)||5,last_period_start:state.settings.lastPeriod||null,onboarding_completed:Boolean(onboardingCompleted)};
 const {error}=await db.from('profiles').upsert(payload,{onConflict:'user_id'});if(error)throw error;
}
async function saveConsentCloud(){
 if(!db||!state.user||state.demoMode)return;
 const {error}=await db.from('user_consents').upsert({user_id:state.user.id,consent_version:CONSENT_VERSION,accepted_at:new Date().toISOString(),revoked_at:null},{onConflict:'user_id,consent_version'});if(error)throw error;state.cloudConsentAccepted=true;
}
async function saveLearningProgressCloud(lessonId){
 if(!db||!state.user||state.demoMode)return;
 const {error}=await db.from('learning_progress').upsert({user_id:state.user.id,lesson_id:lessonId,completed_at:new Date().toISOString()},{onConflict:'user_id,lesson_id'});if(error)console.warn('Learning sync',error);
}
async function saveAppSettingsCloud(){
 if(!db||!state.user||state.demoMode)return;
 const payload={user_id:state.user.id,theme:['light','dark'].includes(state.settings.theme)?state.settings.theme:'light',reminder_enabled:Boolean(state.settings.reminder),reminder_time:(state.settings.reminderTime||'20:30')+':00'};
 const {error}=await db.from('user_settings').upsert(payload,{onConflict:'user_id'});if(error)console.warn('Settings sync',error);
}
function profileSetupKey(){return `cycleseed.profile.configured.${state.user?.id||'anonymous'}`}
function needsProfileSetup(){return !state.demoMode&&!state.settings.cycleConfigured}
function markProfileConfigured(){localStorage.setItem(profileSetupKey(),'1');state.settings.cycleConfigured=true;save()}
function reminderSettingsCard(){
 const pushSupported='serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
 const pushActive=window.Notification?.permission==='granted' && Boolean(localStorage.getItem('cycleseed.push.active'));
 return `<section class="hero-card reminder-hero branded-feature-card"><span class="pill">Lembretes</span><h2>Não deixe o registro do dia passar</h2><p class="muted">Escolha um horário e, quando permitido pelo aparelho, receba um aviso mesmo com o PWA fechado.</p></section><section class="card"><div class="stack"><div class="feature-status"><i class="status-dot ${pushActive?'ok':'warn'}"></i><div><b>${pushActive?'Push ativado':'Push não ativado'}</b><small>${pushSupported?'Compatível com este navegador.':'Este navegador não oferece Web Push.'}</small></div></div><div class="profile-row"><div><strong>Lembrete diário</strong><div class="label">Lembrar de registrar o dia</div></div><button class="switch ${state.settings.reminder?'on':''}" data-setting="reminder"></button></div><div class="profile-row"><div><strong>Horário</strong><div class="label">Horário local</div></div><input id="reminderTime" type="time" value="${state.settings.reminderTime}"></div><div class="action-grid"><button id="enablePushBtn" class="primary">${pushActive?'Atualizar push':'Ativar notificações'}</button><button id="testPushBtn" class="secondary">Enviar teste</button></div><p class="subtle">Para push real em segundo plano, configure VAPID + Supabase e agende a Edge Function incluída no projeto.</p></div></section>`
}
function remindersView(){return reminderSettingsCard()}
function profileView(){
 const who=state.demoMode?'Modo demonstração':(state.user?.email||'Conta conectada');
 const firstSetup=needsProfileSetup();
 const setupCard=firstSetup?`<section class="hero-card profile-onboarding"><span class="pill">Primeiro acesso</span><h2>Configure seu perfil</h2><p class="muted">Essas informações organizam o ciclo no aplicativo. Você poderá alterá-las depois.</p></section><section class="card"><form id="profileSetupForm" class="stack"><div class="field"><label>Como quer ser chamada?</label><input name="profileName" type="text" autocomplete="name" value="${esc(state.settings.profileName||'')}" placeholder="Seu nome" required></div><div class="field"><label>Último início de menstruação</label><input name="lastPeriod" type="date" value="${activeCycle()?.startDate||state.settings.lastPeriod||TODAY}" required></div><div class="grid-2"><div class="field"><label>Duração média do ciclo</label><input name="cycleLength" type="number" min="15" max="60" value="${cycleLength()}" required></div><div class="field"><label>Duração média do sangramento</label><input name="periodLength" type="number" min="1" max="15" value="${periodLength()}" required></div></div><button class="primary" type="submit">Salvar e continuar</button></form></section>`:'';
 const cycleCard=!firstSetup?`<section class="card profile-cycle-card"><h3 style="margin-top:0">Meu ciclo</h3><div class="field"><label>Último início de menstruação</label><input id="lastPeriod" type="date" value="${activeCycle()?.startDate||state.settings.lastPeriod}"></div><div class="grid-2" style="margin-top:10px"><div class="field"><label>Duração média do ciclo</label><input id="cycleLength" type="number" min="15" max="60" value="${cycleLength()}"></div><div class="field"><label>Duração média do sangramento</label><input id="periodLength" type="number" min="1" max="15" value="${periodLength()}"></div></div></section>`:'';
 const sessionCard=`<section class="card session-card"><div><h3>Sessão</h3><p class="muted">${state.demoMode?'Encerre o modo demonstração e volte para a tela de acesso.':'Saia com segurança desta conta neste dispositivo.'}</p></div><button id="logoutBtn" class="secondary session-logout">${state.demoMode?'Encerrar demonstração':'Sair do app'}</button></section>`;
 return `${setupCard}<section class="card account-card"><div class="account-avatar">${esc((state.settings.profileName||state.user?.email||'D').slice(0,1).toUpperCase())}</div><div><strong>${esc(state.settings.profileName||who)}</strong><small>${state.demoMode?'Dados apenas neste dispositivo':esc(state.user?.email||'Sessão protegida pelo Supabase Auth')}</small></div></section>
 ${cycleCard}
 <section class="card"><div class="profile-row appearance-row"><div><strong>Modo de aparência</strong><div class="label">${state.settings.theme==='dark'?'Escuro · ameixa/cacau':'Claro'}</div></div><button id="themeToggleProfile" class="theme-choice" aria-label="Alternar modo de aparência"><span>${state.settings.theme==='dark'?'☾':'☀'}</span>${state.settings.theme==='dark'?'Escuro':'Claro'}</button></div></section>
 <section class="card"><h3 style="margin-top:0">Relatório em PDF</h3><p class="muted">Gere um relatório com resumo, configurações do ciclo e histórico de registros para arquivar ou compartilhar.</p><div class="pdf-actions"><button id="pdfBtn" class="primary">Gerar PDF</button><button id="exportBtn" class="secondary">Exportar CSV</button></div></section>
 <section class="card"><h3 style="margin-top:0">Privacidade e dados</h3><p class="muted">Você controla os acessos e pode exportar seus dados a qualquer momento.</p><div class="stack"><button id="backupBtn" class="secondary">Baixar backup</button><button id="clearBtn" class="danger">Apagar dados locais</button></div></section>
 ${sessionCard}`
}

function authView(){
 return `<div class="auth-card auth-modern"><div class="auth-brand auth-brand-modern"><img class="auth-logo-image" src="./icons/logo-ciclo-mob.png" alt="Ciclo MOB"><div class="auth-wordmark"><span>Ciclo MOB</span><small>Acompanhamento do ciclo</small></div></div><div class="auth-intro"><span class="pill">Bem-vinda</span><h1>Seu ciclo, organizado todos os dias.</h1><p>Entre com o e-mail usado na compra para acessar seus registros, histórico e aprendizado.</p></div>
 <form id="authForm" class="stack auth-form">
 <div class="field"><label>E-mail</label><div class="auth-input-wrap"><svg viewBox="0 0 24 24" fill="none"><path d="M4 6.5h16v11H4z" stroke="currentColor" stroke-width="1.7"/><path d="m5 7.5 7 5 7-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><input name="email" type="email" autocomplete="email" inputmode="email" placeholder="voce@email.com" required></div></div>
 <div class="field"><div class="auth-label-row"><label>Senha</label><button id="resetPasswordBtn" class="link-btn" type="button">Esqueci minha senha</button></div><div class="auth-input-wrap"><svg viewBox="0 0 24 24" fill="none"><rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 10V7.8a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><input name="password" type="password" autocomplete="current-password" minlength="6" placeholder="Sua senha" required></div></div>
 <button class="primary auth-submit" type="submit" ${state.authLoading?'disabled':''}>${state.authLoading?'Aguarde...':'Entrar'}</button>
 </form>
 <section class="auth-paid-note"><strong>Seu acesso é liberado após a confirmação do pagamento na Cakto.</strong><small>Você receberá por e-mail as instruções para definir sua senha e acessar o Ciclo MOB.</small></section>
 <p class="auth-helper">${supabaseReady?'Acesso seguro conectado ao Supabase Auth.':'Supabase ainda não configurado.'}</p></div>`
}
function passwordResetView(){
 return `<div class="auth-card auth-modern auth-reset-card">
  <button id="resetBackTop" class="auth-reset-back" type="button" aria-label="Voltar"><svg viewBox="0 0 24 24" fill="none"><path d="m14.5 5-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  <div class="auth-brand auth-brand-modern auth-reset-brand"><img class="auth-logo-image" src="./icons/logo-ciclo-mob.png" alt="Ciclo MOB"><div class="auth-wordmark"><span>Ciclo MOB</span></div></div>
  <div class="auth-intro auth-reset-intro"><h1>Esqueci minha senha</h1><p>${state.authResetSent?'Enviamos as instruções de redefinição para o e-mail informado.':'Digite seu e-mail para receber as instruções de redefinição de senha.'}</p></div>
  ${state.authResetSent?`
   <section class="auth-reset-success"><strong>Verifique seu e-mail</strong><small>Confira também a caixa de spam ou lixo eletrônico. O e-mail pode levar alguns minutos para chegar.</small></section>
   <button id="resetBackLogin" class="primary auth-submit" type="button">Voltar para o login</button>
  `:`
   <form id="passwordResetForm" class="stack auth-form">
    <div class="field"><label>E-mail</label><div class="auth-input-wrap"><svg viewBox="0 0 24 24" fill="none"><path d="M4 6.5h16v11H4z" stroke="currentColor" stroke-width="1.7"/><path d="m5 7.5 7 5 7-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><input name="email" type="email" autocomplete="email" inputmode="email" placeholder="voce@email.com" required></div></div>
    <button class="primary auth-submit" type="submit" ${state.authLoading?'disabled':''}>${state.authLoading?'Enviando...':'Enviar instruções'}</button>
   </form>
   <button id="resetBackLogin" class="link-btn auth-reset-login-link" type="button">Voltar para o login</button>
   <section class="auth-reset-help"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 10V7.8a3.5 3.5 0 0 1 7 0V10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><div><strong>Não recebeu o e-mail?</strong><small>Verifique sua caixa de spam ou lixo eletrônico. O e-mail pode levar alguns minutos para chegar.</small></div></section>
  `}
 </div>`
}

function passwordSetupView(){
 return `<div class="auth-card auth-modern auth-reset-card"><div class="auth-brand auth-brand-modern auth-reset-brand"><img class="auth-logo-image" src="./icons/logo-ciclo-mob.png" alt="Ciclo MOB"><div class="auth-wordmark"><span>Ciclo MOB</span></div></div><div class="auth-intro auth-reset-intro"><span class="pill">Primeiro acesso</span><h1>Defina sua senha</h1><p>Crie uma senha segura para acessar o Ciclo MOB.</p></div><form id="passwordSetupForm" class="stack auth-form"><div class="field"><label>Nova senha</label><div class="auth-input-wrap"><input name="password" type="password" minlength="8" autocomplete="new-password" placeholder="Mínimo de 8 caracteres" required></div></div><div class="field"><label>Confirmar senha</label><div class="auth-input-wrap"><input name="confirmPassword" type="password" minlength="8" autocomplete="new-password" placeholder="Digite novamente" required></div></div><button class="primary auth-submit" type="submit" ${state.passwordSaving?'disabled':''}>${state.passwordSaving?'Salvando...':'Criar minha senha'}</button></form><section class="auth-reset-help"><div><strong>Acesso protegido</strong><small>Depois de criar sua senha, entre usando o mesmo e-mail informado na compra.</small></div></section></div>`
}
async function submitPasswordSetup(e){
 e.preventDefault();const fd=new FormData(e.currentTarget),password=String(fd.get('password')||''),confirm=String(fd.get('confirmPassword')||'');
 if(password.length<8){toast('Use pelo menos 8 caracteres');return}
 if(password!==confirm){toast('As senhas não coincidem');return}
 state.passwordSaving=true;renderAuth();
 try{const {error}=await db.auth.updateUser({password});if(error)throw error;state.passwordSetup=false;history.replaceState({},'',location.pathname);await db.auth.signOut();state.user=null;toast('Senha criada com sucesso');renderAuth()}
 catch(err){toast(err.message||'Não foi possível criar a senha')}
 finally{state.passwordSaving=false}
}

function renderAuth(){
 appShell.classList.add('hidden');
 authShell.classList.remove('hidden');
 authShell.innerHTML=state.passwordSetup?passwordSetupView():(state.authReset?passwordResetView():authView());
 if(state.passwordSetup){const form=authShell.querySelector('#passwordSetupForm');if(form)form.onsubmit=submitPasswordSetup;return}
 if(state.authReset){
  const form=authShell.querySelector('#passwordResetForm');if(form)form.onsubmit=submitPasswordReset;
  const back=()=>{state.authReset=false;state.authResetSent=false;state.authLoading=false;renderAuth()};
  const top=authShell.querySelector('#resetBackTop');if(top)top.onclick=back;
  const login=authShell.querySelector('#resetBackLogin');if(login)login.onclick=back;
  return;
 }
 const form=authShell.querySelector('#authForm');if(form)form.onsubmit=handleAuth;
 const reset=authShell.querySelector('#resetPasswordBtn');if(reset)reset.onclick=()=>{state.authReset=true;state.authResetSent=false;renderAuth()};
}
async function submitPasswordReset(e){
 e.preventDefault();
 if(!supabaseReady){toast('Supabase ainda não configurado');return}
 const fd=new FormData(e.currentTarget),email=String(fd.get('email')||'').trim();
 if(!email)return;
 state.authLoading=true;renderAuth();
 try{
  const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
  if(error)throw error;
  state.authResetSent=true;
 }catch(err){toast(err.message||'Não foi possível enviar o e-mail')}
 finally{state.authLoading=false;renderAuth()}
}
async function hasPaidAccess(userId){
 if(!db||!userId)return false;
 const {data,error}=await db.from('subscriptions').select('status').eq('user_id',userId).in('status',['active','trialing']).limit(1);
 if(error){console.warn('Subscription check',error);return false}
 return Boolean(data?.length)
}
async function handleAuth(e){e.preventDefault();if(!supabaseReady){toast('Supabase ainda não configurado');return}const fd=new FormData(e.currentTarget),email=String(fd.get('email')).trim(),password=String(fd.get('password'));state.authLoading=true;renderAuth();try{
 const {data,error}=await db.auth.signInWithPassword({email,password});if(error)throw error;
 if(!await hasPaidAccess(data.user.id)){await db.auth.signOut();throw new Error('Seu acesso ainda não está ativo. Confirme o pagamento na Cakto ou fale com o suporte.')}
 state.user=data.user;prepareRealUserState(state.user.id);await showApp()
 }catch(err){toast(err.message||'Não foi possível autenticar')}finally{state.authLoading=false;if(!authShell.classList.contains('hidden'))renderAuth()}}
function consentKey(){return `cycleseed.consent.v1.${state.user?.id||'anonymous'}`}
function needsConsent(){return state.demoMode?localStorage.getItem(consentKey())!=='accepted':!state.cloudConsentAccepted}
function showConsent(){let shell=document.querySelector('#consentShell');if(!shell)return;shell.classList.remove('hidden');shell.innerHTML=`<div class="consent-backdrop"><section class="consent-card" role="dialog" aria-modal="true" aria-labelledby="consentTitle"><span class="pill">Primeiro acesso</span><h2 id="consentTitle">Termo de consentimento</h2><div class="consent-copy"><p>Ao utilizar o Ciclo MOB, você poderá registrar informações pessoais relacionadas ao seu ciclo e às suas observações diárias.</p><p><strong>Finalidade:</strong> organizar seus registros, ciclos, histórico, relatórios e recursos de acompanhamento que você decidir utilizar.</p><p><strong>Importante:</strong> o aplicativo é uma ferramenta de organização e educação. Ele não determina fertilidade ou infertilidade, não substitui uma instrutora qualificada do Método de Ovulação Billings e não deve ser usado isoladamente para decisões médicas ou reprodutivas.</p><p>Você é responsável por conferir os dados registrados e por decidir com quem compartilhá-los. Acessos concedidos a parceiro(a), instrutora ou profissional devem ser feitos conscientemente.</p></div><label class="consent-check"><input id="consentCheck" type="checkbox"> <span>Li e concordo com o uso dos meus dados para as finalidades descritas acima.</span></label><button id="acceptConsentBtn" class="primary" disabled>Concordar e continuar</button></section></div>`;const check=shell.querySelector('#consentCheck'),btn=shell.querySelector('#acceptConsentBtn');check.onchange=()=>btn.disabled=!check.checked;btn.onclick=async()=>{btn.disabled=true;try{if(state.demoMode)localStorage.setItem(consentKey(),'accepted');else await saveConsentCloud();shell.classList.add('hidden');shell.innerHTML='';state.route='learn';render();if(!state.demoMode&&db)await bootstrapCloud()}catch(err){console.warn('Consent sync',err);btn.disabled=false;toast('Não foi possível salvar o consentimento. Tente novamente.')}}}
async function showApp(){setTimeout(showInstallPrompt,700);authShell.classList.add('hidden');appShell.classList.remove('hidden');if(!state.demoMode&&db&&state.user){prepareRealUserState(state.user.id);await loadAccountCloud()}if(!needsConsent()&&needsProfileSetup())state.route='profile';render();if(needsConsent())showConsent();else if(!state.demoMode&&db)await bootstrapCloud();checkReminderUnread()}
async function signOut(){if(!state.demoMode&&db)await db.auth.signOut();state.demoMode=false;state.user=null;localStorage.removeItem('cycleseed.demo');renderAuth()}

function isStandalonePwa(){return window.matchMedia?.('(display-mode: standalone)').matches||window.navigator.standalone===true}
function showInstallPrompt(){if(isStandalonePwa()||!deferredInstallPrompt||sessionStorage.getItem('ciclo-mob.install.dismissed')==='1')return;let shell=document.querySelector('#installPromptShell');if(!shell){shell=document.createElement('div');shell.id='installPromptShell';shell.className='install-prompt-shell';document.body.appendChild(shell)}shell.innerHTML=`<div class="install-prompt-backdrop"><section class="install-prompt-card"><img src="./icons/logo-ciclo-mob.png" alt="" class="install-prompt-logo"><div><span class="pill">Ciclo MOB</span><h2>Instale o app no seu celular</h2><p>Acesse mais rápido pela tela inicial e use a experiência completa do PWA.</p></div><div class="install-prompt-actions"><button id="installLaterBtn" class="secondary">Agora não</button><button id="installNowBtn" class="primary">Instalar</button></div></section></div>`;shell.querySelector('#installLaterBtn').onclick=()=>{sessionStorage.setItem('ciclo-mob.install.dismissed','1');shell.remove()};shell.querySelector('#installNowBtn').onclick=async()=>{deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;shell.remove()}}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;setTimeout(showInstallPrompt,500)});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;document.querySelector('#installPromptShell')?.remove()});

async function initAuth(){document.documentElement.dataset.theme=state.settings.theme;if(localStorage.getItem('cycleseed.demo')==='1'){state.demoMode=true;state.user={email:'demo@cycleseed.local',id:'demo'};await showApp();return}if(!db){renderAuth();return}const {data}=await db.auth.getSession();state.user=data.session?.user||null;if(state.user&&new URLSearchParams(location.search).get('setup_password')==='1'){state.passwordSetup=true;renderAuth();return}if(state.user){if(await hasPaidAccess(state.user.id)){prepareRealUserState(state.user.id);await showApp()}else{await db.auth.signOut();state.user=null;renderAuth()}}else renderAuth();db.auth.onAuthStateChange(async(_event,session)=>{if(_event==='PASSWORD_RECOVERY'||(session&&new URLSearchParams(location.search).get('setup_password')==='1')){state.passwordSetup=true;state.user=session?.user||state.user;renderAuth();return}if(session?.user){const changed=state.user?.id!==session.user.id;state.user=session.user;if(changed)prepareRealUserState(state.user.id);if(authShell&&!authShell.classList.contains('hidden'))await showApp()}else if(!state.demoMode){state.user=null;renderAuth()}})}
function markReminderUnread(value=true){state.reminderUnread=value;if(value)localStorage.setItem('cycleseed.reminder.unread','1');else localStorage.removeItem('cycleseed.reminder.unread');if('caches' in window&&!value)caches.open('cycleseed-meta').then(cache=>cache.delete('./__reminder_unread__')).catch(()=>{});updateHeaderActions()}
async function checkReminderUnread(){if(!('caches' in window))return;try{const cache=await caches.open('cycleseed-meta'),hit=await cache.match('./__reminder_unread__');if(hit){state.reminderUnread=true;localStorage.setItem('cycleseed.reminder.unread','1');updateHeaderActions()}}catch(_){}}
function updateHeaderActions(){const reminderNav=document.querySelector('.nav-item[data-route="reminders"]');reminderNav?.classList.toggle('has-unread',state.reminderUnread);if(homeBellBtn){const onHome=state.route==='today';homeBellBtn.classList.toggle('hidden',!onHome);homeBellBtn.querySelector('.notification-dot')?.classList.toggle('hidden',!state.reminderUnread)}}
if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',event=>{if(event.data?.type==='REMINDER_RECEIVED')markReminderUnread(true)});
function urlBase64ToUint8Array(base64String){const padding='='.repeat((4-base64String.length%4)%4),base64=(base64String+padding).replace(/-/g,'+').replace(/_/g,'/'),raw=atob(base64);return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))}
async function enablePush(){if(!('serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window)){toast('Web Push não é compatível com este navegador');return}if(!window.isSecureContext){toast('Push exige HTTPS ou localhost');return}const permission=await Notification.requestPermission();if(permission!=='granted'){toast('Permissão de notificações não concedida');return}const reg=await navigator.serviceWorker.ready;
 if(!config.VAPID_PUBLIC_KEY){localStorage.setItem('cycleseed.push.active','local');await reg.showNotification('Ciclo MOB',{body:'Notificações locais ativadas. Configure a chave VAPID para push em segundo plano.',icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',tag:'cycleseed-setup'});render();return}
 try{let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(config.VAPID_PUBLIC_KEY)});localStorage.setItem('cycleseed.push.active','1');await savePushSubscription(sub);toast('Notificações push ativadas');render()}catch(err){toast('Falha ao ativar push: '+(err.message||err))}}
async function savePushSubscription(subscription){if(!db||!state.user||state.demoMode)return;const json=subscription.toJSON();const timezone=Intl.DateTimeFormat().resolvedOptions().timeZone||'America/Sao_Paulo';const payload={user_id:state.user.id,endpoint:json.endpoint,p256dh:json.keys?.p256dh,auth:json.keys?.auth,reminder_time:state.settings.reminderTime+':00',timezone,active:state.settings.reminder};const {error}=await db.from('push_subscriptions').upsert(payload,{onConflict:'user_id,endpoint'});if(error)throw error}
async function testNotification(){markReminderUnread(true);if(!('Notification' in window)){toast('Notificações não suportadas');return}if(Notification.permission!=='granted'){await enablePush();if(Notification.permission!=='granted')return}const reg=await navigator.serviceWorker.ready;await reg.showNotification('Ciclo MOB',{body:'Seu lembrete diário está funcionando. Registre suas observações de hoje.',icon:'./icons/icon-192.png',badge:'./icons/icon-192.png',tag:'cycleseed-test',data:{url:'./'}})}
async function refreshPushSettings(){if(!db||!state.user||state.demoMode)return;try{const reg=await navigator.serviceWorker.ready,sub=await reg.pushManager.getSubscription();if(sub)await savePushSubscription(sub)}catch(_){}}
async function saveCycleCloud(c){if(!db||!state.user||state.demoMode||c.accessRole!=='owner')return;const payload={id:c.id,owner_id:state.user.id,name:c.name,start_date:c.startDate,end_date:c.endDate||null,cycle_length:Number(c.cycleLength)||28,period_length:Number(c.periodLength)||5};const {error}=await db.from('cycles').upsert(payload,{onConflict:'id'});if(error)console.warn('Cycle sync',error)}
async function saveRecordCloud(r){const rc=state.cycles.find(c=>c.id===r.cycleId);if(!db||!state.user||state.demoMode||rc?.accessRole!=='owner')return;const payload={id:r.id,cycle_id:r.cycleId,date:r.date,sensation:r.sensation,appearance:r.appearance,bleeding:r.bleeding,pbi:Boolean(r.pbi),chart_stamp:r.chartStamp||null,peak_marker:r.peakMarker||null,notes:r.notes||'',recorded_by:state.user.id};const {error}=await db.from('cycle_records').upsert(payload,{onConflict:'id'});if(error)console.warn('Record sync',error)}
async function deleteRecordCloud(id){if(!db||!state.user||state.demoMode)return;await db.from('cycle_records').delete().eq('id',id)}
async function createNewCycle(e){e.preventDefault();const fd=new FormData(e.currentTarget),startDate=String(fd.get('startDate')),name=String(fd.get('name')||'Novo ciclo').trim();if(!startDate||!name)return;const previous=activeCycle();if(fd.get('closePrevious')&&previous?.accessRole==='owner'&&!previous.endDate&&previous.startDate<startDate){previous.endDate=addDays(startDate,-1);await saveCycleCloud(previous)}const c={id:crypto.randomUUID(),name,startDate,endDate:null,cycleLength:cycleLength(),periodLength:periodLength(),accessRole:'owner',ownerId:state.user?.id||null};state.cycles.push(c);state.activeCycleId=c.id;state.settings.lastPeriod=startDate;save();await saveCycleCloud(c);render();toast('Novo ciclo criado')}
function inviteLink(token){const u=new URL(location.origin+location.pathname);u.searchParams.set('invite',token);return u.toString()}
async function copyInviteLink(token){const link=inviteLink(token);try{await navigator.clipboard.writeText(link);toast('Link do convite copiado')}catch(_){prompt('Copie o link do convite:',link)}}
async function createInvitation(e){e.preventDefault();if(!db||state.demoMode){toast('Use uma conta conectada ao Supabase');return}const c=activeCycle();if(!c||!canEditActiveCycle())return;const fd=new FormData(e.currentTarget),email=String(fd.get('email')||'').trim().toLowerCase(),role=String(fd.get('role')||'partner');if(!email)return;const expires=new Date(Date.now()+7*86400000).toISOString();const {data,error}=await db.from('cycle_invitations').insert({cycle_id:c.id,inviter_id:state.user.id,invitee_email:email,role,expires_at:expires}).select('id,cycle_id,invitee_email,role,token,expires_at,accepted_at').single();if(error){toast(error.message||'Não foi possível criar o convite');return}state.invitations.unshift(data);const link=inviteLink(data.token);let emailed=false;if(config.INVITE_EMAIL_FUNCTION){try{const {error:fnError}=await db.functions.invoke(config.INVITE_EMAIL_FUNCTION,{body:{invitation_id:data.id,app_url:location.origin+location.pathname}});emailed=!fnError}catch(_){}}try{await navigator.clipboard.writeText(link)}catch(_){}render();toast(emailed?'Convite enviado e link copiado':'Convite criado · link copiado')}
async function revokeInvitation(id){if(!confirm('Cancelar este convite?'))return;const {error}=await db.from('cycle_invitations').delete().eq('id',id);if(error){toast(error.message);return}state.invitations=state.invitations.filter(i=>i.id!==id);render();toast('Convite cancelado')}
async function revokeMembership(id){if(!confirm('Revogar este acesso?'))return;const {error}=await db.from('cycle_memberships').delete().eq('id',id);if(error){toast(error.message);return}state.memberships=state.memberships.filter(m=>m.id!==id);render();toast('Acesso revogado')}
async function loadSharingData(){if(!db||!state.user||state.demoMode)return;const c=activeCycle();if(!c)return;const [{data:invites,error:iErr},{data:members,error:mErr}]=await Promise.all([db.from('cycle_invitations').select('id,cycle_id,invitee_email,role,token,expires_at,accepted_at').eq('cycle_id',c.id).order('created_at',{ascending:false}),db.from('cycle_memberships').select('id,cycle_id,user_id,member_email,role,accepted_at').eq('cycle_id',c.id).order('accepted_at',{ascending:false})]);if(!iErr)state.invitations=invites||[];if(!mErr)state.memberships=members||[]}
async function acceptPendingInvite(){const token=state.pendingInvite||new URLSearchParams(location.search).get('invite');if(!token||!db||!state.user)return;const {data,error}=await db.rpc('accept_cycle_invitation',{p_token:token});if(error){toast(error.message||'Não foi possível aceitar o convite');return}state.pendingInvite=null;localStorage.removeItem('cycleseed.pendingInvite');const u=new URL(location.href);u.searchParams.delete('invite');history.replaceState({},'',u.pathname+u.search+u.hash);toast('Convite aceito com sucesso');await syncCloudData();if(data)state.activeCycleId=String(data);save();route('cycle')}
async function syncCloudData(){if(!db||!state.user||state.demoMode)return;state.cloudLoading=true;try{
 const {data:cloudCycles,error:cErr}=await db.from('cycles').select('id,owner_id,name,start_date,end_date,cycle_length,period_length').order('start_date',{ascending:false});if(cErr)throw cErr;
 if(cloudCycles?.length){
  const {data:myMemberships}=await db.from('cycle_memberships').select('cycle_id,role,user_id,member_email');const roleByCycle=new Map((myMemberships||[]).filter(m=>m.user_id===state.user.id).map(m=>[m.cycle_id,m.role]));
  state.cycles=cloudCycles.map(c=>({id:c.id,ownerId:c.owner_id,name:c.name,startDate:c.start_date,endDate:c.end_date,cycleLength:c.cycle_length,periodLength:c.period_length,accessRole:c.owner_id===state.user.id?'owner':(roleByCycle.get(c.id)||'partner')}));if(!state.cycles.some(c=>c.id===state.activeCycleId))state.activeCycleId=state.cycles[0].id;
  const ids=state.cycles.map(c=>c.id);const {data:cloudRecords,error:rErr}=await db.from('cycle_records').select('id,cycle_id,date,sensation,appearance,bleeding,pbi,chart_stamp,peak_marker,notes,created_at,updated_at').in('cycle_id',ids).order('date',{ascending:true});if(rErr)throw rErr;
  state.records=(cloudRecords||[]).map(r=>({id:r.id,cycleId:r.cycle_id,date:r.date,sensation:r.sensation,appearance:r.appearance,bleeding:r.bleeding,pbi:r.pbi,chartStamp:r.chart_stamp||'',peakMarker:r.peak_marker||'',notes:r.notes,createdAt:r.created_at,updatedAt:r.updated_at}));
 }else if(state.cycles.length){
  for(const c of state.cycles.filter(x=>(x.accessRole||'owner')==='owner')){if(!c.ownerId)c.ownerId=state.user.id;await saveCycleCloud(c)}
  for(const r of state.records.filter(r=>state.cycles.find(c=>c.id===r.cycleId)?.accessRole==='owner'))await saveRecordCloud(r);
 }
 await loadSharingData();save();render()
 }catch(err){console.warn('Cloud sync',err);toast('Dados locais mantidos · sincronização pendente')}finally{state.cloudLoading=false}}
async function bootstrapCloud(){await syncCloudData();if(state.pendingInvite||new URLSearchParams(location.search).get('invite'))await acceptPendingInvite()}
function cleanPdfText(value=''){return String(value).replace(/[◆]/g,'PBI').replace(/[–—]/g,'-')}
function generatePDF(){const jsPDF=window.jspdf?.jsPDF;if(!jsPDF){toast('Biblioteca de PDF ainda não carregou');return}const doc=new jsPDF({unit:'mm',format:'a4'}),pageW=210,margin=14;let y=16;const line=(txt,size=9,bold=false)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);const parts=doc.splitTextToSize(cleanPdfText(txt),pageW-margin*2);if(y+parts.length*4.8>282){doc.addPage();y=16}doc.text(parts,margin,y);y+=parts.length*4.8};
 doc.setFillColor(91,64,83);doc.rect(0,0,pageW,30,'F');doc.setTextColor(255,255,255);doc.setFontSize(18);doc.setFont('helvetica','bold');doc.text('Ciclo MOB',margin,14);doc.setFontSize(9);doc.setFont('helvetica','normal');doc.text('Relatorio de acompanhamento do ciclo',margin,21);doc.setTextColor(43,34,42);y=40;
 line('Gerado em '+new Intl.DateTimeFormat('pt-BR',{dateStyle:'long',timeStyle:'short'}).format(new Date()),9);line('Conta: '+(state.demoMode?'modo demonstracao':(state.user?.email||'usuario')),9);y+=2;line('Resumo',13,true);line(`Ultimo inicio informado: ${fmtDate(activeCycle()?.startDate||state.settings.lastPeriod,{day:'2-digit',month:'long',year:'numeric'})}`);line(`Duracao media configurada: ${cycleLength()} dias | Sangramento medio: ${periodLength()} dias`);line(`Total de registros: ${activeRecords().length} | Marcacoes PBI: ${activeRecords().filter(r=>r.pbi).length}`);y+=3;line('Registros',13,true);
 [...activeRecords()].sort((a,b)=>a.date.localeCompare(b.date)).forEach(r=>{line(`${fmtDate(r.date,{day:'2-digit',month:'2-digit',year:'numeric'})}  |  ${r.sensation}  |  ${r.appearance}  |  Sangramento: ${r.bleeding}${r.pbi?'  |  PBI':''}  |  Selo: ${mobStampMeta(r).label}${peakLabel(r.peakMarker)?'  |  '+peakLabel(r.peakMarker):''}`,8.5,true);if(r.notes)line('Notas: '+r.notes,8);y+=1});
 y+=2;line('Aviso',11,true);line('Este relatorio organiza registros informados pela usuaria e nao faz classificacao automatica de fertilidade nem substitui orientacao qualificada.',8);doc.save(`cycleseed-relatorio-${TODAY}.pdf`);toast('PDF gerado')}
function render(){const titles={today:'Hoje',cycle:'Meu ciclo',history:'Gráfico',edit:'Editar registro',learn:'Aprender',lesson:(lessons.find(l=>l.id===state.lessonId)?.title||'Módulo'),support:'Apoio',profile:'Perfil',reminders:'Lembretes'};title.textContent=titles[state.route]||'Ciclo MOB';const isSubView=state.route==='lesson'||state.route==='edit';backBtn.classList.toggle('hidden',!isSubView);backBtn.onclick=state.route==='lesson'?()=>route('learn'):state.route==='edit'?()=>{if(state.editReturn==='cycle')state.cycleTab='chart';route(state.editReturn||'cycle')}:null;app.innerHTML=({today:todayView,cycle:cycleView,history:historyView,edit:editView,learn:learnView,lesson:lessonView,support:supportView,profile:profileView,reminders:remindersView}[state.route])();const navRoute=state.route==='lesson'?'learn':state.route==='edit'&&state.editReturn==='cycle'?'cycle':state.route;nav.forEach(n=>n.classList.toggle('active',n.dataset.route===navRoute));updateHeaderActions();bind()}
function bind(){
 if(homeBellBtn)homeBellBtn.onclick=()=>route('reminders');
 document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>route(b.dataset.go));
 document.querySelectorAll('[data-cycle-tab]').forEach(b=>b.onclick=()=>{state.cycleTab=b.dataset.cycleTab;render()});
 document.querySelectorAll('[data-cycle-move]').forEach(b=>b.onclick=async()=>{const ordered=orderedCycles(),idx=ordered.findIndex(c=>c.id===state.activeCycleId),nextIdx=idx+Number(b.dataset.cycleMove);if(nextIdx<0||nextIdx>=ordered.length)return;state.activeCycleId=ordered[nextIdx].id;const c=activeCycle();if(c){state.settings.lastPeriod=c.startDate;state.settings.cycleLength=c.cycleLength;state.settings.periodLength=c.periodLength}save();await loadSharingData();render();requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'auto'}))});
 const inviteForm=document.querySelector('#inviteForm');if(inviteForm)inviteForm.onsubmit=createInvitation;
 document.querySelectorAll('[data-copy-invite]').forEach(b=>b.onclick=()=>copyInviteLink(b.dataset.copyInvite));
 document.querySelectorAll('[data-revoke-invite]').forEach(b=>b.onclick=()=>revokeInvitation(b.dataset.revokeInvite));
 document.querySelectorAll('[data-revoke-member]').forEach(b=>b.onclick=()=>revokeMembership(b.dataset.revokeMember));
 document.querySelectorAll('[data-month]').forEach(b=>b.onclick=()=>{state.calendarCursor=new Date(state.calendarCursor.getFullYear(),state.calendarCursor.getMonth()+Number(b.dataset.month),1);render()});
 document.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{const rec=activeRecords().find(r=>r.date===b.dataset.date);toast(rec?`${fmtDate(rec.date)}: ${rec.sensation}, ${rec.appearance}`:`${fmtDate(b.dataset.date)}: sem registro`)});
 document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{if(confirm('Excluir este registro?')){const id=b.dataset.delete;state.records=state.records.filter(r=>r.id!==id);save();deleteRecordCloud(id);render();toast('Registro excluído')}});
 document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{b.classList.add('pressed');state.editRecordId=b.dataset.edit;state.editReturn=state.route==='cycle'?'cycle':'history';route('edit')});
 const rf=document.querySelector('#recordForm');if(rf)rf.onsubmit=e=>{e.preventDefault();const fd=new FormData(rf);const targetCycle=currentOpenCycle()||activeCycle();if(!targetCycle||targetCycle.endDate){toast('Não há um ciclo aberto para registrar');return}state.activeCycleId=targetCycle.id;const rec={id:crypto.randomUUID(),cycleId:targetCycle.id,date:fd.get('date'),sensation:fd.get('sensation'),appearance:fd.get('appearance'),bleeding:fd.get('bleeding'),pbi:fd.get('pbi')==='true',chartStamp:fd.get('chartStamp')||'',peakMarker:fd.get('peakMarker')||'',notes:fd.get('notes'),createdAt:Date.now()};const idx=state.records.findIndex(r=>r.cycleId===targetCycle.id&&r.date===rec.date);if(idx>=0){rec.id=state.records[idx].id;rec.createdAt=state.records[idx].createdAt;state.records[idx]=rec}else state.records.push(rec);save();saveRecordCloud(rec);render();toast('Registro do dia salvo com sucesso')};
 const erf=document.querySelector('#editRecordForm');if(erf)erf.onsubmit=e=>{e.preventDefault();const original=activeRecords().find(r=>r.id===state.editRecordId);if(!original){toast('Registro não encontrado');state.cycleTab='chart';route('cycle');return}const fd=new FormData(erf),date=fd.get('date');const conflict=activeRecords().find(r=>r.date===date&&r.id!==original.id);if(conflict){toast('Já existe um registro nesta data');return}const updated={...original,date,sensation:fd.get('sensation'),appearance:fd.get('appearance'),bleeding:fd.get('bleeding'),pbi:fd.get('pbi')==='true',chartStamp:fd.get('chartStamp')||'',peakMarker:fd.get('peakMarker')||'',notes:fd.get('notes'),updatedAt:Date.now()};const idx=state.records.findIndex(r=>r.id===original.id);state.records[idx]=updated;save();saveRecordCloud(updated);state.editRecordId=null;const target=state.editReturn||'cycle';if(target==='cycle')state.cycleTab='chart';route(target);toast('Registro atualizado com sucesso')};
 const psf=document.querySelector('#profileSetupForm');if(psf)psf.onsubmit=async e=>{e.preventDefault();const fd=new FormData(psf);state.settings.profileName=String(fd.get('profileName')||'').trim();state.settings.lastPeriod=String(fd.get('lastPeriod'));state.settings.cycleLength=Math.max(15,Math.min(60,Number(fd.get('cycleLength'))||28));state.settings.periodLength=Math.max(1,Math.min(15,Number(fd.get('periodLength'))||5));state.settings.cycleConfigured=true;let c=currentOpenCycle()||activeCycle();if(!c){c={id:crypto.randomUUID(),name:'Ciclo atual',startDate:state.settings.lastPeriod,endDate:null,cycleLength:state.settings.cycleLength,periodLength:state.settings.periodLength,accessRole:'owner',ownerId:state.user?.id||null};state.cycles=[c];state.activeCycleId=c.id}else{c.startDate=state.settings.lastPeriod;c.cycleLength=state.settings.cycleLength;c.periodLength=state.settings.periodLength}markProfileConfigured();save();try{await saveProfileCloud(true);await saveAppSettingsCloud();await saveCycleCloud(c);toast('Perfil configurado com sucesso');route('today')}catch(err){console.warn('Profile sync',err);toast('Perfil salvo no aparelho, mas a sincronização falhou')}};
 document.querySelectorAll('[data-setting]').forEach(b=>b.onclick=()=>{const k=b.dataset.setting;state.settings[k]=!state.settings[k];save();saveAppSettingsCloud();if(k==='reminder')refreshPushSettings();render()});
 document.querySelectorAll('[data-open-lesson]').forEach(b=>b.onclick=()=>{state.lessonId=b.dataset.openLesson;route('lesson')});
 document.querySelectorAll('[data-complete-lesson]').forEach(b=>b.onclick=()=>{const id=b.dataset.completeLesson;if(!state.completedLessons.includes(id))state.completedLessons.push(id);save();saveLearningProgressCloud(id);render();toast('Módulo concluído')});
 const rt=document.querySelector('#reminderTime');if(rt)rt.onchange=e=>{state.settings.reminderTime=e.target.value;save();saveAppSettingsCloud();refreshPushSettings();toast('Horário atualizado')};
 const lp=document.querySelector('#lastPeriod');if(lp)lp.onchange=e=>{const c=activeCycle();if(c){c.startDate=e.target.value;state.settings.lastPeriod=e.target.value;state.settings.cycleConfigured=true;save();saveCycleCloud(c);saveProfileCloud(true)}toast('Data atualizada')};
 const cln=document.querySelector('#cycleLength');if(cln)cln.onchange=e=>{const c=activeCycle();if(c){c.cycleLength=Math.max(15,Math.min(60,Number(e.target.value)||28));state.settings.cycleLength=c.cycleLength;state.settings.cycleConfigured=true;save();saveCycleCloud(c);saveProfileCloud(true)}render();toast('Ciclo médio atualizado')};
 const pln=document.querySelector('#periodLength');if(pln)pln.onchange=e=>{const c=activeCycle();if(c){c.periodLength=Math.max(1,Math.min(15,Number(e.target.value)||5));state.settings.periodLength=c.periodLength;state.settings.cycleConfigured=true;save();saveCycleCloud(c);saveProfileCloud(true)}render();toast('Duração atualizada')};
 const ex=document.querySelector('#exportBtn');if(ex)ex.onclick=exportCSV;
 const bk=document.querySelector('#backupBtn');if(bk)bk.onclick=()=>download('cycleseed-backup.json',JSON.stringify({cycles:state.cycles,activeCycleId:state.activeCycleId,records:state.records,messages:state.messages,settings:state.settings,completedLessons:state.completedLessons},null,2),'application/json');
 const clear=document.querySelector('#clearBtn');if(clear)clear.onclick=()=>{if(confirm('Apagar todos os dados locais deste protótipo?')){localStorage.clear();location.reload()}};
 const pdf=document.querySelector('#pdfBtn');if(pdf)pdf.onclick=generatePDF;
 const push=document.querySelector('#enablePushBtn');if(push)push.onclick=enablePush;
 const testPush=document.querySelector('#testPushBtn');if(testPush)testPush.onclick=testNotification;
 const logout=document.querySelector('#logoutBtn');if(logout)logout.onclick=signOut;
 const themeProfile=document.querySelector('#themeToggleProfile');if(themeProfile)themeProfile.onclick=toggleTheme;
}

function exportCSV(){const rows=[['Data','Sensação','Aparência','Sangramento','PBI','Selo MOB','Marcação especial','Notas'],...activeRecords().map(r=>[r.date,r.sensation,r.appearance,r.bleeding,r.pbi?'Sim':'Não',mobStampMeta(r).label,peakLabel(r.peakMarker),r.notes])];const csv=rows.map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\n');download('cycleseed-registros.csv','\ufeff'+csv,'text/csv;charset=utf-8');toast('CSV exportado')}
function download(name,data,type){const a=document.createElement('a');const url=URL.createObjectURL(new Blob([data],{type}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),500)}
function toggleTheme(){state.settings.theme=state.settings.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=state.settings.theme;document.querySelector('meta[name=theme-color]')?.setAttribute('content',state.settings.theme==='dark'?'#5B4053':'#6F4E67');save();saveAppSettingsCloud();render()}
document.documentElement.dataset.theme=state.settings.theme;
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js');
initAuth();

window.addEventListener('load',()=>setTimeout(dismissLaunchSplash,80),{once:true});
