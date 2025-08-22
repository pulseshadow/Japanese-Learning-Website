// Game state
let currentPage = 'start';
let currentRound = 1;
let currentPhase = 'learning'; // 'learning', 'elimination', or 'repeating'
let currentQuestionIndex = 0;
let currentWord = null; // Current word being displayed
let correctAnswers = {}; // Track correct answers per word
let questionQueue = []; // Queue for upcoming questions
let allLearnedWords = []; // All words from previous introduction rounds
let wordsWithPendingPoints = new Set(); // Track words that have pending points from incorrect answers
let currentQuestionFailed = false; // Track if current question was answered incorrectly
let eliminationWords = []; // Words for elimination phase (no repetition)

// Settings and language variables
let currentLanguage = 'en';
let isDarkMode = false;
let autoPlaySound = false;

// Multi-language word pools with translations for all supported languages
const wordPools = {
    1: [ // Introduction Round 1
        { 
            japanese: 'こんにちは', 
            english: 'hi',
            translations: {
                en: 'hi',
                es: 'hola',
                fr: 'salut',
                ja: 'こんにちは',
                zh: '你好',
                id: 'hai',
                ko: '안녕',
                vi: 'xin chào'
            }
        },
        { 
            japanese: 'ください', 
            english: 'please',
            translations: {
                en: 'please',
                es: 'por favor',
                fr: 's\'il vous plaît',
                ja: 'ください',
                zh: '请',
                id: 'tolong',
                ko: '제발',
                vi: 'xin vui lòng'
            }
        },
        { 
            japanese: 'はい', 
            english: 'yes',
            translations: {
                en: 'yes',
                es: 'sí',
                fr: 'oui',
                ja: 'はい',
                zh: '是',
                id: 'ya',
                ko: '네',
                vi: 'vâng'
            }
        },
        { 
            japanese: 'いいえ', 
            english: 'no',
            translations: {
                en: 'no',
                es: 'no',
                fr: 'non',
                ja: 'いいえ',
                zh: '不',
                id: 'tidak',
                ko: '아니요',
                vi: 'không'
            }
        },
        { 
            japanese: 'わたし', 
            english: 'i',
            translations: {
                en: 'i',
                es: 'yo',
                fr: 'je',
                ja: 'わたし',
                zh: '我',
                id: 'saya',
                ko: '나',
                vi: 'tôi'
            }
        }
    ],
    2: [ // Practice Round 1 (rounds 1 + 2 combined)
        { 
            japanese: 'こんにちは', 
            english: 'hi',
            translations: {
                en: 'hi',
                es: 'hola',
                fr: 'salut',
                ja: 'こんにちは',
                zh: '你好',
                id: 'hai',
                ko: '안녕',
                vi: 'xin chào'
            }
        },
        { 
            japanese: 'ください', 
            english: 'please',
            translations: {
                en: 'please',
                es: 'por favor',
                fr: 's\'il vous plaît',
                ja: 'ください',
                zh: '请',
                id: 'tolong',
                ko: '제발',
                vi: 'xin vui lòng'
            }
        },
        { 
            japanese: 'はい', 
            english: 'yes',
            translations: {
                en: 'yes',
                es: 'sí',
                fr: 'oui',
                ja: 'はい',
                zh: '是',
                id: 'ya',
                ko: '네',
                vi: 'vâng'
            }
        },
        { 
            japanese: 'いいえ', 
            english: 'no',
            translations: {
                en: 'no',
                es: 'no',
                fr: 'non',
                ja: 'いいえ',
                zh: '不',
                id: 'tidak',
                ko: '아니요',
                vi: 'không'
            }
        },
        { 
            japanese: 'わたし', 
            english: 'i',
            translations: {
                en: 'i',
                es: 'yo',
                fr: 'je',
                ja: 'わたし',
                zh: '我',
                id: 'saya',
                ko: '나',
                vi: 'tôi'
            }
        },
        { 
            japanese: 'だれ', 
            english: 'who',
            translations: {
                en: 'who',
                es: 'quién',
                fr: 'qui',
                ja: 'だれ',
                zh: '谁',
                id: 'siapa',
                ko: '누구',
                vi: 'ai'
            }
        },
        { 
            japanese: 'なに', 
            english: 'what',
            translations: {
                en: 'what',
                es: 'qué',
                fr: 'quoi',
                ja: 'なに',
                zh: '什么',
                id: 'apa',
                ko: '무엇',
                vi: 'gì'
            }
        },
        { 
            japanese: 'どう', 
            english: 'how',
            translations: {
                en: 'how',
                es: 'cómo',
                fr: 'comment',
                ja: 'どう',
                zh: '怎么',
                id: 'bagaimana',
                ko: '어떻게',
                vi: 'làm sao'
            }
        },
        { 
            japanese: 'いくら', 
            english: 'how much',
            translations: {
                en: 'how much',
                es: 'cuánto',
                fr: 'combien',
                ja: 'いくら',
                zh: '多少',
                id: 'berapa',
                ko: '얼마',
                vi: 'bao nhiêu'
            }
        },
        { 
            japanese: 'どの', 
            english: 'which',
            translations: {
                en: 'which',
                es: 'cuál',
                fr: 'quel',
                ja: 'どの',
                zh: '哪个',
                id: 'yang mana',
                ko: '어떤',
                vi: 'cái nào'
            }
        },
        { 
            japanese: 'どんな', 
            english: 'what kind of',
            translations: {
                en: 'what kind of',
                es: 'qué tipo de',
                fr: 'quel genre de',
                ja: 'どんな',
                zh: '什么样的',
                id: 'jenis apa',
                ko: '어떤 종류의',
                vi: 'loại gì'
            }
        }
    ],
    3: [ // Introduction Round 2 (Polite Phrases)
        { 
            japanese: 'ありがとうございます', 
            english: 'thanks (polite)',
            translations: {
                en: 'thanks',
                es: 'gracias',
                fr: 'merci',
                ja: 'ありがとうございます',
                zh: '谢谢',
                id: 'terima kasih',
                ko: '감사합니다',
                vi: 'cảm ơn'
            }
        },
        { 
            japanese: 'すみません', 
            english: 'excuse me',
            translations: {
                en: 'excuse me',
                es: 'disculpe',
                fr: 'excusez-moi',
                ja: 'すみません',
                zh: '对不起',
                id: 'maaf',
                ko: '실례합니다',
                vi: 'xin lỗi'
            }
        },
        { 
            japanese: 'ごめんなさい', 
            english: 'sorry',
            translations: {
                en: 'sorry',
                es: 'lo siento',
                fr: 'désolé',
                ja: 'ごめんなさい',
                zh: '抱歉',
                id: 'maaf',
                ko: '미안해요',
                vi: 'xin lỗi'
            }
        },
        { 
            japanese: 'はじめまして', 
            english: 'nice to meet you',
            translations: {
                en: 'nice to meet you',
                es: 'encantado de conocerte',
                fr: 'enchanté de vous rencontrer',
                ja: 'はじめまして',
                zh: '很高兴认识你',
                id: 'senang bertemu denganmu',
                ko: '만나서 반가워요',
                vi: 'rất vui được gặp bạn'
            }
        },
        { 
            japanese: 'お願いします', 
            english: 'please (request)',
            translations: {
                en: 'please',
                es: 'por favor',
                fr: 's\'il vous plaît',
                ja: 'お願いします',
                zh: '请',
                id: 'tolong',
                ko: '제발',
                vi: 'xin vui lòng'
            }
        }
    ],
    4: [ // Practice Round 2 (rounds 1 + 3 combined)
        { 
            japanese: 'こんにちは', 
            english: 'hi',
            translations: {
                en: 'hi',
                es: 'hola',
                fr: 'salut',
                ja: 'こんにちは',
                zh: '你好',
                id: 'hai',
                ko: '안녕',
                vi: 'xin chào'
            }
        },
        { 
            japanese: 'ください', 
            english: 'please',
            translations: {
                en: 'please',
                es: 'por favor',
                fr: 's\'il vous plaît',
                ja: 'ください',
                zh: '请',
                id: 'tolong',
                ko: '제발',
                vi: 'xin vui lòng'
            }
        },
        { 
            japanese: 'はい', 
            english: 'yes',
            translations: {
                en: 'yes',
                es: 'sí',
                fr: 'oui',
                ja: 'はい',
                zh: '是',
                id: 'ya',
                ko: '네',
                vi: 'vâng'
            }
        },
        { 
            japanese: 'いいえ', 
            english: 'no',
            translations: {
                en: 'no',
                es: 'no',
                fr: 'non',
                ja: 'いいえ',
                zh: '不',
                id: 'tidak',
                ko: '아니요',
                vi: 'không'
            }
        },
        { 
            japanese: 'わたし', 
            english: 'i',
            translations: {
                en: 'i',
                es: 'yo',
                fr: 'je',
                ja: 'わたし',
                zh: '我',
                id: 'saya',
                ko: '나',
                vi: 'tôi'
            }
        },
        { 
            japanese: 'だれ', 
            english: 'who',
            translations: {
                en: 'who',
                es: 'quién',
                fr: 'qui',
                ja: 'だれ',
                zh: '谁',
                id: 'siapa',
                ko: '누구',
                vi: 'ai'
            }
        },
        { 
            japanese: 'なに', 
            english: 'what',
            translations: {
                en: 'what',
                es: 'qué',
                fr: 'quoi',
                ja: 'なに',
                zh: '什么',
                id: 'apa',
                ko: '무엇',
                vi: 'gì'
            }
        },
        { 
            japanese: 'どう', 
            english: 'how',
            translations: {
                en: 'how',
                es: 'cómo',
                fr: 'comment',
                ja: 'どう',
                zh: '怎么',
                id: 'bagaimana',
                ko: '어떻게',
                vi: 'làm sao'
            }
        },
        { 
            japanese: 'いくら', 
            english: 'how much',
            translations: {
                en: 'how much',
                es: 'cuánto',
                fr: 'combien',
                ja: 'いくら',
                zh: '多少',
                id: 'berapa',
                ko: '얼마',
                vi: 'bao nhiêu'
            }
        },
        { 
            japanese: 'どの', 
            english: 'which',
            translations: {
                en: 'which',
                es: 'cuál',
                fr: 'quel',
                ja: 'どの',
                zh: '哪个',
                id: 'yang mana',
                ko: '어떤',
                vi: 'cái nào'
            }
        },
        { 
            japanese: 'どんな', 
            english: 'what kind of',
            translations: {
                en: 'what kind of',
                es: 'qué tipo de',
                fr: 'quel genre de',
                ja: 'どんな',
                zh: '什么样的',
                id: 'jenis apa',
                ko: '어떤 종류의',
                vi: 'loại gì'
            }
        },
        { 
            japanese: 'ありがとうございます', 
            english: 'thanks (polite)',
            translations: {
                en: 'thanks',
                es: 'gracias',
                fr: 'merci',
                ja: 'ありがとうございます',
                zh: '谢谢',
                id: 'terima kasih',
                ko: '감사합니다',
                vi: 'cảm ơn'
            }
        },
        { 
            japanese: 'すみません', 
            english: 'excuse me',
            translations: {
                en: 'excuse me',
                es: 'disculpe',
                fr: 'excusez-moi',
                ja: 'すみません',
                zh: '对不起',
                id: 'maaf',
                ko: '실례합니다',
                vi: 'xin lỗi'
            }
        },
        { 
            japanese: 'ごめんなさい', 
            english: 'sorry',
            translations: {
                en: 'sorry',
                es: 'lo siento',
                fr: 'désolé',
                ja: 'ごめんなさい',
                zh: '抱歉',
                id: 'maaf',
                ko: '미안해요',
                vi: 'xin lỗi'
            }
        },
        { 
            japanese: 'はじめまして', 
            english: 'nice to meet you',
            translations: {
                en: 'nice to meet you',
                es: 'encantado de conocerte',
                fr: 'enchanté de vous rencontrer',
                ja: 'はじめまして',
                zh: '很高兴认识你',
                id: 'senang bertemu denganmu',
                ko: '만나서 반가워요',
                vi: 'rất vui được gặp bạn'
            }
        },
        { 
            japanese: 'お願いします', 
            english: 'please (request)',
            translations: {
                en: 'please',
                es: 'por favor',
                fr: 's\'il vous plaît',
                ja: 'お願いします',
                zh: '请',
                id: 'tolong',
                ko: '제발',
                vi: 'xin vui lòng'
            }
        }
    ],
    5: [ // Introduction Round 3 (Core Verbs)
        { 
            japanese: 'する', 
            english: '(to) do',
            translations: {
                en: 'do',
                es: 'hacer',
                fr: 'faire',
                ja: 'する',
                zh: '做',
                id: 'melakukan',
                ko: '하다',
                vi: 'làm'
            }
        },
        { 
            japanese: 'いく', 
            english: '(to) go',
            translations: {
                en: 'go',
                es: 'ir',
                fr: 'aller',
                ja: 'いく',
                zh: '去',
                id: 'pergi',
                ko: '가다',
                vi: 'đi'
            }
        },
        { 
            japanese: 'くる', 
            english: '(to) come',
            translations: {
                en: 'come',
                es: 'venir',
                fr: 'venir',
                ja: 'くる',
                zh: '来',
                id: 'datang',
                ko: '오다',
                vi: 'đến'
            }
        },
        { 
            japanese: 'たべる', 
            english: '(to) eat',
            translations: {
                en: 'eat',
                es: 'comer',
                fr: 'manger',
                ja: 'たべる',
                zh: '吃',
                id: 'makan',
                ko: '먹다',
                vi: 'ăn'
            }
        },
        { 
            japanese: 'のむ', 
            english: '(to) drink',
            translations: {
                en: 'drink',
                es: 'beber',
                fr: 'boire',
                ja: 'のむ',
                zh: '喝',
                id: 'minum',
                ko: '마시다',
                vi: 'uống'
            }
        },
        { 
            japanese: 'みる', 
            english: '(to) see',
            translations: {
                en: 'see',
                es: 'ver',
                fr: 'voir',
                ja: 'みる',
                zh: '看',
                id: 'melihat',
                ko: '보다',
                vi: 'nhìn'
            }
        }
    ],
    6: [ // Practice Round 3 (rounds 1 + 3 + 5 combined)
        { 
            japanese: 'こんにちは', 
            english: 'hi',
            translations: {
                en: 'hi',
                es: 'hola',
                fr: 'salut',
                ja: 'こんにちは',
                zh: '你好',
                id: 'hai',
                ko: '안녕',
                vi: 'xin chào'
            }
        },
        { 
            japanese: 'ください', 
            english: 'please',
            translations: {
                en: 'please',
                es: 'por favor',
                fr: 's\'il vous plaît',
                ja: 'ください',
                zh: '请',
                id: 'tolong',
                ko: '제발',
                vi: 'xin vui lòng'
            }
        },
        { 
            japanese: 'はい', 
            english: 'yes',
            translations: {
                en: 'yes',
                es: 'sí',
                fr: 'oui',
                ja: 'はい',
                zh: '是',
                id: 'ya',
                ko: '네',
                vi: 'vâng'
            }
        },
        { 
            japanese: 'いいえ', 
            english: 'no',
            translations: {
                en: 'no',
                es: 'no',
                fr: 'non',
                ja: 'いいえ',
                zh: '不',
                id: 'tidak',
                ko: '아니요',
                vi: 'không'
            }
        },
        { 
            japanese: 'わたし', 
            english: 'i',
            translations: {
                en: 'i',
                es: 'yo',
                fr: 'je',
                ja: 'わたし',
                zh: '我',
                id: 'saya',
                ko: '나',
                vi: 'tôi'
            }
        },
        { 
            japanese: 'だれ', 
            english: 'who',
            translations: {
                en: 'who',
                es: 'quién',
                fr: 'qui',
                ja: 'だれ',
                zh: '谁',
                id: 'siapa',
                ko: '누구',
                vi: 'ai'
            }
        },
        { 
            japanese: 'なに', 
            english: 'what',
            translations: {
                en: 'what',
                es: 'qué',
                fr: 'quoi',
                ja: 'なに',
                zh: '什么',
                id: 'apa',
                ko: '무엇',
                vi: 'gì'
            }
        },
        { 
            japanese: 'どう', 
            english: 'how',
            translations: {
                en: 'how',
                es: 'cómo',
                fr: 'comment',
                ja: 'どう',
                zh: '怎么',
                id: 'bagaimana',
                ko: '어떻게',
                vi: 'làm sao'
            }
        },
        { 
            japanese: 'いくら', 
            english: 'how much',
            translations: {
                en: 'how much',
                es: 'cuánto',
                fr: 'combien',
                ja: 'いくら',
                zh: '多少',
                id: 'berapa',
                ko: '얼마',
                vi: 'bao nhiêu'
            }
        },
        { 
            japanese: 'どの', 
            english: 'which',
            translations: {
                en: 'which',
                es: 'cuál',
                fr: 'quel',
                ja: 'どの',
                zh: '哪个',
                id: 'yang mana',
                ko: '어떤',
                vi: 'cái nào'
            }
        },
        { 
            japanese: 'どんな', 
            english: 'what kind of',
            translations: {
                en: 'what kind of',
                es: 'qué tipo de',
                fr: 'quel genre de',
                ja: 'どんな',
                zh: '什么样的',
                id: 'jenis apa',
                ko: '어떤 종류의',
                vi: 'loại gì'
            }
        },
        { 
            japanese: 'ありがとうございます', 
            english: 'thanks (polite)',
            translations: {
                en: 'thanks',
                es: 'gracias',
                fr: 'merci',
                ja: 'ありがとうございます',
                zh: '谢谢',
                id: 'terima kasih',
                ko: '감사합니다',
                vi: 'cảm ơn'
            }
        },
        { 
            japanese: 'すみません', 
            english: 'excuse me',
            translations: {
                en: 'excuse me',
                es: 'disculpe',
                fr: 'excusez-moi',
                ja: 'すみません',
                zh: '对不起',
                id: 'maaf',
                ko: '실례합니다',
                vi: 'xin lỗi'
            }
        },
        { 
            japanese: 'ごめんなさい', 
            english: 'sorry',
            translations: {
                en: 'sorry',
                es: 'lo siento',
                fr: 'désolé',
                ja: 'ごめんなさい',
                zh: '抱歉',
                id: 'maaf',
                ko: '미안해요',
                vi: 'xin lỗi'
            }
        },
        { 
            japanese: 'はじめまして', 
            english: 'nice to meet you',
            translations: {
                en: 'nice to meet you',
                es: 'encantado de conocerte',
                fr: 'enchanté de vous rencontrer',
                ja: 'はじめまして',
                zh: '很高兴认识你',
                id: 'senang bertemu denganmu',
                ko: '만나서 반가워요',
                vi: 'rất vui được gặp bạn'
            }
        },
        { 
            japanese: 'お願いします', 
            english: 'please (request)',
            translations: {
                en: 'please',
                es: 'por favor',
                fr: 's\'il vous plaît',
                ja: 'お願いします',
                zh: '请',
                id: 'tolong',
                ko: '제발',
                vi: 'xin vui lòng'
            }
        },
        { 
            japanese: 'する', 
            english: '(to) do',
            translations: {
                en: 'do',
                es: 'hacer',
                fr: 'faire',
                ja: 'する',
                zh: '做',
                id: 'melakukan',
                ko: '하다',
                vi: 'làm'
            }
        },
        { 
            japanese: 'いく', 
            english: '(to) go',
            translations: {
                en: 'go',
                es: 'ir',
                fr: 'aller',
                ja: 'いく',
                zh: '去',
                id: 'pergi',
                ko: '가다',
                vi: 'đi'
            }
        },
        { 
            japanese: 'くる', 
            english: '(to) come',
            translations: {
                en: 'come',
                es: 'venir',
                fr: 'venir',
                ja: 'くる',
                zh: '来',
                id: 'datang',
                ko: '오다',
                vi: 'đến'
            }
        },
        { 
            japanese: 'たべる', 
            english: '(to) eat',
            translations: {
                en: 'eat',
                es: 'comer',
                fr: 'manger',
                ja: 'たべる',
                zh: '吃',
                id: 'makan',
                ko: '먹다',
                vi: 'ăn'
            }
        },
        { 
            japanese: 'のむ', 
            english: '(to) drink',
            translations: {
                en: 'drink',
                es: 'beber',
                fr: 'boire',
                ja: 'のむ',
                zh: '喝',
                id: 'minum',
                ko: '마시다',
                vi: 'uống'
            }
        },
        { 
            japanese: 'みる', 
            english: '(to) see',
            translations: {
                en: 'see',
                es: 'ver',
                fr: 'voir',
                ja: 'みる',
                zh: '看',
                id: 'melihat',
                ko: '보다',
                vi: 'nhìn'
            }
        }
    ],
    7: [ // Introduction Round 4 (Core Verbs Continued)
        { 
            japanese: 'いる', 
            english: '(to) exist (animate)',
            translations: {
                en: 'exist',
                es: 'existir',
                fr: 'exister',
                ja: 'いる',
                zh: '存在',
                id: 'ada',
                ko: '존재하다',
                vi: 'tồn tại'
            }
        },
        { 
            japanese: 'ある', 
            english: '(to) exist (inanimate)',
            translations: {
                en: 'exist',
                es: 'existir',
                fr: 'exister',
                ja: 'ある',
                zh: '存在',
                id: 'ada',
                ko: '존재하다',
                vi: 'tồn tại'
            }
        },
        { 
            japanese: 'きく', 
            english: '(to) hear',
            translations: {
                en: 'hear',
                es: 'oír',
                fr: 'entendre',
                ja: 'きく',
                zh: '听',
                id: 'mendengar',
                ko: '듣다',
                vi: 'nghe'
            }
        },
        { 
            japanese: 'はなす', 
            english: '(to) speak',
            translations: {
                en: 'speak',
                es: 'hablar',
                fr: 'parler',
                ja: 'はなす',
                zh: '说',
                id: 'berbicara',
                ko: '말하다',
                vi: 'nói'
            }
        },
        { 
            japanese: 'わかる', 
            english: '(to) understand',
            translations: {
                en: 'understand',
                es: 'entender',
                fr: 'comprendre',
                ja: 'わかる',
                zh: '理解',
                id: 'mengerti',
                ko: '이해하다',
                vi: 'hiểu'
            }
        },
        { 
            japanese: 'しる', 
            english: '(to) know',
            translations: {
                en: 'know',
                es: 'saber',
                fr: 'savoir',
                ja: 'しる',
                zh: '知道',
                id: 'tahu',
                ko: '알다',
                vi: 'biết'
            }
        },
        { 
            japanese: 'ほしい', 
            english: '(to) want',
            translations: {
                en: 'want',
                es: 'querer',
                fr: 'vouloir',
                ja: 'ほしい',
                zh: '想要',
                id: 'ingin',
                ko: '원하다',
                vi: 'muốn'
            }
        }
    ],
    8: [ // Practice Round 4 (rounds 1 + 3 + 5 + 7 combined)
        { 
            japanese: 'こんにちは', 
            english: 'hi',
            translations: {
                en: 'hi',
                es: 'hola',
                fr: 'salut',
                ja: 'こんにちは',
                zh: '你好',
                id: 'hai',
                ko: '안녕',
                vi: 'xin chào'
            }
        },
        { 
            japanese: 'ください', 
            english: 'please',
            translations: {
                en: 'please',
                es: 'por favor',
                fr: 's\'il vous plaît',
                ja: 'ください',
                zh: '请',
                id: 'tolong',
                ko: '제발',
                vi: 'xin vui lòng'
            }
        },
        { 
            japanese: 'はい', 
            english: 'yes',
            translations: {
                en: 'yes',
                es: 'sí',
                fr: 'oui',
                ja: 'はい',
                zh: '是',
                id: 'ya',
                ko: '네',
                vi: 'vâng'
            }
        },
        { 
            japanese: 'いいえ', 
            english: 'no',
            translations: {
                en: 'no',
                es: 'no',
                fr: 'non',
                ja: 'いいえ',
                zh: '不',
                id: 'tidak',
                ko: '아니요',
                vi: 'không'
            }
        },
        { 
            japanese: 'わたし', 
            english: 'i',
            translations: {
                en: 'i',
                es: 'yo',
                fr: 'je',
                ja: 'わたし',
                zh: '我',
                id: 'saya',
                ko: '나',
                vi: 'tôi'
            }
        },
        { 
            japanese: 'だれ', 
            english: 'who',
            translations: {
                en: 'who',
                es: 'quién',
                fr: 'qui',
                ja: 'だれ',
                zh: '谁',
                id: 'siapa',
                ko: '누구',
                vi: 'ai'
            }
        },
        { 
            japanese: 'なに', 
            english: 'what',
            translations: {
                en: 'what',
                es: 'qué',
                fr: 'quoi',
                ja: 'なに',
                zh: '什么',
                id: 'apa',
                ko: '무엇',
                vi: 'gì'
            }
        },
        { 
            japanese: 'どう', 
            english: 'how',
            translations: {
                en: 'how',
                es: 'cómo',
                fr: 'comment',
                ja: 'どう',
                zh: '怎么',
                id: 'bagaimana',
                ko: '어떻게',
                vi: 'làm sao'
            }
        },
        { 
            japanese: 'いくら', 
            english: 'how much',
            translations: {
                en: 'how much',
                es: 'cuánto',
                fr: 'combien',
                ja: 'いくら',
                zh: '多少',
                id: 'berapa',
                ko: '얼마',
                vi: 'bao nhiêu'
            }
        },
        { 
            japanese: 'どの', 
            english: 'which',
            translations: {
                en: 'which',
                es: 'cuál',
                fr: 'quel',
                ja: 'どの',
                zh: '哪个',
                id: 'yang mana',
                ko: '어떤',
                vi: 'cái nào'
            }
        },
        { 
            japanese: 'どんな', 
            english: 'what kind of',
            translations: {
                en: 'what kind of',
                es: 'qué tipo de',
                fr: 'quel genre de',
                ja: 'どんな',
                zh: '什么样的',
                id: 'jenis apa',
                ko: '어떤 종류의',
                vi: 'loại gì'
            }
        },
        { 
            japanese: 'ありがとうございます', 
            english: 'thanks (polite)',
            translations: {
                en: 'thanks',
                es: 'gracias',
                fr: 'merci',
                ja: 'ありがとうございます',
                zh: '谢谢',
                id: 'terima kasih',
                ko: '감사합니다',
                vi: 'cảm ơn'
            }
        },
        { 
            japanese: 'すみません', 
            english: 'excuse me',
            translations: {
                en: 'excuse me',
                es: 'disculpe',
                fr: 'excusez-moi',
                ja: 'すみません',
                zh: '对不起',
                id: 'maaf',
                ko: '실례합니다',
                vi: 'xin lỗi'
            }
        },
        { 
            japanese: 'ごめんなさい', 
            english: 'sorry',
            translations: {
                en: 'sorry',
                es: 'lo siento',
                fr: 'désolé',
                ja: 'ごめんなさい',
                zh: '抱歉',
                id: 'maaf',
                ko: '미안해요',
                vi: 'xin lỗi'
            }
        },
        { 
            japanese: 'はじめまして', 
            english: 'nice to meet you',
            translations: {
                en: 'nice to meet you',
                es: 'encantado de conocerte',
                fr: 'enchanté de vous rencontrer',
                ja: 'はじめまして',
                zh: '很高兴认识你',
                id: 'senang bertemu denganmu',
                ko: '만나서 반가워요',
                vi: 'rất vui được gặp bạn'
            }
        },
        { 
            japanese: 'お願いします', 
            english: 'please (request)',
            translations: {
                en: 'please',
                es: 'por favor',
                fr: 's\'il vous plaît',
                ja: 'お願いします',
                zh: '请',
                id: 'tolong',
                ko: '제발',
                vi: 'xin vui lòng'
            }
        },
        { 
            japanese: 'する', 
            english: '(to) do',
            translations: {
                en: 'do',
                es: 'hacer',
                fr: 'faire',
                ja: 'する',
                zh: '做',
                id: 'melakukan',
                ko: '하다',
                vi: 'làm'
            }
        },
        { 
            japanese: 'いく', 
            english: '(to) go',
            translations: {
                en: 'go',
                es: 'ir',
                fr: 'aller',
                ja: 'いく',
                zh: '去',
                id: 'pergi',
                ko: '가다',
                vi: 'đi'
            }
        },
        { 
            japanese: 'くる', 
            english: '(to) come',
            translations: {
                en: 'come',
                es: 'venir',
                fr: 'venir',
                ja: 'くる',
                zh: '来',
                id: 'datang',
                ko: '오다',
                vi: 'đến'
            }
        },
        { 
            japanese: 'たべる', 
            english: '(to) eat',
            translations: {
                en: 'eat',
                es: 'comer',
                fr: 'manger',
                ja: 'たべる',
                zh: '吃',
                id: 'makan',
                ko: '먹다',
                vi: 'ăn'
            }
        },
        { 
            japanese: 'のむ', 
            english: '(to) drink',
            translations: {
                en: 'drink',
                es: 'beber',
                fr: 'boire',
                ja: 'のむ',
                zh: '喝',
                id: 'minum',
                ko: '마시다',
                vi: 'uống'
            }
        },
        { 
            japanese: 'みる', 
            english: '(to) see',
            translations: {
                en: 'see',
                es: 'ver',
                fr: 'voir',
                ja: 'みる',
                zh: '看',
                id: 'melihat',
                ko: '보다',
                vi: 'nhìn'
            }
        },
        { 
            japanese: 'いる', 
            english: '(to) exist (animate)',
            translations: {
                en: 'exist',
                es: 'existir',
                fr: 'exister',
                ja: 'いる',
                zh: '存在',
                id: 'ada',
                ko: '존재하다',
                vi: 'tồn tại'
            }
        },
        { 
            japanese: 'ある', 
            english: '(to) exist (inanimate)',
            translations: {
                en: 'exist',
                es: 'existir',
                fr: 'exister',
                ja: 'ある',
                zh: '存在',
                id: 'ada',
                ko: '존재하다',
                vi: 'tồn tại'
            }
        },
        { 
            japanese: 'きく', 
            english: '(to) hear',
            translations: {
                en: 'hear',
                es: 'oír',
                fr: 'entendre',
                ja: 'きく',
                zh: '听',
                id: 'mendengar',
                ko: '듣다',
                vi: 'nghe'
            }
        },
        { 
            japanese: 'はなす', 
            english: '(to) speak',
            translations: {
                en: 'speak',
                es: 'hablar',
                fr: 'parler',
                ja: 'はなす',
                zh: '说',
                id: 'berbicara',
                ko: '말하다',
                vi: 'nói'
            }
        },
        { 
            japanese: 'わかる', 
            english: '(to) understand',
            translations: {
                en: 'understand',
                es: 'entender',
                fr: 'comprendre',
                ja: 'わかる',
                zh: '理解',
                id: 'mengerti',
                ko: '이해하다',
                vi: 'hiểu'
            }
        },
        { 
            japanese: 'しる', 
            english: '(to) know',
            translations: {
                en: 'know',
                es: 'saber',
                fr: 'savoir',
                ja: 'しる',
                zh: '知道',
                id: 'tahu',
                ko: '알다',
                vi: 'biết'
            }
        },
        { 
            japanese: 'ほしい', 
            english: '(to) want',
            translations: {
                en: 'want',
                es: 'querer',
                fr: 'vouloir',
                ja: 'ほしい',
                zh: '想要',
                id: 'ingin',
                ko: '원하다',
                vi: 'muốn'
            }
        }
    ],
    9: [ // Introduction Round 5 (Core Adjectives)
        { 
            japanese: 'おおきい', 
            english: 'big',
            translations: {
                en: 'big',
                es: 'grande',
                fr: 'grand',
                ja: 'おおきい',
                zh: '大',
                id: 'besar',
                ko: '크다',
                vi: 'lớn'
            }
        },
        { 
            japanese: 'ちいさい', 
            english: 'small',
            translations: {
                en: 'small',
                es: 'pequeño',
                fr: 'petit',
                ja: 'ちいさい',
                zh: '小',
                id: 'kecil',
                ko: '작다',
                vi: 'nhỏ'
            }
        },
        { 
            japanese: 'おおい', 
            english: 'many',
            translations: {
                en: 'many',
                es: 'muchos',
                fr: 'beaucoup',
                ja: 'おおい',
                zh: '多',
                id: 'banyak',
                ko: '많다',
                vi: 'nhiều'
            }
        },
        { 
            japanese: 'すくない', 
            english: 'few',
            translations: {
                en: 'few',
                es: 'pocos',
                fr: 'peu',
                ja: 'すくない',
                zh: '少',
                id: 'sedikit',
                ko: '적다',
                vi: 'ít'
            }
        },
        { 
            japanese: 'いい', 
            english: 'good',
            translations: {
                en: 'good',
                es: 'bueno',
                fr: 'bon',
                ja: 'いい',
                zh: '好',
                id: 'baik',
                ko: '좋다',
                vi: 'tốt'
            }
        }
    ],
    10: [ // Practice Round 5 (rounds 1 + 3 + 5 + 7 + 9 combined)
        { 
            japanese: 'こんにちは', 
            english: 'hi',
            translations: {
                en: 'hi',
                es: 'hola',
                fr: 'salut',
                ja: 'こんにちは',
                zh: '你好',
                id: 'hai',
                ko: '안녕',
                vi: 'xin chào'
            }
        },
        { 
            japanese: 'ください', 
            english: 'please',
            translations: {
                en: 'please',
                es: 'por favor',
                fr: 's\'il vous plaît',
                ja: 'ください',
                zh: '请',
                id: 'tolong',
                ko: '제발',
                vi: 'xin vui lòng'
            }
        },
        { 
            japanese: 'はい', 
            english: 'yes',
            translations: {
                en: 'yes',
                es: 'sí',
                fr: 'oui',
                ja: 'はい',
                zh: '是',
                id: 'ya',
                ko: '네',
                vi: 'vâng'
            }
        },
        { 
            japanese: 'いいえ', 
            english: 'no',
            translations: {
                en: 'no',
                es: 'no',
                fr: 'non',
                ja: 'いいえ',
                zh: '不',
                id: 'tidak',
                ko: '아니요',
                vi: 'không'
            }
        },
        { 
            japanese: 'わたし', 
            english: 'i',
            translations: {
                en: 'i',
                es: 'yo',
                fr: 'je',
                ja: 'わたし',
                zh: '我',
                id: 'saya',
                ko: '나',
                vi: 'tôi'
            }
        },
        { 
            japanese: 'だれ', 
            english: 'who',
            translations: {
                en: 'who',
                es: 'quién',
                fr: 'qui',
                ja: 'だれ',
                zh: '谁',
                id: 'siapa',
                ko: '누구',
                vi: 'ai'
            }
        },
        { 
            japanese: 'なに', 
            english: 'what',
            translations: {
                en: 'what',
                es: 'qué',
                fr: 'quoi',
                ja: 'なに',
                zh: '什么',
                id: 'apa',
                ko: '무엇',
                vi: 'gì'
            }
        },
        { 
            japanese: 'どう', 
            english: 'how',
            translations: {
                en: 'how',
                es: 'cómo',
                fr: 'comment',
                ja: 'どう',
                zh: '怎么',
                id: 'bagaimana',
                ko: '어떻게',
                vi: 'làm sao'
            }
        },
        { 
            japanese: 'いくら', 
            english: 'how much',
            translations: {
                en: 'how much',
                es: 'cuánto',
                fr: 'combien',
                ja: 'いくら',
                zh: '多少',
                id: 'berapa',
                ko: '얼마',
                vi: 'bao nhiêu'
            }
        },
        { 
            japanese: 'どの', 
            english: 'which',
            translations: {
                en: 'which',
                es: 'cuál',
                fr: 'quel',
                ja: 'どの',
                zh: '哪个',
                id: 'yang mana',
                ko: '어떤',
                vi: 'cái nào'
            }
        },
        { 
            japanese: 'どんな', 
            english: 'what kind of',
            translations: {
                en: 'what kind of',
                es: 'qué tipo de',
                fr: 'quel genre de',
                ja: 'どんな',
                zh: '什么样的',
                id: 'jenis apa',
                ko: '어떤 종류의',
                vi: 'loại gì'
            }
        },
        { 
            japanese: 'ありがとうございます', 
            english: 'thanks (polite)',
            translations: {
                en: 'thanks',
                es: 'gracias',
                fr: 'merci',
                ja: 'ありがとうございます',
                zh: '谢谢',
                id: 'terima kasih',
                ko: '감사합니다',
                vi: 'cảm ơn'
            }
        },
        { 
            japanese: 'すみません', 
            english: 'excuse me',
            translations: {
                en: 'excuse me',
                es: 'disculpe',
                fr: 'excusez-moi',
                ja: 'すみません',
                zh: '对不起',
                id: 'maaf',
                ko: '실례합니다',
                vi: 'xin lỗi'
            }
        },
        { 
            japanese: 'ごめんなさい', 
            english: 'sorry',
            translations: {
                en: 'sorry',
                es: 'lo siento',
                fr: 'désolé',
                ja: 'ごめんなさい',
                zh: '抱歉',
                id: 'maaf',
                ko: '미안해요',
                vi: 'xin lỗi'
            }
        },
        { 
            japanese: 'はじめまして', 
            english: 'nice to meet you',
            translations: {
                en: 'nice to meet you',
                es: 'encantado de conocerte',
                fr: 'enchanté de vous rencontrer',
                ja: 'はじめまして',
                zh: '很高兴认识你',
                id: 'senang bertemu denganmu',
                ko: '만나서 반가워요',
                vi: 'rất vui được gặp bạn'
            }
        },
        { 
            japanese: 'お願いします', 
            english: 'please (request)',
            translations: {
                en: 'please',
                es: 'por favor',
                fr: 's\'il vous plaît',
                ja: 'お願いします',
                zh: '请',
                id: 'tolong',
                ko: '제발',
                vi: 'xin vui lòng'
            }
        },
        { 
            japanese: 'する', 
            english: '(to) do',
            translations: {
                en: 'do',
                es: 'hacer',
                fr: 'faire',
                ja: 'する',
                zh: '做',
                id: 'melakukan',
                ko: '하다',
                vi: 'làm'
            }
        },
        { 
            japanese: 'いく', 
            english: '(to) go',
            translations: {
                en: 'go',
                es: 'ir',
                fr: 'aller',
                ja: 'いく',
                zh: '去',
                id: 'pergi',
                ko: '가다',
                vi: 'đi'
            }
        },
        { 
            japanese: 'くる', 
            english: '(to) come',
            translations: {
                en: 'come',
                es: 'venir',
                fr: 'venir',
                ja: 'くる',
                zh: '来',
                id: 'datang',
                ko: '오다',
                vi: 'đến'
            }
        },
        { 
            japanese: 'たべる', 
            english: '(to) eat',
            translations: {
                en: 'eat',
                es: 'comer',
                fr: 'manger',
                ja: 'たべる',
                zh: '吃',
                id: 'makan',
                ko: '먹다',
                vi: 'ăn'
            }
        },
        { 
            japanese: 'のむ', 
            english: '(to) drink',
            translations: {
                en: 'drink',
                es: 'beber',
                fr: 'boire',
                ja: 'のむ',
                zh: '喝',
                id: 'minum',
                ko: '마시다',
                vi: 'uống'
            }
        },
        { 
            japanese: 'みる', 
            english: '(to) see',
            translations: {
                en: 'see',
                es: 'ver',
                fr: 'voir',
                ja: 'みる',
                zh: '看',
                id: 'melihat',
                ko: '보다',
                vi: 'nhìn'
            }
        },
        { 
            japanese: 'いる', 
            english: '(to) exist (animate)',
            translations: {
                en: 'exist',
                es: 'existir',
                fr: 'exister',
                ja: 'いる',
                zh: '存在',
                id: 'ada',
                ko: '존재하다',
                vi: 'tồn tại'
            }
        },
        { 
            japanese: 'ある', 
            english: '(to) exist (inanimate)',
            translations: {
                en: 'exist',
                es: 'existir',
                fr: 'exister',
                ja: 'ある',
                zh: '存在',
                id: 'ada',
                ko: '존재하다',
                vi: 'tồn tại'
            }
        },
        { 
            japanese: 'きく', 
            english: '(to) hear',
            translations: {
                en: 'hear',
                es: 'oír',
                fr: 'entendre',
                ja: 'きく',
                zh: '听',
                id: 'mendengar',
                ko: '듣다',
                vi: 'nghe'
            }
        },
        { 
            japanese: 'はなす', 
            english: '(to) speak',
            translations: {
                en: 'speak',
                es: 'hablar',
                fr: 'parler',
                ja: 'はなす',
                zh: '说',
                id: 'berbicara',
                ko: '말하다',
                vi: 'nói'
            }
        },
        { 
            japanese: 'わかる', 
            english: '(to) understand',
            translations: {
                en: 'understand',
                es: 'entender',
                fr: 'comprendre',
                ja: 'わかる',
                zh: '理解',
                id: 'mengerti',
                ko: '이해하다',
                vi: 'hiểu'
            }
        },
        { 
            japanese: 'しる', 
            english: '(to) know',
            translations: {
                en: 'know',
                es: 'saber',
                fr: 'savoir',
                ja: 'しる',
                zh: '知道',
                id: 'tahu',
                ko: '알다',
                vi: 'biết'
            }
        },
        { 
            japanese: 'ほしい', 
            english: '(to) want',
            translations: {
                en: 'want',
                es: 'querer',
                fr: 'vouloir',
                ja: 'ほしい',
                zh: '想要',
                id: 'ingin',
                ko: '원하다',
                vi: 'muốn'
            }
        },
        { 
            japanese: 'おおきい', 
            english: 'big',
            translations: {
                en: 'big',
                es: 'grande',
                fr: 'grand',
                ja: 'おおきい',
                zh: '大',
                id: 'besar',
                ko: '크다',
                vi: 'lớn'
            }
        },
        { 
            japanese: 'ちいさい', 
            english: 'small',
            translations: {
                en: 'small',
                es: 'pequeño',
                fr: 'petit',
                ja: 'ちいさい',
                zh: '小',
                id: 'kecil',
                ko: '작다',
                vi: 'nhỏ'
            }
        },
        { 
            japanese: 'おおい', 
            english: 'many',
            translations: {
                en: 'many',
                es: 'muchos',
                fr: 'beaucoup',
                ja: 'おおい',
                zh: '多',
                id: 'banyak',
                ko: '많다',
                vi: 'nhiều'
            }
        },
        { 
            japanese: 'すくない', 
            english: 'few',
            translations: {
                en: 'few',
                es: 'pocos',
                fr: 'peu',
                ja: 'すくない',
                zh: '少',
                id: 'sedikit',
                ko: '적다',
                vi: 'ít'
            }
        },
        { 
            japanese: 'いい', 
            english: 'good',
            translations: {
                en: 'good',
                es: 'bueno',
                fr: 'bon',
                ja: 'いい',
                zh: '好',
                id: 'baik',
                ko: '좋다',
                vi: 'tốt'
            }
        }
    ],
    11: [ // Introduction Round 6 (Core Adjectives Continued)
        { 
            japanese: 'わるい', 
            english: 'bad',
            translations: {
                en: 'bad',
                es: 'malo',
                fr: 'mauvais',
                ja: 'わるい',
                zh: '坏',
                id: 'buruk',
                ko: '나쁘다',
                vi: 'xấu'
            }
        },
        { 
            japanese: 'あたらしい', 
            english: 'new',
            translations: {
                en: 'new',
                es: 'nuevo',
                fr: 'nouveau',
                ja: 'あたらしい',
                zh: '新',
                id: 'baru',
                ko: '새롭다',
                vi: 'mới'
            }
        },
        { 
            japanese: 'ふるい', 
            english: 'old (things)',
            translations: {
                en: 'old',
                es: 'viejo',
                fr: 'vieux',
                ja: 'ふるい',
                zh: '旧',
                id: 'lama',
                ko: '오래되다',
                vi: 'cũ'
            }
        }
    ],
    12: [ // Introduction Round 7 (Essential Particles)
        { 
            japanese: 'は', 
            english: 'is (topic marker)',
            translations: {
                en: 'is',
                es: 'es',
                fr: 'est',
                ja: 'は',
                zh: '是',
                id: 'adalah',
                ko: '이다',
                vi: 'là'
            }
        },
        { 
            japanese: 'と', 
            english: 'and (/with)',
            translations: {
                en: 'and',
                es: 'y',
                fr: 'et',
                ja: 'と',
                zh: '和',
                id: 'dan',
                ko: '그리고',
                vi: 'và'
            }
        },
        { 
            japanese: 'も', 
            english: 'also (/too)',
            translations: {
                en: 'also',
                es: 'también',
                fr: 'aussi',
                ja: 'も',
                zh: '也',
                id: 'juga',
                ko: '또한',
                vi: 'cũng'
            }
        }
    ],
    13: [ // Introduction Round 8 (Survival Phrases)
        { 
            japanese: 'みず', 
            english: 'water',
            translations: {
                en: 'water',
                es: 'agua',
                fr: 'eau',
                ja: 'みず',
                zh: '水',
                id: 'air',
                ko: '물',
                vi: 'nước'
            }
        },
        { 
            japanese: 'ごはん', 
            english: 'rice (or meal)',
            translations: {
                en: 'rice',
                es: 'arroz',
                fr: 'riz',
                ja: 'ごはん',
                zh: '米饭',
                id: 'nasi',
                ko: '밥',
                vi: 'cơm'
            }
        },
        { 
            japanese: 'ちかてつ', 
            english: 'subway',
            translations: {
                en: 'subway',
                es: 'metro',
                fr: 'métro',
                ja: 'ちかてつ',
                zh: '地铁',
                id: 'kereta bawah tanah',
                ko: '지하철',
                vi: 'tàu điện ngầm'
            }
        }
    ],
    14: [ // Introduction Round 9 (Survival Phrases Continued)
        { 
            japanese: 'ちず', 
            english: 'map',
            translations: {
                en: 'map',
                es: 'mapa',
                fr: 'carte',
                ja: 'ちず',
                zh: '地图',
                id: 'peta',
                ko: '지도',
                vi: 'bản đồ'
            }
        },
        { 
            japanese: 'けいたい', 
            english: 'phone',
            translations: {
                en: 'phone',
                es: 'teléfono',
                fr: 'téléphone',
                ja: 'けいたい',
                zh: '手机',
                id: 'telepon',
                ko: '전화',
                vi: 'điện thoại'
            }
        },
        { 
            japanese: 'くうこう', 
            english: 'airport',
            translations: {
                en: 'airport',
                es: 'aeropuerto',
                fr: 'aéroport',
                ja: 'くうこう',
                zh: '机场',
                id: 'bandara',
                ko: '공항',
                vi: 'sân bay'
            }
        }
    ],
    15: [ // Introduction Round 10 (Survival Phrases Final)
        { 
            japanese: 'せんせい', 
            english: 'teacher / doctor',
            translations: {
                en: 'teacher',
                es: 'profesor',
                fr: 'professeur',
                ja: 'せんせい',
                zh: '老师',
                id: 'guru',
                ko: '선생님',
                vi: 'giáo viên'
            }
        },
        { 
            japanese: 'ひと', 
            english: 'person',
            translations: {
                en: 'person',
                es: 'persona',
                fr: 'personne',
                ja: 'ひと',
                zh: '人',
                id: 'orang',
                ko: '사람',
                vi: 'người'
            }
        },
        { 
            japanese: 'にほん', 
            english: 'japan',
            translations: {
                en: 'japan',
                es: 'japón',
                fr: 'japon',
                ja: 'にほん',
                zh: '日本',
                id: 'jepang',
                ko: '일본',
                vi: 'nhật bản'
            }
        }
    ],
    16: [ // Introduction Round 11 (Final Round)
        { 
            japanese: 'ともだち', 
            english: 'friend',
            translations: {
                en: 'friend',
                es: 'amigo',
                fr: 'ami',
                ja: 'ともだち',
                zh: '朋友',
                id: 'teman',
                ko: '친구',
                vi: 'bạn bè'
            }
        },
        { 
            japanese: 'みせ', 
            english: 'store',
            translations: {
                en: 'store',
                es: 'tienda',
                fr: 'magasin',
                ja: 'みせ',
                zh: '商店',
                id: 'toko',
                ko: '가게',
                vi: 'cửa hàng'
            }
        }
    ],
    17: [ // Practice Round 6 (rounds 1 + 3 + 5 + 7 + 9 + 11 + 12 + 13 + 14 + 15 + 16 combined)
        { 
            japanese: 'こんにちは', 
            english: 'hi',
            translations: {
                en: 'hi',
                es: 'hola',
                fr: 'salut',
                ja: 'こんにちは',
                zh: '你好',
                id: 'hai',
                ko: '안녕',
                vi: 'xin chào'
            }
        },
        { 
            japanese: 'ください', 
            english: 'please',
            translations: {
                en: 'please',
                es: 'por favor',
                fr: 's\'il vous plaît',
                ja: 'ください',
                zh: '请',
                id: 'tolong',
                ko: '제발',
                vi: 'xin vui lòng'
            }
        }
    ],
    18: [ // Final Practice Round (all rounds combined)
        { 
            japanese: 'こんにちは', 
            english: 'hi',
            translations: {
                en: 'hi',
                es: 'hola',
                fr: 'salut',
                ja: 'こんにちは',
                zh: '你好',
                id: 'hai',
                ko: '안녕',
                vi: 'xin chào'
            }
        },
        { 
            japanese: 'ください', 
            english: 'please',
            translations: {
                en: 'please',
                es: 'por favor',
                fr: 's\'il vous plaît',
                ja: 'ください',
                zh: '请',
                id: 'tolong',
                ko: '제발',
                vi: 'xin vui lòng'
            }
        }
    ]
};

