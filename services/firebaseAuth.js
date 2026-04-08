import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCK8QoX4SPMmAHb6uOPjoZuta2iPA2nYqg",
  authDomain: "smartqueuemanagement-5fa87.firebaseapp.com",
  projectId: "smartqueuemanagement-5fa87",
  storageBucket: "smartqueuemanagement-5fa87.firebasestorage.app",
  messagingSenderId: "711972449706",
  appId: "1:711972449706:web:b7b1a8d63f7d55c51fcfd3",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);