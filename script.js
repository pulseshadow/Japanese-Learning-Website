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
let autoPlaySound = true; // Default to true (enabled)

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
    // Check if we're in mirrored mode
    if (window.mirroredMode) {
        // In mirrored mode, return Japanese characters as the correct answer
        return word.japanese;
    }
    
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
const wordEntrySelectionPage = document.getElementById('word-entry-selection-page');
const japaneseScriptPage = document.getElementById('japanese-script-page');
const japaneseCustomModePage = document.getElementById('japanese-custom-mode-page');
const bruteForceBtn = document.getElementById('brute-force-btn');
const customModeBtn = document.getElementById('custom-mode-btn');
const customHiraganaBtn = document.getElementById('custom-hiragana-btn');
const hiraganaBtn = document.getElementById('hiragana-btn');
const katakanaBtn = document.getElementById('katakana-btn');
const backToStartBtn = document.getElementById('back-to-start');
const backToScriptBtn = document.getElementById('back-to-script');
const backToStartFromCustomScriptBtn = document.getElementById('back-to-start-from-custom-script');
const backToStartFromCustomBtn = document.getElementById('back-to-start-from-custom');
const backToStartFromWordEntryBtn = document.getElementById('back-to-start-from-word-entry');
const enterJapaneseWordsBtn = document.getElementById('enter-japanese-words-btn');
const enterEnglishWordsBtn = document.getElementById('enter-english-words-btn');

// Debug: Check if buttons are found
console.log('enterJapaneseWordsBtn found:', enterJapaneseWordsBtn);
console.log('enterEnglishWordsBtn found:', enterEnglishWordsBtn);

// Debug: Check button properties
if (enterJapaneseWordsBtn) {
    console.log('enterJapaneseWordsBtn properties:');
    console.log('- disabled:', enterJapaneseWordsBtn.disabled);
    console.log('- className:', enterJapaneseWordsBtn.className);
    console.log('- style.display:', enterJapaneseWordsBtn.style.display);
    console.log('- style.visibility:', enterJapaneseWordsBtn.style.visibility);
    console.log('- style.pointerEvents:', enterJapaneseWordsBtn.style.pointerEvents);
}
const backToWordEntryBtn = document.getElementById('back-to-word-entry');
const japaneseHiraganaBtn = document.getElementById('japanese-hiragana-btn');
const japaneseKatakanaBtn = document.getElementById('japanese-katakana-btn');
const backToWordEntryFromJapaneseCustomBtn = document.getElementById('back-to-word-entry-from-japanese-custom');
const japaneseAddRoundBtn = document.getElementById('japanese-add-round-btn');
const japaneseRemoveRoundBtn = document.getElementById('japanese-remove-round-btn');
const japaneseStartCustomRunBtn = document.getElementById('japanese-start-custom-run-btn');
const japaneseDisablePracticeRoundsToggle = document.getElementById('japanese-disable-practice-rounds');
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
    console.log('Brute Force Mode clicked');
    window.selectedMode = 'brute-force';
    showPage('word-entry-selection');
});
customModeBtn.addEventListener('click', () => {
    console.log('Custom Mode clicked');
    window.selectedMode = 'custom';
    showPage('word-entry-selection');
});
userStatsBtn.addEventListener('click', () => {
    showPage('stats');
    updateStatsDisplay();
});
customHiraganaBtn.addEventListener('click', () => showPage('custom-mode'));
hiraganaBtn.addEventListener('click', startGame);
    katakanaBtn.addEventListener('click', () => alert(getTranslatedMessage('katakana-coming-soon')));
backToStartBtn.addEventListener('click', () => showPage('start'));

// Add event listener for the new back button in script selection
const backToWordEntryFromScriptBtn = document.getElementById('back-to-word-entry-from-script');
backToWordEntryFromScriptBtn.addEventListener('click', () => {
    showPage('word-entry-selection');
});
backToScriptBtn.addEventListener('click', () => {
    // If in mirrored mode, go back to Japanese script selection
    if (window.mirroredMode) {
        showPage('japanese-script');
        return;
    }
    
    // If in custom mode, go back to word selection, otherwise go to word entry selection
    if (window.customModeEnabled) {
        showPage('custom-mode');
    } else {
        // Check if we came from word entry selection
        if (window.cameFromWordEntry) {
            showPage('word-entry-selection');
        } else {
            showPage('start');
        }
    }
});
backToStartFromCustomScriptBtn.addEventListener('click', () => {
    // Reset custom mode variables when leaving custom mode
    window.customModeEnabled = false;
    window.customWordPools = null;
    
    // Check if we came from word entry selection
    if (window.cameFromWordEntry) {
        showPage('word-entry-selection');
    } else {
        showPage('start');
    }
});

backToStartFromCustomBtn.addEventListener('click', () => {
    // Reset custom mode variables when leaving custom mode
    window.customModeEnabled = false;
    window.customWordPools = null;
    showPage('custom-script');
});

// Word entry selection page event listeners
backToStartFromWordEntryBtn.addEventListener('click', () => {
    // Clear the flag when going back to start
    window.cameFromWordEntry = false;
    showPage('start');
});

enterJapaneseWordsBtn.addEventListener('click', () => {
    console.log('Enter Japanese Words clicked, selected mode:', window.selectedMode);
    console.log('Button element:', enterJapaneseWordsBtn);
    console.log('Button disabled state:', enterJapaneseWordsBtn.disabled);
    console.log('Button classes:', enterJapaneseWordsBtn.className);
    
    // Set flag to indicate we came from word entry selection
    window.cameFromWordEntry = true;
    
    // Check which mode was selected and navigate accordingly
    if (window.selectedMode === 'brute-force') {
        console.log('Navigating to Japanese script page for mirrored brute force mode');
        showPage('japanese-script');
    } else if (window.selectedMode === 'custom') {
        console.log('Navigating to Japanese custom mode for mirrored custom mode');
        showPage('japanese-custom-mode');
    } else {
        console.warn('No mode selected, defaulting to Japanese script');
        showPage('japanese-script');
    }
});

enterEnglishWordsBtn.addEventListener('click', () => {
    console.log('Enter English Words clicked, selected mode:', window.selectedMode);
    // Set flag to indicate we came from word entry selection
    window.cameFromWordEntry = true;
    
    // Check which mode was selected and navigate accordingly
    if (window.selectedMode === 'brute-force') {
        console.log('Navigating to script page for brute force mode');
        showPage('script');
    } else if (window.selectedMode === 'custom') {
        console.log('Navigating to custom script page for custom mode');
        showPage('custom-script');
    } else {
        console.warn('No mode selected, defaulting to brute force');
        showPage('script');
    }
});

// Japanese script page event listeners
backToWordEntryBtn.addEventListener('click', () => {
    showPage('word-entry-selection');
});

japaneseHiraganaBtn.addEventListener('click', () => {
    console.log('Starting mirrored brute force mode with Hiragana');
    window.mirroredMode = true;
    startMirroredGame();
});

japaneseKatakanaBtn.addEventListener('click', () => {
    console.log('Katakana not yet implemented for mirrored mode');
    // TODO: Implement Katakana support for mirrored mode
});

// Japanese custom mode page event listeners
backToWordEntryFromJapaneseCustomBtn.addEventListener('click', () => {
    showPage('word-entry-selection');
});

japaneseAddRoundBtn.addEventListener('click', () => {
    console.log('Adding round to Japanese custom mode');
    addJapaneseCustomRound();
});

japaneseRemoveRoundBtn.addEventListener('click', () => {
    console.log('Removing round from Japanese custom mode');
    removeJapaneseCustomRound();
});

japaneseStartCustomRunBtn.addEventListener('click', () => {
    console.log('Starting Japanese custom run');
    startJapaneseCustomRun();
});

japaneseDisablePracticeRoundsToggle.addEventListener('change', () => {
    window.japaneseCustomModeNoPracticeRounds = japaneseDisablePracticeRoundsToggle.checked;
    saveJapaneseCustomRounds();
});

// Mirrored game mode functions
function startMirroredGame() {
    console.log('Starting mirrored game mode');
    
    // Reset game state for mirrored mode
    currentPage = 'game';
    currentRound = 1;
    currentPhase = 'learning';
    currentQuestionIndex = 0;
    currentWord = null;
    correctAnswers = {};
    questionQueue = [];
    allLearnedWords = [];
    wordsWithPendingPoints = new Set();
    currentQuestionFailed = false;
    eliminationWords = [];
    
    // Set mirrored mode flag
    window.mirroredMode = true;
    
    // Don't clear the word entry flag when starting a mirrored game
    // This allows users to go back to word entry selection from script pages
    
    // Show game page
    showPage('game');
    
    // Show hiragana keyboard for mirrored mode
    showHiraganaKeyboard();
    
    // Initialize the first round
    initializeMirroredRound();
}

function initializeMirroredRound() {
    console.log('Initializing mirrored round:', currentRound);
    
    // Get words for current round
    const roundWords = getCurrentRoundWords();
    
    // For mirrored mode, we'll use the same word pools but display them differently
    if (currentPhase === 'learning') {
        // Learning phase - show English words, expect Japanese answers
        currentQuestionIndex = 0;
        showMirroredLearningQuestion();
    } else if (currentPhase === 'elimination') {
        // Elimination phase - show English words, expect Japanese answers
        eliminationWords = [...roundWords];
        showMirroredEliminationQuestion();
    } else {
        // Repeating phase - show English words, expect Japanese answers
        questionQueue = [...roundWords];
        shuffleArray(questionQueue);
        showMirroredRepeatingQuestion();
    }
    
    updateProgress();
    updatePhaseLabel();
    updateNextRoundButton();
}

function showMirroredLearningQuestion() {
    const roundWords = getCurrentRoundWords();
    if (currentQuestionIndex >= roundWords.length) {
        // Learning phase complete, move to elimination phase
        currentPhase = 'elimination';
        eliminationWords = [...roundWords];
        currentQuestionIndex = 0;
        showMirroredEliminationQuestion();
        return;
    }
    
    const word = roundWords[currentQuestionIndex];
    
    // Use displayWordWithSound to trigger auto-play and update answer display
    displayWordWithSound(word);
    
    // Set currentWord for answer validation
    currentWord = word;
    
    // In mirrored mode, show Japanese answer
    correctAnswerDisplay.textContent = word.japanese;
    correctAnswerDisplay.classList.remove('hidden');
    
    // Update phase label for mirrored mode
    updatePhaseLabel();
    
    // Clear input and focus
    answerInput.value = '';
    answerInput.focus();
    
    // Update progress
    updateProgress();
}

function showMirroredEliminationQuestion() {
    if (eliminationWords.length === 0) {
        // Elimination phase complete, move to repeating phase
        currentPhase = 'repeating';
        questionQueue = [...getCurrentRoundWords()];
        shuffleArray(questionQueue);
        currentQuestionIndex = 0;
        showMirroredRepeatingQuestion();
        return;
    }
    
    const word = eliminationWords[currentQuestionIndex];
    
    // Use displayWordWithSound to trigger auto-play and update answer display
    displayWordWithSound(word);
    
    // Set currentWord for answer validation
    currentWord = word;
    
    // In mirrored mode, hide answer
    correctAnswerDisplay.classList.add('hidden');
    
    // Update phase label for mirrored mode
    updatePhaseLabel();
    
    // Clear input and focus
    answerInput.value = '';
    answerInput.focus();
    
    // Update progress
    updateProgress();
}

function showMirroredRepeatingQuestion() {
    if (questionQueue.length === 0) {
        // Refill queue if empty
        const roundWords = getCurrentRoundWords();
        for (let i = 0; i < 21; i++) {
            const randomWord = roundWords[Math.floor(Math.random() * roundWords.length)];
            questionQueue.push(randomWord);
        }
    }
    
    // Filter out words that have already been answered correctly 3 times
    questionQueue = questionQueue.filter(word => (correctAnswers[word.japanese] || 0) < 3);
    
    // If queue is empty after filtering, refill it
    if (questionQueue.length === 0) {
        const roundWords = getCurrentRoundWords();
        for (let i = 0; i < 21; i++) {
            const randomWord = roundWords[Math.floor(Math.random() * roundWords.length)];
            questionQueue.push(randomWord);
        }
        // Filter again
        questionQueue = questionQueue.filter(word => (correctAnswers[word.japanese] || 0) < 3);
    }
    
    // Check if all words have been answered correctly 3 times
    if (questionQueue.length === 0) {
        // All words have been answered correctly 3 times
        console.log('All words have been answered correctly 3 times');
        updateNextRoundButton();
        return;
    }
    
    const word = questionQueue[0];
    
    // Use displayWordWithSound to trigger auto-play and update answer display
    displayWordWithSound(word);
    
    // Set currentWord for answer validation
    currentWord = word;
    
    // In mirrored mode, hide answer
    correctAnswerDisplay.classList.add('hidden');
    
    // Update phase label for mirrored mode
    updatePhaseLabel();
    
    // Clear input and focus
    answerInput.value = '';
    answerInput.focus();
    
    // Update progress
    updateProgress();
}

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
    
    // Get the new word entry selection page
    const wordEntrySelectionPage = document.getElementById('word-entry-selection-page');
    if (wordEntrySelectionPage) {
        wordEntrySelectionPage.style.display = 'none';
    }
    
    // Get the new Japanese script page
    const japaneseScriptPage = document.getElementById('japanese-script-page');
    if (japaneseScriptPage) {
        japaneseScriptPage.style.display = 'none';
    }
    
    // Get the new Japanese custom mode page
    const japaneseCustomModePage = document.getElementById('japanese-custom-mode-page');
    if (japaneseCustomModePage) {
        japaneseCustomModePage.style.display = 'none';
    }
    
    // Show the selected page
    if (pageName === 'start') {
        // Reset mirrored mode and Japanese custom mode when returning to start
        if (window.mirroredMode) {
            window.mirroredMode = false;
            console.log('Mirrored mode reset');
        }
        if (window.japaneseCustomModeEnabled) {
            window.japaneseCustomModeEnabled = false;
            console.log('Japanese custom mode reset');
        }
        
        // Hide hiragana keyboard when returning to start
        hideHiraganaKeyboard();
        
        startPage.style.display = 'block';
        startPage.classList.add('active');
    } else if (pageName === 'script') {
        // Hide hiragana keyboard when not in game
        hideHiraganaKeyboard();
        scriptPage.style.display = 'block';
        scriptPage.classList.add('active');
    } else if (pageName === 'game') {
        gamePage.style.display = 'block';
        gamePage.classList.add('active');
    } else if (pageName === 'word-entry-selection') {
        // Hide hiragana keyboard when not in game
        hideHiraganaKeyboard();
        wordEntrySelectionPage.style.display = 'block';
        wordEntrySelectionPage.classList.add('active');
        console.log('Showing word entry selection page, selected mode:', window.selectedMode);
    } else if (pageName === 'japanese-script') {
        // Hide hiragana keyboard when not in game
        hideHiraganaKeyboard();
        japaneseScriptPage.style.display = 'block';
        japaneseScriptPage.classList.add('active');
        console.log('Showing Japanese script page for mirrored mode');
    } else if (pageName === 'custom-script') {
        // Hide hiragana keyboard when not in game
        hideHiraganaKeyboard();
        customScriptPage.style.display = 'block';
        customScriptPage.classList.add('active');
    } else if (pageName === 'custom-mode') {
        // Hide hiragana keyboard when not in game
        hideHiraganaKeyboard();
        customModePage.style.display = 'block';
        customModePage.classList.add('active');
        initializeCustomMode();
    } else if (pageName === 'japanese-custom-mode') {
        // Hide hiragana keyboard when not in game
        hideHiraganaKeyboard();
        japaneseCustomModePage.style.display = 'block';
        japaneseCustomModePage.classList.add('active');
        initializeJapaneseCustomMode();
    } else if (pageName === 'stats') {
        // Hide hiragana keyboard when not in game
        hideHiraganaKeyboard();
        statsPage.style.display = 'block';
        statsPage.classList.add('active');
    }
    

}

