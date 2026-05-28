import { useState, useEffect } from "react";

const BACKEND = "https://kind-backend-production-80b8.up.railway.app";

// ─── CLIMA ────────────────────────────────────────────────────────────────────
function weatherIcon(c) {
  if (c===0) return "☀️"; if (c<=2) return "🌤️"; if (c<=3) return "☁️";
  if (c<=49) return "🌫️"; if (c<=59) return "🌦️"; if (c<=69) return "🌧️";
  if (c<=79) return "❄️"; if (c<=99) return "⛈️"; return "🌡️";
}
function weatherDesc(c) {
  if (c===0) return "Despejado"; if (c<=2) return "Parcial nublado"; if (c<=3) return "Nublado";
  if (c<=49) return "Neblina"; if (c<=59) return "Llovizna"; if (c<=69) return "Lluvia";
  if (c<=79) return "Nieve"; if (c<=99) return "Tormenta"; return "Variable";
}
async function obtenerClima(lat, lon) {
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&timezone=auto&forecast_days=2`);
    const d = await r.json();
    return {
      temp: Math.round(d.current.temperature_2m),
      icon: weatherIcon(d.current.weathercode),
      desc: weatherDesc(d.current.weathercode),
      viento: Math.round(d.current.windspeed_10m),
      hoy:    { max: Math.round(d.daily.temperature_2m_max[0]), min: Math.round(d.daily.temperature_2m_min[0]), lluvia: d.daily.precipitation_probability_max[0], icon: weatherIcon(d.daily.weathercode[0]) },
      manana: { max: Math.round(d.daily.temperature_2m_max[1]), min: Math.round(d.daily.temperature_2m_min[1]), lluvia: d.daily.precipitation_probability_max[1], icon: weatherIcon(d.daily.weathercode[1]) },
    };
  } catch { return null; }
}

const SECCIONES = [
  { id: "todo",    label: "Todo",    icon: "✦" },
  { id: "Salud",   label: "Salud",   icon: "🏥" },
  { id: "Ciencia", label: "Ciencia", icon: "🔬" },
  { id: "Hábitos", label: "Hábitos", icon: "🌿" },
  { id: "Mente",   label: "Mente",   icon: "🧠" },
];

const WELLNESS_TIPS = [
  { icon: "💧", title: "Hidratación",     msg: "¿Tomaste agua en la última hora? Tu cerebro funciona mejor cuando está bien hidratado.", color: "#EBF8F2" },
  { icon: "🫁", title: "Respiración",     msg: "Inhala 4 segundos, sostén 4, exhala 6. Tres veces. Es la forma más rápida de calmar el sistema nervioso.", color: "#F0F4FF" },
  { icon: "🚶", title: "Movimiento",      msg: "Levantate y caminá 2 minutos. El movimiento después de estar sentado mejora la circulación y el foco.", color: "#FFF8F0" },
  { icon: "👁️", title: "Ojos",           msg: "Mirá algo a más de 6 metros durante 20 segundos. Tus ojos trabajan todo el día — dales una pausa.", color: "#F5F0FF" },
  { icon: "🤸", title: "Estiramiento",    msg: "Rodá los hombros hacia atrás 5 veces lentamente. La tensión acumulada en el cuello afecta la concentración.", color: "#FFF0F0" },
  { icon: "😮‍💨", title: "Pausa",          msg: "Antes de seguir, ¿cómo estás? Un momento de conciencia plena tiene más valor que horas de distracción.", color: "#F0FFF8" },
];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#FAFAF7;--white:#FFFFFF;--warm:#F5F2EC;--warm2:#EDE9E0;
    --ink:#1A1A1A;--ink2:#3D3D3D;--ink3:#6B6B6B;--muted:#9B9B9B;--faint:#D4D0C8;
    --border:#E8E4DC;--border-light:#F0EDE6;
    --sage:#2D6A4F;--sage-light:#40916C;--sage-pale:#D8F3DC;
    --teal:#1B4F72;--teal-pale:#D6EAF8;
    --amber:#7D4E00;--amber-pale:#FEF3E2;
    --lavender:#4A235A;--lavender-pale:#F5EEF8;
    --red-pale:#FDEDEC;
    --nav-h:64px;--bar-h:46px;
  }
  html{scroll-behavior:smooth}
  body{background:var(--bg);font-family:'DM Sans',sans-serif;color:var(--ink);-webkit-font-smoothing:antialiased}
  button{font-family:'DM Sans',sans-serif;cursor:pointer}

  /* NAV */
  .nav{position:fixed;top:0;left:0;right:0;z-index:300;height:var(--nav-h);background:rgba(250,250,247,0.96);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 28px;gap:16px}
  .nav-burger{width:38px;height:38px;flex-shrink:0;background:none;border:none;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;border-radius:10px;transition:background 0.2s}
  .nav-burger:hover{background:var(--warm)}
  .hline{width:20px;height:1.5px;background:var(--ink);border-radius:2px;transition:all 0.25s;transform-origin:center}
  .nav-burger.open .hline:nth-child(1){transform:translateY(6.5px) rotate(45deg)}
  .nav-burger.open .hline:nth-child(2){opacity:0;transform:scaleX(0)}
  .nav-burger.open .hline:nth-child(3){transform:translateY(-6.5px) rotate(-45deg)}
  .nav-logo{font-family:'Lora',serif;font-size:24px;font-weight:700;color:var(--ink);letter-spacing:-0.02em;cursor:pointer;flex-shrink:0}
  .nav-logo span{color:var(--sage)}
  .nav-tagline{font-size:12px;color:var(--muted);flex-shrink:0;padding-left:16px;border-left:1px solid var(--border)}
  .nav-right{margin-left:auto;display:flex;align-items:center;gap:10px}
  .nav-date{font-size:11px;color:var(--muted)}
  .nav-search{position:relative}
  .nav-search input{height:34px;background:var(--warm);border:1px solid var(--border-light);border-radius:100px;padding:0 16px 0 36px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--ink);outline:none;width:220px;transition:all 0.2s}
  .nav-search input:focus{background:white;border-color:var(--sage);width:280px}
  .nav-search input::placeholder{color:var(--muted)}
  .nav-search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:13px;color:var(--muted);pointer-events:none}

  /* BARRA DE SECCIONES */
  .secbar{position:fixed;top:var(--nav-h);left:0;right:0;z-index:290;height:var(--bar-h);background:rgba(250,250,247,0.96);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 28px;gap:4px;overflow-x:auto;scrollbar-width:none}
  .secbar::-webkit-scrollbar{display:none}
  .sec-btn{white-space:nowrap;padding:7px 16px;border-radius:100px;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:var(--ink3);cursor:pointer;transition:all 0.15s;flex-shrink:0;display:flex;align-items:center;gap:5px}
  .sec-btn:hover{background:var(--warm);color:var(--ink)}
  .sec-btn.active{background:var(--sage);color:white}

  /* DRAWER */
  .overlay{position:fixed;inset:0;z-index:250;background:rgba(0,0,0,0.2);backdrop-filter:blur(3px);opacity:0;pointer-events:none;transition:opacity 0.3s}
  .overlay.open{opacity:1;pointer-events:all}
  .drawer{position:fixed;top:0;left:0;bottom:0;z-index:260;width:290px;background:var(--white);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;transform:translateX(-100%);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1)}
  .drawer.open{transform:translateX(0)}
  .drawer-head{padding:20px 22px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
  .drawer-logo{font-family:'Lora',serif;font-size:22px;font-weight:700;color:var(--ink)}
  .drawer-logo span{color:var(--sage)}
  .drawer-x{width:30px;height:30px;background:none;border:none;cursor:pointer;font-size:16px;color:var(--muted);border-radius:8px;display:flex;align-items:center;justify-content:center}
  .drawer-x:hover{background:var(--warm);color:var(--ink)}
  .drawer-section{padding:16px 22px 6px;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted)}
  .drawer-item{display:flex;align-items:center;gap:12px;padding:12px 14px;margin:0 8px;border-radius:10px;border:none;background:transparent;font-family:'DM Sans',sans-serif;width:calc(100% - 16px);text-align:left;cursor:pointer;transition:all 0.15s;font-size:14px;color:var(--ink2)}
  .drawer-item:hover{background:var(--warm)}
  .drawer-item.active{background:var(--sage-pale);color:var(--sage);font-weight:600}
  .drawer-icon{font-size:18px;width:26px;text-align:center}
  .drawer-div{height:1px;background:var(--border);margin:8px 22px}

  /* LAYOUT */
  .page{padding-top:calc(var(--nav-h) + var(--bar-h));min-height:100vh}
  .container{max-width:1280px;margin:0 auto;padding:36px 28px 80px;display:grid;grid-template-columns:1fr 288px;gap:36px;align-items:start}

  /* SIDEBAR */
  .sidebar{position:sticky;top:calc(var(--nav-h) + var(--bar-h) + 24px);display:flex;flex-direction:column;gap:16px}

  /* CLIMA */
  .clima-card{background:linear-gradient(145deg,#0B3D2E,#1B6B4A);border-radius:18px;padding:20px;color:white;overflow:hidden;position:relative}
  .clima-card::before{content:'';position:absolute;top:-30px;right:-30px;width:120px;height:120px;background:radial-gradient(circle,rgba(255,255,255,0.08),transparent 70%);border-radius:50%}
  .clima-label{font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:14px;display:flex;align-items:center;gap:6px}
  .clima-main{display:flex;align-items:center;gap:14px;margin-bottom:14px}
  .clima-icon{font-size:40px}
  .clima-temp{font-family:'Lora',serif;font-size:42px;font-weight:700;color:white;line-height:1}
  .clima-desc{font-size:12px;color:rgba(255,255,255,0.65);margin-top:3px}
  .clima-detail{font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:14px}
  .clima-forecast{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .clima-day{background:rgba(255,255,255,0.1);border-radius:10px;padding:10px;text-align:center}
  .clima-day-label{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.45);margin-bottom:4px}
  .clima-day-icon{font-size:22px;margin-bottom:4px}
  .clima-day-temp{font-size:12px;color:rgba(255,255,255,0.85);font-weight:500}
  .clima-day-rain{font-size:10px;color:rgba(255,255,255,0.45);margin-top:2px}
  .clima-msg{font-size:11px;color:rgba(255,255,255,0.4);padding:8px 0;text-align:center}

  /* REFLEXIÓN */
  .reflexion-card{background:var(--ink);border-radius:18px;padding:22px;position:relative;overflow:hidden}
  .reflexion-card::before{content:'';position:absolute;bottom:-20px;right:-20px;width:100px;height:100px;background:radial-gradient(circle,rgba(45,106,79,0.5),transparent 70%);border-radius:50%}
  .ref-label{font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:12px;display:flex;align-items:center;gap:6px}
  .ref-dot{width:5px;height:5px;border-radius:50%;background:var(--sage-light);animation:pulse 2.5s ease-in-out infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.6)}}
  .ref-texto{font-family:'Lora',serif;font-size:15px;font-style:italic;color:rgba(255,255,255,0.9);line-height:1.7}
  .ref-estilo{font-size:10px;color:rgba(255,255,255,0.25);margin-top:10px;text-transform:capitalize}

  /* PAUSA KIND */
  .pausa-card{border-radius:18px;padding:20px;border:1px solid rgba(0,0,0,0.05);transition:background 0.8s ease}
  .pausa-label{font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:var(--sage);margin-bottom:14px;display:flex;align-items:center;gap:6px}
  .pausa-icon{font-size:34px;margin-bottom:10px;display:block}
  .pausa-title{font-family:'Lora',serif;font-size:17px;font-weight:600;color:var(--ink);margin-bottom:8px}
  .pausa-msg{font-size:13px;font-weight:300;color:var(--ink3);line-height:1.7;margin-bottom:12px}
  .pausa-next{font-size:11px;font-weight:600;color:var(--sage);background:none;border:none;cursor:pointer;padding:0}
  .pausa-next:hover{text-decoration:underline}
  .pausa-dots{display:flex;gap:4px;margin-top:10px}
  .pausa-dot{width:5px;height:5px;border-radius:50%;background:var(--faint);cursor:pointer;transition:background 0.3s}
  .pausa-dot.active{background:var(--sage)}

  /* NOTA DESTACADA */
  .destacada{margin-bottom:36px}
  .dest-label{display:flex;align-items:center;gap:8px;margin-bottom:16px}
  .dest-badge{font-size:9.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:var(--sage);display:flex;align-items:center;gap:5px}
  .dest-live{width:6px;height:6px;border-radius:50%;background:var(--sage);animation:pulse 2s ease-in-out infinite}
  .dest-card{background:white;border-radius:20px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.07);cursor:pointer;transition:transform 0.2s,box-shadow 0.2s}
  .dest-card:hover{transform:translateY(-2px);box-shadow:0 8px 40px rgba(0,0,0,0.1)}
  .dest-img{width:100%;height:300px;object-fit:cover;display:block}
  .dest-img-placeholder{width:100%;height:300px;background:linear-gradient(135deg,var(--sage-pale),var(--teal-pale));display:flex;align-items:center;justify-content:center;font-size:64px}
  .dest-body{padding:24px}
  .dest-sec{display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:4px 12px;border-radius:100px;margin-bottom:12px}
  .dest-sec.Salud{background:var(--sage-pale);color:var(--sage)}
  .dest-sec.Ciencia{background:var(--teal-pale);color:var(--teal)}
  .dest-sec.Hábitos{background:var(--amber-pale);color:var(--amber)}
  .dest-sec.Mente{background:var(--lavender-pale);color:var(--lavender)}
  .dest-titulo{font-family:'Lora',serif;font-size:26px;font-weight:700;color:var(--ink);line-height:1.25;margin-bottom:12px;letter-spacing:-0.01em}
  .dest-resumen{font-size:15px;font-weight:300;color:var(--ink3);line-height:1.75;margin-bottom:16px}
  .dest-foot{display:flex;align-items:center;justify-content:space-between}
  .dest-meta{font-size:11px;color:var(--muted);display:flex;gap:8px;align-items:center}
  .dest-portal{font-weight:600;text-transform:uppercase;letter-spacing:0.06em}
  .dest-leer{display:inline-flex;align-items:center;gap:6px;background:var(--sage);color:white;font-size:12px;font-weight:600;padding:8px 18px;border-radius:100px;border:none;transition:opacity 0.2s}
  .dest-leer:hover{opacity:0.85}

  /* GRID DE NOTAS */
  .grid-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;padding-bottom:12px;border-bottom:1px solid var(--border)}
  .grid-title{font-family:'Lora',serif;font-size:18px;font-weight:700;color:var(--ink)}
  .grid-count{font-size:11px;color:var(--muted)}
  .notas-grid{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);border:1px solid var(--border);border-radius:16px;overflow:hidden}
  .nota-card{background:var(--bg);padding:18px;cursor:pointer;transition:background 0.18s;animation:fadeUp 0.4s ease forwards;opacity:0}
  .nota-card:hover{background:white}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .nc-img{width:100%;height:140px;border-radius:10px;overflow:hidden;margin-bottom:12px;background:var(--warm)}
  .nc-img img{width:100%;height:100%;object-fit:cover;display:block;transition:transform 0.4s}
  .nota-card:hover .nc-img img{transform:scale(1.04)}
  .nc-sec{display:inline-flex;align-items:center;gap:4px;font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:3px 9px;border-radius:100px;margin-bottom:8px}
  .nc-sec.Salud{background:var(--sage-pale);color:var(--sage)}
  .nc-sec.Ciencia{background:var(--teal-pale);color:var(--teal)}
  .nc-sec.Hábitos{background:var(--amber-pale);color:var(--amber)}
  .nc-sec.Mente{background:var(--lavender-pale);color:var(--lavender)}
  .nc-ia{background:#FFF0F8;color:#8B1A5A}
  .nc-titulo{font-family:'Lora',serif;font-size:14.5px;font-weight:600;color:var(--ink);line-height:1.4;margin-bottom:8px;flex:1}
  .nc-foot{display:flex;align-items:center;justify-content:space-between;padding-top:10px;border-top:1px solid var(--border-light);margin-top:auto}
  .nc-meta{font-size:10px;color:var(--muted)}
  .nc-portal{font-weight:600;text-transform:uppercase;letter-spacing:0.05em;font-size:9.5px}
  .nc-leer{font-size:10.5px;font-weight:600;color:var(--sage);padding:3px 10px;border-radius:100px;background:var(--sage-pale)}

  /* NOTA IA EXPANDIDA */
  .nota-ia-card{background:white;border:1px solid var(--border);border-radius:16px;padding:22px;margin-bottom:12px;cursor:pointer;transition:box-shadow 0.2s}
  .nota-ia-card:hover{box-shadow:0 4px 20px rgba(0,0,0,0.06)}
  .ia-badge{display:inline-flex;align-items:center;gap:5px;font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;background:#FFF0F8;color:#8B1A5A;padding:3px 9px;border-radius:100px;margin-bottom:10px}
  .ia-titulo{font-family:'Lora',serif;font-size:18px;font-weight:700;color:var(--ink);line-height:1.35;margin-bottom:10px}
  .ia-contenido{font-size:14px;font-weight:300;color:var(--ink2);line-height:1.8;white-space:pre-line}
  .ia-contenido.truncated{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
  .ia-leer-mas{font-size:12px;font-weight:600;color:var(--sage);background:none;border:none;margin-top:8px;padding:0}

  /* LOADING */
  .loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:20px}
  .loading-logo{font-family:'Lora',serif;font-size:42px;font-weight:700;color:var(--ink)}
  .loading-logo span{color:var(--sage)}
  .loading-sub{font-size:13px;color:var(--muted)}
  .loading-bar{width:140px;height:2px;background:var(--border);border-radius:2px;overflow:hidden}
  .loading-fill{height:100%;background:var(--sage);border-radius:2px;animation:loadBar 1.8s ease-in-out infinite}
  @keyframes loadBar{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}

  /* MOB NAV */
  .mob-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:200;background:rgba(250,250,247,0.97);backdrop-filter:blur(20px);border-top:1px solid var(--border);padding:8px 0 20px}
  .mob-nav-inner{display:flex}
  .mob-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 4px;border:none;background:transparent;font-family:'DM Sans',sans-serif;border-radius:10px;transition:background 0.15s;cursor:pointer}
  .mob-btn:hover,.mob-btn.active{background:var(--warm)}
  .mob-icon{font-size:18px}
  .mob-label{font-size:9px;font-weight:500;color:var(--muted)}
  .mob-btn.active .mob-label{color:var(--sage);font-weight:600}

  /* NOSOTROS */
  .nos-hero{background:var(--ink);border-radius:20px;padding:32px;margin-bottom:20px;position:relative;overflow:hidden}
  .nos-hero::before{content:'';position:absolute;bottom:-40px;right:-40px;width:200px;height:200px;background:radial-gradient(circle,rgba(45,106,79,0.4),transparent 65%);border-radius:50%}
  .nos-hl{font-size:9.5px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:12px}
  .nos-titulo{font-family:'Lora',serif;font-size:28px;font-weight:700;color:white;line-height:1.25;margin-bottom:14px}
  .nos-titulo em{color:var(--sage-light);font-style:normal}
  .nos-sub{font-size:14px;font-weight:300;color:rgba(255,255,255,0.55);line-height:1.7}
  .nos-cards{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}
  .nos-card{background:white;border:1px solid var(--border);border-radius:14px;padding:18px;display:flex;gap:14px}
  .nos-card-icon{font-size:24px;flex-shrink:0}
  .nos-card-title{font-family:'Lora',serif;font-size:15px;font-weight:600;color:var(--ink);margin-bottom:5px}
  .nos-card-text{font-size:13px;font-weight:300;color:var(--ink3);line-height:1.65}
  .nos-manif{background:var(--sage);border-radius:14px;padding:22px;text-align:center}
  .nos-manif-title{font-family:'Lora',serif;font-size:20px;font-weight:700;color:white;font-style:italic;line-height:1.35}

  @media(max-width:1024px){
    .container{grid-template-columns:1fr}.sidebar{display:none}
    .mob-nav{display:block}.page{padding-bottom:90px}
    .notas-grid{grid-template-columns:1fr}
    .dest-titulo{font-size:22px}
  }
  @media(max-width:640px){
    .container{padding:24px 16px 80px}
    .nav{padding:0 16px;gap:10px}
    .nav-tagline,.nav-search{display:none}
    .secbar{padding:0 16px}
    .dest-titulo{font-size:19px}
    .dest-img{height:200px}
    .dest-img-placeholder{height:200px}
  }
`;

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function KindBienestar() {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [seccion,     setSeccion]     = useState("todo");
  const [vista,       setVista]       = useState("feed"); // feed | nosotros
  const [cargando,    setCargando]    = useState(true);
  const [pausaIdx,    setPausaIdx]    = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [notaExpandida, setNotaExpandida] = useState(null);

  const [notaDestacada, setNotaDestacada] = useState(null);
  const [notas,         setNotas]         = useState([]);
  const [notasIA,       setNotasIA]       = useState([]);
  const [reflexion,     setReflexion]     = useState(null);
  const [clima,         setClima]         = useState(null);
  const [climaLoading,  setClimaLoading]  = useState(true);

  const today = new Date().toLocaleDateString("es", { weekday:"long", day:"numeric", month:"long" });
  const pausa = WELLNESS_TIPS[pausaIdx];

  // Fetch backend
  useEffect(() => {
    const cargar = async () => {
      setCargando(true);
      try {
        const res  = await fetch(`${BACKEND}/api/todo`);
        const data = await res.json();
        setNotaDestacada(data.notaDestacada);
        setNotas(data.notas || []);
        setNotasIA(data.notasIA || []);
        setReflexion(data.reflexion);
      } catch (err) { console.warn("Backend no disponible:", err.message); }
      setCargando(false);
    };
    cargar();
  }, []);

  // Clima GPS
  useEffect(() => {
    if (!navigator.geolocation) { setClimaLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const data = await obtenerClima(pos.coords.latitude, pos.coords.longitude);
        setClima(data); setClimaLoading(false);
      },
      () => setClimaLoading(false),
      { timeout: 8000 }
    );
  }, []);

  // Pausa rotation
  useEffect(() => {
    const t = setInterval(() => setPausaIdx(i => (i+1) % WELLNESS_TIPS.length), 25000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim())
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery + " bienestar salud")}`, "_blank");
  };

  function abrirNota(nota) {
    if (nota.tipo === "ia") { setNotaExpandida(notaExpandida?.id === nota.id ? null : nota); return; }
    window.open(nota.url, "_blank");
  }

  function goSeccion(id) { setSeccion(id); setVista("feed"); setMenuOpen(false); }

  const notasFiltradas = notas.filter(n => seccion === "todo" || n.seccion === seccion);
  const notasIAFiltradas = notasIA.filter(n => seccion === "todo" || n.seccion === seccion);

  function secColor(sec) {
    if (sec === "Salud")   return "var(--sage)";
    if (sec === "Ciencia") return "var(--teal)";
    if (sec === "Hábitos") return "var(--amber)";
    if (sec === "Mente")   return "var(--lavender)";
    return "var(--sage)";
  }

  // ── SIDEBAR ────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div className="sidebar">
      {/* Clima */}
      <div className="clima-card">
        <div className="clima-label"><span>📍</span>Clima · tu ubicación</div>
        {climaLoading ? <div className="clima-msg">Detectando ubicación...</div>
        : !clima ? <div className="clima-msg">Activá la ubicación para ver el clima</div>
        : <>
          <div className="clima-main">
            <span className="clima-icon">{clima.icon}</span>
            <div>
              <div className="clima-temp">{clima.temp}°</div>
              <div className="clima-desc">{clima.desc}</div>
            </div>
          </div>
          <div className="clima-detail">💨 {clima.viento} km/h</div>
          <div className="clima-forecast">
            <div className="clima-day">
              <div className="clima-day-label">Hoy</div>
              <div className="clima-day-icon">{clima.hoy.icon}</div>
              <div className="clima-day-temp">{clima.hoy.max}° / {clima.hoy.min}°</div>
              <div className="clima-day-rain">🌧 {clima.hoy.lluvia}%</div>
            </div>
            <div className="clima-day">
              <div className="clima-day-label">Mañana</div>
              <div className="clima-day-icon">{clima.manana.icon}</div>
              <div className="clima-day-temp">{clima.manana.max}° / {clima.manana.min}°</div>
              <div className="clima-day-rain">🌧 {clima.manana.lluvia}%</div>
            </div>
          </div>
        </>}
      </div>

      {/* Reflexión */}
      {reflexion && (
        <div className="reflexion-card">
          <div className="ref-label"><div className="ref-dot"/>Reflexión del día</div>
          <div className="ref-texto">"{reflexion.texto}"</div>
          {reflexion.estilo && <div className="ref-estilo">{reflexion.estilo}</div>}
        </div>
      )}

      {/* Pausa Kind */}
      <div className="pausa-card" style={{ background: pausa.color }}>
        <div className="pausa-label"><div className="ref-dot"/>Pausa Kind</div>
        <span className="pausa-icon">{pausa.icon}</span>
        <div className="pausa-title">{pausa.title}</div>
        <div className="pausa-msg">{pausa.msg}</div>
        <button className="pausa-next" onClick={() => setPausaIdx(i => (i+1)%WELLNESS_TIPS.length)}>Siguiente →</button>
        <div className="pausa-dots">
          {WELLNESS_TIPS.map((_,i) => <div key={i} className={`pausa-dot ${i===pausaIdx?"active":""}`} onClick={() => setPausaIdx(i)}/>)}
        </div>
      </div>
    </div>
  );

  if (cargando) return (
    <>
      <style>{css}</style>
      <div className="loading">
        <div className="loading-logo">kind<span>.</span></div>
        <div className="loading-sub">Cargando contenido del día...</div>
        <div className="loading-bar"><div className="loading-fill"/></div>
      </div>
    </>
  );

  return (
    <>
      <style>{css}</style>

      <div className={`overlay ${menuOpen?"open":""}`} onClick={() => setMenuOpen(false)}/>

      {/* DRAWER */}
      <div className={`drawer ${menuOpen?"open":""}`}>
        <div className="drawer-head">
          <div className="drawer-logo">kind<span>.</span></div>
          <button className="drawer-x" onClick={() => setMenuOpen(false)}>✕</button>
        </div>
        <div className="drawer-section">Secciones</div>
        {SECCIONES.map(s => (
          <button key={s.id} className={`drawer-item ${seccion===s.id&&vista==="feed"?"active":""}`} onClick={() => goSeccion(s.id)}>
            <span className="drawer-icon">{s.icon}</span>{s.label}
          </button>
        ))}
        <div className="drawer-div"/>
        <div className="drawer-section">Kind</div>
        <button className={`drawer-item ${vista==="nosotros"?"active":""}`} onClick={() => { setVista("nosotros"); setMenuOpen(false); }}>
          <span className="drawer-icon">✦</span>Nosotros
        </button>
        <div className="drawer-div"/>
        <div style={{ padding:"12px 22px 20px", fontSize:12, color:"var(--muted)", lineHeight:1.6 }}>
          {today}<br/>
          {notas.length + notasIA.length} notas hoy
        </div>
      </div>

      {/* NAV */}
      <nav className="nav">
        <button className={`nav-burger ${menuOpen?"open":""}`} onClick={() => setMenuOpen(v=>!v)}>
          <div className="hline"/><div className="hline"/><div className="hline"/>
        </button>
        <div className="nav-logo" onClick={() => goSeccion("todo")}>kind<span>.</span></div>
        <div className="nav-tagline">Bienestar · Ciencia · Vida sana</div>
        <div className="nav-right">
          <div className="nav-search">
            <span className="nav-search-icon">🔍</span>
            <input type="text" placeholder="Buscar..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch}/>
          </div>
          <div className="nav-date">{today}</div>
        </div>
      </nav>

      {/* BARRA SECCIONES */}
      <div className="secbar">
        {SECCIONES.map(s => (
          <button key={s.id} className={`sec-btn ${seccion===s.id&&vista==="feed"?"active":""}`}
            onClick={() => goSeccion(s.id)}>
            <span>{s.icon}</span>{s.label}
          </button>
        ))}
      </div>

      <div className="page">
        <div className="container">
          <div className="main">

            {/* NOSOTROS */}
            {vista === "nosotros" && (
              <div>
                <div className="nos-hero">
                  <div className="nos-hl">Quiénes somos</div>
                  <div className="nos-titulo">Ciencia, bienestar y <em>vida sana</em>, sin ruido</div>
                  <div className="nos-sub">Kind reúne lo mejor del periodismo de salud y ciencia con notas editoriales propias. Sin alarmismo, sin pseudociencia, sin clickbait.</div>
                </div>
                <div className="nos-cards">
                  {[
                    {icon:"🔬", title:"Basado en evidencia", text:"Cada nota tiene respaldo científico. Cuando hay debate, lo decimos. Cuando no hay certeza, tampoco la inventamos."},
                    {icon:"🌿", title:"Bienestar integral", text:"Cuerpo, mente y hábitos. No tratamos la salud como una lista de prohibiciones sino como un camino de conocimiento propio."},
                    {icon:"🤖", title:"IA con criterio editorial", text:"Usamos inteligencia artificial para generar contenido, pero con supervisión humana y temas cuidadosamente seleccionados."},
                    {icon:"💭", title:"Reflexión diaria", text:"Una reflexión cada día sobre salud, mente o ciencia. Para parar un momento y pensar."},
                    {icon:"🌦️", title:"Clima + Pausa Kind", text:"Tu pronóstico del día y recordatorios de bienestar para cuidarte mientras te informás."},
                  ].map((c,i) => (
                    <div key={i} className="nos-card">
                      <span className="nos-card-icon">{c.icon}</span>
                      <div><div className="nos-card-title">{c.title}</div><div className="nos-card-text">{c.text}</div></div>
                    </div>
                  ))}
                </div>
                <div className="nos-manif">
                  <div className="nos-manif-title">"Informarse bien sobre salud<br/>es un acto de amor propio."</div>
                </div>
              </div>
            )}

            {/* FEED */}
            {vista === "feed" && (
              <div>
                {/* NOTA DESTACADA */}
                {notaDestacada && (seccion==="todo" || notaDestacada.seccion===seccion) && (
                  <div className="destacada">
                    <div className="dest-label">
                      <div className="dest-badge"><div className="dest-live"/>Nota del día</div>
                      {notaDestacada.tipo === "ia" && <span style={{fontSize:10,fontWeight:700,background:"#FFF0F8",color:"#8B1A5A",padding:"2px 8px",borderRadius:100}}>✨ Kind IA</span>}
                    </div>
                    <div className="dest-card" onClick={() => abrirNota(notaDestacada)}>
                      {notaDestacada.imagen
                        ? <img className="dest-img" src={notaDestacada.imagen} alt={notaDestacada.titulo} onError={e=>e.target.style.display="none"}/>
                        : <div className="dest-img-placeholder">🌿</div>}
                      <div className="dest-body">
                        <div className={`dest-sec ${notaDestacada.seccion}`}>{notaDestacada.seccion}</div>
                        <div className="dest-titulo">{notaDestacada.titulo}</div>
                        <div className="dest-resumen">
                          {notaDestacada.tipo==="ia" ? notaDestacada.contenido?.slice(0,200)+"..." : notaDestacada.resumen}
                        </div>
                        <div className="dest-foot">
                          <div className="dest-meta">
                            <span className="dest-portal">{notaDestacada.portal}</span>
                            <span>·</span>
                            <span>{notaDestacada.tiempo}</span>
                          </div>
                          <button className="dest-leer">
                            {notaDestacada.tipo==="ia" ? "Leer nota" : "Ver fuente"} ↗
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* NOTAS IA */}
                {notasIAFiltradas.filter(n => n.id !== notaDestacada?.id).length > 0 && (
                  <div style={{marginBottom:32}}>
                    <div className="grid-header">
                      <div className="grid-title">✨ Notas Kind</div>
                      <span className="grid-count">{notasIAFiltradas.length} notas</span>
                    </div>
                    {notasIAFiltradas.filter(n => n.id !== notaDestacada?.id).map(nota => (
                      <div key={nota.id} className="nota-ia-card" onClick={() => setNotaExpandida(notaExpandida?.id===nota.id?null:nota)}>
                        <div className="ia-badge">✨ Kind IA</div>
                        <div className={`nc-sec ${nota.seccion}`} style={{marginBottom:8}}>{nota.seccion}</div>
                        <div className="ia-titulo">{nota.titulo}</div>
                        <div className={`ia-contenido ${notaExpandida?.id===nota.id?"":"truncated"}`}>{nota.contenido}</div>
                        <button className="ia-leer-mas">{notaExpandida?.id===nota.id ? "Leer menos ↑" : "Leer más ↓"}</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* NOTAS RSS */}
                {notasFiltradas.filter(n => n.id !== notaDestacada?.id).length > 0 && (
                  <div>
                    <div className="grid-header">
                      <div className="grid-title">{seccion==="todo" ? "Lo más reciente" : seccion}</div>
                      <span className="grid-count">{notasFiltradas.length} notas</span>
                    </div>
                    <div className="notas-grid">
                      {notasFiltradas.filter(n => n.id !== notaDestacada?.id).map((n,i) => (
                        <div key={n.id} className="nota-card" style={{animationDelay:`${i*0.04}s`}} onClick={() => abrirNota(n)}>
                          <div className="nc-img">
                            <img src={n.imagen} alt={n.titulo} loading="lazy" onError={e=>{e.target.src=`https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=400&h=200&fit=crop`}}/>
                          </div>
                          <div className={`nc-sec ${n.seccion}`}>{n.seccion}</div>
                          <div className="nc-titulo">{n.titulo}</div>
                          <div className="nc-foot">
                            <div className="nc-meta"><span className="nc-portal">{n.portal}</span> · {n.tiempo}</div>
                            <span className="nc-leer">Leer ↗</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {notasFiltradas.length === 0 && notasIAFiltradas.length === 0 && (
                  <div style={{textAlign:"center",padding:"60px 20px",color:"var(--muted)"}}>
                    <div style={{fontSize:40,marginBottom:12}}>🌿</div>
                    <div style={{fontSize:14}}>Cargando notas de {seccion}...</div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Sidebar/>
        </div>

        {/* MOB NAV */}
        <div className="mob-nav">
          <div className="mob-nav-inner">
            {[["todo","✦","Todo"],["Salud","🏥","Salud"],["Ciencia","🔬","Ciencia"],["Hábitos","🌿","Hábitos"],["Mente","🧠","Mente"]].map(([id,icon,label]) => (
              <button key={id} className={`mob-btn ${seccion===id&&vista==="feed"?"active":""}`}
                onClick={() => goSeccion(id)}>
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
