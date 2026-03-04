// src/firebase/applicationApi.js
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

/**
 * applications collection (root-level)
 * Document shape:
 * {
 *   id: string,
 *   projectId: string,
 *   applicantId: string,
 *   applicantName: string,
 *   applicantUsername?: string,
 *   applicantImage?: string,
 *   appliedAt: Timestamp,
 *   status: "pending" | "interviewing" | "accepted" | "rejected"
 * }
 */

/* ---------------- Create application (idempotent) ---------------- */
/**
 * Creates an application for user -> project.
 * Prevents duplicate (same user + project).
 * Also mirrors a small doc under /users/{userId}/applications/{appId}
 *
 * @returns {object} { success: boolean, applicationId: string|null, message?: string }
 */
export async function applyForProject({
  projectId,
  applicantId,
  applicantName,
  applicantUsername,
  applicantImage,
}) {
  if (!projectId || !applicantId) {
    throw new Error("Missing projectId or applicantId");
  }

  // check duplicate
  const q = query(
    collection(db, "applications"),
    where("projectId", "==", projectId),
    where("applicantId", "==", applicantId)
  );
  const existing = await getDocs(q);
  if (!existing.empty) {
    // already applied — return existing id
    const docSnap = existing.docs[0];
    return { success: true, applicationId: docSnap.id, alreadyApplied: true };
  }

  // prepare new application doc with generated id
  const applicationsCol = collection(db, "applications");
  const newDocRef = doc(applicationsCol); // creates ref with auto id
  const applicationId = newDocRef.id;

  const payload = {
    projectId,
    applicantId,
    applicantName: applicantName || "",
    applicantUsername: applicantUsername || "",
    applicantImage: applicantImage || "",
    appliedAt: serverTimestamp(),
    status: "pending",
  };

  // Write application and mirror under user subcollection
  const userAppRef = doc(db, "users", applicantId, "applications", applicationId);

  // Use setDoc for both
  await setDoc(newDocRef, payload);
  await setDoc(userAppRef, {
    projectId,
    status: "pending",
    appliedAt: serverTimestamp(),
    applicationId,
    projectRef: projectId,
  });

  return { success: true, applicationId };
}

/* ---------------- Get applications by project (real-time) ---------------- */
/**
 * Subscribe to real-time list of applications for a project
 * callback receives array of { id, data }
 * Returns unsubscribe function
 */
export function onApplicationsByProject(projectId, callback) {
  const q = query(collection(db, "applications"), where("projectId", "==", projectId));
  const unsub = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
  return unsub;
}

/* ---------------- Get user's applications (real-time) ---------------- */
export function onApplicationsByUser(userId, callback) {
  const q = query(collection(db, "applications"), where("applicantId", "==", userId));
  const unsub = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(items);
  });
  return unsub;
}

/* ---------------- Update application status (owner action) ---------------- */
/**
 * Update the application document's status and mirror under user's subcollection entry.
 */
export async function updateApplicationStatus(applicationId, newStatus) {
  if (!applicationId) throw new Error("Missing applicationId");

  const appRef = doc(db, "applications", applicationId);
  const appSnap = await getDoc(appRef);
  if (!appSnap.exists()) throw new Error("Application not found");

  const appData = appSnap.data();
  const applicantId = appData.applicantId;

  // update main application doc
  await setDoc(appRef, { ...appData, status: newStatus }, { merge: true });

  // update user's mirror
  const userAppRef = doc(db, "users", applicantId, "applications", applicationId);
  await setDoc(userAppRef, { status: newStatus }, { merge: true });

  return { success: true };
}

/* ---------------- Delete all applications for project (used when deleting project) ---------------- */
/**
 * Deletes all application docs where projectId == given id.
 * Also deletes the mirrored user subcollection entries.
 */
export async function deleteApplicationsForProject(projectId) {
  const q = query(collection(db, "applications"), where("projectId", "==", projectId));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return { deleted: 0 };

  const batch = writeBatch(db);
  let deleted = 0;

  snapshot.docs.forEach((d) => {
    const appId = d.id;
    // delete main application doc
    batch.delete(doc(db, "applications", appId));
    // delete user's mirror (best-effort)
    const data = d.data();
    if (data?.applicantId) {
      const userAppRef = doc(db, "users", data.applicantId, "applications", appId);
      batch.delete(userAppRef);
    }
    deleted++;
  });

  await batch.commit();
  return { deleted };
}

/* ---------------- Check if user already applied for project (helper) ---------------- */
export async function hasUserAppliedToProject(userId, projectId) {
  const q = query(
    collection(db, "applications"),
    where("projectId", "==", projectId),
    where("applicantId", "==", userId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

/* ---------------- Fetch applications by project once (non realtime) ---------------- */
export async function getApplicationsByProject(projectId) {
  const q = query(collection(db, "applications"), where("projectId", "==", projectId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ---------------- Fetch applications by user (non realtime) ---------------- */
export async function getApplicationsByUser(userId) {
  const q = query(collection(db, "applications"), where("applicantId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
