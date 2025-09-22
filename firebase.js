import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAqbKtWH5amwaE4pOIfgrQHYyIMVSEz75M",
  authDomain: "marido-chat.firebaseapp.com",
  projectId: "marido-chat",
  storageBucket: "marido-chat.firebasestorage.app",
  messagingSenderId: "958334768070",
  appId: "1:958334768070:web:f77c880d660c15322f98c7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
