import { useState, useEffect, useCallback, useRef } from "react";

// ─── BRIEF VARIATIONS (rotates by day of week) ───────────────────────────────

const BRIEF_VARIANTS = [
  {
    headline: "Lo que pasó hoy, sin filtros ni alarma",
    intro: "Buenos días. Hubo cosas buenas, hubo cosas difíciles. Como siempre. Acá te las contamos con contexto y sin el loop de angustia al que te acostumbraron otros medios.",
    closing: "Estar informado no significa estar angustiado. Significa entender mejor el mundo en el que vivís."
  },
  {
    headline: "El mundo no para. Tampoco vos.",
    intro: "Arrancar el día con buena información es una decisión. Acá está lo más importante de las últimas horas, ordenado para que puedas leerlo en paz.",
    closing: "Saber lo que pasa no te obliga a cargarlo todo. Con entender ya es suficiente."
  },
  {
    headline: "Mucho ruido afuera. Acá, solo lo que importa.",
    intro: "Hay días en que las noticias parecen una catarata. Hoy elegimos lo relevante, lo pusimos en contexto y te lo dejamos acá. Sin clickbait, sin catástrofe.",
    closing: "El mundo es complejo. Lo simple es cómo te lo contamos."
  },
  {
    headline: "Noticias que merecen tu atención",
    intro: "No todo lo que hace ruido importa, y no todo lo que importa hace ruido. Este brief intenta equilibrar eso. Lo urgente y lo significativo, juntos.",
    closing: "Gracias por leer con calma. Es un acto más político de lo que parece."
  },
  {
    headline: "Un día más, un mundo entero",
    intro: "Mientras dormías pasaron cosas. Algunas buenas, algunas difíciles, algunas que todavía no sabemos bien qué son. Acá el resumen honesto.",
    closing: "No hay forma de controlar todo. Sí hay formas de entender mejor."
  },
  {
    headline: "Sin dramatismo, sin ingenuidad",
    intro: "El periodismo que te agota no es inevitable. Se puede informar bien sin alarmar, sin omitir, sin elegir solo lo que vende. Eso intentamos cada mañana.",
    closing: "Curiosidad sin ansiedad. Eso es lo que Kind intenta ser."
  },
  {
    headline: "Lo importante de hoy, con todo el contexto",
    intro: "Cada noticia tiene historia, causa y consecuencia. Acá no te damos solo el titular: te damos el marco para que lo que leas tenga sentido.",
    closing: "Informarse bien lleva un poco más de tiempo. Vale la pena."
  },
];

const BRIEF_ITEMS_POOL = [
  { icon: "🌊", tag: "Crisis · Ambiente", text: "Las inundaciones en el sur de Brasil dejaron más de 40.000 desplazados. Es el tercer evento climático extremo en la región en lo que va del año.", hard: true },
  { icon: "🧬", tag: "Ciencia", text: "Investigadores lograron regenerar tejido cardíaco con células madre en un ensayo clínico que podría transformar el tratamiento de enfermedades del corazón." },
  { icon: "⚖️", tag: "Conflicto · Mundo", text: "La ONU advirtió que las negociaciones de paz en Sudán están estancadas. Más de 8 millones de personas permanecen desplazadas desde el inicio del conflicto.", hard: true },
  { icon: "☀️", tag: "Ambiente", text: "España superó su meta de energía renovable con tres años de anticipación, generando el 58% de su electricidad con fuentes limpias." },
  { icon: "📚", tag: "Cultura", text: "El festival literario de Buenos Aires batió su récord histórico: 80.000 visitantes, con el 40% menor de 30 años." },
  { icon: "🤖", tag: "Tecnología", text: "Un equipo chileno desarrolló una IA que reduce de años a semanas el diagnóstico de enfermedades raras en América Latina." },
  { icon: "📊", tag: "Economía", text: "El desempleo juvenil en LATAM supera el 20% por segundo año consecutivo, según un informe de la OIT publicado esta semana.", hard: true },
  { icon: "🌍", tag: "Mundo", text: "40 países firmaron un fondo histórico para restaurar ecosistemas, comprometiendo recursos sin precedentes para la próxima década." },
  { icon: "🏥", tag: "Salud", text: "La OMS aprobó una nueva vacuna contra la tuberculosis, la primera en más de un siglo, con eficacia del 73% en ensayos clínicos en África subsahariana." },
  { icon: "🚨", tag: "Crisis · Social", text: "Un terremoto de magnitud 6.8 afectó la costa central de Perú. Las autoridades informan daños materiales significativos y continúan los relevamientos.", hard: true },
];

