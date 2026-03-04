// src/AppWrapper.jsx
import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { createUserProfile } from "@/firebase/userApi";

export default function AppWrapper({ children }) {
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (!isLoaded) return;
    if (user) {
      // create user profile in Firestore if not exists
      createUserProfile(user).catch((e) => {
        console.error("createUserProfile err:", e);
      });
    }
  }, [isLoaded, user]);

  return children;
}
