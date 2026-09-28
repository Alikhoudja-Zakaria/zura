// ============================================
// ZURA — Type Definitions
// ============================================

export type Country = "algeria" | "morocco" | "tunisia";

export type UserStatus = "pending" | "approved" | "rejected" | "banned";

export type UserRole = "user" | "admin";

export type Gender = "male" | "female";

export type LookingFor = "serious" | "casual" | "friends";

export type InterestedIn = "women" | "men" | "both";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  age: number;
  gender: Gender;
  interestedIn?: InterestedIn; // Who the user wants to meet: women, men, or both
  country: Country;
  city: string; // Wilaya for Algeria, Region for Morocco, Governorate for Tunisia
  bio: string;
  lookingFor: LookingFor;
  profession?: string;
  languages?: string[];
  promptQuestion?: string;
  promptAnswer?: string;
  interests: string[];
  photo1: string; // base64 encoded
  photo2: string; // base64 encoded
  status: UserStatus;
  role: UserRole;
  rejectionReason?: string;
  online: boolean;
  isBot?: boolean;
  lastSeen: number; // timestamp
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

export interface Swipe {
  id: string;
  swiperId: string;
  swipedId: string;
  action: "like" | "pass";
  createdAt: number;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  user1Profile?: UserProfile;
  user2Profile?: UserProfile;
  createdAt: number;
  lastMessageAt: number;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: number;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  reporterName?: string;
  reportedName?: string;
  reason: string;
  description: string;
  status: "open" | "reviewed" | "dismissed";
  createdAt: number;
}

// Location data
export interface LocationOption {
  value: string;
  label: string;
}

export const ALGERIA_WILAYAS: LocationOption[] = [
  { value: "adrar", label: "Adrar" },
  { value: "chlef", label: "Chlef" },
  { value: "laghouat", label: "Laghouat" },
  { value: "oum-el-bouaghi", label: "Oum El Bouaghi" },
  { value: "batna", label: "Batna" },
  { value: "bejaia", label: "Béjaïa" },
  { value: "biskra", label: "Biskra" },
  { value: "bechar", label: "Béchar" },
  { value: "blida", label: "Blida" },
  { value: "bouira", label: "Bouira" },
  { value: "tamanrasset", label: "Tamanrasset" },
  { value: "tebessa", label: "Tébessa" },
  { value: "tlemcen", label: "Tlemcen" },
  { value: "tiaret", label: "Tiaret" },
  { value: "tizi-ouzou", label: "Tizi Ouzou" },
  { value: "algiers", label: "Algiers" },
  { value: "djelfa", label: "Djelfa" },
  { value: "jijel", label: "Jijel" },
  { value: "setif", label: "Sétif" },
  { value: "saida", label: "Saïda" },
  { value: "skikda", label: "Skikda" },
  { value: "sidi-bel-abbes", label: "Sidi Bel Abbès" },
  { value: "annaba", label: "Annaba" },
  { value: "guelma", label: "Guelma" },
  { value: "constantine", label: "Constantine" },
  { value: "medea", label: "Médéa" },
  { value: "mostaganem", label: "Mostaganem" },
  { value: "msila", label: "M'Sila" },
  { value: "mascara", label: "Mascara" },
  { value: "ouargla", label: "Ouargla" },
  { value: "oran", label: "Oran" },
  { value: "el-bayadh", label: "El Bayadh" },
  { value: "illizi", label: "Illizi" },
  { value: "bordj-bou-arreridj", label: "Bordj Bou Arréridj" },
  { value: "boumerdes", label: "Boumerdès" },
  { value: "el-tarf", label: "El Tarf" },
  { value: "tindouf", label: "Tindouf" },
  { value: "tissemsilt", label: "Tissemsilt" },
  { value: "el-oued", label: "El Oued" },
  { value: "khenchela", label: "Khenchela" },
  { value: "souk-ahras", label: "Souk Ahras" },
  { value: "tipaza", label: "Tipaza" },
  { value: "mila", label: "Mila" },
  { value: "ain-defla", label: "Aïn Defla" },
  { value: "naama", label: "Naâma" },
  { value: "ain-temouchent", label: "Aïn Témouchent" },
  { value: "ghardaia", label: "Ghardaïa" },
  { value: "relizane", label: "Relizane" },
  { value: "el-mghair", label: "El M'Ghair" },
  { value: "el-meniaa", label: "El Meniaa" },
  { value: "ouled-djellal", label: "Ouled Djellal" },
  { value: "bordj-badji-mokhtar", label: "Bordj Badji Mokhtar" },
  { value: "beni-abbes", label: "Béni Abbès" },
  { value: "timimoun", label: "Timimoun" },
  { value: "touggourt", label: "Touggourt" },
  { value: "djanet", label: "Djanet" },
  { value: "in-salah", label: "In Salah" },
  { value: "in-guezzam", label: "In Guezzam" },
];

