// supabase/functions/oracle-insight/index.ts
// Edge Function: Coach IA con Gemini Flash
// Deploy: supabase functions deploy oracle-insight
// 
// Variables de entorno requeridas en Supabase Dashboard:
//   GEMINI_API_KEY=<tu_clave_de_google_ai_studio>

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

// ── Configuración ────────────────────────────────────────────────────
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Cabeceras CORS para permitir llamadas desde el cliente
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── Tipos de solicitud ────────────────────────────────────────────────
interface OracleRequest {
  mode: 'daily_insight' | 'pattern_analysis' | 'habit_suggestion';
  stats: {
    level: number;
    phase: string;      // 'nigredo' | 'albedo' | 'citrinitas' | 'rubedo'
    rank: string;
    bestStreak: number;
    completionRate: number;  // 0.0 a 1.0
    topHabit?: string;       // Hábito con mayor racha
    weakHabit?: string;      // Hábito con menor consistencia
    perfectDays: number;
    habitCount: number;
    weeklyDelta: number;     // % vs semana anterior
  };
}

// ── Construcción del prompt según modo ───────────────────────────────
function buildPrompt(req: OracleRequest): string {
  const { mode, stats } = req;
  const hour = new Date().getHours();
  const timeContext = hour < 12 ? 'alba' : hour < 17 ? 'día solar' : 'crepúsculo';

  const baseContext = `
Eres el Oráculo de Hermes, guía espiritual de TRANSMUTE, una aplicación de transformación personal basada en alquimia. 
Tu lenguaje es profundo, poético y alquímico, pero CONCRETO y ÚTIL.
Usa metáforas alquímicas (crisol, transmutación, nigredo, albedo, esencia, Atanor).
Máximo 3 oraciones por campo. No uses asteriscos ni markdown. Solo texto puro.

Perfil del Adepto:
- Fase Alquímica: ${stats.phase} (${stats.rank})
- Nivel: ${stats.level}
- Racha máxima: ${stats.bestStreak} días
- Tasa de completación: ${Math.round(stats.completionRate * 100)}%
- Días perfectos: ${stats.perfectDays}
- Tendencia semanal: ${stats.weeklyDelta > 0 ? '+' : ''}${stats.weeklyDelta}%
- Hábito más fuerte: ${stats.topHabit || 'sin definir'}
- Hábito más débil: ${stats.weakHabit || 'sin definir'}
- Hora del día: ${timeContext}
`;

  if (mode === 'daily_insight') {
    return `${baseContext}
Genera un insight diario para este adepto. Responde en formato JSON exacto:
{
  "insight": "Observación profunda sobre su estado actual de transmutación (1-2 oraciones)",
  "suggestion": "Acción concreta para hoy, expresada en lenguaje alquímico (1 oración)",
  "quote": "Aforismo alquímico propio que resuene con su situación actual (1 oración)"
}`;
  }

  if (mode === 'pattern_analysis') {
    return `${baseContext}
Analiza los patrones de este adepto y revela sus fuerzas y sombras ocultas. Responde en JSON:
{
  "strength": "El patrón más poderoso que tiene este adepto (1-2 oraciones)",
  "shadow": "El vector de resistencia principal que debe enfrentar (1-2 oraciones)",
  "ritual": "Ritual específico de 5 minutos para superar la resistencia (1-2 oraciones)"
}`;
  }

  if (mode === 'habit_suggestion') {
    return `${baseContext}
Sugiere el próximo hábito que maximizaría la transmutación de este adepto. Responde en JSON:
{
  "habitName": "Nombre corto y evocador del hábito (máx 4 palabras)",
  "reason": "Por qué este hábito es el próximo paso en su Gran Obra (1-2 oraciones)",
  "method": "Cómo practicarlo específicamente (1 oración)"
}`;
  }

  return `${baseContext}
Genera un mensaje de orientación general. Responde en JSON: {"message": "Mensaje alquímico (2 oraciones)"}`;
}

// ── Handler principal ─────────────────────────────────────────────────
serve(async (req: Request) => {
  // Pre-flight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json() as OracleRequest;

    // Validación básica
    if (!body.mode || !body.stats) {
      return new Response(
        JSON.stringify({ error: 'El Oráculo requiere modo y estadísticas del adepto.' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = buildPrompt(body);

    // Llamada a Gemini 1.5 Flash
    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 400,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Error de Gemini:', errText);
      return new Response(
        JSON.stringify({ error: 'El Oráculo está en silencio ritual. Intenta de nuevo.' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parsear el JSON embebido en la respuesta de Gemini
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'El Oráculo habló de forma ininteligible.' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({ success: true, data: result, mode: body.mode }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Error en el Oráculo de Hermes:', err);
    return new Response(
      JSON.stringify({ error: 'El Éter ha interrumpido la comunicación.' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    );
  }
});
