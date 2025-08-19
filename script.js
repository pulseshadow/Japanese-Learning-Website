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
const customScriptPage = document.getElementById('custom-script-page');
const customModePage = document.getElementById('custom-mode-page');
const bruteForceBtn = document.getElementById('brute-force-btn');
const customModeBtn = document.getElementById('custom-mode-btn');
const customHiraganaBtn = document.getElementById('custom-hiragana-btn');
const hiraganaBtn = document.getElementById('hiragana-btn');
const katakanaBtn = document.getElementById('katakana-btn');
const backToStartBtn = document.getElementById('back-to-start');
const backToScriptBtn = document.getElementById('back-to-script');
const backToStartFromCustomScriptBtn = document.getElementById('back-to-start-from-custom-script');
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

// Stats page DOM elements
const statsPage = document.getElementById('stats-page');
const userStatsBtn = document.getElementById('user-stats-btn');
// clearStatsBtn removed - no longer needed
const backToStartFromStatsBtn = document.getElementById('back-to-start-from-stats');
const totalCorrectSpan = document.getElementById('total-correct');
const totalIncorrectSpan = document.getElementById('total-incorrect');
const accuracyRateSpan = document.getElementById('accuracy-rate');
const highestRoundSpan = document.getElementById('highest-round');
// gamesPlayedSpan removed - no longer displaying games played
// lastPlayedSpan removed - no longer displaying last played stat

// Cookie consent elements
const cookieConsentOverlay = document.getElementById('cookie-consent-overlay');
const rejectCookiesBtn = document.getElementById('reject-cookies-btn');
const acceptCookiesBtn = document.getElementById('accept-cookies-btn');
const advertisingCookiesCheckbox = document.getElementById('advertising-cookies');
const analyticsScript = document.getElementById('analytics-script');
const adsenseScript = document.getElementById('adsense-script');

// Language and theme elements in cookie popup
const languageSelectorBtn = document.getElementById('language-selector-btn');
const languageOptions = document.getElementById('language-options');
const langOptionBtns = document.querySelectorAll('.lang-option');
const cookieThemeToggle = document.getElementById('cookie-theme-toggle');

// Event listeners
bruteForceBtn.addEventListener('click', () => {
    showPage('script');
});
customModeBtn.addEventListener('click', () => showPage('custom-script'));
userStatsBtn.addEventListener('click', () => {
    showPage('stats');
    updateStatsDisplay();
});
customHiraganaBtn.addEventListener('click', () => showPage('custom-mode'));
hiraganaBtn.addEventListener('click', startGame);
katakanaBtn.addEventListener('click', () => alert('Katakana mode coming soon!'));
backToStartBtn.addEventListener('click', () => showPage('start'));
backToScriptBtn.addEventListener('click', () => {
    // If in custom mode, go back to word selection, otherwise go to script selection
    if (window.customModeEnabled) {
        showPage('custom-mode');
    } else {
        showPage('script');
    }
});
backToStartFromCustomScriptBtn.addEventListener('click', () => {
    // Reset custom mode variables when leaving custom mode
    window.customModeEnabled = false;
    window.customWordPools = null;
    showPage('script');
});

backToStartFromCustomBtn.addEventListener('click', () => {
    // Reset custom mode variables when leaving custom mode
    window.customModeEnabled = false;
    window.customWordPools = null;
    showPage('custom-script');
});

// Stats page event listeners - clearStatsBtn removed

backToStartFromStatsBtn.addEventListener('click', () => showPage('start'));
roundSelector.addEventListener('change', (e) => changeRound(parseInt(e.target.value)));
addRoundBtn.addEventListener('click', addCustomRound);
removeRoundBtn.addEventListener('click', removeCustomRound);
startCustomRunBtn.addEventListener('click', startCustomRun);

// Add event listener for practice rounds toggle
disablePracticeRoundsToggle.addEventListener('change', () => {
    window.customModeNoPracticeRounds = disablePracticeRoundsToggle.checked;
    saveCustomRounds();
});

// Settings and language event listeners
settingsBtn.addEventListener('click', toggleSettingsPanel);
themeToggle.addEventListener('change', toggleTheme);
languageButtons.forEach(btn => btn.addEventListener('click', (e) => changeLanguage(e.target.dataset.lang)));

// Cookie consent event listeners
rejectCookiesBtn.addEventListener('click', rejectCookies);
acceptCookiesBtn.addEventListener('click', acceptCookies);

// Language and theme event listeners in cookie popup
languageSelectorBtn.addEventListener('click', toggleLanguageOptions);
langOptionBtns.forEach(btn => btn.addEventListener('click', (e) => selectLanguage(e.target.dataset.lang)));
cookieThemeToggle.addEventListener('change', handleCookieThemeToggle);

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
    customScriptPage.style.display = 'none';
    customModePage.style.display = 'none';
    statsPage.style.display = 'none';
    
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
    } else if (pageName === 'custom-script') {
        customScriptPage.style.display = 'block';
        customScriptPage.classList.add('active');
    } else if (pageName === 'custom-mode') {
        customModePage.style.display = 'block';
        customModePage.classList.add('active');
        initializeCustomMode();
    } else if (pageName === 'stats') {
        statsPage.style.display = 'block';
        statsPage.classList.add('active');
    }
}

// Round selection functionality
function changeRound(roundNumber) {
    if (currentPage === 'game') {
        // Don't update highest round reached when using round skip
        currentRound = roundNumber;
        
        // Check if we're in custom mode
        if (window.customWordPools) {
            initializeCustomRound();
        } else {
            initializeRound();
        }
        updateProgress();
        updatePhaseLabel();
        
        // Progress tracking removed - no longer persisting round changes
    }
}

