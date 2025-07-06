# Munch Portrait Images

This directory contains the mood-based portrait images for Munch the orc.

## Image Specifications

- **Format**: PNG (for transparency support) or SVG (for vector graphics)
- **Dimensions**: 400x400 pixels (square)
- **Display Size**: 200x200px desktop, 140x140px mobile
- **Background**: Transparent or match gradient (#4a5d23 to #364416)
- **Style**: Fantasy orc character, head and shoulders, centered

## Required Images

### 1. **munch-calm.svg/png** (Moods 0-2) 🟢
- **Personality**: Peaceful, almost friendly
- **Expression**: Slight smile, relaxed eyes
- **Color Tone**: Warmer greens, softer lighting
- **Usage**: When Munch is very calm and content

### 2. **munch-neutral.svg/png** (Moods 3-4) 🟡
- **Personality**: Wary but not hostile  
- **Expression**: Serious, watching carefully
- **Color Tone**: Standard orc colors
- **Usage**: When Munch is neutral/suspicious (DEFAULT)

### 3. **munch-angry.svg/png** (Moods 5-6) 🟠
- **Personality**: Moderately angry, suspicious
- **Expression**: Frowning, intense stare
- **Color Tone**: Slightly darker, more intense
- **Usage**: When Munch is starting to get angry

### 4. **munch-furious.svg/png** (Moods 7-8) 🔴
- **Personality**: Very angry, threatening
- **Expression**: Scowling, bared teeth, glowing eyes
- **Color Tone**: Reddish tint, dramatic shadows
- **Usage**: When Munch is very angry and dangerous

### 5. **munch-murderous.svg/png** (Mood 9) 💀
- **Personality**: Absolutely rage-filled, deadly
- **Expression**: Terrifying rage, red glowing eyes, snarling
- **Color Tone**: Dark reds, dramatic lighting, menacing
- **Usage**: When Munch is about to kill the player

## Implementation

The game will automatically switch between these portraits based on Munch's current mood level:
- Moods 0-2: munch-calm.png
- Moods 3-4: munch-neutral.png  
- Moods 5-6: munch-angry.png
- Moods 7-8: munch-furious.png
- Mood 9: munch-murderous.png

If an image fails to load, the system will fall back to the emoji (🧌) representation.

## File Naming

**Important**: Use exact filenames as listed above (lowercase, hyphenated) for the system to work correctly.

## Current Status

✅ **READY TO USE** - All 5 PNG portrait files are in place and the game is configured to use them! 