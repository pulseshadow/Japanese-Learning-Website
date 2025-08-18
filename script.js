// Game state
let currentPage = 'start';
let currentRound = 1;
let currentPhase = 'learning'; // 'learning', 'elimination', or 'repeating'
let currentQuestionIndex = 0;
let correctAnswers = {}; // Track correct answers per word
let questionQueue = []; // Queue for upcoming questions
let allLearnedWords = []; // All words from previous introduction rounds
let wordsWithPendingPoints = new Set(); // Track words that have pending points from incorrect answers
let currentQuestionFailed = false; // Track if current question was answered incorrectly
let eliminationWords = []; // Words for elimination phase (no repetition)

// Settings and language variables
let currentLanguage = 'en';
let isDarkMode = false;

// Word pools for each round (actual Japanese words)
const wordPools = {
    1: [ // Introduction Round 1
        { japanese: 'こんにちは', english: 'hi' },
        { japanese: 'ください', english: 'please' },
        { japanese: 'はい', english: 'yes' },
        { japanese: 'いいえ', english: 'no' },
        { japanese: 'わたし', english: 'i' }
    ],
    2: [ // Practice Round 1 (rounds 1 + 2 combined)
        { japanese: 'こんにちは', english: 'hi' },
        { japanese: 'ください', english: 'please' },
        { japanese: 'はい', english: 'yes' },
        { japanese: 'いいえ', english: 'no' },
        { japanese: 'わたし', english: 'i' },
        { japanese: 'だれ', english: 'who' },
        { japanese: 'なに', english: 'what' },
        { japanese: 'どう', english: 'how' },
        { japanese: 'いくら', english: 'how much' },
        { japanese: 'どの', english: 'which' },
        { japanese: 'どんな', english: 'what kind of' }
    ],
    3: [ // Introduction Round 2 (Polite Phrases)
        { japanese: 'ありがとうございます', english: 'thanks (polite)' },
        { japanese: 'すみません', english: 'excuse me' },
        { japanese: 'ごめんなさい', english: 'sorry' },
        { japanese: 'はじめまして', english: 'nice to meet you' },
        { japanese: 'お願いします', english: 'please (request)' }
    ],
    4: [ // Practice Round 2 (rounds 1 + 3 combined)
        { japanese: 'こんにちは', english: 'hi' },
        { japanese: 'ください', english: 'please' },
        { japanese: 'はい', english: 'yes' },
        { japanese: 'いいえ', english: 'no' },
        { japanese: 'わたし', english: 'i' },
        { japanese: 'だれ', english: 'who' },
        { japanese: 'なに', english: 'what' },
        { japanese: 'どう', english: 'how' },
        { japanese: 'いくら', english: 'how much' },
        { japanese: 'どの', english: 'which' },
        { japanese: 'どんな', english: 'what kind of' },
        { japanese: 'ありがとうございます', english: 'thanks (polite)' },
        { japanese: 'すみません', english: 'excuse me' },
        { japanese: 'ごめんなさい', english: 'sorry' },
        { japanese: 'はじめまして', english: 'nice to meet you' },
        { japanese: 'お願いします', english: 'please (request)' }
    ],
    5: [ // Introduction Round 3 (Core Verbs)
        { japanese: 'する', english: '(to) do' },
        { japanese: 'いく', english: '(to) go' },
        { japanese: 'くる', english: '(to) come' },
        { japanese: 'たべる', english: '(to) eat' },
        { japanese: 'のむ', english: '(to) drink' },
        { japanese: 'みる', english: '(to) see' }
    ],
    6: [ // Practice Round 3 (rounds 1 + 3 + 5 combined)
        { japanese: 'こんにちは', english: 'hi' },
        { japanese: 'ください', english: 'please' },
        { japanese: 'はい', english: 'yes' },
        { japanese: 'いいえ', english: 'no' },
        { japanese: 'わたし', english: 'i' },
        { japanese: 'だれ', english: 'who' },
        { japanese: 'なに', english: 'what' },
        { japanese: 'どう', english: 'how' },
        { japanese: 'いくら', english: 'how much' },
        { japanese: 'どの', english: 'which' },
        { japanese: 'どんな', english: 'what kind of' },
        { japanese: 'ありがとうございます', english: 'thanks (polite)' },
        { japanese: 'すみません', english: 'excuse me' },
        { japanese: 'ごめんなさい', english: 'sorry' },
        { japanese: 'はじめまして', english: 'nice to meet you' },
        { japanese: 'お願いします', english: 'please (request)' },
        { japanese: 'する', english: '(to) do' },
        { japanese: 'いく', english: '(to) go' },
        { japanese: 'くる', english: '(to) come' },
        { japanese: 'たべる', english: '(to) eat' },
        { japanese: 'のむ', english: '(to) drink' },
        { japanese: 'みる', english: '(to) see' }
    ],
    7: [ // Introduction Round 4 (Core Verbs Continued)
        { japanese: 'いる', english: '(to) exist (animate)' },
        { japanese: 'ある', english: '(to) exist (inanimate)' },
        { japanese: 'きく', english: '(to) hear' },
        { japanese: 'はなす', english: '(to) speak' },
        { japanese: 'わかる', english: '(to) understand' },
        { japanese: 'しる', english: '(to) know' },
        { japanese: 'ほしい', english: '(to) want' }
    ],
    8: [ // Practice Round 4 (rounds 1 + 3 + 5 + 7 combined)
        { japanese: 'こんにちは', english: 'hi' },
        { japanese: 'ください', english: 'please' },
        { japanese: 'はい', english: 'yes' },
        { japanese: 'いいえ', english: 'no' },
        { japanese: 'わたし', english: 'i' },
        { japanese: 'だれ', english: 'who' },
        { japanese: 'なに', english: 'what' },
        { japanese: 'どう', english: 'how' },
        { japanese: 'いくら', english: 'how much' },
        { japanese: 'どの', english: 'which' },
        { japanese: 'どんな', english: 'what kind of' },
        { japanese: 'ありがとうございます', english: 'thanks (polite)' },
        { japanese: 'すみません', english: 'excuse me' },
        { japanese: 'ごめんなさい', english: 'sorry' },
        { japanese: 'はじめまして', english: 'nice to meet you' },
        { japanese: 'お願いします', english: 'please (request)' },
        { japanese: 'する', english: '(to) do' },
        { japanese: 'いく', english: '(to) go' },
        { japanese: 'くる', english: '(to) come' },
        { japanese: 'たべる', english: '(to) eat' },
        { japanese: 'のむ', english: '(to) drink' },
        { japanese: 'みる', english: '(to) see' },
        { japanese: 'いる', english: '(to) exist (animate)' },
        { japanese: 'ある', english: '(to) exist (inanimate)' },
        { japanese: 'きく', english: '(to) hear' },
        { japanese: 'はなす', english: '(to) speak' },
        { japanese: 'わかる', english: '(to) understand' },
        { japanese: 'しる', english: '(to) know' },
        { japanese: 'ほしい', english: '(to) want' }
    ],
    9: [ // Introduction Round 5 (Core Adjectives)
        { japanese: 'おおきい', english: 'big' },
        { japanese: 'ちいさい', english: 'small' },
        { japanese: 'おおい', english: 'many' },
        { japanese: 'すくない', english: 'few' },
        { japanese: 'いい', english: 'good' },
        { japanese: 'わるい', english: 'bad' },
        { japanese: 'あたらしい', english: 'new' },
        { japanese: 'ふるい', english: 'old (things)' }
    ],
    10: [ // Practice Round 5 (rounds 1 + 3 + 5 + 7 + 9 combined)
        { japanese: 'こんにちは', english: 'hi' },
        { japanese: 'ください', english: 'please' },
        { japanese: 'はい', english: 'yes' },
        { japanese: 'いいえ', english: 'no' },
        { japanese: 'わたし', english: 'i' },
        { japanese: 'だれ', english: 'who' },
        { japanese: 'なに', english: 'what' },
        { japanese: 'どう', english: 'how' },
        { japanese: 'いくら', english: 'how much' },
        { japanese: 'どの', english: 'which' },
        { japanese: 'どんな', english: 'what kind of' },
        { japanese: 'ありがとうございます', english: 'thanks (polite)' },
        { japanese: 'すみません', english: 'excuse me' },
        { japanese: 'ごめんなさい', english: 'sorry' },
        { japanese: 'はじめまして', english: 'nice to meet you' },
        { japanese: 'お願いします', english: 'please (request)' },
        { japanese: 'する', english: '(to) do' },
        { japanese: 'いく', english: '(to) go' },
        { japanese: 'くる', english: '(to) come' },
        { japanese: 'たべる', english: '(to) eat' },
        { japanese: 'のむ', english: '(to) drink' },
        { japanese: 'みる', english: '(to) see' },
        { japanese: 'いる', english: '(to) exist (animate)' },
        { japanese: 'ある', english: '(to) exist (inanimate)' },
        { japanese: 'きく', english: '(to) hear' },
        { japanese: 'はなす', english: '(to) speak' },
        { japanese: 'わかる', english: '(to) understand' },
        { japanese: 'しる', english: '(to) know' },
        { japanese: 'ほしい', english: '(to) want' },
        { japanese: 'おおきい', english: 'big' },
        { japanese: 'ちいさい', english: 'small' },
        { japanese: 'おおい', english: 'many' },
        { japanese: 'すくない', english: 'few' },
        { japanese: 'いい', english: 'good' },
        { japanese: 'わるい', english: 'bad' },
        { japanese: 'あたらしい', english: 'new' },
        { japanese: 'ふるい', english: 'old (things)' }
    ],
    11: [ // Introduction Round 6 (Core Adjectives Continued)
        { japanese: 'ちかい', english: 'near' },
        { japanese: 'とおい', english: 'far' },
        { japanese: 'あつい', english: 'hot (weather)' },
        { japanese: 'さむい', english: 'cold (weather)' },
        { japanese: 'たかい', english: 'expensive' },
        { japanese: 'やすい', english: 'cheap' }
    ],
    12: [ // Practice Round 6 (rounds 1 + 3 + 5 + 7 + 9 + 11 combined)
        { japanese: 'こんにちは', english: 'hi' },
        { japanese: 'ください', english: 'please' },
        { japanese: 'はい', english: 'yes' },
        { japanese: 'いいえ', english: 'no' },
        { japanese: 'わたし', english: 'i' },
        { japanese: 'だれ', english: 'who' },
        { japanese: 'なに', english: 'what' },
        { japanese: 'どう', english: 'how' },
        { japanese: 'いくら', english: 'how much' },
        { japanese: 'どの', english: 'which' },
        { japanese: 'どんな', english: 'what kind of' },
        { japanese: 'ありがとうございます', english: 'thanks (polite)' },
        { japanese: 'すみません', english: 'excuse me' },
        { japanese: 'ごめんなさい', english: 'sorry' },
        { japanese: 'はじめまして', english: 'nice to meet you' },
        { japanese: 'お願いします', english: 'please (request)' },
        { japanese: 'する', english: '(to) do' },
        { japanese: 'いく', english: '(to) go' },
        { japanese: 'くる', english: '(to) come' },
        { japanese: 'たべる', english: '(to) eat' },
        { japanese: 'のむ', english: '(to) drink' },
        { japanese: 'みる', english: '(to) see' },
        { japanese: 'いる', english: '(to) exist (animate)' },
        { japanese: 'ある', english: '(to) exist (inanimate)' },
        { japanese: 'きく', english: '(to) hear' },
        { japanese: 'はなす', english: '(to) speak' },
        { japanese: 'わかる', english: '(to) understand' },
        { japanese: 'しる', english: '(to) know' },
        { japanese: 'ほしい', english: '(to) want' },
        { japanese: 'おおきい', english: 'big' },
        { japanese: 'ちいさい', english: 'small' },
        { japanese: 'おおい', english: 'many' },
        { japanese: 'すくない', english: 'few' },
        { japanese: 'いい', english: 'good' },
        { japanese: 'わるい', english: 'bad' },
        { japanese: 'あたらしい', english: 'new' },
        { japanese: 'ふるい', english: 'old (things)' },
        { japanese: 'ちかい', english: 'near' },
        { japanese: 'とおい', english: 'far' },
        { japanese: 'あつい', english: 'hot (weather)' },
        { japanese: 'さむい', english: 'cold (weather)' },
        { japanese: 'たかい', english: 'expensive' },
        { japanese: 'やすい', english: 'cheap' }
    ],
    13: [ // Introduction Round 7 (Essential Particles)
        { japanese: 'は', english: 'is (topic marker)' },
        { japanese: 'と', english: 'and (/with)' },
        { japanese: 'も', english: 'also (/too)' }
    ],
    14: [ // Practice Round 7 (rounds 1 + 3 + 5 + 7 + 9 + 11 + 13 combined)
        { japanese: 'こんにちは', english: 'hi' },
        { japanese: 'ください', english: 'please' },
        { japanese: 'はい', english: 'yes' },
        { japanese: 'いいえ', english: 'no' },
        { japanese: 'わたし', english: 'i' },
        { japanese: 'だれ', english: 'who' },
        { japanese: 'なに', english: 'what' },
        { japanese: 'どう', english: 'how' },
        { japanese: 'いくら', english: 'how much' },
        { japanese: 'どの', english: 'which' },
        { japanese: 'どんな', english: 'what kind of' },
        { japanese: 'ありがとうございます', english: 'thanks (polite)' },
        { japanese: 'すみません', english: 'excuse me' },
        { japanese: 'ごめんなさい', english: 'sorry' },
        { japanese: 'はじめまして', english: 'nice to meet you' },
        { japanese: 'お願いします', english: 'please (request)' },
        { japanese: 'する', english: '(to) do' },
        { japanese: 'いく', english: '(to) go' },
        { japanese: 'くる', english: '(to) come' },
        { japanese: 'たべる', english: '(to) eat' },
        { japanese: 'のむ', english: '(to) drink' },
        { japanese: 'みる', english: '(to) see' },
        { japanese: 'いる', english: '(to) exist (animate)' },
        { japanese: 'ある', english: '(to) exist (inanimate)' },
        { japanese: 'きく', english: '(to) hear' },
        { japanese: 'はなす', english: '(to) speak' },
        { japanese: 'わかる', english: '(to) understand' },
        { japanese: 'しる', english: '(to) know' },
        { japanese: 'ほしい', english: '(to) want' },
        { japanese: 'おおきい', english: 'big' },
        { japanese: 'ちいさい', english: 'small' },
        { japanese: 'おおい', english: 'many' },
        { japanese: 'すくない', english: 'few' },
        { japanese: 'いい', english: 'good' },
        { japanese: 'わるい', english: 'bad' },
        { japanese: 'あたらしい', english: 'new' },
        { japanese: 'ふるい', english: 'old (things)' },
        { japanese: 'ちかい', english: 'near' },
        { japanese: 'とおい', english: 'far' },
        { japanese: 'あつい', english: 'hot (weather)' },
        { japanese: 'さむい', english: 'cold (weather)' },
        { japanese: 'たかい', english: 'expensive' },
        { japanese: 'やすい', english: 'cheap' },
        { japanese: 'は', english: 'is (topic marker)' },
        { japanese: 'と', english: 'and (/with)' },
        { japanese: 'も', english: 'also (/too)' }
    ],
    15: [ // Introduction Round 8 (Survival Phrases)
        { japanese: 'みず', english: 'water' },
        { japanese: 'ごはん', english: 'rice (or meal)' },
        { japanese: 'ちかてつ', english: 'subway' },
        { japanese: 'ちず', english: 'map' },
        { japanese: 'けいたい', english: 'phone' },
        { japanese: 'くうこう', english: 'airport' }
    ],
    16: [ // Practice Round 8 (rounds 1 + 3 + 5 + 7 + 9 + 11 + 13 + 15 combined)
        { japanese: 'こんにちは', english: 'hi' },
        { japanese: 'ください', english: 'please' },
        { japanese: 'はい', english: 'yes' },
        { japanese: 'いいえ', english: 'no' },
        { japanese: 'わたし', english: 'i' },
        { japanese: 'だれ', english: 'who' },
        { japanese: 'なに', english: 'what' },
        { japanese: 'どう', english: 'how' },
        { japanese: 'いくら', english: 'how much' },
        { japanese: 'どの', english: 'which' },
        { japanese: 'どんな', english: 'what kind of' },
        { japanese: 'ありがとうございます', english: 'thanks (polite)' },
        { japanese: 'すみません', english: 'excuse me' },
        { japanese: 'ごめんなさい', english: 'sorry' },
        { japanese: 'はじめまして', english: 'nice to meet you' },
        { japanese: 'お願いします', english: 'please (request)' },
        { japanese: 'する', english: '(to) do' },
        { japanese: 'いく', english: '(to) go' },
        { japanese: 'くる', english: '(to) come' },
        { japanese: 'たべる', english: '(to) eat' },
        { japanese: 'のむ', english: '(to) drink' },
        { japanese: 'みる', english: '(to) see' },
        { japanese: 'いる', english: '(to) exist (animate)' },
        { japanese: 'ある', english: '(to) exist (inanimate)' },
        { japanese: 'きく', english: '(to) hear' },
        { japanese: 'はなす', english: '(to) speak' },
        { japanese: 'わかる', english: '(to) understand' },
        { japanese: 'しる', english: '(to) know' },
        { japanese: 'ほしい', english: '(to) want' },
        { japanese: 'おおきい', english: 'big' },
        { japanese: 'ちいさい', english: 'small' },
        { japanese: 'おおい', english: 'many' },
        { japanese: 'すくない', english: 'few' },
        { japanese: 'いい', english: 'good' },
        { japanese: 'わるい', english: 'bad' },
        { japanese: 'あたらしい', english: 'new' },
        { japanese: 'ふるい', english: 'old (things)' },
        { japanese: 'ちかい', english: 'near' },
        { japanese: 'とおい', english: 'far' },
        { japanese: 'あつい', english: 'hot (weather)' },
        { japanese: 'さむい', english: 'cold (weather)' },
        { japanese: 'たかい', english: 'expensive' },
        { japanese: 'やすい', english: 'cheap' },
        { japanese: 'は', english: 'is (topic marker)' },
        { japanese: 'と', english: 'and (/with)' },
        { japanese: 'も', english: 'also (/too)' },
        { japanese: 'みず', english: 'water' },
        { japanese: 'ごはん', english: 'rice (or meal)' },
        { japanese: 'ちかてつ', english: 'subway' },
        { japanese: 'ちず', english: 'map' },
        { japanese: 'けいたい', english: 'phone' },
        { japanese: 'くうこう', english: 'airport' }
    ],
    17: [ // Introduction Round 9 (Survival Phrases Continued)
        { japanese: 'せんせい', english: 'teacher / doctor' },
        { japanese: 'ひと', english: 'person' },
        { japanese: 'にほん', english: 'japan' },
        { japanese: 'ともだち', english: 'friend' },
        { japanese: 'みせ', english: 'store' }
    ],
    18: [ // Practice Round 9 (rounds 1 + 3 + 5 + 7 + 9 + 11 + 13 + 15 + 17 combined)
        { japanese: 'こんにちは', english: 'hi' },
        { japanese: 'ください', english: 'please' },
        { japanese: 'はい', english: 'yes' },
        { japanese: 'いいえ', english: 'no' },
        { japanese: 'わたし', english: 'i' },
        { japanese: 'だれ', english: 'who' },
        { japanese: 'なに', english: 'what' },
        { japanese: 'どう', english: 'how' },
        { japanese: 'いくら', english: 'how much' },
        { japanese: 'どの', english: 'which' },
        { japanese: 'どんな', english: 'what kind of' },
        { japanese: 'ありがとうございます', english: 'thanks (polite)' },
        { japanese: 'すみません', english: 'excuse me' },
        { japanese: 'ごめんなさい', english: 'sorry' },
        { japanese: 'はじめまして', english: 'nice to meet you' },
        { japanese: 'お願いします', english: 'please (request)' },
        { japanese: 'する', english: '(to) do' },
        { japanese: 'いく', english: '(to) go' },
        { japanese: 'くる', english: '(to) come' },
        { japanese: 'たべる', english: '(to) eat' },
        { japanese: 'のむ', english: '(to) drink' },
        { japanese: 'みる', english: '(to) see' },
        { japanese: 'いる', english: '(to) exist (animate)' },
        { japanese: 'ある', english: '(to) exist (inanimate)' },
        { japanese: 'きく', english: '(to) hear' },
        { japanese: 'はなす', english: '(to) speak' },
        { japanese: 'わかる', english: '(to) understand' },
        { japanese: 'しる', english: '(to) know' },
        { japanese: 'ほしい', english: '(to) want' },
        { japanese: 'おおきい', english: 'big' },
        { japanese: 'ちいさい', english: 'small' },
        { japanese: 'おおい', english: 'many' },
        { japanese: 'すくない', english: 'few' },
        { japanese: 'いい', english: 'good' },
        { japanese: 'わるい', english: 'bad' },
        { japanese: 'あたらしい', english: 'new' },
        { japanese: 'ふるい', english: 'old (things)' },
        { japanese: 'ちかい', english: 'near' },
        { japanese: 'とおい', english: 'far' },
        { japanese: 'あつい', english: 'hot (weather)' },
        { japanese: 'さむい', english: 'cold (weather)' },
        { japanese: 'たかい', english: 'expensive' },
        { japanese: 'やすい', english: 'cheap' },
        { japanese: 'は', english: 'is (topic marker)' },
        { japanese: 'と', english: 'and (/with)' },
        { japanese: 'も', english: 'also (/too)' },
        { japanese: 'みず', english: 'water' },
        { japanese: 'ごはん', english: 'rice (or meal)' },
        { japanese: 'ちかてつ', english: 'subway' },
        { japanese: 'ちず', english: 'map' },
        { japanese: 'けいたい', english: 'phone' },
        { japanese: 'くうこう', english: 'airport' },
        { japanese: 'せんせい', english: 'teacher / doctor' },
        { japanese: 'ひと', english: 'person' },
        { japanese: 'にほん', english: 'japan' },
        { japanese: 'ともだち', english: 'friend' },
        { japanese: 'みせ', english: 'store' }
    ]
};

