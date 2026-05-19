import { useState, useEffect, useCallback } from "react";

const BACKEND_URL   = "https://kind-backend-production-80b8.up.railway.app";
const LS_PREFS      = "kind_prefs_v3";
const LS_HISTORY    = "kind_history_v1";
const LS_ONBOARDING = "kind_onboarding_v2";

const REGIONES = [
  { id:"argentina", nombre:"Argentina",       flag:"🇦🇷" },
  { id:"mexico",    nombre:"México",           flag:"🇲🇽" },
  { id:"españa",    nombre:"España",           flag:"🇪🇸" },
  { id:"colombia",  nombre:"Colombia",         flag:"🇨🇴" },
  { id:"chile",     nombre:"Chile",            flag:"🇨🇱" },
  { id:"latam",     nombre:"América Latina",   flag:"🌎" },
  { id:"eeuu",      nombre:"EE.UU. (Español)", flag:"🇺🇸" },
  { id:"venezuela", nombre:"Venezuela",        flag:"🇻🇪" },
  { id:"peru",      nombre:"Perú",             flag:"🇵🇪" },
  { id:"uruguay",   nombre:"Uruguay",          flag:"🇺🇾" },
];

const ALL_TEMAS = [
  { id:"Mundo",      label:"Mundo",      icon:"🌍" },
  { id:"Política",   label:"Política",   icon:"🏛️" },
  { id:"Economía",   label:"Economía",   icon:"📈" },
  { id:"Tecnología", label:"Tecnología", icon:"💻" },
  { id:"Ciencia",    label:"Ciencia",    icon:"🔬" },
  { id:"Salud",      label:"Salud",      icon:"🏥" },
  { id:"Ambiente",   label:"Ambiente",   icon:"🌿" },
  { id:"Clima",      label:"Clima",      icon:"🌦️" },
  { id:"Cultura",    label:"Cultura",    icon:"🎭" },
  { id:"Deportes",   label:"Deportes",   icon:"⚽" },
  { id:"Sociedad",   label:"Sociedad",   icon:"🤝" },
  { id:"Educación",  label:"Educación",  icon:"📚" },
  { id:"Negocios",   label:"Negocios",   icon:"💼" },
  { id:"Arte",       label:"Arte",       icon:"🎨" },
];

const ALL_PORTALES = [
  "BBC Mundo","DW Español","El País","France 24","Reuters ES","NY Times ES",
  "Infobae","Clarín","La Nación","Perfil","Página 12","Ámbito","El Cronista","Télam",
  "El Universal","Milenio","El Financiero","Excélsior","La Jornada","Reforma",
  "El Mundo","La Vanguardia","El Confidencial","20 Minutos","ABC España","elDiario.es",
  "El Tiempo","El Espectador","Semana",
  "La Tercera","Bio Bio Chile","Emol",
  "Xataka","Nat Geo","El Economista",
];

const CATEGORIES = [
  { id:"all",        label:"Todo" },
  { id:"Mundo",      label:"Mundo" },
  { id:"Política",   label:"Política" },
  { id:"Economía",   label:"Economía" },
  { id:"Tecnología", label:"Tecnología" },
  { id:"Ciencia",    label:"Ciencia" },
  { id:"Salud",      label:"Salud" },
  { id:"Ambiente",   label:"Ambiente" },
  { id:"Cultura",    label:"Cultura" },
  { id:"Deportes",   label:"Deportes" },
];

const SECTIONS = [
  { id:"feed",      label:"Feed",          icon:"📰" },
  { id:"brief",     label:"Brief",         icon:"☀️" },
  { id:"intereses", label:"Mis intereses", icon:"🎛️" },
  { id:"redes",     label:"Redes",         icon:"📱" },
  { id:"nosotros",  label:"Nosotros",      icon:"✦" },
];

const WELLNESS_TIPS = [
  { icon:"💧", title:"Hidratación",     msg:"¿Tomaste agua en la última hora? Un vaso ahora hace la diferencia.",        color:"#EBF5FB" },
  { icon:"🚶", title:"Movilidad",       msg:"Levantate 2 minutos. Estirá el cuello y los hombros.",                      color:"#EBF5EF" },
  { icon:"🧘", title:"Respiración",     msg:"Inhala 4 segundos, sostén 4, exhala 4. Repetí 3 veces.",                   color:"#F3EBF5" },
  { icon:"🎵", title:"Música",          msg:"Una canción que te guste puede cambiar el humor en segundos.",              color:"#FDF5E8" },
  { icon:"👁️", title:"Descanso visual", msg:"Mirá algo lejano por 20 segundos. Tus ojos lo necesitan.",                color:"#F5EBEB" },
  { icon:"🌿", title:"Pausa",           msg:"Antes de seguir leyendo, ¿cómo estás? Tomá un momento.",                  color:"#EBF5EF" },
  { icon:"😊", title:"Gratitud",        msg:"Pensá en una cosa buena que pasó hoy, aunque sea pequeña.",               color:"#FBF8E8" },
  { icon:"🤸", title:"Estiramiento",    msg:"Rodá los hombros hacia atrás 5 veces. Tu espalda te lo agradece.",        color:"#EBF0F5" },
];

const BRIEF_VARIANTS = [
  { headline:"Lo que pasó hoy, sin filtros ni alarma",        intro:"Buenos días. Hubo cosas buenas y cosas difíciles. Acá te las contamos con contexto.", closing:"Estar informado no significa estar angustiado." },
  { headline:"El mundo no para. Tampoco vos.",                intro:"Arrancar el día con buena información es una decisión. Acá está lo más importante.", closing:"Saber lo que pasa no te obliga a cargarlo todo." },
  { headline:"Mucho ruido afuera. Acá, solo lo que importa.", intro:"Hoy elegimos lo relevante y te lo dejamos acá. Sin clickbait, sin catástrofe.",    closing:"El mundo es complejo. Lo simple es cómo te lo contamos." },
  { headline:"Noticias que merecen tu atención",              intro:"No todo lo que hace ruido importa. Este brief intenta equilibrar eso.",              closing:"Gracias por leer con calma." },
  { headline:"Un día más, un mundo entero",                   intro:"Mientras dormías pasaron cosas. Algunas buenas, algunas difíciles.",                 closing:"No hay forma de controlar todo. Sí hay formas de entender mejor." },
  { headline:"Sin dramatismo, sin ingenuidad",                intro:"El periodismo que te agota no es inevitable. Se puede informar bien.",               closing:"Curiosidad sin ansiedad. Eso es lo que Kind intenta ser." },
  { headline:"Lo importante de hoy, con todo el contexto",   intro:"Cada noticia tiene historia. Acá no te damos solo el titular.",                     closing:"Informarse bien lleva un poco más de tiempo. Vale la pena." },
];