const ALL_NEWS = [
  { id: 1, portal: "BBC Mundo", topic: "Crisis", title: "Inundaciones en Brasil dejan 40.000 desplazados en tres provincias", summary: "Es el tercer evento climático extremo en la región en lo que va de 2026. Las autoridades declararon emergencia nacional y activaron planes de evacuación.", tone: "hard", time: "15 min", img: "🌊", photo: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400&h=220&fit=crop", read: 4, url: "https://www.bbc.com/mundo" },
  { id: 2, portal: "El País", topic: "Mundo", title: "ONU: las negociaciones de paz en Sudán están estancadas", summary: "Más de 8 millones de personas llevan desplazadas desde el inicio del conflicto. Los mediadores internacionales no logran sentar a las partes en la misma mesa.", tone: "hard", time: "45 min", img: "⚖️", photo: "https://images.unsplash.com/photo-1526470498-9ae73c665de8?w=400&h=220&fit=crop", read: 5, url: "https://www.elpais.com" },
  { id: 3, portal: "BBC Mundo", topic: "Ciencia", title: "Células madre cardíacas: el ensayo que puede cambiar la medicina", summary: "Un equipo internacional publicó resultados que podrían transformar el tratamiento de enfermedades del corazón para millones de personas.", tone: "positive", time: "1h", img: "🧬", photo: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&h=220&fit=crop", read: 4, url: "https://www.bbc.com/mundo" },
  { id: 4, portal: "Infobae", topic: "Economía", title: "El desempleo juvenil en LATAM supera el 20% por segundo año consecutivo", summary: "El informe de la OIT revela que la recuperación post-pandemia no llegó al segmento más joven de la población activa en la región.", tone: "hard", time: "2h", img: "📊", photo: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=220&fit=crop", read: 5, url: "https://www.infobae.com" },
  { id: 5, portal: "El País", topic: "Ambiente", title: "España supera su meta renovable con tres años de anticipación", summary: "El país generó el 58% de su electricidad con fuentes limpias durante el primer trimestre, superando las proyecciones más optimistas.", tone: "positive", time: "2h", img: "☀️", photo: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=220&fit=crop", read: 3, url: "https://www.elpais.com" },
  { id: 6, portal: "BBC Mundo", topic: "Tecnología", title: "La IA chilena que diagnostica lo que los médicos no pueden ver", summary: "El sistema reduce de años a semanas el diagnóstico de enfermedades raras, con impacto directo en comunidades con poco acceso a especialistas.", tone: "positive", time: "3h", img: "🤖", photo: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=220&fit=crop", read: 4, url: "https://www.bbc.com/mundo" },
  { id: 7, portal: "La Nación", topic: "Sociedad", title: "Crece el burnout docente: una crisis silenciosa en las escuelas", summary: "Sindicatos y especialistas coinciden en que las condiciones laborales del sector educativo se deterioraron en los últimos tres años.", tone: "hard", time: "4h", img: "🏫", photo: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=220&fit=crop", read: 6, url: "https://www.lanacion.com.ar" },
  { id: 8, portal: "La Nación", topic: "Cultura", title: "80.000 personas y récord histórico en la Feria del Libro porteña", summary: "La edición 2026 superó todas las marcas anteriores. El 40% de los visitantes tenía menos de 30 años.", tone: "positive", time: "4h", img: "📚", photo: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=220&fit=crop", read: 3, url: "https://www.lanacion.com.ar" },
  { id: 9, portal: "El País", topic: "Mundo", title: "40 países firman fondo histórico para restaurar ecosistemas", summary: "El acuerdo compromete recursos sin precedentes para reforestar áreas críticas del planeta en la próxima década.", tone: "positive", time: "5h", img: "🌳", photo: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=220&fit=crop", read: 4, url: "https://www.elpais.com" },
  { id: 10, portal: "DW Español", topic: "Salud", title: "OMS aprueba la primera vacuna contra la tuberculosis en 100 años", summary: "La vacuna mostró una eficacia del 73% en ensayos clínicos realizados en África subsahariana, donde la enfermedad sigue siendo una de las principales causas de muerte.", tone: "positive", time: "6h", img: "💉", photo: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=220&fit=crop", read: 5, url: "https://www.dw.com/es" },
  { id: 11, portal: "Infobae", topic: "Crisis", title: "Terremoto de 6.8 sacude la costa central de Perú", summary: "Las autoridades informan daños materiales significativos en tres provincias costeras. No se reportan víctimas fatales pero continúan los relevamientos.", tone: "hard", time: "6h", img: "🚨", photo: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&h=220&fit=crop", read: 4, url: "https://www.infobae.com" },
  { id: 12, portal: "BBC Mundo", topic: "Sociedad", title: "Un estudio revela que el tiempo de lectura aumentó un 18% en jóvenes de 18 a 25 años", summary: "Los investigadores atribuyen el cambio al auge de los newsletters y los libros en formato digital. El fenómeno es más marcado en América Latina.", tone: "positive", time: "7h", img: "📖", photo: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=220&fit=crop", read: 4, url: "https://www.bbc.com/mundo" },
  { id: 13, portal: "El País", topic: "Economía", title: "El FMI advierte sobre el riesgo de recesión en tres economías europeas", summary: "El organismo bajó sus proyecciones de crecimiento para Alemania, Francia e Italia, citando la persistencia de altos costos energéticos y la caída del consumo interno.", tone: "hard", time: "8h", img: "📉", photo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=220&fit=crop", read: 5, url: "https://www.elpais.com" },
  { id: 14, portal: "La Tercera", topic: "Tecnología", title: "Chile lidera un proyecto regional para llevar internet satelital a comunidades rurales", summary: "El programa, financiado por un consorcio de países latinoamericanos, busca conectar a más de 2 millones de personas en zonas sin cobertura para 2028.", tone: "positive", time: "9h", img: "🛰️", photo: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&h=220&fit=crop", read: 4, url: "https://www.latercera.com" },
  { id: 15, portal: "DW Español", topic: "Ambiente", title: "El Ártico registra su verano más cálido desde que hay registros", summary: "Los científicos alertan que el derretimiento acelerado del permafrost podría liberar reservas de metano que amplifiquen el cambio climático más allá de los modelos actuales.", tone: "hard", time: "10h", img: "🧊", photo: "https://images.unsplash.com/photo-1517783999520-f068d7431a60?w=400&h=220&fit=crop", read: 6, url: "https://www.dw.com/es" },
  { id: 16, portal: "Clarín", topic: "Cultura", title: "Un director argentino gana el premio a mejor documental en Sundance", summary: "La película, que retrata la migración patagónica a través de tres generaciones de una misma familia, fue aclamada por la crítica internacional.", tone: "positive", time: "11h", img: "🎬", photo: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=220&fit=crop", read: 3, url: "https://www.clarin.com" },
  { id: 17, portal: "BBC Mundo", topic: "Sociedad", title: "Crisis de vivienda en ciudades latinoamericanas: el alquiler subió un 40% en dos años", summary: "Buenos Aires, Ciudad de México y Bogotá encabezan el ranking de ciudades donde el acceso a la vivienda se deterioró más rápido desde 2024.", tone: "hard", time: "12h", img: "🏙️", photo: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&h=220&fit=crop", read: 6, url: "https://www.bbc.com/mundo" },
  { id: 18, portal: "El Universal", topic: "Ciencia", title: "México lanza su primer programa nacional de medicina de precisión", summary: "El proyecto usará secuenciación genómica para adaptar tratamientos oncológicos a la genética de cada paciente, con cobertura pública prevista para 2027.", tone: "positive", time: "13h", img: "🔬", photo: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=220&fit=crop", read: 5, url: "https://www.eluniversal.com.mx" },
  { id: 19, portal: "Infobae", topic: "Mundo", title: "Tensiones en el estrecho de Taiwán: China realizó ejercicios militares no anunciados", summary: "El movimiento fue interpretado como una señal de presión hacia Washington tras las últimas declaraciones del Congreso estadounidense sobre ventas de armas a Taipéi.", tone: "hard", time: "14h", img: "⚠️", photo: "https://images.unsplash.com/photo-1569336415962-a4bd9f69c8bf?w=400&h=220&fit=crop", read: 5, url: "https://www.infobae.com" },
  { id: 20, portal: "El País", topic: "Educación", title: "Finlandia comparte su modelo educativo con 12 países latinoamericanos", summary: "La cooperación incluye formación docente, rediseño curricular y evaluación continua. Uruguay y Colombia serán los primeros en implementarlo.", tone: "positive", time: "15h", img: "🎓", photo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=220&fit=crop", read: 4, url: "https://www.elpais.com" },
];

// Extra news to load on scroll
const EXTRA_NEWS_POOL = [
  { id: 101, portal: "DW Español", topic: "Tecnología", title: "La Unión Europea aprueba el primer marco regulatorio global para la IA generativa", summary: "Las nuevas reglas obligan a los desarrolladores a documentar los datos de entrenamiento y establecen límites al uso de IA en decisiones judiciales y crediticias.", tone: "positive", time: "16h", img: "🤖", photo: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&h=220&fit=crop", read: 5, url: "https://www.dw.com/es" },
  { id: 102, portal: "BBC Mundo", topic: "Salud", title: "Un nuevo antidepresivo de acción rápida muestra resultados en 48 horas", summary: "El fármaco, desarrollado por un laboratorio suizo, actúa sobre receptores distintos a los ISRS convencionales y podría transformar el tratamiento de la depresión severa.", tone: "positive", time: "17h", img: "💊", photo: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=220&fit=crop", read: 4, url: "https://www.bbc.com/mundo" },
  { id: 103, portal: "La Nación", topic: "Crisis", title: "Sequía histórica en el norte de Argentina compromete la cosecha de soja", summary: "Las proyecciones del INTA indican pérdidas de hasta el 35% en las provincias de Santiago del Estero y Chaco, lo que impactaría en las reservas de divisas.", tone: "hard", time: "18h", img: "🌾", photo: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=220&fit=crop", read: 5, url: "https://www.lanacion.com.ar" },
  { id: 104, portal: "El País", topic: "Sociedad", title: "España bate su récord de turismo pero el debate sobre la gentrificación se intensifica", summary: "Con 94 millones de visitantes en 2025, ciudades como Barcelona y San Sebastián enfrentan presión vecinal creciente por el impacto en el acceso a la vivienda.", tone: "hard", time: "19h", img: "✈️", photo: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400&h=220&fit=crop", read: 5, url: "https://www.elpais.com" },
  { id: 105, portal: "Infobae", topic: "Ciencia", title: "Detectan agua líquida bajo la superficie de la luna Europa de Júpiter", summary: "El hallazgo de la sonda Clipper refuerza la hipótesis de que Europa podría albergar condiciones habitables en su océano subsuperficial.", tone: "positive", time: "20h", img: "🪐", photo: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=400&h=220&fit=crop", read: 4, url: "https://www.infobae.com" },
];

const WELLNESS = [
  { icon: "💧", title: "Hidratación", msg: "¿Tomaste agua en la última hora? Un vaso ahora hace la diferencia." },
  { icon: "🚶", title: "Movimiento", msg: "Levantate 2 minutos. Estirá el cuello y los hombros." },
  { icon: "🧘", title: "Respiración", msg: "Inhala 4 segundos, sostén 4, exhala 4. Repetí 3 veces." },
  { icon: "👁️", title: "Descanso visual", msg: "Mirá algo lejano por 20 segundos. Tus ojos te lo agradecen." },
  { icon: "🌿", title: "Pausa", msg: "Antes de seguir leyendo, ¿cómo estás? Tomá un momento." },
];

const ALL_PORTALS = ["BBC Mundo","El País","Infobae","Clarín","La Nación","DW Español","El Universal","La Tercera","France 24","EFE"];
const ALL_TOPICS = [
  { id: "ciencia", label: "Ciencia", icon: "🔬" },
  { id: "tecnologia", label: "Tecnología", icon: "⚡" },
  { id: "ambiente", label: "Ambiente", icon: "🌱" },
  { id: "salud", label: "Salud", icon: "🌿" },
  { id: "economia", label: "Economía", icon: "📊" },
  { id: "mundo", label: "Mundo", icon: "🌎" },
  { id: "cultura", label: "Cultura", icon: "🎨" },
  { id: "sociedad", label: "Sociedad", icon: "🤝" },
  { id: "educacion", label: "Educación", icon: "🎓" },
  { id: "crisis", label: "Crisis", icon: "🚨" },
];

// ─── STYLES ──────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --ink: #141414; --ink-soft: #3a3a3a; --muted: #888; --faint: #bbb;
    --paper: #F9F6F1; --warm: #F0EAE0; --warmer: #E8DDD0;
    --kind-green: #2D6A4F; --kind-green-light: #52B788; --kind-green-pale: #D8F3DC;
    --kind-amber: #C97D2A;
    --positive: #2D6A4F; --positive-bg: #D8F3DC;
    --hard: #8B2E2E; --hard-bg: #FDF0F0;
    --radius: 16px; --radius-lg: 24px;
    --shadow-sm: 0 2px 12px rgba(20,20,20,0.06);
    --shadow: 0 4px 28px rgba(20,20,20,0.09);
  }
  html { scroll-behavior: smooth; }
  body { background: var(--paper); font-family: 'Outfit', sans-serif; color: var(--ink); -webkit-font-smoothing: antialiased; }
  .app { max-width: 440px; margin: 0 auto; min-height: 100vh; position: relative; overflow-x: hidden; }

  /* NAV */
  .nav { position: sticky; top: 0; z-index: 100; background: rgba(249,246,241,0.93); backdrop-filter: blur(16px); border-bottom: 1px solid rgba(20,20,20,0.07); padding: 0 20px; }
  .nav-top { display: flex; align-items: center; justify-content: space-between; padding: 14px 0 10px; }
  .nav-logo { display: flex; flex-direction: column; gap: 1px; }
  .logo-word { font-family: 'Lora', serif; font-size: 24px; font-weight: 700; color: var(--ink); letter-spacing: -0.02em; line-height: 1; }
  .logo-word span { color: var(--kind-green); }
  .logo-tagline { font-size: 9px; font-weight: 500; color: var(--muted); letter-spacing: 0.12em; text-transform: uppercase; }
  .nav-actions { display: flex; gap: 8px; }
  .nav-btn { width: 36px; height: 36px; border: 1px solid var(--warmer); border-radius: 10px; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.18s; box-shadow: var(--shadow-sm); }
  .nav-btn:hover { background: var(--warm); transform: translateY(-1px); }
  .nav-tabs { display: flex; gap: 2px; padding-bottom: 12px; }
  .nav-tab { flex: 1; padding: 8px 6px; border: none; background: transparent; font-family: 'Outfit', sans-serif; font-size: 11.5px; font-weight: 500; color: var(--muted); cursor: pointer; border-radius: 8px; transition: all 0.18s; }
  .nav-tab.active { background: var(--ink); color: white; }
  .nav-tab:not(.active):hover { background: var(--warm); color: var(--ink); }

  .content { padding-bottom: 40px; }

  /* BRIEF */
  .brief-hero { background: var(--ink); padding: 32px 24px 28px; position: relative; overflow: hidden; }
  .brief-hero::before { content: ''; position: absolute; top: -60px; right: -60px; width: 240px; height: 240px; background: radial-gradient(circle, rgba(45,106,79,0.35) 0%, transparent 65%); border-radius: 50%; pointer-events: none; }
  .brief-hero::after { content: ''; position: absolute; bottom: -40px; left: -20px; width: 180px; height: 180px; background: radial-gradient(circle, rgba(201,125,42,0.18) 0%, transparent 65%); border-radius: 50%; pointer-events: none; }
  .brief-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
  .brief-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--kind-green-light); animation: pulse 2.5s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
  .brief-date { font-size: 11px; font-weight: 500; color: rgba(255,255,255,0.45); letter-spacing: 0.08em; text-transform: uppercase; }
  .brief-edition { font-size: 11px; font-weight: 600; color: var(--kind-green-light); letter-spacing: 0.06em; text-transform: uppercase; margin-left: auto; }
  .brief-title { font-family: 'Lora', serif; font-size: 21px; font-weight: 600; color: white; line-height: 1.35; margin-bottom: 12px; font-style: italic; }
  .brief-intro { font-size: 13.5px; font-weight: 300; color: rgba(255,255,255,0.6); line-height: 1.65; }
  .brief-items { padding: 0 20px; }
  .brief-item { display: flex; gap: 14px; padding: 17px 0; border-bottom: 1px solid rgba(20,20,20,0.07); animation: slideUp 0.5s ease forwards; opacity: 0; }
  .brief-item:last-child { border-bottom: none; }
  @keyframes slideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  .brief-item-icon { width: 44px; height: 44px; flex-shrink: 0; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .brief-item-icon.normal { background: var(--warm); }
  .brief-item-icon.hard { background: #FDE8E8; }
  .brief-item-tag { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; }
  .brief-item-tag.normal { color: var(--kind-green); }
  .brief-item-tag.hard { color: var(--hard); }
  .brief-item-text { font-family: 'Lora', serif; font-size: 14px; font-weight: 400; color: var(--ink-soft); line-height: 1.6; }
  .brief-closing { margin: 4px 20px 20px; background: var(--kind-green-pale); border-radius: var(--radius); padding: 16px 18px; display: flex; gap: 10px; align-items: flex-start; }
  .brief-closing-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .brief-closing-text { font-family: 'Lora', serif; font-size: 13.5px; color: var(--kind-green); line-height: 1.55; font-style: italic; }

  /* AI */
  .ai-card { margin: 16px 20px 0; background: white; border-radius: var(--radius); padding: 18px; box-shadow: var(--shadow-sm); border: 1px solid rgba(20,20,20,0.05); }
  .ai-label { display: flex; align-items: center; gap: 7px; margin-bottom: 10px; }
  .ai-label-text { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
  .ai-label-badge { background: var(--kind-green-pale); color: var(--kind-green); font-size: 9px; font-weight: 600; padding: 2px 7px; border-radius: 100px; letter-spacing: 0.06em; text-transform: uppercase; }
  .ai-text { font-size: 13.5px; font-weight: 400; color: var(--ink-soft); line-height: 1.65; }
  .ai-refresh { display: flex; align-items: center; gap: 6px; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(20,20,20,0.06); cursor: pointer; width: fit-content; }
  .ai-refresh-text { font-size: 11.5px; font-weight: 500; color: var(--kind-green); }
  .spinner { width: 16px; height: 16px; border: 1.5px solid var(--warmer); border-top-color: var(--kind-green); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* WELLNESS */
  .wellness-strip { background: linear-gradient(135deg, #1C3829 0%, #2D5A3D 100%); border-radius: var(--radius); padding: 16px 18px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: transform 0.2s; position: relative; overflow: hidden; }
  .wellness-strip::before { content: ''; position: absolute; right: -20px; top: -20px; width: 100px; height: 100px; background: radial-gradient(circle, rgba(82,183,136,0.25) 0%, transparent 65%); border-radius: 50%; pointer-events: none; }
  .wellness-strip:hover { transform: scale(0.99); }
  .wellness-icon { font-size: 24px; width: 46px; height: 46px; flex-shrink: 0; background: rgba(255,255,255,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
  .wellness-label { font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--kind-green-light); margin-bottom: 3px; }
  .wellness-msg { font-size: 13px; font-weight: 400; color: rgba(255,255,255,0.82); line-height: 1.45; }

  /* FILTERS */
  .filter-row { display: flex; gap: 7px; padding: 16px 20px 0; overflow-x: auto; scrollbar-width: none; }
  .filter-row::-webkit-scrollbar { display: none; }
  .filter-chip { white-space: nowrap; padding: 7px 14px; border-radius: 100px; border: 1.5px solid var(--warmer); background: white; font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 500; color: var(--muted); cursor: pointer; transition: all 0.18s; }
  .filter-chip.active { background: var(--ink); border-color: var(--ink); color: white; }
  .filter-chip:not(.active):hover { border-color: var(--kind-green); color: var(--kind-green); }

  /* NEWS CARDS */
  .feed-section-label { padding: 16px 20px 8px; display: flex; align-items: center; gap: 8px; font-size: 10.5px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
  .feed-section-label::after { content: ''; flex: 1; height: 1px; background: var(--warmer); }
  .news-card { margin: 0 20px 10px; background: white; border-radius: var(--radius); padding: 18px; box-shadow: var(--shadow-sm); border: 1px solid rgba(20,20,20,0.04); cursor: pointer; transition: transform 0.18s, box-shadow 0.18s; animation: slideUp 0.4s ease forwards; opacity: 0; }
  .news-card:hover { transform: translateY(-2px); box-shadow: var(--shadow); }
  .news-card.hard-card { border-left: 3px solid #E8B4B4; }
  .news-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .news-source { font-size: 10.5px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--muted); }
  .tone-pill { font-size: 10px; font-weight: 600; padding: 3px 9px; border-radius: 100px; letter-spacing: 0.04em; }
  .tone-positive { background: var(--positive-bg); color: var(--positive); }
  .tone-hard { background: var(--hard-bg); color: var(--hard); }
  .news-body { display: flex; gap: 13px; align-items: flex-start; }
  .news-thumb { width: 80px; height: 80px; flex-shrink: 0; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 26px; background: var(--warm); overflow: hidden; position: relative; }
  .news-thumb.hard-thumb { background: #FDE8E8; }
  .news-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .news-card-photo { width: 100%; height: 155px; border-radius: 12px; overflow: hidden; margin-bottom: 14px; position: relative; }
  .news-card-photo img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; display: block; }
  .news-card:hover .news-card-photo img { transform: scale(1.03); }
  .photo-tone-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; }
  .photo-tone-bar.positive { background: linear-gradient(90deg, var(--kind-green-light), transparent); }
  .photo-tone-bar.hard { background: linear-gradient(90deg, #E88888, transparent); }
  .news-topic { font-size: 10px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; margin-bottom: 4px; }
  .news-topic.positive { color: var(--kind-green); }
  .news-topic.hard { color: var(--hard); }
  .news-title { font-family: 'Lora', serif; font-size: 15px; font-weight: 600; color: var(--ink); line-height: 1.42; }
  .news-summary { font-size: 13px; font-weight: 300; color: var(--muted); line-height: 1.6; margin-top: 8px; animation: slideUp 0.3s ease forwards; }
  .news-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(20,20,20,0.05); flex-wrap: wrap; gap: 6px; }
  .news-time { font-size: 11px; color: var(--faint); }
  .news-read { font-size: 11px; color: var(--faint); }
  .news-expand { font-size: 11px; font-weight: 500; color: var(--kind-green); }
  .news-link { font-size: 11px; font-weight: 600; color: var(--kind-amber); text-decoration: none; display: flex; align-items: center; gap: 3px; padding: 4px 10px; background: #FDF3E3; border-radius: 100px; transition: background 0.15s; }
  .news-link:hover { background: #FAE8C8; }

  /* LOAD MORE */
  .load-more-trigger { padding: 20px; text-align: center; }
  .load-more-btn { padding: 12px 28px; background: white; border: 1.5px solid var(--warmer); border-radius: 100px; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 500; color: var(--muted); cursor: pointer; transition: all 0.18s; box-shadow: var(--shadow-sm); }
  .load-more-btn:hover { border-color: var(--kind-green); color: var(--kind-green); }
  .load-more-spinner { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; color: var(--muted); }

  /* SUSCRIPCION */
  .sub-screen { min-height: 100vh; display: flex; flex-direction: column; }
  .sub-hero { background: var(--ink); padding: 48px 24px 36px; position: relative; overflow: hidden; }
  .sub-hero::before { content: ''; position: absolute; top: -40px; right: -40px; width: 220px; height: 220px; background: radial-gradient(circle, rgba(45,106,79,0.4) 0%, transparent 65%); border-radius: 50%; pointer-events: none; }
  .sub-back { background: none; border: none; color: rgba(255,255,255,0.5); font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Outfit', sans-serif; padding: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 4px; }
  .sub-back:hover { color: white; }
  .sub-hero-label { font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--kind-green-light); margin-bottom: 10px; }
  .sub-hero-title { font-family: 'Lora', serif; font-size: 28px; font-weight: 700; color: white; line-height: 1.25; margin-bottom: 14px; }
  .sub-hero-title em { color: var(--kind-green-light); font-style: normal; }
  .sub-hero-sub { font-size: 13.5px; font-weight: 300; color: rgba(255,255,255,0.55); line-height: 1.65; }
  .sub-note { margin: 20px 20px 0; background: #FDF3E3; border-radius: var(--radius); padding: 14px 16px; display: flex; gap: 10px; align-items: flex-start; border-left: 3px solid var(--kind-amber); }
  .sub-note-icon { font-size: 16px; flex-shrink: 0; }
  .sub-note-text { font-size: 12.5px; color: #7A5020; line-height: 1.55; }
  .sub-section { padding: 24px 20px 0; }
  .sub-section-title { font-family: 'Lora', serif; font-size: 17px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
  .sub-section-sub { font-size: 12.5px; color: var(--muted); line-height: 1.55; margin-bottom: 16px; }
  .portals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .portal-card { border: 1.5px solid var(--warmer); border-radius: 12px; padding: 12px 14px; cursor: pointer; transition: all 0.18s; background: white; display: flex; align-items: center; gap: 8px; }
  .portal-card.selected { border-color: var(--kind-green); background: var(--kind-green-pale); }
  .portal-check { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid var(--warmer); flex-shrink: 0; margin-left: auto; transition: all 0.18s; display: flex; align-items: center; justify-content: center; font-size: 10px; }
  .portal-card.selected .portal-check { background: var(--kind-green); border-color: var(--kind-green); color: white; }
  .portal-name { font-size: 12.5px; font-weight: 500; color: var(--ink); }
  .topics-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .topic-pill { display: flex; align-items: center; gap: 5px; padding: 7px 13px; border-radius: 100px; border: 1.5px solid var(--warmer); cursor: pointer; font-size: 12.5px; font-weight: 500; transition: all 0.18s; background: white; color: var(--ink); }
  .topic-pill.selected { background: var(--ink); border-color: var(--ink); color: white; }
  .sub-cta { margin: 28px 20px 40px; }
  .sub-cta-btn { width: 100%; padding: 16px; background: linear-gradient(135deg, var(--kind-green) 0%, #1a4a35 100%); color: white; border: none; border-radius: var(--radius); font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'Outfit', sans-serif; transition: opacity 0.2s, transform 0.15s; box-shadow: 0 6px 20px rgba(45,106,79,0.35); }
  .sub-cta-btn:hover { opacity: 0.92; transform: translateY(-1px); }
  .sub-cta-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .sub-badge { display: inline-flex; align-items: center; gap: 5px; background: var(--kind-green-pale); color: var(--kind-green); font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 100px; }

  /* SOCIAL */
  .social-intro { padding: 20px 20px 0; }
  .social-intro-title { font-family: 'Lora', serif; font-size: 20px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
  .social-intro-sub { font-size: 13px; font-weight: 300; color: var(--muted); line-height: 1.6; }
  .social-cards { padding: 16px 20px 0; display: flex; flex-direction: column; gap: 14px; }
  .social-card { border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow); }
  .social-card-label { padding: 8px 16px; background: var(--warm); font-size: 10.5px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); display: flex; align-items: center; gap: 6px; }
  .social-platform-dot { width: 8px; height: 8px; border-radius: 50%; }
  .social-preview { padding: 28px 24px; min-height: 180px; display: flex; flex-direction: column; justify-content: flex-end; position: relative; }
  .social-kind-logo { font-family: 'Lora', serif; font-size: 13px; font-weight: 700; position: absolute; top: 20px; left: 24px; opacity: 0.7; }
  .social-body { font-family: 'Lora', serif; font-size: 17px; font-weight: 600; line-height: 1.45; margin-bottom: 14px; }
  .social-tag { font-size: 11px; font-weight: 500; opacity: 0.55; letter-spacing: 0.04em; }
  .x-post-preview { padding: 20px 22px; background: #0a0a0a; }
  .x-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .x-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--kind-green), var(--kind-amber)); display: flex; align-items: center; justify-content: center; font-family: 'Lora', serif; font-size: 14px; font-weight: 700; color: white; }
  .x-name { font-size: 14px; font-weight: 600; color: white; }
  .x-handle { font-size: 12px; color: #666; }
  .x-body { font-size: 15px; color: rgba(255,255,255,0.9); line-height: 1.55; margin-bottom: 14px; }
  .x-tag { font-size: 13px; color: #4A9EE8; }
  .x-actions { display: flex; gap: 20px; margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.08); }
  .x-action { font-size: 12px; color: #666; }

  /* ABOUT */
  .about-hero { background: var(--ink); padding: 36px 24px 32px; position: relative; overflow: hidden; }
  .about-hero::before { content: ''; position: absolute; bottom: -40px; right: -40px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(45,106,79,0.4) 0%, transparent 65%); border-radius: 50%; pointer-events: none; }
  .about-label { font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--kind-green-light); margin-bottom: 12px; }
  .about-title { font-family: 'Lora', serif; font-size: 28px; font-weight: 700; color: white; line-height: 1.25; margin-bottom: 14px; }
  .about-title em { color: var(--kind-green-light); font-style: normal; }
  .about-sub { font-size: 14px; font-weight: 300; color: rgba(255,255,255,0.55); line-height: 1.65; }
  .about-body { padding: 24px 20px; display: flex; flex-direction: column; gap: 16px; }
  .about-card { background: white; border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow-sm); border: 1px solid rgba(20,20,20,0.05); }
  .about-card-icon { font-size: 24px; margin-bottom: 10px; }
  .about-card-title { font-family: 'Lora', serif; font-size: 17px; font-weight: 600; color: var(--ink); margin-bottom: 6px; }
  .about-card-text { font-size: 13.5px; font-weight: 300; color: var(--muted); line-height: 1.65; }
  .about-manifesto { background: var(--kind-green); border-radius: var(--radius); padding: 24px; text-align: center; }
  .about-manifesto-title { font-family: 'Lora', serif; font-size: 22px; font-weight: 700; color: white; font-style: italic; margin-bottom: 10px; line-height: 1.3; }
  .about-manifesto-sub { font-size: 13px; font-weight: 300; color: rgba(255,255,255,0.65); line-height: 1.6; }
  .about-links { display: flex; gap: 10px; padding: 0 20px 32px; }
  .about-link { flex: 1; padding: 14px; border-radius: var(--radius); display: flex; align-items: center; gap: 10px; cursor: pointer; transition: opacity 0.2s; }
  .about-link:hover { opacity: 0.85; }
  .about-link-name { font-size: 13px; font-weight: 600; color: white; }
  .about-link-sub { font-size: 10.5px; color: rgba(255,255,255,0.45); }

  /* BOTTOM NAV */
  .bottom-bar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 440px; background: rgba(249,246,241,0.95); backdrop-filter: blur(20px); border-top: 1px solid rgba(20,20,20,0.07); display: flex; padding: 10px 12px 22px; gap: 4px; z-index: 100; }
  .bottom-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 4px; border: none; background: transparent; border-radius: 10px; cursor: pointer; font-family: 'Outfit', sans-serif; transition: background 0.18s; position: relative; }
  .bottom-btn:hover { background: var(--warm); }
  .bottom-btn.active { background: var(--warm); }
  .bottom-btn-icon { font-size: 19px; }
  .bottom-btn-label { font-size: 9.5px; font-weight: 500; color: var(--muted); }
  .bottom-btn.active .bottom-btn-label { color: var(--kind-green); font-weight: 600; }
  .sub-indicator { position: absolute; top: 6px; right: 10px; width: 7px; height: 7px; background: var(--kind-green); border-radius: 50%; border: 1.5px solid var(--paper); }

  .fade-up { animation: slideUp 0.45s ease forwards; }
`;

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function Kind() {
  const [tab, setTab] = useState("brief");
  const [toneFilter, setToneFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [wellnessIdx, setWellnessIdx] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiText, setAiText] = useState("");
  const [visibleNews, setVisibleNews] = useState(ALL_NEWS);
  const [extraPool, setExtraPool] = useState(EXTRA_NEWS_POOL);
  const [loadingMore, setLoadingMore] = useState(false);
  const [subPortals, setSubPortals] = useState([]);
  const [subTopics, setSubTopics] = useState([]);
  const [subSaved, setSubSaved] = useState(false);
  const [showSub, setShowSub] = useState(false);

  const today = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
  const dayOfWeek = new Date().getDay();
  const brief = BRIEF_VARIANTS[dayOfWeek];

  // Pick 5 brief items mixing hard/positive (same daily variation)
  const briefItems = [
    BRIEF_ITEMS_POOL[(dayOfWeek) % BRIEF_ITEMS_POOL.length],
    BRIEF_ITEMS_POOL[(dayOfWeek + 2) % BRIEF_ITEMS_POOL.length],
    BRIEF_ITEMS_POOL[(dayOfWeek + 4) % BRIEF_ITEMS_POOL.length],
    BRIEF_ITEMS_POOL[(dayOfWeek + 6) % BRIEF_ITEMS_POOL.length],
    BRIEF_ITEMS_POOL[(dayOfWeek + 8) % BRIEF_ITEMS_POOL.length],
  ];

  useEffect(() => {
    const t = setInterval(() => setWellnessIdx(i => (i + 1) % WELLNESS.length), 28000);
    return () => clearInterval(t);
  }, []);

  const loadAI = useCallback(async () => {
    setAiLoading(true);
    setAiText("");
    try {
      const headlines = ALL_NEWS.slice(0, 6).map(n =>
        `[${n.tone === "hard" ? "DIFÍCIL" : "POSITIVA"}] ${n.title}`
      ).join("\n");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Sos el editor de Kind, un portal de noticias que cubre todo —lo bueno y lo difícil— pero sin sensacionalismo ni angustia innecesaria. Tu voz es honesta, cercana e inteligente. No edulcorás la realidad, pero tampoco la dramatizás. Con estas noticias del día (marcadas como difíciles o positivas), escribí un párrafo editorial breve (3-4 oraciones) que conecte los temas con contexto real. Reconocé lo que está mal sin alarmar, y lo que avanza sin exagerar.\n\nNoticias:\n${headlines}\n\nPárrafo editorial:`
          }]
        })
      });
      const data = await res.json();
      setAiText(data.content?.map(b => b.text || "").join("") || "No se pudo generar el editorial.");
    } catch {
      setAiText("No se pudo cargar el editorial. Revisá tu conexión.");
    }
    setAiLoading(false);
  }, []);

  useEffect(() => { if (tab === "feed") loadAI(); }, [tab]);

  const handleLoadMore = () => {
    if (extraPool.length === 0) return;
    setLoadingMore(true);
    setTimeout(() => {
      const next = extraPool.slice(0, 3);
      setVisibleNews(prev => [...prev, ...next]);
      setExtraPool(prev => prev.slice(3));
      setLoadingMore(false);
    }, 800);
  };

  const tip = WELLNESS[wellnessIdx];

  const filtered = visibleNews.filter(n => {
    if (toneFilter === "all") return true;
    if (toneFilter === "positive") return n.tone === "positive";
    if (toneFilter === "hard") return n.tone === "hard";
    return true;
  });

  const toneLabel = (tone) => tone === "positive" ? "✦ Positiva" : "● Importante";
  const toneClass = (tone) => tone === "positive" ? "tone-positive" : "tone-hard";

  const togglePortal = (p) => setSubPortals(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleTopic = (t) => setSubTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSaveSub = () => { setSubSaved(true); setShowSub(false); setTab("feed"); };

  // ── SUSCRIPCION SCREEN ────────────────────────────────────────────────────
  if (showSub) {
    return (
      <>
        <style>{css}</style>
        <div className="app">
          <div className="sub-screen fade-up">
            <div className="sub-hero">
              <button className="sub-back" onClick={() => setShowSub(false)}>← Volver</button>
              <div className="sub-hero-label">Personalizá tu Kind</div>
              <div className="sub-hero-title">Tu feed,<br /><em>a tu manera</em></div>
              <div className="sub-hero-sub">Elegí las fuentes y temas que más te interesan. Kind los va a priorizar en tu feed, aunque el portal cubrirá todas las noticias relevantes del día.</div>
            </div>

            <div className="sub-note">
              <span className="sub-note-icon">💡</span>
              <span className="sub-note-text">Esto no es un filtro: Kind seguirá mostrando noticias importantes aunque no sean de tus temas. Lo que cambia es el énfasis y el orden.</span>
            </div>

            <div className="sub-section">
              <div className="sub-section-title">Fuentes preferidas</div>
              <div className="sub-section-sub">Seleccioná las que más leés o confiás.</div>
              <div className="portals-grid">
                {ALL_PORTALS.map(p => (
                  <div key={p} className={`portal-card ${subPortals.includes(p) ? "selected" : ""}`} onClick={() => togglePortal(p)}>
                    <span className="portal-name">{p}</span>
                    <div className="portal-check">{subPortals.includes(p) ? "✓" : ""}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sub-section" style={{ paddingTop: 20 }}>
              <div className="sub-section-title">Temas de interés</div>
              <div className="sub-section-sub">Estos temas aparecerán más seguido en tu feed.</div>
              <div className="topics-grid">
                {ALL_TOPICS.map(t => (
                  <div key={t.id} className={`topic-pill ${subTopics.includes(t.id) ? "selected" : ""}`} onClick={() => toggleTopic(t.id)}>
                    <span>{t.icon}</span><span>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sub-cta">
              <button
                className="sub-cta-btn"
                disabled={subPortals.length === 0 && subTopics.length === 0}
                onClick={handleSaveSub}
              >
                Guardar preferencias ✦
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── MAIN APP ──────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="app">

        <nav className="nav">
          <div className="nav-top">
            <div className="nav-logo">
              <div className="logo-word">kind<span>.</span></div>
              <div className="logo-tagline">Informate bien · Hacé el mundo mejor</div>
            </div>
            <div className="nav-actions">
              <button className="nav-btn" onClick={() => setShowSub(true)} title="Personalizar">🎛️</button>
              <button className="nav-btn">🔔</button>
            </div>
          </div>
          <div className="nav-tabs">
            {[["brief","☀️ Brief"],["feed","📰 Feed"],["social","📱 Redes"],["about","✦ Nosotros"]].map(([id, label]) => (
              <button key={id} className={`nav-tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</button>
            ))}
          </div>
        </nav>

        <div className="content">

          {/* BRIEF */}
          {tab === "brief" && (
            <div className="fade-up">
              <div className="brief-hero">
                <div className="brief-meta">
                  <div className="brief-dot" />
                  <span className="brief-date">{today}</span>
                  <span className="brief-edition">Brief Matutino</span>
                </div>
                <div className="brief-title">"{brief.headline}"</div>
                <div className="brief-intro">{brief.intro}</div>
              </div>

              <div className="brief-items">
                {briefItems.map((item, i) => (
                  <div key={i} className="brief-item" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className={`brief-item-icon ${item.hard ? "hard" : "normal"}`}>{item.icon}</div>
                    <div>
                      <div className={`brief-item-tag ${item.hard ? "hard" : "normal"}`}>{item.tag}</div>
                      <div className="brief-item-text">{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="brief-closing">
                <span className="brief-closing-icon">✦</span>
                <span className="brief-closing-text">{brief.closing}</span>
              </div>

              <div style={{ padding: "0 20px 80px" }}>
                <div className="wellness-strip" onClick={() => setWellnessIdx(i => (i + 1) % WELLNESS.length)}>
                  <div className="wellness-icon">{tip.icon}</div>
                  <div>
                    <div className="wellness-label">Pausa Kind · {tip.title}</div>
                    <div className="wellness-msg">{tip.msg}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FEED */}
          {tab === "feed" && (
            <div className="fade-up">
              {subSaved && (subPortals.length > 0 || subTopics.length > 0) && (
                <div style={{ margin: "16px 20px 0", background: "var(--kind-green-pale)", borderRadius: "var(--radius)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>✦</span>
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--kind-green)" }}>
                      Feed personalizado activo
                    </span>
                  </div>
                  <button onClick={() => setShowSub(true)} style={{ background: "none", border: "none", fontSize: 11.5, color: "var(--kind-green)", fontWeight: 600, cursor: "pointer", fontFamily: "Outfit, sans-serif" }}>Editar →</button>
                </div>
              )}

              <div style={{ padding: "16px 20px 0" }}>
                <div className="wellness-strip" onClick={() => setWellnessIdx(i => (i + 1) % WELLNESS.length)}>
                  <div className="wellness-icon">{tip.icon}</div>
                  <div>
                    <div className="wellness-label">Pausa Kind · {tip.title}</div>
                    <div className="wellness-msg">{tip.msg}</div>
                  </div>
                </div>
              </div>

              <div className="ai-card">
                <div className="ai-label">
                  <div className="brief-dot" />
                  <span className="ai-label-text">Editorial del día</span>
                  <span className="ai-label-badge">IA + editor</span>
                </div>
                {aiLoading
                  ? <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="spinner" />
                      <span style={{ fontSize: 13, color: "var(--muted)" }}>Preparando el editorial...</span>
                    </div>
                  : <p className="ai-text">{aiText}</p>
                }
                {!aiLoading && (
                  <div className="ai-refresh" onClick={loadAI}>
                    <span style={{ fontSize: 13 }}>↻</span>
                    <span className="ai-refresh-text">Regenerar</span>
                  </div>
                )}
              </div>

              <div className="filter-row">
                {[["all","Todas"],["positive","✦ Positivas"],["hard","● Importantes"]].map(([val, label]) => (
                  <button key={val} className={`filter-chip ${toneFilter === val ? "active" : ""}`} onClick={() => setToneFilter(val)}>{label}</button>
                ))}
              </div>

              <div className="feed-section-label">{filtered.length} noticias</div>

              {filtered.map((n, i) => (
                <div
                  key={n.id}
                  className={`news-card ${n.tone === "hard" ? "hard-card" : ""}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => setExpanded(expanded === n.id ? null : n.id)}
                >
                  {n.photo && (
                    <div className="news-card-photo">
                      <img src={n.photo} alt={n.title} loading="lazy" onError={e => { e.target.style.display = "none"; }} />
                      <div className={`photo-tone-bar ${n.tone}`} />
                    </div>
                  )}
                  <div className="news-card-top">
                    <span className="news-source">{n.portal}</span>
                    <span className={`tone-pill ${toneClass(n.tone)}`}>{toneLabel(n.tone)}</span>
                  </div>
                  <div className="news-body">
                    <div className={`news-thumb ${n.tone === "hard" ? "hard-thumb" : ""}`}>
                      {n.photo
                        ? <img src={n.photo} alt="" onError={e => { e.target.style.display="none"; }} />
                        : n.img
                      }
                    </div>
                    <div>
                      <div className={`news-topic ${n.tone === "hard" ? "hard" : "positive"}`}>{n.topic}</div>
                      <div className="news-title">{n.title}</div>
                      {expanded === n.id && <div className="news-summary">{n.summary}</div>}
                    </div>
                  </div>
                  <div className="news-footer">
                    <span className="news-time">Hace {n.time}</span>
                    <span className="news-read">{n.read} min</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="news-expand">{expanded === n.id ? "Cerrar ↑" : "Ver más ↓"}</span>
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="news-link"
                        onClick={e => e.stopPropagation()}
                      >
                        Leer nota ↗
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {/* Load more */}
              <div className="load-more-trigger">
                {loadingMore
                  ? <div className="load-more-spinner"><div className="spinner" /><span>Cargando más noticias...</span></div>
                  : extraPool.length > 0
                    ? <button className="load-more-btn" onClick={handleLoadMore}>Cargar 3 noticias más ↓</button>
                    : <span style={{ fontSize: 12, color: "var(--faint)" }}>Ya viste todas las noticias del día</span>
                }
              </div>
              <div style={{ height: 80 }} />
            </div>
          )}

          {/* SOCIAL */}
          {tab === "social" && (
            <div className="fade-up">
              <div className="social-intro">
                <div className="social-intro-title">Kind en las redes</div>
                <div className="social-intro-sub">La misma voz en todos lados: honesta, cercana, sin alarmismo ni optimismo de fantasía.</div>
              </div>
              <div className="social-cards">
                <div className="social-card">
                  <div className="social-card-label"><div className="social-platform-dot" style={{ background: "#E1306C" }} />Instagram Story · Noticia importante</div>
                  <div className="social-preview" style={{ background: "linear-gradient(160deg, #2e1a1a 0%, #4a2d2d 50%, #3a1a1a 100%)", minHeight: 220 }}>
                    <div className="social-kind-logo" style={{ color: "#E88E8E" }}>kind.</div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#E88E8E", marginBottom: 8, opacity: 0.8 }}>Lo que hay que saber hoy</div>
                    <div className="social-body" style={{ color: "white", fontSize: 18 }}>40.000 desplazados en Brasil por inundaciones. Es el tercer evento extremo del año en la región.</div>
                    <div className="social-tag" style={{ color: "rgba(255,255,255,0.45)" }}>kindnews.com · Más contexto en el link</div>
                  </div>
                </div>
                <div className="social-card">
                  <div className="social-card-label"><div className="social-platform-dot" style={{ background: "#833AB4" }} />Instagram Post · Brief matutino</div>
                  <div className="social-preview" style={{ background: "linear-gradient(135deg, #0f1a2e 0%, #1a2e4a 100%)", minHeight: 210 }}>
                    <div className="social-kind-logo" style={{ color: "#6BB5E8" }}>kind.</div>
                    <div style={{ marginBottom: 8 }}><span style={{ background: "rgba(107,181,232,0.15)", color: "#6BB5E8", fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 100, letterSpacing: "0.1em", textTransform: "uppercase" }}>Brief Matutino ✦</span></div>
                    <div className="social-body" style={{ color: "white", fontSize: 17 }}>Hoy hay crisis, avances y todo lo que está en el medio. Te lo contamos sin drama.</div>
                    <div style={{ display: "flex", gap: 7, marginBottom: 12, flexWrap: "wrap" }}>
                      {[["🌊","Crisis"],["🧬","Ciencia"],["☀️","Ambiente"],["📚","Cultura"]].map(([ic, t]) => (
                        <span key={t} style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.07)", padding: "3px 8px", borderRadius: 6 }}>{ic} {t}</span>
                      ))}
                    </div>
                    <div className="social-tag" style={{ color: "rgba(255,255,255,0.35)" }}>kindnews.com</div>
                  </div>
                </div>
                <div className="social-card">
                  <div className="social-card-label"><div className="social-platform-dot" style={{ background: "#1DA1F2" }} />Post en X</div>
                  <div className="x-post-preview">
                    <div className="x-header">
                      <div className="x-avatar">K</div>
                      <div><div className="x-name">Kind News</div><div className="x-handle">@kindnews</div></div>
                    </div>
                    <div className="x-body">España genera el 58% de su energía con renovables. Con tres años de anticipación. Mientras tanto, Brasil enfrenta su tercer evento climático extremo del año. Las dos cosas son reales. 🌍</div>
                    <div className="x-tag">#Kind #Ambiente #Clima</div>
                    <div className="x-actions">
                      <span className="x-action">💬 38</span>
                      <span className="x-action">🔁 240</span>
                      <span className="x-action">❤️ 1.8K</span>
                      <span className="x-action">📊 22K</span>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ height: 80 }} />
            </div>
          )}

          {/* ABOUT */}
          {tab === "about" && (
            <div className="fade-up">
              <div className="about-hero">
                <div className="about-label">Quiénes somos</div>
                <div className="about-title">Noticias <em>reales</em>,<br />sin el loop de angustia</div>
                <div className="about-sub">Kind no filtra las malas noticias. Cubre todo lo importante, pero sin el sensacionalismo que te deja agotado. Hay una diferencia entre informar y asustar.</div>
              </div>
              <div className="about-body">
                <div className="about-card">
                  <div className="about-card-icon">☀️</div>
                  <div className="about-card-title">Brief matutino honesto</div>
                  <div className="about-card-text">Cada mañana, lo más importante del día. Lo bueno y lo difícil, con contexto. Sin titular alarmista, sin omitir lo que incomoda.</div>
                </div>
                <div className="about-card">
                  <div className="about-card-icon">📰</div>
                  <div className="about-card-title">Feed con balance real</div>
                  <div className="about-card-text">Las noticias difíciles están, etiquetadas y con contexto. Las positivas también, sin exagerarlas. El lector elige cómo y cuánto consumir.</div>
                </div>
                <div className="about-card">
                  <div className="about-card-icon">🎛️</div>
                  <div className="about-card-title">Feed personalizable</div>
                  <div className="about-card-text">Podés indicar tus fuentes y temas favoritos para que Kind los priorice. No es un filtro: el portal sigue cubriendo todo, pero con énfasis en lo que te importa.</div>
                </div>
                <div className="about-card">
                  <div className="about-card-icon">🤖</div>
                  <div className="about-card-title">IA con criterio editorial</div>
                  <div className="about-card-text">Usamos IA para sintetizar y contextualizar, con una voz definida: ni catastrofista ni naïf. Siempre con supervisión humana.</div>
                </div>
                <div className="about-card">
                  <div className="about-card-icon">🌿</div>
                  <div className="about-card-title">Pausas de bienestar</div>
                  <div className="about-card-text">Leer noticias puede ser intenso. Kind incluye recordatorios para que cuides tu cabeza y tu cuerpo mientras te informás.</div>
                </div>
                <div className="about-manifesto">
                  <div className="about-manifesto-title">"Informate bien.<br />Hacé el mundo mejor."</div>
                  <div className="about-manifesto-sub">No creemos que ignorar los problemas ayude. Creemos que entenderlos bien, sin drama, es lo que permite actuar.</div>
                </div>
              </div>
              <div className="about-links">
                <div className="about-link" style={{ background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)" }}>
                  <span style={{ fontSize: 18 }}>📸</span>
                  <div><div className="about-link-name">Instagram</div><div className="about-link-sub">@kindnews</div></div>
                </div>
                <div className="about-link" style={{ background: "#0a0a0a" }}>
                  <span style={{ fontSize: 18 }}>𝕏</span>
                  <div><div className="about-link-name">X / Twitter</div><div className="about-link-sub">@kindnews</div></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bottom-bar">
          {[["brief","☀️","Brief"],["feed","📰","Feed"],["social","📱","Redes"],["about","✦","Nosotros"]].map(([id, icon, label]) => (
            <button key={id} className={`bottom-btn ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
              <span className="bottom-btn-icon">{icon}</span>
              <span className="bottom-btn-label">{label}</span>
            </button>
          ))}
          <button className={`bottom-btn ${showSub ? "active" : ""}`} onClick={() => setShowSub(true)}>
            <span className="bottom-btn-icon">🎛️</span>
            <span className="bottom-btn-label">Mi Feed</span>
            {subSaved && <div className="sub-indicator" />}
          </button>
        </div>
      </div>
    </>
  );
}
