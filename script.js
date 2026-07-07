document.getElementById('year').textContent = new Date().getFullYear();
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Curseur custom ---------- */
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
if (window.matchMedia('(pointer:fine)').matches && !reduced) {
  let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function loop(){
    rx += (mx - rx) * .16; ry += (my - ry) * .16;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a,button,.card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
  });
}

/* ---------- Effet typing hero ---------- */
const phrases = [
  'sudo systemctl start alternance.service',
  'ping -c 1 recruteur && echo "dispo sept 2026"',
  'deploy --env=prod --doc=clean',
  'SELECT * FROM competences WHERE niveau = "solide";'
];
const typedEl = document.getElementById('typed');
if (!reduced) {
  let pi = 0, ci = 0, deleting = false;
  (function type(){
    const p = phrases[pi];
    typedEl.textContent = p.slice(0, ci);
    if (!deleting) {
      if (ci < p.length) { ci++; setTimeout(type, 45); }
      else { deleting = true; setTimeout(type, 2200); }
    } else {
      if (ci > 0) { ci--; setTimeout(type, 20); }
      else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 400); }
    }
  })();
} else {
  typedEl.textContent = phrases[0];
}

/* ---------- Reveal au scroll ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ---------- Glow qui suit la souris sur les cartes ---------- */
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* ---------- Marquee : dupliquer le contenu ---------- */
const mq = document.getElementById('marquee');
mq.innerHTML += mq.innerHTML;

/* ---------- Fond topologie réseau ---------- */
const canvas = document.getElementById('net');
const ctx = canvas.getContext('2d');
let W, H, nodes = [], mouse = { x: null, y: null };

function resize(){
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
  const count = Math.min(90, Math.floor(W * H / 16000));
  nodes = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - .5) * .45,
    vy: (Math.random() - .5) * .45,
    r: Math.random() * 1.8 + .8
  }));
}
addEventListener('resize', resize);
resize();

addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

const LINK = 130;
function draw(){
  ctx.clearRect(0, 0, W, H);
  for (const n of nodes) {
    n.x += n.vx; n.y += n.vy;
    if (n.x < 0 || n.x > W) n.vx *= -1;
    if (n.y < 0 || n.y > H) n.vy *= -1;
    // répulsion douce autour de la souris
    if (mouse.x !== null) {
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < 110 && d > 0) {
        n.x += (dx / d) * 1.4;
        n.y += (dy / d) * 1.4;
      }
    }
  }
  // liens
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < LINK) {
        const alpha = (1 - d / LINK) * .35;
        ctx.strokeStyle = `rgba(0,240,255,${alpha * .6})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    // liens vers la souris
    if (mouse.x !== null) {
      const a = nodes[i];
      const d = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (d < LINK * 1.3) {
        ctx.strokeStyle = `rgba(255,46,166,${(1 - d / (LINK * 1.3)) * .4})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
  }
  // nœuds
  for (const n of nodes) {
    ctx.fillStyle = 'rgba(139,92,246,.8)';
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
    ctx.fill();
  }
  requestAnimationFrame(draw);
}
if (!reduced) draw();
else { // version statique
  for (const n of nodes) {
    ctx.fillStyle = 'rgba(139,92,246,.5)';
    ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
  }
}