const NEWS_FALLBACK = [
  { id:1, portal:"BBC Mundo",  topic:"Mundo",      title:"Inundaciones en Brasil dejan 40.000 desplazados", summary:"Es el tercer evento climático extremo en la región en lo que va del año.", tone:"hard",     time:"15 min", photo:"https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&h=360&fit=crop", read:4, url:"https://www.bbc.com/mundo", featured:true },
  { id:2, portal:"El País",    topic:"Economía",   title:"La inflación en América Latina cede por segundo trimestre", summary:"Los bancos centrales de la región mantienen las tasas altas.", tone:"positive", time:"1h",    photo:"https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=360&fit=crop", read:4, url:"https://elpais.com" },
  { id:3, portal:"Infobae",    topic:"Tecnología", title:"La IA que detecta enfermedades raras en minutos llega a hospitales", summary:"El sistema reduce de años a semanas el diagnóstico.", tone:"positive", time:"2h", photo:"https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=360&fit=crop", read:4, url:"https://www.infobae.com" },
  { id:4, portal:"La Nación",  topic:"Ciencia",    title:"Investigadores logran regenerar tejido cardíaco con células madre", summary:"Un ensayo histórico que podría cambiar el tratamiento del corazón.", tone:"positive", time:"3h", photo:"https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=360&fit=crop", read:5, url:"https://www.lanacion.com.ar" },
  { id:5, portal:"DW Español", topic:"Ambiente",   title:"España supera su meta de energía renovable tres años antes", summary:"Generó el 58% de su electricidad con fuentes limpias.", tone:"positive", time:"4h", photo:"https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=360&fit=crop", read:3, url:"https://dw.com/es" },
  { id:6, portal:"Clarín",     topic:"Sociedad",   title:"Crece el burnout docente: una crisis silenciosa en las escuelas", summary:"Sindicatos y especialistas alertan sobre el deterioro.", tone:"hard", time:"4h", photo:"https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=360&fit=crop", read:6, url:"https://www.clarin.com" },
];

const PREFS_DEFAULT = { region:"latam", temas:[], portales:[] };

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const loadPrefs   = () => { try { return { ...PREFS_DEFAULT, ...JSON.parse(localStorage.getItem(LS_PREFS)) }; } catch { return PREFS_DEFAULT; } };
const savePrefs   = (p) => localStorage.setItem(LS_PREFS, JSON.stringify(p));
const loadHistory = () => { try { return JSON.parse(localStorage.getItem(LS_HISTORY)) || {}; } catch { return {}; } };
const recordRead  = (topic) => { const h = loadHistory(); h[topic] = (h[topic]||0)+1; localStorage.setItem(LS_HISTORY, JSON.stringify(h)); };
const isOnboarded   = () => localStorage.getItem(LS_ONBOARDING) === "true";
const markOnboarded = () => localStorage.setItem(LS_ONBOARDING, "true");

async function detectarRegionPorIP() {
  try {
    const res  = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    const map  = { AR:"argentina", MX:"mexico", ES:"españa", CO:"colombia", CL:"chile", VE:"venezuela", PE:"peru", UY:"uruguay", US:"eeuu" };
    return map[data.country_code] || "latam";
  } catch { return "latam"; }
}