// Round selection functionality
function changeRound(roundNumber) {
    if (currentPage === 'game') {
        // Don't update highest round reached when using round skip
        currentRound = roundNumber;
        
        // Check if we're in mirrored mode
        if (window.mirroredMode) {
            if (window.japaneseCustomModeEnabled) {
                // For Japanese custom mode, check if this is the final round
                const noPracticeRounds = window.japaneseCustomModeNoPracticeRounds || false;
                const totalRounds = noPracticeRounds ? window.japaneseCustomWordPools.length : window.japaneseCustomWordPools.length * 2;
                
                if (roundNumber >= totalRounds) {
                    // Hide the next round button on the final round
                    nextRoundBtn.style.visibility = 'hidden';
                    nextRoundBtn.classList.add('disabled');
                } else {
                    // Show the next round button (but keep it disabled until requirements met)
                    nextRoundBtn.style.visibility = 'visible';
                    nextRoundBtn.classList.add('disabled');
                }
                initializeJapaneseCustomRound();
            } else {
                // For mirrored brute force mode, check if this is the final round
                if (roundNumber >= 18) {
                    // Hide the next round button on the final round
                    nextRoundBtn.style.visibility = 'hidden';
                    nextRoundBtn.classList.add('disabled');
                } else {
                    // Show the next round button (but keep it disabled until requirements met)
                    nextRoundBtn.style.visibility = 'visible';
                    nextRoundBtn.classList.add('disabled');
                }
                initializeMirroredRound();
            }
        } else if (window.customWordPools) {
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
    } else if (window.mirroredMode) {
        // Populate with preset rounds (mirrored brute force mode)
        for (let i = 1; i <= 18; i++) {
            const option = document.createElement('option');
            option.value = i;
            
            if (i % 2 === 1) {
                // Introduction round
                const roundNumber = Math.ceil(i / 2);
                option.textContent = `Introduction Round ${roundNumber} (English→Japanese)`;
                option.setAttribute('data-en', `Introduction Round ${roundNumber} (English→Japanese)`);
                option.setAttribute('data-es', `Ronda de Introducción ${roundNumber} (Inglés→Japonés)`);
                option.setAttribute('data-fr', `Ronde d'Introduction ${roundNumber} (Anglais→Japonais)`);
                option.setAttribute('data-ja', `導入ラウンド${roundNumber} (英語→日本語)`);
                option.setAttribute('data-zh', `介绍轮次${roundNumber} (英语→日语)`);
                option.setAttribute('data-id', `Ronde Pengenalan ${roundNumber} (Inggris→Jepang)`);
                option.setAttribute('data-ko', `소개 라운드 ${roundNumber} (영어→일본어)`);
                option.setAttribute('data-vi', `Vòng Giới thiệu ${roundNumber} (Tiếng Anh→Tiếng Nhật)`);
            } else {
                // Practice round
                const roundNumber = Math.floor(i / 2);
                option.textContent = `Practice Round ${roundNumber} (English→Japanese)`;
                option.setAttribute('data-en', `Practice Round ${roundNumber} (English→Japanese)`);
                option.setAttribute('data-es', `Ronda de Práctica ${roundNumber} (Inglés→Japonés)`);
                option.setAttribute('data-fr', `Ronde de Pratique ${roundNumber} (Anglais→Japonais)`);
                option.setAttribute('data-ja', `練習ラウンド${roundNumber} (英語→日本語)`);
                option.setAttribute('data-zh', `练习轮次${roundNumber} (英语→日语)`);
                option.setAttribute('data-id', `Ronde Latihan ${roundNumber} (Inggris→Jepang)`);
                option.setAttribute('data-ko', `연습 라운드 ${roundNumber} (영어→일본어)`);
                option.setAttribute('data-vi', `Vòng Luyện tập ${roundNumber} (Tiếng Anh→Tiếng Nhật)`);
            }
            
            roundSelector.appendChild(option);
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
    
    // Use the global currentWord instead of calling getCurrentWord()
    if (!currentWord) return;
    
    // Determine the correct answer based on mode
    let correctAnswer;
    if (window.mirroredMode && window.japaneseCustomModeEnabled) {
        // Japanese custom mode - expect Japanese characters as answer
        correctAnswer = currentWord.japanese.toLowerCase();
    } else if (window.mirroredMode) {
        // Mirrored brute force mode - expect Japanese characters as answer
        correctAnswer = currentWord.japanese.toLowerCase();
    } else {
        // Standard mode - expect English words as answer
        correctAnswer = getCorrectAnswer(currentWord).toLowerCase();
    }
    
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
            if (window.mirroredMode) {
                // In mirrored mode, show Japanese characters as correct answer
                showErrorAndClearInput(currentWord.japanese);
            } else {
                // In standard mode, show English words as correct answer
                showErrorAndClearInput(currentWord.english);
            }
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
    
    // Don't clear the word entry flag when starting a game
    // This allows users to go back to word entry selection from script pages
    
    // Ensure we're NOT in mirrored mode for normal brute force
    window.mirroredMode = false;
    
    // Hide hiragana keyboard for normal mode
    hideHiraganaKeyboard();
    
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
    // Check if we're in Japanese custom mode
    if (window.japaneseCustomModeEnabled) {
        initializeJapaneseCustomRound();
        return;
    }
    
    // Check if we're in mirrored mode
    if (window.mirroredMode) {
        initializeMirroredRound();
        return;
    }
    
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
    // Check if we're in Japanese custom mode first
    if (window.japaneseCustomModeEnabled) {
        if (currentPhase === 'learning') {
            const roundWords = getCurrentJapaneseCustomRoundWords();
            return roundWords[currentQuestionIndex];
        } else if (currentPhase === 'elimination') {
            return eliminationWords[currentQuestionIndex];
        } else {
            return questionQueue[0];
        }
    }
    
    // Check if we're in standard custom mode
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
    
    // Handle correct answer display based on mode
    if (window.mirroredMode) {
        correctAnswerDisplay.textContent = word.japanese; // Show Japanese characters
    } else {
        correctAnswerDisplay.textContent = capitalizeWords(getCorrectAnswer(word));
    }
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
    // Check if we're in mirrored mode
    if (window.mirroredMode) {
        showMirroredRepeatingQuestion();
        return;
    }
    
    if (questionQueue.length === 0) {
        // Refill queue if empty
        const roundWords = getCurrentRoundWords();
        for (let i = 0; i < 21; i++) {
            const randomWord = roundWords[Math.floor(Math.random() * roundWords.length)];
            questionQueue.push(randomWord);
        }
    }
    
    // Update global currentWord for answer validation
    currentWord = questionQueue[0];
    window.currentWord = currentWord;
    
    console.log('showNextQuestion - Current word:', currentWord, 'Phase:', currentPhase);
    
    // Use displayWordWithSound to trigger auto-play if enabled
    displayWordWithSound(currentWord);
    
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
    
    // Use the global currentWord that was set in the question functions
    if (!currentWord) return;
    
    // Check if we're in mirrored mode
    if (window.mirroredMode) {
        // Mirrored mode - expect Japanese characters as answer
        const correctAnswer = currentWord.japanese.toLowerCase();
        
        if (window.japaneseCustomModeEnabled) {
            // Japanese custom mode
            if (currentPhase === 'learning') {
                if (userAnswer === correctAnswer) {
                    currentQuestionIndex++;
                    showJapaneseCustomLearningQuestion();
                } else {
                    showError(currentWord.japanese);
                }
            } else if (currentPhase === 'elimination') {
                if (userAnswer === correctAnswer) {
                    // Award a point for correct answer in elimination phase
                    const wordKey = currentWord.japanese;
                    if (!correctAnswers[wordKey]) {
                        correctAnswers[wordKey] = 0;
                    }
                    correctAnswers[wordKey]++;
                    
                    currentQuestionIndex++;
                    showJapaneseCustomEliminationQuestion();
                } else {
                    showError(currentWord.japanese);
                }
            } else {
                // Repeating phase
                if (userAnswer === correctAnswer) {
                    updateStats(true, currentRound);
                    handleJapaneseCustomCorrectAnswer();
                } else {
                    updateStats(false, currentRound);
                    handleJapaneseCustomIncorrectAnswer(currentWord);
                }
            }
        } else {
            // Mirrored brute force mode
            if (currentPhase === 'learning') {
                if (userAnswer === correctAnswer) {
                    currentQuestionIndex++;
                    showMirroredLearningQuestion();
                } else {
                    showError(currentWord.japanese);
                }
            } else if (currentPhase === 'elimination') {
                if (userAnswer === correctAnswer) {
                    // Award a point for correct answer in elimination phase
                    const wordKey = currentWord.japanese;
                    if (!correctAnswers[wordKey]) {
                        correctAnswers[wordKey] = 0;
                    }
                    correctAnswers[wordKey]++;
                    
                    currentQuestionIndex++;
                    showMirroredEliminationQuestion();
                } else {
                    showError(currentWord.japanese);
                }
            } else {
                // Repeating phase
                if (userAnswer === correctAnswer) {
                    updateStats(true, currentRound);
                    handleMirroredCorrectAnswer();
                } else {
                    updateStats(false, currentRound);
                    handleMirroredIncorrectAnswer(currentWord);
                }
            }
        }
        return;
    }
    
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

function handleMirroredCorrectAnswer() {
    const word = questionQueue.shift(); // Remove from queue
    const wordKey = word.japanese;
    
    console.log('handleMirroredCorrectAnswer - Processing word:', word, 'Queue length:', questionQueue.length);
    
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
    
    // Check if this word has been answered correctly 3 times
    if ((correctAnswers[wordKey] || 0) >= 3) {
        // Word has been answered correctly 3 times, don't add it back to queue
        console.log(`Word ${wordKey} has been answered correctly 3 times, removing from queue`);
    }
    
    // Show next question
    showMirroredRepeatingQuestion();
}

function handleMirroredIncorrectAnswer(word) {
    // Show error
    showError(word.japanese);
    
    // Update statistics for incorrect answer
    updateStats(false, currentRound);
    
    // Check if this word has been answered correctly 3 times
    if ((correctAnswers[word.japanese] || 0) >= 3) {
        // Word has been answered correctly 3 times, don't add it back to queue
        console.log(`Word ${word.japanese} has been answered correctly 3 times, not adding back to queue`);
        // Show next question without adding this word back
        showMirroredRepeatingQuestion();
        return;
    }
    
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
    
    // Show next question
    showMirroredRepeatingQuestion();
}

function handleJapaneseCustomCorrectAnswer() {
    const word = questionQueue.shift(); // Remove from queue
    const wordKey = word.japanese;
    
    console.log('handleJapaneseCustomCorrectAnswer - Processing word:', word, 'Queue length:', questionQueue.length);
    
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
    
    // Check if this word has been answered correctly 3 times
    if ((correctAnswers[wordKey] || 0) >= 3) {
        // Word has been answered correctly 3 times, don't add it back to queue
        console.log(`Word ${wordKey} has been answered correctly 3 times, removing from queue`);
    }
    
    // Show next question
    showJapaneseCustomRepeatingQuestion();
}

function handleJapaneseCustomIncorrectAnswer(word) {
    // Show error
    showError(word.japanese);
    
    // Update statistics for incorrect answer
    updateStats(false, currentRound);
    
    // Check if this word has been answered correctly 3 times
    if ((correctAnswers[word.japanese] || 0) >= 3) {
        // Word has been answered correctly 3 times, don't add it back to queue
        console.log(`Word ${word.japanese} has been answered correctly 3 times, not adding back to queue`);
        // Show next question without adding this word back
        showJapaneseCustomRepeatingQuestion();
        return;
    }
    
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
        const roundWords = getCurrentJapaneseCustomRoundWords();
        const randomWord = roundWords[Math.floor(Math.random() * roundWords.length)];
        questionQueue.push(randomWord);
    }
    
    // Show next question
    showJapaneseCustomRepeatingQuestion();
}

function handleCorrectAnswer() {
    const word = questionQueue.shift(); // Remove from queue
    const wordKey = word.japanese;
    
    console.log('handleCorrectAnswer - Processing word:', word, 'Queue length:', questionQueue.length);
    

    
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
    // In mirrored mode, show the Japanese characters as the correct answer
    if (window.mirroredMode) {
        correctAnswerDisplay.textContent = correctAnswer; // Don't capitalize Japanese characters
    } else {
        correctAnswerDisplay.textContent = capitalizeWords(correctAnswer);
    }
    correctAnswerDisplay.classList.remove('hidden');
    
    answerInput.classList.add('error');
    setTimeout(() => {
        answerInput.classList.remove('error');
    }, 500);
}

function updateProgress() {
    // Check if we're in mirrored mode
    if (window.mirroredMode) {
        if (window.japaneseCustomModeEnabled) {
            // Japanese custom mode
            if (currentPhase === 'learning') {
                const roundWords = getCurrentJapaneseCustomRoundWords();
                currentQuestionSpan.textContent = currentQuestionIndex + 1;
                totalQuestionsSpan.textContent = roundWords.length;
                phaseProgress.textContent = '';
            } else if (currentPhase === 'elimination') {
                currentQuestionSpan.textContent = currentQuestionIndex + 1;
                totalQuestionsSpan.textContent = eliminationWords.length;
                phaseProgress.textContent = '';
            } else {
                const roundWords = getCurrentJapaneseCustomRoundWords();
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
        } else {
            // Mirrored brute force mode
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
        return;
    }
    
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
    // Check if we're in mirrored mode
    if (window.mirroredMode) {
        if (window.japaneseCustomModeEnabled) {
            // Japanese custom mode
            if (currentPhase === 'learning') {
                phaseLabel.textContent = 'English Words To Learn (Type Japanese)';
            } else if (currentPhase === 'elimination') {
                phaseLabel.textContent = 'English Words To Eliminate (Type Japanese)';
            } else {
                phaseLabel.textContent = 'English Words To Practice (Type Japanese)';
            }
        } else {
            // Mirrored brute force mode
            if (currentPhase === 'learning') {
                phaseLabel.textContent = 'English Words To Learn (Type Japanese)';
            } else if (currentPhase === 'elimination') {
                phaseLabel.textContent = 'English Words To Eliminate (Type Japanese)';
            } else {
                phaseLabel.textContent = 'English Words To Practice (Type Japanese)';
            }
        }
        return;
    }
    
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
    // Check if we're in mirrored mode
    if (window.mirroredMode) {
        if (window.japaneseCustomModeEnabled) {
            // Japanese custom mode
            if (currentPhase === 'learning') {
                const roundWords = getCurrentJapaneseCustomRoundWords();
                const remaining = roundWords.length - currentQuestionIndex;
                roundProgress.textContent = `${remaining} English words remaining (type Japanese)`;
            } else if (currentPhase === 'elimination') {
                const remaining = eliminationWords.length;
                roundProgress.textContent = `${remaining} English words remaining (type Japanese)`;
            } else {
                const roundWords = getCurrentJapaneseCustomRoundWords();
                const totalCorrect = Object.values(correctAnswers).reduce((sum, count) => sum + count, 0);
                const targetCorrect = roundWords.length * 3;
                const remaining = Math.max(0, targetCorrect - totalCorrect);
                roundProgress.textContent = `${remaining} correct Japanese answers needed`;
            }
        } else {
            // Mirrored brute force mode
            if (currentPhase === 'learning') {
                const roundWords = getCurrentRoundWords();
                const remaining = roundWords.length - currentQuestionIndex;
                roundProgress.textContent = `${remaining} English words remaining (type Japanese)`;
            } else if (currentPhase === 'elimination') {
                const remaining = eliminationWords.length;
                roundProgress.textContent = `${remaining} English words remaining (type Japanese)`;
            } else {
                const roundWords = getCurrentRoundWords();
                const totalCorrect = Object.values(correctAnswers).reduce((sum, count) => sum + count, 0);
                const targetCorrect = roundWords.length * 3;
                const remaining = Math.max(0, targetCorrect - totalCorrect);
                roundProgress.textContent = `${remaining} correct Japanese answers needed`;
            }
        }
        return;
    }
    
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
    
    // Check if we're in mirrored mode
    if (window.mirroredMode) {
        if (window.japaneseCustomModeEnabled) {
            // Japanese custom mode
            const roundWords = getCurrentJapaneseCustomRoundWords();
            const totalCorrect = Object.values(correctAnswers).reduce((sum, count) => sum + count, 0);
            const targetCorrect = roundWords.length * 3;
            
            // Check if all words have 3 correct answers
            const allWordsHaveThreeCorrect = roundWords.every(word => 
                (correctAnswers[word.japanese] || 0) >= 3
            );
            
            // Enable button when all words have 3 correct answers
            if (allWordsHaveThreeCorrect) {
                nextRoundBtn.classList.remove('disabled');
            } else {
                nextRoundBtn.classList.add('disabled');
            }
        } else {
            // Mirrored brute force mode
            const roundWords = getCurrentRoundWords();
            const totalCorrect = Object.values(correctAnswers).reduce((sum, count) => sum + count, 0);
            const targetCorrect = roundWords.length * 3;
            
            // Check if all words have 3 correct answers
            const allWordsHaveThreeCorrect = roundWords.every(word => 
                (correctAnswers[word.japanese] || 0) >= 3
            );
            
            // Enable button when all words have 3 correct answers
            if (allWordsHaveThreeCorrect) {
                nextRoundBtn.classList.remove('disabled');
            } else {
                nextRoundBtn.classList.add('disabled');
            }
        }
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
    
    // Check if we're in mirrored mode
    if (window.mirroredMode) {
        if (window.japaneseCustomModeEnabled) {
            nextJapaneseCustomRound();
        } else {
            nextMirroredRound();
        }
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
    
    // Refresh the game ad when moving to a new round
    refreshGameAd();
    
    // Progress tracking removed - no longer persisting round progression
}

// Function to refresh the game ad when moving to a new round
function refreshGameAd() {
    const gameAd = document.getElementById('game-english-hiragana-ad');
    if (gameAd) {
        // Check if AdSense is available
        if (window.adsbygoogle) {
            try {
                // Push a new ad request to refresh the ad
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                console.log('Game ad refreshed for new round');
            } catch (error) {
                console.log('Ad refresh failed:', error);
            }
        }
    }
}

function nextMirroredRound() {
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
    
    // Check if this is the last round (round 18 for mirrored brute force mode)
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
    
    initializeMirroredRound();
    
    // Update highest round reached (only if not using round skip)
    if (currentRound > userStats.highestRoundReached) {
        userStats.highestRoundReached = currentRound;
        saveStats();
    }
    
    // Progress tracking removed - no longer persisting round progression
}

function nextJapaneseCustomRound() {
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
    
    // Check if this is the last round
    const noPracticeRounds = window.japaneseCustomModeNoPracticeRounds || false;
    const totalRounds = noPracticeRounds ? window.japaneseCustomWordPools.length : window.japaneseCustomWordPools.length * 2;
    
    if (currentRound >= totalRounds) {
        // Hide the next round button on the final round
        nextRoundBtn.style.visibility = 'hidden';
        nextRoundBtn.classList.add('disabled');
    } else {
        // Disable next round button at start of new round (but keep it visible)
        nextRoundBtn.classList.add('disabled');
        nextRoundBtn.style.visibility = 'visible';
    }
    
    initializeJapaneseCustomRound();
    
    // Update highest round reached (only if not using round skip)
    if (currentRound > userStats.highestRoundReached) {
        userStats.highestRoundReached = currentRound;
        saveStats();
    }
    
    // Progress tracking removed - no longer persisting round progression
}

// Japanese Custom Mode Functions
function initializeJapaneseCustomMode() {
    console.log('Initializing Japanese custom mode');
    
    // Try to load saved Japanese custom rounds first
    const loaded = loadJapaneseCustomRounds();
    console.log('Loaded Japanese custom rounds:', loaded);
    
    if (!loaded) {
        // If no saved data, automatically add round 1 and open it
        console.log('No saved data, adding round 1 and opening it');
        addJapaneseCustomRound(1);
        
        // Open the first round dropdown
        const firstRound = document.querySelector('.custom-round[data-round="1"]');
        if (firstRound) {
            const roundContent = firstRound.querySelector('.custom-round-content');
            const collapseBtn = firstRound.querySelector('.collapse-btn');
            if (roundContent && collapseBtn) {
                roundContent.style.display = 'block';
                collapseBtn.textContent = '▼';
                collapseBtn.style.transform = 'rotate(180deg)';
            }
        }
    } else {
        // If data was loaded, we still need to populate grids and setup buttons
        // but the state restoration will happen after grids are populated
        console.log('Data was loaded, populating grids and setting up buttons');
        populateJapaneseWordSelectionGrids();
        setupJapaneseCustomWordButtons();
        
        // Now restore the saved state after grids are populated
        restoreJapaneseCustomRoundsState();
    }
    
    console.log('Japanese custom mode initialization complete');
}

function populateJapaneseWordSelectionGrids() {
    console.log('Populating Japanese word selection grids');
    
    // Clear existing grids
    const container = document.getElementById('japanese-custom-rounds-container');
    if (!container) {
        console.error('japanese-custom-rounds-container not found');
        return;
    }
    console.log('Found container:', container);
    
    container.innerHTML = '';
    
    // Get the number of rounds from saved data or default to 1
    const savedData = loadJapaneseCustomRounds();
    const numRounds = savedData ? savedData.rounds.length : 1;
    console.log('Number of rounds to create:', numRounds);
    
    for (let i = 1; i <= numRounds; i++) {
        console.log('Adding round:', i);
        addJapaneseCustomRound(i);
    }
    
    console.log('Finished populating Japanese word selection grids');
}

function addJapaneseCustomRound(roundNumber = null) {
    console.log('Adding Japanese custom round:', roundNumber);
    
    const container = document.getElementById('japanese-custom-rounds-container');
    if (!container) return;
    
    // Determine round number
    if (roundNumber === null) {
        const existingRounds = container.querySelectorAll('.custom-round');
        roundNumber = existingRounds.length + 1;
    }
    
    // Create round container
    const roundDiv = document.createElement('div');
    roundDiv.className = 'custom-round';
    roundDiv.setAttribute('data-round', roundNumber);
    
    // Create round header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'custom-round-header';
    headerDiv.onclick = () => toggleJapaneseCustomRound(roundNumber);
    
    const titleH3 = document.createElement('h3');
    titleH3.setAttribute('data-en', `Introduction Round ${roundNumber} (English→Japanese)`);
    titleH3.setAttribute('data-es', `Ronda de Introducción ${roundNumber} (Inglés→Japonés)`);
    titleH3.setAttribute('data-fr', `Ronde d'Introduction ${roundNumber} (Anglais→Japonais)`);
    titleH3.setAttribute('data-ja', `導入ラウンド${roundNumber} (英語→日本語)`);
    titleH3.setAttribute('data-zh', `介绍轮次${roundNumber} (英语→日语)`);
    titleH3.setAttribute('data-id', `Ronde Pengenalan ${roundNumber} (Inggris→Jepang)`);
    titleH3.setAttribute('data-ko', `소개 라운드 ${roundNumber} (영어→일본어)`);
    titleH3.setAttribute('data-vi', `Vòng Giới thiệu ${roundNumber} (Tiếng Anh→Tiếng Nhật)`);
    titleH3.textContent = titleH3.getAttribute(`data-${currentLanguage}`) || `Introduction Round ${roundNumber} (English→Japanese)`;
    
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'round-header-controls';
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-round-btn';
    removeBtn.setAttribute('data-en', 'Remove Round');
    removeBtn.setAttribute('data-es', 'Eliminar Ronda');
    removeBtn.setAttribute('data-fr', 'Supprimer une Ronde');
    removeBtn.setAttribute('data-ja', 'ラウンドを削除');
    removeBtn.setAttribute('data-zh', '删除轮次');
    removeBtn.setAttribute('data-id', 'Hapus Ronde');
    removeBtn.setAttribute('data-ko', '라운드 제거');
    removeBtn.setAttribute('data-vi', 'Xóa Vòng');
    removeBtn.textContent = removeBtn.getAttribute(`data-${currentLanguage}`) || 'Remove Round';
    removeBtn.onclick = (e) => {
        e.stopPropagation();
        removeJapaneseSpecificRound(roundNumber);
    };
    
    const collapseBtn = document.createElement('button');
    collapseBtn.className = 'collapse-btn';
    collapseBtn.textContent = '▼';
    
    controlsDiv.appendChild(removeBtn);
    controlsDiv.appendChild(collapseBtn);
    
    headerDiv.appendChild(titleH3);
    headerDiv.appendChild(controlsDiv);
    
    // Create round content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'custom-round-content';
    contentDiv.id = `japanese-round-content-${roundNumber}`;
    
    const descriptionP = document.createElement('p');
    descriptionP.setAttribute('data-en', 'Please select the words you\'d like to include in this round. In this mode, you\'ll see English words as questions and need to type Japanese characters as answers.');
    descriptionP.setAttribute('data-es', 'Por favor selecciona las palabras que quieres incluir en esta ronda. En este modo, verás palabras en inglés como preguntas y necesitarás escribir caracteres japoneses como respuestas.');
    descriptionP.setAttribute('data-fr', 'Veuillez sélectionner les mots que vous souhaitez inclure dans cette ronda. Dans ce mode, vous verrez des mots anglais comme questions et devrez taper des caractères japonais comme réponses.');
    descriptionP.setAttribute('data-ja', 'このラウンドに含めたい単語を選択してください。このモードでは、英語の単語が質問として表示され、日本語の文字を答えとして入力する必要があります。');
    descriptionP.setAttribute('data-zh', '请选择您想在此轮次中包含的单词。在此模式下，您将看到英语单词作为问题，需要输入日语字符作为答案。');
    descriptionP.setAttribute('data-id', 'Silakan pilih kata-kata yang ingin Anda sertakan dalam ronde ini. Dalam mode ini, Anda akan melihat kata-kata dalam bahasa Inggris sebagai pertanyaan dan perlu mengetik karakter Jepang sebagai jawaban.');
    descriptionP.setAttribute('data-ko', '이 라운드에 포함하고 싶은 단어들을 선택하세요. 이 모드에서는 영어 단어가 질문으로 표시되고 일본어 문자를 답으로 입력해야 합니다.');
    descriptionP.setAttribute('data-vi', 'Vui lòng chọn những từ bạn muốn bao gồm trong vòng này. Trong chế độ này, bạn sẽ thấy từ tiếng Anh làm câu hỏi và cần nhập ký tự tiếng Nhật làm câu trả lời.');
    descriptionP.textContent = descriptionP.getAttribute(`data-${currentLanguage}`) || 'Please select the words you\'d like to include in this round. In this mode, you\'ll see English words as questions and need to type Japanese characters as answers.';
    
    const wordGrid = document.createElement('div');
    wordGrid.className = 'word-selection-grid';
    wordGrid.id = `japanese-word-selection-${roundNumber}`;
    
    const customWordSection = document.createElement('div');
    customWordSection.className = 'custom-word-section';
    
    const addCustomWordBtn = document.createElement('button');
    addCustomWordBtn.className = 'add-custom-word-btn';
    addCustomWordBtn.setAttribute('data-en', 'Add Custom Word To Round');
    addCustomWordBtn.setAttribute('data-es', 'Agregar Palabra Personalizada a la Ronda');
    addCustomWordBtn.setAttribute('data-fr', 'Ajouter un Mot Personnalisé à la Ronde');
    addCustomWordBtn.setAttribute('data-ja', 'ラウンドにカスタム単語を追加');
    addCustomWordBtn.setAttribute('data-zh', '向轮次添加自定义单词');
    addCustomWordBtn.setAttribute('data-id', 'Tambah Kata Kustom ke Ronde');
    addCustomWordBtn.setAttribute('data-ko', '라운드에 사용자 정의 단어 추가');
    addCustomWordBtn.setAttribute('data-vi', 'Thêm Từ Tùy chỉnh vào Vòng');
    addCustomWordBtn.textContent = addCustomWordBtn.getAttribute(`data-${currentLanguage}`) || 'Add Custom Word To Round';
    addCustomWordBtn.onclick = () => addJapaneseCustomWordToRound(roundNumber);
    
    const customWordInputs = document.createElement('div');
    customWordInputs.className = 'custom-word-inputs hidden';
    
    const customWordInputsContainer = document.createElement('div');
    customWordInputsContainer.className = 'custom-word-inputs-container';
    
    customWordInputs.appendChild(customWordInputsContainer);
    customWordSection.appendChild(addCustomWordBtn);
    customWordSection.appendChild(customWordInputs);
    
    contentDiv.appendChild(descriptionP);
    contentDiv.appendChild(wordGrid);
    contentDiv.appendChild(customWordSection);
    
    // Assemble the round
    roundDiv.appendChild(headerDiv);
    roundDiv.appendChild(contentDiv);
    
    // Add to container
    container.appendChild(roundDiv);
    
    // Populate the word grid
    populateJapaneseWordSelectionGrid(roundNumber);
    
    // Set up custom word buttons for this round
    setupJapaneseCustomWordButtonsForRound(roundNumber);
    
    // Save the new structure
    saveJapaneseCustomRounds();
    
    console.log(`Japanese custom round ${roundNumber} added successfully`);
}

function populateJapaneseWordSelectionGrid(roundNumber) {
    console.log('Populating Japanese word selection grid for round:', roundNumber);
    
    const grid = document.getElementById(`japanese-word-selection-${roundNumber}`);
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
        sectionHeader.onclick = () => toggleJapaneseWordSection(roundNumber, roundIndex);
        
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
        collapseBtn.style.color = '#ffffff';
        collapseBtn.style.cursor = 'pointer';
        collapseBtn.style.fontSize = '0.8rem';
        collapseBtn.style.padding = '0';
        collapseBtn.style.marginLeft = 'auto';
        
        sectionHeader.appendChild(headerText);
        sectionHeader.appendChild(collapseBtn);
        
        // Create word selection grid for this section
        const wordGrid = document.createElement('div');
        wordGrid.className = 'word-grid';
        wordGrid.id = `japanese-word-grid-${roundNumber}-${roundIndex}`;
        
        // Add "Select All" checkbox for this section
        const selectAllContainer = document.createElement('div');
        selectAllContainer.className = 'select-all-container';
        
        const selectAllCheckbox = document.createElement('input');
        selectAllCheckbox.type = 'checkbox';
        selectAllCheckbox.className = 'select-all-checkbox';
        selectAllCheckbox.id = `japanese-select-all-${roundNumber}-${roundIndex}`;
        
        const selectAllLabel = document.createElement('label');
        selectAllLabel.setAttribute('for', `japanese-select-all-${roundNumber}-${roundIndex}`);
        selectAllLabel.setAttribute('data-en', 'Select All');
        selectAllLabel.setAttribute('data-es', 'Seleccionar Todo');
        selectAllLabel.setAttribute('data-fr', 'Tout Sélectionner');
        selectAllLabel.setAttribute('data-ja', 'すべて選択');
        selectAllLabel.setAttribute('data-zh', '全选');
        selectAllLabel.setAttribute('data-id', 'Pilih Semua');
        selectAllLabel.setAttribute('data-ko', '모두 선택');
        selectAllLabel.setAttribute('data-vi', 'Chọn Tất cả');
        selectAllLabel.textContent = selectAllLabel.getAttribute(`data-${currentLanguage}`) || 'Select All';
        
        selectAllContainer.appendChild(selectAllCheckbox);
        selectAllContainer.appendChild(selectAllLabel);
        selectAllContainer.className = 'select-all-item';
        
        // Add separator line
        selectAllContainer.style.borderBottom = '2px solid #ddd';
        selectAllContainer.style.marginBottom = '15px';
        selectAllContainer.style.paddingBottom = '10px';
        
        wordGrid.appendChild(selectAllContainer);
        
        // Add words to the grid
        wordGroup.forEach(word => {
            const wordContainer = document.createElement('div');
            wordContainer.className = 'word-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'word-checkbox';
            checkbox.id = `japanese-word-${roundNumber}-${roundIndex}-${word.japanese}`;
            checkbox.dataset.word = word.japanese;
            checkbox.dataset.round = roundNumber;
            checkbox.dataset.section = roundIndex;
            
            const label = document.createElement('label');
            label.setAttribute('for', `japanese-word-${roundNumber}-${roundIndex}-${word.japanese}`);
            // In Japanese custom mode, show English word as label (capitalized)
            label.textContent = capitalizeWords(word.english);
            
            wordContainer.appendChild(checkbox);
            wordContainer.appendChild(label);
            wordGrid.appendChild(wordContainer);
            
            // Add event listener for checkbox
            checkbox.addEventListener('change', () => {
                updateJapaneseSelectAllState(roundNumber, roundIndex);
                saveJapaneseCustomRounds();
            });
        });
        
        // Set up "Select All" functionality
        selectAllCheckbox.addEventListener('change', () => {
            const wordCheckboxes = wordGrid.querySelectorAll('.word-checkbox');
            wordCheckboxes.forEach(cb => {
                cb.checked = selectAllCheckbox.checked;
            });
            saveJapaneseCustomRounds();
        });
        
        // Add click handler for the select all container
        selectAllContainer.addEventListener('click', (e) => {
            if (e.target !== selectAllCheckbox) {
                selectAllCheckbox.checked = !selectAllCheckbox.checked;
                selectAllCheckbox.dispatchEvent(new Event('change'));
            }
        });
        
        sectionContainer.appendChild(sectionHeader);
        sectionContainer.appendChild(wordGrid);
        
        // Initially collapse all sections
        wordGrid.style.display = 'none';
        sectionContainer.classList.add('collapsed');
        collapseBtn.classList.add('rotated');
        
        grid.appendChild(sectionContainer);
    });
    
    console.log(`Japanese word selection grid populated for round ${roundNumber}`);
}

function toggleJapaneseWordSection(roundNumber, sectionIndex) {
    const grid = document.getElementById(`japanese-word-grid-${roundNumber}-${sectionIndex}`);
    const section = grid.parentElement;
    const button = section.querySelector('.collapse-btn');
    
    if (section.classList.contains('collapsed')) {
        section.classList.remove('collapsed');
        grid.style.display = 'block';
        button.textContent = '▼';
        button.classList.remove('rotated');
    } else {
        section.classList.add('collapsed');
        grid.style.display = 'none';
        button.textContent = '▲';
        button.classList.add('rotated');
    }
}

function updateJapaneseSelectAllState(roundNumber, sectionIndex) {
    const grid = document.getElementById(`japanese-word-grid-${roundNumber}-${sectionIndex}`);
    if (!grid) return;
    
    const selectAllCheckbox = grid.querySelector('.select-all-checkbox');
    const wordCheckboxes = grid.querySelectorAll('.word-checkbox');
    
    const checkedCount = Array.from(wordCheckboxes).filter(cb => cb.checked).length;
    const totalCount = wordCheckboxes.length;
    
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
}

function setupJapaneseCustomWordButtons() {
    console.log('Setting up Japanese custom word buttons');
    
    // This function sets up the global custom word functionality
    // Individual round setup is handled by setupJapaneseCustomWordButtonsForRound
}

function setupJapaneseCustomWordButtonsForRound(roundNumber) {
    console.log(`Setting up Japanese custom word buttons for round ${roundNumber}`);
    
    // Custom word functionality is already set up in addJapaneseCustomRound
    // This function can be used for additional setup if needed
}

function toggleJapaneseCustomRound(roundNumber) {
    const content = document.getElementById(`japanese-round-content-${roundNumber}`);
    const header = content.parentElement.querySelector('.custom-round-header');
    const button = header.querySelector('.collapse-btn');
    
    if (content.style.display === 'none' || !content.style.display) {
        content.style.display = 'block';
        button.textContent = '▼';
        header.classList.remove('collapsed');
    } else {
        content.style.display = 'none';
        button.textContent = '▲';
        header.classList.add('collapsed');
    }
}

function removeJapaneseCustomRound() {
    const container = document.getElementById('japanese-custom-rounds-container');
    const rounds = container.querySelectorAll('.custom-round');
    
    if (rounds.length > 1) {
        const lastRound = rounds[rounds.length - 1];
        lastRound.remove();
        
        // Renumber remaining rounds
        const remainingRounds = container.querySelectorAll('.custom-round');
        remainingRounds.forEach((round, index) => {
            const roundNumber = index + 1;
            round.setAttribute('data-round', roundNumber);
            
            // Update IDs and references
            const content = round.querySelector('.custom-round-content');
            const wordGrid = round.querySelector('.word-selection-grid');
            const title = round.querySelector('h3');
            
            content.id = `japanese-round-content-${roundNumber}`;
            wordGrid.id = `japanese-word-selection-${roundNumber}`;
            
            // Update title
            title.setAttribute('data-en', `Introduction Round ${roundNumber} (English→Japanese)`);
            title.setAttribute('data-es', `Ronda de Introducción ${roundNumber} (Inglés→Japonés)`);
            title.setAttribute('data-fr', `Ronde d'Introduction ${roundNumber} (Anglais→Japonais)`);
            title.setAttribute('data-ja', `導入ラウンド${roundNumber} (英語→日本語)`);
            title.setAttribute('data-zh', `介绍轮次${roundNumber} (英语→日语)`);
            title.setAttribute('data-id', `Ronde Pengenalan ${roundNumber} (Inggris→Jepang)`);
            title.setAttribute('data-ko', `소개 라운드 ${roundNumber} (영어→일본어)`);
            title.setAttribute('data-vi', `Vòng Giới thiệu ${roundNumber} (Tiếng Anh→Tiếng Nhật)`);
            title.textContent = title.getAttribute(`data-${currentLanguage}`) || `Introduction Round ${roundNumber} (English→Japanese)`;
            
            // Update onclick handlers
            const header = round.querySelector('.custom-round-header');
            header.onclick = () => toggleJapaneseCustomRound(roundNumber);
            
            // Update remove button onclick
            const removeBtn = round.querySelector('.remove-round-btn');
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                removeJapaneseSpecificRound(roundNumber);
            };
            
            // Update custom word button onclick
            const addCustomWordBtn = round.querySelector('.add-custom-word-btn');
            addCustomWordBtn.onclick = () => addJapaneseCustomWordToRound(roundNumber);
            
            // Update word grid IDs and references
            const roundWordGrid = round.querySelector('.word-selection-grid');
            roundWordGrid.id = `japanese-word-selection-${roundNumber}`;
            
            // Update section onclick handlers
            const sections = roundWordGrid.querySelectorAll('.word-section-container');
            sections.forEach((section, sectionIndex) => {
                const sectionGrid = section.querySelector('.word-grid');
                sectionGrid.id = `japanese-word-grid-${roundNumber}-${sectionIndex}`;
                
                const sectionHeader = section.querySelector('.word-section-header');
                sectionHeader.onclick = () => toggleJapaneseWordSection(roundNumber, sectionIndex);
                
                // Update select all checkbox IDs
                const selectAllCheckbox = section.querySelector('.select-all-checkbox');
                selectAllCheckbox.id = `japanese-select-all-${roundNumber}-${sectionIndex}`;
                
                const selectAllLabel = section.querySelector('label');
                selectAllLabel.setAttribute('for', `japanese-select-all-${roundNumber}-${sectionIndex}`);
                
                // Update word checkbox IDs and references
                const wordCheckboxes = section.querySelectorAll('.word-checkbox');
                wordCheckboxes.forEach((checkbox, wordIndex) => {
                    const word = checkbox.dataset.word;
                    checkbox.id = `japanese-word-${roundNumber}-${sectionIndex}-${word}`;
                    checkbox.dataset.round = roundNumber;
                    checkbox.dataset.section = sectionIndex;
                });
            });
        });
        
        saveJapaneseCustomRounds();
        console.log('Japanese custom round removed and remaining rounds renumbered');
    } else {
        console.log('Cannot remove the last round');
    }
}

function removeJapaneseSpecificRound(roundNumber) {
    console.log('Removing Japanese specific round:', roundNumber);
    
    const container = document.getElementById('japanese-custom-rounds-container');
    const roundToRemove = container.querySelector(`[data-round="${roundNumber}"]`);
    
    if (roundToRemove) {
        roundToRemove.remove();
        
        // Renumber remaining rounds
        const remainingRounds = container.querySelectorAll('.custom-round');
        remainingRounds.forEach((round, index) => {
            const newRoundNumber = index + 1;
            round.setAttribute('data-round', newRoundNumber);
            
            // Update IDs and references (same logic as removeJapaneseCustomRound)
            const content = round.querySelector('.custom-round-content');
            const wordGrid = round.querySelector('.word-selection-grid');
            const title = round.querySelector('h3');
            
            content.id = `japanese-round-content-${newRoundNumber}`;
            wordGrid.id = `japanese-word-selection-${newRoundNumber}`;
            
            // Update title
            title.setAttribute('data-en', `Introduction Round ${newRoundNumber} (English→Japanese)`);
            title.setAttribute('data-es', `Ronda de Introducción ${newRoundNumber} (Inglés→Japonés)`);
            title.setAttribute('data-fr', `Ronde d'Introduction ${newRoundNumber} (Anglais→Japonais)`);
            title.setAttribute('data-ja', `導入ラウンド${newRoundNumber} (英語→日本語)`);
            title.setAttribute('data-zh', `介绍轮次${newRoundNumber} (英语→日语)`);
            title.setAttribute('data-id', `Ronde Pengenalan ${newRoundNumber} (Inggris→Jepang)`);
            title.setAttribute('data-ko', `소개 라운드 ${newRoundNumber} (영어→일본어)`);
            title.setAttribute('data-vi', `Vòng Giới thiệu ${newRoundNumber} (Tiếng Anh→Tiếng Nhật)`);
            title.textContent = title.getAttribute(`data-${currentLanguage}`) || `Introduction Round ${newRoundNumber} (English→Japanese)`;
            
            // Update onclick handlers
            const header = round.querySelector('.custom-round-header');
            header.onclick = () => toggleJapaneseCustomRound(newRoundNumber);
            
            // Update remove button onclick
            const removeBtn = round.querySelector('.remove-round-btn');
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                removeJapaneseSpecificRound(newRoundNumber);
            };
            
            // Update custom word button onclick
            const addCustomWordBtn = round.querySelector('.add-custom-word-btn');
            addCustomWordBtn.onclick = () => addJapaneseCustomWordToRound(newRoundNumber);
            
            // Update word grid IDs and references
            const roundWordGrid = round.querySelector('.word-selection-grid');
            roundWordGrid.id = `japanese-word-selection-${newRoundNumber}`;
            
            // Update section onclick handlers
            const sections = roundWordGrid.querySelectorAll('.word-section-container');
            sections.forEach((section, sectionIndex) => {
                const sectionGrid = section.querySelector('.word-grid');
                sectionGrid.id = `japanese-word-grid-${newRoundNumber}-${sectionIndex}`;
                
                const sectionHeader = section.querySelector('.word-section-header');
                sectionHeader.onclick = () => toggleJapaneseWordSection(newRoundNumber, sectionIndex);
                
                // Update select all checkbox IDs
                const selectAllCheckbox = section.querySelector('.select-all-checkbox');
                selectAllCheckbox.id = `japanese-select-all-${newRoundNumber}-${sectionIndex}`;
                
                const selectAllLabel = section.querySelector('label');
                selectAllLabel.setAttribute('for', `japanese-select-all-${newRoundNumber}-${sectionIndex}`);
                
                // Update word checkbox IDs and references
                const wordCheckboxes = section.querySelectorAll('.word-checkbox');
                wordCheckboxes.forEach((checkbox, wordIndex) => {
                    const word = checkbox.dataset.word;
                    checkbox.id = `japanese-word-${newRoundNumber}-${sectionIndex}-${word}`;
                    checkbox.dataset.round = newRoundNumber;
                    checkbox.dataset.section = sectionIndex;
                });
            });
        });
        
        saveJapaneseCustomRounds();
        console.log(`Japanese specific round ${roundNumber} removed and remaining rounds renumbered`);
    }
}

function addJapaneseCustomWordToRound(roundNumber) {
    console.log('Adding Japanese custom word to round:', roundNumber);
    
    const round = document.querySelector(`#japanese-custom-rounds-container .custom-round[data-round="${roundNumber}"]`);
    if (!round) return;
    
    const customWordInputs = round.querySelector('.custom-word-inputs');
    const container = customWordInputs.querySelector('.custom-word-inputs-container');
    
    // Create custom word input row
    const inputRow = document.createElement('div');
    inputRow.className = 'custom-word-input-row';
    
    const japaneseInput = document.createElement('input');
    japaneseInput.type = 'text';
    japaneseInput.placeholder = 'Japanese characters';
    japaneseInput.className = 'custom-word-input japanese-input';
    
    const englishInput = document.createElement('input');
    englishInput.type = 'text';
    englishInput.placeholder = 'English word';
    englishInput.className = 'custom-word-input english-input';
    
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.className = 'remove-custom-word-btn';
    removeBtn.onclick = () => {
        inputRow.remove();
        saveJapaneseCustomRounds();
    };
    
    inputRow.appendChild(japaneseInput);
    inputRow.appendChild(englishInput);
    inputRow.appendChild(removeBtn);
    
    container.appendChild(inputRow);
    
    // Show the inputs
    customWordInputs.classList.remove('hidden');
    
    // Save the new structure
    saveJapaneseCustomRounds();
    
    console.log(`Japanese custom word input added to round ${roundNumber}`);
}

function saveJapaneseCustomRounds() {
    console.log('Saving Japanese custom rounds');
    
    try {
        const container = document.getElementById('japanese-custom-rounds-container');
        if (!container) {
            console.warn('Japanese custom rounds container not found');
            return;
        }
        
        const rounds = container.querySelectorAll('.custom-round');
        const customData = {
            rounds: [],
            noPracticeRounds: window.japaneseCustomModeNoPracticeRounds || false,
            timestamp: Date.now()
        };
        
        rounds.forEach((round, roundIndex) => {
            const roundNumber = roundIndex + 1;
            const roundData = {
                roundNumber: roundNumber,
                checkedWords: [],
                customWords: [],
                openSections: []
            };
            
            // Get checked words
            const wordCheckboxes = round.querySelectorAll('.word-checkbox:checked');
            wordCheckboxes.forEach(checkbox => {
                roundData.checkedWords.push({
                    word: checkbox.dataset.word,
                    section: parseInt(checkbox.dataset.section)
                });
            });
            
            // Get custom words
            const customWordRows = round.querySelectorAll('.custom-word-input-row');
            customWordRows.forEach(row => {
                const japaneseInput = row.querySelector('.japanese-input');
                const englishInput = row.querySelector('.english-input');
                
                if (japaneseInput.value.trim() && englishInput.value.trim()) {
                    roundData.customWords.push({
                        japanese: japaneseInput.value.trim(),
                        english: englishInput.value.trim()
                    });
                }
            });
            
            // Get open sections
            const sections = round.querySelectorAll('.word-section-container');
            sections.forEach((section, sectionIndex) => {
                if (!section.classList.contains('collapsed')) {
                    roundData.openSections.push(sectionIndex);
                }
            });
            
            customData.rounds.push(roundData);
        });
        
        // Save to localStorage
        const storageKey = 'japaneseCustomRounds';
        localStorage.setItem(storageKey, JSON.stringify(customData));
        
        console.log('Japanese custom rounds saved successfully:', customData);
        
        // Also save the word pools for game play
        const wordPools = [];
        customData.rounds.forEach(roundData => {
            const roundWords = [];
            
            // Add checked words from word pools
            roundData.checkedWords.forEach(checkedWord => {
                const wordGroup = getAllWordsByRound()[checkedWord.section];
                const word = wordGroup.find(w => w.japanese === checkedWord.word);
                if (word) {
                    roundWords.push(word);
                }
            });
            
            // Add custom words
            roundData.customWords.forEach(customWord => {
                roundWords.push(customWord);
            });
            
            wordPools.push(roundWords);
        });
        
        window.japaneseCustomWordPools = wordPools;
        console.log('Japanese custom word pools created:', wordPools);
        
    } catch (error) {
        console.error('Error saving Japanese custom rounds:', error);
    }
}

function loadJapaneseCustomRounds() {
    console.log('Loading Japanese custom rounds');
    
    try {
        const storageKey = 'japaneseCustomRounds';
        const savedData = localStorage.getItem(storageKey);
        
        if (!savedData) {
            console.log('No saved Japanese custom rounds found');
            return false;
        }
        
        const customData = JSON.parse(savedData);
        
        // Validate data structure
        if (!customData.rounds || !Array.isArray(customData.rounds)) {
            console.warn('Invalid Japanese custom rounds data structure');
            return false;
        }
        
        // Check data age (older than 30 days)
        const dataAge = Date.now() - customData.timestamp;
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        if (dataAge > maxAge) {
            console.warn('Japanese custom rounds data is too old, clearing');
            localStorage.removeItem(storageKey);
            return false;
        }
        
        // Load settings
        if (typeof customData.noPracticeRounds === 'boolean') {
            window.japaneseCustomModeNoPracticeRounds = customData.noPracticeRounds;
            if (japaneseDisablePracticeRoundsToggle) {
                japaneseDisablePracticeRoundsToggle.checked = customData.noPracticeRounds;
            }
        }
        
        // Load word pools for game play
        const wordPools = [];
        customData.rounds.forEach(roundData => {
            const roundWords = [];
            
            // Add checked words from word pools
            roundData.checkedWords.forEach(checkedWord => {
                const wordGroup = getAllWordsByRound()[checkedWord.section];
                const word = wordGroup.find(w => w.japanese === checkedWord.word);
                if (word) {
                    roundWords.push(word);
                }
            });
            
            // Add custom words
            roundData.customWords.forEach(customWord => {
                roundWords.push(customWord);
            });
            
            wordPools.push(roundWords);
        });
        
        window.japaneseCustomWordPools = wordPools;
        console.log('Japanese custom word pools loaded:', wordPools);
        
        return true;
        
    } catch (error) {
        console.error('Error loading Japanese custom rounds:', error);
        return false;
    }
}

function restoreJapaneseCustomRoundsState() {
    console.log('Restoring Japanese custom rounds state');
    
    try {
        const storageKey = 'japaneseCustomRounds';
        const savedData = localStorage.getItem(storageKey);
        
        if (!savedData) {
            console.log('No saved Japanese custom rounds state to restore');
            return;
        }
        
        const customData = JSON.parse(savedData);
        
        customData.rounds.forEach(roundData => {
            const round = document.querySelector(`#japanese-custom-rounds-container .custom-round[data-round="${roundData.roundNumber}"]`);
            if (!round) return;
            
            // Restore checked words
            roundData.checkedWords.forEach(checkedWord => {
                const checkbox = round.querySelector(`#japanese-word-${roundData.roundNumber}-${checkedWord.section}-${checkedWord.word}`);
                if (checkbox) {
                    checkbox.checked = true;
                    updateJapaneseSelectAllState(roundData.roundNumber, checkedWord.section);
                }
            });
            
            // Restore custom words
            roundData.customWords.forEach(customWord => {
                addJapaneseCustomWordToRound(roundData.roundNumber);
                
                // Set the values
                const customWordRows = round.querySelectorAll('.custom-word-input-row');
                const lastRow = customWordRows[customWordRows.length - 1];
                if (lastRow) {
                    const japaneseInput = lastRow.querySelector('.japanese-input');
                    const englishInput = lastRow.querySelector('.english-input');
                    
                    if (japaneseInput && englishInput) {
                        japaneseInput.value = customWord.japanese;
                        englishInput.value = customWord.english;
                    }
                }
            });
            
            // Restore open sections
            roundData.openSections.forEach(sectionIndex => {
                const section = round.querySelector(`.word-section-container:nth-child(${sectionIndex + 1})`);
                if (section) {
                    const grid = section.querySelector('.word-grid');
                    const button = section.querySelector('.collapse-btn');
                    
                    if (grid && button) {
                        grid.style.display = 'block';
                        section.classList.remove('collapsed');
                        button.textContent = '▼';
                        button.classList.remove('rotated');
                    }
                }
            });
        });
        
        console.log('Japanese custom rounds state restored successfully');
        
    } catch (error) {
        console.error('Error restoring Japanese custom rounds state:', error);
    }
}

function startJapaneseCustomRun() {
    console.log('Starting Japanese custom run');
    
    // Save current state before starting
    saveJapaneseCustomRounds();
    
    // Check if we have any rounds with words
    if (!window.japaneseCustomWordPools || window.japaneseCustomWordPools.length === 0) {
        console.warn('No Japanese custom rounds with words found');
        return;
    }
    
    // Reset game state for Japanese custom mode
    currentPage = 'game';
    currentRound = 1;
    currentPhase = 'learning';
    currentQuestionIndex = 0;
    currentWord = null;
    correctAnswers = {};
    questionQueue = [];
    allLearnedWords = [];
    wordsWithPendingPoints = new Set();
    currentQuestionFailed = false;
    eliminationWords = [];
    
    // Set Japanese custom mode flags
    window.mirroredMode = true;
    window.japaneseCustomModeEnabled = true;
    
    // Don't clear the word entry flag when starting a Japanese custom game
    // This allows users to go back to word entry selection from script pages
    
    // Show game page
    showPage('game');
    
    // Show hiragana keyboard for Japanese custom mode
    showHiraganaKeyboard();
    
    // Initialize the first round
    initializeJapaneseCustomRound();
}

function initializeJapaneseCustomRound() {
    console.log('Initializing Japanese custom round:', currentRound);
    
    // Get words for current round
    const roundWords = getCurrentJapaneseCustomRoundWords();
    
    if (currentPhase === 'learning') {
        // Learning phase - show English words, expect Japanese answers
        currentQuestionIndex = 0;
        showJapaneseCustomLearningQuestion();
    } else if (currentPhase === 'elimination') {
        // Elimination phase - show English words, expect Japanese answers
        eliminationWords = [...roundWords];
        showJapaneseCustomEliminationQuestion();
    } else {
        // Repeating phase - show English words, expect Japanese answers
        questionQueue = [...roundWords];
        shuffleArray(questionQueue);
        showJapaneseCustomRepeatingQuestion();
    }
    
    updateProgress();
    updatePhaseLabel();
    updateNextRoundButton();
}

function getCurrentJapaneseCustomRoundWords() {
    if (!window.japaneseCustomWordPools || !window.japaneseCustomWordPools[currentRound - 1]) {
        return [];
    }
    return window.japaneseCustomWordPools[currentRound - 1];
}

function showJapaneseCustomLearningQuestion() {
    const roundWords = getCurrentJapaneseCustomRoundWords();
    if (currentQuestionIndex >= roundWords.length) {
        // Learning phase complete, move to elimination phase
        currentPhase = 'elimination';
        eliminationWords = [...roundWords];
        currentQuestionIndex = 0;
        showJapaneseCustomEliminationQuestion();
        return;
    }
    
    const word = roundWords[currentQuestionIndex];
    
    // Use displayWordWithSound to trigger auto-play and update answer display
    displayWordWithSound(word);
    
    // Set currentWord for answer validation
    currentWord = word;
    
    // In Japanese custom mode, show Japanese answer
    correctAnswerDisplay.textContent = word.japanese;
    correctAnswerDisplay.classList.remove('hidden');
    
    // Update phase label for Japanese custom mode
    updatePhaseLabel();
    
    // Clear input and focus
    answerInput.value = '';
    answerInput.focus();
    
    // Update progress
    updateProgress();
}

function showJapaneseCustomEliminationQuestion() {
    const roundWords = getCurrentJapaneseCustomRoundWords();
    if (eliminationWords.length === 0) {
        // Elimination phase complete, move to repeating phase
        currentPhase = 'repeating';
        questionQueue = [...roundWords];
        shuffleArray(questionQueue);
        currentQuestionIndex = 0;
        showJapaneseCustomRepeatingQuestion();
        return;
    }
    
    const word = eliminationWords[currentQuestionIndex];
    
    // Use displayWordWithSound to trigger auto-play and update answer display
    displayWordWithSound(word);
    
    // Set currentWord for answer validation
    currentWord = word;
    
    // In Japanese custom mode, hide answer
    correctAnswerDisplay.classList.add('hidden');
    
    // Update phase label for Japanese custom mode
    updatePhaseLabel();
    
    // Clear input and focus
    answerInput.value = '';
    answerInput.focus();
    
    // Update progress
    updateProgress();
}

function showJapaneseCustomRepeatingQuestion() {
    const roundWords = getCurrentJapaneseCustomRoundWords();
    if (questionQueue.length === 0) {
        // Refill queue if empty
        for (let i = 0; i < 21; i++) {
            const randomWord = roundWords[Math.floor(Math.random() * roundWords.length)];
            questionQueue.push(randomWord);
            console.log('Added word to Japanese custom queue:', randomWord);
        }
    }
    
    // Filter out words that have already been answered correctly 3 times
    questionQueue = questionQueue.filter(word => (correctAnswers[word.japanese] || 0) < 3);
    
    // If queue is empty after filtering, refill it
    if (questionQueue.length === 0) {
        for (let i = 0; i < 21; i++) {
            const randomWord = roundWords[Math.floor(Math.random() * roundWords.length)];
            questionQueue.push(randomWord);
        }
        // Filter again
        questionQueue = questionQueue.filter(word => (correctAnswers[word.japanese] || 0) < 3);
    }
    
    // Check if all words have been answered correctly 3 times
    if (questionQueue.length === 0) {
        // All words have been answered correctly 3 times
        console.log('All words have been answered correctly 3 times');
        updateNextRoundButton();
        return;
    }
    
    const word = questionQueue[0];
    
    // Use displayWordWithSound to trigger auto-play and update answer display
    displayWordWithSound(word);
    
    // Set currentWord for answer validation
    currentWord = word;
    
    // In Japanese custom mode, hide answer
    correctAnswerDisplay.classList.add('hidden');
    
    console.log('Showing Japanese custom repeating question:', word);
    
    // Update phase label for Japanese custom mode
    updatePhaseLabel();
    
    // Clear input and focus
    answerInput.value = '';
    answerInput.focus();
    
    // Update progress
    updateProgress();
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

// Mobile device detection
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.innerWidth <= 768) || 
           ('ontouchstart' in window);
}

// Hiragana Keyboard Functionality
function setupHiraganaKeyboard() {
    console.log('Setting up hiragana keyboard');
    
    const hiraganaKeyboard = document.getElementById('hiragana-keyboard');
    if (!hiraganaKeyboard) {
        console.error('Hiragana keyboard not found');
        return;
    }
    
    // Add click event listeners to all hiragana keys
    const hiraganaKeys = hiraganaKeyboard.querySelectorAll('.hiragana-key');
    hiraganaKeys.forEach(key => {
        key.addEventListener('click', () => {
            const character = key.getAttribute('data-char');
            if (character) {
                insertHiraganaCharacter(character);
            }
        });
    });
    
    console.log('Hiragana keyboard setup complete');
}

function insertHiraganaCharacter(character) {
    const answerInput = document.getElementById('answer-input');
    if (!answerInput) {
        console.error('Answer input not found');
        return;
    }
    
    // Insert the character at the current cursor position
    const cursorPos = answerInput.selectionStart;
    const currentValue = answerInput.value;
    const newValue = currentValue.slice(0, cursorPos) + character + currentValue.slice(cursorPos);
    
    answerInput.value = newValue;
    
    // Set cursor position after the inserted character
    answerInput.selectionStart = answerInput.selectionEnd = cursorPos + character.length;
    
    // Only focus the input on desktop devices, not on mobile
    // This prevents the mobile keyboard from popping up when tapping hiragana keys
    if (!isMobileDevice()) {
        answerInput.focus();
    }
    
    // Trigger input event to update validation
    answerInput.dispatchEvent(new Event('input'));
    
    console.log('Inserted hiragana character:', character);
}

function showHiraganaKeyboard() {
    const hiraganaKeyboard = document.getElementById('hiragana-keyboard');
    if (hiraganaKeyboard) {
        hiraganaKeyboard.classList.remove('hidden');
        console.log('Hiragana keyboard shown');
    }
}

function hideHiraganaKeyboard() {
    const hiraganaKeyboard = document.getElementById('hiragana-keyboard');
    if (hiraganaKeyboard) {
        hiraganaKeyboard.classList.add('hidden');
        console.log('Hiragana keyboard hidden');
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    showPage('start');
    initializeSettings();
    detectBrowserLanguage();
    
    // Initialize text-to-speech system
    initializeTTS();
    
    // Initialize sound system
    setupSoundButton();
    setupAutoPlayToggle();
    
    // Initialize hiragana keyboard
    setupHiraganaKeyboard();
    
    // Initialize AdSense after page load
    setTimeout(() => {
        console.log('=== Initializing AdSense ===');
        initializeAdSense();
    }, 2000);
    
    // Force reload ads after a longer delay to ensure everything is loaded
    setTimeout(() => {
        console.log('=== FORCE RELOADING ALL ADS ===');
        showAdContainers();
        if (typeof adsbygoogle !== 'undefined') {
            adsbygoogle.push({});
            console.log('✅ Force reloaded all AdSense ads');
        } else {
            console.warn('⚠️ AdSense still not available, trying manual script injection...');
            
            // Try to manually inject the AdSense script
            const script = document.createElement('script');
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9490674375260891';
            script.async = true;
            script.crossOrigin = 'anonymous';
            script.onload = () => {
                console.log('✅ Manual AdSense script injection successful');
                
                if (typeof adsbygoogle !== 'undefined') {
                    adsbygoogle.push({});
                    console.log('✅ Ads pushed after manual injection');
                }
            };
            script.onerror = (error) => {
                console.error('❌ Manual AdSense script injection failed:', error);
            };
            document.head.appendChild(script);
        }
    }, 5000);
    
    // Log ad container status (console only, no visual debugging)
    setTimeout(() => {
        console.log('=== CHECKING AD CONTAINERS ===');
        const adContainers = document.querySelectorAll('.ad-container');
        adContainers.forEach((container, index) => {
            console.log(`Ad Container ${index + 1}: ${container.id || 'no-id'}`);
            console.log('Display:', window.getComputedStyle(container).display);
            console.log('Visibility:', window.getComputedStyle(container).visibility);
            console.log('Opacity:', window.getComputedStyle(container).opacity);
        });
    }, 3000);
    
    // Load cookie consent preferences and set initial script states
    loadCookieConsent();
    
    // No cookie consent popup - ads are always enabled
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
    console.log('Changing language from', currentLanguage, 'to', lang);
    currentLanguage = lang;
    saveSettings();
    updateLanguageButtons();
    updateAllText();
    console.log('Language changed to:', lang, 'and saved');
    
    // Verify the save worked
    const savedSettings = loadFromLocalStorage(STORAGE_KEYS.SETTINGS, null);
    console.log('Verified saved settings:', savedSettings);
}

function updateLanguageButtons() {
    languageButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === currentLanguage) {
            btn.classList.add('active');
        }
    });
}

