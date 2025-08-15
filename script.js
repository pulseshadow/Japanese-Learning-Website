// Game state
let currentPage = 'start';
let currentRound = 1;
let currentPhase = 'learning'; // 'learning' or 'repeating'
let currentQuestionIndex = 0;
let correctAnswers = {}; // Track correct answers per word
let questionQueue = []; // Queue for upcoming questions
let allLearnedWords = []; // All words from previous introduction rounds
let wordsWithPendingPoints = new Set(); // Track words that have pending points from incorrect answers
let currentQuestionFailed = false; // Track if current question was answered incorrectly

// Word pools for each round (placeholder words as requested)
const wordPools = {
    1: [ // Introduction Round 1
        { japanese: 'dog', english: 'dog' },
        { japanese: 'cat', english: 'cat' },
        { japanese: 'house', english: 'house' },
        { japanese: 'car', english: 'car' },
        { japanese: 'water', english: 'water' }
    ],
    2: [ // Practice Round 1 (same as round 1)
        { japanese: 'dog', english: 'dog' },
        { japanese: 'cat', english: 'cat' },
        { japanese: 'house', english: 'house' },
        { japanese: 'car', english: 'car' },
        { japanese: 'water', english: 'water' }
    ],
    3: [ // Introduction Round 2
        { japanese: 'book', english: 'book' },
        { japanese: 'desk', english: 'desk' },
        { japanese: 'phone', english: 'phone' },
        { japanese: 'window', english: 'window' },
        { japanese: 'clock', english: 'clock' }
    ],
    4: [ // Practice Round 2 (rounds 1 + 3 combined)
        { japanese: 'dog', english: 'dog' },
        { japanese: 'cat', english: 'cat' },
        { japanese: 'house', english: 'house' },
        { japanese: 'car', english: 'car' },
        { japanese: 'water', english: 'water' },
        { japanese: 'book', english: 'book' },
        { japanese: 'desk', english: 'desk' },
        { japanese: 'phone', english: 'phone' },
        { japanese: 'window', english: 'window' },
        { japanese: 'clock', english: 'clock' }
    ]
};

// DOM elements
const startPage = document.getElementById('start-page');
const scriptPage = document.getElementById('script-page');
const gamePage = document.getElementById('game-page');
const bruteForceBtn = document.getElementById('brute-force-btn');
const hiraganaBtn = document.getElementById('hiragana-btn');
const katakanaBtn = document.getElementById('katakana-btn');
const backToStartBtn = document.getElementById('back-to-start');
const backToScriptBtn = document.getElementById('back-to-script');
const roundTitle = document.getElementById('round-title');
const currentQuestionSpan = document.getElementById('current-question');
const totalQuestionsSpan = document.getElementById('total-questions');
const japaneseWord = document.getElementById('japanese-word');
const answerInput = document.getElementById('answer-input');
const submitBtn = document.getElementById('submit-btn');
const correctAnswerDisplay = document.getElementById('correct-answer-display');
const nextRoundBtn = document.getElementById('next-round-btn');

// Event listeners
bruteForceBtn.addEventListener('click', () => showPage('script'));
hiraganaBtn.addEventListener('click', startGame);
katakanaBtn.addEventListener('click', () => alert('Katakana mode coming soon!'));
backToStartBtn.addEventListener('click', () => showPage('start'));
backToScriptBtn.addEventListener('click', () => showPage('script'));

// Auto-submit on input change with letter-by-letter checking
answerInput.addEventListener('input', (e) => {
    const userAnswer = e.target.value.trim().toLowerCase();
    const currentWord = getCurrentWord();
    
    if (!currentWord) return;
    
    const correctAnswer = currentWord.english.toLowerCase();
    
    // Check if the user answer is completely correct
    if (userAnswer === correctAnswer) {
        // Correct answer - automatically proceed
        setTimeout(() => {
            submitAnswer();
        }, 100); // Small delay for visual feedback
        return;
    }
    
    // Check if the user answer is wrong (letter-by-letter check)
    if (userAnswer.length > 0) {
        // Check if the current input is wrong compared to the correct answer
        const isWrong = checkIfAnswerIsWrong(userAnswer, correctAnswer);
        
        if (isWrong) {
            // Wrong answer detected - show error and clear input
            showErrorAndClearInput(currentWord.english);
            return;
        }
    }
});

answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitAnswer();
    }
});

submitBtn.addEventListener('click', submitAnswer);
nextRoundBtn.addEventListener('click', nextRound);

// Collapsible section functionality
function toggleSection(sectionId) {
    const content = document.getElementById(sectionId);
    const button = content.previousElementSibling.querySelector('.collapse-btn');
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        button.classList.remove('rotated');
    } else {
        content.classList.add('collapsed');
        button.classList.add('rotated');
    }
}

