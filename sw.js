// Service worker: torna o app instalável; rede primeiro, cache só como reserva da casca. + notificações push.
// Ao publicar mudança no app, suba a versão abaixo (a tela avisa "Nova versão — tocar para atualizar").
const C='fofinhos-v12';
const CASCA=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png'];
// bibliotecas de fora (versões fixas): guardadas para o app abrir mesmo sem internet
const CDN=/^https:\/\/(cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(CASCA)));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const q=e.request;if(q.method!=='GET'||q.cache==='no-store')return;
  const u=new URL(q.url);
  if(u.origin===self.location.origin){
    const nav=q.mode==='navigate';
    e.respondWith(fetch(q).then(r=>{if(r.ok&&!u.search){const cp=r.clone();caches.open(C).then(c=>c.put(q,cp));}return r;})
      .catch(()=>caches.match(q,{ignoreSearch:true}).then(m=>m||(nav?caches.match('./index.html'):undefined)).then(m=>m||Response.error())));
    return;}
  if(CDN.test(q.url)){
    // cache primeiro, atualiza por trás. Cópia "opaca" (guardada sem CORS) não serve para pedido que
    // confere a integridade do arquivo (integrity) — nesse caso vai direto para a rede.
    e.respondWith(caches.open(C).then(c=>c.match(q).then(m=>{
      if(m&&m.type==='opaque'&&q.mode==='cors')m=null;
      const net=fetch(q).then(r=>{if(r.ok||r.type==='opaque')c.put(q,r.clone());return r;}).catch(()=>m||Response.error());
      return m||net;})));
  }});
self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{};}catch(x){d={corpo:e.data&&e.data.text()};}
  const titulo=d.titulo||'Nossos Fofinhos';
  e.waitUntil(self.registration.showNotification(titulo,{body:d.corpo||'',icon:'icon-192.png',badge:'icon-192.png',tag:d.tag||'fofinhos',data:{url:d.url||'./'}}));});
self.addEventListener('notificationclick',e=>{e.notification.close();
  const alvo=new URL((e.notification.data&&e.notification.data.url)||'./',self.location.href).href;
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{
    for(const w of ws){if(w.url.startsWith(self.location.origin)&&'focus' in w){if('navigate' in w&&w.url!==alvo){try{w.navigate(alvo);}catch(x){}}return w.focus();}}
    if(clients.openWindow)return clients.openWindow(alvo);}));});
