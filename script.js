const $=s=>document.querySelector(s),MAXN=1e15;
const M={normal:{n:'Normal Mode',p:1/137500,c:'#8aa4d6',r:'1 in 137,500 per chest (0.0007272727%)'},
th:{n:'Treasure Hour (1.5×)',p:1.5/137500,c:'#e8b84a',r:'About 1 in 91,667 per chest (0.0010909%)'},
sp:{n:'Special Treasure Hour (2×)',p:2/137500,c:'#ff8a4c',r:'1 in 68,750 per chest (0.0014545%)'}};
const KEYS=Object.keys(M);
let mode='normal',n=1000,gm='normal',shown=0,tw=0;
try{const s=JSON.parse(localStorage.getItem('ptc'));if(s){if(M[s.mode])mode=s.mode;if(s.n>=1)n=Math.min(MAXN,Math.floor(s.n))}}catch(e){}
gm=mode;
const lq=p=>Math.log1p(-p),hit=(p,c)=>-Math.expm1(c*lq(p)),miss=(p,c)=>Math.exp(c*lq(p)),need=(p,t)=>Math.ceil(Math.log1p(-t)/lq(p));
function pct(x){const v=x*100;if(x>=1)return'100%';if(v<=0)return'0%';if(v>=99.99)return'99.99%+';if(v<0.0001)return'<0.0001%';return v.toFixed(v<0.01?4:v<1?3:2)+'%'}
const expt=e=>e<1?e.toFixed(e<.01?4:3):e<100?e.toFixed(2):Math.round(e).toLocaleString();
const short=v=>v>=1e6?+(v/1e6).toFixed(1)+'M':v>=1e3?+(v/1e3).toFixed(1)+'k':v;
const nice=v=>{const e=10**Math.floor(Math.log10(v)),m=v/e;return(m<=1?1:m<=2?2:m<=5?5:10)*e};
function plain(x){
  if(x>.995)return'Almost every player who opens '+n.toLocaleString()+' chests would find the token.';
  for(const g of[100,1e3,1e4,1e5,1e6])if(x*g>=1||g==1e6)return'Out of '+g.toLocaleString()+' players who open '+n.toLocaleString()+' chests, about '+Math.round(x*g).toLocaleString()+' would find the token.'}
function tween(x){
  const a=shown,t0=performance.now(),still=matchMedia('(prefers-reduced-motion:reduce)').matches;shown=x;cancelAnimationFrame(tw);
  const f=t=>{const k=still?1:Math.min(1,(t-t0)/450),e=1-Math.pow(1-k,3);$('#big').textContent=pct(a+(x-a)*e);if(k<1)tw=requestAnimationFrame(f)};tw=requestAnimationFrame(f)}