// DOM elements
const startPage = document.getElementById('start-page');
const scriptPage = document.getElementById('script-page');
const gamePage = document.getElementById('game-page');
const customModePage = document.getElementById('custom-mode-page');
const bruteForceBtn = document.getElementById('brute-force-btn');
const customModeBtn = document.getElementById('custom-mode-btn');
const hiraganaBtn = document.getElementById('hiragana-btn');
const katakanaBtn = document.getElementById('katakana-btn');
const backToStartBtn = document.getElementById('back-to-start');
const backToScriptBtn = document.getElementById('back-to-script');
const backToStartFromCustomBtn = document.getElementById('back-to-start-from-custom');
const roundTitle = document.getElementById('round-title');
const phaseLabel = document.getElementById('phase-label');
const currentQuestionSpan = document.getElementById('current-question');
const totalQuestionsSpan = document.getElementById('total-questions');
const phaseProgress = document.getElementById('phase-progress');
const roundProgress = document.getElementById('round-progress');
const japaneseWord = document.getElementById('japanese-word');
const answerInput = document.getElementById('answer-input');
const correctAnswerDisplay = document.getElementById('correct-answer-display');
const nextRoundBtn = document.getElementById('next-round-btn');
const roundSelector = document.getElementById('round-selector');

// Settings and language DOM elements
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const themeToggle = document.getElementById('theme-toggle');
const languageButtons = document.querySelectorAll('.lang-btn');

