// Основная игровая логика

// Элементы DOM
const gameBoard = document.getElementById('game-board');
const newGameBtn = document.getElementById('new-game-btn');
const rulesBtn = document.getElementById('rules-btn');
const playerStatus = document.getElementById('player-status');
const computerStatus = document.getElementById('computer-status');

// Модальные окна
const winModal = document.getElementById('win-modal');
const loseModal = document.getElementById('lose-modal');
const drawModal = document.getElementById('draw-modal');
const rulesModal = document.getElementById('rules-modal');

// Игровые переменные
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X'; // Игрок всегда X
let gameActive = true;
let gameMode = 'player'; // 'player' или 'computer'

// Сообщения о статусе
const statusMessages = {
    playerTurn: 'Ваш ход',
    computerTurn: 'Ход компьютера',
    playerWon: 'Вы победили!',
    computerWon: 'Компьютер победил',
    draw: 'Ничья!'
};

// Победные комбинации
const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Горизонтальные
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Вертикальные
    [0, 4, 8], [2, 4, 6]             // Диагональные
];

// Инициализация событий
function initializeEventListeners() {
    // Кнопки закрытия модальных окон
    document.getElementById('close-win-modal').addEventListener('click', () => {
        winModal.style.display = 'none';
        startNewGame();
    });
    
    document.getElementById('close-lose-modal').addEventListener('click', () => {
        loseModal.style.display = 'none';
        startNewGame();
    });
    
    document.getElementById('close-draw-modal').addEventListener('click', () => {
        drawModal.style.display = 'none';
        startNewGame();
    });
    
    document.getElementById('close-rules-modal').addEventListener('click', () => {
        rulesModal.style.display = 'none';
    });
    
    // Кнопка правил
    rulesBtn.addEventListener('click', () => {
        rulesModal.style.display = 'flex';
    });
    
    // Кнопка новой игры
    newGameBtn.addEventListener('click', startNewGame);
}

// Инициализация игрового поля
function initializeBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', () => handleCellClick(i));
        gameBoard.appendChild(cell);
    }
    
    updateStatus();
}

// Обновление статуса игры
function updateStatus() {
    if (gameMode === 'player') {
        playerStatus.textContent = statusMessages.playerTurn;
        computerStatus.textContent = 'Ожидание';
    } else {
        playerStatus.textContent = 'Ожидание';
        computerStatus.textContent = statusMessages.computerTurn;
    }
}

// Обработка клика по клетке
function handleCellClick(index) {
    if (!gameActive || board[index] !== '' || gameMode !== 'player') {
        return;
    }
    
    makeMove(index, 'X');
    
    if (gameActive) {
        gameMode = 'computer';
        updateStatus();
        
        // Ход компьютера с задержкой для реалистичности
        setTimeout(() => {
            computerMove();
        }, 800);
    }
}

// Выполнение хода
function makeMove(index, player) {
    board[index] = player;
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
    
    checkGameResult();
}

// Ход компьютера (простой ИИ)
function computerMove() {
    if (!gameActive || gameMode !== 'computer') {
        return;
    }
    
    // Сначала попробовать выиграть
    let move = findWinningMove('O');
    
    // Если выигрышного хода нет, попробовать заблокировать игрока
    if (move === -1) {
        move = findWinningMove('X');
    }
    
    // Если нет блокирующего хода, попробовать занять центр
    if (move === -1 && board[4] === '') {
        move = 4;
    }
    
    // Если центр занят, выбрать случайную свободную клетку
    if (move === -1) {
        const availableMoves = board.map((cell, index) => cell === '' ? index : -1).filter(index => index !== -1);
        if (availableMoves.length > 0) {
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
    }
    
    if (move !== -1) {
        makeMove(move, 'O');
        gameMode = 'player';
        updateStatus();
    }
}

// Поиск выигрышного хода
function findWinningMove(player) {
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        
        // Проверяем, есть ли два знака игрока и одна пустая клетка в линии
        if (board[a] === player && board[b] === player && board[c] === '') {
            return c;
        }
        if (board[a] === player && board[c] === player && board[b] === '') {
            return b;
        }
        if (board[b] === player && board[c] === player && board[a] === '') {
            return a;
        }
    }
    return -1;
}

// Проверка результата игры
function checkGameResult() {
    let roundWon = false;
    let winner = null;
    
    // Проверка победных комбинаций
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            winner = board[a];
            break;
        }
    }
    
    if (roundWon) {
        gameActive = false;
        
        if (winner === 'X') {
            // Победа игрока
            playerStatus.textContent = statusMessages.playerWon;
            computerStatus.textContent = 'Проиграл';
            
            // Генерация промокода
            const promoCode = generatePromoCode();
            document.getElementById('promo-code').textContent = promoCode;
            
            // Отправка в Telegram
            if (typeof sendTelegramMessage === 'function') {
                sendTelegramMessage(`Победа! Промокод выдан: ${promoCode}`, 'win');
            }
            
            // Показать модальное окно победы
            setTimeout(() => {
                winModal.style.display = 'flex';
            }, 800);
            
        } else {
            // Победа компьютера
            playerStatus.textContent = 'Проиграли';
            computerStatus.textContent = statusMessages.computerWon;
            
            // Отправка в Telegram
            if (typeof sendTelegramMessage === 'function') {
                sendTelegramMessage('Проигрыш', 'lose');
            }
            
            // Показать модальное окно проигрыша
            setTimeout(() => {
                loseModal.style.display = 'flex';
            }, 800);
        }
        
        return;
    }
    
    // Проверка на ничью
    if (!board.includes('')) {
        gameActive = false;
        playerStatus.textContent = statusMessages.draw;
        computerStatus.textContent = statusMessages.draw;
        
        // Отправка в Telegram
        if (typeof sendTelegramMessage === 'function') {
            sendTelegramMessage('Ничья', 'draw');
        }
        
        // Показать модальное окно ничьей
        setTimeout(() => {
            drawModal.style.display = 'flex';
        }, 800);
    }
}

// Генерация промокода
function generatePromoCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Исключаем похожие символы
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Начало новой игры
function startNewGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    gameMode = 'player';
    initializeBoard();
    
    // Для тестирования
    console.log("Новая игра начата!");
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    initializeBoard();
    
    console.log("Игра 'Крестики-нолики' загружена!");
    console.log("Для работы с Telegram-ботом настройте telegram-bot.js");
});