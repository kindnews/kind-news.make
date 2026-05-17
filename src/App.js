import { useState, useEffect, useCallback } from "react";

const BRIEF_VARIANTS = [
  { headline: "Lo que pasó hoy, sin filtros ni alarma", intro: "Buenos días. Hubo cosas buenas, hubo cosas difíciles. Como siempre. Acá te las contamos con contexto y sin el loop de angustia.", closing: "Estar informado no significa estar angustiado. Significa entender mejor el mundo." },
  { headline: "El mundo no para. Tampoco vos.", intro: "Arrancar el día con buena información es una decisión. Acá está lo más importante de las últimas horas, ordenado para que puedas leerlo en paz.", closing: "Saber lo que pasa no te obliga a cargarlo todo." },
  { headline: "Mucho ruido afuera. Acá, solo lo que importa.", intro: "Hay días en que las noticias parecen una catarata. Hoy elegimos lo relevante y te lo dejamos acá. Sin clickbait, sin catástrofe.", closing: "El mundo es complejo. Lo simple es cómo te lo contamos." },
  { headline: "Noticias que merecen tu atención", intro: "No todo lo que hace ruido importa, y no todo lo que importa hace ruido. Este brief intenta equilibrar eso.", closing: "Gracias por leer con calma. Es un acto más político de lo que parece." },
  { headline: "Un día más, un mundo entero", intro: "Mientras dormías pasaron cosas. Algunas buenas, algunas difíciles. Acá el resumen honesto.", closing: "No hay forma de controlar todo. Sí hay formas de entender mejor." },
  { headline: "Sin dramatismo, sin ingenuidad", intro: "El periodismo que te agota no es inevitable. Se puede informar bien sin alarmar, sin omitir.", closing: "Curiosidad sin ansiedad. Eso es lo que Kind intenta ser." },
  { headline: "Lo importante de hoy, con todo el contexto", intro: "Cada noticia tiene historia, causa y consecuencia. Acá no te damos solo el titular: te damos el marco.", closing: "Informarse bien lleva un poco más de tiempo. Vale la pena." },
];

const BRIEF_ITEMS = [
  { icon: "🌊", tag: "Crisis · Ambiente", text: "Las inundaciones en el sur de Brasil dejaron más de 40.000 desplazados. Tercer evento climático extremo del año.", hard: true },
  { icon: "🧬", tag: "Ciencia", text: "Investigadores lograron regenerar tejido cardíaco con células madre en un ensayo clínico histórico." },
  { icon: "⚖️", tag: "Conflicto · Mundo", text: "La ONU advirtió que las negociaciones de paz en Sudán están estancadas. 8 millones de desplazados.", hard: true },
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
  { icon: "💧", title: "Hidratación", msg: "¿Tomaste agua en la última hora? Un vaso ahora hace la diferencia.", color: "#EBF5FB", accent: "#2980B9" },
  { icon: "🚶", title: "Movilidad", msg: "Levantate 2 minutos. Estirá el cuello y los hombros. Tu cuerpo te lo agradece.", color: "#EBF5EF", accent: "#27AE60" },
  { icon: "🧘", title: "Respiración", msg: "Inhala 4 segundos, sostén 4, exhala 4. Repetí 3 veces.", color: "#F3EBF5", accent: "#8E44AD" },
  { icon: "🎵", title: "Música", msg: "Una canción que te guste puede cambiar el humor en segundos.", color: "#FDF5E8", accent: "#E67E22" },
  { icon: "👁️", title: "Descanso visual", msg: "Mirá algo lejano por 20 segundos. Tus ojos necesitan ese descanso.", color: "#F5EBEB", accent: "#C0392B" },
  { icon: "🌿", title: "Pausa consciente", msg: "Antes de seguir leyendo, ¿cómo estás? Tomá un momento para notarlo.", color: "#EBF5EF", accent: "#1B5E3B" },
  { icon: "😊", title: "Gratitud", msg: "Pensá en una cosa buena que pasó hoy, aunque sea pequeña.", color: "#FBF8E8", accent: "#B7950B" },
  { icon: "🤸", title: "Estiramiento", msg: "Rodá los hombros hacia atrás 5 veces. Tu espalda te lo agradece.", color: "#EBF0F5", accent: "#2C3E50" },
];

