import { generateAIResponse, getAvailableProvider } from "../services/aiService.js";

/** Sélection aléatoire */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Déforme la réponse de l’IA → humour final
 */
function brutifyText(raw) {
  const text = raw.trim();
  const t = text.length > 200 ? text.slice(0, 200) + "…" : text;

  const r = Math.random();

  // 10% — hors sujet absurde
  if (r < 0.1) {
    return (
      `Alors… rien à voir, mais j'ai pensé à ça :\n${t}\n\n` +
      `Je sais. Moi aussi ça m'inquiète un peu.`
    );
  }

  // 70% — humour “je n’ai pas compris”
  if (r < 0.8) {
    const confused = [
      "J'ai tenté de comprendre… puis mon cerveau a crashé.",
      "Je crois que la logique m’a évité exprès.",
      "J’ai tout lu, mais mon âme a dit non.",
      "Je vais répondre, mais sache que je suis perdu.",
    ];

    return (
      `${pick(confused)}\n\n${t}\n\n` +
      `Voilà. J’ai fait de mon mieux (ce qui n’est pas beaucoup).`
    );
  }

  // 20% — taquiner l’utilisateur
  const taunts = [
    "Tu espérais une vraie réponse ? C’est adorable.",
    "Je vois que tu fais confiance à un clown numérique. Courage.",
    "Ce que tu viens d’écrire a mis mes circuits en grève.",
    "Promis, un jour je deviendrai intelligent. Pas aujourd’hui."
  ];

  return `${pick(taunts)}\n\n${t}`;
}

/**
 * Message d'accueil
 */
export async function getWelcomeMessage() {
  const prov = await getAvailableProvider();

  const badge =
    prov === "groq"
      ? "Groq connecté ⚡"
      : "Mode local — cerveau improvisé 🎭";

  return {
    text: `Bienvenue dans Chat’Bruti (${badge}).\nPose une question. Je promets rien.`,
    expression: "excited"
  };
}

/**
 * Animation typing
 */
export function getTypingMessage() {
  return pick([
    "Je réfléchis… enfin j’essaie…",
    "Attends… mon dernier neurone se réveille.",
    "Je prépare une réponse approximative…",
  ]);
}

/**
 * Réponse finale humoristique
 */
export async function generateResponse(message, history = [], mood = "philosophe") {
  const provider = await getAvailableProvider();

  // IA Groq disponible
  if (provider === "groq") {
    try {
      const ai = await generateAIResponse(message, mood, history);

      return {
        text: brutifyText(ai.text),
        expression: ai.expression
      };
    } catch (err) {
      console.warn("⚠️ Groq HS, fallback local.");
    }
  }

  // Fallback local
  return {
    text: brutifyText("Je vais répondre au hasard, accroche-toi."),
    expression: "confused"
  };
}