// Custom mode DOM elements
const addRoundBtn = document.getElementById('add-round-btn');
const removeRoundBtn = document.getElementById('remove-round-btn');
const startCustomRunBtn = document.getElementById('start-custom-run-btn');
const disablePracticeRoundsToggle = document.getElementById('disable-practice-rounds');
const customRoundsContainer = document.getElementById('custom-rounds-container');

// Event listeners
bruteForceBtn.addEventListener('click', () => showPage('script'));
customModeBtn.addEventListener('click', () => showPage('custom-mode'));
hiraganaBtn.addEventListener('click', startGame);
katakanaBtn.addEventListener('click', () => alert('Katakana mode coming soon!'));
backToStartBtn.addEventListener('click', () => showPage('start'));
backToScriptBtn.addEventListener('click', () => showPage('script'));
backToStartFromCustomBtn.addEventListener('click', () => showPage('start'));
roundSelector.addEventListener('change', (e) => changeRound(parseInt(e.target.value)));
addRoundBtn.addEventListener('click', addCustomRound);
removeRoundBtn.addEventListener('click', removeCustomRound);
startCustomRunBtn.addEventListener('click', startCustomRun);

// Settings and language event listeners
settingsBtn.addEventListener('click', toggleSettingsPanel);
themeToggle.addEventListener('change', toggleTheme);
languageButtons.forEach(btn => btn.addEventListener('click', (e) => changeLanguage(e.target.dataset.lang)));

// Close settings panel when clicking outside
document.addEventListener('click', (e) => {
    if (!settingsBtn.contains(e.target) && !settingsPanel.contains(e.target)) {
        settingsPanel.classList.add('hidden');
    }
});

// Page navigation
function showPage(pageName) {
    currentPage = pageName;
    
    // Hide all pages
    startPage.style.display = 'none';
    scriptPage.style.display = 'none';
    gamePage.style.display = 'none';
    customModePage.style.display = 'none';
    
    // Show the selected page
    if (pageName === 'start') {
        startPage.style.display = 'block';
        startPage.classList.add('active');
    } else if (pageName === 'script') {
        scriptPage.style.display = 'block';
        scriptPage.classList.add('active');
    } else if (pageName === 'game') {
        gamePage.style.display = 'block';
        gamePage.classList.add('active');
    } else if (pageName === 'custom-mode') {
        customModePage.style.display = 'block';
        customModePage.classList.add('active');
        initializeCustomMode();
    }
}

// Round selection functionality
function changeRound(roundNumber) {
    if (currentPage === 'game') {
        currentRound = roundNumber;
        initializeRound();
        updateUI();
    }
}

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
        if (checkIfAnswerIsWrong(userAnswer, correctAnswer)) {
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


nextRoundBtn.addEventListener('click', nextRound);



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
    correctAnswerDisplay.textContent = capitalizeWords(correctAnswer);
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



// Game functions
function startGame() {
    currentPage = 'game';
    
    // Check if custom mode is enabled
    if (window.customModeEnabled) {
        // Use custom word pools
        window.customWordPools = window.customWordPools || [];
        window.customModeNoPracticeRounds = window.customModeNoPracticeRounds || false;
        
        // Reset custom mode for next use
        window.customModeEnabled = false;
        window.customWordPools = null;
        window.customModeNoPracticeRounds = null;
        
        // Start custom game
        startCustomGame();
    } else {
        // Standard game mode
        currentRound = 1;
        currentPhase = 'learning';
        currentQuestionIndex = 0;
        correctAnswers = {};
        questionQueue = [];
        allLearnedWords = [];
        wordsWithPendingPoints = new Set();
        currentQuestionFailed = false;
        eliminationWords = [];
        
        // Reset progress text color to white
        const progressInfo = document.querySelector('.progress-info');
        progressInfo.classList.remove('completed');
        
        // Disable next round button at start
        nextRoundBtn.classList.add('disabled');
        
        showPage('game');
        initializeRound();
    }
}

function initializeRound() {
    const isIntroductionRound = currentRound % 2 === 1;
    const roundWords = getCurrentRoundWords();
    
    // Disable next round button at start of each round
    nextRoundBtn.classList.add('disabled');
    
    if (isIntroductionRound) {
        roundTitle.textContent = 'Introduction Round';
        currentPhase = 'learning';
        // In learning phase, show each word once with answer
        currentQuestionIndex = 0;
        showLearningQuestion();
    } else {
        roundTitle.textContent = 'Practice Round';
        currentPhase = 'elimination';
        // Start with elimination phase (no repetition)
        eliminationWords = [...roundWords]; // Copy array
        shuffleArray(eliminationWords); // Randomize order
        currentQuestionIndex = 0;
        showEliminationQuestion();
    }
    
    updateProgress();
    updatePhaseLabel();
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
    // Check if we're in custom mode
    if (window.customWordPools) {
        if (currentPhase === 'learning') {
            const roundWords = getCurrentCustomRoundWords();
            return roundWords[currentQuestionIndex];
        } else if (currentPhase === 'elimination') {
            return eliminationWords[currentQuestionIndex];
        } else {
            return questionQueue[0];
        }
    } else {
        // Standard mode
        if (currentPhase === 'learning') {
            const roundWords = getCurrentRoundWords();
            return roundWords[currentQuestionIndex];
        } else if (currentPhase === 'elimination') {
            return eliminationWords[currentQuestionIndex];
        } else {
            return questionQueue[0];
        }
    }
}

function showLearningQuestion() {
    const roundWords = getCurrentRoundWords();
    
    if (currentQuestionIndex >= roundWords.length) {
        // Learning phase complete, move to elimination phase
        currentPhase = 'elimination';
        eliminationWords = [...roundWords]; // Copy array
        shuffleArray(eliminationWords); // Randomize order
        currentQuestionIndex = 0;
        // Disable next round button during elimination phase
        nextRoundBtn.classList.add('disabled');
        showEliminationQuestion();
        return;
    }
    
    const word = roundWords[currentQuestionIndex];
    japaneseWord.textContent = word.japanese;
    correctAnswerDisplay.textContent = capitalizeWords(word.english);
    correctAnswerDisplay.classList.remove('hidden');
    
    answerInput.value = '';
    answerInput.focus();
    
    updateProgress();
}

function showEliminationQuestion() {
    if (currentQuestionIndex >= eliminationWords.length) {
        // Elimination phase complete, move to repeating phase
        currentPhase = 'repeating';
        initializeQuestionQueue();
        // Disable next round button during repeating phase until requirements are met
        nextRoundBtn.classList.add('disabled');
        showNextQuestion();
        return;
    }
    
    const word = eliminationWords[currentQuestionIndex];
    japaneseWord.textContent = word.japanese;
    correctAnswerDisplay.classList.add('hidden');
    
    answerInput.value = '';
    answerInput.focus();
    
    updateProgress();
    updatePhaseLabel();
}

function initializeQuestionQueue() {
    const roundWords = getCurrentRoundWords();
    questionQueue = [];
    
    // Initialize correctAnswers for all words in this round
    roundWords.forEach(word => {
        if (!correctAnswers[word.japanese]) {
            correctAnswers[word.japanese] = 0;
        }
    });
    
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
    updatePhaseLabel();
    updateNextRoundButton();
}

function submitAnswer() {
    const userAnswer = answerInput.value.trim().toLowerCase();
    const currentWord = getCurrentWord();
    
    if (!currentWord) return;
    
    // Check if we're in custom mode
    if (window.customWordPools) {
        // Custom mode
        if (currentPhase === 'learning') {
            if (userAnswer === currentWord.english.toLowerCase()) {
                currentQuestionIndex++;
                showCustomLearningQuestion();
            } else {
                showError(currentWord.english);
            }
        } else if (currentPhase === 'elimination') {
            if (userAnswer === currentWord.english.toLowerCase()) {
                currentQuestionIndex++;
                showCustomEliminationQuestion();
            } else {
                showError(currentWord.english);
            }
        } else {
            // Repeating phase
            if (userAnswer === currentWord.english.toLowerCase()) {
                handleCustomCorrectAnswer();
            } else {
                handleCustomIncorrectAnswer(currentWord);
            }
        }
    } else {
        // Standard mode
        if (currentPhase === 'learning') {
            // Learning phase - just check if answer is correct
            if (userAnswer === currentWord.english.toLowerCase()) {
                currentQuestionIndex++;
                showLearningQuestion();
            } else {
                // Show error but don't move on
                showError(currentWord.english);
            }
        } else if (currentPhase === 'elimination') {
            // Elimination phase - check answer and move to next word
            if (userAnswer === currentWord.english.toLowerCase()) {
                currentQuestionIndex++;
                showEliminationQuestion();
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
    correctAnswerDisplay.textContent = capitalizeWords(correctAnswer);
    correctAnswerDisplay.classList.remove('hidden');
    
    answerInput.classList.add('error');
    setTimeout(() => {
        answerInput.classList.remove('error');
    }, 500);
}

function updateProgress() {
    // Check if we're in custom mode
    if (window.customWordPools) {
        if (currentPhase === 'learning') {
            const roundWords = getCurrentCustomRoundWords();
            currentQuestionSpan.textContent = currentQuestionIndex + 1;
            totalQuestionsSpan.textContent = roundWords.length;
            phaseProgress.textContent = '';
        } else if (currentPhase === 'elimination') {
            currentQuestionSpan.textContent = currentQuestionIndex + 1;
            totalQuestionsSpan.textContent = eliminationWords.length;
            phaseProgress.textContent = '';
        } else {
            const allWords = getAllCustomWordsUpToRound(currentRound);
            const totalCorrect = Object.values(correctAnswers).reduce((sum, count) => sum + count, 0);
            const targetCorrect = allWords.length * 3;
            // Cap the display at the target to prevent going over
            const displayCorrect = Math.min(totalCorrect, targetCorrect);
            currentQuestionSpan.textContent = displayCorrect;
            totalQuestionsSpan.textContent = targetCorrect;
            phaseProgress.textContent = '';
            
            // Add blue color when target is reached
            const progressInfo = document.querySelector('.progress-info');
            if (totalCorrect >= targetCorrect) {
                progressInfo.classList.add('completed');
            } else {
                progressInfo.classList.remove('completed');
            }
        }
    } else {
        // Standard mode
        if (currentPhase === 'learning') {
            const roundWords = getCurrentRoundWords();
            currentQuestionSpan.textContent = currentQuestionIndex + 1;
            totalQuestionsSpan.textContent = roundWords.length;
            phaseProgress.textContent = '';
        } else if (currentPhase === 'elimination') {
            currentQuestionSpan.textContent = currentQuestionIndex + 1;
            totalQuestionsSpan.textContent = eliminationWords.length;
            phaseProgress.textContent = '';
        } else {
            const roundWords = getCurrentRoundWords();
            const totalCorrect = Object.values(correctAnswers).reduce((sum, count) => sum + count, 0);
            const targetCorrect = roundWords.length * 3;
            // Cap the display at the target to prevent going over
            const displayCorrect = Math.min(totalCorrect, targetCorrect);
            currentQuestionSpan.textContent = displayCorrect;
            totalQuestionsSpan.textContent = targetCorrect;
            phaseProgress.textContent = '';
            
            // Add blue color when target is reached
            const progressInfo = document.querySelector('.progress-info');
            if (totalCorrect >= targetCorrect) {
                progressInfo.classList.add('completed');
            } else {
                progressInfo.classList.remove('completed');
            }
        }
    }
    
    updatePhaseLabel();
    updateRoundProgress();
}

function updatePhaseLabel() {
    if (currentPhase === 'learning') {
        phaseLabel.textContent = 'Words To Learn';
    } else if (currentPhase === 'elimination') {
        const isIntroductionRound = currentRound % 2 === 1;
        if (isIntroductionRound) {
            phaseLabel.textContent = 'Words To Eliminate';
        } else {
            phaseLabel.textContent = 'Words To Eliminate';
        }
    } else {
        phaseLabel.textContent = 'Words To Practice';
    }
}

function updateRoundProgress() {
    // Check if we're in custom mode
    if (window.customWordPools) {
        if (currentPhase === 'learning') {
            const roundWords = getCurrentCustomRoundWords();
            const remaining = roundWords.length - currentQuestionIndex;
            roundProgress.textContent = `${remaining} questions remaining`;
        } else if (currentPhase === 'elimination') {
            const remaining = eliminationWords.length - currentQuestionIndex;
            roundProgress.textContent = `${remaining} questions remaining`;
        } else {
            const allWords = getAllCustomWordsUpToRound(currentRound);
            const totalCorrect = Object.values(correctAnswers).reduce((sum, count) => sum + count, 0);
            const targetCorrect = allWords.length * 3;
            const remaining = Math.max(0, targetCorrect - totalCorrect);
            roundProgress.textContent = `${remaining} correct answers needed`;
        }
    } else {
        // Standard mode
        if (currentPhase === 'learning') {
            const roundWords = getCurrentRoundWords();
            const remaining = roundWords.length - currentQuestionIndex;
            roundProgress.textContent = `${remaining} questions remaining`;
        } else if (currentPhase === 'elimination') {
            const remaining = eliminationWords.length - currentQuestionIndex;
            roundProgress.textContent = `${remaining} questions remaining`;
        } else {
            const roundWords = getCurrentRoundWords();
            const totalCorrect = Object.values(correctAnswers).reduce((sum, count) => sum + count, 0);
            const targetCorrect = roundWords.length * 3;
            const remaining = Math.max(0, targetCorrect - totalCorrect);
            roundProgress.textContent = `${remaining} correct answers needed`;
        }
    }
}

function updateNextRoundButton() {
    if (currentPhase === 'learning' || currentPhase === 'elimination') {
        nextRoundBtn.classList.add('disabled');
        return;
    }
    
    const roundWords = getCurrentRoundWords();
    const totalCorrect = Object.values(correctAnswers).reduce((sum, count) => sum + count, 0);
    const targetCorrect = roundWords.length * 3;
    
    // Check if all words have 3 correct answers
    const allWordsHaveThreeCorrect = roundWords.every(word => 
        (correctAnswers[word.japanese] || 0) >= 3
    );
    

    
    // Enable button when target is reached
    if (totalCorrect >= targetCorrect) {
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
    eliminationWords = [];
    
    // Reset progress text color to white
    const progressInfo = document.querySelector('.progress-info');
    progressInfo.classList.remove('completed');
    
    // Add words from this introduction round to all learned words
    if (currentRound % 2 === 1) {
        const roundWords = getCurrentRoundWords();
        allLearnedWords = allLearnedWords.concat(roundWords);
    }
    
    initializeRound();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function capitalizeWords(text) {
    return text.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    showPage('start');
    initializeSettings();
    detectBrowserLanguage();
});

// Toggle section visibility
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    const button = event.target;
    
    if (section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
        button.textContent = '▼';
        button.classList.remove('rotated');
    } else {
        section.classList.add('collapsed');
        button.textContent = '▲';
        button.classList.add('rotated');
    }
}

// Settings and Language Functions
function initializeSettings() {
    // Load saved settings from localStorage
    const savedTheme = localStorage.getItem('theme');
    const savedLanguage = localStorage.getItem('language');
    
    if (savedTheme === 'dark') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        themeToggle.checked = false;
    }
    
    if (savedLanguage) {
        currentLanguage = savedLanguage;
        updateLanguageButtons();
        updateAllText();
    }
}

function toggleSettingsPanel() {
    settingsPanel.classList.toggle('hidden');
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    updateLanguageButtons();
    updateAllText();
}

function updateLanguageButtons() {
    languageButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === currentLanguage) {
            btn.classList.add('active');
        }
    });
}

