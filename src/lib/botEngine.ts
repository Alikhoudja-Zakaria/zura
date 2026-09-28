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
  deepseekApiKey: "",
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

// Natural human icebreakers: casual texting, lowercase, no rigid punctuation or emoji spam
function getPersonaIcebreaker(bot: UserProfile, user: UserProfile): string {
  const isMoroccan = bot.country === "morocco";
  const isTunisian = bot.country === "tunisia";

  const algerianIcebreakers = [
    `salam ${user.name.toLowerCase()} cv ? marhaba bik`,
    `salut ${user.name.toLowerCase()}, j espere que ta journée s est bien passée`,
    `salam, j ai vu que t es de ${user.city ? user.city.toLowerCase() : 'par ici'}, cv les vibes là bas ces jours ci ?`,
    `salut ! content du match, t as prévu quoi de beau ce weekend ?`,
    `salam cv ? t as passé une bonne journée ?`,
  ];

  const moroccanIcebreakers = [
    `salam ${user.name.toLowerCase()} labas 3lik ? kidayra l ambiance f ${user.city ? user.city.toLowerCase() : 'lmedina'} ?`,
    `salut ${user.name.toLowerCase()}, enchanté ! kif daz nharek ?`,
    `salam ! un café vue sur mer ou balade f lmedina ?`,
    `salam ${user.name.toLowerCase()} cv ? bikhir ?`,
  ];

  const tunisianIcebreakers = [
    `3aslema ${user.name.toLowerCase()} chnahwelek ? labes 3lik ?`,
    `salut ${user.name.toLowerCase()}, enchanté ! cv ta journée ?`,
    `3aslema ! un bon café direct à la marsa ou sidi bou saïd ?`,
    `3aslema cv ? t as passé un bon weekend ?`,
  ];

  const list = isMoroccan 
    ? moroccanIcebreakers 
    : isTunisian 
    ? tunisianIcebreakers 
    : algerianIcebreakers;

  return list[Math.floor(Math.random() * list.length)];
}

// Normalize text: replace curly quotes, strip accents, collapse spaces
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u0060\u00B4]/g, "'")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents: é -> e, où -> ou, etc.
    .trim();
}

