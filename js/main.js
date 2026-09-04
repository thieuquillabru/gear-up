/* ============================================================
   Gear Up — machine de scènes (reproduction fidèle Street Flavor)
   Timings/easings extraits du bundle GSAP original :
   - intro : bg scale 1.06→1, mots y60 stagger .08, hero y46, chips back.out(1.4) @.55+,
     badges @.65+, CTA @.8, desc/arrows @.95
   - transition : hero scale .86 → rot -8d → x -120d vw (p3.in), rebond d'arrivée,
     bg xPercent ±4 (p3.inOut .8s), word ∓14vw (p2.in/out), chips/badges pop back.out(1.3)
   - floats idle : yoyo sine.inOut (repriis en CSS custom.css)
   ============================================================ */

const EASE = {
  p1o:  'cubic-bezier(.25,.46,.45,.94)',   // power1.out
  p2o:  'cubic-bezier(.215,.61,.355,1)',   // power2.out
  p3o:  'cubic-bezier(.165,.84,.44,1)',    // power3.out
  p2i:  'cubic-bezier(.55,.055,.675,.19)', // power2.in
  p3i:  'cubic-bezier(.55,.085,.68,.53)',  // power3.in
  p3io: 'cubic-bezier(.77,0,.175,1)',      // power3.inOut
  p2io: 'cubic-bezier(.645,.045,.355,1)',  // power2.inOut
  p1io: 'cubic-bezier(.455,.03,.515,.955)',// power1.inOut
  b14:  'cubic-bezier(.34,1.56,.64,1)',    // back.out(1.4)
  b13:  'cubic-bezier(.34,1.45,.64,1)',    // back.out(1.3)
};

const DESC = [
  "Hot-swappable mechanical boards with per-key RGB, gasket mounts, and tournament-grade response in every keystroke.",
  "Ultra-light wireless mice with 26K optical sensors, pro-grade switches, and precision that never misses a clutch.",
  "Immersive ANC headsets with spatial audio, memory-foam comfort, and studio-clear voice pick-up for marathon sessions.",
];
const SCENES_META = [
  { label: "KEY MASTER",       accent: "#A238FF", onAccent: "#1A0530", banner: "#9F33FF", bannerText: "#FFFFFF" },
  { label: "CLICK PRO",        accent: "#1FD5EE", onAccent: "#04222A", banner: "#1CC8E0", bannerText: "#022A32" },
  { label: "SOUND CORE",       accent: "#FF6F14", onAccent: "#2E1002", banner: "#FF7A1F", bannerText: "#2E1002" },
];
const KEYS = ['k', 'm', 'h'];
const NB = KEYS.length;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const $  = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const an = (el, kf, o) => (el ? el.animate(kf, o) : null);

/* ---------- construction des refs par scène ---------- */
function buildScene(key) {
  const els = $$(`[data-scene="${key}"]`);
  const byZ = (z) => els.filter((e) => e.dataset.z === z);
  const wordBox = byZ('10')[0];
  const heroBox = byZ('40')[0];
  return {
    wrappers: els,
    bg:       byZ('0')[0],
    wordBox,
    words:    wordBox ? [...wordBox.querySelectorAll('.word-line')] : [],
    free:     byZ('20').map((e) => e.querySelector('.float-in'))[0],
    badges:   byZ('30').map((e) => e.querySelector('.float-in')),
    hero:     heroBox ? heroBox.querySelector('.float-hero') : null,
    shadow:   heroBox ? heroBox.querySelector('.hero-shadow') : null,
    chips:    byZ('50').map((e) => e.querySelector('.float-in')),
  };
}
const scenes = KEYS.map(buildScene);

/* état initial : les éléments animés des scènes 1..n démarrent invisibles
   (les wrappers externes restent transparents pour laisser passer les anims enfants) */
scenes.forEach((s, i) => {
  if (i === 0) return;
  [s.hero, s.shadow, s.wordBox, ...s.chips, ...s.badges, s.free].forEach((e) => {
    if (e) e.style.opacity = '0';
  });
});

const stage   = $('#stage');
const descEl  = $('#descText');
const ctasEl  = $('#ctas');
const prevEl  = $('#prevBtn');
const nextEl  = $('#nextBtn');
const orderEl = $('#orderBtn');
const bannerA = $('#bannerBgA');
const bannerB = $('#bannerBgB');
const bannerT = $('#bannerText');

let current = 0;
let busy = true;

/* vecteur centre main → centre élément */
function centerOffset(el) {
  const r = el.getBoundingClientRect();
  const m = stage.getBoundingClientRect();
  return { x: (r.left + r.width / 2) - (m.left + m.width / 2), y: (r.top + r.height / 2) - (m.top + m.height / 2) };
}
const setZ = (scene, delta) => scene.wrappers.forEach((w) => { w.style.zIndex = +w.dataset.z + delta; });