function updateEnterWordsButton() {
    const enterWordsBtn = document.getElementById('enter-english-words-btn');
    if (enterWordsBtn) {
        const languageNames = {
            'en': { 
                'en': 'English', 
                'es': 'Inglés', 
                'fr': 'Anglais', 
                'ja': '英語', 
                'zh': '英语', 
                'id': 'Bahasa Inggris', 
                'ko': '영어', 
                'vi': 'Tiếng Anh' 
            },
            'es': { 
                'en': 'Spanish', 
                'es': 'Español', 
                'fr': 'Espagnol', 
                'ja': 'スペイン語', 
                'zh': '西班牙语', 
                'id': 'Bahasa Spanyol', 
                'ko': '스페인어', 
                'vi': 'Tiếng Tây Ban Nha' 
            },
            'fr': { 
                'en': 'French', 
                'es': 'Francés', 
                'fr': 'Français', 
                'ja': 'フランス語', 
                'zh': '法语', 
                'id': 'Bahasa Prancis', 
                'ko': '프랑스어', 
                'vi': 'Tiếng Pháp' 
            },
            'ja': { 
                'en': 'Japanese', 
                'es': 'Japonés', 
                'fr': 'Japonais', 
                'ja': '日本語', 
                'zh': '日语', 
                'id': 'Bahasa Jepang', 
                'ko': '일본어', 
                'vi': 'Tiếng Nhật' 
            },
            'zh': { 
                'en': 'Chinese', 
                'es': 'Chino', 
                'fr': 'Chinois', 
                'ja': '中国語', 
                'zh': '中文', 
                'id': 'Bahasa Tiongkok', 
                'ko': '중국어', 
                'vi': 'Tiếng Trung' 
            },
            'id': { 
                'en': 'Indonesian', 
                'es': 'Indonesio', 
                'fr': 'Indonésien', 
                'ja': 'インドネシア語', 
                'zh': '印尼语', 
                'id': 'Bahasa Indonesia', 
                'ko': '인도네시아어', 
                'vi': 'Tiếng Indonesia' 
            },
            'ko': { 
                'en': 'Korean', 
                'es': 'Coreano', 
                'fr': 'Coréen', 
                'ja': '韓国語', 
                'zh': '韩语', 
                'id': 'Bahasa Korea', 
                'ko': '한국어', 
                'vi': 'Tiếng Hàn' 
            },
            'vi': { 
                'en': 'Vietnamese', 
                'es': 'Vietnamita', 
                'fr': 'Vietnamien', 
                'ja': 'ベトナム語', 
                'zh': '越南语', 
                'id': 'Bahasa Vietnam', 
                'ko': '베트남어', 
                'vi': 'Tiếng Việt' 
            }
        };
        
        const buttonTextTemplates = {
            'en': 'Enter {language} Words',
            'es': 'Ingresar Palabras en {language}',
            'fr': 'Entrer des Mots en {language}',
            'ja': '{language}の単語を入力',
            'zh': '输入{language}单词',
            'id': 'Masukkan Kata-kata dalam {language}',
            'ko': '{language} 단어 입력',
            'vi': 'Nhập Từ {language}'
        };
        
        const currentLangName = languageNames[currentLanguage][currentLanguage];
        const template = buttonTextTemplates[currentLanguage];
        const buttonText = template.replace('{language}', currentLangName);
        
        enterWordsBtn.textContent = buttonText;
    }
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
    
    // Update the "Enter English Words" button to show current language
    updateEnterWordsButton();
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
    
    // Update the "Enter English Words" button to show current language
    updateEnterWordsButton();
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
        if (window.mirroredMode) {
            // In mirrored mode, show Japanese characters without capitalization
            correctAnswerDisplay.textContent = correctAnswer;
        } else {
            // In normal mode, capitalize the answer
            correctAnswerDisplay.textContent = capitalizeWords(correctAnswer);
        }
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
    if (window.mirroredMode) {
        if (window.japaneseCustomModeEnabled) {
            // Japanese custom mode - show "Back to Japanese Custom Mode"
            backToScriptBtn.setAttribute('data-en', '← Back to Japanese Custom Mode');
            backToScriptBtn.setAttribute('data-es', '← Volver al Modo Personalizado Japonés');
            backToScriptBtn.setAttribute('data-fr', '← Retour au Mode Personnalisé Japonais');
            backToScriptBtn.setAttribute('data-ja', '← 日本語カスタムモードに戻る');
            backToScriptBtn.setAttribute('data-zh', '← 返回日语自定义模式');
            backToScriptBtn.setAttribute('data-id', '← Kembali ke Mode Kustom Jepang');
            backToScriptBtn.setAttribute('data-ko', '← 일본어 맞춤형 모드로 돌아가기');
            backToScriptBtn.setAttribute('data-vi', '← Quay lại Chế độ Tùy chỉnh Tiếng Nhật');
            backToScriptBtn.textContent = backToScriptBtn.getAttribute(`data-${currentLanguage}`);
        } else {
            // Mirrored brute force mode - show "Back to Japanese Script Selection"
            backToScriptBtn.setAttribute('data-en', '← Back to Japanese Script Selection');
            backToScriptBtn.setAttribute('data-es', '← Volver a Selección de Escritura Japonesa');
            backToScriptBtn.setAttribute('data-fr', '← Retour à la Sélection d\'Écriture Japonaise');
            backToScriptBtn.setAttribute('data-ja', '← 日本語文字選択に戻る');
            backToScriptBtn.setAttribute('data-zh', '← 返回日语文字选择');
            backToScriptBtn.setAttribute('data-id', '← Kembali ke Pemilihan Skrip Jepang');
            backToScriptBtn.setAttribute('data-ko', '← 일본어 문자 선택으로 돌아가기');
            backToScriptBtn.setAttribute('data-vi', '← Quay lại Lựa chọn Kịch bản Tiếng Nhật');
            backToScriptBtn.textContent = backToScriptBtn.getAttribute(`data-${currentLanguage}`);
        }
    } else if (window.customModeEnabled) {
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
    // Only detect browser language if no language has been saved yet
    const savedSettings = loadFromLocalStorage(STORAGE_KEYS.SETTINGS, null);
    if (savedSettings && savedSettings.language) {
        console.log('Language already saved, skipping browser detection');
        return;
    }
    
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0];
    
    // Check if browser language is supported
    if (['en', 'es', 'fr', 'ja', 'zh', 'id', 'ko', 'vi'].includes(langCode)) {
        console.log('Detecting browser language:', langCode);
        currentLanguage = langCode;
        // Save using the proper settings system instead of direct localStorage
        saveSettings();
        updateLanguageButtons();
        updateAllText();
    }
}