function updateAllText() {
    // Update all elements with data attributes
    const elements = document.querySelectorAll('[data-en], [data-es], [data-fr], [data-ja]');
    elements.forEach(element => {
        const text = element.getAttribute(`data-${currentLanguage}`);
        if (text) {
            element.textContent = text;
        }
    });
    
    // Update placeholders
    const inputs = document.querySelectorAll('[data-en-placeholder], [data-es-placeholder], [data-fr-placeholder], [data-ja-placeholder]');
    inputs.forEach(input => {
        const placeholder = input.getAttribute(`data-${currentLanguage}-placeholder`);
        if (placeholder) {
            input.placeholder = placeholder;
        }
    });
}

function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    
    // Check if browser language is supported
    if (['en', 'es', 'fr', 'ja'].includes(langCode)) {
        currentLanguage = langCode;
        localStorage.setItem('language', langCode);
        updateLanguageButtons();
        updateAllText();
    }
}

// Custom Mode Functions
function initializeCustomMode() {
    populateWordSelectionGrids();
    setupCustomWordButtons();
}

function populateWordSelectionGrids() {
    // Get all word selection grids
    const grids = document.querySelectorAll('.word-selection-grid');
    
    grids.forEach((grid, gridIndex) => {
        grid.innerHTML = '';
        
        // Get all words from the word pools, organized by introduction rounds
        const allWords = getAllWordsByRound();
        
        allWords.forEach((wordGroup, roundIndex) => {
            // Create collapsible section for each round
            const sectionContainer = document.createElement('div');
            sectionContainer.className = 'word-section-container';
            
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'word-section-header';
            sectionHeader.onclick = () => toggleWordSection(gridIndex, roundIndex);
            
            const headerText = document.createElement('h4');
            headerText.textContent = `Round ${roundIndex + 1} Words`;
            headerText.style.margin = '0';
            headerText.style.color = '#ffffff';
            headerText.style.fontSize = '0.9rem';
            headerText.style.fontWeight = 'bold';
            
            const collapseBtn = document.createElement('button');
            collapseBtn.className = 'collapse-btn small';
            collapseBtn.textContent = '▼';
            collapseBtn.style.background = 'none';
            collapseBtn.style.border = 'none';
            collapseBtn.style.cursor = 'pointer';
            collapseBtn.style.fontSize = '0.8rem';
            collapseBtn.style.color = '#ffffff';
            
            sectionHeader.appendChild(headerText);
            sectionHeader.appendChild(collapseBtn);
            sectionContainer.appendChild(sectionHeader);
            
            // Create word content container
            const wordContent = document.createElement('div');
            wordContent.className = 'word-section-content collapsed';
            wordContent.id = `word-content-${gridIndex}-${roundIndex}`;
            
            // Create word checkboxes for this round
            wordGroup.forEach(word => {
                const wordItem = document.createElement('div');
                wordItem.className = 'word-checkbox-item';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `word-${gridIndex}-${word.japanese}`;
                checkbox.dataset.japanese = word.japanese;
                checkbox.dataset.english = word.english;
                
                const label = document.createElement('label');
                label.htmlFor = `word-${gridIndex}-${word.japanese}`;
                label.textContent = capitalizeWords(word.english);
                
                wordItem.appendChild(checkbox);
                wordItem.appendChild(label);
                wordContent.appendChild(wordItem);
            });
            
            sectionContainer.appendChild(wordContent);
            grid.appendChild(sectionContainer);
        });
    });
}

