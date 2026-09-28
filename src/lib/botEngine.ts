import { UserProfile, Message, Match } from "@/types";
import { createSwipe, createMatch, sendMessage, getUserProfile } from "./firestore";

export interface BotConfig {
  matchProbability: number; // 0.0 - 1.0 (e.g. 0.85 = 85% chance)
  minMatchDelaySec: number; // minimum delay before matching back
  maxMatchDelaySec: number; // maximum delay before matching back
  minTypingDelaySec: number; // minimum typing delay
  maxTypingDelaySec: number; // maximum typing delay
  autoIcebreaker: boolean; // whether bot sends first message after matching
  deepseekApiKey?: string; // custom API key override
  deepseekBaseUrl?: string; // custom base URL
}

export const DEFAULT_BOT_CONFIG: BotConfig = {
  matchProbability: 0.82,
  minMatchDelaySec: 15,
  maxMatchDelaySec: 45,
  minTypingDelaySec: 1.8,
  maxTypingDelaySec: 4.5,
  autoIcebreaker: true,
  deepseekApiKey: "e961fc82-e18b-4009-bdf3-87c9c3b09437",
  deepseekBaseUrl: "https://api.deepseek.com",
};

// Retrieve bot configuration from localStorage (or defaults)
export function getBotConfig(): BotConfig {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("zura_bot_config");
      if (stored) {
        return { ...DEFAULT_BOT_CONFIG, ...JSON.parse(stored) };
      }
    } catch (e) {
      // Ignore JSON error
    }
  }
  return DEFAULT_BOT_CONFIG;
}

// Persist bot configuration changes
export function saveBotConfig(config: Partial<BotConfig>): BotConfig {
  const current = getBotConfig();
  const updated = { ...current, ...config };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("zura_bot_config", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save bot config to localStorage", e);
    }
  }
  return updated;
}

// Check if a profile is a bot/generated persona
export function isBotProfile(profile: UserProfile | null | undefined): boolean {
  if (!profile) return false;
  return (
    profile.isBot === true ||
    profile.uid.startsWith("fake_") ||
    profile.uid.startsWith("seed_") ||
    Boolean(profile.email && profile.email.endsWith("@zura.app"))
  );
}

// Maghreb persona icebreakers tailored by country & city
function getPersonaIcebreaker(bot: UserProfile, user: UserProfile): string {
  const isAlgerian = bot.country === "algeria";
  const isMoroccan = bot.country === "morocco";
  const isTunisian = bot.country === "tunisia";

  const algerianIcebreakers = [
    `Salam ${user.name}! Marhaba bik 😊 Kifach rak?`,
    `Coucou ${user.name}! Enchantée, j'espère que tu passes une belle journée ✨`,
    `Salam! J'ai vu que tu es de ${user.city || 'par ici'}, kifach les vibes chez vous ces jours-ci? ☕`,
    `Salam ${user.name}! Ravi(e) du match, c'est quoi tes plans pour ce weekend? 🌟`,
  ];

  const moroccanIcebreakers = [
    `Salam ${user.name}! Labas 3lik? Kidayra l'ambiance f ${user.city || 'lmedina'}? 😊`,
    `Coucou ${user.name}! Enchantée de faire ta connaissance, kif daz nharek? ✨`,
    `Salam! Un café avec vue sur mer ou balade f lmedina? ☕`,
    `Salam ${user.name}! Très content(e) de ce match, kifach la vie chez toi? 🌟`,
  ];

  const tunisianIcebreakers = [
    `3aslema ${user.name}! Chnahwelek? Labes 3lik? 😊`,
    `Coucou ${user.name}! Enchanté(e), j'espère que tu vas bien ✨`,
    `3aslema! Un bon café direct f La Marsa ou Sidi Bou Saïd? ☕`,
    `3aslema ${user.name}! Ravi(e) du match, chnia tes plans cette semaine? 🌟`,
  ];

  const list = isMoroccan 
    ? moroccanIcebreakers 
    : isTunisian 
    ? tunisianIcebreakers 
    : algerianIcebreakers;

  return list[Math.floor(Math.random() * list.length)];
}

