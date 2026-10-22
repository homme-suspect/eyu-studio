// Coordonnées affichées sur le site : il suffit de les remplir ici.
const CONTACT = {
  email: "",
  phone: "", // ex. "06 12 34 56 78"
  siret: "",
};

// Tarifs de l'estimation (en euros)
const OFFERS = {
  vitrine: { label: "Site vitrine", base: 490, pages: 3, perPage: 60, delay: [1, 2] },
  fonctions: { label: "Site avec fonctions", base: 990, pages: 5, perPage: 70, delay: [2, 3] },
  appli: { label: "Appli sur mesure", base: 1900, pages: 5, perPage: 140, delay: [4, 8] },
};
const OPTIONS = {
  logo: { label: "Création du logo", price: 150 },
  textes: { label: "Rédaction des textes", price: 120 },
  seo: { label: "Référencement local", price: 150 },
  langue: { label: "Version anglaise", price: 200 },
  paiement: { label: "Paiement en ligne", price: 250 },
  express: { label: "Livraison express", rate: 0.2 },
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const euros = (n) => n.toLocaleString("fr-FR");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

$("#year").textContent = new Date().getFullYear();

// Barre de navigation : bordure dès qu'on défile
const nav = $(".nav");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 10), { passive: true });

// Apparitions en cascade
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
$$(".reveal").forEach((el) => {
  const siblings = $$(":scope > .reveal", el.parentElement);
  el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
  io.observe(el);
});

// Halo et fenêtres qui suivent la souris
if (!reduced && matchMedia("(pointer: fine)").matches) {
  const glow = $(".glow");
  const layers = $$("[data-depth]");
  const hero = $(".hero");
  addEventListener("pointermove", (e) => {
    glow.style.setProperty("--mx", `${e.clientX}px`);
    glow.style.setProperty("--my", `${e.clientY}px`);
    if (scrollY > hero.offsetHeight) return;
    const x = e.clientX / innerWidth - 0.5;
    const y = e.clientY / innerHeight - 0.5;
    for (const l of layers) {
      const d = +l.dataset.depth;
      l.style.transform = `translate3d(${-x * d}px, ${-y * d}px, 0) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    }
  });
}

// Compteur
const counter = $("[data-count]");
new IntersectionObserver(([e], obs) => {
  if (!e.isIntersecting) return;
  obs.disconnect();
  const target = +counter.dataset.count;
  if (reduced) return (counter.textContent = target);
  const t0 = performance.now();
  const tick = (t) => {
    const p = Math.min((t - t0) / 1400, 1);
    counter.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}).observe(counter);

// Estimation
const form = $("#estimator");
const range = $("#pages");
const priceBox = $(".est-price");
let summary = "";

function estimate() {
  const type = form.type.value;
  const offer = OFFERS[type];
  const pages = +range.value;
  const opts = $$("input[name=opt]:checked", form).map((i) => i.value);

  $("#pagesOut").textContent = pages;
  range.style.setProperty("--p", `${((pages - 1) / (range.max - 1)) * 100}%`);

  const lines = [[offer.label, offer.base]];
  const extra = Math.max(0, pages - offer.pages) * offer.perPage;
  if (extra) lines.push([`${pages - offer.pages} page(s) en plus`, extra]);
  for (const o of opts) if (OPTIONS[o].price) lines.push([OPTIONS[o].label, OPTIONS[o].price]);

  let total = lines.reduce((s, [, p]) => s + p, 0);
  if (opts.includes("express")) {
    const fee = Math.round((total * OPTIONS.express.rate) / 10) * 10;
    lines.push([OPTIONS.express.label, fee]);
    total += fee;
  }
  const high = Math.round((total * 1.25) / 10) * 10;

  let [d1, d2] = offer.delay;
  if (pages > 8) d2 += 1;
  if (opts.includes("express")) [d1, d2] = [Math.max(1, Math.ceil(d1 / 2)), Math.ceil(d2 / 2)];
  const delay = d1 === d2 ? `${d1} semaine${d1 > 1 ? "s" : ""}` : `${d1} à ${d2} semaines`;

  $("#estLow").textContent = euros(total);
  $("#estHigh").textContent = euros(high);
  $("#estDelay").textContent = delay;
  $("#estSum").innerHTML = lines.map(([l, p]) => `<li>${l}<b>${euros(p)} €</b></li>`).join("");

  priceBox.classList.remove("bump");
  void priceBox.offsetWidth;
  priceBox.classList.add("bump");

  summary =
    `Projet : ${offer.label}, ${pages} page(s)` +
    (opts.length ? `\nOptions : ${opts.map((o) => OPTIONS[o].label).join(", ")}` : "") +
    `\nEstimation : ${euros(total)} – ${euros(high)} €, ${delay}`;
}
form.addEventListener("input", estimate);
estimate();

// « Demander ce devis » préremplit le formulaire de contact
$("#estSend").addEventListener("click", () => {
  const msg = $("#contactForm").message;
  msg.value = `${summary}\n\nMon activité : `;
  setTimeout(() => msg.focus({ preventScroll: true }), 700);
});

// Contact
const direct = $("#contactDirect");
if (CONTACT.phone) {
  const tel = CONTACT.phone.replace(/\s/g, "");
  direct.insertAdjacentHTML("beforeend", `<a class="btn btn-ghost btn-small" href="tel:${tel}">Appeler le ${CONTACT.phone}</a>`);
  direct.insertAdjacentHTML("beforeend", `<a class="btn btn-ghost btn-small" href="https://wa.me/33${tel.slice(1)}" target="_blank" rel="noopener">WhatsApp</a>`);
}
if (CONTACT.email) {
  direct.insertAdjacentHTML("beforeend", `<a class="btn btn-ghost btn-small" href="mailto:${CONTACT.email}">${CONTACT.email}</a>`);
}
if (CONTACT.siret) $("#legalId").textContent = `SIRET : ${CONTACT.siret}.`;

$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  const status = $("#formStatus");
  if (!CONTACT.email) {
    status.textContent = "Le formulaire arrive très bientôt. Merci de votre patience !";
    return;
  }
  const body = `Nom : ${f.nom.value}\nPour me joindre : ${f.joindre.value}\n\n${f.message.value}`;
  location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Demande de devis · " + f.nom.value)}&body=${encodeURIComponent(body)}`;
  status.textContent = "Votre messagerie s'ouvre avec la demande prête à envoyer.";
});

// Mentions légales
const legal = $("#legal");
$("#openLegal").addEventListener("click", () => legal.showModal());
legal.addEventListener("click", (e) => e.target === legal && legal.close());
