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

// Ticker
const ticker = document.getElementById("ticker");
const lines = [
  "GLPI • Support • Incidents",
  "Apache/PHP/MySQL • Déploiement",
  "Sécurité Web • SQLi/XSS/CSRF",
  "Power BI • Excel • Reporting"
];
let idx = 0, pos = 0, del = false;

function tick(){
  const txt = lines[idx];
  if(!del){
    pos++;
    ticker.textContent = txt.slice(0,pos);
    if(pos >= txt.length){
      del = true;
      setTimeout(tick, 1100);
      return;
    }
  } else {
    pos--;
    ticker.textContent = txt.slice(0,pos);
    if(pos <= 0){
      del = false;
      idx = (idx+1) % lines.length;
    }
  }
  setTimeout(tick, del ? 32 : 55);
}
if(ticker) tick();

// Tilt effect
function bindTilt(el){
  const rect = () => el.getBoundingClientRect();
  el.addEventListener("mousemove", (e)=>{
    const r = rect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const ry = (x - 0.5) * 10;   // deg
    const rx = (0.5 - y) * 10;   // deg
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
  });
  el.addEventListener("mouseleave", ()=>{
    el.style.setProperty("--ry","0deg");
    el.style.setProperty("--rx","0deg");
  });
}
document.querySelectorAll("[data-tilt]").forEach(bindTilt);

// Particles canvas (lightweight)
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d", { alpha: true });

let W=0,H=0, DPR = Math.min(2, window.devicePixelRatio || 1);
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

const PCOUNT = Math.min(140, Math.floor((W*H)/16000));
const particles = [];
function rnd(min,max){ return min + Math.random()*(max-min); }

for(let i=0;i<PCOUNT;i++){
  particles.push({
    x: rnd(0,W), y: rnd(0,H),
    vx: rnd(-.22,.22), vy: rnd(-.18,.18),
    r: rnd(1.0, 2.4),
    a: rnd(.15,.55)
  });
}

let mouse = {x: W/2, y: H/2};
window.addEventListener("mousemove",(e)=>{ mouse.x=e.clientX; mouse.y=e.clientY; }, {passive:true});

function draw(){
  ctx.clearRect(0,0,W,H);

  // soft glow cursor
  const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220);
  g.addColorStop(0, "rgba(0,229,255,0.10)");
  g.addColorStop(1, "rgba(0,229,255,0.0)");
  ctx.fillStyle = g;
  ctx.fillRect(0,0,W,H);

  // particles
  for(const p of particles){
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

  // connect lines
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx*dx + dy*dy;
      if(d2 < 140*140){
        const alpha = 1 - Math.sqrt(d2)/140;
        ctx.strokeStyle = `rgba(124,92,255,${alpha*0.18})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        ctx.lineTo(b.x,b.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(draw);
}
draw();
