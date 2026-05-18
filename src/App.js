require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cron = require("node-cron");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ─── REGIONES ────────────────────────────────────────────────────────────────
const REGIONES = {
  argentina: { nombre: "Argentina", pais: "ar",  keywords: ["argentina", "buenos aires"] },
  mexico:    { nombre: "México",    pais: "mx",  keywords: ["méxico", "mexico", "ciudad de méxico"] },
  españa:    { nombre: "España",    pais: "es",  keywords: ["españa", "madrid", "barcelona"] },
  colombia:  { nombre: "Colombia",  pais: "co",  keywords: ["colombia", "bogotá"] },
  chile:     { nombre: "Chile",     pais: "cl",  keywords: ["chile", "santiago"] },
  latam:     { nombre: "América Latina", pais: null, keywords: ["latinoamérica", "latam", "sudamérica", "america latina"] },
};

const QUERIES_GLOBALES = [
  "inteligencia artificial tecnología",
  "cambio climático ambiente",
  "ciencia investigación",
  "salud medicina",
  "economía global",
];

const QUERIES_CLIMA = [
  "clima tormenta inundación",
  "ola de calor sequía",
  "fenómenos meteorológicos",
  "huracán ciclón temporal",
];

// ─── ESTADO ──────────────────────────────────────────────────────────────────
let state = {
  noticias: [],
  noticiasRegion: {},
  noticiasClima: {},
  brief: null,
  editorial: null,
  ultimaActualizacion: null,
};

// ─── FETCH HELPERS ───────────────────────────────────────────────────────────
async function fetchTopHeadlines(pais) {
  try {
    const res = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: { country: pais, language: "es", pageSize: 20, apiKey: process.env.NEWSAPI_KEY },
    });
    return res.data.articles || [];
  } catch (err) {
    console.error(`❌ top-headlines ${pais}:`, err.message);
    return [];
  }
}

async function fetchHeadlinesByQuery(query) {
  try {
    const res = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: { q: query, language: "es", pageSize: 15, apiKey: process.env.NEWSAPI_KEY },
    });
    return res.data.articles || [];
  } catch (err) {
    console.error(`❌ headlines query "${query}":`, err.message);
    return [];
  }
}

function deduplicar(articulos) {
  const vistos = new Set();
  return articulos.filter(a => {
    if (!a.title || !a.url || !a.urlToImage || !a.description) return false;
    if (a.title === "[Removed]") return false;
    if (vistos.has(a.title)) return false;
    vistos.add(a.title);
    return true;
  });
}

async function fetchTodasLasNoticias(regionKey) {
  const region = REGIONES[regionKey] || REGIONES.latam;
  console.log(`🔍 Buscando noticias región: ${regionKey}...`);

  let articulosRegion = [];

  if (region.pais) {
    articulosRegion = await fetchTopHeadlines(region.pais);
    console.log(`  📍 Top-headlines ${region.pais}: ${articulosRegion.length} artículos`);
  } else {
    const results = await Promise.all(
      ["latinoamérica", "América Latina", "LATAM"].map(q => fetchHeadlinesByQuery(q))
    );
    articulosRegion = results.flat();
  }

  const globalResults = await Promise.all(
    QUERIES_GLOBALES.map(q => fetchHeadlinesByQuery(q))
  );
  const articulosMundo = globalResults.flat();

  const regionDedup = deduplicar(articulosRegion);
  const mundoDedup  = deduplicar(articulosMundo);

  const combinados = [
    ...regionDedup.slice(0, 35),
    ...mundoDedup.slice(0, 15),
  ];

  const resultado = deduplicar(combinados).slice(0, 50);
  console.log(`  ✅ ${regionDedup.length} regionales + ${mundoDedup.length} mundiales → ${resultado.length} total`);
  return resultado;
}

async function fetchNoticiasClima(regionKey) {
  const region = REGIONES[regionKey] || REGIONES.latam;
  let articulos = [];

  if (region.pais) {
    const todos = await fetchTopHeadlines(region.pais);
    const climaKeywords = ["clima", "tormenta", "inundación", "lluvia", "sequía", "calor", "frío", "granizo", "huracán", "ciclón", "temporal", "nieve", "meteorológico"];
    articulos = todos.filter(a => {
      const texto = (a.title + " " + (a.description || "")).toLowerCase();
      return climaKeywords.some(kw => texto.includes(kw));
    });
  }

  const climaGlobal = await Promise.all(
    QUERIES_CLIMA.map(q => fetchHeadlinesByQuery(q))
  );
  articulos = [...articulos, ...climaGlobal.flat()];
  return deduplicar(articulos).slice(0, 12);
}

// ─── CLASIFICAR CON IA ───────────────────────────────────────────────────────
async function clasificarNoticia(titulo, descripcion) {
  try {
    const res = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        messages: [{
          role: "user",
          content: `Respondé SOLO con JSON válido sin markdown:
{"tono":"positive" o "hard","tema":"Mundo|Ciencia|Ambiente|Tecnología|Salud|Economía|Cultura|Sociedad|Clima","resumen":"máximo 20 palabras"}

Título: ${titulo}
Descripción: ${descripcion?.slice(0, 200)}`,
        }],
      },
      { headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" } }
    );
    const texto = res.data.content[0].text.trim().replace(/```json|```/g, "").trim();
    return JSON.parse(texto);
  } catch {
    return { tono: "neutral", tema: "Mundo", resumen: descripcion?.slice(0, 100) || "" };
  }
}

