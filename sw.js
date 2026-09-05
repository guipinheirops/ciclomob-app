const CACHE='ciclo-mob-v39';
const META_CACHE='cycleseed-meta';
const ASSETS=['./','./index.html','./styles.css','./app.js','./config.js','./manifest.webmanifest','./icons/icon-192.png','./icons/favicon.svg'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener('activate',event=>{
  event.waitUntil(Promise.all([
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k!==META_CACHE).map(k=>caches.delete(k)))),
    self.clients.claim()
  ]));
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok && new URL(event.request.url).origin===self.location.origin){
      const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    }
    return response;
  }).catch(()=>caches.match('./index.html'))));
});

self.addEventListener('push',event=>{
  let data={title:'Ciclo MOB',body:'Hora de registrar suas observações de hoje.',url:'./'};
  try{if(event.data)data={...data,...event.data.json()}}catch(_){if(event.data)data.body=event.data.text()}
  event.waitUntil(Promise.all([
    caches.open(META_CACHE).then(cache=>cache.put(new URL('./__reminder_unread__',self.location.href).href,new Response(String(Date.now())))),
    self.registration.showNotification(data.title||'Ciclo MOB',{
      body:data.body,
      icon:'./icons/icon-192.png',
      badge:'./icons/icon-192.png',
      tag:data.tag||'cycleseed-reminder',
      renotify:false,
      data:{url:data.url||'./'}
    }),
    self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>list.forEach(client=>client.postMessage({type:'REMINDER_RECEIVED'})))
  ]));
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const target=new URL(event.notification.data?.url||'./',self.location.origin).href;
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    for(const client of list){if('focus' in client){client.navigate(target);return client.focus()}}
    if(clients.openWindow)return clients.openWindow(target);
  }));
});
