import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

import { firebaseConfig, IMGBBB_API_KEY } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

let currentUser = null;

const screens = ['main', 'profile', 'upload', 'auth'];
function showScreen(screenName) {
    screens.forEach(s => {
        document.getElementById(`screen-${s}`).classList.remove('active');
    });
    document.getElementById(`screen-${screenName}`).classList.add('active');
    
    if (screenName === 'main') loadAllMods();
    if (screenName === 'profile') loadMyMods();
}

document.getElementById('logo-btn').addEventListener('click', () => showScreen('main'));
document.getElementById('nav-main').addEventListener('click', () => showScreen('main'));
document.getElementById('nav-upload').addEventListener('click', () => showScreen('upload'));
document.getElementById('nav-profile').addEventListener('click', () => showScreen('profile'));
document.getElementById('nav-auth').addEventListener('click', () => showScreen('auth'));

function toggleLoading(show) {
    document.getElementById('loading-status').style.display = show ? 'block' : 'none';
}

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        document.getElementById('user-email').innerText = user.email;
        document.getElementById('nav-auth').style.display = 'none';
        document.getElementById('nav-logout').style.display = 'inline-block';
        document.getElementById('nav-upload').style.display = 'inline-block';
        document.getElementById('nav-profile').style.display = 'inline-block';
        if(document.getElementById('screen-auth').classList.contains('active')) {
            showScreen('main');
        }
    } else {
        document.getElementById('user-email').innerText = '';
        document.getElementById('nav-auth').style.display = 'inline-block';
        document.getElementById('nav-logout').style.display = 'none';
        document.getElementById('nav-upload').style.display = 'none';
        document.getElementById('nav-profile').style.display = 'none';
        showScreen('main');
    }
});

document.getElementById('register-btn').addEventListener('click', async () => {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    try {
        toggleLoading(true);
        await createUserWithEmailAndPassword(auth, email, password);
        alert('Аккаунт успешно создан!');
    } catch (error) {
        alert('Ошибка регистрации: ' + error.message);
    } finally { toggleLoading(false); }
});

document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        toggleLoading(true);
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert('Ошибка входа: ' + error.message);
    } finally { toggleLoading(false); }
});

document.getElementById('google-login-btn').addEventListener('click', async () => {
    try {
        toggleLoading(true);
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        alert('Ошибка входа через Google: ' + error.message);
    } finally { 
        toggleLoading(false); 
    }
});

document.getElementById('nav-logout').addEventListener('click', () => {
    signOut(auth);
});

async function uploadImageToImgBB(file) {
    const formData = new FormData();
    formData.append("image", file);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBBB_API_KEY}`, {
        method: "POST",
        body: formData
    });
    const data = await response.json();
    if (data.success) {
        return data.data.url;
    } else {
        throw new Error("Не удалось загрузить картинку на ImgBB");
    }
}

document.getElementById('submit-mod-btn').addEventListener('click', async () => {
    if (!currentUser) return alert("Войдите в аккаунт, чтобы добавить мод!");
    
    const title = document.getElementById('mod-title').value;
    const desc = document.getElementById('mod-desc').value;
    const imgFile = document.getElementById('mod-image-file').files[0];
    const archiveFile = document.getElementById('mod-archive-file').files[0];
    
    if (!title || !desc || !imgFile || !archiveFile) {
        return alert("Пожалуйста, заполните все поля и выберите файлы!");
    }

    try {
        toggleLoading(true);

        const imageUrl = await uploadImageToImgBB(imgFile);

        const archiveRef = ref(storage, `mods/${Date.now()}_${archiveFile.name}`);
        const uploadResult = await uploadBytes(archiveRef, archiveFile);
        const fileUrl = await getDownloadURL(uploadResult.ref);

        await addDoc(collection(db, "mods"), {
            title: title,
            description: desc,
            imageUrl: imageUrl,
            fileUrl: fileUrl,
            storagePath: archiveRef.fullPath,
            userId: currentUser.uid,
            userEmail: currentUser.email,
            createdAt: Date.now()
        });

        alert("Мод успешно опубликован!");
        document.getElementById('mod-title').value = '';
        document.getElementById('mod-desc').value = '';
        document.getElementById('mod-image-file').value = '';
        document.getElementById('mod-archive-file').value = '';
        
        showScreen('main');
    } catch (error) {
        console.error(error);
        alert("Ошибка при публикации: " + error.message);
    } finally {
        toggleLoading(false);
    }
});

function createModCard(modData, id, isProfile = false) {
    return `
        <div class="mod-card" id="mod-${id}">
            <img class="mod-img" src="${modData.imageUrl}" alt="${modData.title}">
            <div class="mod-info">
                <div>
                    <h3 class="mod-title">${modData.title}</h3>
                    <p class="mod-desc">${modData.description}</p>
                </div>
                <div class="mod-actions">
                    <a href="${modData.fileUrl}" class="btn-download" target="_blank" download>Скачать</a>
                    ${isProfile ? `<button class="btn-delete" data-id="${id}" data-path="${modData.storagePath}">Удалить</button>` : ''}
                </div>
            </div>
        </div>
    `;
}

async function loadAllMods() {
    const container = document.getElementById('all-mods-container');
    container.innerHTML = '';
    try {
        const querySnapshot = await getDocs(collection(db, "mods"));
        querySnapshot.forEach((doc) => {
            container.innerHTML += createModCard(doc.data(), doc.id, false);
        });
    } catch (e) { console.error("Ошибка получения модов: ", e); }
}

async function loadMyMods() {
    const container = document.getElementById('my-mods-container');
    container.innerHTML = '';
    if (!currentUser) return;
    
    try {
        const q = query(collection(db, "mods"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            container.innerHTML += createModCard(doc.data(), doc.id, true);
        });
        
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const modId = e.target.getAttribute('data-id');
                const storagePath = e.target.getAttribute('data-path');
                deleteMod(modId, storagePath);
            });
        });
    } catch (e) { console.error("Ошибка получения профильных модов: ", e); }
}

async function deleteMod(modId, storagePath) {
    if(!confirm("Вы уверены, что хотите удалить этот мод?")) return;
    
    try {
        toggleLoading(true);
        
        if (storagePath) {
            const fileRef = ref(storage, storagePath);
            await deleteObject(fileRef).catch(err => console.log("Файл в хранилище не найден или уже удален"));
        }
        
        await deleteDoc(doc(db, "mods", modId));
        
        alert("Мод удален!");
        loadMyMods();
    } catch (error) {
        alert("Ошибка удаления: " + error.message);
    } finally {
        toggleLoading(false);
    }
}

loadAllMods();
