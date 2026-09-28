import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
  Timestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile, Swipe, Match, Message, Report } from "@/types";

// ============================================
// USER OPERATIONS
// ============================================

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const docSnap = await getDoc(doc(db, "users", uid));
  return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
}

export async function getApprovedUsers(excludeUid: string): Promise<UserProfile[]> {
  try {
    const q = query(
      collection(db, "users"),
      where("status", "==", "approved")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => doc.data() as UserProfile)
      .filter((u) => u.uid !== excludeUid && u.role === "user");
  } catch (error) {
    console.error("Error in getApprovedUsers:", error);
    return [];
  }
}

export async function getPendingUsers(): Promise<UserProfile[]> {
  try {
    const q = query(
      collection(db, "users"),
      where("status", "==", "pending")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((doc) => doc.data() as UserProfile)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.error("Error in getPendingUsers:", error);
    return [];
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    return snapshot.docs
      .map((doc) => doc.data() as UserProfile)
      .filter((u) => u.role === "user")
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return [];
  }
}

export async function updateUserStatus(
  uid: string,
  status: "approved" | "rejected" | "banned",
  reason?: string
) {
  const data: Record<string, unknown> = { status, updatedAt: Date.now() };
  if (reason) data.rejectionReason = reason;
  await updateDoc(doc(db, "users", uid), data);
}

// ============================================
// SWIPE OPERATIONS
// ============================================

export async function createSwipe(swiperId: string, swipedId: string, action: "like" | "pass") {
  const swipeId = `${swiperId}_${swipedId}`;
  const swipe: Swipe = {
    id: swipeId,
    swiperId,
    swipedId,
    action,
    createdAt: Date.now(),
  };
  await setDoc(doc(db, "swipes", swipeId), swipe);
  return swipe;
}

export async function getSwipedUserIds(swiperId: string): Promise<string[]> {
  const q = query(collection(db, "swipes"), where("swiperId", "==", swiperId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => (doc.data() as Swipe).swipedId);
}

export async function checkMutualLike(userId1: string, userId2: string): Promise<boolean> {
  const reverseSwipeId = `${userId2}_${userId1}`;
  const docSnap = await getDoc(doc(db, "swipes", reverseSwipeId));
  if (docSnap.exists()) {
    const swipe = docSnap.data() as Swipe;
    return swipe.action === "like";
  }
  return false;
}

// ============================================
// MATCH OPERATIONS
// ============================================

export async function createMatch(user1Id: string, user2Id: string): Promise<Match> {
  const matchId = [user1Id, user2Id].sort().join("_");
  const match: Match = {
    id: matchId,
    user1Id: user1Id < user2Id ? user1Id : user2Id,
    user2Id: user1Id < user2Id ? user2Id : user1Id,
    createdAt: Date.now(),
    lastMessageAt: Date.now(),
  };
  await setDoc(doc(db, "matches", matchId), match);
  return match;
}

export async function getUserMatches(userId: string): Promise<Match[]> {
  // Query matches where user is either user1 or user2
  const q1 = query(collection(db, "matches"), where("user1Id", "==", userId));
  const q2 = query(collection(db, "matches"), where("user2Id", "==", userId));

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

  const matches: Match[] = [];
  const seen = new Set<string>();

  for (const docSnap of [...snap1.docs, ...snap2.docs]) {
    const match = docSnap.data() as Match;
    if (!seen.has(match.id)) {
      seen.add(match.id);
      // Fetch the other user's profile
      const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
      const otherProfile = await getUserProfile(otherUserId);
      if (otherProfile) {
        if (match.user1Id === userId) {
          match.user2Profile = otherProfile;
        } else {
          match.user1Profile = otherProfile;
        }
      }
      matches.push(match);
    }
  }

  return matches.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
}

export async function getMatchById(matchId: string): Promise<Match | null> {
  const docSnap = await getDoc(doc(db, "matches", matchId));
  return docSnap.exists() ? (docSnap.data() as Match) : null;
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

export async function sendMessage(matchId: string, senderId: string, content: string) {
  const msgRef = await addDoc(collection(db, "matches", matchId, "messages"), {
    matchId,
    senderId,
    content,
    read: false,
    createdAt: Date.now(),
  });

  // Update last message time on the match
  await updateDoc(doc(db, "matches", matchId), {
    lastMessageAt: Date.now(),
  });

  return msgRef.id;
}

export function subscribeToMessages(
  matchId: string,
  callback: (messages: Message[]) => void
) {
  const q = query(
    collection(db, "matches", matchId, "messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Message[];
    callback(messages);
  });
}

// ============================================
// REPORT OPERATIONS
// ============================================

export async function createReport(
  reporterId: string,
  reportedId: string,
  reason: string,
  description: string
) {
  await addDoc(collection(db, "reports"), {
    reporterId,
    reportedId,
    reason,
    description,
    status: "open",
    createdAt: Date.now(),
  });
}

export async function getReports(): Promise<Report[]> {
  const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Report[];
}

export async function updateReportStatus(reportId: string, status: "reviewed" | "dismissed") {
  await updateDoc(doc(db, "reports", reportId), { status });
}

// ============================================
// STATS (Admin)
// ============================================

export async function getAdminStats() {
  const [usersSnap, pendingSnap, matchesSnap, reportsSnap] = await Promise.all([
    getDocs(query(collection(db, "users"), where("role", "==", "user"))),
    getDocs(query(collection(db, "users"), where("status", "==", "pending"))),
    getDocs(collection(db, "matches")),
    getDocs(query(collection(db, "reports"), where("status", "==", "open"))),
  ]);

  const onlineCount = usersSnap.docs.filter(
    (d) => (d.data() as UserProfile).online
  ).length;

  return {
    totalUsers: usersSnap.size,
    pendingReviews: pendingSnap.size,
    totalMatches: matchesSnap.size,
    openReports: reportsSnap.size,
    onlineUsers: onlineCount,
  };
}