// Helper function to get the correct answer in the current language (without brackets)
function getCorrectAnswer(word) {
    if (word.translations && word.translations[currentLanguage]) {
        // Return translation in current language, removing brackets and content
        return word.translations[currentLanguage].replace(/\([^)]*\)/g, '').trim();
    } else {
        // Fallback to English if translation not available
        return word.english.replace(/\([^)]*\)/g, '').trim();
    }
}

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
const soundBtn = document.getElementById('sound-btn');
const autoPlayToggle = document.getElementById('auto-play-toggle');
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
const analyticsScript = document.getElementById('analytics-script');
const adsenseScript = document.getElementById('adsense-script');

// Policy page elements
const privacyPolicyPage = document.getElementById('privacy-policy-page');
const termsOfServicePage = document.getElementById('terms-of-service-page');
const privacyLink = document.querySelector('.privacy-link');
const termsLink = document.querySelector('.terms-link');
const backToCookiesBtns = document.querySelectorAll('.back-to-cookies-btn');

// Settings panel cookie consent elements
const acceptCookiesSettingsBtn = document.getElementById('accept-cookies-settings-btn');
const revokeCookiesSettingsBtn = document.getElementById('revoke-cookies-settings-btn');
const cookieStatusText = document.getElementById('cookie-status-text');

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
    katakanaBtn.addEventListener('click', () => alert(getTranslatedMessage('katakana-coming-soon')));
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
    showPage('start');
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

// Policy page navigation event listeners
privacyLink.addEventListener('click', showPrivacyPolicy);
termsLink.addEventListener('click', showTermsOfService);
backToCookiesBtns.forEach(btn => btn.addEventListener('click', hidePolicyPage));

// Settings panel cookie consent event listeners
acceptCookiesSettingsBtn.addEventListener('click', acceptCookiesFromSettings);
revokeCookiesSettingsBtn.addEventListener('click', revokeCookiesFromSettings);

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
            // For brute force mode, check if this is the final round
            if (roundNumber >= 18) {
                // Hide the next round button on the final round
                nextRoundBtn.style.visibility = 'hidden';
                nextRoundBtn.classList.add('disabled');
            } else {
                // Show the next round button (but keep it disabled until requirements met)
                nextRoundBtn.style.visibility = 'visible';
                nextRoundBtn.classList.add('disabled');
            }
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
                option.setAttribute('data-zh', `介绍轮次${i}`);
                option.setAttribute('data-id', `Ronde Pengenalan ${i}`);
                option.setAttribute('data-ko', `소개 라운드 ${i}`);
                option.setAttribute('data-vi', `Vòng Giới thiệu ${i}`);
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
                    option.setAttribute('data-zh', `介绍轮次${roundNumber}`);
                    option.setAttribute('data-id', `Ronde Pengenalan ${roundNumber}`);
                    option.setAttribute('data-ko', `소개 라운드 ${roundNumber}`);
                    option.setAttribute('data-vi', `Vòng Giới thiệu ${roundNumber}`);
                } else {
                    // Practice round
                    const roundNumber = Math.floor(i / 2);
                    option.textContent = `Practice Round ${roundNumber}`;
                    option.setAttribute('data-en', `Practice Round ${roundNumber}`);
                    option.setAttribute('data-es', `Ronda de Práctica ${roundNumber}`);
                    option.setAttribute('data-fr', `Ronde de Pratique ${roundNumber}`);
                    option.setAttribute('data-ja', `練習ラウンド${roundNumber}`);
                    option.setAttribute('data-zh', `练习轮次${roundNumber}`);
                    option.setAttribute('data-id', `Ronde Latihan ${roundNumber}`);
                    option.setAttribute('data-ko', `연습 라운드 ${roundNumber}`);
                    option.setAttribute('data-vi', `Vòng Luyện tập ${roundNumber}`);
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
                option.setAttribute('data-zh', `介绍轮次${roundNumber}`);
                option.setAttribute('data-id', `Ronde Pengenalan ${roundNumber}`);
                option.setAttribute('data-ko', `소개 라운드 ${roundNumber}`);
                option.setAttribute('data-vi', `Vòng Giới thiệu ${roundNumber}`);
            } else {
                // Practice round
                const roundNumber = Math.floor(i / 2);
                option.textContent = `Practice Round ${roundNumber}`;
                option.setAttribute('data-en', `Practice Round ${roundNumber}`);
                option.setAttribute('data-es', `Ronda de Práctica ${roundNumber}`);
                option.setAttribute('data-fr', `Ronde de Pratique ${roundNumber}`);
                option.setAttribute('data-ja', `練習ラウンド${roundNumber}`);
                option.setAttribute('data-zh', `练习轮次${roundNumber}`);
                option.setAttribute('data-id', `Ronde Latihan ${roundNumber}`);
                option.setAttribute('data-ko', `연습 라운드 ${roundNumber}`);
                option.setAttribute('data-vi', `Vòng Luyện tập ${roundNumber}`);
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
    
    const correctAnswer = getCorrectAnswer(currentWord).toLowerCase();
    
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

// Function to get translated error message
function getTranslatedMessage(messageKey) {
    const messages = {
        'katakana-coming-soon': {
            'en': 'Katakana mode coming soon!',
            'es': '¡Modo Katakana próximamente!',
            'fr': 'Mode Katakana bientôt disponible !',
            'ja': 'カタカナモード近日公開！',
            'zh': '片假名模式即将推出！',
            'id': 'Mode Katakana segera hadir!',
            'ko': '카타카나 모드 곧 출시!',
            'vi': 'Chế độ Katakana sắp ra mắt!'
        },
        'enter-both-words': {
            'en': 'Please enter both Japanese word and English translation.',
            'es': 'Por favor ingrese tanto la palabra japonesa como la traducción al inglés.',
            'fr': 'Veuillez saisir à la fois le mot japonais et la traduction anglaise.',
            'ja': '日本語の単語と英語の翻訳の両方を入力してください。',
            'zh': '请输入日语单词和英语翻译。',
            'id': 'Silakan masukkan kata bahasa Jepang dan terjemahan bahasa Inggris.',
            'ko': '일본어 단어와 영어 번역을 모두 입력해 주세요.',
            'vi': 'Vui lòng nhập cả từ tiếng Nhật và bản dịch tiếng Anh.'
        },
        'must-have-round': {
            'en': 'You must have at least one round.',
            'es': 'Debe tener al menos una ronda.',
            'fr': 'Vous devez avoir au moins un tour.',
            'ja': '少なくとも1つのラウンドが必要です。',
            'zh': '您必须至少有一轮。',
            'id': 'Anda harus memiliki setidaknya satu ronde.',
            'ko': '최소한 한 라운드가 있어야 합니다.',
            'vi': 'Bạn phải có ít nhất một vòng.'
        },
        'select-words': {
            'en': 'Please select at least one word for at least one round.',
            'es': 'Por favor seleccione al menos una palabra para al menos una ronda.',
            'fr': 'Veuillez sélectionner au moins un mot pour au moins un tour.',
            'ja': '少なくとも1つのラウンドで少なくとも1つの単語を選択してください。',
            'zh': '请至少选择一轮中的至少一个单词。',
            'id': 'Silakan pilih setidaknya satu kata untuk setidaknya satu ronde.',
            'ko': '최소한 한 라운드에서 최소한 한 단어를 선택해 주세요.',
            'vi': 'Vui lòng chọn ít nhất một từ cho ít nhất một vòng.'
        }
    };
    
    const message = messages[messageKey];
    if (message && message[currentLanguage]) {
        return message[currentLanguage];
    }
    // Fallback to English if translation not found
    return message ? message['en'] : messageKey;
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
    
    // Ensure next round button is visible when starting (not on final round)
    nextRoundBtn.style.visibility = 'visible';
    
    showPage('game');
    initializeRound();
}

function initializeRound() {
    const isIntroductionRound = currentRound % 2 === 1;
    const roundWords = getCurrentRoundWords();
    
    // Disable next round button at start of each round
    nextRoundBtn.classList.add('disabled');
    
    if (isIntroductionRound) {
        roundTitle.textContent = roundTitle.getAttribute(`data-${currentLanguage}`) || 'Introduction Round';
        currentPhase = 'learning';
        // In learning phase, show each word once with answer
        currentQuestionIndex = 0;
        showLearningQuestion();
    } else {
        roundTitle.textContent = roundTitle.getAttribute(`data-practice-${currentLanguage}`) || 'Practice Round';
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
    displayWordWithSound(word);
    // Update global currentWord for answer validation
    currentWord = word;
    correctAnswerDisplay.textContent = capitalizeWords(getCorrectAnswer(word));
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
    displayWordWithSound(word);
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
    // Update global currentWord for answer validation
    window.currentWord = currentWord;
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
    const correctAnswer = getCorrectAnswer(currentWord).toLowerCase();
    
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
        phaseLabel.textContent = phaseLabel.getAttribute(`data-${currentLanguage}`) || 'Words To Learn';
    } else if (currentPhase === 'elimination') {
        const isIntroductionRound = currentRound % 2 === 1;
        if (isIntroductionRound) {
            phaseLabel.textContent = phaseLabel.getAttribute(`data-eliminate-${currentLanguage}`) || 'Words To Eliminate';
        } else {
            phaseLabel.textContent = phaseLabel.getAttribute(`data-eliminate-${currentLanguage}`) || 'Words To Eliminate';
        }
    } else {
        phaseLabel.textContent = phaseLabel.getAttribute(`data-practice-${currentLanguage}`) || 'Words To Practice';
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
    
    // Check if this is the last round (round 18 for brute force mode)
    if (currentRound >= 18) {
        // Hide the next round button on the final round
        nextRoundBtn.style.visibility = 'hidden';
        nextRoundBtn.classList.add('disabled');
    } else {
        // Disable next round button at start of new round (but keep it visible)
        nextRoundBtn.classList.add('disabled');
        nextRoundBtn.style.visibility = 'visible';
    }
    
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

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    showPage('start');
    initializeSettings();
    detectBrowserLanguage();
    
    // Initialize sound system
    setupSoundButton();
    setupAutoPlayToggle();
    
    // Load cookie consent preferences and set initial script states
    const consentLoaded = loadCookieConsent();
    
    // Show cookie consent popup only if user hasn't made a choice yet
    if (!consentLoaded) {
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
    const isHidden = settingsPanel.classList.contains('hidden');
    settingsPanel.classList.toggle('hidden');
    
    // If opening the panel, update the cookie status display
    if (isHidden && cookieStatusText) {
        updateCookieStatusDisplay();
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    saveSettings();
    
    // Use updateAllTextWithoutGrids to preserve custom mode choices
    if (document.querySelector('.word-selection-grid')) {
        updateAllTextWithoutGrids();
    } else {
        updateAllText();
    }
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
    const elements = document.querySelectorAll('[data-en], [data-es], [data-fr], [data-ja], [data-zh], [data-id], [data-ko], [data-vi]');
    elements.forEach(element => {
        const text = element.getAttribute(`data-${currentLanguage}`);
        if (text) {
            // Check if element contains HTML links that need to be preserved
            const hasLinks = element.querySelector('a') !== null;
            if (hasLinks) {
                // Preserve HTML structure by replacing text while keeping links
                updateTextWithPreservedLinks(element, text);
            } else {
                // No links to preserve, use simple textContent
                element.textContent = text;
            }
        }
    });
    
    // Update placeholders
    const inputs = document.querySelectorAll('[data-en-placeholder], [data-es-placeholder], [data-fr-placeholder], [data-ja-placeholder], [data-zh-placeholder], [data-id-placeholder], [data-ko-placeholder], [data-vi-placeholder]');
    inputs.forEach(input => {
        const placeholder = input.getAttribute(`data-${currentLanguage}-placeholder`);
        if (placeholder) {
            input.placeholder = placeholder;
        }
    });
    
    // Update back button text based on mode
    updateBackButtonText();
    
    // Update cookie status display if it exists
    if (cookieStatusText) {
        updateCookieStatusDisplay();
    }
    
    // Update answer validation for current language if in game
    if (currentPage === 'game' && currentWord) {
        updateAnswerValidation();
    }
    
    // Update word selection grids in custom mode if they exist
    if (document.querySelector('.word-selection-grid')) {
        updateWordSelectionGrids();
    }
}

function updateAllTextWithoutGrids() {
    // Update all elements with data attributes
    const elements = document.querySelectorAll('[data-en], [data-es], [data-fr], [data-ja], [data-zh], [data-id], [data-ko], [data-vi]');
    elements.forEach(element => {
        const text = element.getAttribute(`data-${currentLanguage}`);
        if (text) {
            // Check if element contains HTML links that need to be preserved
            const hasLinks = element.querySelector('a') !== null;
            if (hasLinks) {
                // Preserve HTML structure by replacing text while keeping links
                updateTextWithPreservedLinks(element, text);
            } else {
                // No links to preserve, use simple textContent
                element.textContent = text;
            }
        }
    });
    
    // Update placeholders
    const inputs = document.querySelectorAll('[data-en-placeholder], [data-es-placeholder], [data-fr-placeholder], [data-ja-placeholder], [data-zh-placeholder], [data-id-placeholder], [data-ko-placeholder], [data-vi-placeholder]');
    inputs.forEach(input => {
        const placeholder = input.getAttribute(`data-${currentLanguage}-placeholder`);
        if (placeholder) {
            input.placeholder = placeholder;
        }
    });
    
    // Update back button text based on mode
    updateBackButtonText();
    
    // Update cookie status display if it exists
    if (cookieStatusText) {
        updateCookieStatusDisplay();
    }
    
    // Update answer validation for current language if in game
    if (currentPage === 'game' && currentWord) {
        updateAnswerValidation();
    }
    
    // Skip word selection grids update to preserve state
    
    // Update select all labels in custom mode
    const selectAllLabels = document.querySelectorAll('.select-all-item label');
    selectAllLabels.forEach(label => {
        const text = label.getAttribute(`data-${currentLanguage}`);
        if (text) {
            label.textContent = text;
        }
    });
}

// Function to update text while preserving HTML links
function updateTextWithPreservedLinks(element, newText) {
    // Store the original links
    const links = Array.from(element.querySelectorAll('a'));
    const linkData = links.map(link => ({
        href: link.getAttribute('href'),
        target: link.getAttribute('target'),
        text: link.textContent
    }));
    
    // Update the text content
    element.textContent = newText;
    
    // Restore the links by finding the link text and replacing it with the original <a> tag
    linkData.forEach(linkInfo => {
        const textContent = element.textContent;
        const linkIndex = textContent.indexOf(linkInfo.text);
        
        if (linkIndex !== -1) {
            // Create the link element
            const linkElement = document.createElement('a');
            linkElement.href = linkInfo.href;
            if (linkInfo.target) {
                linkElement.target = linkInfo.target;
            }
            linkElement.textContent = linkInfo.text;
            
            // Split the text and insert the link
            const beforeText = textContent.substring(0, linkIndex);
            const afterText = textContent.substring(linkIndex + linkInfo.text.length);
            
            element.textContent = '';
            if (beforeText) {
                element.appendChild(document.createTextNode(beforeText));
            }
            element.appendChild(linkElement);
            if (afterText) {
                element.appendChild(document.createTextNode(afterText));
            }
        }
    });
}

// Function to update answer validation when language changes
function updateAnswerValidation() {
    if (currentWord && currentPhase === 'learning') {
        // Update the correct answer display to show the answer in the current language
        const correctAnswer = getCorrectAnswer(currentWord);
        correctAnswerDisplay.textContent = capitalizeWords(correctAnswer);
    }
}

function updateWordSelectionGrids() {
    // Regenerate all word selection grids to show words in current language
    const rounds = document.querySelectorAll('.custom-round');
    rounds.forEach((round, index) => {
        const roundNumber = index + 1;
        populateWordSelectionGrid(roundNumber);
    });
}

function updateBackButtonText() {
    if (window.customModeEnabled) {
        // Custom mode - show "Back to Word Selection"
        backToScriptBtn.setAttribute('data-en', '← Back to Word Selection');
        backToScriptBtn.setAttribute('data-es', '← Volver a Selección de Palabras');
        backToScriptBtn.setAttribute('data-fr', '← Retour à la Sélection de Mots');
        backToScriptBtn.setAttribute('data-ja', '← 単語選択に戻る');
        backToScriptBtn.setAttribute('data-zh', '← 返回单词选择');
        backToScriptBtn.setAttribute('data-id', '← Kembali ke Pemilihan Kata');
        backToScriptBtn.setAttribute('data-ko', '← 단어 선택으로 돌아가기');
        backToScriptBtn.setAttribute('data-vi', '← Quay lại Lựa chọn Từ');
        backToScriptBtn.textContent = backToScriptBtn.getAttribute(`data-${currentLanguage}`);
    } else {
        // Brute force mode - show "Back to Script Selection"
        backToScriptBtn.setAttribute('data-en', '← Back to Script Selection');
        backToScriptBtn.setAttribute('data-es', '← Volver a Selección de Escritura');
        backToScriptBtn.setAttribute('data-fr', '← Retour à la Sélection d\'Écriture');
        backToScriptBtn.setAttribute('data-ja', '← 文字選択に戻る');
        backToScriptBtn.setAttribute('data-zh', '← 返回文字选择');
        backToScriptBtn.setAttribute('data-id', '← Kembali ke Pemilihan Skrip');
        backToScriptBtn.setAttribute('data-ko', '← 스크립트 선택으로 돌아가기');
        backToScriptBtn.setAttribute('data-vi', '← Quay lại Lựa chọn Kịch bản');
        backToScriptBtn.textContent = backToScriptBtn.getAttribute(`data-${currentLanguage}`);
    }
}

function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    
    // Check if browser language is supported
    if (['en', 'es', 'fr', 'ja', 'zh', 'id', 'ko', 'vi'].includes(langCode)) {
        currentLanguage = langCode;
        localStorage.setItem('language', langCode);
        updateLanguageButtons();
        updateAllText();
    }
}

// Sound Functions
function createBeepSound(frequency = 800, duration = 200) {
    // Create a simple beep using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
        
        return true;
    } catch (error) {
        console.warn('Audio not supported:', error);
        return false;
    }
}

function getWordAudioFrequency(word) {
    // Generate a unique frequency based on the word to create different beeps
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
        const char = word.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    // Map hash to frequency range (400-1200 Hz)
    return 400 + Math.abs(hash % 800);
}

function playWordSound(word) {
    // Check if sound is enabled and word is not custom
    if (!word) return;
    
    const isCustomWord = isCurrentWordCustom();
    
    // Disable sound button for custom words in custom mode
    if (window.customModeEnabled && isCustomWord) {
        if (soundBtn) {
            soundBtn.disabled = true;
            soundBtn.style.opacity = '0.5';
            soundBtn.title = 'Audio not available for custom words';
        }
        return;
    } else {
        // Enable sound button for preset words
        if (soundBtn) {
            soundBtn.disabled = false;
            soundBtn.style.opacity = '1';
            soundBtn.title = 'Play pronunciation';
        }
    }
    
    // Play placeholder beep sound
    const frequency = getWordAudioFrequency(word);
    createBeepSound(frequency, 300);
}

function isCurrentWordCustom() {
    // Check if the current word is a custom word in custom mode
    if (!window.customModeEnabled || !currentWord) return false;
    
    try {
        // Check if this word exists in the custom word pools and is marked as custom
        const customRounds = window.customWordPools;
        if (!customRounds) return false;
        
        // Check all rounds for this word
        for (const roundNum in customRounds) {
            const roundWords = customRounds[roundNum];
            if (Array.isArray(roundWords)) {
                const wordData = roundWords.find(w => 
                    w.japanese === currentWord.japanese && w.isCustom === true
                );
                if (wordData) return true;
            }
        }
        return false;
    } catch (error) {
        console.warn('Error checking custom word:', error);
        return false;
    }
}

function setupSoundButton() {
    if (soundBtn) {
        soundBtn.addEventListener('click', () => {
            if (currentWord && !soundBtn.disabled) {
                playWordSound(currentWord.japanese);
            }
        });
    }
}

function setupAutoPlayToggle() {
    if (autoPlayToggle) {
        autoPlayToggle.addEventListener('change', () => {
            autoPlaySound = autoPlayToggle.checked;
            saveSettings();
        });
    }
}

function displayWordWithSound(word) {
    // Update the display
    japaneseWord.textContent = word.japanese;
    currentWord = word;
    
    // Handle sound button state and auto-play
    setTimeout(() => {
        // Check if word is custom and update sound button state
        const isCustomWord = isCurrentWordCustom();
        
        if (window.customModeEnabled && isCustomWord) {
            if (soundBtn) {
                soundBtn.disabled = true;
                soundBtn.style.opacity = '0.5';
                soundBtn.title = 'Audio not available for custom words';
            }
        } else {
            if (soundBtn) {
                soundBtn.disabled = false;
                soundBtn.style.opacity = '1';
                soundBtn.title = 'Play pronunciation';
            }
            
            // Auto-play if enabled
            if (autoPlaySound) {
                playWordSound(word.japanese);
            }
        }
    }, 100); // Small delay to ensure DOM is updated
}

// Custom Mode Functions
function initializeCustomMode() {
    // Try to load saved custom rounds first
    const loaded = loadCustomRounds();
    
    if (!loaded) {
        // If no saved data, initialize with default structure
        populateWordSelectionGrids();
        setupCustomWordButtons();
        
        // Explicitly set up the custom word button for Round 1 (initial round)
        setupCustomWordButtonsForRound(1);
    } else {
        // If data was loaded, we still need to populate grids and setup buttons
        // but the state restoration will happen after grids are populated
        populateWordSelectionGrids();
        setupCustomWordButtons();
        
        // Now restore the saved state after grids are populated
        restoreCustomRoundsState();
    }
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
        headerText.setAttribute('data-en', `Round ${roundIndex + 1} Words`);
        headerText.setAttribute('data-es', `Ronda ${roundIndex + 1} Palabras`);
        headerText.setAttribute('data-fr', `Ronde ${roundIndex + 1} Mots`);
        headerText.setAttribute('data-ja', `ラウンド${roundIndex + 1}単語`);
        headerText.setAttribute('data-zh', `第${roundIndex + 1}轮单词`);
        headerText.setAttribute('data-id', `Ronde ${roundIndex + 1} Kata`);
        headerText.setAttribute('data-ko', `라운드 ${roundIndex + 1} 단어`);
        headerText.setAttribute('data-vi', `Vòng ${roundIndex + 1} Từ`);
        headerText.textContent = headerText.getAttribute(`data-${currentLanguage}`) || `Round ${roundIndex + 1} Words`;
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
        
        // Create "Select All" checkbox for this round
        const selectAllItem = document.createElement('div');
        selectAllItem.className = 'word-checkbox-item select-all-item';
        selectAllItem.style.marginBottom = '10px';
        selectAllItem.style.paddingBottom = '10px';
        selectAllItem.style.borderBottom = '1px solid #ddd';
        
        const selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.id = `select-all-${roundNumber - 1}-${roundIndex}`;
        selectAllCheckbox.className = 'select-all-checkbox';
        
        const selectAllLabel = document.createElement('label');
        selectAllLabel.htmlFor = `select-all-${roundNumber - 1}-${roundIndex}`;
        selectAllLabel.setAttribute('data-en', 'Select All');
        selectAllLabel.setAttribute('data-es', 'Seleccionar Todo');
        selectAllLabel.setAttribute('data-fr', 'Tout Sélectionner');
        selectAllLabel.setAttribute('data-ja', 'すべて選択');
        selectAllLabel.setAttribute('data-zh', '全选');
        selectAllLabel.setAttribute('data-id', 'Pilih Semua');
        selectAllLabel.setAttribute('data-ko', '모두 선택');
        selectAllLabel.setAttribute('data-vi', 'Chọn Tất cả');
        selectAllLabel.textContent = selectAllLabel.getAttribute(`data-${currentLanguage}`) || 'Select All';
        selectAllLabel.style.fontWeight = 'bold';
        
        // Add event listener for select all functionality
        selectAllCheckbox.addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            const wordCheckboxes = wordContent.querySelectorAll('input[type="checkbox"]:not(.select-all-checkbox)');
            
            wordCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });
            
            saveCustomRounds();
        });
        
        // Add event listener to update select all state when individual checkboxes change
        const updateSelectAllState = () => {
            const wordCheckboxes = wordContent.querySelectorAll('input[type="checkbox"]:not(.select-all-checkbox)');
            const checkedCount = wordContent.querySelectorAll('input[type="checkbox"]:not(.select-all-checkbox):checked').length;
            
            if (checkedCount === 0) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            } else if (checkedCount === wordCheckboxes.length) {
                selectAllCheckbox.checked = true;
                selectAllCheckbox.indeterminate = false;
            } else {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = true;
            }
        };
        
        selectAllItem.appendChild(selectAllCheckbox);
        selectAllItem.appendChild(selectAllLabel);
        
        // Add click event listener to the entire select all item
        selectAllItem.addEventListener('click', (e) => {
            // Don't trigger if clicking directly on the checkbox (to avoid double-triggering)
            if (e.target !== selectAllCheckbox) {
                console.log('Select All item clicked, toggling checkbox');
                selectAllCheckbox.checked = !selectAllCheckbox.checked;
                // Trigger the change event manually
                selectAllCheckbox.dispatchEvent(new Event('change'));
            }
        });
        
        wordContent.appendChild(selectAllItem);
        
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
                updateSelectAllState();
                saveCustomRounds();
            });
            
            const label = document.createElement('label');
            label.htmlFor = `word-${roundNumber - 1}-${word.japanese}`;
            label.textContent = capitalizeWords(getCorrectAnswer(word));
            
            wordItem.appendChild(checkbox);
            wordItem.appendChild(label);
            wordContent.appendChild(wordItem);
        });
        
        // Initialize select all state
        updateSelectAllState();
        
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
            alert(getTranslatedMessage('enter-both-words'));
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
        saveCustomRounds();
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
            <h3 data-en="Introduction Round ${roundNumber}" data-es="Ronda de Introducción ${roundNumber}" data-fr="Ronde d'Introduction ${roundNumber}" data-ja="導入ラウンド${roundNumber}" data-zh="介绍轮次${roundNumber}" data-id="Ronde Pengenalan ${roundNumber}" data-ko="소개 라운드 ${roundNumber}" data-vi="Vòng Giới thiệu ${roundNumber}">Introduction Round ${roundNumber}</h3>
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
                header.setAttribute('data-zh', `介绍轮次${newRoundNumber}`);
                header.setAttribute('data-id', `Ronde Pengenalan ${newRoundNumber}`);
                header.setAttribute('data-ko', `소개 라운드 ${newRoundNumber}`);
                header.setAttribute('data-vi', `Vòng Giới thiệu ${newRoundNumber}`);
                
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
            
            // Update language for new elements (but don't regenerate grids)
            updateAllTextWithoutGrids();
            
            // Save custom rounds to local storage
            saveCustomRounds();
        }
    } else {
        alert(getTranslatedMessage('must-have-round'));
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
            header.setAttribute('data-zh', `介绍轮次${index + 1}`);
            header.setAttribute('data-id', `Ronde Pengenalan ${index + 1}`);
            header.setAttribute('data-ko', `소개 라운드 ${index + 1}`);
            header.setAttribute('data-vi', `Vòng Giới thiệu ${index + 1}`);
        });
        
        // Update language for renumbered elements (but don't regenerate grids)
        updateAllTextWithoutGrids();
    } else {
        alert(getTranslatedMessage('must-have-round'));
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
        alert(getTranslatedMessage('select-words'));
        return;
    }
    
    // Store custom word pools and start the game
    window.customWordPools = customWordPools;
    window.customModeEnabled = true;
    window.customModeNoPracticeRounds = disablePracticeRoundsToggle.checked;
    
    // Populate round selector with custom rounds
    populateRoundSelector();
    
    // Update language for new elements
    updateAllText();
    
    // Update back button text for custom mode
    updateBackButtonText();
    
    // Save the final state before starting the game
    saveCustomRounds();
    
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
        roundTitle.textContent = `${roundTitle.getAttribute(`data-${currentLanguage}`) || 'Introduction Round'} ${introRoundNumber}`;
        currentPhase = 'learning';
        currentQuestionIndex = 0;
        showCustomLearningQuestion();
    } else {
        // Calculate the practice round number
        const practiceRoundNumber = Math.floor(currentRound / 2);
        roundTitle.textContent = `${roundTitle.getAttribute(`data-practice-${currentLanguage}`) || 'Practice Round'} ${practiceRoundNumber}`;
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
    displayWordWithSound(word);
    // Update global currentWord for answer validation
    currentWord = word;
    correctAnswerDisplay.textContent = capitalizeWords(getCorrectAnswer(word));
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
    displayWordWithSound(word);
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
    // Update global currentWord for answer validation
    window.currentWord = word;
    displayWordWithSound(word);
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
        darkMode: isDarkMode,
        autoPlaySound: autoPlaySound
    };
    saveToLocalStorage(STORAGE_KEYS.SETTINGS, settings);
}

