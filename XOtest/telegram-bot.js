// Telegram Bot API интеграция

// Конфигурация Telegram бота
const TELEGRAM_CONFIG = {
    BOT_TOKEN: "8556428165:AAGeNSUHJ4iwK5kl6hZlmhFstZRgXOeaGqo",
    CHAT_ID: "690816109",     // Замените на ваш chat_id. Узнать можно с помощью бота @getidsbot
    ENABLED: true              // Включить/выключить отправку сообщений
};

// Отправка сообщения в Telegram
async function sendTelegramMessage(message, gameResult = '') {
    if (!TELEGRAM_CONFIG.ENABLED || !TELEGRAM_CONFIG.BOT_TOKEN || !TELEGRAM_CONFIG.CHAT_ID) {
        console.log(`Телеграм отключен. Сообщение: ${message}`);
        return;
    }
    
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.CHAT_ID,
                text: `Крестики-нолики: ${message}`,
                parse_mode: 'HTML'
            })
        });
        
        const data = await response.json();
        
        if (data.ok) {
            console.log('Сообщение отправлено в Telegram:', message);
        } else {
            console.error('Ошибка отправки в Telegram:', data);
        }
    } catch (error) {
        console.error('Ошибка при отправке в Telegram:', error);
    }
}

// Тестирование подключения к Telegram
async function testTelegramConnection() {
    if (!TELEGRAM_CONFIG.BOT_TOKEN || !TELEGRAM_CONFIG.CHAT_ID) {
        console.warn('Telegram не настроен. Заполните TELEGRAM_CONFIG в telegram-bot.js');
        return false;
    }
    
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/getMe`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.ok) {
            console.log('✅ Telegram бот подключен:', data.result.username);
            return true;
        } else {
            console.error('❌ Ошибка подключения к Telegram:', data);
            return false;
        }
    } catch (error) {
        console.error('❌ Ошибка при проверке Telegram:', error);
        return false;
    }
}

// Инструкции по настройке Telegram бота
function showTelegramInstructions() {
    console.log(`
    ============================================
    ИНСТРУКЦИЯ ПО НАСТРОЙКЕ TELEGRAM БОТА:
    
    1. Создайте бота через @BotFather в Telegram
    2. Получите токен бота (например: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ)
    3. Узнайте свой chat_id:
       - Напишите сообщение боту @getidsbot
       - Или найдите свой ID в настройках Telegram
    4. Вставьте данные в telegram-bot.js:
       - BOT_TOKEN: 'ваш_токен'
       - CHAT_ID: 'ваш_chat_id'
       - ENABLED: true
    5. Сохраните файл и перезагрузите страницу
    ============================================
    `);
}

// Автоматическая проверка при загрузке
document.addEventListener('DOMContentLoaded', async () => {
    if (!TELEGRAM_CONFIG.BOT_TOKEN || TELEGRAM_CONFIG.BOT_TOKEN === 'YOUR_BOT_TOKEN') {
        showTelegramInstructions();
        
        // Добавляем кнопку настройки Telegram в интерфейс
        const telegramHelp = document.createElement('div');
        telegramHelp.className = 'telegram-help';
        telegramHelp.innerHTML = `
            <div style="background: #e3f2fd; padding: 15px; border-radius: 10px; margin-top: 20px; border-left: 4px solid #2196f3;">
                <h4 style="color: #1565c0; margin-bottom: 10px;">📱 Настройка Telegram-бота</h4>
                <p style="color: #424242; font-size: 0.9rem;">
                    Чтобы получать уведомления о результатах игры в Telegram, 
                    <a href="#" id="show-telegram-instructions" style="color: #2196f3; text-decoration: none; font-weight: bold;">
                        настройте бота
                    </a>
                </p>
            </div>
        `;
        
        document.querySelector('.container').appendChild(telegramHelp);
        
        document.getElementById('show-telegram-instructions').addEventListener('click', (e) => {
            e.preventDefault();
            alert('Откройте консоль разработчика (F12) для просмотра инструкций по настройке Telegram бота.');
            showTelegramInstructions();
        });
    } else {
        const connected = await testTelegramConnection();
        if (connected) {
            console.log('✅ Telegram бот готов к работе!');
        }
    }
});

// Экспорт функции для использования в основном скрипте
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sendTelegramMessage };
}