function getAllWordsByRound() {
    const wordsByRound = [];
    
    // Add words from each introduction round
    for (let i = 1; i <= 18; i += 2) { // Odd numbers are introduction rounds
        if (wordPools[i]) {
            wordsByRound.push(wordPools[i]);
        }
    }
    
    return wordsByRound;
}

function setupCustomWordButtons() {
    const addCustomWordBtns = document.querySelectorAll('.add-custom-word-btn');
    const addWordBtns = document.querySelectorAll('.add-word-btn');
    
    addCustomWordBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const inputs = btn.parentElement.querySelector('.custom-word-inputs');
            inputs.classList.toggle('hidden');
        });
    });
    
    addWordBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const roundContainer = btn.closest('.custom-round');
            const japaneseInput = roundContainer.querySelector('.japanese-word-input');
            const englishInput = roundContainer.querySelector('.english-translation-input');
            
            const japanese = japaneseInput.value.trim();
            const english = englishInput.value.trim();
            
            if (japanese && english) {
                addCustomWordToRound(roundContainer, japanese, english);
                japaneseInput.value = '';
                englishInput.value = '';
                roundContainer.querySelector('.custom-word-inputs').classList.add('hidden');
            }
        });
    });
}

function addCustomWordToRound(roundContainer, japanese, english) {
    const grid = roundContainer.querySelector('.word-selection-grid');
    
    // Create new word item
    const wordItem = document.createElement('div');
    wordItem.className = 'word-checkbox-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `custom-word-${Date.now()}`;
    checkbox.dataset.japanese = japanese;
    checkbox.dataset.english = english;
    checkbox.checked = true; // Auto-check custom words
    
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = capitalizeWords(english);
    
    wordItem.appendChild(checkbox);
    wordItem.appendChild(label);
    
    // Add to the end of the grid
    grid.appendChild(wordItem);
}

