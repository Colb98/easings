import {hosted, getShareLinks} from './sharing.js';
import {definitions,defaults,evaluate} from './easings.js';
const $=s=>document.querySelector(s);
const selected=new Set(definitions.map(d=>d.id));
const parameters=Object.fromEntries(definitions.map(d=>[d.id,defaults(d.family)]));
let views=[],duration=2,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,elapsed=0,last=performance.now();
const specs={exponent:[.2,20,.1],overshoot:[0,5,.1],amplitude:[1,3,.1],period:[.1,1,.01],bounces:[1,6,1],decay:[.2,.8,.05]};
function render(){
 $('#grid').innerHTML='';views=[];
 definitions.filter(d=>selected.has(d.id)).forEach(d=>{
  const cell=document.createElement('article');cell.className='cell';cell.dataset.easing=d.id;
  cell.innerHTML=`<div class="cell-head"><h2>${d.name}</h2><span class="mode">${d.mode==='InOut'?'in · out':d.mode||'constant'}</span></div><div class="visual"><div class="track"><div class="rail"></div><div class="ball"></div></div><svg class="graph" viewBox="0 0 200 140" role="img" aria-label="${d.name} position over time"><path class="guide" d="M0 22H200 M0 70H200 M0 118H200 M0 22V118 M100 22V118 M200 22V118"/><line class="cursor" y1="22" y2="118"/><path class="curve"/><circle class="graph-dot" r="3.5"/></svg><div class="axis"><span>0</span><span>time →</span><span>1</span></div></div><div class="params"></div>`;
  const paramBox=cell.querySelector('.params');const keys=Object.keys(parameters[d.id]);
  if(!keys.length)paramBox.innerHTML='<div class="fixed"><span>Standard curve</span><span>ƒ(t)</span></div>';
  keys.forEach(key=>{
   const [min,max,step]=specs[key];const label=document.createElement('label');label.className='param';
   label.innerHTML=`<span>${key[0].toUpperCase()+key.slice(1)}</span><input aria-label="${d.name} ${key}" type="number" min="${min}" max="${max}" step="${step}" value="${parameters[d.id][key]}">`;
   label.querySelector('input').addEventListener('input',e=>{if(e.target.value!==''&&e.target.validity.valid){parameters[d.id][key]=Number(e.target.value);drawCurve(view);paint();}});
   label.querySelector('input').addEventListener('change',e=>{if(!e.target.validity.valid||e.target.value==='')e.target.value=parameters[d.id][key];});paramBox.append(label);
  });
  $('#grid').append(cell);
  const view={d,cell,ball:cell.querySelector('.ball'),curve:cell.querySelector('.curve'),dot:cell.querySelector('.graph-dot'),cursor:cell.querySelector('.cursor')};views.push(view);drawCurve(view);
 });
 $('#visible-count').textContent=selected.size;$('#selected-count').textContent=`${selected.size} selected`;$('#empty').hidden=!!selected.size;paint();
}
function drawCurve(view){
 const samples=Array.from({length:401},(_,i)=>evaluate(view.d,i/400,parameters[view.d.id]));
 // Expand vertical space for extreme parameter values without clipping overshoot.
 const left=Math.max(.14,-Math.min(...samples)+.04),right=Math.max(.14,Math.max(...samples)-1+.04),span=1+left+right;
 view.cell.querySelector('.visual').style.marginLeft=`${left/span*100}%`;
 view.cell.querySelector('.visual').style.marginRight=`${right/span*100}%`;
 view.low=Math.min(-.22,...samples);view.high=Math.max(1.22,...samples);
 view.y=value=>140-(value-view.low)/(view.high-view.low)*140;
 view.curve.setAttribute('d',samples.map((v,i)=>`${i?'L':'M'}${i/2},${view.y(v)}`).join(' '));
 const top=view.y(1),bottom=view.y(0),middle=view.y(.5);
 view.cell.querySelector('.guide').setAttribute('d',`M0 ${top}H200 M0 ${middle}H200 M0 ${bottom}H200 M0 ${top}V${bottom} M100 ${top}V${bottom} M200 ${top}V${bottom}`);
 view.cursor.setAttribute('y1',top);view.cursor.setAttribute('y2',bottom);
}
function progress(){return Math.min(elapsed/duration,1);}
function paint(){const t=progress();views.forEach(v=>{const value=evaluate(v.d,t,parameters[v.d.id]);v.ball.style.left=`${value*100}%`;v.dot.setAttribute('cx',t*200);v.dot.setAttribute('cy',v.y(value));v.cursor.setAttribute('x1',t*200);v.cursor.setAttribute('x2',t*200);});$('#progress').value=t;$('#time').textContent=`${(t*duration).toFixed(2)} s`;}
function updatePlay(){$('#play').textContent=playing?'Ⅱ Pause':'▶ Play';$('.live').innerHTML=`<i></i> ${playing?'SYNCHRONIZED PLAYBACK':'PLAYBACK PAUSED'}`;}
$('#play').onclick=()=>{playing=!playing;if(playing&&elapsed>=duration)elapsed=0;last=performance.now();updatePlay();};
$('#restart').onclick=()=>{elapsed=0;last=performance.now();paint();};
$('#progress').oninput=e=>{playing=false;elapsed=Number(e.target.value)*duration;updatePlay();paint();};
$('#duration').oninput=e=>{if(e.target.value&&e.target.validity.valid){const t=progress();duration=Number(e.target.value);elapsed=t*duration;$('#total').textContent=`${duration.toFixed(2)} s`;paint();}};
$('#duration').onchange=e=>{e.target.value=duration;};
$('#size').onchange=e=>{$('#grid').className=e.target.value;};
function renderOptions(){const term=$('#search').value.toLowerCase();$('#options').innerHTML='';definitions.filter(d=>d.name.toLowerCase().includes(term)).forEach(d=>{const label=document.createElement('label');const input=document.createElement('input');input.type='checkbox';input.checked=selected.has(d.id);input.onchange=()=>{input.checked?selected.add(d.id):selected.delete(d.id);render();};label.append(input,document.createTextNode(d.name));$('#options').append(label);});}
function toggleFilter(open){$('#filter-menu').hidden=!open;$('#filter').setAttribute('aria-expanded',String(open));if(open)$('#search').focus();}
$('#filter').onclick=()=>toggleFilter($('#filter-menu').hidden);$('#search').oninput=renderOptions;
function all(){definitions.forEach(d=>selected.add(d.id));renderOptions();render();}
$('#all').onclick=all;$('#restore').onclick=all;$('#none').onclick=()=>{selected.clear();renderOptions();render();};
document.addEventListener('click',e=>{if(!e.target.closest('.filter-wrap'))toggleFilter(false);});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){toggleFilter(false);}});
$('#reset').onclick=()=>{definitions.forEach(d=>parameters[d.id]=defaults(d.family));render();};
if(hosted){
 $('#share span').textContent='Share page';
 $('#share-dialog > p').textContent='Scan the code to open this page on another device.';
 $('.share-note').textContent='Anyone with this link can open the page. Each device has its own comparison session.';
}
$('#share').onclick=async()=>{
 $('#share-dialog').showModal();
 try{const links=await getShareLinks();const box=$('#share-content');box.innerHTML='';
 if(!links.length){box.textContent='No local network address found. Connect this computer to Wi-Fi and try again.';return;}
 const image=document.createElement('img');image.alt='QR code to open Easing Lab';const link=document.createElement('a');const select=document.createElement('select');select.setAttribute('aria-label','Local network address');
 links.forEach((item,i)=>{const option=document.createElement('option');option.value=i;option.textContent=`${item.name} · ${item.address}`;select.append(option);});
 function choose(i){image.src=links[i].qr;link.href=links[i].url;link.textContent=links[i].url;}
 select.onchange=()=>choose(Number(select.value));if(links.length>1)box.append(select);box.append(image,link);choose(0);
 }catch{$('#share-content').textContent='Could not load the sharing link. Please try again.';}
};
$('#close-share').onclick=()=>$('#share-dialog').close();$('#share-dialog').onclick=e=>{if(e.target===$('#share-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}};
render();renderOptions();updatePlay();
function frame(now){if(playing){elapsed+=(now-last)/1000;if(elapsed>duration+.6)elapsed=0;paint();}last=now;requestAnimationFrame(frame);}requestAnimationFrame(frame);
