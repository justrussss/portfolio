const root = document.documentElement;
const THEME_KEY = "portfolio-theme";
const media = matchMedia("(prefers-color-scheme: dark)");

/* ---------- Theme: light | dark | system ---------- */
function getPref() {
  try { return localStorage.getItem(THEME_KEY) || "system"; } catch (e) { return "system"; }
}

function applyPref(pref) {
  const dark = pref === "dark" || (pref === "system" && media.matches);
  root.classList.toggle("dark", dark);
  root.dataset.pref = pref;
  document.querySelectorAll("[data-theme-switch] button").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.value === pref))
  );
}

function setPref(pref, origin) {
  try { localStorage.setItem(THEME_KEY, pref); } catch (e) {}
  const change = () => applyPref(pref);

  // Circular reveal from the click point when view transitions are supported
  if (document.startViewTransition && origin && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const x = origin.clientX, y = origin.clientY;
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const t = document.startViewTransition(change);
    t.ready.then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 540, easing: "cubic-bezier(0.16, 1, 0.3, 1)", pseudoElement: "::view-transition-new(root)" }
      )
    ).catch(() => {});
  } else {
    change();
  }
}

document.querySelectorAll("[data-theme-switch]").forEach((wrap) => {
  ["light", "dark", "system"].forEach((v) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.value = v;
    b.textContent = v;
    b.addEventListener("click", (e) => setPref(v, e));
    wrap.appendChild(b);
  });
});
applyPref(getPref());
media.addEventListener("change", () => getPref() === "system" && applyPref("system"));

/* ---------- Mobile overlay menu ---------- */
const menuBtn = document.getElementById("menu-btn");
const overlay = document.getElementById("overlay");

function setMenu(open) {
  overlay.hidden = !open;
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.textContent = open ? "close" : "menu";
  document.body.style.overflow = open ? "hidden" : "";
}
menuBtn.addEventListener("click", () => setMenu(overlay.hidden));
overlay.querySelectorAll("nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !overlay.hidden) setMenu(false);
});

/* ---------- Scroll reveal for sections below the fold ---------- */
const revealTargets = document.querySelectorAll(".section .card, .section .facts, .section .stack-block, .section .empty, .section .form, .section .contact-lead");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.1 }
  );
  revealTargets.forEach((el) => {
    el.classList.add("reveal");
    io.observe(el);
  });
}

/* ---------- Active sidebar link ---------- */
const links = document.querySelectorAll("[data-link]");
if ("IntersectionObserver" in window && links.length) {
  const spy = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
        }
      }),
    { rootMargin: "-30% 0px -60% 0px" }
  );
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));
}

/* ---------- Contact form ----------
   Not wired to a backend yet. To enable sending, add the EmailJS script
   to index.html and fill in your keys below. */
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (window.emailjs) {
    emailjs.init("YOUR_PUBLIC_KEY");
    emailjs.sendForm("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", form).then(
      () => {
        status.textContent = "sent. thanks!";
        form.reset();
      },
      () => {
        status.textContent = "something went wrong, try again.";
      }
    );
  } else {
    status.textContent = "form isn't connected yet.";
  }
});
