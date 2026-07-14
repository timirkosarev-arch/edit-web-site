// --- Логика интерфейса ---

// Кнопка прокрутки к приложениям
const scrollToAppsBtn = document.getElementById('scrollToAppsBtn');
const appsSection = document.getElementById('appsSection');

if (scrollToAppsBtn && appsSection) {
    scrollToAppsBtn.addEventListener('click', () => {
        appsSection.scrollIntoView({ behavior: 'smooth' });
    });
}

// Логика Модального окна (Подробнее)
const modal = document.getElementById('appModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const detailsBtns = document.querySelectorAll('.details-btn');
const copyLinkBtn = document.getElementById('copyLinkBtn');

// Ссылка на приложение CodeEditor (потом заменишь на реальную ссылку)
const codeEditorLink = "https://твой-домен.vercel.app/codeeditor";

// Открыть окно
detailsBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });
});

// Закрыть окно
closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Закрыть при клике вне окна
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});

// Скопировать ссылку
copyLinkBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(codeEditorLink).then(() => {
        const originalText = copyLinkBtn.innerText;
        copyLinkBtn.innerText = "✅ Скопировано!";
        copyLinkBtn.style.background = "#10b981"; // Зеленый цвет
        
        setTimeout(() => {
            copyLinkBtn.innerText = originalText;
            copyLinkBtn.style.background = "#2a2b36"; // Возвращаем цвет
        }, 2000);
    }).catch(err => {
        console.error('Ошибка копирования: ', err);
    });
});