// Function to check if the current input is wrong
function checkIfAnswerIsWrong(userAnswer, correctAnswer) {
    // If user answer is longer than correct answer, it's wrong
    if (userAnswer.length > correctAnswer.length) {
        return true;
    }
    
    // Check each character - if any character doesn't match, it's wrong
    for (let i = 0; i < userAnswer.length; i++) {
        if (userAnswer[i] !== correctAnswer[i]) {
            return true;
        }
    }
    
    return false;
}

// Function to show error and clear input
function showErrorAndClearInput(correctAnswer) {
    correctAnswerDisplay.textContent = correctAnswer;
    correctAnswerDisplay.classList.remove('hidden');
    
    answerInput.classList.add('error');
    answerInput.value = '';
    
    // Mark current question as failed
    currentQuestionFailed = true;
    
    setTimeout(() => {
        answerInput.classList.remove('error');
        answerInput.focus();
    }, 500);
}

// Navigation functions
function showPage(page) {
    currentPage = page;
    
    // Hide all pages
    startPage.classList.remove('active');
    scriptPage.classList.remove('active');
    gamePage.classList.remove('active');
    
    // Show target page
    switch(page) {
        case 'start':
            startPage.classList.add('active');
            break;
        case 'script':
            scriptPage.classList.add('active');
            break;
        case 'game':
            gamePage.classList.add('active');
            break;
    }
}

// Game functions
function startGame() {
    currentRound = 1;
    currentPhase = 'learning';
    currentQuestionIndex = 0;
    correctAnswers = {};
    questionQueue = [];
    allLearnedWords = [];
    wordsWithPendingPoints = new Set();
    currentQuestionFailed = false;
    
    showPage('game');
    initializeRound();
}

function initializeRound() {
    const isIntroductionRound = currentRound % 2 === 1;
    const roundWords = getCurrentRoundWords();
    
    if (isIntroductionRound) {
        roundTitle.textContent = `Introduction Round ${Math.ceil(currentRound / 2)}`;
        currentPhase = 'learning';
        // In learning phase, show each word once with answer
        currentQuestionIndex = 0;
        showLearningQuestion();
    } else {
        roundTitle.textContent = `Practice Round ${Math.ceil(currentRound / 2)}`;
        currentPhase = 'repeating';
        // In practice phase, initialize queue with all words
        initializeQuestionQueue();
        showNextQuestion();
    }
    
    updateProgress();
}

function getCurrentRoundWords() {
    if (currentRound % 2 === 1) {
        // Introduction round - use current round's word pool
        return wordPools[currentRound] || [];
    } else {
        // Practice round - combine all previous introduction rounds
        let allWords = [];
        for (let i = 1; i <= currentRound; i += 2) {
            if (wordPools[i]) {
                allWords = allWords.concat(wordPools[i]);
            }
        }
        return allWords;
    }
}

function getCurrentWord() {
    if (currentPhase === 'learning') {
        const roundWords = getCurrentRoundWords();
        return roundWords[currentQuestionIndex];
    } else {
        return questionQueue[0];
    }
}

function showLearningQuestion() {
    const roundWords = getCurrentRoundWords();
    
    if (currentQuestionIndex >= roundWords.length) {
        // Learning phase complete, move to repeating phase
        currentPhase = 'repeating';
        initializeQuestionQueue();
        showNextQuestion();
        return;
    }
    
    const word = roundWords[currentQuestionIndex];
    japaneseWord.textContent = word.japanese;
    correctAnswerDisplay.textContent = word.english;
    correctAnswerDisplay.classList.remove('hidden');
    
    answerInput.value = '';
    answerInput.focus();
    
    updateProgress();
}

function initializeQuestionQueue() {
    const roundWords = getCurrentRoundWords();
    questionQueue = [];
    
    // Create initial queue of 21 questions
    for (let i = 0; i < 21; i++) {
        const randomWord = roundWords[Math.floor(Math.random() * roundWords.length)];
        questionQueue.push(randomWord);
    }
}

function showNextQuestion() {
    if (questionQueue.length === 0) {
        // Refill queue if empty
        const roundWords = getCurrentRoundWords();
        for (let i = 0; i < 21; i++) {
            const randomWord = roundWords[Math.floor(Math.random() * roundWords.length)];
            questionQueue.push(randomWord);
        }
    }
    
    const currentWord = questionQueue[0];
    japaneseWord.textContent = currentWord.japanese;
    correctAnswerDisplay.classList.add('hidden');
    
    answerInput.value = '';
    answerInput.focus();
    
    // Reset the failed flag for new question
    currentQuestionFailed = false;
    
    updateProgress();
    updateNextRoundButton();
}

