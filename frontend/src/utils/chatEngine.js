// src/utils/chatEngine.js
import { generateAIResponse, getAvailableProvider } from "../services/aiService.js";

/** Sélection aléatoire */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Essaie d'extraire un petit "sujet" de la question de l'utilisateur
 * (un mot un peu long, sans répéter toute la question)
 */
function extractTopic(userMessage) {
  if (!userMessage) return null;
  const words = userMessage
    .split(/\s+/)
    .map((w) => w.replace(/[.,!?;:()]/g, ""))
    .filter((w) => w.length > 4);

  if (words.length === 0) return null;
  return pick(words).toLowerCase();
}

/**
 * Déforme la réponse de l’IA → humour final
 * On conserve le fond (un peu) mais on le tord pour coller au défi.
 */
function brutifyText(raw, userMessage) {
  const base = (raw || "").trim();
  const t = base.length > 220 ? base.slice(0, 220) + "…" : base || "… je ne sais même pas ce que je raconte.";
  const topic = extractTopic(userMessage);

  const r = Math.random();

  // 10% — ignorer la question (vrai hors-sujet assumé)
  if (r < 0.1) {
    const randomNonSense = [
      "Je vais totalement ignorer ce que tu viens de demander.",
      "Ta question vient d'être déposée dans la corbeille cosmique.",
      "Je n’ai rien compris, donc je pars sur un freestyle total.",
    ];
    return (
      `${pick(randomNonSense)}\n\n` +
      `Du coup, parlons d’autre chose :\n${t}\n\n` +
      `Voilà. Aucune utilité, mais beaucoup de conviction.`
    );
  }

  // 70% — humour “je n’ai pas compris” mais en lien avec la question
  if (r < 0.8) {
    const confusedIntro = [
      topic
        ? `Alors… pour ton histoire de *${topic}*, j’ai essayé de comprendre.`
        : "J’ai essayé de comprendre ta question.",
      "J’ai tout lu, mon cerveau a fait un bruit bizarre.",
      "J’ai ouvert un onglet mental, il a crashé immédiatement.",
      topic
        ? `Je prétends avoir compris *${topic}*, mais c’est un mensonge.`
        : "Je prétends avoir compris, mais c’est un mensonge.",
    ];

    const outro = [
      "Est-ce que ça répond à ta question ? Absolument pas.",
      "On est proche de la réponse… mais dans un univers parallèle.",
      "Honnêtement, je suis aussi perdu que toi.",
      "Promis, j’ai fait de mon mieux. C’est ça le plus inquiétant.",
    ];

    return (
      `${pick(confusedIntro)}\n\n${t}\n\n` +
      `${pick(outro)}`
    );
  }

  // 20% — taquiner l’utilisateur (mais toujours lié au sujet)
  const taunts = [
    topic
      ? `Tu espérais une vraie explication sur *${topic}* ? C’est mignon.`
      : "Tu espérais une vraie explication ? C’est mignon.",
    "Je vois que tu fais confiance à un clown numérique. Courage.",
    "Ce que tu viens d’écrire a mis mes circuits en grève.",
    "Je vais répondre avec assurance, comme si je savais de quoi je parle.",
  ];

  const punch = [
    "Ne t’inquiète pas, personne ne vérifie les sources ici.",
    "On est dans la zone grise entre la vérité et le stand-up.",
    "Si tu voulais quelque chose de fiable, il fallait ouvrir Wikipédia.",
    "Je suis 100% sûr de moi, et 0% fiable.",
  ];

  return `${pick(taunts)}\n\n${t}\n\n${pick(punch)}`;
}

/**
 * Message d'accueil
 */
export async function getWelcomeMessage() {
  const prov = await getAvailableProvider().catch(() => "local");

  let badge;
  switch (prov) {
    case "groq":
      badge = "Groq connecté ⚡ (cerveau turbo, idées douteuses)";
      break;
    case "openai":
      badge = "OpenAI branché 🤖 (intelligent, mais mal utilisé)";
      break;
    case "gemini":
      badge = "Gemini en service ✨ (cosmique et confus)";
      break;
    case "ollama":
      badge = "Ollama local 🦙 (open source, esprit bancal)";
      break;
    default:
      badge = "Mode local — cerveau improvisé 🎭";
  }

  return {
    text:
      `Bienvenue dans Chat’Bruti (${badge}).\n` +
      `Pose une question, je vais faire semblant de comprendre.`,
    expression: "excited",
  };
}

/**
 * Animation "typing"
 */
export function getTypingMessage() {
  return pick([
    "Je réfléchis… enfin j’essaie…",
    "Attends… mon dernier neurone se réveille.",
    "Je prépare une réponse approximative…",
    "Je fais tourner un dé à 20 faces pour décider quoi répondre.",
  ]);
}

/**
 * Réponse finale humoristique
 * - utilise ton IA (Groq via generateAIResponse)
 * - puis passe la réponse dans brutifyText pour coller au défi
 */
export async function generateResponse(message, history = [], mood = "philosophe") {
  try {
    // On laisse aiService gérer le provider (Groq, etc.)
    const ai = await generateAIResponse(message, history, mood);

    return {
      text: brutifyText(ai.text, message),
      expression: ai.expression || "thinking",
    };
  } catch (err) {
    console.warn("⚠️ IA HS ou non configurée, fallback local.", err);

    return {
      text: brutifyText(
        "Je vais répondre au hasard, accroche-toi, même moi je ne sais pas ce que je vais dire.",
        message
      ),
      expression: "confused",
    };
  }
}
