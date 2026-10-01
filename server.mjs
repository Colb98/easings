import http from 'node:http';
import { networkInterfaces } from 'node:os';
import { readFile } from 'node:fs/promises';
import QRCode from 'qrcode';
const port = Number(process.env.PORT || 5173);
const files = new Map([['/', ['index.html','text/html']], ['/app.js',['app.js','text/javascript']], ['/sharing.js',['sharing.js','text/javascript']], ['/favicon.svg',['favicon.svg','image/svg+xml']], ['/easings.js',['easings.js','text/javascript']], ['/style.css',['style.css','text/css']]]);
http.createServer(async (req,res) => {
 try {
  const path = new URL(req.url,'http://localhost').pathname;
  if(path === '/api/share') {
   const addresses = Object.entries(networkInterfaces()).flatMap(([name,items])=> items.filter(i=>i.family==='IPv4'&&!i.internal&&!name.startsWith('utun')).map(i=>({name,address:i.address}))).sort((a,b)=>Number(b.name==='en0')-Number(a.name==='en0'));
   const links = await Promise.all(addresses.map(async i=> {const url=`http://${i.address}:${port}`;return {...i,url,qr:await QRCode.toDataURL(url,{width:256,margin:2,color:{dark:'#17231fff',light:'#ffffffff'}})};}));
   res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({links}));return;
  }
  if(!files.has(path)){res.writeHead(404);res.end('Not found');return;}
  const [file,type]=files.get(path);res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-cache'});res.end(await readFile(new URL(file,import.meta.url)));
 } catch {res.writeHead(500);res.end('Unable to serve page');}
}).listen(port,'0.0.0.0',()=>console.log(`Easing Lab running at http://localhost:${port} (LAN enabled)`));
