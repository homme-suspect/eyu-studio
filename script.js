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
    status.textContent = "Le formulaire arrive très bientôt, merci de ta patience !";
    return;
  }
  const body = `Nom : ${f.nom.value}\nPour me joindre : ${f.joindre.value}\n\n${f.message.value}`;
  location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent("Demande de devis · " + f.nom.value)}&body=${encodeURIComponent(body)}`;
  status.textContent = "Ta messagerie s'ouvre avec la demande prête à envoyer.";
});

// Mentions légales
const legal = $("#legal");
$("#openLegal").addEventListener("click", () => legal.showModal());
legal.addEventListener("click", (e) => e.target === legal && legal.close());

// ---------- Effets avancés ----------

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

// Barre de progression
const bar = $(".progress");
addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}, { passive: true });

// Avant / après : glisser à la main
const ba = $("#ba");
const baRange = $(".ba-range", ba);
const setBa = (v) => ba.style.setProperty("--pos", `${v}%`);
let baTouched = false;
baRange.addEventListener("input", () => {
  baTouched = true;
  setBa(baRange.value);
});

// Jauges et compteur : valeur finale par défaut (sans animation)
const setGauge = (g, v) => {
  $(".g-val", g).style.strokeDashoffset = 326.7 * (1 - v / 100);
  $("b", g).textContent = Math.round(v);
};
$$(".gauge").forEach((g) => setGauge(g, +g.dataset.score));
$$("[data-count]").forEach((c) => (c.textContent = c.dataset.count));

// ---------- Motion design : tout est lié au défilement, dans les deux sens ----------
(() => {
  if (reduced || !window.gsap || !window.ScrollTrigger || !window.Lenis) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  document.documentElement.classList.add("motion");

  // Défilement fluide
  const lenis = new Lenis({ lerp: 0.09 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id === "#top" ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: id === "#top" ? 0 : -60, duration: 1.4 });
    })
  );
  $("#legal").addEventListener("close", () => lenis.start());
  $("#openLegal").addEventListener("click", () => lenis.stop());

  // Découpe un titre en mots, sans casser les dégradés ni les <br>
  const split = (el) => {
    for (const n of [...el.childNodes]) {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        for (const part of n.textContent.split(/(\s+)/)) {
          if (!part) continue;
          if (/^\s+$/.test(part)) { frag.append(" "); continue; }
          const w = document.createElement("span");
          const i = document.createElement("span");
          w.className = "w";
          i.className = "wi";
          i.textContent = part;
          w.append(i);
          frag.append(w);
        }
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== "BR" && !n.classList.contains("rot")) {
        if (n.classList.contains("grad")) n.classList.add("is-split");
        split(n);
      }
    }
    return $$(".wi", el);
  };

  // Brouillage des petits titres, rejoué à chaque passage
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/#*";
  const scramble = (el) => {
    const final = el.dataset.text || (el.dataset.text = el.textContent);
    let frame = 0;
    const tick = () => {
      el.textContent = [...final].map((ch, i) => (ch === " " || frame > i * 2 + 4 ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0])).join("");
      if (++frame <= final.length * 2 + 4) requestAnimationFrame(tick);
      else el.textContent = final;
    };
    tick();
  };
  $$(".kicker").forEach((el) =>
    ScrollTrigger.create({ trigger: el, start: "top 90%", onEnter: () => scramble(el), onEnterBack: () => scramble(el) })
  );

  // Barre de navigation : se cache en descendant, revient en remontant
  let navHidden = false;
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (s) => {
      const hide = s.direction === 1 && s.scroll() > 500;
      if (hide === navHidden) return;
      navHidden = hide;
      gsap.to(".nav", { yPercent: hide ? -110 : 0, duration: 0.45, ease: "power3.out", overwrite: true });
    },
  });

  // Typo cinétique, un peu plus vive que la normale.
  gsap.globalTimeline.timeScale(1.2);
  const kinetic = { scale: 2.6, opacity: 0, filter: "blur(10px)", transformOrigin: "50% 60%" };

  // Accueil : les mots arrivent en grand et se posent, les formes roulent en place.
  const rot = $(".hero .rot");
  const heroWords = [...split($(".hero h1")), rot];
  gsap.timeline({ defaults: { ease: "expo.out", duration: 1.2 } })
    .from(".nav", { yPercent: -110, duration: 1 }, 0)
    .from(heroWords, { ...kinetic, stagger: 0.16 }, 0.1)
    .from(".hero .eyebrow", { y: 20, opacity: 0, duration: 0.9 }, 0.15)
    .from(".hero .lead, .hero-cta, .hero-facts", { x: 60, opacity: 0, stagger: 0.08 }, 0.9)
    .from(".hero-visual .shape", { scale: 0, rotate: -60, stagger: 0.12, duration: 1.4, ease: "back.out(1.5)" }, 0.5);

  // Le mot souligné du titre change en boucle.
  const words = rot.dataset.words.split("|");
  let wi = 0;
  setInterval(() => {
    if (document.hidden || window.scrollY > innerHeight) return;
    wi = (wi + 1) % words.length;
    gsap.timeline()
      .to(rot, { yPercent: -60, opacity: 0, filter: "blur(6px)", duration: 0.25, ease: "power2.in" })
      .add(() => (rot.textContent = words[wi]))
      .fromTo(rot, { yPercent: 60, opacity: 0, filter: "blur(6px)" }, { yPercent: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "expo.out" });
  }, 2200);

  // Sortie au défilement : le texte s'en va, chaque forme part à sa vitesse.
  gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } })
    .to(".hero-text", { yPercent: -30, opacity: 0, ease: "none" }, 0)
    .to(".shape.s-round", { yPercent: 60, rotate: 40, ease: "none" }, 0)
    .to(".shape.s-square", { yPercent: -80, rotate: -120, ease: "none" }, 0)
    .to(".shape.s-half", { yPercent: 120, rotate: 30, ease: "none" }, 0)
    .to(".shape.s-dot", { yPercent: -200, ease: "none" }, 0);

  // Bandeau : vitesse et sens qui suivent le défilement
  const track = $(".marquee-track");
  const setX = gsap.quickSetter(track, "x", "px");
  const setSkew = gsap.quickSetter(track, "skewX", "deg");
  let mx = 0, dir = 1;
  gsap.ticker.add(() => {
    const v = lenis.velocity || 0;
    if (lenis.direction) dir = lenis.direction;
    mx -= (0.7 + Math.min(Math.abs(v) * 0.35, 18)) * dir;
    const half = track.scrollWidth / 2;
    if (mx <= -half) mx += half;
    if (mx > 0) mx -= half;
    setX(mx);
    setSkew(gsap.utils.clamp(-10, 10, -v * 0.35));
  });

  // Gros titres : les mots arrivent en grand et se posent, puis le titre grossit au passage.
  $$(".section h2, .process h2").forEach((h) => {
    gsap.from(split(h), {
      ...kinetic,
      stagger: 0.09,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: { trigger: h, start: "top 88%", toggleActions: "play none none reverse" },
    });
    if (!h.closest(".process")) gsap.fromTo(h, { scale: 0.94, transformOrigin: "0% 50%" }, { scale: 1, ease: "none", scrollTrigger: { trigger: h, start: "top bottom", end: "top 30%", scrub: true } });
  });

  // Apparitions génériques, réversibles
  const special = ".hero *, h2, .offer, .work, .contact, .gauges, .builder";
  const items = $$(".reveal").filter((el) => !el.matches(special));
  gsap.set(items, { opacity: 0, y: 50 });
  ScrollTrigger.batch(items, {
    start: "top 92%",
    onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, stagger: 0.08, duration: 0.9, ease: "power3.out", overwrite: true }),
    onLeaveBack: (b) => gsap.to(b, { opacity: 0, y: 50, stagger: 0.04, duration: 0.5, ease: "power2.in", overwrite: true }),
  });

  const mm = gsap.matchMedia();

  // Offres : les cartes arrivent en éventail
  mm.add("(min-width: 681px)", () => {
    gsap.fromTo(".offer",
      { y: 180, rotate: (i) => [-8, 0, 8][i % 3], opacity: 0 },
      { y: 0, rotate: 0, opacity: 1, ease: "power2.out", stagger: 0.1, scrollTrigger: { trigger: ".offers", start: "top 95%", end: "top 40%", scrub: 1 } });
  });
  mm.add("(max-width: 680px)", () => {
    $$(".offer").forEach((o) =>
      gsap.fromTo(o, { y: 90, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, ease: "power2.out", scrollTrigger: { trigger: o, start: "top 100%", end: "top 65%", scrub: 1 } })
    );
  });

  // Réalisations : zoom à l'entrée et parallaxe des visuels
  $$(".work").forEach((w) => {
    gsap.fromTo(w, { y: 120, scale: 0.9, opacity: 0 }, { y: 0, scale: 1, opacity: 1, ease: "power2.out", scrollTrigger: { trigger: w, start: "top 100%", end: "top 55%", scrub: 1 } });
    gsap.fromTo($(".work-visual > *", w), { yPercent: 7 }, { yPercent: -7, ease: "none", scrollTrigger: { trigger: w, start: "top bottom", end: "bottom top", scrub: true } });
  });

  // Démo live : l'aperçu se redresse
  gsap.fromTo("#builder", { opacity: 0, y: 80 }, { opacity: 1, y: 0, ease: "power2.out", scrollTrigger: { trigger: "#builder", start: "top 100%", end: "top 60%", scrub: 1 } });
  gsap.fromTo(".b-preview", { rotateX: 22, transformPerspective: 1400, transformOrigin: "50% 0%" }, { rotateX: 0, ease: "power2.out", scrollTrigger: { trigger: "#builder", start: "top 95%", end: "top 30%", scrub: 1 } });

  // Avant / après : le défilement fait glisser la barre (tant qu'on ne l'a pas touchée)
  ScrollTrigger.create({
    trigger: ba,
    start: "top 85%",
    end: "bottom 30%",
    scrub: true,
    onUpdate: (s) => {
      if (baTouched) return;
      const v = 94 - s.progress * 88;
      setBa(v);
      baRange.value = v;
    },
  });

  // Méthode : section épinglée, le site se construit étape par étape
  const steps = $$(".p-steps li");
  let current = 0;
  const p = gsap.timeline({
    defaults: { ease: "power2.out" },
    scrollTrigger: {
      trigger: ".process",
      start: "top top",
      end: () => `+=${innerHeight * 3.2}`,
      pin: true,
      scrub: 1,
      anticipatePin: 1,
    },
    onUpdate() {
      gsap.set(".p-bar i", { scaleX: this.progress() });
      const i = Math.min(3, Math.floor(this.time()));
      if (i === current) return;
      current = i;
      steps.forEach((li, k) => li.classList.toggle("active", k === i));
    },
  });
  p.fromTo(".p-browser", { y: 60, rotate: -2 }, { y: 0, rotate: 0, duration: 0.4 }, 0)
    .fromTo(".bubble", { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, stagger: 0.18, duration: 0.25 }, 0.05)
    .fromTo(".p-chat", { yPercent: 0, opacity: 1 }, { yPercent: -25, opacity: 0, duration: 0.3, ease: "power2.in" }, 1)
    .fromTo(".p-wire > *", { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.3 }, 1.15)
    .fromTo(".wf-cards span", { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, stagger: 0.07, duration: 0.25 }, 1.45)
    .fromTo(".p-site", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.5, ease: "power3.inOut" }, 2.05)
    .fromTo(".ps-hero h4, .ps-btn, .ps-cards div", { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.3 }, 2.3)
    .fromTo(".ps-art", { rotate: -14, scale: 0.6 }, { rotate: 0, scale: 1, duration: 0.45, ease: "back.out(1.6)" }, 2.3)
    .fromTo(".p-browser", { scale: 1 }, { scale: 0.96, duration: 0.3, immediateRender: false }, 3)
    .fromTo(".g-result", { y: 160, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "back.out(1.4)" }, 3.1)
    .fromTo(".live-badge", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25, ease: "back.out(2.2)" }, 3.3)
    .fromTo(".notif", { x: 70, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3 }, 3.5)
    .to({}, { duration: 0.2 }, 3.8);

  // Pourquoi : compteur et jauges suivent le défilement
  $$("[data-count]").forEach((c) => {
    const o = { v: 0 };
    gsap.to(o, { v: +c.dataset.count, ease: "none", onUpdate: () => (c.textContent = Math.round(o.v)), scrollTrigger: { trigger: c, start: "top 95%", end: "top 60%", scrub: 1 } });
  });
  gsap.fromTo(".gauges", { opacity: 0, y: 60 }, { opacity: 1, y: 0, scrollTrigger: { trigger: ".gauges", start: "top 100%", end: "top 70%", scrub: 1 } });
  $$(".gauge").forEach((g) => {
    const o = { v: 0 };
    setGauge(g, 0);
    gsap.to(o, { v: +g.dataset.score, ease: "power1.out", onUpdate: () => setGauge(g, o.v), scrollTrigger: { trigger: g, start: "top 95%", end: "top 50%", scrub: 1 } });
  });

  // Contact : le bloc s'ouvre
  gsap.fromTo(".contact", { scale: 0.86, borderRadius: 90, opacity: 0.3 }, { scale: 1, borderRadius: 30, opacity: 1, ease: "power2.out", scrollTrigger: { trigger: ".contact", start: "top 100%", end: "top 35%", scrub: 1 } });

  // Grand logo du bas
  gsap.from(".footer-big span", { yPercent: 100, stagger: 0.08, ease: "power2.out", scrollTrigger: { trigger: ".footer-big", start: "top 100%", end: "bottom 95%", scrub: 1 } });

  document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
