// app.js
import { auth, provider } from "./config.js";
import { signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Элементы интерфейса
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Слушатель состояния авторизации
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Пользователь авторизован - пускаем на сайт
        loginScreen.classList.remove('active');
        dashboardScreen.classList.remove('hidden');
        dashboardScreen.classList.add('active');
        logoutBtn.classList.remove('hidden');
    } else {
        // Нет авторизации - показываем стену входа
        dashboardScreen.classList.remove('active');
        dashboardScreen.classList.add('hidden');
        loginScreen.classList.add('active');
        logoutBtn.classList.add('hidden');
    }
});

// Логика входа
loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider).catch((error) => {
        console.error("Ошибка авторизации:", error);
    });
});

// Логика выхода
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});
