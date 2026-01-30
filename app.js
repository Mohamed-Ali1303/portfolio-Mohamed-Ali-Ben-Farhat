// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile menu
const hamb = document.getElementById("hamb");
const drawer = document.getElementById("drawer");

hamb?.addEventListener("click", () => {
  const expanded = hamb.getAttribute("aria-expanded") === "true";
  hamb.setAttribute("aria-expanded", String(!expanded));
  drawer.classList.toggle("show");
  drawer.setAttribute("aria-hidden", String(expanded));
});

drawer?.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    hamb.setAttribute("aria-expanded","false");
    drawer.classList.remove("show");
    drawer.setAttribute("aria-hidden","true");
  });
});

// Reveal
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting) e.target.classList.add("is-in");
  });
},{threshold:.14});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

// Ticker (kept)
const ticker = document.getElementById("ticker");
const lines = [
  "GLPI • Support • Incidents",
  "Infra Web • Apache/PHP/MySQL",
  "Sécurité • SQLi/XSS/CSRF • HTTPS",
  "Data • Power BI • KPI • Excel"
];
let idx = 0, pos = 0, del = false;
function tick(){
  const txt = lines[idx];
  if(!ticker) return;
  if(!del){
    pos++;
    ticker.textContent = txt.slice(0,pos);
    if(pos >= txt.length){ del=true; setTimeout(tick, 1050); return; }
  }else{
    pos--;
    ticker.textContent = txt.slice(0,pos);
    if(pos <= 0){ del=false; idx=(idx+1)%lines.length; }
  }
  setTimeout(tick, del ? 28 : 48);
}
tick();

/* =========================================
   BACKGROUND: Terminal Grid / Data Stream
   ========================================= */
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d", { alpha: true });

let W=0,H=0,DPR=Math.min(2, window.devicePixelRatio || 1);
function resize(){
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(DPR,0,0,DPR,0,0);
}
window.addEventListener("resize", resize);
resize();

function rnd(min,max){ return min + Math.random()*(max-min); }

const packets = [];
const streams = [];
const PACKETS = Math.min(120, Math.floor((W*H)/17000));
const STREAMS = Math.min(18, Math.floor(W/90));

for(let i=0;i<PACKETS;i++){
  packets.push({
    x:rnd(0,W), y:rnd(0,H),
    vx:rnd(-.22,.22), vy:rnd(-.18,.18),
    r:rnd(1.0,2.2),
    a:rnd(.10,.40)
  });
}

for(let i=0;i<STREAMS;i++){
  streams.push({
    x: rnd(0,W),
    y: rnd(-H, 0),
    speed: rnd(0.45, 1.2),
    len: rnd(180, 420),
    alpha: rnd(0.06, 0.14),
    wobble: rnd(0, Math.PI*2)
  });
}

let mouse = {x: W*0.5, y: H*0.45};
window.addEventListener("mousemove",(e)=>{
  mouse.x = e.clientX; mouse.y = e.clientY;
},{passive:true});

function drawGrid(){
  // soft technical frame / vignette
  const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 520);
  g.addColorStop(0, "rgba(77,225,255,0.06)");
  g.addColorStop(0.55, "rgba(162,255,111,0.03)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // subtle corner lines
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(18, 18); ctx.lineTo(220, 18);
  ctx.moveTo(18, 18); ctx.lineTo(18, 220);
  ctx.moveTo(W-18, 18); ctx.lineTo(W-220, 18);
  ctx.moveTo(W-18, 18); ctx.lineTo(W-18, 220);
  ctx.moveTo(18, H-18); ctx.lineTo(220, H-18);
  ctx.moveTo(18, H-18); ctx.lineTo(18, H-220);
  ctx.moveTo(W-18, H-18); ctx.lineTo(W-220, H-18);
  ctx.moveTo(W-18, H-18); ctx.lineTo(W-18, H-220);
  ctx.stroke();
}

function drawPackets(){
  // move + draw
  for(const p of packets){
    p.x += p.vx; p.y += p.vy;
    if(p.x < -20) p.x = W+20;
    if(p.x > W+20) p.x = -20;
    if(p.y < -20) p.y = H+20;
    if(p.y > H+20) p.y = -20;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${p.a})`;
    ctx.fill();
  }

  // connect lines (like network topology)
  for(let i=0;i<packets.length;i++){
    for(let j=i+1;j<packets.length;j++){
      const a = packets[i], b = packets[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx*dx + dy*dy;
      if(d2 < 160*160){
        const alpha = 1 - Math.sqrt(d2)/160;
        ctx.strokeStyle = `rgba(124,140,255,${alpha*0.10})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        ctx.lineTo(b.x,b.y);
        ctx.stroke();
      }
    }
  }
}

function drawStreams(){
  // vertical "log streams"
  for(const s of streams){
    s.y += s.speed;
    s.wobble += 0.01 * s.speed;

    if(s.y - s.len > H + 30){
      s.y = rnd(-H, 0);
      s.x = rnd(0,W);
      s.speed = rnd(0.45, 1.2);
      s.len = rnd(180, 420);
      s.alpha = rnd(0.06, 0.14);
    }

    const x = s.x + Math.sin(s.wobble) * 6;
    const y1 = s.y;
    const y2 = s.y - s.len;

    const grad = ctx.createLinearGradient(x, y2, x, y1);
    grad.addColorStop(0, `rgba(77,225,255,0)`);
    grad.addColorStop(0.6, `rgba(77,225,255,${s.alpha})`);
    grad.addColorStop(1, `rgba(162,255,111,${s.alpha*0.85})`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y2);
    ctx.lineTo(x, y1);
    ctx.stroke();

    // small “log ticks”
    for(let k=0;k<6;k++){
      const yy = y1 - (s.len * (k/6));
      ctx.fillStyle = `rgba(255,255,255,${s.alpha*0.55})`;
      ctx.fillRect(x-1, yy, 2, 2);
    }
  }
}

function loop(){
  ctx.clearRect(0,0,W,H);
  drawGrid();
  drawStreams();
  drawPackets();
  requestAnimationFrame(loop);
}
loop();
