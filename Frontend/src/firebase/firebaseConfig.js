import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2Iezxggt_YAw3-SsDCdOevd3jS10I4PE",
  authDomain: "devconnect-76e37.firebaseapp.com",
  projectId: "devconnect-76e37",
  storageBucket: "devconnect-76e37.firebasestorage.app",
  messagingSenderId: "198830092508",
  appId: "1:198830092508:web:8d1129de6dcc4df4a4c419"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
