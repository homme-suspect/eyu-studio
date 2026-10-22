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

// ---------- Effets avancés ----------

const finePointer = matchMedia("(pointer: fine)").matches;
const onScreen = (el, cb, threshold = 0.3) =>
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    obs.disconnect();
    cb();
  }, { threshold }).observe(el);

// Particules de l'accueil : elles forment des mots et fuient la souris
(() => {
  const canvas = $("#particles");
  const ctx = canvas.getContext("2d");
  const WORDS = ["eyu", "</>", "web", "app"];
  const STOPS = [[198, 255, 74], [124, 246, 200], [139, 123, 255]];
  const mouse = { x: -9999, y: -9999 };
  let W, H, gap, shapes = [], parts = [], word = 0, visible = true, cycle;

  const mix = (t) => {
    const s = t < 0.5 ? 0 : 1;
    const k = t < 0.5 ? t * 2 : (t - 0.5) * 2;
    const [a, b] = [STOPS[s], STOPS[s + 1]];
    return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(",")})`;
  };

  function sample(text) {
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const o = off.getContext("2d");
    let size = H * 0.6;
    const font = () => (o.font = `700 ${size}px "Space Grotesk", sans-serif`);
    font();
    while (o.measureText(text).width > W * 0.9) { size *= 0.94; font(); }
    o.textAlign = "center";
    o.textBaseline = "middle";
    o.fillText(text, W / 2, H * 0.47);
    const data = o.getImageData(0, 0, W, H).data;
    const pts = [];
    for (let y = 0; y < H; y += gap)
      for (let x = 0; x < W; x += gap) if (data[(y * W + x) * 4 + 3] > 140) pts.push([x, y]);
    for (let i = pts.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [pts[i], pts[j]] = [pts[j], pts[i]];
    }
    return pts;
  }

  function target(i) {
    const pts = shapes[word];
    const p = parts[i];
    if (i < pts.length) {
      [p.tx, p.ty] = pts[i];
      p.dust = false;
    } else {
      p.tx = Math.random() * W;
      p.ty = Math.random() * H;
      p.dust = true;
    }
    p.c = mix(p.tx / W);
  }

  function setup() {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gap = W < 500 ? 5 : 6;
    shapes = WORDS.map(sample);
    const n = Math.max(...shapes.map((s) => s.length)) + 60;
    parts = Array.from({ length: n }, (_, i) => parts[i] || { x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0 });
    parts.forEach((_, i) => target(i));
    if (reduced) {
      parts.forEach((p) => ((p.x = p.tx), (p.y = p.ty)));
      draw();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const s = gap * 0.55;
    for (const p of parts) {
      ctx.globalAlpha = p.dust ? 0.25 : 1;
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x, p.y, s, s);
    }
    ctx.globalAlpha = 1;
  }

  function step() {
    if (!visible) return;
    const R = 80;
    for (const p of parts) {
      if (p.dust) {
        p.tx += Math.sin((p.ty + performance.now() / 30) / 50) * 0.3;
        p.ty -= 0.15;
        if (p.ty < 0) p.ty = H;
      }
      p.vx += (p.tx - p.x) * 0.02;
      p.vy += (p.ty - p.y) * 0.02;
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < R && d > 0) {
        const f = ((R - d) / R) * 5;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
      p.vx *= 0.86;
      p.vy *= 0.86;
      p.x += p.vx;
      p.y += p.vy;
    }
    draw();
    requestAnimationFrame(step);
  }

  function next() {
    word = (word + 1) % WORDS.length;
    parts.forEach((_, i) => target(i));
  }

  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener("pointerleave", () => (mouse.x = mouse.y = -9999));
  canvas.addEventListener("click", () => {
    for (const p of parts) {
      const a = Math.random() * Math.PI * 2;
      const v = 10 + Math.random() * 22;
      p.vx += Math.cos(a) * v;
      p.vy += Math.sin(a) * v;
    }
    clearInterval(cycle);
    setTimeout(() => { next(); cycle = setInterval(next, 3800); }, 700);
  });

  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 200);
  });

  document.fonts.ready.then(() => {
    setup();
    if (reduced) return;
    new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was) requestAnimationFrame(step);
    }).observe(canvas);
    requestAnimationFrame(step);
    cycle = setInterval(next, 3800);
  });
})();

// Configurateur de site en direct
(() => {
  const ICONS = {
    pizzeria: '<path d="M3 5c5.5-3 12.5-3 18 0L12 22z"/><path d="M4.6 8.2c4.6-2 10.2-2 14.8 0"/><circle cx="10" cy="11.5" r="1.2"/><circle cx="14" cy="13" r="1.2"/><circle cx="12" cy="16.5" r="1"/>',
    coiffure: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.1 8.1 20 20M8.1 15.9 20 4"/>',
    plombier: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.5-.6-.6-2.5z"/>',
    photo: '<path d="M3 8h4l2-3h6l2 3h4v12H3z"/><circle cx="12" cy="13.5" r="4"/>',
  };
  const METIERS = {
    pizzeria: {
      name: "Bella Pizza", url: "bella-pizza.fr", kicker: "Pizzeria au feu de bois",
      title: "La vraie pizza,<br /><em>cuite au feu de bois.</em>", sub: "Pâte maison, produits frais, à emporter ou en livraison.",
      cta: "Commander", cta2: "Voir la carte", links: ["La carte", "Horaires"],
      itemsTitle: "La carte", items: [["Margherita", "9 €"], ["Regina", "11 €"], ["4 fromages", "12 €"]],
      resaTitle: "Réserver une table", slots: ["19:00", "19:30", "20:15", "21:00"],
      avis: [["Les meilleures pizzas du coin, commande en deux clics.", "Julie"], ["Pâte parfaite, accueil au top.", "Karim"]],
    },
    coiffure: {
      name: "Atelier Lumière", url: "atelier-lumiere.fr", kicker: "Salon de coiffure",
      title: "Votre style,<br /><em>notre savoir-faire.</em>", sub: "Coupe, couleur et soins, sur rendez-vous du mardi au samedi.",
      cta: "Prendre RDV", cta2: "Nos tarifs", links: ["Prestations", "L'équipe"],
      itemsTitle: "Prestations", items: [["Coupe", "25 €"], ["Couleur", "55 €"], ["Brushing", "20 €"]],
      resaTitle: "Choisir un créneau", slots: ["09:30", "11:00", "14:30", "16:00"],
      avis: [["Super salon, je recommande les yeux fermés.", "Sarah"], ["Réservation en ligne hyper pratique.", "Inès"]],
    },
    plombier: {
      name: "Durand Plomberie", url: "durand-plomberie.fr", kicker: "Plombier chauffagiste",
      title: "Une fuite ?<br /><em>On arrive vite.</em>", sub: "Dépannage 7j/7, devis gratuit, intervention en moins de 2 h.",
      cta: "Devis gratuit", cta2: "Appeler", links: ["Services", "Zone"],
      itemsTitle: "Services", items: [["Dépannage", "dès 69 €"], ["Chauffe-eau", "dès 390 €"], ["Salle de bain", "sur devis"]],
      resaTitle: "Demander une intervention", slots: ["Matin", "Midi", "Après-midi", "Urgence"],
      avis: [["Arrivé en une heure un dimanche, top.", "Marc"], ["Devis clair, travail propre.", "Nadia"]],
    },
    photo: {
      name: "Studio Nora", url: "studio-nora.fr", kicker: "Photographe",
      title: "Vos plus beaux<br /><em>moments, en lumière.</em>", sub: "Mariages, portraits et photos d'entreprise.",
      cta: "Réserver", cta2: "Portfolio", links: ["Portfolio", "Formules"],
      itemsTitle: "Formules", items: [["Mariage", "dès 890 €"], ["Portrait", "120 €"], ["Entreprise", "sur devis"]],
      resaTitle: "Réserver une séance", slots: ["Sam. 10:00", "Sam. 15:00", "Dim. 11:00"],
      avis: [["Des photos sublimes de notre mariage.", "Léa & Tom"], ["Très professionnelle et rassurante.", "Camille"]],
    },
  };
  const STYLES = { moderne: "Moderne", elegant: "Élégant", audacieux: "Audacieux" };
  const BLOCS = { resa: "réservation", avis: "avis", galerie: "galerie" };

  const f = $("#builderForm");
  const mini = $("#mini");
  const code = $("#builderCode");
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  let lastKey = "", typing;

  function html(m, metier, blocs) {
    let out = `
      <div class="m-nav"><b><i>${m.name[0]}</i>${m.name}</b><span>${m.links[0]}</span><span>${m.links[1]}</span><span class="m-btn">${m.cta}</span></div>
      <div class="m-hero">
        <div><p class="m-k">${m.kicker}</p><h4 class="m-title">${m.title}</h4><p class="m-sub">${m.sub}</p>
        <div class="m-btns"><span class="m-btn">${m.cta}</span><span class="m-btn ghost">${m.cta2}</span></div></div>
        <div class="m-art"><svg viewBox="0 0 24 24">${ICONS[metier]}</svg></div>
      </div>
      <div><p class="m-h">${m.itemsTitle}</p><div class="m-items">${m.items.map(([a, b]) => `<div><small>${a}</small><strong>${b}</strong></div>`).join("")}</div></div>`;
    if (blocs.includes("resa"))
      out += `<div><p class="m-h">${m.resaTitle}</p><div class="m-resa">
        <div class="m-days"><span>Lun</span><span class="on">Mar</span><span>Mer</span><span>Jeu</span></div>
        <div class="m-slots">${m.slots.map((s, i) => `<span class="${i === 1 ? "on" : ""}">${s}</span>`).join("")}</div>
        <span class="m-btn">Confirmer</span></div></div>`;
    if (blocs.includes("avis"))
      out += `<div><p class="m-h">Avis clients</p><div class="m-avis">${m.avis.map(([t, n]) => `<div><b>★★★★★</b><p>« ${t} »</p><small>${n}</small></div>`).join("")}</div></div>`;
    if (blocs.includes("galerie"))
      out += `<div><p class="m-h">Galerie</p><div class="m-gal">${[135, 200, 45, 300, 90, 160].map((r) => `<span style="--r:${r}deg"></span>`).join("")}</div></div>`;
    return out;
  }

  function type(segs) {
    cancelAnimationFrame(typing);
    const total = segs.reduce((s, [t]) => s + t.length, 0);
    let n = reduced ? total : 0;
    const frame = () => {
      n = Math.min(total, n + 4);
      let left = n, out = "";
      for (const [t, c] of segs) {
        if (left <= 0) break;
        const part = t.slice(0, left);
        left -= part.length;
        out += c ? `<span class="${c}">${esc(part)}</span>` : esc(part);
      }
      code.innerHTML = out + '<span class="caret"></span>';
      if (n < total) typing = requestAnimationFrame(frame);
    };
    frame();
  }

  function render() {
    const metier = f.metier.value;
    const m = METIERS[metier];
    const blocs = $$("input[name=bloc]:checked", f).map((i) => i.value);
    const key = [metier, f.look.value, f.theme.value, blocs].join("|");
    mini.style.setProperty("--a", f.couleur.value);
    mini.className = `mini ${f.look.value} ${f.theme.value}`;
    if (key !== lastKey) {
      mini.innerHTML = html(m, metier, blocs);
      lastKey = key;
    }
    $("#miniUrl").textContent = m.url;
    type([
      ["// généré en direct\n", "c"], ["const ", "k"], ["site = {\n", ""],
      ["  nom: ", "p"], [`"${m.name}"`, "s"], [",\n", ""],
      ["  couleur: ", "p"], [`"${f.couleur.value}"`, "s"], [",\n", ""],
      ["  style: ", "p"], [`"${STYLES[f.look.value]}"`, "s"], [",\n", ""],
      ["  theme: ", "p"], [`"${f.theme.value}"`, "s"], [",\n", ""],
      ["  blocs: ", "p"], [`[${blocs.map((b) => `"${BLOCS[b]}"`).join(", ")}]`, "s"], ["\n};", ""],
    ]);
  }
  f.addEventListener("input", render);
  render();
})();

// Avant / après
(() => {
  const ba = $("#ba");
  const range = $(".ba-range", ba);
  const set = (v) => ba.style.setProperty("--pos", `${v}%`);
  range.addEventListener("input", () => set(range.value));
  if (reduced) return;
  onScreen(ba, () => {
    const t0 = performance.now();
    const anim = (t) => {
      const p = Math.min((t - t0) / 1800, 1);
      const v = 50 + Math.sin(p * Math.PI * 2) * 22 * (1 - p);
      set(v);
      range.value = v;
      if (p < 1) requestAnimationFrame(anim);
    };
    requestAnimationFrame(anim);
  }, 0.5);
})();

// Jauges de performance
$$(".gauge").forEach((g) => {
  const ring = $(".g-val", g);
  const num = $("b", g);
  const score = +g.dataset.score;
  onScreen(g, () => {
    ring.style.transition = reduced ? "none" : "stroke-dashoffset 1.8s cubic-bezier(0.2, 0.7, 0.1, 1)";
    ring.style.strokeDashoffset = 326.7 * (1 - score / 100);
    if (reduced) return (num.textContent = score);
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / 1800, 1);
      num.textContent = Math.round(score * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
});

// Titres de section qui se décodent
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/#*";
$$(".kicker").forEach((el) => {
  if (reduced) return;
  const final = el.textContent;
  onScreen(el, () => {
    let frame = 0;
    const tick = () => {
      el.textContent = [...final].map((ch, i) => (ch === " " || frame > i * 2 + 4 ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
      if (++frame <= final.length * 2 + 4) requestAnimationFrame(tick);
      else el.textContent = final;
    };
    tick();
  }, 0.8);
});

// Barre de progression
const bar = $(".progress");
addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}, { passive: true });

// Effets à la souris : lumière sur les cartes, boutons aimantés, curseur
if (finePointer && !reduced) {
  $$(".offer, .steps li, .why-grid > div, .gauge, .work, .faq details").forEach((el) => {
    el.classList.add("spot");
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--x", `${e.clientX - r.left}px`);
      el.style.setProperty("--y", `${e.clientY - r.top}px`);
    });
  });

  $$(".btn").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      b.style.transform = `translate(${x}px, ${y}px)`;
    });
    b.addEventListener("pointerleave", () => (b.style.transform = ""));
  });

  const cursor = $(".cursor");
  let cx = 0, cy = 0, tx = 0, ty = 0;
  addEventListener("pointermove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
    cursor.classList.add("on");
    cursor.classList.toggle("big", !!e.target.closest("a, button, label, summary, .ba"));
  });
  document.addEventListener("pointerleave", () => cursor.classList.remove("on"));
  const loop = () => {
    cx += (tx - cx) * 0.2;
    cy += (ty - cy) * 0.2;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  };
  loop();
}