const ALL_NEWS = [
  { id: 1, portal: "BBC Mundo", topic: "Mundo", title: "Inundaciones en Brasil dejan 40.000 desplazados en tres provincias", summary: "Es el tercer evento climático extremo en la región en lo que va de 2026. Las autoridades declararon emergencia nacional.", tone: "hard", time: "15 min", photo: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=600&h=360&fit=crop", read: 4, url: "https://www.bbc.com/mundo", featured: true },
  { id: 2, portal: "El País", topic: "Mundo", title: "ONU: las negociaciones de paz en Sudán están estancadas", summary: "Más de 8 millones de personas llevan desplazadas desde el inicio del conflicto.", tone: "hard", time: "45 min", photo: "https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=600&h=360&fit=crop", read: 5, url: "https://www.elpais.com" },
  { id: 3, portal: "BBC Mundo", topic: "Ciencia", title: "Células madre cardíacas: el ensayo que puede cambiar la medicina", summary: "Un equipo internacional publicó resultados que podrían transformar el tratamiento de enfermedades del corazón.", tone: "positive", time: "1h", photo: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=360&fit=crop", read: 4, url: "https://www.bbc.com/mundo" },
  { id: 4, portal: "Infobae", topic: "Economía", title: "El desempleo juvenil en LATAM supera el 20% por segundo año consecutivo", summary: "El informe de la OIT revela que la recuperación post-pandemia no llegó al segmento más joven.", tone: "hard", time: "2h", photo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=360&fit=crop", read: 5, url: "https://www.infobae.com" },
  { id: 5, portal: "El País", topic: "Ambiente", title: "España supera su meta renovable con tres años de anticipación", summary: "El país generó el 58% de su electricidad con fuentes limpias durante el primer trimestre.", tone: "positive", time: "2h", photo: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=360&fit=crop", read: 3, url: "https://www.elpais.com" },
  { id: 6, portal: "BBC Mundo", topic: "Tecnología", title: "La IA chilena que diagnostica lo que los médicos no pueden ver", summary: "El sistema reduce de años a semanas el diagnóstico de enfermedades raras.", tone: "positive", time: "3h", photo: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=360&fit=crop", read: 4, url: "https://www.bbc.com/mundo" },
  { id: 7, portal: "La Nación", topic: "Salud", title: "Crece el burnout docente: una crisis silenciosa en las escuelas", summary: "Sindicatos y especialistas coinciden en que las condiciones laborales del sector educativo se deterioraron.", tone: "hard", time: "4h", photo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&h=360&fit=crop", read: 6, url: "https://www.lanacion.com.ar" },
  { id: 8, portal: "La Nación", topic: "Mundo", title: "80.000 personas y récord histórico en la Feria del Libro porteña", summary: "La edición 2026 superó todas las marcas anteriores. El 40% de los visitantes tenía menos de 30 años.", tone: "positive", time: "4h", photo: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=360&fit=crop", read: 3, url: "https://www.lanacion.com.ar" },
  { id: 9, portal: "El País", topic: "Ambiente", title: "40 países firman fondo histórico para restaurar ecosistemas", summary: "El acuerdo compromete recursos sin precedentes para reforestar áreas críticas del planeta.", tone: "positive", time: "5h", photo: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&h=360&fit=crop", read: 4, url: "https://www.elpais.com" },
  { id: 10, portal: "DW Español", topic: "Salud", title: "OMS aprueba la primera vacuna contra la tuberculosis en 100 años", summary: "La vacuna mostró una eficacia del 73% en ensayos clínicos en África subsahariana.", tone: "positive", time: "6h", photo: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=360&fit=crop", read: 5, url: "https://www.dw.com/es" },
  { id: 11, portal: "Infobae", topic: "Mundo", title: "Terremoto de 6.8 sacude la costa central de Perú", summary: "Las autoridades informan daños materiales. No se reportan víctimas fatales pero continúan los relevamientos.", tone: "hard", time: "6h", photo: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&h=360&fit=crop", read: 4, url: "https://www.infobae.com" },
  { id: 12, portal: "BBC Mundo", topic: "Ciencia", title: "Estudio: el tiempo de lectura aumentó un 18% en jóvenes de 18 a 25 años", summary: "Los investigadores atribuyen el cambio al auge de newsletters y libros digitales.", tone: "positive", time: "7h", photo: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=360&fit=crop", read: 4, url: "https://www.bbc.com/mundo" },
  { id: 13, portal: "El País", topic: "Economía", title: "El FMI advierte sobre el riesgo de recesión en tres economías europeas", summary: "El organismo bajó sus proyecciones para Alemania, Francia e Italia.", tone: "hard", time: "8h", photo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=360&fit=crop", read: 5, url: "https://www.elpais.com" },
  { id: 14, portal: "La Tercera", topic: "Tecnología", title: "Chile lidera proyecto para llevar internet satelital a comunidades rurales", summary: "El programa busca conectar a más de 2 millones de personas en zonas sin cobertura para 2028.", tone: "positive", time: "9h", photo: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&h=360&fit=crop", read: 4, url: "https://www.latercera.com" },
  { id: 15, portal: "DW Español", topic: "Ambiente", title: "El Ártico registra su verano más cálido desde que hay registros", summary: "Los científicos alertan que el derretimiento del permafrost podría amplificar el cambio climático.", tone: "hard", time: "10h", photo: "https://images.unsplash.com/photo-1517783999520-f068d7431a60?w=600&h=360&fit=crop", read: 6, url: "https://www.dw.com/es" },
  { id: 16, portal: "Clarín", topic: "Mundo", title: "Un director argentino gana el premio a mejor documental en Sundance", summary: "La película retrata la migración patagónica a través de tres generaciones.", tone: "positive", time: "11h", photo: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=360&fit=crop", read: 3, url: "https://www.clarin.com" },
  { id: 17, portal: "BBC Mundo", topic: "Economía", title: "Crisis de vivienda: el alquiler subió un 40% en ciudades latinoamericanas", summary: "Buenos Aires, Ciudad de México y Bogotá encabezan el ranking de ciudades más afectadas.", tone: "hard", time: "12h", photo: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&h=360&fit=crop", read: 6, url: "https://www.bbc.com/mundo" },
  { id: 18, portal: "El Universal", topic: "Ciencia", title: "México lanza su primer programa nacional de medicina de precisión", summary: "El proyecto usará secuenciación genómica para adaptar tratamientos oncológicos a cada paciente.", tone: "positive", time: "13h", photo: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=360&fit=crop", read: 5, url: "https://www.eluniversal.com.mx" },
  { id: 19, portal: "Infobae", topic: "Mundo", title: "China realizó ejercicios militares no anunciados en el estrecho de Taiwán", summary: "El movimiento fue interpretado como una señal de presión hacia Washington.", tone: "hard", time: "14h", photo: "https://images.unsplash.com/photo-1569336415962-a4bd9f69c8bf?w=600&h=360&fit=crop", read: 5, url: "https://www.infobae.com" },
  { id: 20, portal: "El País", topic: "Mundo", title: "Finlandia comparte su modelo educativo con 12 países latinoamericanos", summary: "La cooperación incluye formación docente, rediseño curricular y evaluación continua.", tone: "positive", time: "15h", photo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=360&fit=crop", read: 4, url: "https://www.elpais.com" },
];

const EXTRA_NEWS = [
  { id: 101, portal: "DW Español", topic: "Tecnología", title: "La UE aprueba el primer marco regulatorio global para la IA generativa", summary: "Las nuevas reglas obligan a documentar los datos de entrenamiento.", tone: "positive", time: "16h", photo: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=360&fit=crop", read: 5, url: "https://www.dw.com/es" },
  { id: 102, portal: "BBC Mundo", topic: "Salud", title: "Nuevo antidepresivo de acción rápida muestra resultados en 48 horas", summary: "El fármaco podría transformar el tratamiento de la depresión severa.", tone: "positive", time: "17h", photo: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=360&fit=crop", read: 4, url: "https://www.bbc.com/mundo" },
  { id: 103, portal: "La Nación", topic: "Economía", title: "Sequía histórica en el norte de Argentina compromete la cosecha de soja", summary: "Las proyecciones del INTA indican pérdidas de hasta el 35% en dos provincias.", tone: "hard", time: "18h", photo: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=360&fit=crop", read: 5, url: "https://www.lanacion.com.ar" },
];

const ALL_PORTALS = ["BBC Mundo","El País","Infobae","Clarín","La Nación","DW Español","El Universal","La Tercera"];

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

  /* ══ NAV ══ */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 300;
    height: var(--nav-h);
    background: rgba(250,250,248,0.97); backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; padding: 0 24px; gap: 14px;
  }
  .nav-burger {
    width: 36px; height: 36px; flex-shrink: 0; background: none; border: none;
    cursor: pointer; display: flex; flex-direction: column; align-items: center;
    justify-content: center; gap: 5px; border-radius: 8px; transition: background 0.2s; padding: 0;
  }
  .nav-burger:hover { background: var(--warm); }
  .hline { width: 20px; height: 1.5px; background: var(--ink); border-radius: 2px; transition: all 0.25s ease; transform-origin: center; }
  .nav-burger.open .hline:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
  .nav-burger.open .hline:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .nav-burger.open .hline:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
  .nav-logo { font-family: 'Lora', serif; font-size: 22px; font-weight: 700; color: var(--ink); letter-spacing: -0.02em; cursor: pointer; flex-shrink: 0; }
  .nav-logo span { color: var(--green); }
  .nav-sep { width: 1px; height: 18px; background: var(--border); flex-shrink: 0; }
  .nav-tagline { font-size: 11px; color: var(--muted); flex-shrink: 0; }
  .nav-search { flex: 1; max-width: 360px; margin: 0 auto; position: relative; }
  .nav-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; color: var(--muted); pointer-events: none; }
  .nav-search input { width: 100%; height: 34px; background: var(--warm); border: 1px solid var(--border-light); border-radius: 100px; padding: 0 16px 0 36px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: var(--ink); outline: none; transition: all 0.2s; }
  .nav-search input:focus { background: white; border-color: var(--green); box-shadow: 0 0 0 3px rgba(27,94,59,0.07); }
  .nav-search input::placeholder { color: var(--muted); }
  .nav-date { font-size: 11px; color: var(--muted); flex-shrink: 0; margin-left: auto; }

  /* ══ CAT BAR ══ */
  .cat-bar {
    position: fixed; top: var(--nav-h); left: 0; right: 0; z-index: 290;
    height: var(--cat-h);
    background: rgba(250,250,248,0.97); backdrop-filter: blur(16px);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; padding: 0 24px; gap: 2px;
    overflow-x: auto; scrollbar-width: none;
  }
  .cat-bar::-webkit-scrollbar { display: none; }
  .cat-btn { white-space: nowrap; padding: 6px 14px; border-radius: 100px; border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 500; color: var(--ink-3); cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
  .cat-btn:hover { background: var(--warm); color: var(--ink); }
  .cat-btn.active { background: var(--ink); color: white; }

  /* ══ DRAWER ══ */
  .overlay { position: fixed; inset: 0; z-index: 250; background: rgba(0,0,0,0.18); backdrop-filter: blur(2px); opacity: 0; pointer-events: none; transition: opacity 0.3s; }
  .overlay.open { opacity: 1; pointer-events: all; }
  .drawer {
    position: fixed; top: 0; left: 0; bottom: 0; z-index: 260;
    width: 260px; background: var(--paper); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; overflow-y: auto;
    transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
  }
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

  /* ══ LAYOUT ══ */
  .page { padding-top: calc(var(--nav-h) + var(--cat-h)); min-height: 100vh; }
  .layout { max-width: 1240px; margin: 0 auto; padding: 32px 24px 60px; display: grid; grid-template-columns: 1fr 264px; gap: 32px; align-items: start; }

  /* ══ SIDEBAR ══ */
  .sidebar { position: sticky; top: calc(var(--nav-h) + var(--cat-h) + 24px); display: flex; flex-direction: column; gap: 14px; }

  .wellness-card {
    border-radius: 14px; padding: 18px;
    transition: background 0.6s ease;
    border: 1px solid rgba(0,0,0,0.04);
  }
  .wc-label { font-size: 9.5px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--green); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
  .wc-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--green); animation: pulse 2.5s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.6)} }
  .wc-icon { font-size: 32px; margin-bottom: 10px; display: block; }
  .wc-title { font-family: 'Lora', serif; font-size: 16px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
  .wc-msg { font-size: 12.5px; font-weight: 300; color: var(--ink-3); line-height: 1.65; margin-bottom: 12px; }
  .wc-next { font-size: 11px; font-weight: 600; color: var(--green); cursor: pointer; background: none; border: none; font-family: 'DM Sans', sans-serif; padding: 0; display: flex; align-items: center; gap: 4px; }
  .wc-next:hover { text-decoration: underline; }
  .wc-dots { display: flex; gap: 4px; margin-top: 10px; }
  .wc-dot-ind { width: 5px; height: 5px; border-radius: 50%; background: var(--border); transition: background 0.3s; }
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

  /* ══ MAIN CONTENT ══ */
  .main {}

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

  /* SECTION HEADER */
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

  .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; }
  .loading-logo { font-family: 'Lora', serif; font-size: 32px; font-weight: 700; color: var(--ink); }
  .loading-logo span { color: var(--green); }
  .loading-msg { font-size: 13px; color: var(--muted); }
  .loading-bar { width: 120px; height: 2px; background: var(--border); border-radius: 2px; overflow: hidden; }
  .loading-bar-fill { height: 100%; background: var(--green); border-radius: 2px; animation: loadBar 1.5s ease-in-out infinite; }
  @keyframes loadBar { 0%{width:0%} 50%{width:100%} 100%{width:0%;margin-left:100%} }
  .live-badge { display: inline-flex; align-items: center; gap: 5px; background: var(--green-pale); color: var(--green); font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 100px; letter-spacing: 0.06em; margin-left: 8px; }

  .load-btn { padding: 10px 28px; border-radius: 100px; border: 1px solid var(--border); background: white; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: var(--ink-3); cursor: pointer; transition: all 0.18s; box-shadow: 0 1px 8px rgba(0,0,0,0.05); }
  .load-btn:hover { border-color: var(--green); color: var(--green); }
  .loading-row { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; color: var(--muted); }

  /* SECTION SCREENS */
  .screen { animation: fadeUp 0.4s ease forwards; opacity: 0; }

  /* BRIEF SCREEN */
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

  /* INTERESES SCREEN */
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
  .save-btn { width: 100%; padding: 14px; background: var(--green); color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity 0.2s; }
  .save-btn:hover { opacity: 0.88; }
  .save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .saved-badge { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: var(--green-pale); border-radius: 10px; font-size: 13px; color: var(--green); font-weight: 500; }

  /* REDES SCREEN */
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

  /* NOSOTROS SCREEN */
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

  /* MOBILE */
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

const BACKEND_URL = "https://kind-backend-production-80b8.up.railway.app";

export default function Kind() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState("feed");
  const [activeCategory, setActiveCategory] = useState("all");
  const [toneFilter, setToneFilter] = useState("all");
  const [wellnessIdx, setWellnessIdx] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [visibleNews, setVisibleNews] = useState(ALL_NEWS);
  const [extraPool, setExtraPool] = useState(EXTRA_NEWS);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [subPortals, setSubPortals] = useState([]);
  const [subTopics, setSubTopics] = useState([]);
  const [subSaved, setSubSaved] = useState(false);
  const [briefData, setBriefData] = useState(null);
  const [backendOk, setBackendOk] = useState(false);
  const [cargando, setCargando] = useState(true);

  const dayOfWeek = new Date().getDay();
  const briefFallback = BRIEF_VARIANTS[dayOfWeek];
  const brief = briefData || briefFallback;
  const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const tip = WELLNESS_TIPS[wellnessIdx];

  // ── FETCH BACKEND ─────────────────────────────────────────────────────────
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const cargarBackend = async () => {
      setCargando(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/todo`);
        const data = await res.json();
        if (data.noticias && data.noticias.length > 0) {
          // Marcar la primera como featured
          const noticias = data.noticias.map((n, i) => ({ ...n, featured: i === 0 }));
          setVisibleNews(noticias);
          setExtraPool([]);
          setBackendOk(true);
        }
        if (data.brief) setBriefData(data.brief);
        if (data.editorial) setAiText(data.editorial);
      } catch (err) {
        console.warn("Backend no disponible, usando datos locales:", err.message);
      }
      setCargando(false);
    };
    cargarBackend();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setWellnessIdx(i => (i + 1) % WELLNESS_TIPS.length), 20000);
    return () => clearInterval(t);
  }, []);

  const loadAI = useCallback(async () => {
    if (backendOk) {
      // Si el backend está disponible, pedir el editorial de ahí
      try {
        const res = await fetch(`${BACKEND_URL}/api/editorial`);
        const data = await res.json();
        if (data.editorial) { setAiText(data.editorial); return; }
      } catch {}
    }
    // Fallback: generar con Claude directamente
    setAiLoading(true); setAiText("");
    try {
      const headlines = visibleNews.slice(0, 6).map(n => `[${n.tone === "hard" ? "DIFÍCIL" : "POSITIVA"}] ${n.title}`).join("\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: `Sos el editor de Kind, portal de noticias honesto y sin sensacionalismo. Voz cercana e inteligente. Con estas noticias del día, escribí un párrafo editorial breve (3-4 oraciones). Reconocé lo que está mal sin alarmar, y lo que avanza sin exagerar.\n\nNoticias:\n${headlines}\n\nPárrafo editorial:` }]
        })
      });
      const data = await res.json();
      setAiText(data.content?.map(b => b.text || "").join("") || "No se pudo generar el editorial.");
    } catch { setAiText("No se pudo cargar el editorial."); }
    setAiLoading(false);
  }, [backendOk, visibleNews]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!cargando && !aiText) loadAI(); }, [cargando]);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, "_blank");
    }
  };

  const handleLoadMore = () => {
    if (!extraPool.length) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleNews(prev => [...prev, ...extraPool.slice(0, 3)]);
      setExtraPool(prev => prev.slice(3));
      setLoadingMore(false);
    }, 700);
  };

  const goSection = (id) => { setSection(id); setMenuOpen(false); };
  const featured = visibleNews.find(n => n.featured);
  const filtered = visibleNews.filter(n => {
    const catOk = activeCategory === "all" || n.topic === activeCategory;
    const toneOk = toneFilter === "all" || n.tone === toneFilter;
    return catOk && toneOk && !n.featured;
  });

  // ── SIDEBAR ──────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div className="sidebar">
      <div className="wellness-card" style={{ background: tip.color }}>
        <div className="wc-label"><div className="wc-dot" />Pausa Kind</div>
        <span className="wc-icon">{tip.icon}</span>
        <div className="wc-title">{tip.title}</div>
        <div className="wc-msg">{tip.msg}</div>
        <button className="wc-next" onClick={() => setWellnessIdx(i => (i + 1) % WELLNESS_TIPS.length)}>
          Siguiente tip →
        </button>
        <div className="wc-dots">
          {WELLNESS_TIPS.map((_, i) => (
            <div key={i} className={`wc-dot-ind ${i === wellnessIdx ? "active" : ""}`} onClick={() => setWellnessIdx(i)} style={{ cursor: "pointer" }} />
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

  return (
    <>
      <style>{css}</style>

      {cargando && (
        <div className="loading-screen">
          <div className="loading-logo">kind<span>.</span></div>
          <div className="loading-bar"><div className="loading-bar-fill" /></div>
          <div className="loading-msg">Cargando noticias del día...</div>
        </div>
      )}

      {!cargando && (<>

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
        <div className="drawer-lbl">Hoy en Kind</div>
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.6, fontWeight: 300 }}>
            {today} · {visibleNews.length} noticias disponibles
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
          {backendOk && <span className="live-badge"><span style={{width:5,height:5,borderRadius:"50%",background:"var(--green)",display:"inline-block",animation:"pulse 2s infinite"}} />En vivo</span>}
        </div>
        <div className="nav-search">
          <span className="nav-search-icon">🔍</span>
          <input type="text" placeholder="Buscar en Google..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
        </div>
        <div className="nav-date">{today}</div>
      </nav>

      {/* CAT BAR — solo en feed */}
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

          {/* MAIN */}
          <div className="main">

            {/* ── FEED ── */}
            {section === "feed" && (
              <div className="screen">
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
                          <a className="hero-link" href={featured.url} target="_blank" rel="noopener noreferrer">Leer nota ↗</a>
                        </div>
                      </div>
                      <div className="hero-img-wrap">
                        <img src={featured.photo} alt={featured.title} />
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
                    <a key={n.id} className="ncard" style={{ animationDelay: `${i * 0.05}s` }} href={n.url} target="_blank" rel="noopener noreferrer" onClick={e => e.preventDefault()}>
                      <div className="ncard-img"><img src={n.photo} alt={n.title} loading="lazy" /></div>
                      <div className={`ncard-topic ${n.tone}`}>{n.topic}</div>
                      <div className="ncard-title">{n.title}</div>
                      <div className="ncard-foot">
                        <div className="ncard-meta"><b>{n.portal}</b><span>· {n.time}</span></div>
                        <a href={n.url} target="_blank" rel="noopener noreferrer" className="ncard-link" onClick={e => e.stopPropagation()}>Leer ↗</a>
                      </div>
                    </a>
                  ))}
                </div>

                <div className="load-wrap">
                  {loadingMore
                    ? <div className="loading-row"><div className="spinner-sm" />Cargando más noticias...</div>
                    : extraPool.length > 0
                      ? <button className="load-btn" onClick={handleLoadMore}>Cargar más noticias ↓</button>
                      : <span style={{ fontSize: 12, color: "var(--muted)" }}>Ya viste todas las noticias del día</span>
                  }
                </div>
              </div>
            )}

            {/* ── BRIEF ── */}
            {section === "brief" && (
              <div className="screen">
                <div className="brief-hero-panel">
                  <div className="bh-label"><div className="live-dot" />Brief Matutino · {today}</div>
                  <div className="bh-title">"{brief.headline}"</div>
                  <div className="bh-intro">{brief.intro}</div>
                </div>
                <div className="brief-items">
                  {BRIEF_ITEMS.map((item, i) => (
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
              <div className="screen">
                <div className="intereses-intro">
                  <div className="int-title">Tus intereses</div>
                  <div className="int-sub">Elegí tus fuentes y temas favoritos. Kind los va a priorizar en tu feed, aunque el portal seguirá cubriendo todas las noticias relevantes.</div>
                  <div className="int-note">💡 Esto no es un filtro: Kind sigue mostrando noticias importantes aunque no sean de tus temas. Lo que cambia es el énfasis y el orden.</div>
                </div>

                <div className="int-section-title">Fuentes preferidas</div>
                <div className="portals-grid">
                  {ALL_PORTALS.map(p => (
                    <div key={p} className={`portal-pill ${subPortals.includes(p) ? "selected" : ""}`} onClick={() => setSubPortals(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}>
                      <span className="portal-name">{p}</span>
                      <div className="portal-check">{subPortals.includes(p) ? "✓" : ""}</div>
                    </div>
                  ))}
                </div>

                <div className="int-section-title">Temas de interés</div>
                <div className="topics-row">
                  {CATEGORIES.filter(c => c.id !== "all").map(t => (
                    <div key={t.id} className={`topic-tag ${subTopics.includes(t.id) ? "selected" : ""}`} onClick={() => setSubTopics(prev => prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id])}>
                      {t.label}
                    </div>
                  ))}
                </div>

                {subSaved
                  ? <div className="saved-badge">✓ Preferencias guardadas — tu feed refleja tus intereses</div>
                  : <button className="save-btn" disabled={subPortals.length === 0 && subTopics.length === 0} onClick={() => setSubSaved(true)}>
                      Guardar preferencias ✦
                    </button>
                }
              </div>
            )}

            {/* ── REDES ── */}
            {section === "redes" && (
              <div className="screen">
                <div className="redes-intro">Kind en las redes</div>
                <div className="redes-sub">La misma voz en todos lados: honesta, cercana, sin alarmismo ni optimismo de fantasía.</div>

                <div className="social-card">
                  <div className="sc-label"><div className="sc-dot" style={{ background: "#E1306C" }} />Instagram Story · Noticia importante</div>
                  <div className="sc-preview" style={{ background: "linear-gradient(160deg, #2e1a1a 0%, #4a2d2d 100%)", minHeight: 180 }}>
                    <div className="sc-kind" style={{ color: "#E88E8E" }}>kind.</div>
                    <div className="sc-body" style={{ color: "white", fontSize: 17 }}>40.000 desplazados en Brasil por inundaciones. Es el tercer evento extremo del año.</div>
                    <div className="sc-tag" style={{ color: "rgba(255,255,255,0.45)" }}>kindnews.news · Más contexto en el link</div>
                  </div>
                </div>

                <div className="social-card">
                  <div className="sc-label"><div className="sc-dot" style={{ background: "#833AB4" }} />Instagram Post · Brief matutino</div>
                  <div className="sc-preview" style={{ background: "linear-gradient(135deg, #0f1a2e 0%, #1a2e4a 100%)", minHeight: 180 }}>
                    <div className="sc-kind" style={{ color: "#6BB5E8" }}>kind.</div>
                    <div className="sc-body" style={{ color: "white", fontSize: 17 }}>Hoy hay crisis, avances y todo lo que está en el medio. Te lo contamos sin drama.</div>
                    <div className="sc-tag" style={{ color: "rgba(255,255,255,0.35)" }}>kindnews.news</div>
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
                      <span className="x-act">💬 38</span><span className="x-act">🔁 240</span><span className="x-act">❤️ 1.8K</span><span className="x-act">📊 22K</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── NOSOTROS ── */}
            {section === "nosotros" && (
              <div className="screen">
                <div className="nos-hero">
                  <div className="nh-label">Quiénes somos</div>
                  <div className="nh-title">Noticias <em>reales</em>,<br />sin el loop de angustia</div>
                  <div className="nh-sub">Kind no filtra las malas noticias. Cubre todo lo importante, pero sin el sensacionalismo que te deja agotado. Hay una diferencia entre informar y asustar.</div>
                </div>
                <div className="nos-cards">
                  {[
                    { icon: "☀️", title: "Brief matutino honesto", text: "Cada mañana, lo más importante del día. Lo bueno y lo difícil, con contexto. Sin titular alarmista, sin omitir lo que incomoda." },
                    { icon: "📰", title: "Feed con balance real", text: "Las noticias difíciles están, etiquetadas y con contexto. Las positivas también, sin exagerarlas. El lector elige cómo y cuánto consumir." },
                    { icon: "🤖", title: "IA con criterio editorial", text: "Usamos IA para sintetizar y contextualizar, con una voz definida: ni catastrofista ni naïf. Siempre con supervisión humana." },
                    { icon: "🌿", title: "Pausas de bienestar", text: "Leer noticias puede ser intenso. Kind incluye recordatorios para que cuides tu cabeza y tu cuerpo mientras te informás." },
                  ].map((c, i) => (
                    <div key={i} className="nos-card">
                      <span className="nos-icon">{c.icon}</span>
                      <div>
                        <div className="nos-ctitle">{c.title}</div>
                        <div className="nos-ctext">{c.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="nos-manif">
                  <div className="nos-manif-title">"Informate bien.<br />Hacé el mundo mejor."</div>
                  <div className="nos-manif-sub">No creemos que ignorar los problemas ayude. Creemos que entenderlos bien, sin drama, es lo que permite actuar.</div>
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

          {/* SIDEBAR */}
          <Sidebar />
        </div>

        {/* MOBILE NAV */}
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
      </>)}
    </>
  );
}