// Text-to-Speech Functions
let speechSynthesis = null;
let japaneseVoice = null;

// Initialize text-to-speech system
function initializeTTS() {
    if ('speechSynthesis' in window) {
        speechSynthesis = window.speechSynthesis;
        
        // Wait for voices to load
        speechSynthesis.onvoiceschanged = () => {
            loadJapaneseVoice();
        };
        
        // Load voices immediately if they're already available
        loadJapaneseVoice();
        
        // Set up periodic health checks to ensure TTS stays working
        setInterval(() => {
            if (speechSynthesis && japaneseVoice) {
                const voices = speechSynthesis.getVoices();
                const voiceStillValid = voices.some(v => v === japaneseVoice);
                if (!voiceStillValid) {
                    console.log('TTS voice became invalid, reinitializing...');
                    loadJapaneseVoice();
                }
            }
        }, 30000); // Check every 30 seconds
        
        console.log('Text-to-speech system initialized');
    } else {
        console.warn('Speech synthesis not supported in this browser');
    }
}

// Load the best available Japanese voice
function loadJapaneseVoice() {
    if (!speechSynthesis) return;
    
    const voices = speechSynthesis.getVoices();
    console.log('Available voices:', voices.length);
    
    // Priority order for Japanese voices
    const japaneseVoicePriorities = [
        { lang: 'ja-JP', name: 'Google 日本語' },
        { lang: 'ja-JP', name: 'Microsoft Nanami' },
        { lang: 'ja-JP', name: 'Microsoft Sayaka' },
        { lang: 'ja-JP', name: 'Apple Kyoko' },
        { lang: 'ja-JP', name: 'Apple Otoya' },
        { lang: 'ja-JP', name: 'Google 日本語 (ja-JP)' },
        { lang: 'ja-JP', name: 'Microsoft Haruka' },
        { lang: 'ja-JP', name: 'Microsoft Ichiro' }
    ];
    
    // Try to find the best Japanese voice
    for (const priority of japaneseVoicePriorities) {
        const voice = voices.find(v => 
            v.lang === priority.lang && v.name.includes(priority.name.split(' ')[1])
        );
        if (voice) {
            japaneseVoice = voice;
            console.log('Selected Japanese voice:', voice.name, voice.lang);
            return;
        }
    }
    
    // Fallback: find any Japanese voice
    const fallbackVoice = voices.find(v => v.lang.startsWith('ja'));
    if (fallbackVoice) {
        japaneseVoice = fallbackVoice;
        console.log('Selected fallback Japanese voice:', fallbackVoice.name, fallbackVoice.lang);
        return;
    }
    
    // Last resort: find any voice that might work
    const anyVoice = voices.find(v => v.lang.includes('ja') || v.lang.includes('JP'));
    if (anyVoice) {
        japaneseVoice = anyVoice;
        console.log('Selected alternative voice:', anyVoice.name, anyVoice.lang);
        return;
    }
    
    console.warn('No suitable Japanese voice found');
}