function submitAnswer() {
    const userAnswer = answerInput.value.trim().toLowerCase();
    const currentWord = getCurrentWord();
    
    if (!currentWord) return;
    
    if (currentPhase === 'learning') {
        // Learning phase - just check if answer is correct
        if (userAnswer === currentWord.english.toLowerCase()) {
            currentQuestionIndex++;
            showLearningQuestion();
        } else {
            // Show error but don't move on
            showError(currentWord.english);
        }
    } else {
        // Repeating phase - full game logic
        if (userAnswer === currentWord.english.toLowerCase()) {
            // Correct answer
            handleCorrectAnswer();
        } else {
            // Incorrect answer
            handleIncorrectAnswer(currentWord);
        }
    }
}

function handleCorrectAnswer() {
    const currentWord = questionQueue.shift(); // Remove from queue
    const wordKey = currentWord.japanese;
    
    // Check if this word has a pending point from a previous incorrect answer
    if (wordsWithPendingPoints.has(wordKey)) {
        // Award the pending point
        if (!correctAnswers[wordKey]) {
            correctAnswers[wordKey] = 0;
        }
        correctAnswers[wordKey]++;
        wordsWithPendingPoints.delete(wordKey);
        console.log(`Awarded pending point for ${wordKey}. Total: ${correctAnswers[wordKey]}`);
    } else if (!currentQuestionFailed) {
        // Normal correct answer - award point immediately (only if question wasn't failed)
        if (!correctAnswers[wordKey]) {
            correctAnswers[wordKey] = 0;
        }
        correctAnswers[wordKey]++;
        console.log(`Awarded immediate point for ${wordKey}. Total: ${correctAnswers[wordKey]}`);
    } else {
        // Question was failed, no point awarded
        console.log(`No point awarded for ${wordKey} - question was previously failed`);
    }
    
    // Check if all words have 3 correct answers
    updateNextRoundButton();
    
    // Show next question
    showNextQuestion();
}

function handleIncorrectAnswer(word) {
    // Show error
    showError(word.english);
    
    // Add word back to queue at positions 5 and 10 ahead
    const queueLength = questionQueue.length;
    
    // Remove existing instances of this word from queue
    questionQueue = questionQueue.filter(w => w.japanese !== word.japanese);
    
    // Add word at position 5 and 10
    const insertPositions = [5, 10];
    insertPositions.forEach(pos => {
        if (pos <= queueLength) {
            questionQueue.splice(pos, 0, word);
        }
    });
    
    // Mark this word as having a pending point
    wordsWithPendingPoints.add(word.japanese);
    console.log(`Added pending point for ${word.japanese}. Will be awarded on second correct answer.`);
    
    // Ensure queue has minimum length
    while (questionQueue.length < 21) {
        const roundWords = getCurrentRoundWords();
        const randomWord = roundWords[Math.floor(Math.random() * roundWords.length)];
        questionQueue.push(randomWord);
    }
}

function showError(correctAnswer) {
    correctAnswerDisplay.textContent = correctAnswer;
    correctAnswerDisplay.classList.remove('hidden');
    
    answerInput.classList.add('error');
    setTimeout(() => {
        answerInput.classList.remove('error');
    }, 500);
}

function updateProgress() {
    if (currentPhase === 'learning') {
        const roundWords = getCurrentRoundWords();
        currentQuestionSpan.textContent = currentQuestionIndex + 1;
        totalQuestionsSpan.textContent = roundWords.length;
    } else {
        const roundWords = getCurrentRoundWords();
        const totalCorrect = Object.values(correctAnswers).reduce((sum, count) => sum + count, 0);
        const targetCorrect = roundWords.length * 3;
        currentQuestionSpan.textContent = totalCorrect;
        totalQuestionsSpan.textContent = targetCorrect;
    }
}

function updateNextRoundButton() {
    if (currentPhase === 'learning') {
        nextRoundBtn.classList.add('disabled');
        return;
    }
    
    const roundWords = getCurrentRoundWords();
    const allWordsHaveThreeCorrect = roundWords.every(word => 
        (correctAnswers[word.japanese] || 0) >= 3
    );
    
    if (allWordsHaveThreeCorrect) {
        nextRoundBtn.classList.remove('disabled');
    } else {
        nextRoundBtn.classList.add('disabled');
    }
}

function nextRound() {
    if (nextRoundBtn.classList.contains('disabled')) {
        return;
    }
    
    currentRound++;
    currentPhase = 'learning';
    currentQuestionIndex = 0;
    correctAnswers = {};
    questionQueue = [];
    wordsWithPendingPoints = new Set();
    currentQuestionFailed = false;
    
    // Add words from this introduction round to all learned words
    if (currentRound % 2 === 1) {
        const roundWords = getCurrentRoundWords();
        allLearnedWords = allLearnedWords.concat(roundWords);
    }
    
    initializeRound();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    showPage('start');
});
