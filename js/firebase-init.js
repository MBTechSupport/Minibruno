import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD2of0l0Iwj8twelEnOxYt0OhXJ8sAoKac",
  authDomain: "mb-proyect.firebaseapp.com",
  projectId: "mb-proyect",
  storageBucket: "mb-proyect.firebasestorage.app",
  messagingSenderId: "1071734753776",
  appId: "1:1071734753776:web:0c20ff31ee993419d77535"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export { signInWithPopup, signOut };