// Enhanced text-to-speech function for Japanese
function speakJapaneseText(text, options = {}) {
    if (!speechSynthesis || !japaneseVoice) {
        console.warn('Text-to-speech not available');
        return false;
    }
    
    // Stop any currently speaking
    speechSynthesis.cancel();
    
    // Preprocess Japanese text for better pronunciation
    const processedText = preprocessJapaneseText(text);
    
    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(processedText);
    
    // Configure for Japanese pronunciation
    utterance.voice = japaneseVoice;
    utterance.lang = 'ja-JP';
    utterance.rate = options.rate || 0.7; // Slower for better pronunciation
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;
    
    // Add event handlers
    utterance.onstart = () => {
        console.log('Speaking Japanese text:', processedText);
        if (soundBtn) {
            soundBtn.disabled = true;
            soundBtn.style.opacity = '0.5';
            soundBtn.textContent = 'Speaking...';
        }
    };
    
    utterance.onend = () => {
        console.log('Finished speaking');
        if (soundBtn) {
            soundBtn.disabled = false;
            soundBtn.style.opacity = '1';
            soundBtn.textContent = 'Play Sound';
        }
    };
    
    utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        if (soundBtn) {
            soundBtn.disabled = false;
            soundBtn.style.opacity = '1';
            soundBtn.textContent = 'Play Sound';
        }
    };
    
    // Speak the text
    speechSynthesis.speak(utterance);
    return true;
}

