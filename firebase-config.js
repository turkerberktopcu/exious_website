// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdDTyKa--_EKWkBS0WCD3k3RhELrHadqI",
  authDomain: "exius-8a41f.firebaseapp.com",
  projectId: "exius-8a41f",
  storageBucket: "exius-8a41f.firebasestorage.app",
  messagingSenderId: "1076581268680",
  appId: "1:1076581268680:web:556a0a1283db376580f9fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };