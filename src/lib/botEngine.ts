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

// Natural human contextual fallback responses: realistic young texting, relaxed punctuation, minimal emojis
export function generateContextualFallbackReply(
  bot: UserProfile,
  user: UserProfile,
  userMessage: string,
  history: Message[]
): string {
  const lowerMsg = userMessage.toLowerCase().trim();
  const botCity = bot.city ? bot.city.toLowerCase() : "ici";
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
    lowerMsg.includes("ahla") ||
    lowerMsg.includes("wsh") ||
    lowerMsg.includes("wesh")
  ) {
    const greetings = [
      `salam ${user.name.toLowerCase()} cv ? trql hmdlh et toi ?`,
      `salut ! enchanté${isFemale ? 'e' : ''}, ta journée s est bien passée ?`,
      `salam, labas hamdullah. quoi de neuf de ton côté ?`,
      `marhaba ! tout va bien ici à ${botCity}, et toi ta journée ?`,
      `salut cv ? quoi de beau en ce moment ?`,
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // How are you / Kifach rak / Ça va / cv
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
      `hmdlh cv super bien, je viens de finir ma journée. et toi cv ?`,
      `cv trql merci ! un peu fatigué${isFemale ? 'e' : ''} de la semaine mais hmdlh haha, tu fais quoi de beau ?`,
      `hamdullah la routine et le boulot, là je me pose un peu en musique et toi ?`,
      `trql en vrai, journée un peu chargée mais cv. t as passé une bonne journée toi ?`,
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
    lowerMsg.includes("yeux") ||
    lowerMsg.includes("sourire")
  ) {
    const compliments = [
      `haha merci c est gentil ! t as l air super sympa aussi`,
      `chokran haha ça fait plaisir, t es tjs aussi flatteur ?`,
      `merci beaucoup, j aime bien ton style sur tes photos en vrai`,
      `haha trop mignon merci, c est gentil de ta part`,
    ];
    return compliments[Math.floor(Math.random() * compliments.length)];
  }

  // Laughter
  if (
    lowerMsg.includes("haha") ||
    lowerMsg.includes("mdr") ||
    lowerMsg.includes("lol") ||
    lowerMsg.includes("x)") ||
    lowerMsg.includes("jpp") ||
    lowerMsg.includes("😂")
  ) {
    const laughs = [
      `mdrrr j avoue c est trop vrai`,
      `haha grave, au moins on risque pas de s ennuyer`,
      `mdrr tu me tues, sinon t as passé un bon weekend ?`,
      `haha j aime bien ton humour en vrai`,
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
    lowerMsg.includes("boulot") ||
    lowerMsg.includes("taf")
  ) {
    return `moi jsuis dans le ${bot.profession ? bot.profession.toLowerCase() : "design"} sur ${botCity}. et toi tu bosses dans quoi ?`;
  }

  // City / Where are you from
  if (
    lowerMsg.includes("d'où") ||
    lowerMsg.includes("mnin") ||
    lowerMsg.includes("ville") ||
    lowerMsg.includes("where") ||
    lowerMsg.includes("win taskon") ||
    lowerMsg.includes("habite") ||
    lowerMsg.includes("t d'ou")
  ) {
    return `moi jsuis sur ${botCity}, tu connais un peu ou t es jamais venu ?`;
  }

  // Food / Coffee / Dating
  if (
    lowerMsg.includes("café") ||
    lowerMsg.includes("cafe") ||
    lowerMsg.includes("coffee") ||
    lowerMsg.includes("manger") ||
    lowerMsg.includes("plat") ||
    lowerMsg.includes("couscous") ||
    lowerMsg.includes("resto") ||
    lowerMsg.includes("thé") ||
    lowerMsg.includes("the")
  ) {
    return `ah le café c est sacré haha, surtout en terrasse. t es plutôt café ou thé à la menthe toi ?`;
  }

  // Weekend / Plans / Hobbies
  if (
    lowerMsg.includes("weekend") ||
    lowerMsg.includes("plan") ||
    lowerMsg.includes("sortir") ||
    lowerMsg.includes("libre") ||
    lowerMsg.includes("musique") ||
    lowerMsg.includes("voyage") ||
    lowerMsg.includes("sport") ||
    lowerMsg.includes("tfk")
  ) {
    return `j aime bien bouger et me balader au bord de la mer le weekend, ça détend tellement. c est quoi tes bails préférés toi ?`;
  }

  // Relationship intentions / Serious / Marriage
  if (
    lowerMsg.includes("mariage") ||
    lowerMsg.includes("serieux") ||
    lowerMsg.includes("sérieux") ||
    lowerMsg.includes("cherches") ||
    lowerMsg.includes("intention") ||
    lowerMsg.includes("tu cherches")
  ) {
    return `moi je cherche un truc sérieux sans prise de tête, apprendre à se connaître d abord. et toi qu est ce qui t amène sur zura ?`;
  }

  // Default natural conversational responses
  const defaults = [
    `haha grave d accord avec toi, t as grandi à ${user.city ? user.city.toLowerCase() : 'la même ville'} ou t as bougé un peu ?`,
    `c est rare les gens avec qui le feeling passe aussi vite haha`,
    `franchement t as l air grave cool, tu fais quoi de beau ce soir ?`,
    `haha oui totalement, c est exactement ça`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
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
    "e961fc82-e18b-4009-bdf3-87c9c3b09437";
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