function loadSettings() {
    const settings = loadFromLocalStorage(STORAGE_KEYS.SETTINGS, { language: 'en', darkMode: false, autoPlaySound: false });
    
    // Validate and apply language setting
    if (settings && typeof settings.language === 'string' && ['en', 'es', 'fr', 'ja', 'zh', 'id', 'ko', 'vi'].includes(settings.language)) {
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
    
    // Validate and apply auto-play sound setting
    if (settings && typeof settings.autoPlaySound === 'boolean') {
        autoPlaySound = settings.autoPlaySound;
    } else {
        autoPlaySound = false;
        console.warn('Invalid auto-play sound setting, defaulting to disabled');
    }
    
    // Apply settings
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Apply UI settings
    if (autoPlayToggle) {
        autoPlayToggle.checked = autoPlaySound;
    }
    
    // Update cookie status display
    if (cookieStatusText) {
        updateCookieStatusDisplay();
    }
    
    updateAllText();
}

function saveCustomRounds() {
    const rounds = document.querySelectorAll('.custom-round');
    if (rounds.length === 0) {
        console.log('No custom rounds to save');
        return;
    }
    
    console.log(`Saving ${rounds.length} custom rounds...`);
    
    const customData = {
        rounds: [],
        noPracticeRounds: window.customModeNoPracticeRounds || false,
        timestamp: Date.now()
    };
    
    rounds.forEach((round, index) => {
        const roundNumber = index + 1;
        const roundData = {
            roundNumber: roundNumber,
            checkedWords: [],
            customWords: [],
            openSections: []
        };
        
        // Save checked words
        const checkboxes = round.querySelectorAll('input[type="checkbox"]:checked');
        checkboxes.forEach(checkbox => {
            if (checkbox.dataset.japanese && checkbox.dataset.english) {
                roundData.checkedWords.push({
                    japanese: checkbox.dataset.japanese,
                    english: checkbox.dataset.english
                });
            }
        });
        
        // Save custom words
        const customWordItems = round.querySelectorAll('.custom-word-item');
        customWordItems.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.dataset.japanese && checkbox.dataset.english) {
                roundData.customWords.push({
                    japanese: checkbox.dataset.japanese,
                    english: checkbox.dataset.english,
                    checked: checkbox.checked
                });
            }
        });
        
        // Save open sections
        const openSections = round.querySelectorAll('.word-section-content:not(.collapsed)');
        openSections.forEach(section => {
            roundData.openSections.push(section.id);
        });
        
        customData.rounds.push(roundData);
    });
    
    try {
        saveToLocalStorage(STORAGE_KEYS.CUSTOM_ROUNDS, customData);
        console.log('Custom rounds saved successfully:', customData);
        console.log(`Total data size: ${JSON.stringify(customData).length} characters`);
    } catch (error) {
        console.error('Error saving custom rounds:', error);
        // Try to save a minimal version if the full save fails
        try {
            const minimalData = {
                rounds: customData.rounds.map(round => ({
                    roundNumber: round.roundNumber,
                    checkedWords: round.checkedWords.length,
                    customWords: round.customWords.length,
                    openSections: round.openSections.length
                })),
                noPracticeRounds: customData.noPracticeRounds,
                timestamp: customData.timestamp,
                error: 'Minimal data due to save failure'
            };
            saveToLocalStorage(STORAGE_KEYS.CUSTOM_ROUNDS, minimalData);
            console.log('Saved minimal custom rounds data due to error');
        } catch (secondError) {
            console.error('Failed to save even minimal data:', secondError);
        }
    }
}

