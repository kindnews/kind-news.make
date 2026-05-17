import { useState, useEffect, useCallback } from "react";

// ─── CONSTANTES ──────────────────────────────────────────────────────────────
const BACKEND_URL = "https://kind-backend-production-80b8.up.railway.app";
const LS_PREFS = "kind_prefs_v1";
const LS_HISTORY = "kind_history_v1";
const LS_ONBOARDING = "kind_onboarding_done";

const REGIONES_DISPONIBLES = [
  { id: "latam", nombre: "América Latina" },
  { id: "argentina", nombre: "Argentina" },
  { id: "mexico", nombre: "México" },
  { id: "españa", nombre: "España" },
  { id: "colombia", nombre: "Colombia" },
  { id: "chile", nombre: "Chile" },
];

const PREFS_DEFAULT = {
  region: "latam",
  temas: [],
  portales: [],
};

// ─── HELPERS localStorage ─────────────────────────────────────────────────────
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(LS_PREFS)) || PREFS_DEFAULT; }
  catch { return PREFS_DEFAULT; }
}
function savePrefs(prefs) {
  localStorage.setItem(LS_PREFS, JSON.stringify(prefs));
}
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(LS_HISTORY)) || {}; }
  catch { return {}; }
}
function recordRead(topic) {
  const h = loadHistory();
  h[topic] = (h[topic] || 0) + 1;
  localStorage.setItem(LS_HISTORY, JSON.stringify(h));
}
function isOnboardingDone() {
  return localStorage.getItem(LS_ONBOARDING) === "true";
}
function markOnboardingDone() {
  localStorage.setItem(LS_ONBOARDING, "true");
}

// ─── DATOS FALLBACK ──────────────────────────────────────────────────────────
const BRIEF_VARIANTS = [
  { headline: "Lo que pasó hoy, sin filtros ni alarma", intro: "Buenos días. Hubo cosas buenas, hubo cosas difíciles. Como siempre. Acá te las contamos con contexto y sin el loop de angustia.", closing: "Estar informado no significa estar angustiado. Significa entender mejor el mundo." },
  { headline: "El mundo no para. Tampoco vos.", intro: "Arrancar el día con buena información es una decisión. Acá está lo más importante de las últimas horas, ordenado para que puedas leerlo en paz.", closing: "Saber lo que pasa no te obliga a cargarlo todo." },
  { headline: "Mucho ruido afuera. Acá, solo lo que importa.", intro: "Hay días en que las noticias parecen una catarata. Hoy elegimos lo relevante y te lo dejamos acá. Sin clickbait, sin catástrofe.", closing: "El mundo es complejo. Lo simple es cómo te lo contamos." },
  { headline: "Noticias que merecen tu atención", intro: "No todo lo que hace ruido importa, y no todo lo que importa hace ruido. Este brief intenta equilibrar eso.", closing: "Gracias por leer con calma. Es un acto más político de lo que parece." },
  { headline: "Un día más, un mundo entero", intro: "Mientras dormías pasaron cosas. Algunas buenas, algunas difíciles. Acá el resumen honesto.", closing: "No hay forma de controlar todo. Sí hay formas de entender mejor." },
  { headline: "Sin dramatismo, sin ingenuidad", intro: "El periodismo que te agota no es inevitable. Se puede informar bien sin alarmar, sin omitir.", closing: "Curiosidad sin ansiedad. Eso es lo que Kind intenta ser." },
  { headline: "Lo importante de hoy, con todo el contexto", intro: "Cada noticia tiene historia, causa y consecuencia. Acá no te damos solo el titular: te damos el marco.", closing: "Informarse bien lleva un poco más de tiempo. Vale la pena." },
];

const BRIEF_ITEMS_DEFAULT = [
  { icon: "🌊", tag: "Crisis · Ambiente", text: "Las inundaciones en el sur de Brasil dejaron más de 40.000 desplazados.", hard: true },
  { icon: "🧬", tag: "Ciencia", text: "Investigadores lograron regenerar tejido cardíaco con células madre en un ensayo histórico." },
  { icon: "⚖️", tag: "Conflicto · Mundo", text: "La ONU advirtió que las negociaciones de paz en Sudán están estancadas.", hard: true },
  { icon: "☀️", tag: "Ambiente", text: "España superó su meta de energía renovable con tres años de anticipación." },
];

const CATEGORIES = [
  { id: "all", label: "Todo" },
  { id: "Mundo", label: "Mundo" },
  { id: "Ciencia", label: "Ciencia" },
  { id: "Ambiente", label: "Ambiente" },
  { id: "Tecnología", label: "Tecnología" },
  { id: "Salud", label: "Salud" },
  { id: "Economía", label: "Economía" },
];

const SECTIONS = [
  { id: "feed", label: "Feed", icon: "📰", desc: "Todas las noticias del día" },
  { id: "brief", label: "Brief", icon: "☀️", desc: "El resumen matutino" },
  { id: "intereses", label: "Tus intereses", icon: "🎛️", desc: "Personalizá tu feed" },
  { id: "redes", label: "Destacado en redes", icon: "📱", desc: "Lo más compartido hoy" },
  { id: "nosotros", label: "Nosotros", icon: "✦", desc: "Qué es Kind" },
];

const WELLNESS_TIPS = [
  { icon: "💧", title: "Hidratación", msg: "¿Tomaste agua en la última hora? Un vaso ahora hace la diferencia.", color: "#EBF5FB" },
  { icon: "🚶", title: "Movilidad", msg: "Levantate 2 minutos. Estirá el cuello y los hombros. Tu cuerpo te lo agradece.", color: "#EBF5EF" },
  { icon: "🧘", title: "Respiración", msg: "Inhala 4 segundos, sostén 4, exhala 4. Repetí 3 veces.", color: "#F3EBF5" },
  { icon: "🎵", title: "Música", msg: "Una canción que te guste puede cambiar el humor en segundos.", color: "#FDF5E8" },
  { icon: "👁️", title: "Descanso visual", msg: "Mirá algo lejano por 20 segundos. Tus ojos necesitan ese descanso.", color: "#F5EBEB" },
  { icon: "🌿", title: "Pausa consciente", msg: "Antes de seguir leyendo, ¿cómo estás? Tomá un momento.", color: "#EBF5EF" },
  { icon: "😊", title: "Gratitud", msg: "Pensá en una cosa buena que pasó hoy, aunque sea pequeña.", color: "#FBF8E8" },
  { icon: "🤸", title: "Estiramiento", msg: "Rodá los hombros hacia atrás 5 veces. Tu espalda te lo agradece.", color: "#EBF0F5" },
];

const ALL_PORTALS = ["BBC Mundo", "El País", "Infobae", "Clarín", "La Nación", "DW Español", "El Universal", "La Tercera"];

