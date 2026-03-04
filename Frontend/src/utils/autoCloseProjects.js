// src/utils/autoCloseProjects.js
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export async function autoCloseProjects() {
  try {
    const projectsRef = collection(db, "projects");
    const snapshot = await getDocs(projectsRef);

    const today = new Date();
    const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    let updatedCount = 0;

    const updates = snapshot.docs.map(async (d) => {
      const data = d.data();
      if (!data.lastDate) return;

      let deadline;

      // Convert Firebase timestamp or string
      if (data.lastDate.toDate) {
        deadline = data.lastDate.toDate();
      } else {
        const parsed = new Date(data.lastDate);
        if (!isNaN(parsed.getTime())) {
          deadline = parsed;
        }
      }

      if (!deadline) return;

      const deadlineMid = new Date(
        deadline.getFullYear(),
        deadline.getMonth(),
        deadline.getDate()
      );

      // If deadline passed but Firestore still says open → update it
      if (deadlineMid < todayMid && data.status !== "closed") {
        await updateDoc(doc(db, "projects", d.id), {
          status: "closed",
        });
        updatedCount++;
      }
    });

    await Promise.all(updates);

    console.log(`autoCloseProjects: Updated ${updatedCount} expired projects`);
  } catch (error) {
    console.error("autoCloseProjects ERROR:", error);
  }
}