function loadCustomRounds() {
    const customData = loadFromLocalStorage(STORAGE_KEYS.CUSTOM_ROUNDS, null);
    
    // Handle legacy data format (old wordPools format)
    if (customData && typeof customData === 'object' && customData.wordPools && !customData.rounds) {
        console.log('Legacy custom rounds data detected, clearing old format');
        localStorage.removeItem(STORAGE_KEYS.CUSTOM_ROUNDS);
        return false;
    }
    
    if (customData && typeof customData === 'object' && customData.rounds) {
        // Validate the data structure
        if (!Array.isArray(customData.rounds)) {
            console.error('Invalid custom rounds data: rounds is not an array');
            return false;
        }
        
        // Check if data is too old (optional - can be removed if not needed)
        if (customData.timestamp && Date.now() - customData.timestamp > 30 * 24 * 60 * 60 * 1000) { // 30 days
            console.warn('Custom rounds data is over 30 days old');
        }
        
        console.log('Loading custom rounds data:', customData);
        console.log(`Data contains ${customData.rounds.length} rounds`);
        
        // Store the data in memory for later restoration
        window.savedCustomRoundsData = customData;
        
        // Clear existing custom rounds
        const existingRounds = document.querySelectorAll('.custom-round');
        existingRounds.forEach(round => round.remove());
        
        // Create the round containers (without populating grids yet)
        customData.rounds.forEach(roundData => {
            const roundNumber = roundData.roundNumber;
            const newRound = document.createElement('div');
            newRound.className = 'custom-round';
            newRound.dataset.round = roundNumber;
            
            newRound.innerHTML = `
                <div class="custom-round-header" onclick="toggleCustomRound(${roundNumber})">
                    <h3 data-en="Introduction Round ${roundNumber}" data-es="Ronda de Introducción ${roundNumber}" data-fr="Ronde d'Introduction ${roundNumber}" data-ja="導入ラウンド${roundNumber}" data-zh="介绍轮次${roundNumber}" data-id="Ronde Pengenalan ${roundNumber}" data-ko="소개 라운드 ${roundNumber}" data-vi="Vòng Giới thiệu ${roundNumber}">Introduction Round ${roundNumber}</h3>
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
        });
        
        // Update remove button visibility
        updateRemoveButtonVisibility();
        
        // Update round selector with new rounds
        populateRoundSelector();
        
        // Restore practice rounds setting
        if (customData.noPracticeRounds !== undefined) {
            window.customModeNoPracticeRounds = Boolean(customData.noPracticeRounds);
            if (disablePracticeRoundsToggle) {
                disablePracticeRoundsToggle.checked = customData.noPracticeRounds;
            }
        }
        
        return true;
    }
    return false;
}

function restoreCustomRoundsState() {
    if (!window.savedCustomRoundsData || !window.savedCustomRoundsData.rounds) {
        console.log('No saved custom rounds data to restore');
        return;
    }
    
    console.log('Restoring custom rounds state:', window.savedCustomRoundsData);
    
    // Restore the state for each round
    window.savedCustomRoundsData.rounds.forEach(roundData => {
        const roundNumber = roundData.roundNumber;
        const round = document.querySelector(`.custom-round[data-round="${roundNumber}"]`);
        if (!round) return;
        
        // Restore checked words
        roundData.checkedWords.forEach(word => {
            const checkbox = round.querySelector(`input[data-japanese="${word.japanese}"][data-english="${word.english}"]`);
            if (checkbox) {
                checkbox.checked = true;
                console.log(`Restored checkbox for: ${word.japanese} - ${word.english}`);
            } else {
                console.log(`Could not find checkbox for: ${word.japanese} - ${word.english}`);
            }
        });
        
        // Restore custom words
        roundData.customWords.forEach(customWord => {
            console.log(`Restoring custom word: ${customWord.japanese} - ${customWord.english} (checked: ${customWord.checked})`);
            addCustomWordToRound(round, customWord.japanese, customWord.english);
            // Set the checkbox state for custom words
            const customCheckbox = round.querySelector(`input[data-japanese="${customWord.japanese}"][data-english="${customWord.english}"]`);
            if (customCheckbox) {
                customCheckbox.checked = customWord.checked;
                console.log(`Restored custom word checkbox: ${customWord.japanese} - ${customWord.english}`);
            } else {
                console.warn(`Could not find custom word checkbox for: ${customWord.japanese} - ${customWord.english}`);
            }
        });
        
        // Restore open sections
        roundData.openSections.forEach(sectionId => {
            const section = round.querySelector(`#${sectionId}`);
            if (section) {
                section.classList.remove('collapsed');
                const button = section.previousElementSibling.querySelector('.collapse-btn');
                if (button) {
                    button.textContent = '▲';
                    button.classList.add('rotated');
                    console.log(`Restored open section: ${sectionId}`);
                } else {
                    console.warn(`Could not find collapse button for section: ${sectionId}`);
                }
            } else {
                console.warn(`Could not find section to restore: ${sectionId}`);
            }
        });
    });
    
    // Update all select all states after restoration
    updateSelectAllState();
    
    // Clear the saved data from memory
    delete window.savedCustomRoundsData;
}

