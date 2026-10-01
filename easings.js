export const families = ['Sine','Quad','Cubic','Quart','Quint','Expo','Circ','Back','Elastic','Bounce'];
export const modes = ['In','Out','InOut'];
export const definitions = [{id:'linear',family:'Linear',mode:'',name:'linear'},...families.flatMap(family=>modes.map(mode=>({id:`ease${mode}${family}`,family,mode,name:`ease${mode}${family}`})))];
export function defaults(family){
 if(['Quad','Cubic','Quart','Quint'].includes(family)) return {exponent:{Quad:2,Cubic:3,Quart:4,Quint:5}[family]};
 if(family==='Expo') return {exponent:10};
 if(family==='Back') return {overshoot:1.70158};
 if(family==='Elastic') return {amplitude:1,period:.3};
 if(family==='Bounce') return {bounces:3,decay:.5};
 return {};
}
function bounceOut(t,{bounces,decay}) {
 const r=decay; const initial=1/(1+2*Array.from({length:bounces},(_,i)=>r**(i+1)).reduce((a,b)=>a+b,0));
 if(t<initial)return (t/initial)**2;
 let start=initial;
 for(let i=1;i<=bounces;i++){const width=2*initial*r**i;if(t<=start+width || i===bounces){const u=(t-start)/width;return 1-r**(2*i)*4*u*(1-u);}start+=width;}
 return 1;
}
export function evaluate(def,t,p=defaults(def.family)) {
 if(t===0||t===1)return t;
 const base=x=>{
  switch(def.family){
   case 'Linear':return x;
   case 'Sine':return 1-Math.cos(x*Math.PI/2);
   case 'Quad':case 'Cubic':case 'Quart':case 'Quint':return x**p.exponent;
   case 'Expo':return 2**(p.exponent*(x-1));
   case 'Circ':return 1-Math.sqrt(Math.max(0,1-x*x));
   case 'Back':return (p.overshoot+1)*x*x*x-p.overshoot*x*x;
   case 'Elastic':{const a=p.amplitude,period=def.mode==='InOut'?p.period*1.5:p.period;const s=period/(2*Math.PI)*Math.asin(1/a);return -a*2**(10*(x-1))*Math.sin((x-1-s)*2*Math.PI/period);}
   case 'Bounce':return 1-bounceOut(1-x,p);
  }
 };
 // The conventional InOut Back curve uses a stronger overshoot coefficient.
 if(def.family==='Back'&&def.mode==='InOut') {const s=p.overshoot*1.525; return t<.5?(2*t)**2*((s+1)*2*t-s)/2:((2*t-2)**2*((s+1)*(2*t-2)+s)+2)/2;}
 if(def.mode==='Out')return 1-base(1-t);
 if(def.mode==='InOut')return t<.5?base(t*2)/2:1-base(2-2*t)/2;
 return base(t);
}