// Preprocess Japanese text for better TTS pronunciation
function preprocessJapaneseText(text) {
    if (!text) return text;
    
    let processed = text.trim();
    
    // Remove any non-Japanese characters that might interfere with pronunciation
    // Keep only Hiragana, Katakana, Kanji, and basic punctuation
    processed = processed.replace(/[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3000-\u303F\uFF00-\uFFEF\u0020-\u007F]/g, '');
    
    // Normalize spacing
    processed = processed.replace(/\s+/g, ' ').trim();
    
    // Add slight pauses for better pronunciation of compound words
    // This helps TTS engines break down longer words
    if (processed.length > 4) {
        // Add small pauses between characters for longer words
        processed = processed.split('').join(' ');
    }
    
    return processed;
}

// Fallback beep sound for when TTS is not available
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
    console.log('playWordSound called with word:', word);
    console.log('Word type:', typeof word);
    console.log('Word value:', word);
    
    // Check if sound is enabled
    if (!word) {
        console.warn('No word provided to playWordSound');
        return;
    }
    
    // Check TTS system health first
    if (!checkTTSSystemHealth()) {
        console.warn('TTS system not healthy, falling back to beep');
        const frequency = getWordAudioFrequency(word);
        createBeepSound(frequency, 300);
        return;
    }
    
    // Try to use text-to-speech first
    if (speechSynthesis && japaneseVoice) {
        console.log('TTS available - speechSynthesis:', !!speechSynthesis, 'japaneseVoice:', !!japaneseVoice);
        
        // Extract Japanese text from the word
        let japaneseText = '';
        
        if (typeof word === 'string') {
            // If word is a string, use it directly
            japaneseText = word;
        } else if (word.japanese) {
            // If word is an object with japanese property
            japaneseText = word.japanese;
        } else {
            console.warn('Could not extract Japanese text from word:', word);
            return;
        }
        
        // Clean the text (remove any non-Japanese characters that might interfere)
        japaneseText = japaneseText.trim();
        
        if (japaneseText) {
            console.log('Playing TTS for Japanese text:', japaneseText);
            
            // Try to speak the Japanese text
            const success = speakJapaneseText(japaneseText, {
                rate: 0.7, // Slower for better pronunciation
                pitch: 1.0,
                volume: 1.0
            });
            
            if (success) {
                console.log('TTS playback started successfully');
                return; // TTS worked, don't fall back to beep
            } else {
                console.warn('TTS playback failed');
            }
        }
    } else {
        console.log('TTS not available - speechSynthesis:', !!speechSynthesis, 'japaneseVoice:', !!japaneseVoice);
    }
    
    // Fallback to beep sound if TTS is not available or fails
    console.log('Falling back to beep sound');
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
            console.log('Sound button clicked - currentWord:', currentWord, 'soundBtn.disabled:', soundBtn.disabled);
            if (currentWord && !soundBtn.disabled) {
                // Try to play the Japanese pronunciation
                console.log('Playing sound for current word:', currentWord.japanese);
                playWordSound(currentWord.japanese);
            } else {
                console.warn('Cannot play sound - currentWord:', currentWord, 'disabled:', soundBtn.disabled);
            }
        });
        
        // Update button title and appearance based on TTS availability
        if (speechSynthesis && japaneseVoice) {
            soundBtn.title = 'Play Japanese pronunciation';
            soundBtn.classList.add('tts-available');
            soundBtn.classList.remove('tts-unavailable');
        } else {
            soundBtn.title = 'Play sound (TTS not available)';
            soundBtn.classList.remove('tts-available');
            soundBtn.classList.add('tts-unavailable');
        }
        
        // Update button state based on current word availability
        if (currentWord && currentWord.japanese) {
            soundBtn.disabled = false;
            soundBtn.style.opacity = '1';
        } else {
            soundBtn.disabled = true;
            soundBtn.style.opacity = '0.5';
        }
    }
}