/* ============================================================ INTRO */
function playIntro() {
  const s = scenes[0];
  an(s.bg,     [{ opacity: .85, transform: 'scale(1.06)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 500, easing: EASE.p1o, fill: 'both' });
  s.words.forEach((w, i) =>
    an(w, [{ opacity: 0, transform: 'translateY(60px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 600, delay: 100 + i * 80, easing: EASE.p3o, fill: 'both' }));
  an(s.hero,   [{ opacity: 0, transform: 'translateY(46px) scale(.96)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 600, delay: 250, easing: EASE.p3o, fill: 'both' });
  an(s.shadow, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 350, easing: 'linear', fill: 'both' });
  s.chips.forEach((c, i) => {
    const o = centerOffset(c.parentElement.parentElement);
    const d = Math.hypot(o.x, o.y) || 1;
    an(c, [{ opacity: 0, transform: `translate(${o.x / d * 20}px, ${o.y / d * 20}px) scale(.7)` },
           { opacity: 1, transform: 'translate(0,0) scale(1)' }], { duration: 500, delay: 550 + i * 70, easing: EASE.b14, fill: 'both' });
  });
  [...s.badges, s.free].forEach((b, i) =>
    an(b, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 450, delay: 650 + i * 80, easing: EASE.b14, fill: 'both' }));
  [descEl, ctasEl].forEach((e, i) =>
    an(e, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300, delay: 800 + i * 60, easing: EASE.p2o, fill: 'both' }));
  [prevEl.parentElement, nextEl.parentElement].forEach((e, i) =>
    an(e, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300, delay: 950 + i * 60, easing: EASE.p2o, fill: 'both' }));
  setTimeout(() => { busy = false; }, 1400);
}

/* ============================================================ TRANSITION */
function playTransition(from, to, dir) {
  const A = scenes[from], B = scenes[to], meta = SCENES_META[to];
  stage.setAttribute('aria-label', 'Gaming gear showcase — ' + meta.label);
  setZ(A, -60);          // scène sortante repassée SOUS la desc/CTA/arrows
  setZ(B, 0);            // scène entrante à son rang naturel → au-dessus

  /* couleurs globales */
  setTimeout(() => { bannerB.style.background = meta.banner; }, 340);
  an(bannerB, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: 350, easing: EASE.p1io, fill: 'both' });
  setTimeout(() => { bannerA.style.background = meta.banner; }, 700);
  setTimeout(() => {
    bannerT.style.color = meta.bannerText;
    orderEl.style.backgroundColor = meta.accent;
    orderEl.style.color = meta.onAccent;
  }, 450);

  if (reduced) {
    an(A.bg, [{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: 'both' });
    [A.wordBox, A.hero, ...A.chips, ...A.badges, A.free].forEach((e) =>
      an(e, [{ opacity: 1 }, { opacity: 0 }], { duration: 350, easing: 'linear', fill: 'both' }));
    [B.bg, B.wordBox, B.hero, ...B.chips, ...B.badges, B.free].forEach((e) =>
      an(e, [{ opacity: 0 }, { opacity: 1 }], { duration: 350, delay: 250, easing: 'linear', fill: 'both' }));
    an(B.shadow, [{ opacity: 0 }, { opacity: 1 }], { duration: 350, delay: 250, easing: 'linear', fill: 'both' });
    setTimeout(() => { setZ(A, 0); busy = false; }, 700);
    return;
  }

  /* --- SORTIE --- */
  an(A.hero, [{ transform: 'scale(1) rotate(0deg)', opacity: 1 }, { transform: 'scale(.86) rotate(0deg)', opacity: .63 }],
    { duration: 350, delay: 100, easing: EASE.p2o, fill: 'both' });
  an(A.hero, [{ transform: 'scale(.86) rotate(0deg)', offset: 0 }, { transform: `scale(.86) rotate(${-8 * dir}deg)`, offset: 1 }],
    { duration: 350, delay: 250, easing: EASE.p2io, fill: 'both' });
  an(A.hero, [{ transform: `scale(.86) rotate(${-8 * dir}deg) translateX(0)`, opacity: .63 },
              { transform: `scale(.86) rotate(${-8 * dir}deg) translateX(${-120 * dir}vw)`, opacity: .63 }],
    { duration: 600, delay: 400, easing: EASE.p3i, fill: 'both' });
  an(A.hero, [{ opacity: .63 }, { opacity: 0 }], { duration: 150, delay: 850, easing: 'linear', fill: 'both' });
  an(A.shadow, [{ opacity: 1 }, { opacity: 0 }], { duration: 250, delay: 400, easing: 'linear', fill: 'both' });
  an(A.wordBox, [{ opacity: 1, transform: 'translateX(0) scale(1)' },
                 { opacity: 0, transform: `translateX(${-14 * dir}vw) scale(.98)` }],
    { duration: 550, delay: 450, easing: EASE.p2i, fill: 'both' });
  an(A.bg, [{ transform: 'scale(1) translateX(0)' },
            { transform: `scale(1.1) translateX(${-4 * dir}%)` }],
    { duration: 800, delay: 350, easing: EASE.p3io, fill: 'both' });
  an(descEl, [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-10px)' }],
    { duration: 250, delay: 300, easing: EASE.p2i, fill: 'both' });

  /* bandeau promo : slide du texte */
  an(bannerT, [{ transform: `translateX(${100 * dir}%)` }, { transform: 'translateX(0)' }],
    { duration: 800, delay: 350, easing: EASE.p3io, fill: 'both' });

  /* --- ENTRÉE --- */
  const bgStartO = parseFloat(getComputedStyle(B.bg).opacity);
  an(B.bg, [{ opacity: bgStartO, transform: `scale(1) translateX(${4 * dir}%)` },
            { opacity: 1, transform: 'scale(1) translateX(0)' }],
    { duration: 800, delay: 350, easing: EASE.p3io, fill: 'both' });
  an(B.wordBox, [{ opacity: 0, transform: `translateX(${14 * dir}vw) scale(.98)` },
                 { opacity: 1, transform: 'translateX(0) scale(1)' }],
    { duration: 600, delay: 600, easing: EASE.p2o, fill: 'both' });
  an(B.hero, [{ opacity: 0, transform: `translateX(${120 * dir}vw) scale(1)` },
              { opacity: 1, transform: 'translateX(0) scale(.96)' }],
    { duration: 700, delay: 550, easing: EASE.p3o, fill: 'both' });
  an(B.hero, [
    { transform: 'translateX(0) scale(.96) translateY(0) rotate(0deg)', offset: 0, easing: EASE.p2io },
    { transform: `translateX(0) scale(1.01) translateY(-4px) rotate(${2.5 * dir}deg)`, offset: .49, easing: EASE.p2io },
    { transform: 'translateX(0) scale(1) translateY(0) rotate(0deg)', offset: 1 },
  ], { duration: 450, delay: 900, fill: 'both' });
  an(B.shadow, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay: 900, easing: 'linear', fill: 'both' });

  const pop = (el, delay) => {
    if (!el) return;
    const o = centerOffset(el.parentElement.parentElement);
    an(el, [{ opacity: 0, transform: `translate(${o.x}px, ${o.y}px) scale(.75) rotate(${-6 * dir}deg)` },
            { opacity: 1, transform: 'translate(0,0) scale(1) rotate(0deg)' }],
      { duration: 400, delay, easing: EASE.b13, fill: 'both' });
  };
  B.chips.forEach((c, i) => pop(c, 1050 + i * 60));
  B.badges.forEach((b, i) => pop(b, 1230 + i * 60));
  pop(B.free, 1350);

  an(descEl, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 350, delay: 1100, easing: EASE.p2o, fill: 'both' });

  /* extinction complète de la scène sortante (recouverte puis masquée) */
  setTimeout(() => {
    [...A.chips, ...A.badges, A.free].forEach((e) => e && an(e, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'linear', fill: 'both' }));
    an(A.bg, [{ opacity: 1 }, { opacity: 0 }], { duration: 250, easing: 'linear', fill: 'both' });
  }, 1500);

  setTimeout(() => {
    setZ(A, 0);
    busy = false;
  }, 1750);
}

/* ============================================================ CONTRÔLE */
function go(dir) {
  if (busy) return;
  busy = true;
  const to = (current + dir + NB) % NB;
  descEl.textContent = DESC[to];
  playTransition(current, to, dir);
  current = to;
}

nextEl.addEventListener('click', () => go(1));
prevEl.addEventListener('click', () => go(-1));
addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') go(1);
  else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') go(-1);
});
let tX = 0, tY = 0;
stage.addEventListener('touchstart', (e) => { tX = e.touches[0].clientX; tY = e.touches[0].clientY; }, { passive: true });
stage.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - tX, dy = e.changedTouches[0].clientY - tY;
  if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
});

/* transitions CSS douces pour les couleurs globales */
bannerT.style.transition = 'color .6s ease';
orderEl.style.transition = 'background-color .6s ease, color .6s ease, scale, filter';

playIntro();
