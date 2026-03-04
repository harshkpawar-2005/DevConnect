// src/firebase/projectApi.js

import { db } from "./firebaseConfig";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
  writeBatch
} from "firebase/firestore";

import { deleteApplicationsForProject } from "./applicationApi"; 
// ^ you already have this function — we reuse it.

/* ============================================================
    1. CREATE PROJECT
============================================================ */

export async function createProject(projectId, data) {
  const ref = doc(db, "projects", projectId);
  await setDoc(ref, {
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return true;
}

/* ============================================================
    2. GET ALL PROJECTS (For Dashboard / Feed)
============================================================ */
export async function getAllProjects() {
  const snap = await getDocs(collection(db, "projects"));
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/* ============================================================
    3. GET PROJECT BY ID
============================================================ */
export async function getProject(projectId) {
  const ref = doc(db, "projects", projectId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/* ============================================================
    4. GET PROJECTS CREATED BY A USER
============================================================ */
export async function getProjectsByUserId(userId) {
  const q = query(collection(db, "projects"), where("creatorId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/* ============================================================
    5. UPDATE PROJECT
============================================================ */
export async function updateProject(projectId, data) {
  const ref = doc(db, "projects", projectId);
  await updateDoc(ref, { ...data, updatedAt: new Date() });
  return true;
}

/* ============================================================
    6. SAVE PROJECT (WISHLIST)
============================================================ */

export async function saveProject(userId, projectId) {
  const ref = doc(db, "users", userId);
  await updateDoc(ref, { wishlist: arrayUnion(projectId) });
  return true;
}

export async function removeSavedProject(userId, projectId) {
  const ref = doc(db, "users", userId);
  await updateDoc(ref, { wishlist: arrayRemove(projectId) });
  return true;
}

export async function getSavedProjects(userId) {
  const ref = doc(db, "users", userId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return [];

  const list = snap.data().wishlist || [];

  if (!list.length) return [];

  const results = [];
  for (const pid of list) {
    const p = await getProject(pid);
    if (p) results.push(p);
  }

  return results;
}

/* ============================================================
    7. DELETE PROJECT COMPLETELY (OWNER ACTION)
============================================================ */

export async function deleteProjectCompletely(projectId) {
  if (!projectId) throw new Error("Missing projectId");

  // 1️⃣ Delete all applications for this project
  await deleteApplicationsForProject(projectId);

  // 2️⃣ Remove projectId from every user's wishlist
  const usersCol = collection(db, "users");
  const usersSnap = await getDocs(usersCol);

  const batch = writeBatch(db);

  usersSnap.forEach((u) => {
    const wishlist = u.data()?.wishlist || [];
    if (wishlist.includes(projectId)) {
      batch.update(doc(db, "users", u.id), {
        wishlist: arrayRemove(projectId),
      });
    }
  });

  // 3️⃣ Delete the main project
  batch.delete(doc(db, "projects", projectId));

  await batch.commit();

  return { success: true };
}
