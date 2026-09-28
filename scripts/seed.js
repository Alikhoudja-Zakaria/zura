const { initializeApp } = require("firebase/app");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDrImKGuy4zpUccOH8O75HygjFck2xaiM4",
  authDomain: "algdate-2fc12.firebaseapp.com",
  projectId: "algdate-2fc12",
  storageBucket: "algdate-2fc12.firebasestorage.app",
  messagingSenderId: "596377317772",
  appId: "1:596377317772:web:aa4dbf11b2cb0ad9a957fc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function createAvatar(bgColor, text, circleColor = "#FFFFFF") {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="533" viewBox="0 0 400 533">
    <rect width="400" height="533" fill="${bgColor}"/>
    <circle cx="200" cy="210" r="110" fill="${circleColor}" opacity="0.3"/>
    <circle cx="200" cy="180" r="65" fill="${circleColor}"/>
    <path d="M 120 330 Q 200 270 280 330" stroke="${circleColor}" stroke-width="26" fill="none" stroke-linecap="round"/>
    <text x="200" y="440" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">${text}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

const users = [
  {
    uid: "seed_amina_algeria",
    email: "amina@zura.app",
    name: "Amina",
    age: 24,
    gender: "female",
    country: "algeria",
    city: "Algiers",
    profession: "Heritage Architect",
    languages: ["Arabic (Darija)", "French", "English"],
    promptQuestion: "My favorite spot in town 📍",
    promptAnswer: "Upper Casbah rooftop tea at sunset watching Mediterranean ferries arrive.",
    bio: "Architect from Algiers 🇩🇿. Passionate about historical Casbah preservation, specialty coffee, and coastal drives.",
    lookingFor: "serious",
    interestedIn: "men",
    interests: ["Architecture", "Coffee", "Travel", "Photography"],
    photo1: createAvatar("#E87A5D", "Amina", "#3D2314"),
    photo2: createAvatar("#F4A261", "Casbah", "#3D2314"),
    status: "approved",
    role: "user",
    online: true,
    lastSeen: Date.now(),
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3
  },
  {
    uid: "seed_yacine_algeria",
    email: "yacine@zura.app",
    name: "Yacine",
    age: 27,
    gender: "male",
    country: "algeria",
    city: "Oran",
    profession: "Full-Stack Dev",
    languages: ["Arabic (Darija)", "French"],
    promptQuestion: "A secret talent of mine 🍳",
    promptAnswer: "Making the most authentic chorba beïda in all of western Algeria.",
    bio: "Software developer from Oran 🇩🇿. Beach volleyball, road trips, rai music, and good energy.",
    lookingFor: "serious",
    interestedIn: "women",
    interests: ["Tech", "Music", "Football", "Beach"],
    photo1: createAvatar("#2A9D8F", "Yacine", "#1A1A1A"),
    photo2: createAvatar("#264653", "Oran", "#1A1A1A"),
    status: "approved",
    role: "user",
    online: true,
    lastSeen: Date.now(),
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2
  },
  {
    uid: "seed_kenza_morocco",
    email: "kenza@zura.app",
    name: "Kenza",
    age: 25,
    gender: "female",
    country: "morocco",
    city: "Casablanca",
    profession: "Brand Designer",
    languages: ["Arabic (Darija)", "French", "English"],
    promptQuestion: "The key to my heart is 🔑",
    promptAnswer: "Fresh mint tea, indie playlists, and spontaneous road trips down the Atlantic coast.",
    bio: "Brand designer in Casablanca 🇲🇦. Art galleries, culinary experiments, and books.",
    lookingFor: "casual",
    interestedIn: "men",
    interests: ["Food", "Cooking", "Travel", "Fashion"],
    photo1: createAvatar("#E76F51", "Kenza", "#4A2810"),
    photo2: createAvatar("#D62828", "Casa", "#4A2810"),
    status: "approved",
    role: "user",
    online: false,
    lastSeen: Date.now() - 3600000 * 2,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4
  },
  {
    uid: "seed_mehdi_morocco",
    email: "mehdi@zura.app",
    name: "Mehdi",
    age: 28,
    gender: "male",
    country: "morocco",
    city: "Marrakech",
    profession: "Travel Photographer",
    languages: ["Arabic (Darija)", "French", "Tamazight"],
    promptQuestion: "My ideal weekend ⛰️",
    promptAnswer: "Trekking through the Atlas passes with my camera and sharing tajine by a campfire.",
    bio: "Entrepreneur & photographer in Marrakech 🇲🇦. Mountain trekking, desert photography, and mint tea.",
    lookingFor: "friends",
    interestedIn: "both",
    interests: ["Photography", "Nature", "Coffee", "Fitness"],
    photo1: createAvatar("#457B9D", "Mehdi", "#2B2D42"),
    photo2: createAvatar("#1D3557", "Atlas", "#2B2D42"),
    status: "approved",
    role: "user",
    online: true,
    lastSeen: Date.now(),
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1
  },
  {
    uid: "seed_nour_tunisia",
    email: "nour@zura.app",
    name: "Nour",
    age: 23,
    gender: "female",
    country: "tunisia",
    city: "Tunis",
    profession: "Medical Student",
    languages: ["Tunisian Darija", "French", "English"],
    promptQuestion: "Sunday morning routine ☕",
    promptAnswer: "A double espresso and walking past the blue bougainvillea doors of Sidi Bou Said.",
    bio: "Med student from Tunis 🇹🇳. Sidi Bou Said admirer, reader, classical music listener, and traveler.",
    lookingFor: "serious",
    interestedIn: "men",
    interests: ["Reading", "Coffee", "Beach", "Nature"],
    photo1: createAvatar("#4EA8DE", "Nour", "#5C4033"),
    photo2: createAvatar("#56CFE1", "Tunis", "#5C4033"),
    status: "approved",
    role: "user",
    online: true,
    lastSeen: Date.now(),
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5
  },
  {
    uid: "seed_leila_pending",
    email: "leila@zura.app",
    name: "Leila",
    age: 22,
    gender: "female",
    country: "algeria",
    city: "Constantine",
    profession: "Literature Teacher",
    languages: ["Arabic (Darija)", "Classical Arabic", "French"],
    promptQuestion: "Together, we could 📚",
    promptAnswer: "Explore old bookstores in Constantine and talk about history over mint tea.",
    bio: "Literature graduate from Constantine 🇩🇿. Looking for meaningful conversations and genuine people.",
    lookingFor: "friends",
    interestedIn: "both",
    interests: ["Reading", "Writing", "History"],
    photo1: createAvatar("#9B5DE5", "Leila", "#1A1A1A"),
    photo2: createAvatar("#F15BB5", "Bridge", "#1A1A1A"),
    status: "pending",
    role: "user",
    online: false,
    lastSeen: Date.now(),
    createdAt: Date.now() - 3600000 * 3,
    updatedAt: Date.now() - 3600000 * 3
  },
  {
    uid: "seed_karim_pending",
    email: "karim@zura.app",
    name: "Karim",
    age: 26,
    gender: "male",
    country: "tunisia",
    city: "Sousse",
    profession: "Watersports Coordinator",
    languages: ["Tunisian Darija", "French", "Italian"],
    promptQuestion: "What I'm looking for 🤝",
    promptAnswer: "Adventurous people who love windsurfing, good food, and authentic laughs.",
    bio: "Hotel coordinator in Sousse 🇹🇳. Windsurfing, Mediterranean fish dishes, and beach runs.",
    lookingFor: "friends",
    interestedIn: "both",
    interests: ["Sports", "Beach", "Cooking", "Fitness"],
    photo1: createAvatar("#00BBF9", "Karim", "#2B2D42"),
    photo2: createAvatar("#00F5D4", "Sousse", "#2B2D42"),
    status: "pending",
    role: "user",
    online: false,
    lastSeen: Date.now(),
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 3600000 * 5
  },
  {
    uid: "admin_demo_account",
    email: "admin@zura.app",
    name: "Admin Zura",
    age: 30,
    gender: "female",
    country: "algeria",
    city: "Algiers",
    profession: "Community Lead",
    languages: ["Arabic", "French", "English"],
    bio: "Zura Community Administrator",
    lookingFor: "serious",
    interests: ["Tech", "Community"],
    photo1: createAvatar("#1A1A2E", "ADMIN", "#FF4458"),
    photo2: createAvatar("#FF4458", "ZURA", "#1A1A2E"),
    status: "approved",
    role: "admin",
    online: true,
    lastSeen: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

async function seed() {
  console.log("Seeding rich sample users into Firestore...");
  for (const u of users) {
    await setDoc(doc(db, "users", u.uid), u);
    console.log(`✓ Seeded ${u.name} (${u.country}) - ${u.profession}`);
  }
  console.log("SUCCESS! All enriched profiles are live in Firestore.");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
