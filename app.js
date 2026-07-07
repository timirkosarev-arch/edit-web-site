// Переменная текущего активного проекта
let currentProjectId = "test-project-id"; // Замени на свою логику генерации/получения ID

// Инициализация обработчиков событий
document.getElementById('btn-save').addEventListener('click', saveProjectToServer);

/**
 * ФУНКЦИЯ СОХРАНЕНИЯ ПРОЕКТА В FIRESTORE
 */
async function saveProjectToServer() {
    // Получаем кастомные значения из полей ввода
    const customTitle = document.getElementById('site-title').value.trim() || 'Новый проект';
    const customFavicon = document.getElementById('site-favicon').value.trim() || '';
    const sitePassword = document.getElementById('site-password').value;
    
    // Получаем написанный пользователем код (пример для стандартного textarea)
    const codeContent = document.getElementById('code-textarea').value;

    // Формируем единый объект для отправки в коллекцию
    const updatedProjectData = {
        title: customTitle,       // Уникальный заголовок вкладки
        favicon: customFavicon,   // Ссылка на аватарку вкладки
        password: sitePassword,
        htmlCode: codeContent,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        // Отправляем структурированные данные в Firestore в домен published_sites
        await db.collection('published_sites').doc(currentProjectId).set(updatedProjectData, { merge: true });
        showUiToast('Проект успешно сохранен', 'success');
    } catch (error) {
        showUiToast('Ошибка сохранения: ' + error.message, 'error');
    }
}

/**
 * ФУНКЦИЯ ОТОБРАЖЕНИЯ УВЕДОМЛЕНИЙ
 */
function showUiToast(message, type = 'error') {
    const toast = document.getElementById('toast-notification');
    toast.textContent = message;
    toast.className = 'toast'; // сброс классов
    
    if (type === 'success') {
        toast.classList.add('success');
    }
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 4000);
}


/**
 * ЭТОТ КУСОК КОДА ДЛЖЕН СТОЯТЬ НА СТРАНИЦЕ ВЫВОДА/ПРОСМОТРА СОЗДАННОГО САЙТА
 * Она принимает данные из Firestore и бесшовно подменяет мета-данные вкладки.
 */
function applyCustomMetadataToLoadedSite(projectData) {
    // 1. Динамически меняем название вкладки в браузере на то, что указал юзер
    if (projectData.title) {
        document.title = projectData.title;
    } else {
        document.title = "Создано в WED EDITOR";
    }

    // 2. Ищем или создаем тег link для иконки во вкладке
    if (projectData.favicon) {
        let faviconLink = document.querySelector("link[rel~='icon']");
        
        if (!faviconLink) {
            faviconLink = document.createElement('link');
            faviconLink.rel = 'icon';
            document.head.appendChild(faviconLink);
        }
        
        // Подставляем ссылку на пользовательскую картинку
        faviconLink.href = projectData.favicon;
    }
}

// Пример использования на финальном сайте при загрузке данных:
/*
db.collection('published_sites').doc(loadedSiteId).get().then((doc) => {
    if (doc.exists) {
        const data = doc.data();
        applyCustomMetadataToLoadedSite(data); // Подменяем название и аву во вкладке
        
        // Рендерим сам код сайта (вставляем в iframe или на страницу)
        document.body.innerHTML = data.htmlCode; 
    }
});
*/
