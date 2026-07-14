
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAxo4VkVVd8PqGJdM5ncIC-W8mQvU0z9uI",
  authDomain: "grt4r-7758d.firebaseapp.com",
  projectId: "grt4r-7758d",
  storageBucket: "grt4r-7758d.firebasestorage.app",
  messagingSenderId: "1044260841178",
  appId: "1:1044260841178:web:271150cdbb31a90794e7e3",
  measurementId: "G-5GY6WG5PLT"
};

// Инициализация
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
