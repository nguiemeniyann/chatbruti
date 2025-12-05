/**
 * Service IA — Groq only (llama3 / gemma2)
 * Réponses rapides + humour géré dans chatEngine
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// 🔁 Mets ici le modèle Groq que tu veux utiliser (et qui est supporté)
const GROQ_MODEL = "llama-3.1-8b-instant"; // adapte si tu en choisis un autre dans la console Groq

// Vérifier que la clé existe
if (!GROQ_API_KEY) {
  console.warn("⚠️ Aucune clé GROQ détectée. IA désactivée.");
}

export async function getAvailableProvider() {
  return GROQ_API_KEY ? "groq" : "local";
}

/**
 * Appelle le modèle Groq → renvoie une réponse brute (non humoristique)
 */
export async function generateAIResponse(userMessage, mood = "philosophe", history = []) {
  if (!GROQ_API_KEY) {
    return Promise.reject(new Error("Missing GROQ API key"));
  }

  const systemPrompt = `
Tu es Chat’Bruti, une IA humoristique, absurde, confuse, et légèrement insolente.
Tu ne réponds JAMAIS de façon sérieuse et tu NE RÉPÈTES PAS la question.
Le mood actuel est : ${mood}.
Réponds de manière courte et naturelle, avec humour léger.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history.map(msg => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content
    })),
    { role: "user", content: userMessage }
  ];

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.9,
        max_tokens: 180
      })
    });

    if (!res.ok) {
      // On remonte un message plus lisible dans la console
      const errorText = await res.text();
      throw new Error(`Groq API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const text =
      data.choices?.[0]?.message?.content?.trim() ??
      "Erreur de génération.";

    return {
      text,
      expression: "thinking"
    };
  } catch (err) {
    console.error("❌ Groq generation error:", err);
    throw err;
  }
}
