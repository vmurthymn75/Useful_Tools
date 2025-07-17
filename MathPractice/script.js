document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const themeToggle = document.getElementById('theme-toggle');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');
    const difficultySelection = document.getElementById('difficulty-selection');
    const gameSection = document.getElementById('game-section');
    const num1El = document.getElementById('num1');
    const num2El = document.getElementById('num2');
    const operatorEl = document.getElementById('operator');
    const answerInput = document.getElementById('answer-input');
    const submitBtn = document.getElementById('submit-btn');
    const nextBtn = document.getElementById('next-btn');
    const feedbackText = document.getElementById('feedback-text');
    const correctCountEl = document.getElementById('correct-count');
    const totalCountEl = document.getElementById('total-count');
    const starContainer = document.getElementById('star-container');

    // --- Audio ---
    const correctSound = new Audio('correct.mp3');
    const wrongSound = new Audio('wrong.mp3');

    // --- Game State ---
    let currentDifficulty = 'easy';
    let currentAnswer = 0;
    let correctCount = 0;
    let totalCount = 0;
    let correctStreak = 0;

    // --- Theme Handling ---
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode', themeToggle.checked);
        document.body.classList.toggle('light-mode', !themeToggle.checked);
    });
    // Set initial theme
    document.body.classList.add('dark-mode');
    themeToggle.checked = true;

    // --- Event Listeners ---
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentDifficulty = button.dataset.level;
            startGame();
        });
    });

    submitBtn.addEventListener('click', checkAnswer);
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });

    nextBtn.addEventListener('click', generateQuestion);

    // --- Game Logic ---
    function startGame() {
        difficultySelection.classList.add('hidden');
        gameSection.classList.remove('hidden');
        correctCount = 0;
        totalCount = 0;
        correctStreak = 0;
        updateScore();
        generateQuestion();
    }

    function generateQuestion() {
        feedbackText.textContent = '';
        answerInput.value = '';
        answerInput.disabled = false;
        submitBtn.classList.remove('hidden');
        nextBtn.classList.add('hidden');
        starContainer.innerHTML = '';

        let num1, num2, operator;
        const operators = ['+', '-', '*', '/'];

        switch (currentDifficulty) {
            case 'easy':
                num1 = Math.floor(Math.random() * 10);
                num2 = Math.floor(Math.random() * 10);
                operator = Math.random() > 0.5 ? '+' : '-';
                if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1]; // Avoid negative answers
                break;
            case 'medium':
                if (Math.random() > 0.5) { // Addition/Subtraction
                    num1 = Math.floor(Math.random() * 90) + 10;
                    num2 = Math.floor(Math.random() * 90) + 10;
                    operator = Math.random() > 0.5 ? '+' : '-';
                    if (operator === '-' && num1 < num2) [num1, num2] = [num2, num1];
                } else { // Small Multiplication
                    num1 = Math.floor(Math.random() * 10) + 1;
                    num2 = Math.floor(Math.random() * 10) + 1;
                    operator = '*';
                }
                break;
            case 'hard':
                 if (Math.random() > 0.5) { // Multiplication
                    num1 = Math.floor(Math.random() * 12) + 1;
                    num2 = Math.floor(Math.random() * 12) + 1;
                    operator = '*';
                } else { // Division
                    const divisor = Math.floor(Math.random() * 10) + 1;
                    const quotient = Math.floor(Math.random() * 10) + 1;
                    num1 = divisor * quotient;
                    num2 = divisor;
                    operator = '/';
                }
                break;
        }

        num1El.textContent = num1;
        num2El.textContent = num2;
        operatorEl.textContent = operator;

        currentAnswer = eval(`${num1} ${operator} ${num2}`);
        gameSection.style.animation = 'pop-in 0.5s';
        setTimeout(() => gameSection.style.animation = '', 500);
    }

    function checkAnswer() {
        const userAnswer = parseInt(answerInput.value);
        totalCount++;
        answerInput.disabled = true;
        submitBtn.classList.add('hidden');
        nextBtn.classList.remove('hidden');

        if (userAnswer === currentAnswer) {
            correctCount++;
            correctStreak++;
            feedbackText.textContent = 'Correct! Great job! ✅';
            feedbackText.className = 'correct';
            correctSound.play();
            if (correctStreak % 5 === 0) {
                addStars();
            }
        } else {
            correctStreak = 0;
            feedbackText.textContent = `Not quite! The answer was ${currentAnswer}. ❌`;
            feedbackText.className = 'wrong';
            wrongSound.play();
        }
        updateScore();
    }

    function updateScore() {
        correctCountEl.textContent = correctCount;
        totalCountEl.textContent = totalCount;
    }

    function addStars() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const star = document.createElement('span');
                star.innerHTML = '⭐';
                star.style.animation = 'pop-in 0.5s';
                starContainer.appendChild(star);
            }, i * 200);
        }
    }
});