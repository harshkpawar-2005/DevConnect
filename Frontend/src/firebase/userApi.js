// src/firebase/userApi.js
import { db } from "./firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  collection,
  getDocs,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

/* ---------------------------
  Create default user profile if not exists
  - user: Clerk user object
----------------------------*/
export async function createUserProfile(user) {
  try {
    if (!user || !user._id) return;
    const ref = doc(db, "users", user._id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        userId: user._id,
        name: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        image: user.imageUrl || "",
        username: user.username || "",

        // profile fields
        headline: "",
        about: "",
        location: "",
        education: [],
        work: [],
        skills: [],
        links: { list: [] },

        // wishlist / saved projects
        savedProjects: [],

        createdAt: new Date(),
      });
    }
  } catch (e) {
    console.error("createUserProfile error:", e);
    throw e;
  }
}

/* ---------------------------
  Get user profile by userId
----------------------------*/
export async function getUserProfile(userId) {
  try {
    const snap = await getDoc(doc(db, "users", userId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (e) {
    console.error("getUserProfile error:", e);
    return null;
  }
}

/* ---------------------------
  Get user profile by username
  (assumes username field exists and is unique)
----------------------------*/
export async function getUserProfileByUsername(username) {
  try {
    const col = collection(db, "users");
    const q = query(col, where("username", "==", username));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    // return first matching doc
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
  } catch (e) {
    console.error("getUserProfileByUsername error:", e);
    return null;
  }
}

/* ---------------------------
  Update user profile (partial)
  - userId: string
  - data: object with fields to update
----------------------------*/
export async function updateUserProfile(userId, data) {
  try {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, data);
    return true;
  } catch (e) {
    console.error("updateUserProfile error:", e);
    return false;
  }
}

/* ---------------------------
  Toggle Save/Unsave Project (user-level wishlist)
  - userId: the user who toggles
  - projectId: id to add/remove
  - isAlreadySaved: boolean (optional) - if known you can skip read; when not provided this function will read user doc
----------------------------*/
export async function toggleSaveProject(userId, projectId, isAlreadySaved = undefined) {
  try {
    const ref = doc(db, "users", userId);

    // if caller didn't pass known state, read current doc
    if (typeof isAlreadySaved !== "boolean") {
      const snap = await getDoc(ref);
      const data = snap.exists() ? snap.data() : {};
      isAlreadySaved = Array.isArray(data.savedProjects) && data.savedProjects.includes(projectId);
    }

    await updateDoc(ref, {
      savedProjects: isAlreadySaved ? arrayRemove(projectId) : arrayUnion(projectId),
    });

    return !isAlreadySaved;
  } catch (e) {
    console.error("toggleSaveProject error:", e);
    return null;
  }
}