function setupAutoPlayToggle() {
    if (autoPlayToggle) {
        // Set initial state based on current autoPlaySound value
        autoPlayToggle.checked = autoPlaySound;
        console.log('Auto-play toggle initialized to:', autoPlaySound);
        
        autoPlayToggle.addEventListener('change', () => {
            autoPlaySound = autoPlayToggle.checked;
            console.log('Auto-play toggle changed to:', autoPlaySound);
            saveSettings();
        });
    }
}

function displayWordWithSound(word) {
    console.log('displayWordWithSound called with word:', word);
    
    // Validate word object
    if (!word || !word.japanese) {
        console.error('Invalid word object passed to displayWordWithSound:', word);
        return;
    }
    
    // Update the display
    if (window.mirroredMode) {
        // In mirrored mode, show English word (capitalized)
        japaneseWord.textContent = capitalizeWords(word.english);
    } else {
        // In normal mode, show Japanese word
        japaneseWord.textContent = word.japanese;
    }
    currentWord = word;
    
    // Also update the global currentWord for consistency
    window.currentWord = word;
    
    // Handle sound button state and auto-play
    setTimeout(() => {
        // Update sound button state
        updateSoundButtonState();
        
        // Auto-play if enabled
        if (autoPlaySound) {
            if (window.mirroredMode) {
                console.log('Auto-play enabled, playing sound for Japanese word in mirrored mode:', word.japanese);
                console.log('Word object in mirrored mode:', word);
                console.log('Japanese text to play:', word.japanese);
                // In mirrored mode, play the Japanese pronunciation even though we show English
                playWordSound(word.japanese);
            } else {
                console.log('Auto-play enabled, playing sound for:', word.japanese);
                playWordSound(word.japanese);
            }
        } else {
            console.log('Auto-play disabled, not playing sound');
        }
    }, 100); // Small delay to ensure DOM is updated
}

