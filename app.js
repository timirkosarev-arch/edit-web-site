// Подключаем нужные модули Firebase версии 10
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Берем конфиг из отдельного файла
import { firebaseConfig } from './config.js';

// Инициализация
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const IMGBB_API_KEY = "91baa56297963d72b88d39e4aee75835";

const showUploadBtn = document.getElementById('show-upload-btn');
const uploadSection = document.getElementById('upload-section');
const cancelBtn = document.getElementById('cancel-btn');

// Логика отображения кнопки и формы в зависимости от авторизации
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        authBtn.textContent = "Выйти (" + user.displayName + ")";
        showUploadBtn.style.display = "block"; // Показываем кнопку загрузки
    } else {
        authBtn.textContent = "Войти через Google";
        showUploadBtn.style.display = "none";
        uploadSection.style.display = "none"; // Прячем форму, если вышли
    }
});

// Открыть форму
showUploadBtn.addEventListener('click', () => {
    uploadSection.style.display = "block";
    showUploadBtn.style.display = "none"; // Прячем кнопку, пока открыта форма
});

// Закрыть форму
cancelBtn.addEventListener('click', () => {
    uploadSection.style.display = "none";
    showUploadBtn.style.display = "block";
});

// После успешной загрузки в блоке uploadForm.addEventListener('submit', ...)
// Добавь в конце:
uploadSection.style.display = "none";
showUploadBtn.style.display = "block";

// Элементы на странице
const authBtn = document.getElementById('auth-btn');
const uploadSection = document.getElementById('upload-section');
const uploadForm = document.getElementById('upload-form');
const submitBtn = document.getElementById('submit-btn');
const modsContainer = document.getElementById('mods-container');
const searchBar = document.getElementById('search-bar');

let currentUser = null;
let allMods = []; // Сохраняем моды для поиска

// --- АВТОРИЗАЦИЯ ---
authBtn.addEventListener('click', () => {
    if (currentUser) {
        signOut(auth);
    } else {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider).catch(err => console.error("Ошибка входа:", err));
    }
});

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        authBtn.textContent = "Выйти (" + user.displayName + ")";
        uploadSection.style.display = "block"; // Показываем форму
    } else {
        authBtn.textContent = "Войти через Google";
        uploadSection.style.display = "none"; // Прячем форму
    }
});

// --- ЗАГРУЗКА МОДА ---
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('mod-title').value;
    const megaLink = document.getElementById('mega-link').value;
    const imageFile = document.getElementById('mod-image').files[0];

    // Проверка ссылки на Mega
    if (!megaLink.toLowerCase().includes('mega.nz')) {
        alert('Ошибка: Ссылка должна вести на mega.nz!');
        return;
    }

    if (!imageFile) return;

    submitBtn.textContent = "Загрузка...";
    submitBtn.disabled = true;

    try {
        // 1. Грузим картинку в Storage
        const imageRef = ref(storage, 'mod_images/' + Date.now() + '_' + imageFile.name);
        await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(imageRef);

        // 2. Сохраняем данные в Firestore
        await addDoc(collection(db, "mods"), {
            title: title,
            megaLink: megaLink,
            imageUrl: imageUrl,
            uploaderId: currentUser.uid,
            uploaderName: currentUser.displayName,
            timestamp: Date.now()
        });

        alert("Мод успешно загружен!");
        uploadForm.reset();
        loadMods(); // Обновляем список
    } catch (error) {
        console.error("Ошибка загрузки:", error);
        alert("Произошла ошибка при загрузке.");
    } finally {
        submitBtn.textContent = "Загрузить";
        submitBtn.disabled = false;
    }
});

// --- ВЫВОД И ПОИСК МОДОВ ---
async function loadMods() {
    modsContainer.innerHTML = 'Загрузка модов...';
    
    const q = query(collection(db, "mods"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    
    allMods = [];
    querySnapshot.forEach((doc) => {
        allMods.push({ id: doc.id, ...doc.data() });
    });
    
    renderMods(allMods);
}

function renderMods(modsToRender) {
    modsContainer.innerHTML = '';
    
    if (modsToRender.length === 0) {
        modsContainer.innerHTML = '<p>Моды не найдены.</p>';
        return;
    }

    modsToRender.forEach(mod => {
        const modCard = document.createElement('div');
        modCard.className = 'mod-card';
        modCard.innerHTML = `
            <img src="${mod.imageUrl}" alt="${mod.title}">
            <h3>${mod.title}</h3>
            <p style="font-size: 12px; margin: 0 15px 10px; color: #888;">Загрузил: ${mod.uploaderName}</p>
            <a href="${mod.megaLink}" target="_blank">Скачать с Mega.nz</a>
        `;
        modsContainer.appendChild(modCard);
    });
}

// Живой поиск по названию
searchBar.addEventListener('input', (e) => {
    const queryStr = e.target.value.toLowerCase();
    const filteredMods = allMods.filter(mod => mod.title.toLowerCase().includes(queryStr));
    renderMods(filteredMods);
});

// Загружаем моды при старте
loadMods();
