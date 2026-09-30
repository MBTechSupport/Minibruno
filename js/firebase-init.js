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
  projectId: "mb-proyect",
  appId: "1:712615414744:web:f1ef8261fb99dc53d540ad",
  apiKey: "AIzaSyDLUoy3fksNB4EIEv6EHwSl-GTuNxapfL0",
  authDomain: "mb-proyect.firebaseapp.com",
  firestoreDatabaseId: "(default)",
  storageBucket: "mb-proyect.firebasestorage.app",
  messagingSenderId: "712615414744",
  oAuthClientId: "712615414744-nde01gkvjlcjlfvr63qpqdncdckbaous.apps.googleusercontent.com"
};

// Inicializar Firebase con el proyecto mb-proyect y base de datos (default) en plan Spark
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)")
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);
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
