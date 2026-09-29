import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export const firebaseConfig = {
  projectId: "dotted-safeguard-d83d0",
  appId: "1:712615414744:web:f1ef8261fb99dc53d540ad",
  apiKey: "AIzaSyDLUoy3fksNB4EIEv6EHwSl-GTuNxapfL0",
  authDomain: "dotted-safeguard-d83d0.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-minibruno-6b594dc8-641a-4e2d-bcf3-03be4a063412",
  storageBucket: "dotted-safeguard-d83d0.firebasestorage.app",
  messagingSenderId: "712615414744",
  oAuthClientId: "712615414744-nde01gkvjlcjlfvr63qpqdncdckbaous.apps.googleusercontent.com"
};

// Inicializar Firebase con la base de datos provisionada
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDocFromServer,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp
};