async function procesarArticulos(articulos, temaForzado = null) {
  const noticias = [];
  for (let i = 0; i < articulos.length; i++) {
    const a = articulos[i];
    const clasificacion = await clasificarNoticia(a.title, a.description);
    noticias.push({
      id: `${Date.now()}-${i}`,
      title: a.title,
      summary: clasificacion.resumen || a.description?.slice(0, 150),
      topic: temaForzado || clasificacion.tema || "Mundo",
      tone: clasificacion.tono || "neutral",
      portal: a.source?.name || "Fuente desconocida",
      url: a.url,
      photo: a.urlToImage,
      time: calcularTiempo(a.publishedAt),
      read: Math.ceil((a.content?.length || 500) / 1000) + 2,
      featured: i === 0,
    });
    await new Promise(r => setTimeout(r, 300));
  }
  return noticias;
}

// ─── BRIEF Y EDITORIAL ───────────────────────────────────────────────────────
async function generarBrief(noticias) {
  try {
    const titulos = noticias.slice(0, 8).map(n =>
      `[${n.tone === "hard" ? "DIFÍCIL" : "POSITIVA"}] ${n.title}`
    ).join("\n");
    const res = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{
          role: "user",
          content: `Sos el editor de Kind. JSON sin markdown:
{"headline":"frase corta impactante","intro":"2 oraciones cálidas","closing":"reflexión de una oración"}

Noticias:\n${titulos}`,
        }],
      },
      { headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" } }
    );
    return JSON.parse(res.data.content[0].text.trim().replace(/```json|```/g, ""));
  } catch {
    return { headline: "Lo que pasó hoy, sin filtros ni alarma", intro: "Buenos días.", closing: "Estar informado no significa estar angustiado." };
  }
}

async function generarEditorial(noticias) {
  try {
    const titulos = noticias.slice(0, 6).map(n =>
      `[${n.tone === "hard" ? "DIFÍCIL" : "POSITIVA"}] ${n.title}`
    ).join("\n");
    const res = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 250,
        messages: [{ role: "user", content: `Sos el editor de Kind. Párrafo editorial breve (3-4 oraciones), voz cercana, sin alarmar.\n\nNoticias:\n${titulos}\n\nEditorial:` }],
      },
      { headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" } }
    );
    return res.data.content[0].text.trim();
  } catch {
    return "No se pudo generar el editorial del día.";
  }
}

// ─── CICLO PRINCIPAL ─────────────────────────────────────────────────────────
async function actualizarContenido() {
  console.log("\n🔄 Actualizando Kind v3...");

  for (const regionKey of Object.keys(REGIONES)) {
    try {
      const articulos = await fetchTodasLasNoticias(regionKey);
      if (articulos.length > 0) {
        const noticias = await procesarArticulos(articulos.slice(0, 30));
        state.noticiasRegion[regionKey] = noticias;
        if (regionKey === "latam") {
          state.noticias  = noticias;
          state.brief     = await generarBrief(noticias);
          state.editorial = await generarEditorial(noticias);
        }
      } else {
        console.warn(`⚠️  Sin artículos para ${regionKey}`);
      }

      const articulosClima = await fetchNoticiasClima(regionKey);
      if (articulosClima.length > 0) {
        state.noticiasClima[regionKey] = await procesarArticulos(articulosClima.slice(0, 8), "Clima");
      }

      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.error(`❌ Error región ${regionKey}:`, err.message);
    }
  }

  state.ultimaActualizacion = new Date().toISOString();
  console.log(`✅ Listo — ${Object.keys(state.noticiasRegion).length} regiones cargadas`);
}

function calcularTiempo(publishedAt) {
  if (!publishedAt) return "hace un momento";
  const diff = Date.now() - new Date(publishedAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

// ─── RUTAS ───────────────────────────────────────────────────────────────────
app.get("/api/noticias", (req, res) => {
  const region = req.query.region || "latam";
  res.json({ noticias: state.noticiasRegion[region] || state.noticias, region, ultimaActualizacion: state.ultimaActualizacion });
});

app.get("/api/clima", (req, res) => {
  const region = req.query.region || "latam";
  res.json({ noticias: state.noticiasClima[region] || state.noticiasClima["latam"] || [], region });
});

app.get("/api/brief",     (req, res) => res.json(state.brief || { headline: "Cargando...", intro: "", closing: "" }));
app.get("/api/editorial", (req, res) => res.json({ editorial: state.editorial || "Cargando editorial..." }));

app.get("/api/todo", (req, res) => {
  const region = req.query.region || "latam";
  res.json({
    noticias:      state.noticiasRegion[region] || state.noticias,
    noticiasClima: state.noticiasClima[region]  || state.noticiasClima["latam"] || [],
    brief:         state.brief,
    editorial:     state.editorial,
    ultimaActualizacion: state.ultimaActualizacion,
    region,
  });
});

app.get("/api/regiones", (req, res) => {
  res.json(Object.entries(REGIONES).map(([id, r]) => ({ id, nombre: r.nombre })));
});

app.get("/", (req, res) => {
  res.json({
    status: "ok", version: "v3",
    noticias: state.noticias.length,
    regiones: Object.keys(state.noticiasRegion),
    regionesConClima: Object.keys(state.noticiasClima),
    ultimaActualizacion: state.ultimaActualizacion,
  });
});

// ─── CRON + ARRANQUE ─────────────────────────────────────────────────────────
cron.schedule("0 */2 * * *", actualizarContenido);

const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  console.log(`\n🟢 Kind Backend v3 en puerto ${PORT}`);
  await actualizarContenido();
});