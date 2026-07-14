
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAnrXmovXmBIGocOsbJxSIQ_7dwlHpccdU",
  authDomain: "edit-web.firebaseapp.com",
  databaseURL: "https://edit-web-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "edit-web",
  storageBucket: "edit-web.firebasestorage.app",
  messagingSenderId: "235371037065",
  appId: "1:235371037065:web:a44cc11617acb19276e158",
  measurementId: "G-7VJJSECTXX"
};

// Инициализация
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