export const MOROCCO_REGIONS: LocationOption[] = [
  { value: "tanger-tetouan-al-hoceima", label: "Tanger-Tétouan-Al Hoceïma" },
  { value: "oriental", label: "Oriental" },
  { value: "fes-meknes", label: "Fès-Meknès" },
  { value: "rabat-sale-kenitra", label: "Rabat-Salé-Kénitra" },
  { value: "beni-mellal-khenifra", label: "Béni Mellal-Khénifra" },
  { value: "casablanca-settat", label: "Casablanca-Settat" },
  { value: "marrakech-safi", label: "Marrakech-Safi" },
  { value: "draa-tafilalet", label: "Drâa-Tafilalet" },
  { value: "souss-massa", label: "Souss-Massa" },
  { value: "guelmim-oued-noun", label: "Guelmim-Oued Noun" },
  { value: "laayoune-sakia-el-hamra", label: "Laâyoune-Sakia El Hamra" },
  { value: "dakhla-oued-ed-dahab", label: "Dakhla-Oued Ed-Dahab" },
];

export const TUNISIA_GOVERNORATES: LocationOption[] = [
  { value: "tunis", label: "Tunis" },
  { value: "ariana", label: "Ariana" },
  { value: "ben-arous", label: "Ben Arous" },
  { value: "manouba", label: "Manouba" },
  { value: "nabeul", label: "Nabeul" },
  { value: "zaghouan", label: "Zaghouan" },
  { value: "bizerte", label: "Bizerte" },
  { value: "beja", label: "Béja" },
  { value: "jendouba", label: "Jendouba" },
  { value: "kef", label: "Le Kef" },
  { value: "siliana", label: "Siliana" },
  { value: "sousse", label: "Sousse" },
  { value: "monastir", label: "Monastir" },
  { value: "mahdia", label: "Mahdia" },
  { value: "sfax", label: "Sfax" },
  { value: "kairouan", label: "Kairouan" },
  { value: "kasserine", label: "Kasserine" },
  { value: "sidi-bouzid", label: "Sidi Bouzid" },
  { value: "gabes", label: "Gabès" },
  { value: "medenine", label: "Médenine" },
  { value: "tataouine", label: "Tataouine" },
  { value: "gafsa", label: "Gafsa" },
  { value: "tozeur", label: "Tozeur" },
  { value: "kebili", label: "Kébili" },
];

export function getLocationsByCountry(country: Country | string): LocationOption[] {
  const c = (country || "").toLowerCase().trim();
  switch (c) {
    case "algeria":
      return ALGERIA_WILAYAS;
    case "morocco":
      return MOROCCO_REGIONS;
    case "tunisia":
      return TUNISIA_GOVERNORATES;
    default:
      return [];
  }
}

export const INTEREST_OPTIONS = [
  "Travel", "Music", "Cooking", "Sports", "Reading",
  "Photography", "Movies", "Gaming", "Fitness", "Art",
  "Dancing", "Nature", "Coffee", "Food", "Fashion",
  "Tech", "Cars", "Football", "Beach", "Hiking",
  "Shopping", "Pets", "Yoga", "Writing", "Volunteering",
];