function addCustomRound() {
    const roundNumber = document.querySelectorAll('.custom-round').length + 1;
    
    const newRound = document.createElement('div');
    newRound.className = 'custom-round';
    newRound.dataset.round = roundNumber;
    
    newRound.innerHTML = `
        <div class="custom-round-header" onclick="toggleCustomRound(${roundNumber})">
            <h3 data-en="Introduction Round ${roundNumber}" data-es="Ronda de Introducción ${roundNumber}" data-fr="Ronde d'Introduction ${roundNumber}" data-ja="導入ラウンド${roundNumber}">Introduction Round ${roundNumber}</h3>
            <button class="collapse-btn">▼</button>
        </div>
        
        <div class="custom-round-content" id="round-content-${roundNumber}">
        <p data-en="Please select the words you'd like to include in this round." data-es="Por favor selecciona las palabras que quieres incluir en esta ronda." data-fr="Veuillez sélectionner les mots que vous souhaitez inclure dans cette ronde." data-ja="このラウンドに含めたい単語を選択してください。">Please select the words you'd like to include in this round.</p>
        
        <div class="word-selection-grid" id="word-selection-${roundNumber}">
            <!-- Word checkboxes will be populated by JavaScript -->
        </div>
        
        <div class="custom-word-section">
            <button class="add-custom-word-btn" data-en="Add Custom Word To Round" data-es="Agregar Palabra Personalizada a la Ronda" data-fr="Ajouter un Mot Personnalisé à la Ronde" data-ja="ラウンドにカスタム単語を追加">Add Custom Word To Round</button>
            <div class="custom-word-inputs hidden">
                <div class="input-row">
                    <input type="text" class="japanese-word-input" placeholder="Japanese Word" data-en-placeholder="Japanese Word" data-es-placeholder="Palabra Japonesa" data-fr-placeholder="Mot Japonais" data-ja-placeholder="日本語の単語">
                    <input type="text" class="english-translation-input" placeholder="English Translation (Correct Answer)" data-en-placeholder="English Translation (Correct Answer)" data-es-placeholder="Traducción al Inglés (Respuesta Correcta)" data-fr-placeholder="Traduction Anglaise (Réponse Correcte)" data-ja-placeholder="英語訳（正解）">
                    <button class="add-word-btn" data-en="Add" data-es="Agregar" data-fr="Ajouter" data-ja="追加">Add</button>
                </div>
            </div>
        </div>
        </div>
    `;
    
    customRoundsContainer.appendChild(newRound);
    
    // Re-populate word selection grids and setup buttons
    populateWordSelectionGrids();
    setupCustomWordButtons();
    
    // Update language for new elements
    updateAllText();
}

function removeCustomRound() {
    const rounds = document.querySelectorAll('.custom-round');
    if (rounds.length > 1) {
        rounds[rounds.length - 1].remove();
        
        // Update round numbers for remaining rounds
        const remainingRounds = document.querySelectorAll('.custom-round');
        remainingRounds.forEach((round, index) => {
            round.dataset.round = index + 1;
            const header = round.querySelector('.custom-round-header h3');
            const content = round.querySelector('.custom-round-content');
            const collapseBtn = round.querySelector('.collapse-btn');
            
            // Update IDs and onclick
            content.id = `round-content-${index + 1}`;
            const headerDiv = round.querySelector('.custom-round-header');
            headerDiv.onclick = () => toggleCustomRound(index + 1);
            
            // Update text content
            header.textContent = `Introduction Round ${index + 1}`;
            header.setAttribute('data-en', `Introduction Round ${index + 1}`);
            header.setAttribute('data-es', `Ronda de Introducción ${index + 1}`);
            header.setAttribute('data-fr', `Ronde d'Introduction ${index + 1}`);
            header.setAttribute('data-ja', `導入ラウンド${index + 1}`);
        });
    } else {
        alert('You must have at least one round.');
    }
}

function toggleCustomRound(roundNumber) {
    const content = document.getElementById(`round-content-${roundNumber}`);
    const button = content.previousElementSibling.querySelector('.collapse-btn');
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        button.textContent = '▼';
        button.classList.remove('rotated');
    } else {
        content.classList.add('collapsed');
        button.textContent = '▲';
        button.classList.add('rotated');
    }
}

function toggleWordSection(gridIndex, roundIndex) {
    const content = document.getElementById(`word-content-${gridIndex}-${roundIndex}`);
    const button = content.previousElementSibling.querySelector('.collapse-btn');
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        button.textContent = '▼';
        button.classList.remove('rotated');
    } else {
        content.classList.add('collapsed');
        button.textContent = '▲';
        button.classList.add('rotated');
    }
}

