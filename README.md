# 💖 Zura (زورة) — Maghreb Dating & Friendship Web App

**Zura** is a modern, culturally tailored dating and social connection web application designed specifically for the Maghreb (**Algeria 🇩🇿, Morocco 🇲🇦, and Tunisia 🇹🇳**).

Built with a fast, mobile-first experience inspired by Badoo, Tinder, and Hinge, featuring card swiping with deep profile prompts, zero gradients, crisp vector flags, client-side photo optimization, real-time messaging, and complete admin management controls.

---

## ✨ Features

- **🇩🇿 🇲🇦 🇹🇳 Maghreb Country Selector & Wilayas**:
  - Full support for all **58 Algerian Wilayas**, **12 Moroccan Regions**, and **24 Tunisian Governorates**.
  - Crisp vector flag components that render consistently on all operating systems and browsers.
- **🃏 Badoo / Hinge Hybrid Card Experience**:
  - Interactive swipe cards (Framer Motion) with desktop keyboard navigation (← Pass, → Like).
  - **Scroll inside the card**: Read personal cultural prompts, languages spoken, professions, and full-resolution second photos without outer page scrolling.
  - Multi-photo progress bars with tap left/right photo switching.
- **👩 👨 🤝 Flexible Connections**:
  - Filter and meet: Women, Men, or Everyone.
  - Choose intent: Serious Relationship, Casual Dating, or New Friends.
- **📸 2 Mandatory Photos & Verification**:
  - Client-side image compression directly to base64 for free-tier Firestore storage (no storage bucket required).
  - Admin review queue before new profiles are publicly visible in the discovery feed.
- **💬 Real-Time Chat & Icebreakers**:
  - Real-time messages with Firestore snapshots.
  - Cultural conversation starters (*"Salam! Kifach rak? 👋"*, *"What's your favorite spot in town? ☕"*).
  - In-chat safety and user report modal.
- **🛡️ Comprehensive Admin Dashboard**:
  - Review queue: Approve or reject profiles with rejection reasons.
  - Member management: Ban/unban controls and user inspection modal.
  - Incident reports queue.
  - 1-click Quick Login for Demo Admin and Demo User testing.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend / Database**: Firebase Firestore & Firebase Auth

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Alikhoudja-Zakaria/zura.git
cd zura
```

### 2. Install dependencies
```bash
npm install
```

### 3. Seed demo profiles (Optional)
```bash
node scripts/seed.js
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 👥 Demo Access
- **Admin**: Click the **🛡️ Demo Admin** button on the `/login` screen.
- **Member**: Click the **👤 Demo User** button on the `/login` screen.

---

Made with ❤️ for the Maghreb.
