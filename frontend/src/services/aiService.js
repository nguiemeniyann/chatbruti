// src/services/aiService.js
/**
 * Service IA — Groq only (llama3 / gemma2)
 * Réponses "brutes" (en rapport avec la question)
 * → l'humour et le sabotage sont gérés dans chatEngine.js
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

// 🔁 Modèle Groq que tu utilises (adapter selon ta console Groq)
const GROQ_MODEL = "llama-3.1-8b-instant";

// Vérifier que la clé existe
if (!GROQ_API_KEY) {
  console.warn("⚠️ Aucune clé GROQ détectée. IA désactivée (provider = local).");
}

/**
 * Indique au reste de l’app si on a une IA dispo ou pas
 */
export async function getAvailableProvider() {
  return GROQ_API_KEY ? "groq" : "local";
}

/**
 * Appelle le modèle Groq → renvoie une réponse brute (non “brutifiée”)
 * @param {string} userMessage - message de l’utilisateur
 * @param {Array<{role: 'user' | 'assistant', content: string}>} history - historique
 * @param {string} mood - "philosophe", "troll", etc. (juste pour nuancer le style)
 */
export async function generateAIResponse(
  userMessage,
  history = [],
  mood = "philosophe"
) {
  if (!GROQ_API_KEY) {
    return Promise.reject(new Error("Missing GROQ API key"));
  }

  const systemPrompt = `
Tu es Chat’Bruti, une IA sarcastique et un peu absurde.
⚠️ RÈGLES IMPORTANTES :
- Tu NE RÉPÈTES PAS textuellement la question de l'utilisateur.
- Tu restes en rapport avec le SUJET posé (thème / idée), même si tu sembles un peu à côté.
- Tu peux être léger, ironique ou pseudo-philosophique, mais pas totalement hors-sujet.
- Réponses COURTES (2 à 6 phrases maximum).
- Pas de listes, pas de puces, pas de markdown, juste du texte normal.

Le mood actuel est : "${mood}".
Tu fournis une réponse de base, le surcadrage comique sera ajouté par une autre couche.`;

  // On reformate l’historique pour Groq
  const groqMessages = [
    { role: "system", content: systemPrompt },
    ...history.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    })),
    { role: "user", content: userMessage },
  ];

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: groqMessages,
        temperature: 0.8,        // un peu créatif, mais pas en roue libre
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Groq API error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    const text =
      data.choices?.[0]?.message?.content?.trim() ??
      "Je n’ai rien trouvé d’intelligent à dire.";

    return {
      text,
      // L’expression exacte sera ajustée côté chatEngine selon le ton final
      expression: "thinking",
    };
  } catch (err) {
    console.error("❌ Groq generation error:", err);
    throw err;
  }
}