const ALL_NEWS_FALLBACK = [
  { id: 1, portal: "BBC Mundo", topic: "Mundo", title: "Inundaciones en Brasil dejan 40.000 desplazados en tres provincias", summary: "Es el tercer evento climático extremo en la región en lo que va de 2026.", tone: "hard", time: "15 min", photo: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&h=360&fit=crop", read: 4, url: "https://www.bbc.com/mundo", featured: true },
  { id: 2, portal: "El País", topic: "Mundo", title: "ONU: las negociaciones de paz en Sudán están estancadas", summary: "Más de 8 millones de personas llevan desplazadas desde el inicio del conflicto.", tone: "hard", time: "45 min", photo: "https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=600&h=360&fit=crop", read: 5, url: "https://www.elpais.com" },
  { id: 3, portal: "BBC Mundo", topic: "Ciencia", title: "Células madre cardíacas: el ensayo que puede cambiar la medicina", summary: "Un equipo internacional publicó resultados que podrían transformar el tratamiento de enfermedades del corazón.", tone: "positive", time: "1h", photo: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=360&fit=crop", read: 4, url: "https://www.bbc.com/mundo" },
  { id: 4, portal: "Infobae", topic: "Economía", title: "El desempleo juvenil en LATAM supera el 20% por segundo año consecutivo", summary: "El informe de la OIT revela que la recuperación post-pandemia no llegó al segmento más joven.", tone: "hard", time: "2h", photo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=360&fit=crop", read: 5, url: "https://www.infobae.com" },
  { id: 5, portal: "El País", topic: "Ambiente", title: "España supera su meta renovable con tres años de anticipación", summary: "El país generó el 58% de su electricidad con fuentes limpias durante el primer trimestre.", tone: "positive", time: "2h", photo: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=360&fit=crop", read: 3, url: "https://www.elpais.com" },
  { id: 6, portal: "BBC Mundo", topic: "Tecnología", title: "La IA chilena que diagnostica lo que los médicos no pueden ver", summary: "El sistema reduce de años a semanas el diagnóstico de enfermedades raras.", tone: "positive", time: "3h", photo: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=360&fit=crop", read: 4, url: "https://www.bbc.com/mundo" },
  { id: 7, portal: "La Nación", topic: "Salud", title: "Crece el burnout docente: una crisis silenciosa en las escuelas", summary: "Sindicatos y especialistas coinciden en que las condiciones laborales del sector educativo se deterioraron.", tone: "hard", time: "4h", photo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=360&fit=crop", read: 6, url: "https://www.lanacion.com.ar" },
  { id: 8, portal: "La Nación", topic: "Mundo", title: "80.000 personas y récord histórico en la Feria del Libro porteña", summary: "La edición 2026 superó todas las marcas anteriores. El 40% tenía menos de 30 años.", tone: "positive", time: "4h", photo: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=360&fit=crop", read: 3, url: "https://www.lanacion.com.ar" },
];

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #111; --ink-2: #333; --ink-3: #666; --muted: #999; --faint: #ccc;
    --paper: #FAFAF8; --warm: #F5F2ED; --border: #E8E4DF; --border-light: #F0ECE7;
    --green: #1B5E3B; --green-light: #2D9659; --green-pale: #EBF5EF;
    --red: #7A1F1F; --red-pale: #FAEAEA;
    --nav-h: 60px; --cat-h: 42px;
  }
  html { scroll-behavior: smooth; }
  body { background: var(--paper); font-family: 'DM Sans', sans-serif; color: var(--ink); -webkit-font-smoothing: antialiased; }

  /* NAV */
  .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 300; height: var(--nav-h); background: rgba(250,250,248,0.97); backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; gap: 14px; }
  .nav-burger { width: 36px; height: 36px; flex-shrink: 0; background: none; border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; border-radius: 8px; transition: background 0.2s; padding: 0; }
  .nav-burger:hover { background: var(--warm); }
  .hline { width: 20px; height: 1.5px; background: var(--ink); border-radius: 2px; transition: all 0.25s ease; transform-origin: center; }
  .nav-burger.open .hline:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
  .nav-burger.open .hline:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .nav-burger.open .hline:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
  .nav-logo { font-family: 'Lora', serif; font-size: 22px; font-weight: 700; color: var(--ink); letter-spacing: -0.02em; cursor: pointer; flex-shrink: 0; }
  .nav-logo span { color: var(--green); }
  .nav-sep { width: 1px; height: 18px; background: var(--border); flex-shrink: 0; }
  .nav-tagline { font-size: 11px; color: var(--muted); flex-shrink: 0; display: flex; align-items: center; gap: 8px; }
  .live-badge { display: inline-flex; align-items: center; gap: 4px; background: var(--green-pale); color: var(--green); font-size: 9.5px; font-weight: 700; padding: 2px 8px; border-radius: 100px; }
  .nav-search { flex: 1; max-width: 360px; margin: 0 auto; position: relative; }
  .nav-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; color: var(--muted); pointer-events: none; }
  .nav-search input { width: 100%; height: 34px; background: var(--warm); border: 1px solid var(--border-light); border-radius: 100px; padding: 0 16px 0 36px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--ink); outline: none; transition: all 0.2s; }
  .nav-search input:focus { background: white; border-color: var(--green); box-shadow: 0 0 0 3px rgba(27,94,59,0.07); }
  .nav-search input::placeholder { color: var(--muted); }
  .nav-date { font-size: 11px; color: var(--muted); flex-shrink: 0; margin-left: auto; }

  /* CAT BAR */
  .cat-bar { position: fixed; top: var(--nav-h); left: 0; right: 0; z-index: 290; height: var(--cat-h); background: rgba(250,250,248,0.97); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; gap: 2px; overflow-x: auto; scrollbar-width: none; }
  .cat-bar::-webkit-scrollbar { display: none; }
  .cat-btn { white-space: nowrap; padding: 6px 14px; border-radius: 100px; border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 500; color: var(--ink-3); cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
  .cat-btn:hover { background: var(--warm); color: var(--ink); }
  .cat-btn.active { background: var(--ink); color: white; }

  /* DRAWER */
  .overlay { position: fixed; inset: 0; z-index: 250; background: rgba(0,0,0,0.18); backdrop-filter: blur(2px); opacity: 0; pointer-events: none; transition: opacity 0.3s; }
  .overlay.open { opacity: 1; pointer-events: all; }
  .drawer { position: fixed; top: 0; left: 0; bottom: 0; z-index: 260; width: 260px; background: var(--paper); border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow-y: auto; transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
  .drawer.open { transform: translateX(0); }
  .drawer-head { padding: 18px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
  .drawer-logo { font-family: 'Lora', serif; font-size: 20px; font-weight: 700; color: var(--ink); }
  .drawer-logo span { color: var(--green); }
  .drawer-x { width: 28px; height: 28px; background: none; border: none; cursor: pointer; font-size: 16px; color: var(--muted); border-radius: 6px; transition: background 0.15s; display: flex; align-items: center; justify-content: center; }
  .drawer-x:hover { background: var(--warm); color: var(--ink); }
  .drawer-lbl { padding: 14px 20px 6px; font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
  .drawer-nav { padding: 0 10px 4px; }
  .dnav-btn { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 10px; border: none; background: transparent; font-family: 'DM Sans', sans-serif; width: 100%; text-align: left; cursor: pointer; transition: all 0.15s; }
  .dnav-btn:hover { background: var(--warm); }
  .dnav-btn.active { background: var(--green); }
  .dnav-icon { font-size: 17px; width: 24px; text-align: center; flex-shrink: 0; }
  .dnav-info { display: flex; flex-direction: column; gap: 2px; }
  .dnav-label { font-size: 14px; font-weight: 600; color: var(--ink-2); line-height: 1; }
  .dnav-desc { font-size: 11px; color: var(--muted); font-weight: 400; }
  .dnav-btn.active .dnav-label { color: white; }
  .dnav-btn.active .dnav-desc { color: rgba(255,255,255,0.6); }
  .drawer-div { height: 1px; background: var(--border); margin: 8px 20px; flex-shrink: 0; }
  .drawer-region { padding: 0 12px 16px; }
  .drawer-region-label { font-size: 9.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; padding: 0 8px; }
  .drawer-region select { width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--ink); background: white; outline: none; cursor: pointer; }
  .drawer-region select:focus { border-color: var(--green); }

  /* LAYOUT */
  .page { padding-top: calc(var(--nav-h) + var(--cat-h)); min-height: 100vh; }
  .layout { max-width: 1240px; margin: 0 auto; padding: 32px 24px 60px; display: grid; grid-template-columns: 1fr 264px; gap: 32px; align-items: start; }

  /* SIDEBAR */
  .sidebar { position: sticky; top: calc(var(--nav-h) + var(--cat-h) + 24px); display: flex; flex-direction: column; gap: 14px; }
  .wellness-card { border-radius: 14px; padding: 18px; transition: background 0.6s ease; border: 1px solid rgba(0,0,0,0.04); }
  .wc-label { font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--green); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
  .wc-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--green); animation: pulse 2.5s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.6)} }
  .wc-icon { font-size: 32px; margin-bottom: 10px; display: block; }
  .wc-title { font-family: 'Lora', serif; font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
  .wc-msg { font-size: 12.5px; font-weight: 300; color: var(--ink-3); line-height: 1.65; margin-bottom: 12px; }
  .wc-next { font-size: 11px; font-weight: 600; color: var(--green); cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; padding: 0; }
  .wc-next:hover { text-decoration: underline; }
  .wc-dots { display: flex; gap: 4px; margin-top: 10px; }
  .wc-dot-ind { width: 5px; height: 5px; border-radius: 50%; background: var(--border); transition: background 0.3s; cursor: pointer; }
  .wc-dot-ind.active { background: var(--green); }
  .thought-card { background: var(--ink); border-radius: 14px; padding: 18px; }
  .tc-label { font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.38); margin-bottom: 10px; }
  .tc-text { font-family: 'Lora', serif; font-size: 14px; font-style: italic; color: rgba(255,255,255,0.88); line-height: 1.65; }
  .tc-dash { margin-top: 10px; width: 24px; height: 1.5px; background: rgba(255,255,255,0.2); border-radius: 1px; }
  .ai-sidebar-card { background: white; border: 1px solid var(--border); border-radius: 14px; padding: 18px; }
  .ai-label-row { display: flex; align-items: center; gap: 7px; font-size: 9.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
  .ai-badge { background: var(--green-pale); color: var(--green); font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 100px; }
  .ai-text { font-size: 12.5px; font-weight: 300; color: var(--ink-2); line-height: 1.65; }
  .ai-refresh { display: flex; align-items: center; gap: 5px; margin-top: 8px; cursor: pointer; font-size: 11px; font-weight: 500; color: var(--green); background: none; border: none; font-family: 'DM Sans', sans-serif; padding: 0; }
  .spinner-sm { width: 12px; height: 12px; border: 1.5px solid var(--border); border-top-color: var(--green); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* HERO */
  .hero { margin-bottom: 28px; }
  .hero-eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
  .live-row { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--green); }
  .live-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); animation: pulse 2s ease-in-out infinite; }
  .topic-badge { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 10px; border-radius: 100px; border: 1px solid; }
  .topic-badge.hard { color: var(--red); border-color: var(--red); background: var(--red-pale); }
  .topic-badge.positive { color: var(--green); border-color: var(--green); background: var(--green-pale); }
  .hero-grid { display: grid; grid-template-columns: 1fr 280px; gap: 28px; align-items: center; padding-bottom: 24px; border-bottom: 2px solid var(--ink); }
  .hero-title { font-family: 'Lora', serif; font-size: 32px; font-weight: 700; color: var(--ink); line-height: 1.22; letter-spacing: -0.02em; margin-bottom: 14px; }
  .hero-summary { font-size: 15px; font-weight: 300; color: var(--ink-3); line-height: 1.72; margin-bottom: 18px; }
  .hero-foot { display: flex; align-items: center; gap: 12px; }
  .hero-portal { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }
  .hero-time { font-size: 11px; color: var(--faint); }
  .hero-link { display: inline-flex; align-items: center; gap: 5px; margin-left: auto; background: var(--ink); color: white; font-size: 12px; font-weight: 600; padding: 7px 16px; border-radius: 100px; text-decoration: none; transition: opacity 0.2s; }
  .hero-link:hover { opacity: 0.82; }
  .hero-img-wrap { border-radius: 10px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .hero-img-wrap img { width: 100%; height: 200px; object-fit: cover; display: block; }

  /* SECTION */
  .sec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 8px; }
  .sec-title { font-family: 'Lora', serif; font-size: 17px; font-weight: 700; color: var(--ink); }
  .sec-right { display: flex; align-items: center; gap: 7px; }
  .sec-count { font-size: 11px; color: var(--muted); letter-spacing: 0.06em; }
  .fchip { padding: 5px 12px; border-radius: 100px; border: 1px solid var(--border); background: transparent; font-family: 'DM Sans', sans-serif; font-size: 11.5px; font-weight: 500; color: var(--muted); cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .fchip.active { background: var(--ink); border-color: var(--ink); color: white; }
  .fchip:not(.active):hover { border-color: var(--green); color: var(--green); }

  /* NEWS GRID */
  .news-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .ncard { background: var(--paper); padding: 16px; display: flex; flex-direction: column; gap: 9px; text-decoration: none; cursor: pointer; transition: background 0.18s; animation: fadeUp 0.4s ease forwards; opacity: 0; }
  .ncard:hover { background: white; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .ncard-img { width: 100%; height: 130px; border-radius: 7px; overflow: hidden; flex-shrink: 0; }
  .ncard-img img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
  .ncard:hover .ncard-img img { transform: scale(1.04); }
  .ncard-topic { font-size: 9.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
  .ncard-topic.hard { color: var(--red); }
  .ncard-topic.positive { color: var(--green); }
  .ncard-title { font-family: 'Lora', serif; font-size: 14px; font-weight: 600; color: var(--ink); line-height: 1.4; flex: 1; }
  .ncard-foot { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid var(--border-light); margin-top: auto; }
  .ncard-meta { font-size: 10px; color: var(--muted); display: flex; gap: 4px; }
  .ncard-meta b { font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
  .ncard-link { font-size: 10.5px; font-weight: 600; color: var(--green); text-decoration: none; padding: 3px 9px; border-radius: 100px; background: var(--green-pale); transition: background 0.15s; white-space: nowrap; }
  .ncard-link:hover { background: #d4eddc; }

  .load-wrap { text-align: center; padding: 24px 0 0; }
  .load-btn { padding: 10px 28px; border-radius: 100px; border: 1px solid var(--border); background: white; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: var(--ink-3); cursor: pointer; transition: all 0.18s; box-shadow: 0 1px 8px rgba(0,0,0,0.05); }
  .load-btn:hover { border-color: var(--green); color: var(--green); }
  .loading-row { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; color: var(--muted); }

  /* LOADING SCREEN */
  .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 16px; }
  .loading-logo { font-family: 'Lora', serif; font-size: 36px; font-weight: 700; color: var(--ink); }
  .loading-logo span { color: var(--green); }
  .loading-bar { width: 120px; height: 2px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .loading-bar-fill { height: 100%; background: var(--green); border-radius: 2px; animation: loadBar 1.5s ease-in-out infinite; }
  @keyframes loadBar { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
  .loading-msg { font-size: 13px; color: var(--muted); }

  /* ONBOARDING BANNER */
  .onboarding-banner {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 400;
    background: white;
    border-top: 1px solid var(--border);
    box-shadow: 0 -4px 24px rgba(0,0,0,0.08);
    padding: 16px 24px;
    display: flex; align-items: center; gap: 16px;
    animation: slideUp2 0.4s ease forwards;
  }
  @keyframes slideUp2 { from{transform:translateY(100%)} to{transform:translateY(0)} }
  .ob-icon { font-size: 24px; flex-shrink: 0; }
  .ob-text { flex: 1; }
  .ob-title { font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
  .ob-sub { font-size: 12px; font-weight: 300; color: var(--muted); }
  .ob-actions { display: flex; gap: 8px; flex-shrink: 0; }
  .ob-btn-primary { padding: 8px 16px; background: var(--green); color: white; border: none; border-radius: 100px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; }
  .ob-btn-secondary { padding: 8px 14px; background: transparent; color: var(--muted); border: 1px solid var(--border); border-radius: 100px; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; cursor: pointer; white-space: nowrap; }

  /* INTERESES */
  .intereses-intro { background: white; border: 1px solid var(--border); border-radius: 14px; padding: 20px; margin-bottom: 16px; }
  .int-title { font-family: 'Lora', serif; font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
  .int-sub { font-size: 13px; font-weight: 300; color: var(--ink-3); line-height: 1.6; }
  .int-note { margin-top: 12px; padding: 10px 14px; background: #FDF3E3; border-radius: 10px; font-size: 12px; color: #7A5020; line-height: 1.55; border-left: 3px solid #C97D2A; }
  .int-section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; }
  .portals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
  .portal-pill { display: flex; align-items: center; justify-content: space-between; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 10px; cursor: pointer; background: white; transition: all 0.15s; }
  .portal-pill.selected { border-color: var(--green); background: var(--green-pale); }
  .portal-name { font-size: 13px; font-weight: 500; color: var(--ink-2); }
  .portal-check { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 10px; transition: all 0.15s; }
  .portal-pill.selected .portal-check { background: var(--green); border-color: var(--green); color: white; }
  .topics-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
  .topic-tag { padding: 7px 14px; border-radius: 100px; border: 1.5px solid var(--border); background: white; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: var(--ink-2); cursor: pointer; transition: all 0.15s; }
  .topic-tag.selected { background: var(--ink); border-color: var(--ink); color: white; }
  .region-select-full { width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--ink); background: white; outline: none; margin-bottom: 20px; cursor: pointer; }
  .region-select-full:focus { border-color: var(--green); }
  .save-btn { width: 100%; padding: 14px; background: var(--green); color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity 0.2s; }
  .save-btn:hover { opacity: 0.88; }
  .saved-badge { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: var(--green-pale); border-radius: 10px; font-size: 13px; color: var(--green); font-weight: 500; }

  /* HISTORIA */
  .history-card { background: white; border: 1px solid var(--border); border-radius: 14px; padding: 18px; margin-bottom: 16px; }
  .history-title { font-family: 'Lora', serif; font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 12px; }
  .history-bars { display: flex; flex-direction: column; gap: 8px; }
  .history-bar-row { display: flex; align-items: center; gap: 10px; }
  .history-bar-label { font-size: 12px; font-weight: 500; color: var(--ink-2); width: 80px; flex-shrink: 0; }
  .history-bar-track { flex: 1; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .history-bar-fill { height: 100%; background: var(--green); border-radius: 3px; transition: width 0.5s ease; }
  .history-bar-count { font-size: 11px; color: var(--muted); width: 20px; text-align: right; flex-shrink: 0; }

  /* BRIEF */
  .brief-hero-panel { background: var(--ink); border-radius: 14px; padding: 28px; margin-bottom: 20px; position: relative; overflow: hidden; }
  .brief-hero-panel::before { content: ''; position: absolute; top: -40px; right: -40px; width: 180px; height: 180px; background: radial-gradient(circle, rgba(27,94,59,0.4) 0%, transparent 65%); border-radius: 50%; pointer-events: none; }
  .bh-label { font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 10px; display: flex; align-items: center; gap: 7px; }
  .bh-title { font-family: 'Lora', serif; font-size: 22px; font-weight: 600; color: white; font-style: italic; line-height: 1.35; margin-bottom: 10px; }
  .bh-intro { font-size: 13.5px; font-weight: 300; color: rgba(255,255,255,0.6); line-height: 1.65; }
  .brief-items { background: white; border: 1px solid var(--border); border-radius: 14px; overflow: hidden; margin-bottom: 16px; }
  .brief-item { display: flex; gap: 14px; padding: 16px 20px; border-bottom: 1px solid var(--border-light); align-items: flex-start; }
  .brief-item:last-child { border-bottom: none; }
  .bi-icon { width: 40px; height: 40px; flex-shrink: 0; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .bi-icon.normal { background: var(--warm); }
  .bi-icon.hard { background: var(--red-pale); }
  .bi-tag { font-size: 9.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; }
  .bi-tag.normal { color: var(--green); }
  .bi-tag.hard { color: var(--red); }
  .bi-text { font-family: 'Lora', serif; font-size: 13.5px; color: var(--ink-2); line-height: 1.6; }
  .brief-closing { background: var(--green-pale); border-radius: 12px; padding: 16px 18px; border-left: 3px solid var(--green); }
  .bc-text { font-family: 'Lora', serif; font-size: 14px; font-style: italic; color: var(--green); line-height: 1.6; }

  /* REDES */
  .redes-intro { font-family: 'Lora', serif; font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
  .redes-sub { font-size: 13px; font-weight: 300; color: var(--muted); line-height: 1.6; margin-bottom: 20px; }
  .social-card { border-radius: 14px; overflow: hidden; margin-bottom: 14px; box-shadow: 0 2px 16px rgba(0,0,0,0.07); }
  .sc-label { padding: 8px 16px; background: var(--warm); font-size: 10.5px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); display: flex; align-items: center; gap: 7px; }
  .sc-dot { width: 8px; height: 8px; border-radius: 50%; }
  .sc-preview { padding: 24px; min-height: 160px; display: flex; flex-direction: column; justify-content: flex-end; position: relative; }
  .sc-kind { font-family: 'Lora', serif; font-size: 12px; font-weight: 700; position: absolute; top: 18px; left: 22px; opacity: 0.65; }
  .sc-body { font-family: 'Lora', serif; font-size: 16px; font-weight: 600; line-height: 1.45; margin-bottom: 10px; }
  .sc-tag { font-size: 11px; opacity: 0.5; }
  .x-preview { padding: 18px 20px; background: #0a0a0a; }
  .x-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .x-av { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--green), #C97D2A); display: flex; align-items: center; justify-content: center; font-family: 'Lora', serif; font-size: 13px; font-weight: 700; color: white; }
  .x-name { font-size: 13px; font-weight: 600; color: white; }
  .x-handle { font-size: 11px; color: #666; }
  .x-body { font-size: 14px; color: rgba(255,255,255,0.9); line-height: 1.55; margin-bottom: 10px; }
  .x-tag { font-size: 12px; color: #4A9EE8; }
  .x-acts { display: flex; gap: 16px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.07); }
  .x-act { font-size: 11px; color: #666; }

  /* NOSOTROS */
  .nos-hero { background: var(--ink); border-radius: 14px; padding: 28px; margin-bottom: 20px; position: relative; overflow: hidden; }
  .nos-hero::before { content: ''; position: absolute; bottom: -30px; right: -30px; width: 160px; height: 160px; background: radial-gradient(circle, rgba(27,94,59,0.45) 0%, transparent 65%); border-radius: 50%; pointer-events: none; }
  .nh-label { font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.38); margin-bottom: 10px; }
  .nh-title { font-family: 'Lora', serif; font-size: 26px; font-weight: 700; color: white; line-height: 1.25; margin-bottom: 12px; }
  .nh-title em { color: #52B788; font-style: normal; }
  .nh-sub { font-size: 13.5px; font-weight: 300; color: rgba(255,255,255,0.55); line-height: 1.65; }
  .nos-cards { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
  .nos-card { background: white; border: 1px solid var(--border); border-radius: 12px; padding: 18px; display: flex; gap: 14px; align-items: flex-start; }
  .nos-icon { font-size: 22px; flex-shrink: 0; }
  .nos-ctitle { font-family: 'Lora', serif; font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 5px; }
  .nos-ctext { font-size: 12.5px; font-weight: 300; color: var(--ink-3); line-height: 1.6; }
  .nos-manif { background: var(--green); border-radius: 12px; padding: 22px; text-align: center; margin-bottom: 16px; }
  .nos-manif-title { font-family: 'Lora', serif; font-size: 20px; font-weight: 700; color: white; font-style: italic; margin-bottom: 8px; line-height: 1.3; }
  .nos-manif-sub { font-size: 12.5px; font-weight: 300; color: rgba(255,255,255,0.65); line-height: 1.6; }
  .nos-links { display: flex; gap: 10px; }
  .nos-link { flex: 1; padding: 14px; border-radius: 12px; display: flex; align-items: center; gap: 10px; text-decoration: none; transition: opacity 0.2s; }
  .nos-link:hover { opacity: 0.85; }
  .nos-link-name { font-size: 13px; font-weight: 600; color: white; }
  .nos-link-sub { font-size: 10.5px; color: rgba(255,255,255,0.45); }

  /* MOB NAV */
  .mob-nav { display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 200; background: rgba(250,250,248,0.97); backdrop-filter: blur(20px); border-top: 1px solid var(--border); padding: 8px 8px 18px; }
  .mob-nav-inner { display: flex; }
  .mob-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 7px 4px; border: none; background: transparent; cursor: pointer; font-family: 'DM Sans', sans-serif; border-radius: 8px; transition: background 0.15s; }
  .mob-btn:hover { background: var(--warm); }
  .mob-btn.active { background: var(--warm); }
  .mob-icon { font-size: 17px; }
  .mob-label { font-size: 9px; font-weight: 500; color: var(--muted); }
  .mob-btn.active .mob-label { color: var(--green); font-weight: 600; }

  @media (max-width: 1000px) {
    .layout { grid-template-columns: 1fr; }
    .sidebar { display: none; }
    .hero-grid { grid-template-columns: 1fr; gap: 16px; }
    .hero-img-wrap { display: none; }
    .mob-nav { display: block; }
    .page { padding-bottom: 80px; }
    .news-grid { grid-template-columns: 1fr; }
    .portals-grid { grid-template-columns: 1fr; }
    .onboarding-banner { flex-direction: column; align-items: flex-start; }
    .ob-actions { width: 100%; }
  }
  @media (max-width: 640px) {
    .layout { padding: 20px 16px 60px; }
    .nav { padding: 0 16px; gap: 10px; }
    .nav-tagline { display: none; }
    .nav-sep { display: none; }
    .nav-date { display: none; }
    .cat-bar { padding: 0 16px; }
    .hero-title { font-size: 24px; }
    .nos-links { flex-direction: column; }
  }
`;

// ─── COMPONENTE ───────────────────────────────────────────────────────────────
export default function Kind() {
  // UI state
  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState("feed");
  const [activeCategory, setActiveCategory] = useState("all");
  const [toneFilter, setToneFilter] = useState("all");
  const [wellnessIdx, setWellnessIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [cargando, setCargando] = useState(true);

  // News state
  const [visibleNews, setVisibleNews] = useState(ALL_NEWS_FALLBACK);
  const [extraPool, setExtraPool] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [backendOk, setBackendOk] = useState(false);

  // Brief / editorial
  const [briefData, setBriefData] = useState(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Preferencias (localStorage)
  const [prefs, setPrefs] = useState(loadPrefs);
  const [prefsTemp, setPrefsTemp] = useState(loadPrefs); // para edición en Intereses
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Historial de lectura
  const [history, setHistory] = useState(loadHistory);

  const dayOfWeek = new Date().getDay();
  const briefFallback = BRIEF_VARIANTS[dayOfWeek];
  const brief = briefData || briefFallback;
  const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const tip = WELLNESS_TIPS[wellnessIdx];

  // ── DETECTAR REGIÓN POR IP ────────────────────────────────────────────────
  useEffect(() => {
    const detectarRegion = async () => {
      // Solo si el usuario no tiene preferencias guardadas
      const prefsGuardadas = loadPrefs();
      if (prefsGuardadas.region !== "latam") return;
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const pais = data.country_code?.toLowerCase();
        const mapaRegion = { ar: "argentina", mx: "mexico", es: "españa", co: "colombia", cl: "chile" };
        const region = mapaRegion[pais] || "latam";
        if (region !== "latam") {
          const nuevasPrefs = { ...prefsGuardadas, region };
          setPrefs(nuevasPrefs);
          setPrefsTemp(nuevasPrefs);
          savePrefs(nuevasPrefs);
        }
      } catch {}
    };
    detectarRegion();
  }, []);

  // ── MOSTRAR BANNER ONBOARDING ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOnboardingDone()) {
      const t = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  // ── FETCH BACKEND ─────────────────────────────────────────────────────────
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const cargarBackend = async () => {
      setCargando(true);
      try {
        const region = loadPrefs().region || "latam";
        const res = await fetch(`${BACKEND_URL}/api/todo?region=${region}`);
        const data = await res.json();
        if (data.noticias && data.noticias.length > 0) {
          const noticias = data.noticias.map((n, i) => ({ ...n, featured: i === 0 }));
          // Reordenar según historial de lectura
          const historial = loadHistory();
          const sorted = reordenarPorHistorial(noticias, historial);
          setVisibleNews(sorted);
          setExtraPool([]);
          setBackendOk(true);
        }
        if (data.brief) setBriefData(data.brief);
        if (data.editorial) setAiText(data.editorial);
      } catch (err) {
        console.warn("Backend no disponible:", err.message);
      }
      setCargando(false);
    };
    cargarBackend();
  }, [prefs.region]);

  // Wellness rotation
  useEffect(() => {
    const t = setInterval(() => setWellnessIdx(i => (i + 1) % WELLNESS_TIPS.length), 20000);
    return () => clearInterval(t);
  }, []);

  // ── REORDENAR POR HISTORIAL ───────────────────────────────────────────────
  function reordenarPorHistorial(noticias, historial) {
    if (Object.keys(historial).length === 0) return noticias;
    const totalLecturas = Object.values(historial).reduce((a, b) => a + b, 0);
    return [...noticias].sort((a, b) => {
      const pesoA = (historial[a.topic] || 0) / totalLecturas;
      const pesoB = (historial[b.topic] || 0) / totalLecturas;
      return pesoB - pesoA;
    });
  }

  // ── REGISTRAR LECTURA ─────────────────────────────────────────────────────
  function handleOpenNews(url, topic) {
    recordRead(topic);
    setHistory(loadHistory());
    window.open(url, "_blank");
  }

  // ── AI EDITORIAL ──────────────────────────────────────────────────────────
  const loadAI = useCallback(async () => {
    if (backendOk && aiText) return;
    setAiLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/editorial`);
      const data = await res.json();
      if (data.editorial) { setAiText(data.editorial); setAiLoading(false); return; }
    } catch {}
    setAiLoading(false);
  }, [backendOk, aiText]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!cargando && !aiText) loadAI(); }, [cargando]);

  // ── BÚSQUEDA ──────────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
    }
  };

  // ── LOAD MORE ─────────────────────────────────────────────────────────────
  const handleLoadMore = () => {
    if (!extraPool.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleNews(prev => [...prev, ...extraPool.slice(0, 3)]);
      setExtraPool(prev => prev.slice(3));
      setLoadingMore(false);
    }, 700);
  };

  // ── GUARDAR PREFERENCIAS ──────────────────────────────────────────────────
  const handleSavePrefs = () => {
    setPrefs(prefsTemp);
    savePrefs(prefsTemp);
    setPrefsSaved(true);
    markOnboardingDone();
    setShowBanner(false);
    setTimeout(() => setPrefsSaved(false), 3000);
  };

  const handleDismissBanner = () => {
    markOnboardingDone();
    setShowBanner(false);
  };

  const goSection = (id) => { setSection(id); setMenuOpen(false); };

  const featured = visibleNews.find(n => n.featured);
  const filtered = visibleNews.filter(n => {
    const catOk = activeCategory === "all" || n.topic === activeCategory;
    const toneOk = toneFilter === "all" || n.tone === toneFilter;
    const portalOk = prefs.portales.length === 0 || prefs.portales.includes(n.portal);
    return catOk && toneOk && !n.featured && portalOk;
  });

  // Historial para mostrar en Intereses
  const historialTotal = Object.values(history).reduce((a, b) => a + b, 0);
  const historialOrdenado = Object.entries(history).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // ── SIDEBAR ───────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div className="sidebar">
      <div className="wellness-card" style={{ background: tip.color }}>
        <div className="wc-label"><div className="wc-dot" />Pausa Kind</div>
        <span className="wc-icon">{tip.icon}</span>
        <div className="wc-title">{tip.title}</div>
        <div className="wc-msg">{tip.msg}</div>
        <button className="wc-next" onClick={() => setWellnessIdx(i => (i + 1) % WELLNESS_TIPS.length)}>Siguiente tip →</button>
        <div className="wc-dots">
          {WELLNESS_TIPS.map((_, i) => (
            <div key={i} className={`wc-dot-ind ${i === wellnessIdx ? "active" : ""}`} onClick={() => setWellnessIdx(i)} />
          ))}
        </div>
      </div>
      <div className="thought-card">
        <div className="tc-label">Pensamiento del día</div>
        <div className="tc-text">"{brief.closing}"</div>
        <div className="tc-dash" />
      </div>
      <div className="ai-sidebar-card">
        <div className="ai-label-row">
          <div className="live-dot" />
          Editorial del día
          <span className="ai-badge">IA + editor</span>
        </div>
        {aiLoading
          ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div className="spinner-sm" /><span style={{ fontSize: 12, color: "var(--muted)" }}>Preparando...</span></div>
          : <p className="ai-text">{aiText}</p>
        }
        {!aiLoading && <button className="ai-refresh" onClick={loadAI}>↻ Regenerar</button>}
      </div>
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────
  if (cargando) {
    return (
      <>
        <style>{css}</style>
        <div className="loading-screen">
          <div className="loading-logo">kind<span>.</span></div>
          <div className="loading-bar"><div className="loading-bar-fill" /></div>
          <div className="loading-msg">Cargando noticias del día...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>

      {/* ONBOARDING BANNER */}
      {showBanner && (
        <div className="onboarding-banner">
          <span className="ob-icon">✦</span>
          <div className="ob-text">
            <div className="ob-title">Personalizá tu Kind</div>
            <div className="ob-sub">Elegí tu región, temas favoritos y fuentes preferidas para un feed a tu medida.</div>
          </div>
          <div className="ob-actions">
            <button className="ob-btn-primary" onClick={() => { goSection("intereses"); handleDismissBanner(); }}>Personalizar</button>
            <button className="ob-btn-secondary" onClick={handleDismissBanner}>Ahora no</button>
          </div>
        </div>
      )}

      {/* OVERLAY */}
      <div className={`overlay ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />

      {/* DRAWER */}
      <div className={`drawer ${menuOpen ? "open" : ""}`}>
        <div className="drawer-head">
          <div className="drawer-logo">kind<span>.</span></div>
          <button className="drawer-x" onClick={() => setMenuOpen(false)}>✕</button>
        </div>
        <div className="drawer-lbl">Secciones</div>
        <div className="drawer-nav">
          {SECTIONS.map(s => (
            <button key={s.id} className={`dnav-btn ${section === s.id ? "active" : ""}`} onClick={() => goSection(s.id)}>
              <span className="dnav-icon">{s.icon}</span>
              <div className="dnav-info">
                <div className="dnav-label">{s.label}</div>
                <div className="dnav-desc">{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="drawer-div" />
        <div className="drawer-region">
          <div className="drawer-region-label">Tu región</div>
          <select
            value={prefs.region}
            onChange={e => {
              const nuevasPrefs = { ...prefs, region: e.target.value };
              setPrefs(nuevasPrefs);
              savePrefs(nuevasPrefs);
            }}
          >
            {REGIONES_DISPONIBLES.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>
        <div className="drawer-lbl">Hoy en Kind</div>
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.6, fontWeight: 300 }}>
            {today} · {visibleNews.length} noticias
            {backendOk && <span style={{ color: "var(--green)", fontWeight: 500 }}> · En vivo</span>}
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="nav">
        <button className={`nav-burger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(v => !v)}>
          <div className="hline" /><div className="hline" /><div className="hline" />
        </button>
        <div className="nav-logo" onClick={() => goSection("feed")}>kind<span>.</span></div>
        <div className="nav-sep" />
        <div className="nav-tagline">
          Informate bien · Hacé el mundo mejor
          {backendOk && <span className="live-badge"><span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />En vivo</span>}
        </div>
        <div className="nav-search">
          <span className="nav-search-icon">🔍</span>
          <input type="text" placeholder="Buscar en Google..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
        </div>
        <div className="nav-date">{today}</div>
      </nav>

      {/* CAT BAR */}
      {section === "feed" && (
        <div className="cat-bar">
          {CATEGORIES.map(cat => (
            <button key={cat.id} className={`cat-btn ${activeCategory === cat.id ? "active" : ""}`} onClick={() => setActiveCategory(cat.id)}>
              {cat.label}
            </button>
          ))}
        </div>
      )}

      <div className="page">
        <div className="layout">
          <div className="main">

            {/* ── FEED ── */}
            {section === "feed" && (
              <div>
                {featured && (activeCategory === "all" || activeCategory === featured.topic) && (
                  <div className="hero">
                    <div className="hero-eyebrow">
                      <div className="live-row"><div className="live-dot" />Más leído</div>
                      <div className={`topic-badge ${featured.tone}`}>{featured.topic}</div>
                    </div>
                    <div className="hero-grid">
                      <div>
                        <h1 className="hero-title">{featured.title}</h1>
                        <p className="hero-summary">{featured.summary}</p>
                        <div className="hero-foot">
                          <span className="hero-portal">{featured.portal}</span>
                          <span className="hero-time">Hace {featured.time} · {featured.read} min</span>
                          <button className="hero-link" onClick={() => handleOpenNews(featured.url, featured.topic)}>Leer nota ↗</button>
                        </div>
                      </div>
                      <div className="hero-img-wrap">
                        {featured.photo && <img src={featured.photo} alt={featured.title} />}
                      </div>
                    </div>
                  </div>
                )}

                <div className="sec-head">
                  <div className="sec-title">{activeCategory === "all" ? "Últimas noticias" : activeCategory}</div>
                  <div className="sec-right">
                    <span className="sec-count">{filtered.length} noticias</span>
                    {[["all","Todas"],["positive","✦ Positivas"],["hard","● Importantes"]].map(([val, label]) => (
                      <button key={val} className={`fchip ${toneFilter === val ? "active" : ""}`} onClick={() => setToneFilter(val)}>{label}</button>
                    ))}
                  </div>
                </div>

                <div className="news-grid">
                  {filtered.map((n, i) => (
                    <div key={n.id} className="ncard" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => handleOpenNews(n.url, n.topic)}>
                      <div className="ncard-img">
                        {n.photo && <img src={n.photo} alt={n.title} loading="lazy" onError={e => e.target.style.display = "none"} />}
                      </div>
                      <div className={`ncard-topic ${n.tone}`}>{n.topic}</div>
                      <div className="ncard-title">{n.title}</div>
                      <div className="ncard-foot">
                        <div className="ncard-meta"><b>{n.portal}</b><span>· {n.time}</span></div>
                        <span className="ncard-link">Leer ↗</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="load-wrap">
                  {loadingMore
                    ? <div className="loading-row"><div className="spinner-sm" />Cargando más...</div>
                    : extraPool.length > 0
                      ? <button className="load-btn" onClick={handleLoadMore}>Cargar más noticias ↓</button>
                      : <span style={{ fontSize: 12, color: "var(--muted)" }}>Ya viste todas las noticias del día</span>
                  }
                </div>
              </div>
            )}

            {/* ── BRIEF ── */}
            {section === "brief" && (
              <div>
                <div className="brief-hero-panel">
                  <div className="bh-label"><div className="live-dot" />Brief Matutino · {today}</div>
                  <div className="bh-title">"{brief.headline}"</div>
                  <div className="bh-intro">{brief.intro}</div>
                </div>
                <div className="brief-items">
                  {BRIEF_ITEMS_DEFAULT.map((item, i) => (
                    <div key={i} className="brief-item">
                      <div className={`bi-icon ${item.hard ? "hard" : "normal"}`}>{item.icon}</div>
                      <div>
                        <div className={`bi-tag ${item.hard ? "hard" : "normal"}`}>{item.tag}</div>
                        <div className="bi-text">{item.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="brief-closing">
                  <div className="bc-text">"{brief.closing}"</div>
                </div>
              </div>
            )}

            {/* ── INTERESES ── */}
            {section === "intereses" && (
              <div>
                <div className="intereses-intro">
                  <div className="int-title">Tus intereses</div>
                  <div className="int-sub">Elegí tu región, fuentes y temas favoritos. Kind los prioriza en tu feed sin dejar de mostrarte las noticias importantes del día.</div>
                  <div className="int-note">💡 Tus preferencias se guardan en este navegador. No necesitás crear una cuenta.</div>
                </div>

                {/* Región */}
                <div className="int-section-title">Tu región</div>
                <select
                  className="region-select-full"
                  value={prefsTemp.region}
                  onChange={e => setPrefsTemp(p => ({ ...p, region: e.target.value }))}
                >
                  {REGIONES_DISPONIBLES.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                </select>

                {/* Fuentes */}
                <div className="int-section-title">Fuentes preferidas</div>
                <div className="portals-grid">
                  {ALL_PORTALS.map(p => (
                    <div
                      key={p}
                      className={`portal-pill ${prefsTemp.portales.includes(p) ? "selected" : ""}`}
                      onClick={() => setPrefsTemp(prev => ({
                        ...prev,
                        portales: prev.portales.includes(p) ? prev.portales.filter(x => x !== p) : [...prev.portales, p]
                      }))}
                    >
                      <span className="portal-name">{p}</span>
                      <div className="portal-check">{prefsTemp.portales.includes(p) ? "✓" : ""}</div>
                    </div>
                  ))}
                </div>

                {/* Temas */}
                <div className="int-section-title">Temas de interés</div>
                <div className="topics-row">
                  {CATEGORIES.filter(c => c.id !== "all").map(t => (
                    <div
                      key={t.id}
                      className={`topic-tag ${prefsTemp.temas.includes(t.id) ? "selected" : ""}`}
                      onClick={() => setPrefsTemp(prev => ({
                        ...prev,
                        temas: prev.temas.includes(t.id) ? prev.temas.filter(x => x !== t.id) : [...prev.temas, t.id]
                      }))}
                    >{t.label}</div>
                  ))}
                </div>

                {/* Historial de lectura */}
                {historialTotal > 0 && (
                  <div className="history-card">
                    <div className="history-title">Lo que más leés</div>
                    <div className="history-bars">
                      {historialOrdenado.map(([topic, count]) => (
                        <div key={topic} className="history-bar-row">
                          <div className="history-bar-label">{topic}</div>
                          <div className="history-bar-track">
                            <div className="history-bar-fill" style={{ width: `${Math.round((count / historialTotal) * 100)}%` }} />
                          </div>
                          <div className="history-bar-count">{count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {prefsSaved
                  ? <div className="saved-badge">✓ Preferencias guardadas — tu feed ya las refleja</div>
                  : <button className="save-btn" onClick={handleSavePrefs}>Guardar preferencias ✦</button>
                }
              </div>
            )}

            {/* ── REDES ── */}
            {section === "redes" && (
              <div>
                <div className="redes-intro">Kind en las redes</div>
                <div className="redes-sub">La misma voz en todos lados: honesta, cercana, sin alarmismo ni optimismo de fantasía.</div>
                <div className="social-card">
                  <div className="sc-label"><div className="sc-dot" style={{ background: "#E1306C" }} />Instagram Story</div>
                  <div className="sc-preview" style={{ background: "linear-gradient(160deg, #2e1a1a 0%, #4a2d2d 100%)", minHeight: 180 }}>
                    <div className="sc-kind" style={{ color: "#E88E8E" }}>kind.</div>
                    <div className="sc-body" style={{ color: "white", fontSize: 17 }}>40.000 desplazados en Brasil por inundaciones. Es el tercer evento extremo del año.</div>
                    <div className="sc-tag" style={{ color: "rgba(255,255,255,0.45)" }}>kindnews.news</div>
                  </div>
                </div>
                <div className="social-card">
                  <div className="sc-label"><div className="sc-dot" style={{ background: "#1DA1F2" }} />Post en X</div>
                  <div className="x-preview">
                    <div className="x-head">
                      <div className="x-av">K</div>
                      <div><div className="x-name">Kind News</div><div className="x-handle">@kindnews</div></div>
                    </div>
                    <div className="x-body">España genera el 58% de su energía con renovables. Con tres años de anticipación. Mientras tanto, Brasil enfrenta su tercer evento climático extremo del año. Las dos cosas son reales. 🌍</div>
                    <div className="x-tag">#Kind #Ambiente #Clima</div>
                    <div className="x-acts">
                      <span className="x-act">💬 38</span><span className="x-act">🔁 240</span><span className="x-act">❤️ 1.8K</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── NOSOTROS ── */}
            {section === "nosotros" && (
              <div>
                <div className="nos-hero">
                  <div className="nh-label">Quiénes somos</div>
                  <div className="nh-title">Noticias <em>reales</em>,<br />sin el loop de angustia</div>
                  <div className="nh-sub">Kind no filtra las malas noticias. Cubre todo lo importante, pero sin el sensacionalismo que te deja agotado.</div>
                </div>
                <div className="nos-cards">
                  {[
                    { icon: "☀️", title: "Brief matutino honesto", text: "Cada mañana, lo más importante del día. Lo bueno y lo difícil, con contexto." },
                    { icon: "📰", title: "Feed con balance real", text: "70% noticias de tu región, 30% mundo. Siempre con contexto y sin dramatismo." },
                    { icon: "🎛️", title: "Feed personalizable", text: "Elegís tu región, temas y fuentes. Kind aprende de lo que leés sin necesidad de cuenta." },
                    { icon: "🤖", title: "IA con criterio editorial", text: "Usamos IA para sintetizar y contextualizar, con supervisión humana." },
                    { icon: "🌿", title: "Pausas de bienestar", text: "Recordatorios para que cuides tu cabeza y tu cuerpo mientras te informás." },
                  ].map((c, i) => (
                    <div key={i} className="nos-card">
                      <span className="nos-icon">{c.icon}</span>
                      <div><div className="nos-ctitle">{c.title}</div><div className="nos-ctext">{c.text}</div></div>
                    </div>
                  ))}
                </div>
                <div className="nos-manif">
                  <div className="nos-manif-title">"Informate bien.<br />Hacé el mundo mejor."</div>
                  <div className="nos-manif-sub">No creemos que ignorar los problemas ayude. Entenderlos bien, sin drama, es lo que permite actuar.</div>
                </div>
                <div className="nos-links">
                  <a className="nos-link" href="https://instagram.com/kindnews" target="_blank" rel="noopener noreferrer" style={{ background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)" }}>
                    <span style={{ fontSize: 18 }}>📸</span>
                    <div><div className="nos-link-name">Instagram</div><div className="nos-link-sub">@kindnews</div></div>
                  </a>
                  <a className="nos-link" href="https://x.com/kindnews" target="_blank" rel="noopener noreferrer" style={{ background: "#0a0a0a" }}>
                    <span style={{ fontSize: 18 }}>𝕏</span>
                    <div><div className="nos-link-name">X / Twitter</div><div className="nos-link-sub">@kindnews</div></div>
                  </a>
                </div>
              </div>
            )}
          </div>

          <Sidebar />
        </div>

        {/* MOB NAV */}
        <div className="mob-nav">
          <div className="mob-nav-inner">
            {[["feed","📰","Feed"],["brief","☀️","Brief"],["intereses","🎛️","Intereses"],["redes","📱","Redes"],["nosotros","✦","Kind"]].map(([id, icon, label]) => (
              <button key={id} className={`mob-btn ${section === id ? "active" : ""}`} onClick={() => goSection(id)}>
                <span className="mob-icon">{icon}</span>
                <span className="mob-label">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
