import { doc, setDoc, deleteDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile, Country } from "@/types";

// High quality SVG data URIs as base64 for generated portraits
function createGeneratedAvatar(
  bgColor: string,
  initials: string,
  hairColor: string,
  skinTone: string = "#F3D2B8",
  gender: "female" | "male" = "female"
): string {
  const isFemale = gender === "female";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="533" viewBox="0 0 400 533">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${bgColor}"/>
        <stop offset="100%" stop-color="${bgColor}E6"/>
      </linearGradient>
    </defs>
    <rect width="400" height="533" fill="url(#bg)"/>
    <!-- Shoulders -->
    <path d="M 60 533 C 60 360, 340 360, 340 533 Z" fill="#1E293B"/>
    <!-- Neck -->
    <rect x="175" y="240" width="50" height="80" rx="10" fill="${skinTone}"/>
    <!-- Face / Head -->
    <ellipse cx="200" cy="180" rx="80" ry="95" fill="${skinTone}"/>
    <!-- Hair -->
    ${
      isFemale
        ? `<path d="M 115 170 C 115 70, 285 70, 285 170 C 295 270, 275 360, 260 380 C 240 320, 240 220, 240 180 C 210 140, 190 140, 160 180 C 160 220, 160 320, 140 380 C 125 360, 105 270, 115 170 Z" fill="${hairColor}"/>`
        : `<path d="M 120 160 C 120 70, 280 70, 280 160 C 260 120, 140 120, 120 160 Z" fill="${hairColor}"/>
           <!-- Male Beard / Stubble -->
           <path d="M 140 200 C 140 260, 260 260, 260 200 C 260 270, 140 270, 140 200 Z" fill="${hairColor}" opacity="0.35"/>`
    }
    <!-- Eyes -->
    <circle cx="170" cy="175" r="7" fill="#1E293B"/>
    <circle cx="230" cy="175" r="7" fill="#1E293B"/>
    <circle cx="172" cy="173" r="2.5" fill="#FFFFFF"/>
    <circle cx="232" cy="173" r="2.5" fill="#FFFFFF"/>
    <!-- Eyebrows -->
    <path d="M 155 160 Q 170 152 185 158" stroke="${hairColor}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M 215 158 Q 230 152 245 160" stroke="${hairColor}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <!-- Smile -->
    <path d="M 180 215 Q 200 232 220 215" stroke="#E11D48" stroke-width="4" fill="none" stroke-linecap="round"/>
    <!-- Name Badge text -->
    <rect x="100" y="475" width="200" height="38" rx="19" fill="#000000" opacity="0.5"/>
    <text x="200" y="501" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${initials}</text>
  </svg>`;

  const base64 = typeof window !== "undefined"
    ? btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

const FEMALE_NAMES = [
  "Amina", "Yasmine", "Meriem", "Ines", "Kenza", "Sarah", "Leila", "Rania",
  "Chaima", "Ryma", "Nour", "Salma", "Ghita", "Houda", "Imane", "Nouhaila",
  "Zineb", "Mariem", "Cyrine", "Farah", "Mayssa", "Dorra", "Lina", "Sirine"
];

const MALE_NAMES = [
  "Yacine", "Mehdi", "Rayan", "Karim", "Walid", "Youssef", "Sofiane", "Hamza",
  "Amine", "Bilel", "Anis", "Farouk", "Reda", "Othmane", "Saad", "Anas",
  "Omar", "Firas", "Aziz", "Khalil", "Rayen", "Sami", "Tarik", "Nassim"
];

const CITIES: Record<Country, string[]> = {
  algeria: ["Algiers", "Oran", "Constantine", "Annaba", "Tlemcen", "Bejaia", "Setif", "Batna", "Blida"],
  morocco: ["Casablanca", "Rabat", "Marrakech", "Tangier", "Agadir", "Fes", "Meknes", "Tetouan"],
  tunisia: ["Tunis", "Sousse", "Sfax", "Bizerte", "Monastir", "Nabeul", "Djerba", "La Marsa"],
};

const PROFESSIONS = [
  "Architect", "UI/UX Designer", "Software Engineer", "Medical Resident",
  "Pharmacist", "Marketing Manager", "Graphic Designer", "Civil Engineer",
  "English Teacher", "Law Student", "Financial Analyst", "Photographer",
  "Chef & Foodie", "Interior Designer", "Dentist", "Content Creator"
];

const PROMPTS = [
  {
    q: "The key to my heart is...",
    a: "Authentic homemade couscous and honest midnight talks.",
  },
  {
    q: "Together we could...",
    a: "Watch the Mediterranean sunset and grab traditional ice cream.",
  },
  {
    q: "I'm convinced that...",
    a: "The Casbah and old medinas have the best hidden rooftop cafés in the world.",
  },
  {
    q: "A life goal of mine is...",
    a: "Take a full road trip across Algeria, Morocco, and Tunisia.",
  },
  {
    q: "My simple pleasures...",
    a: "Fresh mint tea with pine nuts on a breezy summer evening.",
  },
  {
    q: "We'll get along if...",
    a: "You love spontaneous road trips and exploring new cities on foot.",
  },
  {
    q: "I geek out on...",
    a: "Traditional Maghreb architecture, tilework (zellige), and specialty coffee.",
  },
];

const BIOS_FEMALE = [
  "Passionate about historical architecture, good coffee, and road trips along the coast. Looking for genuine vibes and good conversation.",
  "Coffee lover, indie music fan, and foodie always on the hunt for the best local spots. Let's exchange playlists!",
  "Medical student balancing hospital shifts with weekend hikes and book hunting. Always down for sunset walks.",
  "Designer living between work and creative passions. Looking for someone ambitious with a kind heart and a great sense of humor.",
  "Big fan of seaside drives, trying new recipes, and spontaneous weekend getaways. Ready for something real.",
];

const BIOS_MALE = [
  "Software engineer who loves football, seaside runs, and deep conversations over mint tea. Looking for a genuine connection.",
  "Architect & photographer always seeking authentic light and historic spaces. Love road trips and good food.",
  "Civil engineer passionate about sports, outdoor adventures, and family values. Serious intentions only.",
  "Creative director and travel enthusiast. Believe that chemistry and kindness matter most.",
  "Hospitality specialist who loves watersports, weekend cooking, and exploring the Mediterranean coast.",
];

const INTERESTS_POOL = [
  "Travel", "Coffee", "Photography", "Music", "Beach", "Fitness", "Cooking",
  "Art", "Design", "Tech", "Books", "Cinema", "Nature", "Football", "Architecture"
];

const BG_COLORS = [
  "#264653", "#2A9D8F", "#E76F51", "#F4A261", "#E63946",
  "#457B9D", "#1D3557", "#6A4C93", "#1982C4", "#8AC926"
];

const HAIR_COLORS = ["#1A1A1A", "#2C1810", "#3D2314", "#4A2E1B", "#1C1C1E"];

export interface GeneratorOptions {
  count: number;
  country: "all" | Country;
  gender: "mix" | "female" | "male";
  status: "approved" | "pending";
}

export async function generateFakeProfiles(options: GeneratorOptions): Promise<UserProfile[]> {
  const { count, country, gender, status } = options;
  const createdProfiles: UserProfile[] = [];
  const now = Date.now();

  const countriesList: Country[] = ["algeria", "morocco", "tunisia"];

  for (let i = 0; i < count; i++) {
    // Determine Country
    const targetCountry: Country =
      country === "all"
        ? countriesList[Math.floor(Math.random() * countriesList.length)]
        : country;

    // Determine Gender
    const targetGender: "female" | "male" =
      gender === "mix"
        ? Math.random() > 0.5 ? "female" : "male"
        : gender;

    // Determine Name
    const nameList = targetGender === "female" ? FEMALE_NAMES : MALE_NAMES;
    const name = nameList[Math.floor(Math.random() * nameList.length)];

    // Age between 20 and 32
    const age = Math.floor(Math.random() * 13) + 20;

    // City
    const cityList = CITIES[targetCountry];
    const city = cityList[Math.floor(Math.random() * cityList.length)];

    // Bio
    const bioList = targetGender === "female" ? BIOS_FEMALE : BIOS_MALE;
    const bio = bioList[Math.floor(Math.random() * bioList.length)];

    // Prompt
    const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

    // Profession
    const profession = PROFESSIONS[Math.floor(Math.random() * PROFESSIONS.length)];

    // Looking For
    const lookingForOptions: ("serious" | "casual" | "friends")[] = ["serious", "serious", "casual", "friends"];
    const lookingFor = lookingForOptions[Math.floor(Math.random() * lookingForOptions.length)];

    // Interested in
    const interestedIn = targetGender === "female" ? "men" : "women";

    // Interests (pick 4 random)
    const shuffledInterests = [...INTERESTS_POOL].sort(() => 0.5 - Math.random());
    const interests = shuffledInterests.slice(0, 4);

    // Languages
    const languages = ["Arabic", "French"];
    if (Math.random() > 0.4) languages.push("English");
    if (targetCountry === "algeria" && Math.random() > 0.6) languages.push("Berber");

    // Colors
    const bgColor = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)];
    const hairColor = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
    const photo2BgColor = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)];

    // Avatars
    const photo1 = createGeneratedAvatar(bgColor, name, hairColor, "#F3D2B8", targetGender);
    const photo2 = createGeneratedAvatar(photo2BgColor, `${city} 📍`, hairColor, "#F3D2B8", targetGender);

    const uid = `fake_${targetCountry}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const email = `${name.toLowerCase()}.${Math.floor(Math.random() * 999)}@zura.app`;

    const newProfile: UserProfile = {
      uid,
      email,
      name,
      age,
      gender: targetGender,
      country: targetCountry,
      city,
      bio,
      lookingFor,
      interestedIn,
      interests,
      profession,
      languages,
      promptQuestion: prompt.q,
      promptAnswer: prompt.a,
      photo1,
      photo2,
      status,
      role: "user",
      online: Math.random() > 0.4,
      isBot: true,
      lastSeen: now - Math.floor(Math.random() * 86400000),
      createdAt: now - Math.floor(Math.random() * 86400000 * 7),
      updatedAt: now,
    };

    // Save directly to Firestore
    await setDoc(doc(db, "users", uid), newProfile);
    createdProfiles.push(newProfile);
  }

  return createdProfiles;
}

// Purge only generated fake profiles (IDs starting with fake_ or seed_)
export async function purgeGeneratedProfiles(): Promise<number> {
  let count = 0;
  const snap = await getDocs(collection(db, "users"));
  for (const docSnap of snap.docs) {
    const id = docSnap.id;
    if (id.startsWith("fake_") || id.startsWith("seed_")) {
      await deleteDoc(doc(db, "users", id));
      count++;
    }
  }
  return count;
}