// Natural human contextual fallback responses: realistic young texting, relaxed punctuation, minimal emojis
export function generateContextualFallbackReply(
  bot: UserProfile,
  user: UserProfile,
  userMessage: string,
  history: Message[]
): string {
  const norm = normalizeText(userMessage);
  const botCity = bot.city || "Alger";
  const botCountry =
    bot.country === "algeria" ? "Algérie" : bot.country === "morocco" ? "Maroc" : "Tunisie";
  const isFemale = bot.gender === "female";

  // Check what was discussed recently in chat history for continuity
  const lastUserMessages = history
    .filter((m) => m.senderId === user.uid)
    .map((m) => normalizeText(m.content));
  const recentAskedLocation = lastUserMessages.some(
    (m) => m.includes("d'ou") || m.includes("d ou") || m.includes("viens") || m.includes("habite")
  );

  // 1. CONFUSION / MISUNDERSTANDING ("hein ??", "quoi ?", "??", "de quoi", "pardon", "comprends pas")
  const isConfusion =
    norm === "quoi" ||
    norm === "quoi ?" ||
    norm === "de quoi" ||
    norm === "de quoi ?" ||
    norm.includes("hein") ||
    norm.includes("??") ||
    norm.includes("comment ca") ||
    norm.includes("comprends pas") ||
    norm.includes("pas compris") ||
    norm.includes("j'ai pas compris") ||
    norm.includes("keske") ||
    norm === "?" ||
    (norm.startsWith("pardon") && norm.length < 15);

  if (isConfusion) {
    if (recentAskedLocation || norm.includes("viens") || norm.includes("ou")) {
      return `mdrr pardon j'étais pas attentive haha ! je te disais que je suis de ${botCity}, et toi tu viens d'où ?`;
    }
    const confusionReplies = [
      `mdrr pardon j'avais mal lu ton message haha ! tu me disais quoi ?`,
      `haha dsl j'ai buggé un instant ! dis moi, tu viens d'où toi ?`,
      `pardon j'étais pas concentrée deux secondes haha, tu disais ?`,
    ];
    return confusionReplies[Math.floor(Math.random() * confusionReplies.length)];
  }

  // 2. CITY / LOCATION QUESTIONS ("t d'où ?", "tu viens d'où ?", "habite où", "mnin", "taskon", etc.)
  // (CRITICAL: MUST RUN BEFORE GREETINGS so "Coucou t d'où ?" answers the question!)
  if (
    norm.includes("d'ou") ||
    norm.includes("d ou") ||
    norm.includes("tu viens") ||
    norm.includes("t d'ou") ||
    norm.includes("t d ou") ||
    norm.includes("t'es d'ou") ||
    norm.includes("habite") ||
    norm.includes("mnin") ||
    norm.includes("taskon") ||
    norm.includes("de quelle ville") ||
    norm.includes("tu es d'ou") ||
    norm.includes("quel coin") ||
    norm.includes("t'habites")
  ) {
    const cityReplies = [
      `moi je suis de ${botCity} ! et toi tu viens d'où ?`,
      `je suis sur ${botCity} en ${botCountry} ! tu connais ou t'es d'une autre ville ?`,
      `moi jsuis de ${botCity}, et toi t'es d'où ?`,
    ];
    return cityReplies[Math.floor(Math.random() * cityReplies.length)];
  }

  // 3. AGE QUESTIONS ("t'as quel âge ?", "quel age", etc.)
  if (
    norm.includes("quel age") ||
    norm.includes("t'as quel age") ||
    norm.includes("ton age") ||
    (norm.includes("ans") && (norm.includes("tu") || norm.includes("t'as")))
  ) {
    return `j'ai ${bot.age} ans ! et toi t'as quel âge ?`;
  }

  // 4. NAME QUESTIONS ("tu t'appelles comment ?", "ton prénom", etc.)
  if (
    norm.includes("ton prenom") ||
    norm.includes("ton nom") ||
    norm.includes("tu t'appelles") ||
    norm.includes("t'appelles comment") ||
    norm.includes("ton blaze") ||
    norm.includes("esmek")
  ) {
    return `moi c'est ${bot.name} ! et toi c'est quoi ton prénom ?`;
  }

  // 5. WORK / STUDIES / PROFESSION ("tu fais quoi dans la vie ?", "tu bosses", "taf", "études", etc.)
  if (
    norm.includes("travail") ||
    norm.includes("job") ||
    norm.includes("profession") ||
    norm.includes("etudes") ||
    norm.includes("dans la vie") ||
    norm.includes("khdma") ||
    norm.includes("boulot") ||
    norm.includes("taf") ||
    norm.includes("tu bosses")
  ) {
    return `moi jsuis dans le ${bot.profession ? bot.profession.toLowerCase() : "domaine"} sur ${botCity}. et toi tu fais quoi dans la vie ?`;
  }

  // 6. WHAT ARE YOU DOING NOW ("tu fais quoi ?", "tfk", "tu fais quoi ce soir", etc.)
  if (
    norm.includes("tu fais quoi") ||
    norm.includes("tfk") ||
    norm.includes("tu fais quoi de beau") ||
    norm.includes("ce soir") ||
    norm.includes("en ce moment")
  ) {
    return `là je me pose tranquillement en musique après ma journée, et toi tu fais quoi de beau ?`;
  }

  // 7. DATING INTENTIONS ("tu cherches quoi ?", "sérieux", "mariage", etc.)
  if (
    norm.includes("tu cherches") ||
    norm.includes("serieux") ||
    norm.includes("pourquoi t'es sur") ||
    norm.includes("mariage") ||
    norm.includes("tes intentions") ||
    norm.includes("tu veux quoi")
  ) {
    return `moi je cherche à faire de vraies belles rencontres sans prise de tête, apprendre à se connaître et voir le feeling. et toi t'es là pour quoi ?`;
  }

  // 8. LAUGHTER ("haha", "mdr", "jpp", "ptdr", etc.)
  if (
    norm.includes("haha") ||
    norm.includes("mdr") ||
    norm.includes("lol") ||
    norm.includes("jpp") ||
    norm.includes("ptdr") ||
    userMessage.includes("😂") ||
    userMessage.includes("😭")
  ) {
    const laughs = [
      `mdrrr j'avoue c'est trop vrai ! sinon t'as passé une bonne journée ?`,
      `haha t'as l'air d'avoir un bon humour en vrai, ça fait plaisir`,
      `mdrr tu me tues, t'as prévu quoi pour ce weekend ?`,
    ];
    return laughs[Math.floor(Math.random() * laughs.length)];
  }

  // 9. COMPLIMENTS ("belle", "jolie", "charmant", "mignonne", "cute", etc.)
  if (
    norm.includes("belle") ||
    norm.includes("beau") ||
    norm.includes("charmant") ||
    norm.includes("joli") ||
    norm.includes("cute") ||
    norm.includes("bogoss") ||
    norm.includes("zin") ||
    norm.includes("yeux") ||
    norm.includes("sourire") ||
    norm.includes("canon") ||
    norm.includes("mignonne")
  ) {
    const compliments = [
      `haha merci c'est gentil ! t'as l'air super sympa aussi`,
      `chokran haha ça fait plaisir, t'es toujours aussi flatteur ?`,
      `merci beaucoup, j'aime bien ton style sur tes photos en vrai`,
    ];
    return compliments[Math.floor(Math.random() * compliments.length)];
  }

  // 10. SOCIAL MEDIA / CONTACT ("insta", "snap", "numéro", "whatsapp", etc.)
  if (
    norm.includes("insta") ||
    norm.includes("snap") ||
    norm.includes("numero") ||
    norm.includes("whatsapp") ||
    norm.includes("num") ||
    norm.includes("tel")
  ) {
    return `on fait un peu plus connaissance ici d'abord haha, t'es pressé ! dis moi t'aimes faire quoi le weekend ?`;
  }

  // 11. MEETING UP ("on se voit", "boire un verre", "date", etc.)
  if (
    norm.includes("on se voit") ||
    norm.includes("boire un verre") ||
    norm.includes("se capter") ||
    norm.includes("date") ||
    norm.includes("se voir") ||
    norm.includes("rencontrer")
  ) {
    return `avec plaisir mais prenons le temps de papoter un peu ici d'abord ! t'aimes bien quel coin à ${botCity} ?`;
  }

  // 12. FOOD / COFFEE / DRINKS
  if (
    norm.includes("cafe") ||
    norm.includes("coffee") ||
    norm.includes("manger") ||
    norm.includes("plat") ||
    norm.includes("couscous") ||
    norm.includes("resto") ||
    norm.includes("the") ||
    norm.includes("boire")
  ) {
    return `ah le café c'est sacré haha, surtout en terrasse. t'es plutôt café ou thé à la menthe toi ?`;
  }

  // 13. WEEKEND / FREE TIME / HOBBIES
  if (
    norm.includes("weekend") ||
    norm.includes("vacances") ||
    norm.includes("sortir") ||
    norm.includes("musique") ||
    norm.includes("voyage") ||
    norm.includes("sport")
  ) {
    return `j'aime bien bouger et me balader au bord de la mer le weekend, ça détend tellement. c'est quoi tes bails préférés toi ?`;
  }

  // 14. HOW ARE YOU / CV
  if (
    norm.includes("ca va") ||
    norm.includes("kifach") ||
    norm.includes("labas") ||
    norm.includes("cv") ||
    norm.includes("how are you") ||
    norm.includes("chnahwelek") ||
    norm.includes("rak mlih")
  ) {
    const replies = [
      `hmdlh cv super bien, je viens de finir ma journée. et toi cv ?`,
      `cv trql merci ! un peu fatigué${isFemale ? 'e' : ''} de la semaine mais hmdlh haha, tu fais quoi de beau ?`,
      `hamdullah la routine et le boulot, là je me pose un peu en musique et toi ?`,
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // 15. GREETINGS (ONLY matches if no specific question was asked above!)
  if (
    norm.includes("salam") ||
    norm.includes("salut") ||
    norm.includes("coucou") ||
    norm.includes("hello") ||
    norm.includes("bonjour") ||
    norm.includes("marhaba") ||
    norm.includes("3aslema") ||
    norm.includes("ahla") ||
    norm.includes("wsh") ||
    norm.includes("wesh") ||
    norm.includes("cc")
  ) {
    const greetings = [
      `salut ${user.name.toLowerCase()} cv ? ta journée s'est bien passée ?`,
      `salam ! enchanté${isFemale ? 'e' : ''} de faire ta connaissance, quoi de neuf ?`,
      `coucou ! cv trql ?`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // 16. NATURAL CONVERSATION CONTINUERS (never generic agreement out of context)
  const naturalContinuers = [
    `haha et sinon, dis moi tu viens d'où toi ?`,
    `t'es plutôt branché sorties ou chill chez toi le weekend ?`,
    `dis moi c'est quoi tes passions préférées ?`,
    `t'as passé une bonne journée aujourd'hui ?`,
  ];
  return naturalContinuers[Math.floor(Math.random() * naturalContinuers.length)];
}

// Call DeepSeek API with human texting persona prompt and full user history
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
    "";
  const baseUrl = process.env.DEEPSEEK_BASE_URL || DEFAULT_BOT_CONFIG.deepseekBaseUrl || "https://api.deepseek.com";

  const botCountryName =
    bot.country === "algeria" ? "Algeria" : bot.country === "morocco" ? "Morocco" : "Tunisia";
  const userCountryName =
    user.country === "algeria" ? "Algeria" : user.country === "morocco" ? "Morocco" : "Tunisia";

  const systemPrompt = `You are ${bot.name}, an authentic ${bot.age}-year-old young adult living in ${bot.city}, ${botCountryName}.
You are on Zura (زورة), chatting with ${user.name} on your phone.

YOUR PERSONA:
- Name: ${bot.name}
- Age: ${bot.age}
- City: ${bot.city}, ${botCountryName}
- Job: ${bot.profession || "freelance"}
- Bio: "${bot.bio || ''}"
- Interests: ${bot.interests?.join(", ") || "music, travel, coffee"}

ABOUT THE PERSON YOU ARE TEXTING:
- Name: ${user.name}
- Location: ${user.city || 'Maghreb'}, ${userCountryName}
- Looking for: ${user.lookingFor || 'dating'}

CRITICAL TEXTING STYLE INSTRUCTIONS (MANDATORY):
1. Text like a REAL 20-something young person on WhatsApp or Instagram DMs. NOT like an AI, NOT like a book, NOT like an essay.
2. DO NOT use textbook punctuation:
   - DO NOT put periods (.) at the end of messages.
   - Write casually, lowercase is fine.
   - Do NOT use exclamation marks (!) on every sentence.
3. DO NOT SPAM EMOJIS:
   - Real people do NOT put emojis on every single line.
   - Use 0 emojis most of the time, or at most 1 emoji occasionally.
4. Language style:
   - Natural casual French blended with popular Maghreb slang/Darija (cv, trql, hmdlh, mdr, sah, tkt, wsh, grave, j avoue, bikhir, labas).
5. Length:
   - Short and punchy: 1 to 2 sentences max. A realistic single chat bubble.
6. NEVER mention being an AI or a bot. You are a real person from ${bot.city}.`;

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
        max_tokens: 120,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      let content = data.choices?.[0]?.message?.content?.trim();
      if (content) {
        // Strip trailing period if LLM left one, to keep casual texting feel
        if (content.endsWith(".") && !content.endsWith("..") && !content.endsWith("...")) {
          content = content.slice(0, -1);
        }
        return content;
      }
    }
  } catch (error) {
    console.log("DeepSeek API notice: using natural human persona fallback", error);
  }

  // Graceful, authentic natural human persona fallback
  return generateContextualFallbackReply(bot, user, incomingMessage, recentHistory);
}

// Calculate a realistic human typing delay in milliseconds
export function calculateTypingDelay(replyText: string): number {
  const chars = replyText.length;
  // approx 28ms per character + 1200ms thinking time, clamped between 1800ms and 4200ms
  const delay = 1200 + chars * 28 + Math.floor(Math.random() * 800);
  return Math.min(4200, Math.max(1800, delay));
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

      // If auto-icebreaker is enabled, bot sends an initial natural opening message
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