// Debug function to help troubleshoot custom rounds issues
function debugCustomRounds() {
    console.log('=== Custom Rounds Debug Info ===');
    
    // Check localStorage
    const savedData = loadFromLocalStorage(STORAGE_KEYS.CUSTOM_ROUNDS, null);
    if (savedData) {
        console.log('Saved data in localStorage:', savedData);
        console.log('Data size:', JSON.stringify(savedData).length, 'characters');
        if (savedData.timestamp) {
            const age = Date.now() - savedData.timestamp;
            console.log('Data age:', Math.round(age / (1000 * 60 * 60 * 24)), 'days');
        }
    } else {
        console.log('No saved data found in localStorage');
    }
    
    // Check current DOM state
    const rounds = document.querySelectorAll('.custom-round');
    console.log('Current DOM rounds:', rounds.length);
    
    rounds.forEach((round, index) => {
        const roundNumber = index + 1;
        const checkboxes = round.querySelectorAll('input[type="checkbox"]:checked');
        const customWords = round.querySelectorAll('.custom-word-item');
        const openSections = round.querySelectorAll('.word-section-content:not(.collapsed)');
        
        console.log(`Round ${roundNumber}:`, {
            checkedWords: checkboxes.length,
            customWords: customWords.length,
            openSections: openSections.length
        });
    });
    
    // Check global variables
    console.log('Global custom mode state:', {
        customModeEnabled: window.customModeEnabled,
        customWordPools: window.customWordPools,
        customModeNoPracticeRounds: window.customModeNoPracticeRounds,
        savedCustomRoundsData: !!window.savedCustomRoundsData
    });
    
    console.log('=== End Debug Info ===');
}

