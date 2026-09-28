"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import { seedSampleData } from "@/lib/seedData";

export interface CustomUser {
  uid: string;
  email: string | null;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | CustomUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    profile: Omit<UserProfile, "uid" | "email" | "status" | "role" | "online" | "lastSeen" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  quickLogin: (asRole: "admin" | "user") => Promise<void>;
  // Aliases for convenience
  user: (FirebaseUser | CustomUser) | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | CustomUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setUserProfile(data);
        return data;
      } else {
        setUserProfile(null);
        return null;
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
      setUserProfile(null);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        await fetchProfile(user.uid);
        try {
          await updateDoc(doc(db, "users", user.uid), {
            online: true,
            lastSeen: Date.now(),
          });
        } catch {}
        setLoading(false);
      } else {
        // Check localStorage fallback for development/demo mode
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("zura_session");
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed?.uid) {
                setFirebaseUser(parsed);
                await fetchProfile(parsed.uid);
                setLoading(false);
                return;
              }
            } catch {}
          }
        }
        setFirebaseUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string,
    password: string,
    profile: Omit<UserProfile, "uid" | "email" | "status" | "role" | "online" | "lastSeen" | "createdAt" | "updatedAt">
  ) => {
    let uid = "";
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      uid = cred.user.uid;
      setFirebaseUser(cred.user);
    } catch (authErr: any) {
      console.warn("Firebase Auth error (falling back to direct Firestore auth):", authErr);
      // Fallback for when Firebase Auth isn't enabled in console
      uid = "u_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
      const customUser = { uid, email };
      setFirebaseUser(customUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("zura_session", JSON.stringify(customUser));
      }
    }

    const now = Date.now();
    const newProfile: UserProfile = {
      ...profile,
      uid,
      email: email.trim().toLowerCase(),
      status: "pending",
      role: "user",
      online: true,
      lastSeen: now,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(doc(db, "users", uid), newProfile);
    setUserProfile(newProfile);
  };

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      setFirebaseUser(cred.user);
      await fetchProfile(cred.user.uid);
    } catch (authErr: any) {
      console.warn("Firebase Auth error (checking Firestore direct auth fallback):", authErr);
      // Fallback: search Firestore users by email
      try {
        const q = query(collection(db, "users"), where("email", "==", cleanEmail));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const found = snap.docs[0].data() as UserProfile;
          const customUser = { uid: found.uid, email: found.email };
          setFirebaseUser(customUser);
          setUserProfile(found);
          if (typeof window !== "undefined") {
            localStorage.setItem("zura_session", JSON.stringify(customUser));
          }
          return;
        }
      } catch (dbErr) {
        console.error("Firestore lookup error:", dbErr);
      }
      throw authErr;
    }
  };

  const quickLogin = async (asRole: "admin" | "user") => {
    setLoading(true);
    try {
      // Ensure seed sample data exists
      await seedSampleData();

      const targetUid = asRole === "admin" ? "admin_demo_account" : "seed_amina_algeria";
      const targetEmail = asRole === "admin" ? "admin@zura.app" : "amina@zura.app";

      if (asRole === "admin") {
        await setDoc(
          doc(db, "users", targetUid),
          {
            uid: targetUid,
            email: targetEmail,
            name: "Admin Zura",
            age: 30,
            gender: "female",
            country: "algeria",
            city: "Algiers",
            bio: "Zura Administrator",
            lookingFor: "serious",
            interests: ["Tech", "Community"],
            photo1: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNTMzIiB2aWV3Qm94PSIwIDAgNDAwIDUzMyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI1MzMiIGZpbGw9IiMxQTFBMkUiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIyMDAiIHI9Ijg1IiBmaWxsPSIjRkY0NDU4Ii8+PHRleHQgeD0iMjAwIiB5PSI0OTAiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjRkZGRkZGIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5BRE1JTjwvdGV4dD48L3N2Zz4=",
            photo2: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNTMzIiB2aWV3Qm94PSIwIDAgNDAwIDUzMyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI1MzMiIGZpbGw9IiMxQTFBMkUiLz48L3N2Zz4=",
            status: "approved",
            role: "admin",
            online: true,
            lastSeen: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          { merge: true }
        );
      }

      const customUser = { uid: targetUid, email: targetEmail };
      setFirebaseUser(customUser);
      await fetchProfile(targetUid);
      if (typeof window !== "undefined") {
        localStorage.setItem("zura_session", JSON.stringify(customUser));
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (firebaseUser) {
      try {
        await updateDoc(doc(db, "users", firebaseUser.uid), {
          online: false,
          lastSeen: Date.now(),
        });
      } catch {}
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("zura_session");
    }
    try {
      await firebaseSignOut(auth);
    } catch {}
    setFirebaseUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      await fetchProfile(firebaseUser.uid);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!firebaseUser) return;
    await updateDoc(doc(db, "users", firebaseUser.uid), {
      ...data,
      updatedAt: Date.now(),
    });
    await fetchProfile(firebaseUser.uid);
  };

  const deleteAccount = async () => {
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        status: "banned",
        updatedAt: Date.now(),
      });
      await signOut();
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        updateProfile,
        quickLogin,
        // Aliases
        user: firebaseUser,
        profile: userProfile,
        login: signIn,
        logout: signOut,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
