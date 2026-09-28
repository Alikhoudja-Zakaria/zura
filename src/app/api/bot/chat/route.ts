import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, sendMessage } from "@/lib/firestore";
import { isBotProfile, callDeepSeekAPI, calculateTypingDelay } from "@/lib/botEngine";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { Message } from "@/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { matchId, userUid, botUid, messageContent, apiKey } = body;

    if (!matchId || !userUid || !botUid || !messageContent) {
      return NextResponse.json(
        { error: "Missing required fields: matchId, userUid, botUid, messageContent" },
        { status: 400 }
      );
    }

    // 1. Fetch bot and user profiles
    const [botProfile, userProfile] = await Promise.all([
      getUserProfile(botUid),
      getUserProfile(userUid),
    ]);

    if (!botProfile) {
      return NextResponse.json({ error: "Bot profile not found" }, { status: 404 });
    }

    if (!isBotProfile(botProfile)) {
      return NextResponse.json({ error: "Recipient is not an automated persona" }, { status: 400 });
    }

    // Fallback user profile if minimal
    const safeUserProfile = userProfile || {
      uid: userUid,
      name: "Friend",
      age: 24,
      gender: "male" as const,
      country: botProfile.country,
      city: botProfile.city,
      bio: "",
      lookingFor: "serious" as const,
      interests: [],
      photo1: "",
      photo2: "",
      email: "",
      status: "approved" as const,
      role: "user" as const,
      online: true,
      lastSeen: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 2. Fetch recent conversation history to maintain stateful memory
    let recentHistory: Message[] = [];
    try {
      const msgsQuery = query(
        collection(db, "matches", matchId, "messages"),
        orderBy("createdAt", "desc"),
        limit(12)
      );
      const snapshot = await getDocs(msgsQuery);
      recentHistory = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as Message))
        .reverse();
    } catch (histErr) {
      console.warn("Could not fetch message history, continuing with prompt:", histErr);
    }

    // 3. Generate response using LLM (DeepSeek) with persona & memory
    const replyText = await callDeepSeekAPI(
      botProfile,
      safeUserProfile,
      messageContent,
      recentHistory,
      apiKey
    );

    // 4. Calculate realistic human typing delay (based on character count & thinking time)
    const typingDelay = calculateTypingDelay(replyText);

    // 5. Wait for the typing delay so it feels completely authentic
    await new Promise((resolve) => setTimeout(resolve, typingDelay));

    // 6. Dispatch message to Firestore
    const messageId = await sendMessage(matchId, botUid, replyText);

    return NextResponse.json({
      success: true,
      reply: replyText,
      messageId,
      delay: typingDelay,
      bot: {
        uid: botProfile.uid,
        name: botProfile.name,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/bot/chat:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate bot reply" },
      { status: 500 }
    );
  }
}