function updateSelectAllState() {
    // Find all select all checkboxes and update their states
    const selectAllCheckboxes = document.querySelectorAll('.select-all-checkbox');
    
    selectAllCheckboxes.forEach(selectAllCheckbox => {
        const sectionId = selectAllCheckbox.id.replace('select-all-', '');
        const [roundIndex, sectionIndex] = sectionId.split('-').map(Number);
        
        // Find the word content section for this select all checkbox
        const wordContent = document.querySelector(`#word-content-${roundIndex}-${sectionIndex}`);
        if (!wordContent) return;
        
        // Get all word checkboxes in this section (excluding the select all checkbox)
        const wordCheckboxes = wordContent.querySelectorAll('input[type="checkbox"]:not(.select-all-checkbox)');
        
        if (wordCheckboxes.length === 0) return;
        
        // Count checked and unchecked checkboxes
        const checkedCount = Array.from(wordCheckboxes).filter(cb => cb.checked).length;
        const totalCount = wordCheckboxes.length;
        
        // Update select all checkbox state
        if (checkedCount === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedCount === totalCount) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    });
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
    // Disable adsense script
    adsenseScript.classList.add('disabled');
    
    // Set global flag and disable AdSense
    window.adsenseEnabled = false;
    if (typeof window.disableAdSense === 'function') {
        window.disableAdSense();
    }
    
    // Hide ad containers
    hideAdContainers();
    
    // Disable analytics script
    analyticsScript.classList.add('disabled');
    if (typeof window.disableAnalytics === 'function') {
        window.disableAnalytics();
    }
    
    // Save consent preference
    const consentData = {
        analytics: false, // User rejected analytics
        advertising: false,
        timestamp: Date.now()
    };
    saveToLocalStorage(STORAGE_KEYS.COOKIE_CONSENT, consentData);
    
    // Hide the popup
    hideCookieConsent();
    
    console.log('Cookies rejected - Analytics disabled, Advertising disabled');
}