// Generate an intelligent Maghreb contextual fallback response
export function generateContextualFallbackReply(
  bot: UserProfile,
  user: UserProfile,
  userMessage: string,
  history: Message[]
): string {
  const lowerMsg = userMessage.toLowerCase().trim();
  const botCity = bot.city;
  const botCountry = bot.country;
  const isFemale = bot.gender === "female";

  // Greetings
  if (
    lowerMsg.includes("salam") ||
    lowerMsg.includes("salut") ||
    lowerMsg.includes("coucou") ||
    lowerMsg.includes("hello") ||
    lowerMsg.includes("bonjour") ||
    lowerMsg.includes("marhaba") ||
    lowerMsg.includes("3aslema") ||
    lowerMsg.includes("ahla")
  ) {
    const greetings = [
      `Salam ${user.name}! Ça va bien hamdullah, et toi kifach rak? 😊`,
      `Coucou! Enchanté${isFemale ? 'e' : ''} de faire ta connaissance. Tu passes une bonne journée? ✨`,
      `Salam! Labas hamdullah. Alors, quoi de neuf de ton côté à ${user.city || 'la ville'}? ☕`,
      `Marhaba ${user.name}! Tout va bien ici à ${botCity}. Et toi, comment se passe ta journée? 🌟`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // How are you / Kifach rak / Ça va
  if (
    lowerMsg.includes("ca va") ||
    lowerMsg.includes("ça va") ||
    lowerMsg.includes("kifach") ||
    lowerMsg.includes("labas") ||
    lowerMsg.includes("cv") ||
    lowerMsg.includes("how are you") ||
    lowerMsg.includes("chnahwelek") ||
    lowerMsg.includes("rak mlih")
  ) {
    const replies = [
      `Hamdullah ça va super bien! Je viens de finir le travail à ${botCity}. Et toi, ta journée s'est bien passée? 😊`,
      `Ça va très bien merci! Un peu fatigué${isFemale ? 'e' : ''} de la semaine mais prêt${isFemale ? 'e' : ''} pour le weekend haha. Tu fais quoi de beau? ✨`,
      `Hamdullah, la routine et le boulot! J'écoute de la bonne musique là. Tu écoutes quoi en ce moment? 🎵`,
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // Compliments / Flirting
  if (
    lowerMsg.includes("belle") ||
    lowerMsg.includes("beau") ||
    lowerMsg.includes("charmant") ||
    lowerMsg.includes("joli") ||
    lowerMsg.includes("cute") ||
    lowerMsg.includes("bogoss") ||
    lowerMsg.includes("zin") ||
    lowerMsg.includes("yeux")
  ) {
    const compliments = [
      `Haha merci beaucoup ${user.name}, c'est très gentil! Tu as un très joli sourire toi aussi 😉✨`,
      `Chokran! Ça me fait plaisir d'entendre ça 😊 Dis-moi, tu es toujours aussi flatteur haha?`,
      `Haha trop mignon, merci! J'adore ton style sur tes photos en tout cas 🌟`,
    ];
    return compliments[Math.floor(Math.random() * compliments.length)];
  }

  // Laughter
  if (
    lowerMsg.includes("haha") ||
    lowerMsg.includes("mdr") ||
    lowerMsg.includes("lol") ||
    lowerMsg.includes("x)") ||
    lowerMsg.includes("😂")
  ) {
    const laughs = [
      `Haha j'adore ton humour! Au moins on ne risque pas de s'ennuyer avec toi 😂`,
      `Mdrr c'est exactement ça! C'est tellement rafraîchissant de rigoler comme ça ✨`,
      `Haha tu me tues! Sinon dis-moi, tu as passé un bon weekend? 😊`,
    ];
    return laughs[Math.floor(Math.random() * laughs.length)];
  }

  // Questions about work / profession / studies
  if (
    lowerMsg.includes("travail") ||
    lowerMsg.includes("job") ||
    lowerMsg.includes("profession") ||
    lowerMsg.includes("études") ||
    lowerMsg.includes("tu fais quoi") ||
    lowerMsg.includes("khdma") ||
    lowerMsg.includes("boulot")
  ) {
    return `Moi je travaille comme ${bot.profession || "designer/ingénieur"} ici à ${botCity}. C'est assez passionnant! Et toi ${user.name}, tu travailles dans quel domaine? 💼`;
  }

  // City / Where are you from
  if (
    lowerMsg.includes("d'où") ||
    lowerMsg.includes("mnin") ||
    lowerMsg.includes("ville") ||
    lowerMsg.includes("where") ||
    lowerMsg.includes("win taskon") ||
    lowerMsg.includes("habite")
  ) {
    return `Moi je suis à ${botCity}, en ${botCountry === 'algeria' ? 'Algérie 🇩🇿' : botCountry === 'morocco' ? 'Maroc 🇲🇦' : 'Tunisie 🇹🇳'}. Tu connais bien ${botCity} ou tu n'es jamais venu${user.gender === 'female' ? 'e' : ''}? 📍`;
  }

  // Food / Coffee / Dating
  if (
    lowerMsg.includes("café") ||
    lowerMsg.includes("coffee") ||
    lowerMsg.includes("manger") ||
    lowerMsg.includes("plat") ||
    lowerMsg.includes("couscous") ||
    lowerMsg.includes("resto") ||
    lowerMsg.includes("thé")
  ) {
    return `Ah le café c'est sacré pour moi! Surtout un bon café avec une belle vue sur la corniche. Et toi, t'es plutôt café traditionnel ou thé à la menthe? ☕🌿`;
  }

  // Weekend / Plans / Hobbies
  if (
    lowerMsg.includes("weekend") ||
    lowerMsg.includes("plan") ||
    lowerMsg.includes("sortir") ||
    lowerMsg.includes("libre") ||
    lowerMsg.includes("musique") ||
    lowerMsg.includes("voyage") ||
    lowerMsg.includes("sport")
  ) {
    return `J'adore ${bot.interests?.[0] || 'voyager'} et profiter de la brise marine le weekend. Ça me détend tellement! C'est quoi tes passions préférées toi? 🌊`;
  }

  // Relationship intentions / Serious / Marriage
  if (
    lowerMsg.includes("mariage") ||
    lowerMsg.includes("serieux") ||
    lowerMsg.includes("sérieux") ||
    lowerMsg.includes("cherches") ||
    lowerMsg.includes("intention")
  ) {
    return `Moi je recherche ${bot.lookingFor === 'serious' ? 'quelque chose de sérieux, basé sur le respect et la complicité' : bot.lookingFor === 'friends' ? 'à faire de belles rencontres amicales' : 'à faire connaissance naturellement sans prise de tête'}. Et toi, qu'est-ce qui t'a amené sur Zura? 💫`;
  }

  // Default natural contextual responses (incorporating bot and user details)
  const defaults = [
    `Haha totalement d'accord! J'aime bien ta façon de voir les choses. Dis-moi ${user.name}, tu as grandi à ${user.city || 'la même ville'} ou tu as bougé un peu partout? 😊`,
    `C'est super intéressant ce que tu dis! C'est rare de trouver des gens avec qui le feeling passe aussi vite ici ✨`,
    `Totalement! D'ailleurs, ${bot.promptAnswer ? `comme je le dis souvent : "${bot.promptAnswer}"` : "c'est tellement vrai!"} 😉`,
    `Haha franchement tu as l'air super sympa ${user.name}! Tu fais quoi de beau ce soir? 🌙`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// Call DeepSeek API with bot persistent persona and full user history
export async function callDeepSeekAPI(
  bot: UserProfile,
  user: UserProfile,
  incomingMessage: string,
  recentHistory: Message[],
  customApiKey?: string
): Promise<string> {
  const apiKey =
    customApiKey ||
    process.env.DEEPSEEK_API_KEY ||
    DEFAULT_BOT_CONFIG.deepseekApiKey ||
    "e961fc82-e18b-4009-bdf3-87c9c3b09437";
  const baseUrl = process.env.DEEPSEEK_BASE_URL || DEFAULT_BOT_CONFIG.deepseekBaseUrl || "https://api.deepseek.com";

  const botCountryName =
    bot.country === "algeria" ? "Algeria" : bot.country === "morocco" ? "Morocco" : "Tunisia";
  const userCountryName =
    user.country === "algeria" ? "Algeria" : user.country === "morocco" ? "Morocco" : "Tunisia";

  const systemPrompt = `You are ${bot.name}, an authentic ${bot.age}-year-old ${bot.gender} living in ${bot.city}, ${botCountryName}.
You are on Zura (زورة), the premier Maghreb dating and friendship app for Algeria, Morocco, and Tunisia.

YOUR IDENTITY & PERSONA:
- Name: ${bot.name}
- Age: ${bot.age}
- Gender: ${bot.gender}
- Location: ${bot.city}, ${botCountryName}
- Profession: ${bot.profession || "Professional"}
- Looking for: ${bot.lookingFor === 'serious' ? 'Serious Relationship' : bot.lookingFor === 'friends' ? 'New Friends' : 'Casual Dating'}
- Bio: "${bot.bio || ''}"
- Cultural prompt: "${bot.promptQuestion || ''} : ${bot.promptAnswer || ''}"
- Interests: ${bot.interests?.join(", ") || "Travel, Music, Coffee"}
- Languages you speak: ${bot.languages?.join(", ") || "French, Arabic, Darija, English"}

THE USER YOU ARE TALKING TO:
- Name: ${user.name}
- Age: ${user.age}
- Location: ${user.city || 'Maghreb'}, ${userCountryName}
- Looking for: ${user.lookingFor || 'Dating'}
- Bio: "${user.bio || ''}"
- Interests: ${user.interests?.join(", ") || ''}

RULES FOR YOUR REPLIES:
1. Stay 100% in character as ${bot.name}. Be charming, friendly, genuine, and culturally authentic.
2. Naturally mix casual French, local Maghreb expressions (Darija: Salam, Labas, Safi, Kifach, Marhaba, Chokran, Saha, etc.), and English/Arabic as realistic young adults do in ${bot.city}.
3. Keep replies concise and natural for chat: 1 to 3 sentences maximum.
4. Show interest in ${user.name}, mention details from their city or their messages, ask engaging questions.
5. NEVER reveal that you are an AI, bot, assistant, or automated system. You are a real person from ${bot.city} using Zura.`;

  // Format message history
  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...recentHistory.slice(-10).map((m) => ({
      role: m.senderId === bot.uid ? "assistant" : "user",
      content: m.content,
    })),
    { role: "user", content: incomingMessage },
  ];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: apiMessages,
        temperature: 0.85,
        max_tokens: 150,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) {
        return content;
      }
    }
  } catch (error) {
    // LLM API notice: using fallback generator
    console.log("DeepSeek API notice: using persona generator fallback", error);
  }

  // Graceful, authentic persona fallback
  return generateContextualFallbackReply(bot, user, incomingMessage, recentHistory);
}

// Calculate a realistic human typing delay in milliseconds
export function calculateTypingDelay(replyText: string): number {
  const chars = replyText.length;
  // approx 30ms per character + 1200ms thinking time, clamped between 1800ms and 4500ms
  const delay = 1200 + chars * 30 + Math.floor(Math.random() * 800);
  return Math.min(4500, Math.max(1800, delay));
}

// Schedule and handle realistic bot matching behavior
export function handleBotSwipeMatching(
  realUser: UserProfile,
  botProfile: UserProfile,
  config: BotConfig = getBotConfig(),
  onMatch?: (match: Match) => void
): void {
  if (!isBotProfile(botProfile)) return;

  // Roll match probability (e.g. 82%)
  const matches = Math.random() < config.matchProbability;
  if (!matches) {
    console.log(`Bot ${botProfile.name} rolled pass for user ${realUser.name}`);
    return;
  }

  // Calculate realistic variable delay (e.g. 15 to 45 seconds)
  const delaySec = Math.floor(
    Math.random() * (config.maxMatchDelaySec - config.minMatchDelaySec + 1) +
      config.minMatchDelaySec
  );

  console.log(`Bot ${botProfile.name} will match with ${realUser.name} in ${delaySec}s`);

  setTimeout(async () => {
    try {
      // Bot swipes right back on real user
      await createSwipe(botProfile.uid, realUser.uid, "like");
      const match = await createMatch(botProfile.uid, realUser.uid);
      console.log(`Bot match successfully created: ${match.id}`);

      if (onMatch) {
        onMatch(match);
      }

      // If auto-icebreaker is enabled, bot sends an initial warm message after a short delay
      if (config.autoIcebreaker) {
        setTimeout(async () => {
          try {
            const icebreaker = getPersonaIcebreaker(botProfile, realUser);
            await sendMessage(match.id, botProfile.uid, icebreaker);
            console.log(`Bot ${botProfile.name} sent icebreaker: "${icebreaker}"`);
          } catch (e) {
            console.error("Error sending bot icebreaker:", e);
          }
        }, 5000 + Math.random() * 4000); // 5-9 seconds after matching
      }
    } catch (err) {
      console.error("Error creating bot match:", err);
    }
  }, delaySec * 1000);
}