// Custom Mode Functions
function initializeCustomMode() {
    // Try to load saved custom rounds first
    const loaded = loadCustomRounds();
    
    if (!loaded) {
        // If no saved data, automatically add round 1 and open it
        addCustomRound();
        
        // Open the first round dropdown
        const firstRound = document.querySelector('.custom-round[data-round="1"]');
        if (firstRound) {
            const roundContent = firstRound.querySelector('.custom-round-content');
            const collapseBtn = firstRound.querySelector('.collapse-btn');
            if (roundContent && collapseBtn) {
                roundContent.style.display = 'block';
                collapseBtn.textContent = '▼';
                collapseBtn.style.transform = 'rotate(180deg)';
            }
        }
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
        let isManualToggle = false;
        const updateSelectAllState = () => {
            if (isManualToggle) return; // Skip if this is a manual toggle
            
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
                console.log('Select All item clicked, toggling checkbox from', selectAllCheckbox.checked, 'to', !selectAllCheckbox.checked);
                isManualToggle = true;
                selectAllCheckbox.checked = !selectAllCheckbox.checked;
                // Trigger the change event manually
                selectAllCheckbox.dispatchEvent(new Event('change'));
                // Reset the flag after a short delay
                setTimeout(() => { isManualToggle = false; }, 100);
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
    
    // Ensure we're NOT in mirrored mode for normal custom mode
    window.mirroredMode = false;
    
    // Hide hiragana keyboard for normal custom mode
    hideHiraganaKeyboard();
    
    // Don't clear the word entry flag when starting a custom game
    // This allows users to go back to word entry selection from script pages
    
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
    
    console.log('showCustomRepeatingQuestion - Current word:', word, 'Phase:', currentPhase);
    
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
    const word = questionQueue.shift();
    const wordKey = word.japanese;
    
    console.log('handleCustomCorrectAnswer - Processing word:', word, 'Queue length:', questionQueue.length);
    
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
    console.log('Saving settings:', settings);
    saveToLocalStorage(STORAGE_KEYS.SETTINGS, settings);
}

function loadSettings() {
    const settings = loadFromLocalStorage(STORAGE_KEYS.SETTINGS, { language: 'en', darkMode: false, autoPlaySound: true });
    console.log('Loading settings:', settings);
    
    // Validate and apply language setting
    if (settings && typeof settings.language === 'string' && ['en', 'es', 'fr', 'ja', 'zh', 'id', 'ko', 'vi'].includes(settings.language)) {
        console.log('Setting language to saved value:', settings.language);
        currentLanguage = settings.language;
    } else {
        console.warn('Invalid language setting, defaulting to English');
        currentLanguage = 'en';
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
        console.log('Loaded autoPlaySound setting:', autoPlaySound);
    } else {
        autoPlaySound = true;
        console.warn('Invalid auto-play sound setting, defaulting to enabled');
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
    console.log('=== Loading Cookie Consent ===');
    
    // ALWAYS ENABLE ADS BY DEFAULT - Simplified approach
    console.log('Enabling ads by default...');
    adsenseScript.classList.remove('disabled');
    window.adsenseEnabled = true;
    
    // Show ad containers immediately
    showAdContainers();
    
    // Force AdSense to load immediately
    console.log('Forcing AdSense to load...');
    if (typeof adsbygoogle !== 'undefined') {
        console.log('AdSense is available, pushing ads immediately...');
        try {
            adsbygoogle.push({});
            console.log('AdSense ads pushed successfully');
        } catch (error) {
            console.error('Error pushing AdSense ads:', error);
        }
    } else {
        console.warn('AdSense not available, loading script...');
        // Load AdSense script immediately
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9490674375260891';
        script.crossOrigin = 'anonymous';
        script.onload = function() {
            console.log('AdSense script loaded, pushing ads...');
            if (typeof adsbygoogle !== 'undefined') {
                adsbygoogle.push({});
                console.log('AdSense ads pushed after script load');
            }
        };
        document.head.appendChild(script);
    }
    
    // Handle analytics separately (disable by default for privacy)
    analyticsScript.classList.add('disabled');
    window.analyticsEnabled = false;
    
    console.log('Cookie consent loaded - ADS ENABLED, Analytics disabled');
    return true; // Always return true to prevent cookie popup
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

// Test TTS functionality
function testTTS() {
    console.log('=== TTS Test ===');
    
    if (!speechSynthesis) {
        console.log('❌ Speech synthesis not supported');
        return;
    }
    
    if (!japaneseVoice) {
        console.log('❌ No Japanese voice available');
        return;
    }
    
    console.log('✅ TTS system available');
    console.log('Selected voice:', japaneseVoice.name, japaneseVoice.lang);
    
    // Test with a simple Japanese word
    const testWord = 'こんにちは';
    console.log('Testing pronunciation of:', testWord);
    
    speakJapaneseText(testWord, { rate: 0.6 });
}

// Get TTS system status
function getTTSStatus() {
    console.log('=== TTS Status ===');
    
    if (!speechSynthesis) {
        console.log('❌ Speech synthesis not supported');
        return;
    }
    
    console.log('✅ Speech synthesis available');
    
    const voices = speechSynthesis.getVoices();
    console.log('Total voices available:', voices.length);
    
    const japaneseVoices = voices.filter(v => v.lang.startsWith('ja'));
    console.log('Japanese voices available:', japaneseVoices.length);
    
    if (japaneseVoices.length > 0) {
        console.log('Japanese voices:');
        japaneseVoices.forEach((voice, index) => {
            console.log(`  ${index + 1}. ${voice.name} (${voice.lang}) - ${voice.default ? 'Default' : 'Available'}`);
        });
    }
    
    if (japaneseVoice) {
        console.log('✅ Current Japanese voice:', japaneseVoice.name, japaneseVoice.lang);
    } else {
        console.log('❌ No Japanese voice selected');
    }
    
    return {
        supported: !!speechSynthesis,
        voicesAvailable: voices.length,
        japaneseVoices: japaneseVoices.length,
        currentVoice: japaneseVoice
    };
}

// Update sound button state based on current conditions
function updateSoundButtonState() {
    if (!soundBtn) return;
    
    // Update button state based on current word availability
    if (currentWord && currentWord.japanese) {
        soundBtn.disabled = false;
        soundBtn.style.opacity = '1';
    } else {
        soundBtn.disabled = true;
        soundBtn.style.opacity = '0.5';
    }
    
    // Update title based on TTS availability
    if (speechSynthesis && japaneseVoice) {
        soundBtn.title = 'Play Japanese pronunciation';
    } else {
        soundBtn.title = 'Play sound (TTS not available)';
    }
}

// Test auto-play functionality
function testAutoPlay() {
    console.log('=== Auto-Play Test ===');
    
    console.log('Current autoPlaySound value:', autoPlaySound);
    console.log('Auto-play toggle state:', autoPlayToggle ? autoPlayToggle.checked : 'Toggle not found');
    
    // Test with a sample word
    const testWord = { japanese: 'こんにちは', english: 'hello' };
    console.log('Testing auto-play with word:', testWord.japanese);
    
    // Simulate showing a word
    displayWordWithSound(testWord);
    
    console.log('=== Auto-Play Test Complete ===');
}

// Test TTS system during repetition phase
function testTTSDuringRepetition() {
    console.log('=== TTS During Repetition Test ===');
    
    console.log('TTS System Status:');
    console.log('- speechSynthesis available:', !!speechSynthesis);
    console.log('- japaneseVoice available:', !!japaneseVoice);
    console.log('- currentWord:', currentWord);
    console.log('- autoPlaySound:', autoPlaySound);
    
    if (currentWord) {
        console.log('Testing TTS with current word:', currentWord.japanese);
        playWordSound(currentWord.japanese);
    } else {
        console.warn('No current word available for testing');
    }
    
    console.log('=== TTS Test Complete ===');
}

// Check TTS system health
function checkTTSSystemHealth() {
    console.log('=== TTS System Health Check ===');
    
    // Check if TTS is available
    if (!speechSynthesis) {
        console.error('❌ Speech synthesis not available');
        return false;
    }
    
    if (!japaneseVoice) {
        console.error('❌ Japanese voice not available');
        return false;
    }
    
    // Check if voices are still loaded
    const voices = speechSynthesis.getVoices();
    console.log('✅ Available voices:', voices.length);
    
    // Check if our Japanese voice is still valid
    const voiceStillValid = voices.some(v => v === japaneseVoice);
    if (!voiceStillValid) {
        console.error('❌ Japanese voice no longer valid, reinitializing...');
        loadJapaneseVoice();
        return false;
    }
    
    console.log('✅ TTS system is healthy');
    return true;
}

// Make test functions available globally for debugging
if (typeof window !== 'undefined') {
    window.testLocalStorage = testLocalStorage;
    window.testTTS = testTTS;
    window.getTTSStatus = getTTSStatus;
    window.testAutoPlay = testAutoPlay;
    window.testTTSDuringRepetition = testTTSDuringRepetition;
    window.checkTTSSystemHealth = checkTTSSystemHealth;
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
    console.log('=== SHOWING AD CONTAINERS ===');
    const adContainers = document.querySelectorAll('.ad-container');
    console.log(`Found ${adContainers.length} ad containers`);
    
    adContainers.forEach((container, index) => {
        // Aggressively show the container
        container.classList.remove('hidden');
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.opacity = '1';
        container.style.zIndex = '100';
        
        console.log(`✅ Ad container ${index + 1} (ID: ${container.id || 'no-id'}) shown aggressively`);
        console.log(`- Classes: ${container.className}`);
        console.log(`- Display: ${container.style.display}`);
        console.log(`- Visibility: ${container.style.visibility}`);
        console.log(`- Opacity: ${container.style.opacity}`);
    });
    
    // Force AdSense to load immediately
    console.log('=== FORCING ADSENSE TO LOAD ===');
    if (typeof adsbygoogle !== 'undefined') {
        console.log('AdSense available, pushing ads immediately...');
        try {
            adsbygoogle.push({});
            console.log('✅ AdSense ads pushed successfully');
        } catch (error) {
            console.error('❌ Error pushing AdSense ads:', error);
        }
    } else {
        console.warn('⚠️ AdSense not available, loading script...');
        // Load AdSense script immediately
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9490674375260891';
        script.crossOrigin = 'anonymous';
        script.onload = function() {
            console.log('✅ AdSense script loaded, pushing ads...');
            if (typeof adsbygoogle !== 'undefined') {
                adsbygoogle.push({});
                console.log('✅ AdSense ads pushed after script load');
            }
        };
        document.head.appendChild(script);
    }
    
    // Set up aggressive monitoring
    setInterval(() => {
        const adContainers = document.querySelectorAll('.ad-container');
        adContainers.forEach((container, index) => {
            const isHidden = container.classList.contains('hidden');
            const display = window.getComputedStyle(container).display;
            const visibility = window.getComputedStyle(container).visibility;
            const opacity = window.getComputedStyle(container).opacity;
            
            if (isHidden || display === 'none' || visibility === 'hidden' || opacity === '0') {
                console.warn(`⚠️ Ad container ${index + 1} (${container.id || 'no-id'}) became hidden!`);
                
                // Aggressively restore
                container.classList.remove('hidden');
                container.style.display = 'block';
                container.style.visibility = 'visible';
                container.style.opacity = '1';
                container.style.zIndex = '100';
                
                console.log(`✅ Aggressively restored ad container ${index + 1}`);
            }
        });
    }, 500); // Check every 500ms
}

function hideAdContainers() {
    const adContainers = document.querySelectorAll('.ad-container');
    adContainers.forEach(container => {
        container.classList.add('hidden');
    });
    console.log('Ad containers hidden');
}

function initializeAdSense() {
    console.log('=== INITIALIZING ADSENSE ===');
    
    // Check if AdSense is available
    console.log('AdSense available at start:', typeof adsbygoogle !== 'undefined');
    console.log('window.adsbygoogle at start:', window.adsbygoogle);
    
    if (typeof adsbygoogle === 'undefined') {
        console.warn('⚠️ AdSense not available, loading script...');
        
        // Load AdSense script
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9490674375260891';
        script.crossOrigin = 'anonymous';
        
        script.onload = function() {
            console.log('✅ AdSense script loaded successfully');
            console.log('AdSense available after load:', typeof adsbygoogle !== 'undefined');
            console.log('window.adsbygoogle after load:', window.adsbygoogle);
            loadAdSenseAds();
        };
        
        script.onerror = function(error) {
            console.error('❌ Failed to load AdSense script:', error);
            console.error('This might be due to:');
            console.error('1. Network connectivity issues');
            console.error('2. Ad blocker blocking the script');
            console.error('3. Browser security settings');
            console.error('4. Firewall blocking the request');
        };
        
        // Add a timeout to detect if script loading is taking too long
        setTimeout(() => {
            if (typeof adsbygoogle === 'undefined') {
                console.warn('⚠️ AdSense script loading timeout - script may be blocked');
                console.warn('Check browser console for network errors');
            }
        }, 10000);
        
        document.head.appendChild(script);
        console.log('AdSense script element added to head');
        console.log('Script src:', script.src);
    } else {
        console.log('✅ AdSense already available');
        loadAdSenseAds();
    }
}

function loadAdSenseAds() {
    console.log('=== LOADING ADSENSE ADS ===');
    
    // Check if AdSense is available
    console.log('AdSense available:', typeof adsbygoogle !== 'undefined');
    console.log('window.adsbygoogle:', window.adsbygoogle);
    
    // Find all ad containers
    const adContainers = document.querySelectorAll('.ad-container');
    console.log(`Found ${adContainers.length} ad containers`);
    
    adContainers.forEach((container, index) => {
        console.log(`\n--- Ad Container ${index + 1} ---`);
        console.log('Container ID:', container.id || 'no-id');
        console.log('Container HTML:', container.innerHTML.substring(0, 200) + '...');
        console.log('Container classes:', container.className);
        console.log('Container display:', window.getComputedStyle(container).display);
        console.log('Container visibility:', window.getComputedStyle(container).visibility);
        console.log('Container opacity:', window.getComputedStyle(container).opacity);
        
        const adElement = container.querySelector('.adsbygoogle');
        if (adElement) {
            console.log('✅ AdSense element found in container');
            console.log('AdSense element HTML:', adElement.outerHTML);
            console.log('AdSense element data attributes:', {
                'data-ad-client': adElement.getAttribute('data-ad-client'),
                'data-ad-slot': adElement.getAttribute('data-ad-slot'),
                'data-ad-format': adElement.getAttribute('data-ad-format')
            });
            
            try {
                if (typeof adsbygoogle !== 'undefined') {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                    console.log('✅ Ad pushed to container successfully');
                } else {
                    console.error('❌ AdSense not available when trying to push ad');
                }
            } catch (error) {
                console.error('❌ Error loading ad in container:', error);
            }
        } else {
            console.warn('❌ No AdSense element found in container');
            console.log('Container children:', Array.from(container.children).map(child => child.tagName + (child.className ? '.' + child.className : '')));
        }
    });
    

}
