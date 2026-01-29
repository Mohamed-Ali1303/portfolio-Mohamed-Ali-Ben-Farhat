// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Mobile menu
const burger = document.getElementById("burger");
const mobileNav = document.getElementById("mobileNav");

burger.addEventListener("click", () => {
  const expanded = burger.getAttribute("aria-expanded") === "true";
  burger.setAttribute("aria-expanded", String(!expanded));
  mobileNav.classList.toggle("show");
  mobileNav.setAttribute("aria-hidden", String(expanded));
});

mobileNav.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    burger.setAttribute("aria-expanded", "false");
    mobileNav.classList.remove("show");
    mobileNav.setAttribute("aria-hidden", "true");
  });
});

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add("is-visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Typewriter (focus)
const phrases = [
  "Support & services (GLPI, documentation)",
  "Infra Web (Apache, PHP, MySQL, FTP, SSH)",
  "Sécurité Web (SQLi, XSS, CSRF, HTTPS)",
  "Reporting & Data (Power BI / Excel)"
];

const target = document.getElementById("typeText");
let p = 0, i = 0, deleting = false;

function tick(){
  const current = phrases[p];
  if (!deleting) {
    i++;
    target.textContent = current.slice(0, i);
    if (i >= current.length) {
      deleting = true;
      setTimeout(tick, 1100);
      return;
    }
  } else {
    i--;
    target.textContent = current.slice(0, i);
    if (i <= 0) {
      deleting = false;
      p = (p + 1) % phrases.length;
    }
  }
  setTimeout(tick, deleting ? 35 : 55);
}
tick();