function startCustomRun() {
    const rounds = document.querySelectorAll('.custom-round');
    const customWordPools = [];
    
    rounds.forEach((round, index) => {
        const selectedWords = [];
        const checkboxes = round.querySelectorAll('input[type="checkbox"]:checked');
        
        checkboxes.forEach(checkbox => {
            selectedWords.push({
                japanese: checkbox.dataset.japanese,
                english: checkbox.dataset.english
            });
        });
        
        if (selectedWords.length > 0) {
            customWordPools.push(selectedWords);
        }
    });
    
    if (customWordPools.length === 0) {
        alert('Please select at least one word for at least one round.');
        return;
    }
    
    // Store custom word pools and start the game
    window.customWordPools = customWordPools;
    window.customModeEnabled = true;
    window.customModeNoPracticeRounds = disablePracticeRoundsToggle.checked;
    
    // Start the game with custom mode
    showPage('script');
}

function startCustomGame() {
    currentRound = 1;
    currentPhase = 'learning';
    currentQuestionIndex = 0;
    correctAnswers = {};
    questionQueue = [];
    allLearnedWords = [];
    wordsWithPendingPoints = new Set();
    currentQuestionFailed = false;
    eliminationWords = [];
    
    // Reset progress text color to white
    const progressInfo = document.querySelector('.progress-info');
    progressInfo.classList.remove('completed');
    
    // Disable next round button at start
    nextRoundBtn.classList.add('disabled');
    
    showPage('game');
    initializeCustomRound();
}

function initializeCustomRound() {
    const customWordPools = window.customWordPools || [];
    const isIntroductionRound = currentRound % 2 === 1;
    
    // Disable next round button at start of each round
    nextRoundBtn.classList.add('disabled');
    
    if (isIntroductionRound) {
        roundTitle.textContent = 'Introduction Round';
        currentPhase = 'learning';
        currentQuestionIndex = 0;
        showCustomLearningQuestion();
    } else {
        roundTitle.textContent = 'Practice Round';
        currentPhase = 'elimination';
        eliminationWords = getAllCustomWordsUpToRound(currentRound);
        shuffleArray(eliminationWords);
        currentQuestionIndex = 0;
        showCustomEliminationQuestion();
    }
    
    updateProgress();
    updatePhaseLabel();
}

function getAllCustomWordsUpToRound(roundNumber) {
    const customWordPools = window.customWordPools || [];
    let allWords = [];
    
    for (let i = 0; i < Math.ceil(roundNumber / 2); i++) {
        if (customWordPools[i]) {
            allWords = allWords.concat(customWordPools[i]);
        }
    }
    
    return allWords;
}

function getCurrentCustomRoundWords() {
    const customWordPools = window.customWordPools || [];
    const roundIndex = Math.floor((currentRound - 1) / 2);
    return customWordPools[roundIndex] || [];
}

function showCustomLearningQuestion() {
    const roundWords = getCurrentCustomRoundWords();
    
    if (currentQuestionIndex >= roundWords.length) {
        // Learning phase complete, move to elimination phase
        currentPhase = 'elimination';
        eliminationWords = [...roundWords];
        shuffleArray(eliminationWords);
        currentQuestionIndex = 0;
        nextRoundBtn.classList.add('disabled');
        showCustomEliminationQuestion();
        return;
    }
    
    const word = roundWords[currentQuestionIndex];
    japaneseWord.textContent = word.japanese;
    correctAnswerDisplay.textContent = capitalizeWords(word.english);
    correctAnswerDisplay.classList.remove('hidden');
    
    answerInput.value = '';
    answerInput.focus();
    
    updateProgress();
    updatePhaseLabel();
}

function showCustomEliminationQuestion() {
    if (currentQuestionIndex >= eliminationWords.length) {
        // Elimination phase complete, move to repeating phase
        currentPhase = 'repeating';
        initializeCustomQuestionQueue();
        currentQuestionIndex = 0;
        nextRoundBtn.classList.add('disabled');
        showCustomRepeatingQuestion();
        return;
    }
    
    const word = eliminationWords[currentQuestionIndex];
    japaneseWord.textContent = word.japanese;
    correctAnswerDisplay.classList.add('hidden');
    
    answerInput.value = '';
    answerInput.focus();
    
    updateProgress();
    updatePhaseLabel();
}

function showCustomRepeatingQuestion() {
    if (questionQueue.length === 0) {
        // Round complete
        if (currentRound < window.customWordPools.length * 2) {
            // More rounds to go
            currentRound++;
            initializeCustomRound();
        } else {
            // All rounds complete
            alert('Custom run complete!');
            showPage('start');
        }
        return;
    }
    
    const word = questionQueue[0];
    japaneseWord.textContent = word.japanese;
    correctAnswerDisplay.classList.add('hidden');
    
    answerInput.value = '';
    answerInput.focus();
    
    updateProgress();
    updatePhaseLabel();
}

function initializeCustomQuestionQueue() {
    const allWords = getAllCustomWordsUpToRound(currentRound);
    questionQueue = [...allWords];
    shuffleArray(questionQueue);
    
    // Initialize correct answers for all words
    correctAnswers = {};
    allWords.forEach(word => {
        correctAnswers[word.japanese] = 0;
    });
}

function handleCustomCorrectAnswer() {
    const currentWord = questionQueue.shift();
    const wordKey = currentWord.japanese;
    
    // Check if this word has a pending point from a previous incorrect answer
    if (wordsWithPendingPoints.has(wordKey)) {
        // Award the pending point
        if (!correctAnswers[wordKey]) {
            correctAnswers[wordKey] = 0;
        }
        correctAnswers[wordKey]++;
        wordsWithPendingPoints.delete(wordKey);
    } else if (!currentQuestionFailed) {
        // Normal correct answer - award point immediately
        if (!correctAnswers[wordKey]) {
            correctAnswers[wordKey] = 0;
        }
        correctAnswers[wordKey]++;
    }
    
    // Check if all words have 3 correct answers
    updateCustomNextRoundButton();
    
    // Show next question
    showCustomRepeatingQuestion();
}

function handleCustomIncorrectAnswer(word) {
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
    
    // Ensure queue has minimum length
    while (questionQueue.length < 21) {
        const allWords = getAllCustomWordsUpToRound(currentRound);
        const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
        questionQueue.push(randomWord);
    }
    
    // Show next question
    showCustomRepeatingQuestion();
}

function updateCustomNextRoundButton() {
    const allWords = getAllCustomWordsUpToRound(currentRound);
    const targetCorrect = allWords.length * 3;
    let totalCorrect = 0;
    
    allWords.forEach(word => {
        totalCorrect += correctAnswers[word.japanese] || 0;
    });
    
    if (totalCorrect >= targetCorrect) {
        nextRoundBtn.classList.remove('disabled');
        nextRoundBtn.addEventListener('click', () => {
            currentRound++;
            initializeCustomRound();
        });
    }
}