function weatherIcon(code) {
  if (code===0) return "☀️"; if (code<=2) return "🌤️"; if (code<=3) return "☁️";
  if (code<=49) return "🌫️"; if (code<=59) return "🌦️"; if (code<=69) return "🌧️";
  if (code<=79) return "❄️"; if (code<=84) return "🌨️"; if (code<=99) return "⛈️";
  return "🌡️";
}
function weatherDesc(code) {
  if (code===0) return "Despejado"; if (code<=2) return "Parcialmente nublado"; if (code<=3) return "Nublado";
  if (code<=49) return "Neblina";   if (code<=59) return "Llovizna";            if (code<=69) return "Lluvia";
  if (code<=79) return "Nieve";     if (code<=84) return "Aguanieve";           if (code<=99) return "Tormenta";
  return "Variable";
}
async function obtenerClima(lat, lon) {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&timezone=auto&forecast_days=2`);
    const d = await res.json();
    return {
      temp:    Math.round(d.current.temperature_2m),
      desc:    weatherDesc(d.current.weathercode),
      icon:    weatherIcon(d.current.weathercode),
      viento:  Math.round(d.current.windspeed_10m),
      humedad: d.current.relativehumidity_2m,
      hoy:    { max:Math.round(d.daily.temperature_2m_max[0]), min:Math.round(d.daily.temperature_2m_min[0]), lluvia:d.daily.precipitation_probability_max[0], icon:weatherIcon(d.daily.weathercode[0]) },
      manana: { max:Math.round(d.daily.temperature_2m_max[1]), min:Math.round(d.daily.temperature_2m_min[1]), lluvia:d.daily.precipitation_probability_max[1], icon:weatherIcon(d.daily.weathercode[1]) },
    };
  } catch { return null; }
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --ink:#111;--ink-2:#333;--ink-3:#666;--muted:#999;--faint:#ccc;
    --paper:#FAFAF8;--warm:#F5F2ED;--border:#E8E4DF;--border-light:#F0ECE7;
    --green:#1B5E3B;--green-light:#2D9659;--green-pale:#EBF5EF;
    --red:#7A1F1F;--red-pale:#FAEAEA;
    --nav-h:60px;--cat-h:42px;
  }
  html{scroll-behavior:smooth}
  body{background:var(--paper);font-family:'DM Sans',sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased}
  .nav{position:fixed;top:0;left:0;right:0;z-index:300;height:var(--nav-h);background:rgba(250,250,248,0.97);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 24px;gap:14px}
  .nav-burger{width:36px;height:36px;flex-shrink:0;background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;border-radius:8px;transition:background 0.2s;padding:0}
  .nav-burger:hover{background:var(--warm)}
  .hline{width:20px;height:1.5px;background:var(--ink);border-radius:2px;transition:all 0.25s ease;transform-origin:center}
  .nav-burger.open .hline:nth-child(1){transform:translateY(6.5px) rotate(45deg)}
  .nav-burger.open .hline:nth-child(2){opacity:0;transform:scaleX(0)}
  .nav-burger.open .hline:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}
  .nav-logo{font-family:'Lora',serif;font-size:22px;font-weight:700;color:var(--ink);letter-spacing:-0.02em;cursor:pointer;flex-shrink:0}
  .nav-logo span{color:var(--green)}
  .nav-sep{width:1px;height:18px;background:var(--border);flex-shrink:0}
  .nav-tagline{font-size:11px;color:var(--muted);flex-shrink:0;display:flex;align-items:center;gap:8px}
  .live-badge{display:inline-flex;align-items:center;gap:4px;background:var(--green-pale);color:var(--green);font-size:9.5px;font-weight:700;padding:2px 8px;border-radius:100px}
  .nav-search{flex:1;max-width:360px;margin:0 auto;position:relative}
  .nav-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--muted);pointer-events:none}
  .nav-search input{width:100%;height:34px;background:var(--warm);border:1px solid var(--border-light);border-radius:100px;padding:0 16px 0 36px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink);outline:none;transition:all 0.2s}
  .nav-search input:focus{background:white;border-color:var(--green);box-shadow:0 0 0 3px rgba(27,94,59,0.07)}
  .nav-search input::placeholder{color:var(--muted)}
  .nav-date{font-size:11px;color:var(--muted);flex-shrink:0;margin-left:auto}
  .cat-bar{position:fixed;top:var(--nav-h);left:0;right:0;z-index:290;height:var(--cat-h);background:rgba(250,250,248,0.97);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 24px;gap:2px;overflow-x:auto;scrollbar-width:none}
  .cat-bar::-webkit-scrollbar{display:none}
  .cat-btn{white-space:nowrap;padding:6px 14px;border-radius:100px;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:500;color:var(--ink-3);cursor:pointer;transition:all 0.15s;flex-shrink:0}
  .cat-btn:hover{background:var(--warm);color:var(--ink)}
  .cat-btn.active{background:var(--ink);color:white}
  .overlay{position:fixed;inset:0;z-index:250;background:rgba(0,0,0,0.18);backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:opacity 0.3s}
  .overlay.open{opacity:1;pointer-events:all}
  .drawer{position:fixed;top:0;left:0;bottom:0;z-index:260;width:280px;background:var(--paper);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;transform:translateX(-100%);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1)}
  .drawer.open{transform:translateX(0)}
  .drawer-head{padding:18px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
  .drawer-logo{font-family:'Lora',serif;font-size:20px;font-weight:700;color:var(--ink)}
  .drawer-logo span{color:var(--green)}
  .drawer-x{width:28px;height:28px;background:none;border:none;cursor:pointer;font-size:16px;color:var(--muted);border-radius:6px;transition:background 0.15s;display:flex;align-items:center;justify-content:center}
  .drawer-x:hover{background:var(--warm);color:var(--ink)}
  .drawer-lbl{padding:14px 20px 6px;font-size:9.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted)}
  .drawer-nav{padding:0 10px 4px}
  .dnav-btn{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:10px;border:none;background:transparent;font-family:'DM Sans',sans-serif;width:100%;text-align:left;cursor:pointer;transition:all 0.15s}
  .dnav-btn:hover{background:var(--warm)}
  .dnav-btn.active{background:var(--green)}
  .dnav-icon{font-size:17px;width:24px;text-align:center;flex-shrink:0}
  .dnav-label{font-size:14px;font-weight:600;color:var(--ink-2);line-height:1}
  .dnav-btn.active .dnav-label{color:white}
  .drawer-div{height:1px;background:var(--border);margin:8px 20px;flex-shrink:0}
  .drawer-info{padding:12px 20px 16px;font-size:12px;color:var(--ink-3);line-height:1.7;font-weight:300}
  /* MODAL */
  .modal-backdrop{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px}
  .modal{background:white;border-radius:20px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,0.25)}
  .modal-head{padding:28px 28px 0}
  .modal-logo{font-family:'Lora',serif;font-size:26px;font-weight:700;color:var(--ink);margin-bottom:4px}
  .modal-logo span{color:var(--green)}
  .modal-title{font-family:'Lora',serif;font-size:18px;font-weight:600;color:var(--ink);margin-bottom:6px}
  .modal-sub{font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:4px}
  .modal-body{padding:0 28px 8px}
  .modal-section{font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);margin:18px 0 10px}
  .modal-actions{display:flex;gap:10px;padding:16px 28px 28px}
  .modal-ok{flex:1;padding:14px;background:var(--green);color:white;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity 0.2s}
  .modal-ok:hover{opacity:0.88}
  .modal-skip{padding:14px 18px;background:transparent;color:var(--muted);border:1.5px solid var(--border);border-radius:12px;font-size:13px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif}
  .modal-skip:hover{border-color:var(--ink-3);color:var(--ink)}
  /* SELECTORES */
  .region-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}
  .region-pill{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1.5px solid var(--border);border-radius:10px;cursor:pointer;background:white;transition:all 0.15s;font-size:13px;font-weight:500;color:var(--ink-2)}
  .region-pill:hover{border-color:var(--green)}
  .region-pill.selected{border-color:var(--green);background:var(--green-pale);color:var(--green);font-weight:600}
  .region-flag{font-size:16px}
  .temas-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
  .tema-pill{display:flex;align-items:center;gap:6px;padding:8px 10px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;background:white;transition:all 0.15s;font-size:12px;font-weight:500;color:var(--ink-2)}
  .tema-pill.selected{border-color:var(--ink);background:var(--ink);color:white}
  .tema-pill:hover:not(.selected){border-color:var(--green)}
  .portales-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
  .portal-pill{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;background:white;transition:all 0.15s}
  .portal-pill.selected{border-color:var(--green);background:var(--green-pale)}
  .portal-name{font-size:11.5px;font-weight:500;color:var(--ink-2)}
  .portal-pill.selected .portal-name{color:var(--green)}
  .portal-check{width:15px;height:15px;border-radius:50%;border:1.5px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:8px;flex-shrink:0}
  .portal-pill.selected .portal-check{background:var(--green);border-color:var(--green);color:white}
  /* LAYOUT */
  .page{padding-top:calc(var(--nav-h) + var(--cat-h));min-height:100vh}
  .layout{max-width:1240px;margin:0 auto;padding:32px 24px 60px;display:grid;grid-template-columns:1fr 264px;gap:32px;align-items:start}
  /* SIDEBAR */
  .sidebar{position:sticky;top:calc(var(--nav-h) + var(--cat-h) + 24px);display:flex;flex-direction:column;gap:14px}
  /* CLIMA WIDGET */
  .clima-widget{background:linear-gradient(135deg,#0f2944,#1a4a7a);border-radius:14px;padding:18px;color:white}
  .cw-label{font-size:9px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:12px;display:flex;align-items:center;gap:6px}
  .cw-main{display:flex;align-items:center;gap:12px;margin-bottom:14px}
  .cw-icon{font-size:36px}
  .cw-temp{font-family:'Lora',serif;font-size:36px;font-weight:700;color:white;line-height:1}
  .cw-desc{font-size:12px;color:rgba(255,255,255,0.65);margin-top:3px}
  .cw-details{display:flex;gap:12px;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.1)}
  .cw-detail{font-size:11px;color:rgba(255,255,255,0.6)}
  .cw-forecast{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .cw-day{background:rgba(255,255,255,0.08);border-radius:8px;padding:10px;text-align:center}
  .cw-day-label{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:4px}
  .cw-day-icon{font-size:20px;margin-bottom:4px}
  .cw-day-temps{font-size:11px;color:rgba(255,255,255,0.8)}
  .cw-day-rain{font-size:10px;color:rgba(255,255,255,0.5);margin-top:2px}
  .cw-msg{font-size:11px;color:rgba(255,255,255,0.45);text-align:center;padding:10px 0}
  /* WELLNESS */
  .wellness-card{border-radius:14px;padding:18px;transition:background 0.6s ease;border:1px solid rgba(0,0,0,0.04)}
  .wc-label{font-size:9.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--green);margin-bottom:12px;display:flex;align-items:center;gap:6px}
  .wc-dot{width:5px;height:5px;border-radius:50%;background:var(--green);animation:pulse 2.5s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.6)}}
  .wc-icon{font-size:32px;margin-bottom:10px;display:block}
  .wc-title{font-family:'Lora',serif;font-size:16px;font-weight:600;color:var(--ink);margin-bottom:6px}
  .wc-msg{font-size:12.5px;font-weight:300;color:var(--ink-3);line-height:1.65;margin-bottom:12px}
  .wc-next{font-size:11px;font-weight:600;color:var(--green);cursor:pointer;background:none;border:none;font-family:'DM Sans',sans-serif;padding:0}
  .wc-next:hover{text-decoration:underline}
  .wc-dots{display:flex;gap:4px;margin-top:10px}
  .wc-dot-ind{width:5px;height:5px;border-radius:50%;background:var(--border);transition:background 0.3s;cursor:pointer}
  .wc-dot-ind.active{background:var(--green)}
  .thought-card{background:var(--ink);border-radius:14px;padding:18px}
  .tc-label{font-size:9.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.38);margin-bottom:10px}
  .tc-text{font-family:'Lora',serif;font-size:14px;font-style:italic;color:rgba(255,255,255,0.88);line-height:1.65}
  .tc-dash{margin-top:10px;width:24px;height:1.5px;background:rgba(255,255,255,0.2);border-radius:1px}
  .ai-sidebar-card{background:white;border:1px solid var(--border);border-radius:14px;padding:18px}
  .ai-label-row{display:flex;align-items:center;gap:7px;font-size:9.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
  .ai-badge{background:var(--green-pale);color:var(--green);font-size:9px;font-weight:700;padding:2px 7px;border-radius:100px}
  .ai-text{font-size:12.5px;font-weight:300;color:var(--ink-2);line-height:1.65}
  .ai-refresh{display:flex;align-items:center;gap:5px;margin-top:8px;cursor:pointer;font-size:11px;font-weight:500;color:var(--green);background:none;border:none;font-family:'DM Sans',sans-serif;padding:0}
  .spinner-sm{width:12px;height:12px;border:1.5px solid var(--border);border-top-color:var(--green);border-radius:50%;animation:spin 0.7s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  /* HERO */
  .hero{margin-bottom:28px}
  .hero-eyebrow{display:flex;align-items:center;gap:10px;margin-bottom:14px}
  .live-row{display:flex;align-items:center;gap:6px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--green)}
  .live-dot{width:6px;height:6px;border-radius:50%;background:var(--green);animation:pulse 2s ease-in-out infinite}
  .topic-badge{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;padding:3px 10px;border-radius:100px;border:1px solid}
  .topic-badge.hard{color:var(--red);border-color:var(--red);background:var(--red-pale)}
  .topic-badge.positive{color:var(--green);border-color:var(--green);background:var(--green-pale)}
  .hero-grid{display:grid;grid-template-columns:1fr 280px;gap:28px;align-items:center;padding-bottom:24px;border-bottom:2px solid var(--ink)}
  .hero-title{font-family:'Lora',serif;font-size:32px;font-weight:700;color:var(--ink);line-height:1.22;letter-spacing:-0.02em;margin-bottom:14px}
  .hero-summary{font-size:15px;font-weight:300;color:var(--ink-3);line-height:1.72;margin-bottom:18px}
  .hero-foot{display:flex;align-items:center;gap:12px}
  .hero-portal{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.08em}
  .hero-time{font-size:11px;color:var(--faint)}
  .hero-link{display:inline-flex;align-items:center;gap:5px;margin-left:auto;background:var(--ink);color:white;font-size:12px;font-weight:600;padding:7px 16px;border-radius:100px;border:none;cursor:pointer;transition:opacity 0.2s}
  .hero-link:hover{opacity:0.82}
  .hero-img-wrap{border-radius:10px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)}
  .hero-img-wrap img{width:100%;height:200px;object-fit:cover;display:block}
  .sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid var(--border);flex-wrap:wrap;gap:8px}
  .sec-title{font-family:'Lora',serif;font-size:17px;font-weight:700;color:var(--ink)}
  .sec-right{display:flex;align-items:center;gap:7px}
  .sec-count{font-size:11px;color:var(--muted);letter-spacing:0.06em}
  .fchip{padding:5px 12px;border-radius:100px;border:1px solid var(--border);background:transparent;font-family:'DM Sans',sans-serif;font-size:11.5px;font-weight:500;color:var(--muted);cursor:pointer;transition:all 0.15s;white-space:nowrap}
  .fchip.active{background:var(--ink);border-color:var(--ink);color:white}
  .fchip:not(.active):hover{border-color:var(--green);color:var(--green)}
  .news-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);border:1px solid var(--border);border-radius:12px;overflow:hidden}
  .ncard{background:var(--paper);padding:16px;display:flex;flex-direction:column;gap:9px;cursor:pointer;transition:background 0.18s;animation:fadeUp 0.4s ease forwards;opacity:0}
  .ncard:hover{background:white}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .ncard-img{width:100%;height:130px;border-radius:7px;overflow:hidden;flex-shrink:0;background:var(--warm)}
  .ncard-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.4s}
  .ncard:hover .ncard-img img{transform:scale(1.04)}
  .ncard-topic{font-size:9.5px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase}
  .ncard-topic.hard{color:var(--red)}
  .ncard-topic.positive{color:var(--green)}
  .ncard-title{font-family:'Lora',serif;font-size:14px;font-weight:600;color:var(--ink);line-height:1.4;flex:1}
  .ncard-foot{display:flex;align-items:center;justify-content:space-between;padding-top:8px;border-top:1px solid var(--border-light);margin-top:auto}
  .ncard-meta{font-size:10px;color:var(--muted);display:flex;gap:4px}
  .ncard-meta b{font-weight:600;text-transform:uppercase;letter-spacing:0.05em}
  .ncard-link{font-size:10.5px;font-weight:600;color:var(--green);padding:3px 9px;border-radius:100px;background:var(--green-pale);transition:background 0.15s;white-space:nowrap}
  .ncard-link:hover{background:#d4eddc}
  .load-wrap{text-align:center;padding:24px 0 0}
  .load-btn{padding:10px 28px;border-radius:100px;border:1px solid var(--border);background:white;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:var(--ink-3);cursor:pointer;transition:all 0.18s}
  .load-btn:hover{border-color:var(--green);color:var(--green)}
  .loading-row{display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;color:var(--muted)}
  .loading-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:16px}
  .loading-logo{font-family:'Lora',serif;font-size:36px;font-weight:700;color:var(--ink)}
  .loading-logo span{color:var(--green)}
  .loading-bar{width:120px;height:2px;background:var(--border);border-radius:2px;overflow:hidden}
  .loading-bar-fill{height:100%;background:var(--green);border-radius:2px;animation:loadBar 1.5s ease-in-out infinite}
  @keyframes loadBar{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
  .loading-msg{font-size:13px;color:var(--muted)}
  /* INTERESES */
  .int-header{background:white;border:1px solid var(--border);border-radius:14px;padding:20px;margin-bottom:4px}
  .int-title{font-family:'Lora',serif;font-size:20px;font-weight:700;color:var(--ink);margin-bottom:8px}
  .int-sub{font-size:13px;font-weight:300;color:var(--ink-3);line-height:1.6}
  .int-section{font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);margin:18px 0 10px}
  .int-actions{display:flex;gap:10px;margin-top:24px}
  .int-ok{flex:1;padding:14px;background:var(--green);color:white;border:none;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity 0.2s}
  .int-ok:hover{opacity:0.88}
  .int-cancel{padding:14px 20px;background:transparent;color:var(--muted);border:1.5px solid var(--border);border-radius:12px;font-size:14px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.15s;white-space:nowrap}
  .int-cancel:hover{border-color:var(--ink-3);color:var(--ink)}
  .int-saved{font-size:12px;color:var(--green);font-weight:500;margin-top:10px}
  /* BRIEF */
  .brief-hero-panel{background:var(--ink);border-radius:14px;padding:28px;margin-bottom:20px;position:relative;overflow:hidden}
  .brief-hero-panel::before{content:'';position:absolute;top:-40px;right:-40px;width:180px;height:180px;background:radial-gradient(circle,rgba(27,94,59,0.4) 0%,transparent 65%);border-radius:50%;pointer-events:none}
  .bh-label{font-size:9.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:10px;display:flex;align-items:center;gap:7px}
  .bh-title{font-family:'Lora',serif;font-size:22px;font-weight:600;color:white;font-style:italic;line-height:1.35;margin-bottom:10px}
  .bh-intro{font-size:13.5px;font-weight:300;color:rgba(255,255,255,0.6);line-height:1.65}
  .brief-items{background:white;border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:16px}
  .brief-item{display:flex;gap:14px;padding:16px 20px;border-bottom:1px solid var(--border-light);align-items:flex-start;cursor:pointer}
  .brief-item:last-child{border-bottom:none}
  .brief-item:hover{background:var(--warm)}
  .bi-icon{width:40px;height:40px;flex-shrink:0;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px}
  .bi-icon.normal{background:var(--warm)}
  .bi-icon.hard{background:var(--red-pale)}
  .bi-tag{font-size:9.5px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:4px}
  .bi-tag.normal{color:var(--green)}
  .bi-tag.hard{color:var(--red)}
  .bi-text{font-family:'Lora',serif;font-size:13.5px;color:var(--ink-2);line-height:1.6}
  .brief-closing{background:var(--green-pale);border-radius:12px;padding:16px 18px;border-left:3px solid var(--green)}
  .bc-text{font-family:'Lora',serif;font-size:14px;font-style:italic;color:var(--green);line-height:1.6}
  /* REDES */
  .redes-intro{font-family:'Lora',serif;font-size:20px;font-weight:700;color:var(--ink);margin-bottom:6px}
  .redes-sub{font-size:13px;font-weight:300;color:var(--muted);line-height:1.6;margin-bottom:20px}
  .social-card{border-radius:14px;overflow:hidden;margin-bottom:14px;box-shadow:0 2px 16px rgba(0,0,0,0.07)}
  .sc-label{padding:8px 16px;background:var(--warm);font-size:10.5px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;gap:7px}
  .sc-dot{width:8px;height:8px;border-radius:50%}
  .sc-preview{padding:24px;min-height:160px;display:flex;flex-direction:column;justify-content:flex-end;position:relative}
  .sc-kind{font-family:'Lora',serif;font-size:12px;font-weight:700;position:absolute;top:18px;left:22px;opacity:0.65}
  .sc-body{font-family:'Lora',serif;font-size:16px;font-weight:600;line-height:1.45;margin-bottom:10px}
  .sc-tag{font-size:11px;opacity:0.5}
  .x-preview{padding:18px 20px;background:#0a0a0a}
  .x-head{display:flex;align-items:center;gap:10px;margin-bottom:10px}
  .x-av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--green),#C97D2A);display:flex;align-items:center;justify-content:center;font-family:'Lora',serif;font-size:13px;font-weight:700;color:white}
  .x-name{font-size:13px;font-weight:600;color:white}
  .x-handle{font-size:11px;color:#666}
  .x-body{font-size:14px;color:rgba(255,255,255,0.9);line-height:1.55;margin-bottom:10px}
  .x-tag{font-size:12px;color:#4A9EE8}
  .x-acts{display:flex;gap:16px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.07)}
  .x-act{font-size:11px;color:#666}
  /* NOSOTROS */
  .nos-hero{background:var(--ink);border-radius:14px;padding:28px;margin-bottom:20px;position:relative;overflow:hidden}
  .nos-hero::before{content:'';position:absolute;bottom:-30px;right:-30px;width:160px;height:160px;background:radial-gradient(circle,rgba(27,94,59,0.45) 0%,transparent 65%);border-radius:50%;pointer-events:none}
  .nh-label{font-size:9.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.38);margin-bottom:10px}
  .nh-title{font-family:'Lora',serif;font-size:26px;font-weight:700;color:white;line-height:1.25;margin-bottom:12px}
  .nh-title em{color:#52B788;font-style:normal}
  .nh-sub{font-size:13.5px;font-weight:300;color:rgba(255,255,255,0.55);line-height:1.65}
  .nos-cards{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}
  .nos-card{background:white;border:1px solid var(--border);border-radius:12px;padding:18px;display:flex;gap:14px;align-items:flex-start}
  .nos-icon{font-size:22px;flex-shrink:0}
  .nos-ctitle{font-family:'Lora',serif;font-size:15px;font-weight:600;color:var(--ink);margin-bottom:5px}
  .nos-ctext{font-size:12.5px;font-weight:300;color:var(--ink-3);line-height:1.6}
  .nos-manif{background:var(--green);border-radius:12px;padding:22px;text-align:center;margin-bottom:16px}
  .nos-manif-title{font-family:'Lora',serif;font-size:20px;font-weight:700;color:white;font-style:italic;margin-bottom:8px;line-height:1.3}
  .nos-manif-sub{font-size:12.5px;font-weight:300;color:rgba(255,255,255,0.65);line-height:1.6}
  .nos-links{display:flex;gap:10px}
  .nos-link{flex:1;padding:14px;border-radius:12px;display:flex;align-items:center;gap:10px;text-decoration:none;transition:opacity 0.2s}
  .nos-link:hover{opacity:0.85}
  .nos-link-name{font-size:13px;font-weight:600;color:white}
  .nos-link-sub{font-size:10.5px;color:rgba(255,255,255,0.45)}
  /* MOB NAV */
  .mob-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:200;background:rgba(250,250,248,0.97);backdrop-filter:blur(20px);border-top:1px solid var(--border);padding:8px 8px 18px}
  .mob-nav-inner{display:flex}
  .mob-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;padding:7px 4px;border:none;background:transparent;cursor:pointer;font-family:'DM Sans',sans-serif;border-radius:8px;transition:background 0.15s}
  .mob-btn:hover,.mob-btn.active{background:var(--warm)}
  .mob-icon{font-size:17px}
  .mob-label{font-size:9px;font-weight:500;color:var(--muted)}
  .mob-btn.active .mob-label{color:var(--green);font-weight:600}
  @media(max-width:1000px){
    .layout{grid-template-columns:1fr}.sidebar{display:none}
    .hero-grid{grid-template-columns:1fr;gap:16px}.hero-img-wrap{display:none}
    .mob-nav{display:block}.page{padding-bottom:80px}
    .news-grid{grid-template-columns:1fr}
    .region-grid,.temas-grid{grid-template-columns:1fr 1fr}
    .portales-grid{grid-template-columns:1fr 1fr}
  }
  @media(max-width:640px){
    .layout{padding:20px 16px 60px}.nav{padding:0 16px;gap:10px}
    .nav-tagline,.nav-sep,.nav-date{display:none}
    .cat-bar{padding:0 16px}.hero-title{font-size:24px}
    .nos-links{flex-direction:column}
    .modal{border-radius:16px}.modal-head{padding:20px 20px 0}
    .modal-body{padding:0 20px 8px}.modal-actions{padding:16px 20px 20px}
    .temas-grid{grid-template-columns:1fr 1fr}
  }
`;

// ─── COMPONENTE ───────────────────────────────────────────────────────────────
export default function Kind() {
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [section,         setSection]         = useState("feed");
  const [activeCategory,  setActiveCategory]  = useState("all");
  const [toneFilter,      setToneFilter]      = useState("all");
  const [wellnessIdx,     setWellnessIdx]     = useState(0);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [cargando,        setCargando]        = useState(true);
  const [visibleNews,     setVisibleNews]     = useState(NEWS_FALLBACK);
  const [extraPool,       setExtraPool]       = useState([]);
  const [loadingMore,     setLoadingMore]     = useState(false);
  const [backendOk,       setBackendOk]       = useState(false);
  const [briefData,       setBriefData]       = useState(null);
  const [aiText,          setAiText]          = useState("");
  const [aiLoading,       setAiLoading]       = useState(false);
  const [prefs,           setPrefs]           = useState(loadPrefs);
  const [prefsTemp,       setPrefsTemp]       = useState(loadPrefs);
  const [saved,           setSaved]           = useState(false);
  const [showOnboarding,  setShowOnboarding]  = useState(false);
  const [clima,           setClima]           = useState(null);
  const [climaLoading,    setClimaLoading]    = useState(true);
  const [climaError,      setClimaError]      = useState(false);
  const [history,         setHistory]         = useState(loadHistory);

  const brief = briefData || BRIEF_VARIANTS[new Date().getDay()];
  const today = new Date().toLocaleDateString("es-AR", { weekday:"long", day:"numeric", month:"long" });
  const tip   = WELLNESS_TIPS[wellnessIdx];

  // Onboarding
  useEffect(() => {
    if (!isOnboarded()) setTimeout(() => setShowOnboarding(true), 800);
  }, []);

  // Detección de región por IP
  useEffect(() => {
    const detectar = async () => {
      const p = loadPrefs();
      if (p.region !== "latam" || isOnboarded()) return;
      const region = await detectarRegionPorIP();
      if (region !== "latam") {
        const np = { ...p, region };
        setPrefs(np); setPrefsTemp(np); savePrefs(np);
      }
    };
    detectar();
  }, []);

  // Clima por GPS
  useEffect(() => {
    if (!navigator.geolocation) { setClimaError(true); setClimaLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const data = await obtenerClima(pos.coords.latitude, pos.coords.longitude);
        setClima(data); setClimaError(!data); setClimaLoading(false);
      },
      () => { setClimaError(true); setClimaLoading(false); },
      { timeout: 8000 }
    );
  }, []);

  // Fetch backend
  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const region = loadPrefs().region || "latam";
        const res    = await fetch(`${BACKEND_URL}/api/todo?region=${region}`);
        const data   = await res.json();
        if (data.noticias?.length > 0) {
          const h = loadHistory();
          const total = Object.values(h).reduce((a,b)=>a+b,0);
          const sorted = [...data.noticias.map((n,i)=>({...n,featured:i===0}))].sort((a,b)=>
            total > 0 ? ((h[b.topic]||0)/total) - ((h[a.topic]||0)/total) : 0
          );
          setVisibleNews(sorted); setBackendOk(true);
        }
        if (data.brief)     setBriefData(data.brief);
        if (data.editorial) setAiText(data.editorial);
      } catch (err) { console.warn("Backend no disponible:", err.message); }
      setCargando(false);
    };
    cargar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.region]);

  // Wellness
  useEffect(() => {
    const t = setInterval(() => setWellnessIdx(i => (i+1)%WELLNESS_TIPS.length), 20000);
    return () => clearInterval(t);
  }, []);

  const loadAI = useCallback(async () => {
    if (backendOk && aiText) return;
    setAiLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/editorial`);
      const d   = await res.json();
      if (d.editorial) setAiText(d.editorial);
    } catch {}
    setAiLoading(false);
  }, [backendOk, aiText]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!cargando && !aiText) loadAI(); }, [cargando]);

  const handleSearch = (e) => {
    if (e.key==="Enter" && searchQuery.trim())
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
  };

  const handleLoadMore = () => {
    if (!extraPool.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleNews(p => [...p, ...extraPool.slice(0,3)]);
      setExtraPool(p => p.slice(3));
      setLoadingMore(false);
    }, 700);
  };

  function handleOpenNews(url, topic) {
    recordRead(topic); setHistory(loadHistory()); window.open(url, "_blank");
  }

  const handleSavePrefs = () => {
    setPrefs(prefsTemp); savePrefs(prefsTemp); markOnboarded();
    setShowOnboarding(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  const handleCancelPrefs = () => setPrefsTemp(prefs);
  const handleOnboardingSave = () => { setPrefs(prefsTemp); savePrefs(prefsTemp); markOnboarded(); setShowOnboarding(false); };

  const goSection = (id) => { setSection(id); setMenuOpen(false); };

  const featured = visibleNews.find(n => n.featured);
  const filtered = visibleNews.filter(n => {
    const catOk    = activeCategory==="all" || n.topic===activeCategory;
    const toneOk   = toneFilter==="all"     || n.tone===toneFilter;
    const portalOk = prefs.portales.length===0 || prefs.portales.includes(n.portal);
    const temaOk   = prefs.temas.length===0   || prefs.temas.includes(n.topic);
    return catOk && toneOk && !n.featured && portalOk && temaOk;
  });
  const historialTotal    = Object.values(history).reduce((a,b)=>a+b,0);
  const historialOrdenado = Object.entries(history).sort((a,b)=>b[1]-a[1]).slice(0,6);

  // Sub-componentes
  const ClimaWidget = () => (
    <div className="clima-widget">
      <div className="cw-label"><span>📍</span>Clima actual · GPS</div>
      {climaLoading ? (
        <div className="cw-msg">Obteniendo ubicación...</div>
      ) : climaError ? (
        <div className="cw-msg">Activá la ubicación para ver el clima</div>
      ) : clima ? (
        <>
          <div className="cw-main">
            <span className="cw-icon">{clima.icon}</span>
            <div><div className="cw-temp">{clima.temp}°</div><div className="cw-desc">{clima.desc}</div></div>
          </div>
          <div className="cw-details">
            <span className="cw-detail">💨 {clima.viento} km/h</span>
            <span className="cw-detail">💧 {clima.humedad}%</span>
          </div>
          <div className="cw-forecast">
            <div className="cw-day">
              <div className="cw-day-label">Hoy</div>
              <div className="cw-day-icon">{clima.hoy.icon}</div>
              <div className="cw-day-temps">{clima.hoy.max}° / {clima.hoy.min}°</div>
              <div className="cw-day-rain">🌧 {clima.hoy.lluvia}%</div>
            </div>
            <div className="cw-day">
              <div className="cw-day-label">Mañana</div>
              <div className="cw-day-icon">{clima.manana.icon}</div>
              <div className="cw-day-temps">{clima.manana.max}° / {clima.manana.min}°</div>
              <div className="cw-day-rain">🌧 {clima.manana.lluvia}%</div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );

  const PrefsForm = () => (
    <>
      <div style={{marginBottom:4}}>
        <div className="int-section" style={{marginTop:0}}>Tu región principal</div>
        <div className="region-grid">
          {REGIONES.map(r => (
            <div key={r.id} className={`region-pill ${prefsTemp.region===r.id?"selected":""}`}
              onClick={() => setPrefsTemp(p=>({...p,region:r.id}))}>
              <span className="region-flag">{r.flag}</span>{r.nombre}
            </div>
          ))}
        </div>
        <div className="int-section">Temas de interés</div>
        <div className="temas-grid">
          {ALL_TEMAS.map(t => (
            <div key={t.id} className={`tema-pill ${prefsTemp.temas.includes(t.id)?"selected":""}`}
              onClick={() => setPrefsTemp(p=>({...p,temas:p.temas.includes(t.id)?p.temas.filter(x=>x!==t.id):[...p.temas,t.id]}))}>
              <span>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>
        <div className="int-section">Fuentes preferidas <span style={{fontWeight:300,textTransform:"none",letterSpacing:0}}>(opcional)</span></div>
        <div className="portales-grid">
          {ALL_PORTALES.map(p => (
            <div key={p} className={`portal-pill ${prefsTemp.portales.includes(p)?"selected":""}`}
              onClick={() => setPrefsTemp(prev=>({...prev,portales:prev.portales.includes(p)?prev.portales.filter(x=>x!==p):[...prev.portales,p]}))}>
              <span className="portal-name">{p}</span>
              <div className="portal-check">{prefsTemp.portales.includes(p)?"✓":""}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const Sidebar = () => (
    <div className="sidebar">
      <ClimaWidget />
      <div className="wellness-card" style={{background:tip.color}}>
        <div className="wc-label"><div className="wc-dot"/>Pausa Kind</div>
        <span className="wc-icon">{tip.icon}</span>
        <div className="wc-title">{tip.title}</div>
        <div className="wc-msg">{tip.msg}</div>
        <button className="wc-next" onClick={()=>setWellnessIdx(i=>(i+1)%WELLNESS_TIPS.length)}>Siguiente tip →</button>
        <div className="wc-dots">
          {WELLNESS_TIPS.map((_,i)=><div key={i} className={`wc-dot-ind ${i===wellnessIdx?"active":""}`} onClick={()=>setWellnessIdx(i)}/>)}
        </div>
      </div>
      <div className="thought-card">
        <div className="tc-label">Pensamiento del día</div>
        <div className="tc-text">"{brief.closing}"</div>
        <div className="tc-dash"/>
      </div>
      <div className="ai-sidebar-card">
        <div className="ai-label-row"><div className="live-dot"/>Editorial del día<span className="ai-badge">IA + editor</span></div>
        {aiLoading
          ? <div style={{display:"flex",alignItems:"center",gap:8}}><div className="spinner-sm"/><span style={{fontSize:12,color:"var(--muted)"}}>Preparando...</span></div>
          : <p className="ai-text">{aiText}</p>}
        {!aiLoading && <button className="ai-refresh" onClick={loadAI}>↻ Regenerar</button>}
      </div>
    </div>
  );

  if (cargando) return (
    <><style>{css}</style>
    <div className="loading-screen">
      <div className="loading-logo">kind<span>.</span></div>
      <div className="loading-bar"><div className="loading-bar-fill"/></div>
      <div className="loading-msg">Cargando noticias del día...</div>
    </div></>
  );

  return (
    <><style>{css}</style>

    {/* MODAL ONBOARDING */}
    {showOnboarding && (
      <div className="modal-backdrop">
        <div className="modal">
          <div className="modal-head">
            <div className="modal-logo">kind<span>.</span></div>
            <div className="modal-title">Bienvenido/a a Kind</div>
            <div className="modal-sub">Configurá tus preferencias para un feed a tu medida. Podés editarlo cuando quieras desde el menú ☰.</div>
          </div>
          <div className="modal-body"><PrefsForm /></div>
          <div className="modal-actions">
            <button className="modal-skip" onClick={()=>{markOnboarded();setShowOnboarding(false);}}>Ahora no</button>
            <button className="modal-ok" onClick={handleOnboardingSave}>Guardar y empezar ✦</button>
          </div>
        </div>
      </div>
    )}

    <div className={`overlay ${menuOpen?"open":""}`} onClick={()=>setMenuOpen(false)}/>

    {/* DRAWER */}
    <div className={`drawer ${menuOpen?"open":""}`}>
      <div className="drawer-head">
        <div className="drawer-logo">kind<span>.</span></div>
        <button className="drawer-x" onClick={()=>setMenuOpen(false)}>✕</button>
      </div>
      <div className="drawer-lbl">Secciones</div>
      <div className="drawer-nav">
        {SECTIONS.map(s=>(
          <button key={s.id} className={`dnav-btn ${section===s.id?"active":""}`} onClick={()=>goSection(s.id)}>
            <span className="dnav-icon">{s.icon}</span>
            <div className="dnav-label">{s.label}</div>
          </button>
        ))}
      </div>
      <div className="drawer-div"/>
      <div className="drawer-info">
        {today}<br/>
        {visibleNews.length} noticias · {REGIONES.find(r=>r.id===prefs.region)?.flag} {REGIONES.find(r=>r.id===prefs.region)?.nombre}
        {backendOk && <span style={{color:"var(--green)",fontWeight:500}}> · En vivo</span>}
      </div>
    </div>

    {/* NAV */}
    <nav className="nav">
      <button className={`nav-burger ${menuOpen?"open":""}`} onClick={()=>setMenuOpen(v=>!v)}>
        <div className="hline"/><div className="hline"/><div className="hline"/>
      </button>
      <div className="nav-logo" onClick={()=>goSection("feed")}>kind<span>.</span></div>
      <div className="nav-sep"/>
      <div className="nav-tagline">
        Informate bien · Hacé el mundo mejor
        {backendOk && <span className="live-badge"><span style={{width:5,height:5,borderRadius:"50%",background:"var(--green)",display:"inline-block"}}/>En vivo</span>}
      </div>
      <div className="nav-search">
        <span className="nav-search-icon">🔍</span>
        <input type="text" placeholder="Buscar en Google..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onKeyDown={handleSearch}/>
      </div>
      <div className="nav-date">{today}</div>
    </nav>

    {section==="feed" && (
      <div className="cat-bar">
        {CATEGORIES.map(cat=>(
          <button key={cat.id} className={`cat-btn ${activeCategory===cat.id?"active":""}`} onClick={()=>setActiveCategory(cat.id)}>{cat.label}</button>
        ))}
      </div>
    )}

    <div className="page">
      <div className="layout">
        <div className="main">

          {/* FEED */}
          {section==="feed" && (
            <div>
              {featured && (activeCategory==="all"||activeCategory===featured.topic) && (
                <div className="hero">
                  <div className="hero-eyebrow">
                    <div className="live-row"><div className="live-dot"/>Más leído</div>
                    <div className={`topic-badge ${featured.tone}`}>{featured.topic}</div>
                  </div>
                  <div className="hero-grid">
                    <div>
                      <h1 className="hero-title">{featured.title}</h1>
                      <p className="hero-summary">{featured.summary}</p>
                      <div className="hero-foot">
                        <span className="hero-portal">{featured.portal}</span>
                        <span className="hero-time">Hace {featured.time} · {featured.read} min</span>
                        <button className="hero-link" onClick={()=>handleOpenNews(featured.url,featured.topic)}>Leer nota ↗</button>
                      </div>
                    </div>
                    <div className="hero-img-wrap">
                      {featured.photo && <img src={featured.photo} alt={featured.title}/>}
                    </div>
                  </div>
                </div>
              )}
              <div className="sec-head">
                <div className="sec-title">{activeCategory==="all"?"Últimas noticias":activeCategory}</div>
                <div className="sec-right">
                  <span className="sec-count">{filtered.length} noticias</span>
                  {[["all","Todas"],["positive","✦ Positivas"],["hard","● Importantes"]].map(([val,label])=>(
                    <button key={val} className={`fchip ${toneFilter===val?"active":""}`} onClick={()=>setToneFilter(val)}>{label}</button>
                  ))}
                </div>
              </div>
              <div className="news-grid">
                {filtered.map((n,i)=>(
                  <div key={n.id} className="ncard" style={{animationDelay:`${i*0.05}s`}} onClick={()=>handleOpenNews(n.url,n.topic)}>
                    <div className="ncard-img">
                      {n.photo && <img src={n.photo} alt={n.title} loading="lazy" onError={e=>e.target.style.display="none"}/>}
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
                  ? <div className="loading-row"><div className="spinner-sm"/>Cargando más...</div>
                  : extraPool.length>0
                    ? <button className="load-btn" onClick={handleLoadMore}>Cargar más noticias ↓</button>
                    : <span style={{fontSize:12,color:"var(--muted)"}}>Ya viste todas las noticias del día</span>}
              </div>
            </div>
          )}

          {/* BRIEF */}
          {section==="brief" && (
            <div>
              <div className="brief-hero-panel">
                <div className="bh-label"><div className="live-dot"/>Brief Matutino · {today}</div>
                <div className="bh-title">"{brief.headline}"</div>
                <div className="bh-intro">{brief.intro}</div>
              </div>
              <div className="brief-items">
                {visibleNews.slice(0,5).map((n,i)=>(
                  <div key={i} className="brief-item" onClick={()=>handleOpenNews(n.url,n.topic)}>
                    <div className={`bi-icon ${n.tone==="hard"?"hard":"normal"}`}>
                      {ALL_TEMAS.find(t=>t.id===n.topic)?.icon||"📰"}
                    </div>
                    <div>
                      <div className={`bi-tag ${n.tone==="hard"?"hard":"normal"}`}>{n.topic} · {n.portal}</div>
                      <div className="bi-text">{n.title}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="brief-closing"><div className="bc-text">"{brief.closing}"</div></div>
            </div>
          )}

          {/* INTERESES */}
          {section==="intereses" && (
            <div>
              <div className="int-header">
                <div className="int-title">Mis intereses</div>
                <div className="int-sub">Configurá tu región, temas y fuentes. Kind prioriza tu selección sin dejar de mostrarte lo importante del día.</div>
              </div>
              <PrefsForm />
              <div className="int-actions">
                <button className="int-cancel" onClick={handleCancelPrefs}>Cancelar</button>
                <button className="int-ok" onClick={handleSavePrefs}>Guardar preferencias ✦</button>
              </div>
              {saved && <div className="int-saved">✓ Preferencias guardadas</div>}
              {historialTotal>0 && (
                <div style={{background:"white",border:"1px solid var(--border)",borderRadius:14,padding:18,marginTop:20}}>
                  <div style={{fontFamily:"'Lora',serif",fontSize:16,fontWeight:600,color:"var(--ink)",marginBottom:12}}>Lo que más leés</div>
                  {historialOrdenado.map(([topic,count])=>(
                    <div key={topic} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{fontSize:12,fontWeight:500,color:"var(--ink-2)",width:80,flexShrink:0}}>{topic}</div>
                      <div style={{flex:1,height:6,background:"var(--border)",borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",background:"var(--green)",borderRadius:3,width:`${Math.round((count/historialTotal)*100)}%`,transition:"width 0.5s"}}/>
                      </div>
                      <div style={{fontSize:11,color:"var(--muted)",width:20,textAlign:"right"}}>{count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* REDES */}
          {section==="redes" && (
            <div>
              <div className="redes-intro">Kind en las redes</div>
              <div className="redes-sub">La misma voz en todos lados: honesta, cercana, sin alarmismo.</div>
              <div className="social-card">
                <div className="sc-label"><div className="sc-dot" style={{background:"#E1306C"}}/>Instagram Story</div>
                <div className="sc-preview" style={{background:"linear-gradient(160deg,#2e1a1a,#4a2d2d)",minHeight:180}}>
                  <div className="sc-kind" style={{color:"#E88E8E"}}>kind.</div>
                  <div className="sc-body" style={{color:"white",fontSize:17}}>{visibleNews[0]?.title||"Las noticias del día, sin alarma."}</div>
                  <div className="sc-tag" style={{color:"rgba(255,255,255,0.45)"}}>kindnews.news</div>
                </div>
              </div>
              <div className="social-card">
                <div className="sc-label"><div className="sc-dot" style={{background:"#1DA1F2"}}/>Post en X</div>
                <div className="x-preview">
                  <div className="x-head">
                    <div className="x-av">K</div>
                    <div><div className="x-name">Kind News</div><div className="x-handle">@kindnews</div></div>
                  </div>
                  <div className="x-body">{visibleNews[1]?.title||"Informate bien. Hacé el mundo mejor."} 🌍</div>
                  <div className="x-tag">#Kind #Noticias</div>
                  <div className="x-acts"><span className="x-act">💬 38</span><span className="x-act">🔁 240</span><span className="x-act">❤️ 1.8K</span></div>
                </div>
              </div>
            </div>
          )}

          {/* NOSOTROS */}
          {section==="nosotros" && (
            <div>
              <div className="nos-hero">
                <div className="nh-label">Quiénes somos</div>
                <div className="nh-title">Noticias <em>reales</em>,<br/>sin el loop de angustia</div>
                <div className="nh-sub">Kind no filtra las malas noticias. Cubre todo lo importante, sin el sensacionalismo que te deja agotado.</div>
              </div>
              <div className="nos-cards">
                {[
                  {icon:"☀️",title:"Brief matutino honesto",text:"Cada mañana, lo más importante del día. Lo bueno y lo difícil, con contexto."},
                  {icon:"📰",title:"Feed con balance real",text:"70% noticias de tu región, 30% mundo. Sin dramatismo."},
                  {icon:"🎛️",title:"Feed personalizable",text:"Elegís tu región, temas y fuentes. Configurás al entrar y editás cuando quieras desde el menú."},
                  {icon:"🌦️",title:"Clima en tiempo real",text:"Tu pronóstico del día con GPS, directamente en la barra lateral."},
                  {icon:"🤖",title:"IA con criterio editorial",text:"Usamos IA para sintetizar y contextualizar, con supervisión humana."},
                  {icon:"🌿",title:"Pausas de bienestar",text:"Recordatorios para que cuides tu cabeza y tu cuerpo mientras te informás."},
                ].map((c,i)=>(
                  <div key={i} className="nos-card">
                    <span className="nos-icon">{c.icon}</span>
                    <div><div className="nos-ctitle">{c.title}</div><div className="nos-ctext">{c.text}</div></div>
                  </div>
                ))}
              </div>
              <div className="nos-manif">
                <div className="nos-manif-title">"Informate bien.<br/>Hacé el mundo mejor."</div>
                <div className="nos-manif-sub">Entender los problemas bien, sin drama, es lo que permite actuar.</div>
              </div>
              <div className="nos-links">
                <a className="nos-link" href="https://instagram.com/kindnews" target="_blank" rel="noopener noreferrer" style={{background:"linear-gradient(135deg,#833AB4,#E1306C,#F77737)"}}>
                  <span style={{fontSize:18}}>📸</span>
                  <div><div className="nos-link-name">Instagram</div><div className="nos-link-sub">@kindnews</div></div>
                </a>
                <a className="nos-link" href="https://x.com/kindnews" target="_blank" rel="noopener noreferrer" style={{background:"#0a0a0a"}}>
                  <span style={{fontSize:18}}>𝕏</span>
                  <div><div className="nos-link-name">X / Twitter</div><div className="nos-link-sub">@kindnews</div></div>
                </a>
              </div>
            </div>
          )}
        </div>
        <Sidebar/>
      </div>

      {/* MOB NAV */}
      <div className="mob-nav">
        <div className="mob-nav-inner">
          {[["feed","📰","Feed"],["brief","☀️","Brief"],["intereses","🎛️","Intereses"],["redes","📱","Redes"],["nosotros","✦","Kind"]].map(([id,icon,label])=>(
            <button key={id} className={`mob-btn ${section===id?"active":""}`} onClick={()=>goSection(id)}>
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