function acceptCookies() {
    // Enable adsense script (user accepted all cookies)
    adsenseScript.classList.remove('disabled');
    window.adsenseEnabled = true;
    if (typeof window.enableAdSense === 'function') {
        window.enableAdSense();
    }
    
    // Show ad containers
    showAdContainers();
    
    // Enable analytics script
    analyticsScript.classList.remove('disabled');
    if (typeof window.enableAnalytics === 'function') {
        window.enableAnalytics();
    }
    
    // Save consent preference
    const consentData = {
        analytics: true,
        advertising: true, // User accepted all cookies
        timestamp: Date.now()
    };
    saveToLocalStorage(STORAGE_KEYS.COOKIE_CONSENT, consentData);
    
    // Hide the popup
    hideCookieConsent();
    
    console.log('Cookies accepted - Analytics enabled, Advertising enabled');
}

function loadCookieConsent() {
    const consentData = loadFromLocalStorage(STORAGE_KEYS.COOKIE_CONSENT, null);
    
    if (consentData && typeof consentData === 'object') {
        // Apply saved preferences
        if (consentData.advertising === false) {
            // User previously rejected advertising cookies
            adsenseScript.classList.add('disabled');
            window.adsenseEnabled = false;
            if (typeof window.disableAdSense === 'function') {
                window.disableAdSense();
            }
        } else if (consentData.advertising === true) {
            // User previously accepted advertising cookies
            adsenseScript.classList.remove('disabled');
            window.adsenseEnabled = true;
            if (typeof window.enableAdSense === 'function') {
                window.enableAdSense();
            }
            // Show ad containers
            showAdContainers();
        } else {
            // Hide ad containers by default
            hideAdContainers();
        }
        
        // Handle analytics based on saved preference
        if (consentData.analytics === false) {
            // User previously rejected analytics cookies
            analyticsScript.classList.add('disabled');
            if (typeof window.disableAnalytics === 'function') {
                window.disableAnalytics();
            }
        } else if (consentData.analytics === true) {
            // User previously accepted analytics cookies
            analyticsScript.classList.remove('disabled');
            if (typeof window.disableAnalytics === 'function') {
                window.disableAnalytics();
            }
            // Enable analytics
            if (typeof window.enableAnalytics === 'function') {
                window.enableAnalytics();
            }
        }
        
        // Update settings panel display if it exists
        if (cookieStatusText) {
            updateCookieStatusDisplay();
        }
        
        console.log('Cookie consent preferences loaded');
        return true;
    }
    
    // No consent data found - ensure scripts are disabled by default
    adsenseScript.classList.add('disabled');
    analyticsScript.classList.add('disabled');
    window.adsenseEnabled = false;
    window.analyticsEnabled = false;
    
    // Hide ad containers by default
    hideAdContainers();
    
    console.log('No consent data found - scripts disabled by default');
    return false;
}

// Policy page navigation functions
function showPrivacyPolicy() {
    privacyPolicyPage.classList.remove('hidden');
    cookieConsentOverlay.classList.add('hidden');
}

function showTermsOfService() {
    termsOfServicePage.classList.remove('hidden');
    cookieConsentOverlay.classList.add('hidden');
}

function hidePolicyPage() {
    privacyPolicyPage.classList.add('hidden');
    termsOfServicePage.classList.add('hidden');
    cookieConsentOverlay.classList.remove('hidden');
}

// Settings panel cookie consent management functions
function acceptCookiesFromSettings() {
    // Enable adsense script
    adsenseScript.classList.remove('disabled');
    window.adsenseEnabled = true;
    if (typeof window.enableAdSense === 'function') {
        window.enableAdSense();
    }
    
    // Show ad containers
    showAdContainers();
    
    // Enable analytics script
    analyticsScript.classList.remove('disabled');
    if (typeof window.enableAnalytics === 'function') {
        window.enableAnalytics();
    }
    
    // Save consent preference
    const consentData = {
        analytics: true,
        advertising: true,
        timestamp: Date.now()
    };
    saveToLocalStorage(STORAGE_KEYS.COOKIE_CONSENT, consentData);
    
    // Update status display
    updateCookieStatusDisplay();
    
    console.log('Cookies accepted from settings - Analytics enabled, Advertising enabled');
}

function revokeCookiesFromSettings() {
    // Disable adsense script
    adsenseScript.classList.add('disabled');
    window.adsenseEnabled = false;
    if (typeof window.disableAdSense === 'function') {
        window.disableAdSense();
    }
    
    // Hide ad containers
    hideAdContainers();
    
    // Disable analytics script
    analyticsScript.classList.add('disabled');
    if (typeof window.disableAnalytics === 'function') {
        window.disableAnalytics();
    }
    
    // Save consent preference
    const consentData = {
        analytics: false,
        advertising: false,
        timestamp: Date.now()
    };
    saveToLocalStorage(STORAGE_KEYS.COOKIE_CONSENT, consentData);
    
    // Update status display
    updateCookieStatusDisplay();
    
    console.log('Cookies revoked from settings - Analytics disabled, Advertising disabled');
}

function updateCookieStatusDisplay() {
    const consentData = loadFromLocalStorage(STORAGE_KEYS.COOKIE_CONSENT, null);
    
    if (consentData && typeof consentData === 'object') {
        if (consentData.analytics === true && consentData.advertising === true) {
            cookieStatusText.setAttribute('data-en', 'Analytics and advertising cookies accepted');
            cookieStatusText.setAttribute('data-es', 'Cookies de análisis y publicidad aceptados');
            cookieStatusText.setAttribute('data-fr', 'Cookies d\'analyse et publicitaires acceptés');
            cookieStatusText.setAttribute('data-ja', '分析と広告のクッキーが受け入れられました');
        } else if (consentData.analytics === true && consentData.advertising === false) {
            cookieStatusText.setAttribute('data-en', 'Analytics cookies accepted, advertising rejected');
            cookieStatusText.setAttribute('data-es', 'Cookies de análisis aceptados, publicidad rechazada');
            cookieStatusText.setAttribute('data-fr', 'Cookies d\'analyse acceptés, publicité rejetée');
            cookieStatusText.setAttribute('data-ja', '分析クッキーが受け入れられ、広告が拒否されました');
        } else if (consentData.analytics === false && consentData.advertising === false) {
            cookieStatusText.setAttribute('data-en', 'All non-essential cookies rejected');
            cookieStatusText.setAttribute('data-es', 'Todas las cookies no esenciales rechazadas');
            cookieStatusText.setAttribute('data-fr', 'Tous les cookies non essentiels rejetés');
            cookieStatusText.setAttribute('data-ja', 'すべての非必須クッキーが拒否されました');
        }
    } else {
        cookieStatusText.setAttribute('data-en', 'No consent given');
        cookieStatusText.setAttribute('data-es', 'No se ha dado consentimiento');
        cookieStatusText.setAttribute('data-fr', 'Aucun consentement donné');
        cookieStatusText.setAttribute('data-ja', '同意が与えられていません');
    }
    
    // Update the displayed text based on current language
    const text = cookieStatusText.getAttribute(`data-${currentLanguage}`);
    if (text) {
        cookieStatusText.textContent = text;
    }
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

// Ad container management functions
function showAdContainers() {
    const adContainers = document.querySelectorAll('.ad-container');
    adContainers.forEach(container => {
        container.classList.remove('hidden');
    });
    console.log('Ad containers shown');
}

function hideAdContainers() {
    const adContainers = document.querySelectorAll('.ad-container');
    adContainers.forEach(container => {
        container.classList.add('hidden');
    });
    console.log('Ad containers hidden');
}