function populateRoundSelector() {
    // Clear existing options
    roundSelector.innerHTML = '';
    
    // Check if we're in custom mode
    if (window.customWordPools) {
        // Populate with custom rounds
        const customWordPools = window.customWordPools;
        const noPracticeRounds = window.customModeNoPracticeRounds || false;
        
        if (noPracticeRounds) {
            // Only introduction rounds
            for (let i = 1; i <= customWordPools.length; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `Introduction Round ${i}`;
                option.setAttribute('data-en', `Introduction Round ${i}`);
                option.setAttribute('data-es', `Ronda de Introducción ${i}`);
                option.setAttribute('data-fr', `Ronde d'Introduction ${i}`);
                option.setAttribute('data-ja', `導入ラウンド${i}`);
                roundSelector.appendChild(option);
            }
        } else {
            // Introduction and practice rounds
            for (let i = 1; i <= customWordPools.length * 2; i++) {
                const option = document.createElement('option');
                option.value = i;
                
                if (i % 2 === 1) {
                    // Introduction round
                    const roundNumber = Math.ceil(i / 2);
                    option.textContent = `Introduction Round ${roundNumber}`;
                    option.setAttribute('data-en', `Introduction Round ${roundNumber}`);
                    option.setAttribute('data-es', `Ronda de Introducción ${roundNumber}`);
                    option.setAttribute('data-fr', `Ronde d'Introduction ${roundNumber}`);
                    option.setAttribute('data-ja', `導入ラウンド${roundNumber}`);
                } else {
                    // Practice round
                    const roundNumber = Math.floor(i / 2);
                    option.textContent = `Practice Round ${roundNumber}`;
                    option.setAttribute('data-en', `Practice Round ${roundNumber}`);
                    option.setAttribute('data-es', `Ronda de Práctica ${roundNumber}`);
                    option.setAttribute('data-fr', `Ronde de Pratique ${roundNumber}`);
                    option.setAttribute('data-ja', `練習ラウンド${roundNumber}`);
                }
                
                roundSelector.appendChild(option);
            }
        }
    } else {
        // Populate with preset rounds (brute force mode)
        for (let i = 1; i <= 18; i++) {
            const option = document.createElement('option');
            option.value = i;
            
            if (i % 2 === 1) {
                // Introduction round
                const roundNumber = Math.ceil(i / 2);
                option.textContent = `Introduction Round ${roundNumber}`;
                option.setAttribute('data-en', `Introduction Round ${roundNumber}`);
                option.setAttribute('data-es', `Ronda de Introducción ${roundNumber}`);
                option.setAttribute('data-fr', `Ronde d'Introduction ${roundNumber}`);
                option.setAttribute('data-ja', `導入ラウンド${roundNumber}`);
            } else {
                // Practice round
                const roundNumber = Math.floor(i / 2);
                option.textContent = `Practice Round ${roundNumber}`;
                option.setAttribute('data-en', `Practice Round ${roundNumber}`);
                option.setAttribute('data-es', `Ronda de Práctica ${roundNumber}`);
                option.setAttribute('data-fr', `Ronde de Pratique ${roundNumber}`);
                option.setAttribute('data-ja', `練習ラウンド${roundNumber}`);
            }
            
            roundSelector.appendChild(option);
        }
    }
    
    // Update language for new options
    updateAllText();
}

