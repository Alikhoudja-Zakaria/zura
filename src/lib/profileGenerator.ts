import { doc, setDoc, deleteDoc, getDocs, collection } from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile, Country } from "@/types";

// Curated high-resolution web portrait photos of real young adults (North African / Mediterranean aesthetic)
const REAL_FEMALE_PHOTOS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1534751516642-a171edd2521d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1521566652839-697aa473761a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1531727991582-cfd25ce79613?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517677129300-07b130802f46?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1514315384763-ba401779410f?auto=format&fit=crop&w=800&q=80",
];

const REAL_MALE_PHOTOS = [
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1480429370139-e0132c086e2a?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1508243771214-6e85e40077c9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519764622345-23439dd774f7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1528892952291-009c663ce843?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1520409364224-63400afe26e5?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
];

// Curated web photos of authentic real lifestyle, coastal views, coffee, medina streets
const REAL_LIFESTYLE_PHOTOS = [
  "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80", // Specialty coffee bar
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80", // Sunny cafe terrace
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", // Blue Mediterranean sea
  "https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=800&q=80", // Coastal cliff sunset
  "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80", // Historic old town alley
  "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80", // Traditional courtyard & arches
  "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80", // Casual coffee table
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80", // Road trip coastline
  "https://images.unsplash.com/photo-1542314831-c6a4d2757279?auto=format&fit=crop&w=800&q=80", // White & blue sea architecture
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80", // Seaside beach stroll
  "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80", // Morning espresso
  "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=800&q=80", // Sunset mountain ridge
];

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
  "Architecte", "UI Designer", "Développeur", "Médecin résident",
  "Pharmacienne", "Marketing", "Graphiste", "Ingénieur civil",
  "Prof d'anglais", "Étudiante en droit", "Analyste financier", "Photographe",
  "Chef cuisinier", "Architecte d'intérieur", "Dentiste", "Créateur de contenu"
];

// Natural, realistic human dating prompts without artificial textbook punctuation or emoji spam
const NATURAL_PROMPTS = [
  {
    q: "la clé de mon coeur...",
    a: "du bon couscous le vendredi et beaucoup de second degré",
  },
  {
    q: "ensemble on pourrait...",
    a: "aller tester des cafés vue sur mer et débattre pendant des heures",
  },
  {
    q: "je suis convaincue que...",
    a: "les meilleures discussions se font à 2h du matin sans voir le temps passer",
  },
  {
    q: "un objectif dans ma vie...",
    a: "faire un road trip complet le long de toute la côte méditerranéenne",
  },
  {
    q: "mes petits plaisirs...",
    a: "un thé à la menthe bien chaud en terrasse avec une brise fraîche",
  },
  {
    q: "on va bien s'entendre si...",
    a: "tu te prends pas la tête et t'aimes bien rire de tout",
  },
  {
    q: "mon talent inutile...",
    a: "me souvenir des paroles de sons d'il y a 10 ans mdr",
  },
  {
    q: "le dimanche idéal...",
    a: "grasse mat, café tardif et longue balade au bord de l'eau",
  },
  {
    q: "ce qui me fait craquer...",
    a: "l'humour, les gens passionnés et les bonnes conversations sans filtre",
  },
  {
    q: "ma plus grande passion...",
    a: "dénicher des petits cafés cachés dans les vieilles ruelles",
  },
];

// Natural human dating app bios: casual, natural spacing, lowercase/authentic, zero or 1 emoji max
const NATURAL_BIOS_FEMALE = [
  "architecte sur alger, j'aime le bon café et me balader sans but précis",
  "team thé à la menthe > café et personne me fera changer d'avis haha",
  "passion voyages et road trips.. dis moi ton son préféré du moment",
  "ici pour discuter tranquillement et voir si le feeling passe",
  "plutôt calme mais toujours partante pour tester des nouveaux restos",
  "médecine le jour, musique et séries le soir",
  "j'réponds vite sauf quand je dors ou que je bosse mdr",
  "fan de couchers de soleil sur la corniche et de débats interminables",
  "casablancaise, entre boulot et sorties chill le weekend",
  "si tu as du second degré c'est déjà un bon début",
  "introvertie au début puis pipelette haha",
  "cherche quelqu'un de spontané avec qui rigoler sans prise de tête",
  "sur tunis, j'adore la photo et les balades à sidi bou saïd",
  "curieuse de tout, dis moi ce qui te passionne dans la vie",
];

const NATURAL_BIOS_MALE = [
  "développeur le jour, fan de foot et de sorties au bord de mer le soir",
  "archi & photo, toujours en train de chercher des bons spots et de la bonne lumière",
  "ingé sur alger, un bon café en terrasse et je suis refait",
  "ici pour faire de belles rencontres simples et sans prise de tête",
  "passionné de sport, de voyages improvisés et de bonne bouffe",
  "cherche quelqu'un de spontané avec qui partager des moments cools",
  "marrakchi d'origine, j'aime les discussions profondes autour d'un thé",
  "plutôt chill, si tu me fais rire t'as tout gagné",
  "ingénieur sur tunis, j'aime la musique et les virées à la plage",
  "toujours chaud pour un road trip ou un bon café vue sur mer",
  "simple, travailleur et curieux du monde qui m'entoure",
  "dis moi ta chanson préférée et je te dis qui tu es haha",
];

const INTERESTS_POOL = [
  "Voyages", "Café", "Photo", "Musique", "Plage", "Fitness", "Cuisine",
  "Art", "Design", "Tech", "Lecture", "Cinéma", "Nature", "Football", "Architecture"
];

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

    // Age between 21 and 30
    const age = Math.floor(Math.random() * 10) + 21;

    // City
    const cityList = CITIES[targetCountry];
    const city = cityList[Math.floor(Math.random() * cityList.length)];

    // Natural human-like bio
    const bioList = targetGender === "female" ? NATURAL_BIOS_FEMALE : NATURAL_BIOS_MALE;
    const bio = bioList[Math.floor(Math.random() * bioList.length)];

    // Natural human prompt
    const prompt = NATURAL_PROMPTS[Math.floor(Math.random() * NATURAL_PROMPTS.length)];

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
    const languages = ["Arabe", "Français"];
    if (Math.random() > 0.4) languages.push("Anglais");
    if (targetCountry === "algeria" && Math.random() > 0.6) languages.push("Berbère");

    // Real photos scraped/curated from actual real web photography
    const photoList = targetGender === "female" ? REAL_FEMALE_PHOTOS : REAL_MALE_PHOTOS;
    const photo1 = photoList[Math.floor(Math.random() * photoList.length)];
    const photo2 = REAL_LIFESTYLE_PHOTOS[Math.floor(Math.random() * REAL_LIFESTYLE_PHOTOS.length)];

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

// Purge generated fake profiles (IDs starting with fake_ or seed_)
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
