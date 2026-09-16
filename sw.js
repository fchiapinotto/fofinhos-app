// Service worker: torna o app instalável; rede primeiro, cache só como reserva da casca. + notificações push.
const C='fofinhos-v6';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./manifest.webmanifest'])));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin))return;
  e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request)));});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{};}catch(x){d={corpo:e.data&&e.data.text()};}
  const titulo=d.titulo||'Nossos Fofinhos';
  e.waitUntil(self.registration.showNotification(titulo,{body:d.corpo||'',icon:'icon-192.png',badge:'icon-192.png',tag:d.tag||'fofinhos',data:{url:d.url||'./'}}));});
self.addEventListener('notificationclick',e=>{e.notification.close();
  const alvo=new URL((e.notification.data&&e.notification.data.url)||'./',self.location.href).href;
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{
    for(const w of ws){if(w.url.startsWith(self.location.origin)&&'focus' in w){if('navigate' in w&&w.url!==alvo){try{w.navigate(alvo);}catch(x){}}return w.focus();}}
    if(clients.openWindow)return clients.openWindow(alvo);}));});