// Auto-submit on input change with letter-by-letter checking
answerInput.addEventListener('input', (e) => {
    const userAnswer = e.target.value.trim().toLowerCase();
    const currentWord = getCurrentWord();
    
    if (!currentWord) return;
    
    const correctAnswer = getCorrectAnswer(currentWord.english).toLowerCase();
    
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
    
    // Update statistics for incorrect answer when question is marked as failed
    updateStats(false, currentRound);
    
    setTimeout(() => {
        answerInput.classList.remove('error');
        answerInput.focus();
    }, 500);
}



// Game functions
function startGame() {
    currentPage = 'game';
    
    // Reset custom mode variables when starting normal brute force game
    window.customModeEnabled = false;
    window.customWordPools = null;
    
    // Populate round selector with preset rounds
    populateRoundSelector();
    
    // Update back button text for brute force mode
    updateBackButtonText();
    
    // Always start fresh - users can use round selector to jump to any round
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
    
    // Get the correct answer (without brackets)
    const correctAnswer = getCorrectAnswer(currentWord.english).toLowerCase();
    
    // Check if we're in custom mode
    if (window.customWordPools) {
        // Custom mode
        if (currentPhase === 'learning') {
            if (userAnswer === correctAnswer) {
                currentQuestionIndex++;
                showCustomLearningQuestion();
            } else {
                showError(currentWord.english);
            }
        } else if (currentPhase === 'elimination') {
            if (userAnswer === correctAnswer) {
                currentQuestionIndex++;
                showCustomEliminationQuestion();
            } else {
                showError(currentWord.english);
            }
        } else {
            // Repeating phase
            if (userAnswer === correctAnswer) {
                updateStats(true, currentRound);
                handleCustomCorrectAnswer();
            } else {
                updateStats(false, currentRound);
                handleCustomIncorrectAnswer(currentWord);
            }
        }
    } else {
        // Standard mode
        if (currentPhase === 'learning') {
            // Learning phase - just check if answer is correct
            if (userAnswer === correctAnswer) {
                currentQuestionIndex++;
                showLearningQuestion();
            } else {
                // Show error but don't move on
                showError(currentWord.english);
            }
        } else if (currentPhase === 'elimination') {
            // Elimination phase - check answer and move to next word
            if (userAnswer === correctAnswer) {
                currentQuestionIndex++;
                showEliminationQuestion();
            } else {
                // Show error but don't move on
                showError(currentWord.english);
            }
        } else {
            // Repeating phase - full game logic
            if (userAnswer === correctAnswer) {
                // Correct answer
                updateStats(true, currentRound);
                handleCorrectAnswer();
            } else {
                // Incorrect answer
                updateStats(false, currentRound);
                handleIncorrectAnswer(currentWord);
            }
        }
    }
    
    // Progress tracking removed - no longer persisting answer progress
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
    
    // Update statistics for incorrect answer
    updateStats(false, currentRound);
    
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
            // Determine which words to use based on round type
            const noPracticeRounds = window.customModeNoPracticeRounds || false;
            const isIntroductionRound = noPracticeRounds ? true : (currentRound % 2 === 1);
            
            let allWords;
            if (isIntroductionRound) {
                // For introduction rounds, only use the current round's words
                allWords = getCurrentCustomRoundWords();
            } else {
                // For practice rounds, use accumulated words from all previous introduction rounds
                allWords = getAllCustomWordsUpToRound(currentRound);
            }
            
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
            // Determine which words to use based on round type
            const noPracticeRounds = window.customModeNoPracticeRounds || false;
            const isIntroductionRound = noPracticeRounds ? true : (currentRound % 2 === 1);
            
            let allWords;
            if (isIntroductionRound) {
                // For introduction rounds, only use the current round's words
                allWords = getCurrentCustomRoundWords();
            } else {
                // For practice rounds, use accumulated words from all previous introduction rounds
                allWords = getAllCustomWordsUpToRound(currentRound);
            }
            
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
    
    // Check if we're in custom mode
    if (window.customWordPools) {
        nextCustomRound();
    } else {
        nextStandardRound();
    }
}

function nextCustomRound() {
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
    
    // Disable next round button at start of new round
    nextRoundBtn.classList.add('disabled');
    
    // Check if this is the last round
    const noPracticeRounds = window.customModeNoPracticeRounds || false;
    const totalRounds = noPracticeRounds ? window.customWordPools.length : window.customWordPools.length * 2;
    
    if (currentRound >= totalRounds) {
        // Hide the next round button on the final round
        nextRoundBtn.style.visibility = 'hidden';
        nextRoundBtn.classList.add('disabled');
    } else {
        // Disable next round button at start of new round (but keep it visible)
        nextRoundBtn.classList.add('disabled');
        nextRoundBtn.style.visibility = 'visible';
    }
    
    initializeCustomRound();
    
    // Update highest round reached (only if not using round skip)
    if (currentRound > userStats.highestRoundReached) {
        userStats.highestRoundReached = currentRound;
        saveStats();
    }
    
    // Progress tracking removed - no longer persisting round progression
}

function nextStandardRound() {
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
    
    // Update highest round reached (only if not using round skip)
    if (currentRound > userStats.highestRoundReached) {
        userStats.highestRoundReached = currentRound;
        saveStats();
    }
    
    // Progress tracking removed - no longer persisting round progression
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function capitalizeWords(text) {
    return text.split(' ').map(word => {
        // Handle words in brackets
        if (word.startsWith('(') && word.includes(')')) {
            const bracketContent = word.substring(1, word.indexOf(')'));
            const restOfWord = word.substring(word.indexOf(')') + 1);
            return `(${bracketContent.charAt(0).toUpperCase() + bracketContent.slice(1)})${restOfWord.charAt(0).toUpperCase() + restOfWord.slice(1)}`;
        } else if (word.startsWith('(')) {
            const bracketContent = word.substring(1, word.indexOf(')'));
            const restOfWord = word.substring(word.indexOf(')') + 1);
            return `(${bracketContent.charAt(0).toUpperCase() + bracketContent.slice(1)})${restOfWord.charAt(0).toUpperCase() + restOfWord.slice(1)}`;
        } else {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
    }).join(' ');
}

// Helper function to get the correct answer (without brackets)
function getCorrectAnswer(english) {
    // Remove brackets and their content, then trim
    return english.replace(/\([^)]*\)/g, '').trim();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    showPage('start');
    initializeSettings();
    detectBrowserLanguage();
    
    // Check if cookie consent popup should be shown
    const consentData = loadFromLocalStorage(STORAGE_KEYS.COOKIE_CONSENT, null);
    if (!consentData) {
        // First time visitor - show cookie consent popup
        setTimeout(() => {
            showCookieConsent();
        }, 1000); // Small delay to let the page load first
    }
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
    // Validate and load all saved data
    const dataValid = validateAndFixData();
    
    if (!dataValid) {
        console.warn('Using default settings due to data validation failure');
    }
    
    // Initialize custom mode if there are saved custom rounds
    if (window.customWordPools) {
        initializeCustomMode();
    }
    
    updateLanguageButtons();
    updateAllText();
}

function toggleSettingsPanel() {
    settingsPanel.classList.toggle('hidden');
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    saveSettings();
    updateAllText();
}

function changeLanguage(lang) {
    currentLanguage = lang;
    saveSettings();
    updateLanguageButtons();
    updateAllText();
    console.log('Language changed to:', lang, 'and saved');
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
    
    // Update back button text based on mode
    updateBackButtonText();
}

function updateBackButtonText() {
    if (window.customModeEnabled) {
        // Custom mode - show "Back to Word Selection"
        backToScriptBtn.setAttribute('data-en', '← Back to Word Selection');
        backToScriptBtn.setAttribute('data-es', '← Volver a Selección de Palabras');
        backToScriptBtn.setAttribute('data-fr', '← Retour à la Sélection de Mots');
        backToScriptBtn.setAttribute('data-ja', '← 単語選択に戻る');
        backToScriptBtn.textContent = backToScriptBtn.getAttribute(`data-${currentLanguage}`);
    } else {
        // Brute force mode - show "Back to Script Selection"
        backToScriptBtn.setAttribute('data-en', '← Back to Script Selection');
        backToScriptBtn.setAttribute('data-es', '← Volver a Selección de Escritura');
        backToScriptBtn.setAttribute('data-fr', '← Retour à la Sélection d\'Écriture');
        backToScriptBtn.setAttribute('data-ja', '← 文字選択に戻る');
        backToScriptBtn.textContent = backToScriptBtn.getAttribute(`data-${currentLanguage}`);
    }
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
    
    // Explicitly set up the custom word button for Round 1 (initial round)
    setupCustomWordButtonsForRound(1);
}

function populateWordSelectionGrid(roundNumber) {
    const round = document.querySelector(`.custom-round[data-round="${roundNumber}"]`);
    if (!round) return;
    
    const grid = round.querySelector('.word-selection-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Get all words from the word pools, organized by introduction rounds
    const allWords = getAllWordsByRound();
    
    allWords.forEach((wordGroup, roundIndex) => {
        // Create collapsible section for each round
        const sectionContainer = document.createElement('div');
        sectionContainer.className = 'word-section-container';
        
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'word-section-header';
        sectionHeader.onclick = () => toggleWordSection(roundNumber - 1, roundIndex);
        
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
        wordContent.id = `word-content-${roundNumber - 1}-${roundIndex}`;
        
        // Create word checkboxes for this round
        wordGroup.forEach(word => {
            const wordItem = document.createElement('div');
            wordItem.className = 'word-checkbox-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `word-${roundNumber - 1}-${word.japanese}`;
            checkbox.dataset.japanese = word.japanese;
            checkbox.dataset.english = word.english;
            
            // Add event listener to save custom rounds when checkbox changes
            checkbox.addEventListener('change', () => {
                saveCustomRounds();
            });
            
            const label = document.createElement('label');
            label.htmlFor = `word-${roundNumber - 1}-${word.japanese}`;
            label.textContent = capitalizeWords(word.english);
            
            wordItem.appendChild(checkbox);
            wordItem.appendChild(label);
            wordContent.appendChild(wordItem);
        });
        
        sectionContainer.appendChild(wordContent);
        grid.appendChild(sectionContainer);
    });
}

function populateWordSelectionGrids() {
    const rounds = document.querySelectorAll('.custom-round');
    
    rounds.forEach((round, index) => {
        const roundNumber = index + 1;
        populateWordSelectionGrid(roundNumber);
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

function setupCustomWordButtonsForRound(roundNumber) {
    const round = document.querySelector(`.custom-round[data-round="${roundNumber}"]`);
    if (!round) return;
    
    const addCustomWordBtn = round.querySelector('.add-custom-word-btn');
    
    if (addCustomWordBtn) {
        // Remove existing event listeners
        const newBtn = addCustomWordBtn.cloneNode(true);
        addCustomWordBtn.parentNode.replaceChild(newBtn, addCustomWordBtn);
        
        newBtn.addEventListener('click', () => {
            const inputs = newBtn.parentElement.querySelector('.custom-word-inputs');
            inputs.classList.toggle('hidden');
            
            // Add initial input row if container is empty
            const container = inputs.querySelector('.custom-word-inputs-container');
            if (container.children.length === 0) {
                addCustomWordInputRow(container);
            }
        });
    }
}

function setupCustomWordButtons() {
    const addCustomWordBtns = document.querySelectorAll('.add-custom-word-btn');
    
    addCustomWordBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            const inputs = btn.parentElement.querySelector('.custom-word-inputs');
            inputs.classList.toggle('hidden');
            
            // Add initial input row if container is empty
            const container = inputs.querySelector('.custom-word-inputs-container');
            if (container.children.length === 0) {
                addCustomWordInputRow(container);
            }
        });
    });
}

function addCustomWordInputRow(container) {
    const inputRow = document.createElement('div');
    inputRow.className = 'input-row';
    inputRow.style.marginBottom = '10px';
    
    const japaneseInput = document.createElement('input');
    japaneseInput.type = 'text';
    japaneseInput.className = 'japanese-word-input';
    japaneseInput.placeholder = 'Japanese Word';
    japaneseInput.style.marginRight = '10px';
    
    const englishInput = document.createElement('input');
    englishInput.type = 'text';
    englishInput.className = 'english-translation-input';
    englishInput.placeholder = 'English Translation (Correct Answer)';
    englishInput.style.marginRight = '10px';
    
    const addBtn = document.createElement('button');
    addBtn.className = 'add-word-btn';
    addBtn.textContent = 'Add';
    
    // Add event listener
    addBtn.addEventListener('click', () => {
        const japanese = japaneseInput.value.trim();
        const english = englishInput.value.trim();
        
        if (japanese && english) {
            const roundContainer = container.closest('.custom-round');
            addCustomWordToRound(roundContainer, japanese, english);
            japaneseInput.value = '';
            englishInput.value = '';
        } else {
            alert('Please enter both Japanese word and English translation.');
        }
    });
    
    inputRow.appendChild(japaneseInput);
    inputRow.appendChild(englishInput);
    inputRow.appendChild(addBtn);
    
    container.appendChild(inputRow);
}

function addCustomWordToRound(roundContainer, japanese, english) {
    const grid = roundContainer.querySelector('.word-selection-grid');
    
    // Create new word item
    const wordItem = document.createElement('div');
    wordItem.className = 'word-checkbox-item custom-word-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `custom-word-${Date.now()}`;
    checkbox.dataset.japanese = japanese;
    checkbox.dataset.english = english;
    checkbox.checked = true; // Auto-check custom words
    
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = capitalizeWords(english);
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-custom-word-btn';
    removeBtn.textContent = 'Remove Word';
    
    // Add event listener to remove button
    removeBtn.addEventListener('click', () => {
        wordItem.remove();
    });
    
    wordItem.appendChild(checkbox);
    wordItem.appendChild(label);
    wordItem.appendChild(removeBtn);
    
    // Add to the end of the grid
    grid.appendChild(wordItem);
    
    // Save custom rounds to local storage
    saveCustomRounds();
}

function addCustomRound() {
    const roundNumber = document.querySelectorAll('.custom-round').length + 1;
    
    const newRound = document.createElement('div');
    newRound.className = 'custom-round';
    newRound.dataset.round = roundNumber;
    
    newRound.innerHTML = `
        <div class="custom-round-header" onclick="toggleCustomRound(${roundNumber})">
            <h3 data-en="Introduction Round ${roundNumber}" data-es="Ronda de Introducción ${roundNumber}" data-fr="Ronde d'Introduction ${roundNumber}" data-ja="導入ラウンド${roundNumber}">Introduction Round ${roundNumber}</h3>
            <div class="round-header-controls">
                <button class="remove-round-btn" onclick="removeSpecificRound(${roundNumber})">Remove Round</button>
                <button class="collapse-btn">▼</button>
            </div>
        </div>
        
        <div class="custom-round-content" id="round-content-${roundNumber}">
        <p data-en="Please select the words you'd like to include in this round." data-es="Por favor selecciona las palabras que quieres incluir en esta ronda." data-fr="Veuillez sélectionner les mots que vous souhaitez inclure dans cette ronde." data-ja="このラウンドに含めたい単語を選択してください。">Please select the words you'd like to include in this round.</p>
        
        <div class="word-selection-grid" id="word-selection-${roundNumber}">
            <!-- Word checkboxes will be populated by JavaScript -->
        </div>
        
        <div class="custom-word-section">
            <button class="add-custom-word-btn" data-en="Add Custom Word To Round" data-es="Agregar Palabra Personalizada a la Ronda" data-fr="Ajouter un Mot Personnalisé à la Ronde" data-ja="ラウンドにカスタム単語を追加">Add Custom Word To Round</button>
            <div class="custom-word-inputs hidden">
                <div class="custom-word-inputs-container">
                    <!-- Custom word input rows will be added here dynamically -->
                </div>
            </div>
        </div>
        </div>
    `;
    
    customRoundsContainer.appendChild(newRound);
    
    // Populate only the new round's word selection grid
    populateWordSelectionGrid(roundNumber);
    
    // Setup buttons for the new round only
    setupCustomWordButtonsForRound(roundNumber);
    
    // Update remove button visibility
    updateRemoveButtonVisibility();
    
    // Update round selector with new rounds
    populateRoundSelector();
    
    // Save custom rounds to local storage
    saveCustomRounds();
    
    // Update language for new elements
    updateAllText();
}

function removeSpecificRound(roundNumber) {
    const rounds = document.querySelectorAll('.custom-round');
    
    if (rounds.length > 1) {
        // Find the round to remove
        const roundToRemove = document.querySelector(`.custom-round[data-round="${roundNumber}"]`);
        if (roundToRemove) {
            // Preserve state of remaining rounds before removal
            const stateToPreserve = {};
            const remainingRounds = document.querySelectorAll('.custom-round');
            remainingRounds.forEach((round, index) => {
                const currentRoundNumber = parseInt(round.dataset.round);
                if (currentRoundNumber > roundNumber) {
                    // This round will be renumbered, preserve its state
                    const checkboxes = round.querySelectorAll('input[type="checkbox"]:checked');
                    const openSections = round.querySelectorAll('.word-section-content:not(.collapsed)');
                    const customWords = round.querySelectorAll('.custom-word-item');
                    
                    stateToPreserve[currentRoundNumber] = {
                        checkedWords: Array.from(checkboxes).map(cb => cb.dataset.english),
                        openSections: Array.from(openSections).map(section => section.id),
                        customWords: Array.from(customWords).map(item => ({
                            japanese: item.querySelector('.japanese-word').textContent,
                            english: item.querySelector('.english-word').textContent
                        }))
                    };
                }
            });
            
            roundToRemove.remove();
            
            // Update round numbers for remaining rounds
            const newRemainingRounds = document.querySelectorAll('.custom-round');
            newRemainingRounds.forEach((round, index) => {
                const newRoundNumber = index + 1;
                const oldRoundNumber = parseInt(round.dataset.round) || (index + 1);
                round.dataset.round = newRoundNumber;
                
                const header = round.querySelector('.custom-round-header h3');
                const content = round.querySelector('.custom-round-content');
                const headerDiv = round.querySelector('.custom-round-header');
                const removeBtn = round.querySelector('.remove-round-btn');
                
                // Update IDs and onclick
                content.id = `round-content-${newRoundNumber}`;
                headerDiv.onclick = () => toggleCustomRound(newRoundNumber);
                
                // Update remove button onclick
                if (removeBtn) {
                    removeBtn.onclick = () => removeSpecificRound(newRoundNumber);
                }
                
                // Update text content
                header.textContent = `Introduction Round ${newRoundNumber}`;
                header.setAttribute('data-en', `Introduction Round ${newRoundNumber}`);
                header.setAttribute('data-es', `Ronda de Introducción ${newRoundNumber}`);
                header.setAttribute('data-fr', `Ronde d'Introduction ${newRoundNumber}`);
                header.setAttribute('data-ja', `導入ラウンド${newRoundNumber}`);
                
                // Restore state if this round was renumbered
                if (oldRoundNumber > roundNumber && stateToPreserve[oldRoundNumber]) {
                    const preservedState = stateToPreserve[oldRoundNumber];
                    
                    // Restore checked checkboxes
                    preservedState.checkedWords.forEach(word => {
                        const checkbox = round.querySelector(`input[data-english="${word}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                    
                    // Restore open sections
                    preservedState.openSections.forEach(sectionId => {
                        const newSectionId = sectionId.replace(`-${oldRoundNumber}-`, `-${newRoundNumber}-`);
                        const section = round.querySelector(`#${newSectionId}`);
                        if (section) section.classList.remove('collapsed');
                    });
                    
                    // Restore custom words
                    preservedState.customWords.forEach(customWord => {
                        addCustomWordToRound(round, customWord.japanese, customWord.english);
                    });
                }
            });
            
            // Update remove button visibility
            updateRemoveButtonVisibility();
            
            // Update round selector with new rounds
            populateRoundSelector();
            
            // Save custom rounds to local storage
            saveCustomRounds();
        }
    } else {
        alert('You must have at least one round.');
    }
}

function updateRemoveButtonVisibility() {
    const rounds = document.querySelectorAll('.custom-round');
    
    rounds.forEach((round, index) => {
        const removeBtn = round.querySelector('.remove-round-btn');
        if (removeBtn) {
            // Only show remove button if it's not the first round (round 1)
            // Round 1 should never have a remove button, even with multiple rounds
            if (index === 0) {
                removeBtn.style.display = 'none';
            } else {
                removeBtn.style.display = 'block';
            }
        }
    });
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
    
    // Populate round selector with custom rounds
    populateRoundSelector();
    
    // Update back button text for custom mode
    updateBackButtonText();
    
    // Start the game with custom mode
    startCustomGame();
}

function startCustomGame() {
    // Always start fresh - users can use round selector to jump to any round
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
    
    // Keep custom mode enabled for the duration of the game
    // Only reset when explicitly leaving custom mode
    
    showPage('game');
    initializeCustomRound();
}

function initializeCustomRound() {
    const customWordPools = window.customWordPools || [];
    const noPracticeRounds = window.customModeNoPracticeRounds || false;
    
    // Calculate the actual round number (accounting for skipped practice rounds)
    let actualRoundNumber;
    if (noPracticeRounds) {
        // If practice rounds are disabled, only count introduction rounds
        actualRoundNumber = currentRound;
    } else {
        // If practice rounds are enabled, use the full round number
        actualRoundNumber = currentRound;
    }
    
    const isIntroductionRound = noPracticeRounds ? true : (currentRound % 2 === 1);
    
    // Disable next round button at start of each round
    nextRoundBtn.classList.add('disabled');
    
    if (isIntroductionRound) {
        // Calculate the introduction round number
        const introRoundNumber = noPracticeRounds ? currentRound : Math.ceil(currentRound / 2);
        roundTitle.textContent = `Introduction Round ${introRoundNumber}`;
        currentPhase = 'learning';
        currentQuestionIndex = 0;
        showCustomLearningQuestion();
    } else {
        // Calculate the practice round number
        const practiceRoundNumber = Math.floor(currentRound / 2);
        roundTitle.textContent = `Practice Round ${practiceRoundNumber}`;
        currentPhase = 'elimination';
        // For practice rounds, use accumulated words from all previous introduction rounds
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
    const noPracticeRounds = window.customModeNoPracticeRounds || false;
    let allWords = [];
    
    if (noPracticeRounds) {
        // If practice rounds are disabled, only include words from the current introduction round
        const roundIndex = roundNumber - 1;
        if (customWordPools[roundIndex]) {
            allWords = allWords.concat(customWordPools[roundIndex]);
        }
    } else {
        // If practice rounds are enabled, include words from all previous introduction rounds
        for (let i = 0; i < Math.ceil(roundNumber / 2); i++) {
            if (customWordPools[i]) {
                allWords = allWords.concat(customWordPools[i]);
            }
        }
    }
    
    return allWords;
}

function getCurrentCustomRoundWords() {
    const customWordPools = window.customWordPools || [];
    const noPracticeRounds = window.customModeNoPracticeRounds || false;
    
    if (noPracticeRounds) {
        // If practice rounds are disabled, only use introduction rounds
        const roundIndex = currentRound - 1;
        console.log('Custom round words (no practice):', { currentRound, roundIndex, customWordPools, result: customWordPools[roundIndex] || [] });
        return customWordPools[roundIndex] || [];
    } else {
        // If practice rounds are enabled, calculate based on introduction rounds
        const roundIndex = Math.floor((currentRound - 1) / 2);
        console.log('Custom round words (with practice):', { currentRound, roundIndex, customWordPools, result: customWordPools[roundIndex] || [] });
        return customWordPools[roundIndex] || [];
    }
}

function showCustomLearningQuestion() {
    const roundWords = getCurrentCustomRoundWords();
    console.log('Show custom learning question:', { currentQuestionIndex, roundWords, word: roundWords[currentQuestionIndex] });
    
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
        // Determine which words to use based on round type
        const noPracticeRounds = window.customModeNoPracticeRounds || false;
        const isIntroductionRound = noPracticeRounds ? true : (currentRound % 2 === 1);
        
        let allWords;
        if (isIntroductionRound) {
            // For introduction rounds, only use the current round's words
            allWords = getCurrentCustomRoundWords();
        } else {
            // For practice rounds, use accumulated words from all previous introduction rounds
            allWords = getAllCustomWordsUpToRound(currentRound);
        }
        
        // Check if all words have 3 correct answers
        const targetCorrect = allWords.length * 3;
        let totalCorrect = 0;
        
        allWords.forEach(word => {
            totalCorrect += correctAnswers[word.japanese] || 0;
        });
        
        if (totalCorrect >= targetCorrect) {
            // All words have 3 correct answers, enable next round button
            // Don't automatically progress - let user click the button
            nextRoundBtn.classList.remove('disabled');
        }
        
        // Refill the queue and continue (regardless of whether target is reached)
        questionQueue = [...allWords];
        shuffleArray(questionQueue);
    }
    
    // If queue is still empty after refilling, something went wrong
    if (questionQueue.length === 0) {
        console.error('Question queue is empty after refilling');
        return;
    }
    
    const word = questionQueue[0];
    japaneseWord.textContent = word.japanese;
    correctAnswerDisplay.classList.add('hidden');
    
    // Reset the failed flag for the new question
    currentQuestionFailed = false;
    
    answerInput.value = '';
    answerInput.focus();
    
    updateProgress();
    updatePhaseLabel();
}

function initializeCustomQuestionQueue() {
    const noPracticeRounds = window.customModeNoPracticeRounds || false;
    const isIntroductionRound = noPracticeRounds ? true : (currentRound % 2 === 1);
    
    let allWords;
    if (isIntroductionRound) {
        // For introduction rounds, only use the current round's words
        allWords = getCurrentCustomRoundWords();
    } else {
        // For practice rounds, use accumulated words from all previous introduction rounds
        allWords = getAllCustomWordsUpToRound(currentRound);
    }
    
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
    
    // Update statistics for correct answer
    updateStats(true, currentRound);
    
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
    
    // Update statistics for incorrect answer
    updateStats(false, currentRound);
    
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
        // Determine which words to use based on round type
        const noPracticeRounds = window.customModeNoPracticeRounds || false;
        const isIntroductionRound = noPracticeRounds ? true : (currentRound % 2 === 1);
        
        let allWords;
        if (isIntroductionRound) {
            // For introduction rounds, only use the current round's words
            allWords = getCurrentCustomRoundWords();
        } else {
            // For practice rounds, use accumulated words from all previous introduction rounds
            allWords = getAllCustomWordsUpToRound(currentRound);
        }
        
        const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
        questionQueue.push(randomWord);
    }
    
    // Show next question
    showCustomRepeatingQuestion();
}

function updateCustomNextRoundButton() {
    // Determine which words to use based on round type
    const noPracticeRounds = window.customModeNoPracticeRounds || false;
    const isIntroductionRound = noPracticeRounds ? true : (currentRound % 2 === 1);
    
    let allWords;
    if (isIntroductionRound) {
        // For introduction rounds, only use the current round's words
        allWords = getCurrentCustomRoundWords();
    } else {
        // For practice rounds, use accumulated words from all previous introduction rounds
        allWords = getAllCustomWordsUpToRound(currentRound);
    }
    
    const targetCorrect = allWords.length * 3;
    let totalCorrect = 0;
    
    allWords.forEach(word => {
        totalCorrect += correctAnswers[word.japanese] || 0;
    });
    
    if (totalCorrect >= targetCorrect) {
        nextRoundBtn.classList.remove('disabled');
    }
}

// Local Storage Keys
const STORAGE_KEYS = {
    SETTINGS: 'japaneseLearningSettings',
    CUSTOM_ROUNDS: 'japaneseLearningCustomRounds',
    STATS: 'japaneseLearningStats',
    COOKIE_CONSENT: 'japaneseLearningCookieConsent'
};

// User Statistics
let userStats = {
    totalCorrectAnswers: 0,
    totalIncorrectAnswers: 0,
    highestRoundReached: 0,
            // gamesPlayed removed
    totalPlayTime: 0
};

// Progress tracking removed - no longer persisting round progression between sessions

// Check if localStorage is available
function isLocalStorageAvailable() {
    try {
        const test = '__localStorage_test__';
        localStorage.setItem(test, 'test');
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        console.warn('localStorage is not available:', e);
        return false;
    }
}

// Local Storage Functions
function saveToLocalStorage(key, data) {
    if (!isLocalStorageAvailable()) {
        console.warn('Cannot save to localStorage: not available');
        return false;
    }
    
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function loadFromLocalStorage(key, defaultValue = null) {
    if (!isLocalStorageAvailable()) {
        console.warn('Cannot load from localStorage: not available');
        return defaultValue;
    }
    
    try {
        const item = localStorage.getItem(key);
        if (!item) {
            return defaultValue;
        }
        
        const parsed = JSON.parse(item);
        return parsed !== null ? parsed : defaultValue;
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        return defaultValue;
    }
}

function saveSettings() {
    const settings = {
        language: currentLanguage,
        darkMode: isDarkMode
    };
    saveToLocalStorage(STORAGE_KEYS.SETTINGS, settings);
}

function loadSettings() {
    const settings = loadFromLocalStorage(STORAGE_KEYS.SETTINGS, { language: 'en', darkMode: false });
    
    // Validate and apply language setting
    if (settings && typeof settings.language === 'string' && ['en', 'es', 'fr', 'ja'].includes(settings.language)) {
        currentLanguage = settings.language;
    } else {
        currentLanguage = 'en';
        console.warn('Invalid language setting, defaulting to English');
    }
    
    // Validate and apply dark mode setting
    if (settings && typeof settings.darkMode === 'boolean') {
        isDarkMode = settings.darkMode;
    } else {
        isDarkMode = false;
        console.warn('Invalid dark mode setting, defaulting to light mode');
    }
    
    // Apply settings
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    updateAllText();
}

function saveCustomRounds() {
    if (window.customWordPools) {
        const customData = {
            wordPools: window.customWordPools,
            noPracticeRounds: window.customModeNoPracticeRounds || false
        };
        saveToLocalStorage(STORAGE_KEYS.CUSTOM_ROUNDS, customData);
    }
}

function loadCustomRounds() {
    const customData = loadFromLocalStorage(STORAGE_KEYS.CUSTOM_ROUNDS, null);
    if (customData && typeof customData === 'object') {
        // Validate word pools structure
        if (customData.wordPools && typeof customData.wordPools === 'object') {
            let isValid = true;
            for (const [round, words] of Object.entries(customData.wordPools)) {
                if (!Array.isArray(words)) {
                    isValid = false;
                    break;
                }
                for (const word of words) {
                    if (!word || typeof word.japanese !== 'string' || typeof word.english !== 'string') {
                        isValid = false;
                        break;
                    }
                }
                if (!isValid) break;
            }
            
            if (isValid) {
                window.customWordPools = customData.wordPools;
                window.customModeNoPracticeRounds = Boolean(customData.noPracticeRounds);
                return true;
            } else {
                console.warn('Invalid custom rounds data structure, ignoring');
            }
        } else {
            console.warn('Invalid custom rounds data, ignoring');
        }
    }
    return false;
}

// saveProgress function removed - no longer saving round progression
// Progress is still tracked within a game session but not persisted between sessions

// loadProgress function removed - no longer auto-restoring round progress
// Users can use the round selector dropdown to jump to any round they want

function saveStats() {
    saveToLocalStorage(STORAGE_KEYS.STATS, userStats);
}

function loadStats() {
    const stats = loadFromLocalStorage(STORAGE_KEYS.STATS, userStats);
    if (stats && typeof stats === 'object') {
        // Validate each stat property
        if (typeof stats.totalCorrectAnswers === 'number' && stats.totalCorrectAnswers >= 0) {
            userStats.totalCorrectAnswers = stats.totalCorrectAnswers;
        }
        if (typeof stats.totalIncorrectAnswers === 'number' && stats.totalIncorrectAnswers >= 0) {
            userStats.totalIncorrectAnswers = stats.totalIncorrectAnswers;
        }
        if (typeof stats.highestRoundReached === 'number' && stats.highestRoundReached >= 0) {
            userStats.highestRoundReached = stats.highestRoundReached;
        }
        // gamesPlayed stat removed - no longer tracking
        if (typeof stats.totalPlayTime === 'number' && stats.totalPlayTime >= 0) {
            userStats.totalPlayTime = stats.totalPlayTime;
        }
        // lastPlayed stat removed - no longer tracking
    }
}

function updateStats(correct = false, roundReached = null) {
    if (correct) {
        userStats.totalCorrectAnswers++;
    } else {
        userStats.totalIncorrectAnswers++;
    }
    
    // Only update highest round reached for brute force mode (not custom mode)
    if (roundReached && !window.customModeEnabled && roundReached > userStats.highestRoundReached) {
        userStats.highestRoundReached = roundReached;
    }
    
    saveStats();
}

function clearAllData() {
    if (isLocalStorageAvailable()) {
        // Clear only our app's data, not all localStorage
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
    
    // Reset all variables to defaults
    userStats = {
        totalCorrectAnswers: 0,
        totalIncorrectAnswers: 0,
        highestRoundReached: 0,
        totalPlayTime: 0
    };
    // currentProgress variable removed - no longer tracking round progression
    
    // Reset custom mode variables
    window.customWordPools = null;
    window.customModeEnabled = false;
    window.customModeNoPracticeRounds = false;
    
    console.log('All data cleared and reset to defaults');
}

// Check for data corruption and auto-fix if needed
function validateAndFixData() {
    try {
        // Test if we can access all the necessary data
        loadSettings();
        loadStats();
        loadCustomRounds();
        // Note: loadProgress() removed - no longer auto-restoring round progress
        
        // Load cookie consent preferences
        const consentLoaded = loadCookieConsent();
        
        console.log('Data validation successful');
        return true;
    } catch (error) {
        console.error('Data corruption detected, clearing corrupted data:', error);
        clearAllData();
        
        // Try loading defaults again
        try {
            loadSettings();
            loadStats();
            console.log('Data reset successful');
            return true;
        } catch (secondError) {
            console.error('Critical error: Unable to initialize data:', secondError);
            return false;
        }
    }
}

// Cookie Consent Functions
function showCookieConsent() {
    // Sync theme toggle with current theme state
    cookieThemeToggle.checked = isDarkMode;
    
    // Show the popup
    cookieConsentOverlay.classList.remove('hidden');
}

function hideCookieConsent() {
    cookieConsentOverlay.classList.add('hidden');
}

function rejectCookies() {
    // Disable advertising cookies
    advertisingCookiesCheckbox.checked = false;
    
    // Disable adsense script
    adsenseScript.classList.add('disabled');
    
    // Set global flag and disable AdSense
    window.adsenseEnabled = false;
    if (typeof window.disableAdSense === 'function') {
        window.disableAdSense();
    }
    
    // Save consent preference
    const consentData = {
        analytics: true, // Always required
        advertising: false,
        timestamp: Date.now()
    };
    saveToLocalStorage(STORAGE_KEYS.COOKIE_CONSENT, consentData);
    
    // Hide the popup
    hideCookieConsent();
    
    console.log('Cookies rejected - Analytics enabled, Advertising disabled');
}

function acceptCookies() {
    // Enable advertising cookies if checked
    const advertisingEnabled = advertisingCookiesCheckbox.checked;
    
    // Enable/disable adsense script based on checkbox
    if (advertisingEnabled) {
        adsenseScript.classList.remove('disabled');
        window.adsenseEnabled = true;
        if (typeof window.enableAdSense === 'function') {
            window.enableAdSense();
        }
    } else {
        adsenseScript.classList.add('disabled');
        window.adsenseEnabled = false;
        if (typeof window.disableAdSense === 'function') {
            window.disableAdSense();
        }
    }
    
    // Analytics is always enabled
    analyticsScript.classList.remove('disabled');
    
    // Save consent preference
    const consentData = {
        analytics: true,
        advertising: advertisingEnabled,
        timestamp: Date.now()
    };
    saveToLocalStorage(STORAGE_KEYS.COOKIE_CONSENT, consentData);
    
    // Hide the popup
    hideCookieConsent();
    
    console.log('Cookies accepted - Analytics enabled, Advertising:', advertisingEnabled ? 'enabled' : 'disabled');
}

function loadCookieConsent() {
    const consentData = loadFromLocalStorage(STORAGE_KEYS.COOKIE_CONSENT, null);
    
    if (consentData && typeof consentData === 'object') {
        // Apply saved preferences
        if (consentData.advertising === false) {
            // User previously rejected advertising cookies
            advertisingCookiesCheckbox.checked = false;
            adsenseScript.classList.add('disabled');
            window.adsenseEnabled = false;
            if (typeof window.disableAdSense === 'function') {
                window.disableAdSense();
            }
        } else if (consentData.advertising === true) {
            // User previously accepted advertising cookies
            advertisingCookiesCheckbox.checked = true;
            adsenseScript.classList.remove('disabled');
            window.adsenseEnabled = true;
            if (typeof window.enableAdSense === 'function') {
                window.enableAdSense();
            }
        }
        
        // Analytics is always enabled
        analyticsScript.classList.remove('disabled');
        
        console.log('Cookie consent preferences loaded');
        return true;
    }
    
    // No consent data found - show popup
    return false;
}

// Language and Theme Functions for Cookie Popup
function toggleLanguageOptions() {
    languageOptions.classList.toggle('hidden');
}

function selectLanguage(lang) {
    // Change the language
    currentLanguage = lang;
    
    // Update the language button text
    languageSelectorBtn.textContent = languageSelectorBtn.getAttribute(`data-${lang}`);
    
    // Update all text on the page
    updateAllText();
    
    // Hide the language options
    languageOptions.classList.add('hidden');
    
    // Save the language preference
    saveSettings();
    
    console.log('Language changed to:', lang);
}

function handleCookieThemeToggle() {
    const isDark = cookieThemeToggle.checked;
    
    // Apply theme
    if (isDark) {
        document.body.classList.add('dark-mode');
        isDarkMode = true;
    } else {
        document.body.classList.remove('dark-mode');
        isDarkMode = false;
    }
    
    // Save theme preference
    saveSettings();
    
    // Update all text to reflect theme changes
    updateAllText();
    
    console.log('Theme changed to:', isDark ? 'dark' : 'light');
}

// Debug function to test localStorage functionality
function testLocalStorage() {
    console.log('=== localStorage Test ===');
    
    // Test basic availability
    console.log('localStorage available:', isLocalStorageAvailable());
    
    // Test saving and loading settings
    console.log('Testing settings...');
    const originalLang = currentLanguage;
    const originalDark = isDarkMode;
    
    currentLanguage = 'es';
    isDarkMode = true;
    saveSettings();
    
    currentLanguage = 'en';
    isDarkMode = false;
    loadSettings();
    
    console.log('Language restored:', currentLanguage === 'es' ? '✅' : '❌', currentLanguage);
    console.log('Dark mode restored:', isDarkMode === true ? '✅' : '❌', isDarkMode);
    
    // Restore original values
    currentLanguage = originalLang;
    isDarkMode = originalDark;
    saveSettings();
    
    // Test stats
    console.log('Testing stats...');
    const originalStats = { ...userStats };
    userStats.totalCorrectAnswers = 42;
    saveStats();
    userStats.totalCorrectAnswers = 0;
    loadStats();
    console.log('Stats restored:', userStats.totalCorrectAnswers === 42 ? '✅' : '❌', userStats.totalCorrectAnswers);
    
    // Restore original stats
    userStats = originalStats;
    saveStats();
    
    // Show current storage size
    let totalSize = 0;
    Object.values(STORAGE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
            totalSize += item.length;
            console.log(`${key}: ${(item.length / 1024).toFixed(2)} KB`);
        }
    });
    console.log(`Total storage used: ${(totalSize / 1024).toFixed(2)} KB`);
    
    console.log('=== localStorage Test Complete ===');
}

// Make test function available globally for debugging
if (typeof window !== 'undefined') {
    window.testLocalStorage = testLocalStorage;
}

// Update stats display function
function updateStatsDisplay() {
    // Calculate accuracy rate
    const totalAnswers = userStats.totalCorrectAnswers + userStats.totalIncorrectAnswers;
    const accuracyRate = totalAnswers > 0 ? Math.round((userStats.totalCorrectAnswers / totalAnswers) * 100) : 0;
    
    // Update display elements
    totalCorrectSpan.textContent = userStats.totalCorrectAnswers;
    totalIncorrectSpan.textContent = userStats.totalIncorrectAnswers;
    accuracyRateSpan.textContent = `${accuracyRate}%`;
    highestRoundSpan.textContent = userStats.highestRoundReached;
    
    // Games played and last played stats removed - no longer displaying
}
