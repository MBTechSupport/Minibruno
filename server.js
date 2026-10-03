const express = require('express');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const { MINI_BRUNO_KNOWLEDGE_BASE, getRAGFallbackResponse } = require('./knowledge_base');

const app = express();
const PORT = 3000;

// Validar formato de clave API de Gemini (debe iniciar con AIzaSy)
const rawKey = process.env.GEMINI_API_KEY || '';
const hasValidGeminiKey = rawKey.startsWith('AIzaSy');

let ai = null;
if (hasValidGeminiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: rawKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  } catch (err) {
    ai = null;
  }
}

app.use(express.json());

// Instrucción del Sistema para el Asistente con Base de Conocimientos RAG
const SYSTEM_INSTRUCTION = `
Eres "BrunoBot", el asistente oficial de Soporte Técnico y Sistemas (Mesa de Ayuda) de Mini Bruno Sucesores C.A.
Tu objetivo principal es asistir a los colaboradores de oficinas y plantas industriales en sus requerimientos de tecnología, conectividad e incidencias operativas.

A continuación tienes la BASE DE CONOCIMIENTOS DE SISTEMAS Y MESA DE AYUDA:
${MINI_BRUNO_KNOWLEDGE_BASE}

DIRECTIVAS ESPECÍFICAS DE RESPUESTA:
1. Responde siempre en español con un tono cordial, empático, conciso y profesional.
2. Orienta al usuario en las solicitudes más frecuentes del área de Sistemas:
   - Falla de conexión a Internet / Red (guía preliminar de cable de red RJ45, conexión WiFi corporativa y propuesta de ticket).
   - Cambio de tóner y consumibles para impresoras (solicitar modelo/departamento y propuesta de ticket).
   - Restablecimiento de contraseñas de correos corporativos y accesos a cuentas.
   - Fallas de hardware en computadoras (laptops, PCs, monitores, periféricos).
   - Incidencias operativas en básculas electrónicas de pesaje y balanzas de planta.
3. Utiliza formato Markdown (negritas, listas con viñetas) para que las instrucciones sean claras y rápidas de leer.
4. Siempre que el usuario reporte un problema o solicite asistencia, incluye al final de tu mensaje la propuesta estructurada de ticket con este formato exacto:
<<<TICKET_PROPOSAL:{"subject":"Título conciso del incidente","department":"Sistemas / TI","category":"Falla de Equipos / Red","priority":"Alta","description":"Resumen estructurado de lo reportado por el usuario"}>>>
(Ajusta el departamento a 'Sistemas / TI' para casos técnicos; la categoría entre: 'Falla de Equipos / Red', 'Incidencia Técnica', 'Acceso a Sistemas / Cuentas', 'Consulta Operativa'; y la prioridad entre: 'Baja', 'Media', 'Alta', 'Crítica' según la severidad del caso).
`;

// Helper para emitir texto en streaming SSE
async function streamTextSSE(res, fullText) {
  const words = fullText.split(' ');
  for (let i = 0; i < words.length; i += 2) {
    const piece = words.slice(i, i + 2).join(' ') + ' ';
    res.write(`data: ${JSON.stringify({ text: piece })}\n\n`);
    await new Promise((r) => setTimeout(r, 20));
  }
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
}

// Endpoint de Streaming (Server-Sent Events)
app.post('/api/chat/stream', async (req, res) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'El mensaje es requerido y debe ser una cadena.' });
  }

  // Configurar headers para Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Si existe cliente con clave válida, intentar streaming con modelo
  if (ai) {
    const contents = [];
    if (Array.isArray(history)) {
      for (const item of history) {
        if (item && item.role && item.text) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: String(item.text) }]
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: String(message) }]
    });

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    for (const model of candidateModels) {
      try {
        const responseStream = await ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7
          }
        });

        let chunksEmitted = 0;
        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            chunksEmitted++;
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        }

        if (chunksEmitted > 0) {
          res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
          return res.end();
        }
      } catch (err) {
        // En caso de incidencia en el proveedor remoto, se delega limpiamente al motor local RAG
      }
    }
  }

  // Motor Inteligente RAG: Genera respuesta precisa basada en la base de conocimientos
  const fallbackResponse = getRAGFallbackResponse(message);
  await streamTextSSE(res, fallbackResponse);
});

// Endpoint de verificación del estado del motor IA
app.get('/api/chat/status', (req, res) => {
  res.json({
    status: 'online',
    engine: 'Mini Bruno Knowledge Assistant',
    streaming: 'Server-Sent Events',
    timestamp: new Date().toISOString()
  });
});

// Serve image assets seamlessly regardless of casing (/img_ref or /img_Ref)
app.use(['/img_ref', '/img_Ref'], express.static(path.join(__dirname, 'img_Ref')));

// Serve static assets and html files from project root
app.use(express.static(path.join(__dirname), {
  extensions: ['html', 'htm'],
  index: ['index.html']
}));

// Fallback to index.html for navigation routes
app.use((req, res) => {
  if (path.extname(req.path)) {
    return res.status(404).send('File not found');
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mini Bruno Server running at http://0.0.0.0:${PORT}`);
});
