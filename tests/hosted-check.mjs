import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const assets = {'/':['index.html','text/html'],'/app.js':['app.js','text/javascript'],'/style.css':['style.css','text/css'],'/favicon.svg':['favicon.svg','image/svg+xml']};
const server=createServer(async(req,res)=>{
 const asset=assets[req.url];
 if(!asset){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',asset[1]);res.end(await readFile(new URL(`../dist/${asset[0]}`,import.meta.url)));
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
let browser;
try {
 browser=await chromium.launch();
 const page=await browser.newPage();const errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 await page.goto(origin);
 assert.equal(await page.locator('.cell').count(),31);
 await page.getByRole('button',{name:'Share page'}).click();
 await page.locator('#share-content img').waitFor();
 assert.equal(await page.locator('#share-content a').getAttribute('href'),`${origin}/`);
 await page.waitForFunction(()=>document.querySelector('#share-content img')?.naturalWidth>0);
 assert.ok(!requests.some(url=>url.includes('/api/share')));
 assert.equal((await page.request.get(`${origin}/favicon.svg`)).status(),200);
 assert.deepEqual(errors,[]);
 console.log('PASS: static page renders, hosted QR uses current origin without backend, favicon loads, no browser errors.');
} finally {await browser?.close();await new Promise(resolve=>server.close(resolve));}
