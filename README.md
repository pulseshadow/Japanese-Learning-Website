# Japanese Learning Website - Brute Force Mode

A modern, responsive website for learning Japanese words through brute-force repetition using hiragana.

## Features

### Start Page
- Clean, modern design with placeholder content
- "Brute Force Mode" button to start learning
- Two additional "Coming Soon" buttons for future features

### Script Selection
- Choose between Hiragana and Katakana (Katakana coming soon)
- Currently only Hiragana is functional

### Learning System

#### Introduction Rounds
- **Learning Phase**: Each word is shown once with the correct English answer displayed above
- **Repeating Phase**: Words are cycled randomly until each word is answered correctly 3 times
- 5 new words per introduction round

#### Practice Rounds
- Combines all words from previous introduction rounds
- No learning phase - immediate practice
- Same 3 correct answers requirement per word
- Words accumulate across rounds

#### Smart Queue System
- Background queue of 21+ questions
- Incorrect answers add the word back to the queue at positions 5 and 10 ahead
- Prevents accumulation of duplicate incorrect words
- Ensures spaced repetition for difficult words

## Current Word Pools

### Round 1 (Introduction): Basic Animals & Objects
- いぬ (dog)
- ねこ (cat)
- いえ (house)
- くるま (car)
- みず (water)

### Round 2 (Practice): Same as Round 1

### Round 3 (Introduction): Common Objects
- ほん (book)
- つくえ (desk)
- でんわ (phone)
- まど (window)
- とけい (clock)

### Round 4 (Practice): All words from Rounds 1 & 3

## How to Use

1. Open `index.html` in a web browser
2. Click "Brute Force Mode" on the start page
3. Select "Hiragana" (Katakana coming soon)
4. Start with the learning phase - type the correct English answer for each Japanese word
5. Progress to the repeating phase - answer each word correctly 3 times
6. Click "Next Round" when all words have 3 correct answers
7. Continue through introduction and practice rounds

## Technical Details

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Responsive Design**: Works on desktop and mobile devices
- **No Dependencies**: Pure client-side application
- **Modern UI**: Gradient backgrounds, smooth animations, clean typography

## File Structure

```
├── index.html      # Main HTML file
├── styles.css      # CSS styling
├── script.js       # JavaScript game logic
└── README.md       # This file
```

## Future Enhancements

- Katakana support
- Additional practice modes
- Progress tracking and statistics
- Custom word lists
- Audio pronunciation
- More word categories

## Getting Started

Simply open `index.html` in any modern web browser to start learning Japanese words!