function graph(){
  const W=640,H=310,L=48,R=16,T=16,B=44,pw=W-L-R,ph=H-T-B,p=M[gm].p,xm=nice(need(p,.99)),X=v=>L+v/xm*pw,Y=v=>T+(1-v)*ph;
  let s='';
  [0,.25,.5,.75,1].forEach(v=>{s+='<line class="gl" x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text x="'+(L-8)+'" y="'+(Y(v)+4)+'" text-anchor="end">'+v*100+'%</text><text x="'+X(v*xm)+'" y="'+(H-24)+'" text-anchor="'+(v==0?'start':v==1?'end':'middle')+'">'+short(v*xm)+'</text>'});
  s+='<text x="'+(L+pw/2)+'" y="'+(H-5)+'" text-anchor="middle">Chests opened</text>';
  const path=k=>{let d='';for(let i=0;i<=80;i++){const c=xm*i/80;d+=(i?'L':'M')+X(c).toFixed(1)+' '+Y(hit(M[k].p,c)).toFixed(1)}return d};
  KEYS.forEach(k=>{if(k!=gm)s+='<path d="'+path(k)+'" fill="none" stroke="'+M[k].c+'" stroke-opacity=".35" stroke-width="2"/>'});
  const d=path(gm);
  s+='<path d="'+d+'L'+X(xm)+' '+Y(0)+'L'+X(0)+' '+Y(0)+'Z" fill="'+M[gm].c+'" fill-opacity=".13"/><path d="'+d+'" fill="none" stroke="'+M[gm].c+'" stroke-width="3.5" stroke-linecap="round"/>';
  if(n>=1){const c=Math.min(n,xm),px=X(c),end=px>W*.6;
    s+='<line class="mk" x1="'+px+'" x2="'+px+'" y1="'+T+'" y2="'+Y(0)+'"/><circle cx="'+px+'" cy="'+Y(hit(p,c))+'" r="6" fill="'+M[gm].c+'" stroke="#050a18" stroke-width="2"/><text class="you" x="'+(px+(end?-8:8))+'" y="'+(T+14)+'" text-anchor="'+(end?'end':'start')+'">You: '+n.toLocaleString()+' chests</text>'}
  $('#gr').innerHTML=s;
  document.querySelectorAll('[data-g]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.g==gm));
  $('#mil').textContent='In '+M[gm].n+', a 50% chance takes about '+need(p,.5).toLocaleString()+' chests and a 90% chance takes about '+need(p,.9).toLocaleString()+' chests.'}
function calc(){
  document.querySelectorAll('[data-m]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m==mode));
  $('#rate').innerHTML='<b>'+M[mode].n+'</b> drop rate: '+M[mode].r;
  const ok=n>=1;$('#out').hidden=!ok;$('#hint').hidden=ok;
  if(ok){
    const p=M[mode].p,x=hit(p,n),s=pct(x);
    $('#art').textContent=/^(8|11|18)/.test(s)?'an':'a';
    tween(x);$('#fill').style.width=Math.max(.8,x*100)+'%';
    $('#plain').textContent=plain(x);$('#miss').textContent=pct(miss(p,n));$('#exp').textContent=expt(n*p);
    KEYS.forEach(k=>{const v=hit(M[k].p,n),r=$('#cp-'+k);r.querySelector('i').style.width=Math.max(.8,v*100)+'%';r.querySelector('b').textContent=pct(v);r.classList.toggle('on',k==mode)})}
  graph();
  try{localStorage.setItem('ptc',JSON.stringify({mode,n}))}catch(e){}}
KEYS.forEach(k=>{const r=document.createElement('div');r.className='cp';r.id='cp-'+k;r.innerHTML='<span class="nm"><u style="background:'+M[k].c+'"></u>'+M[k].n+'</span><b></b><span class="trk"><i style="background:'+M[k].c+'"></i></span>';$('#cmp').append(r)});
[100,500,1000,2000,3000,5000,10000].forEach(v=>{const b=document.createElement('button');b.textContent=v.toLocaleString();b.onclick=()=>{n=v;$('#n').value=v.toLocaleString();$('#err').textContent='';calc()};$('#chips').append(b)});
const inp=$('#n');
inp.oninput=()=>{let d=inp.value.replace(/\D/g,'').replace(/^0+/,'');if(Number(d)>MAXN)d=String(MAXN);if(inp.value!=d)inp.value=d;n=d?Number(d):0;$('#err').textContent='';calc()};
inp.onfocus=()=>{inp.value=n>=1?String(n):''};
inp.onblur=()=>{inp.value=n>=1?n.toLocaleString():''};
document.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{mode=gm=b.dataset.m;calc()});
document.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{gm=b.dataset.g;graph()});
$('#calc').onclick=()=>{
  if(n<1){$('#err').textContent='Enter a whole number of 1 or more.';inp.focus();return}
  calc();const r=$('#res');r.scrollIntoView({behavior:'smooth',block:'center'});r.classList.remove('pulse');void r.offsetWidth;r.classList.add('pulse')};
inp.value=n.toLocaleString();calc();
