import { doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile } from "@/types";

// High quality SVG data URIs as base64 for sample profiles
function createAvatar(bgColor: string, initials: string, hairColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="533" viewBox="0 0 400 533">
    <rect width="400" height="533" fill="${bgColor}"/>
    <circle cx="200" cy="180" r="85" fill="#F3D2B8"/>
    <circle cx="200" cy="130" r="95" fill="${hairColor}"/>
    <circle cx="200" cy="180" r="75" fill="#F3D2B8"/>
    <circle cx="170" cy="175" r="8" fill="#2C2C2C"/>
    <circle cx="230" cy="175" r="8" fill="#2C2C2C"/>
    <path d="M 180 215 Q 200 235 220 215" stroke="#E05B5B" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M 90 533 C 90 350, 310 350, 310 533 Z" fill="#2A2D34"/>
    <text x="200" y="490" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${initials}</text>
  </svg>`;
  const base64 = typeof window !== "undefined"
    ? btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}

export const SAMPLE_USERS: UserProfile[] = [
  {
    uid: "seed_amina_algeria",
    email: "amina@zura.app",
    name: "Amina",
    age: 24,
    gender: "female",
    country: "algeria",
    city: "Algiers",
    bio: "Architect from Algiers 🇩🇿. Passionate about historical Casbah architecture, good coffee, and road trips along the Mediterranean coast.",
    lookingFor: "serious",
    interestedIn: "men",
    interests: ["Architecture", "Coffee", "Travel", "Photography", "Art"],
    photo1: createAvatar("#E87A5D", "Amina", "#3D2314"),
    photo2: createAvatar("#F4A261", "Casbah", "#3D2314"),
    status: "approved",
    role: "user",
    online: true,
    lastSeen: Date.now(),
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    uid: "seed_yacine_algeria",
    email: "yacine@zura.app",
    name: "Yacine",
    age: 27,
    gender: "male",
    country: "algeria",
    city: "Oran",
    bio: "Software engineer in Oran. Love rai music, seaside sunsets at Santa Cruz, and weekend football.",
    lookingFor: "serious",
    interestedIn: "women",
    interests: ["Tech", "Music", "Football", "Beach", "Fitness"],
    photo1: createAvatar("#2A9D8F", "Yacine", "#1A1A1A"),
    photo2: createAvatar("#264653", "Oran", "#1A1A1A"),
    status: "approved",
    role: "user",
    online: true,
    lastSeen: Date.now(),
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    uid: "seed_kenza_morocco",
    email: "kenza@zura.app",
    name: "Kenza",
    age: 25,
    gender: "female",
    country: "morocco",
    city: "Casablanca",
    bio: "Marketing manager from Casablanca 🇲🇦. Big foodie, love trying traditional tajines and exploring old medinas.",
    lookingFor: "casual",
    interestedIn: "men",
    interests: ["Food", "Cooking", "Travel", "Fashion", "Music"],
    photo1: createAvatar("#E76F51", "Kenza", "#4A2810"),
    photo2: createAvatar("#D62828", "Casa", "#4A2810"),
    status: "approved",
    role: "user",
    online: false,
    lastSeen: Date.now() - 3600000 * 2,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
  },
  {
    uid: "seed_mehdi_morocco",
    email: "mehdi@zura.app",
    name: "Mehdi",
    age: 28,
    gender: "male",
    country: "morocco",
    city: "Marrakech",
    bio: "Photographer & designer in Marrakech. Always looking for authentic light, tea rituals, and stimulating conversations.",
    lookingFor: "friends",
    interestedIn: "both",
    interests: ["Photography", "Art", "Coffee", "Design", "Nature"],
    photo1: createAvatar("#457B9D", "Mehdi", "#2B2D42"),
    photo2: createAvatar("#1D3557", "Marrakech", "#2B2D42"),
    status: "approved",
    role: "user",
    online: true,
    lastSeen: Date.now(),
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    uid: "seed_nour_tunisia",
    email: "nour@zura.app",
    name: "Nour",
    age: 23,
    gender: "female",
    country: "tunisia",
    city: "Tunis",
    bio: "Medical student in Tunis 🇹🇳. Sidi Bou Said lover, avid reader, and tea enthusiast.",
    lookingFor: "serious",
    interestedIn: "men",
    interests: ["Reading", "Coffee", "Beach", "Nature", "Yoga"],
    photo1: createAvatar("#4EA8DE", "Nour", "#5C4033"),
    photo2: createAvatar("#56CFE1", "Sidi Bou", "#5C4033"),
    status: "approved",
    role: "user",
    online: true,
    lastSeen: Date.now(),
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
  },
  {
    uid: "seed_leila_pending",
    email: "leila@zura.app",
    name: "Leila",
    age: 22,
    gender: "female",
    country: "algeria",
    city: "Constantine",
    bio: "Literature graduate from the city of suspended bridges. Interested in meeting genuine people.",
    lookingFor: "friends",
    interestedIn: "both",
    interests: ["Reading", "Writing", "History", "Coffee"],
    photo1: createAvatar("#9B5DE5", "Leila", "#1A1A1A"),
    photo2: createAvatar("#F15BB5", "Bridge", "#1A1A1A"),
    status: "pending",
    role: "user",
    online: false,
    lastSeen: Date.now() - 3600000 * 12,
    createdAt: Date.now() - 3600000 * 4,
    updatedAt: Date.now() - 3600000 * 4,
  },
  {
    uid: "seed_karim_pending",
    email: "karim@zura.app",
    name: "Karim",
    age: 26,
    gender: "male",
    country: "tunisia",
    city: "Sousse",
    bio: "Hospitality manager in Sousse. Enjoy watersports, coastal runs, and traditional cuisine.",
    lookingFor: "friends",
    interestedIn: "both",
    interests: ["Sports", "Beach", "Cooking", "Fitness"],
    photo1: createAvatar("#00BBF9", "Karim", "#2B2D42"),
    photo2: createAvatar("#00F5D4", "Sousse", "#2B2D42"),
    status: "pending",
    role: "user",
    online: false,
    lastSeen: Date.now() - 3600000 * 8,
    createdAt: Date.now() - 3600000 * 2,
    updatedAt: Date.now() - 3600000 * 2,
  },
];

export async function seedSampleData(): Promise<number> {
  let count = 0;
  for (const user of SAMPLE_USERS) {
    await setDoc(doc(db, "users", user.uid), user);
    count++;
  }
  return count;
}

export async function promoteToAdmin(uid: string): Promise<void> {
  await setDoc(doc(db, "users", uid), { role: "admin", status: "approved" }, { merge: true });
}
