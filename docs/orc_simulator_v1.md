# Orc Simulator v1 - Design Document

## Game Concept

**Title**: Orc Simulator
**Version**: 1.0
**Platform**: Web Browser (GitHub Pages)
**Genre**: Interactive Fiction / Chat-based RPG
**Target Audience**: Casual gamers, AI enthusiasts, web developers

## Game Overview

Orc Simulator v1 is a browser-based interactive fiction game where players engage in conversation with Munch, an angry orc NPC who guards a magic amulet. The entire game runs client-side using WebAssembly and a small language model, requiring no server infrastructure.

## Core Game Loop

1. **Loading Phase**: Download and initialize the AI model
2. **Chat Interface**: Interactive conversation with Munch the orc
3. **Restart Option**: Clear conversation history and begin fresh
4. **Progression**: Discover Munch's personality through dialogue

## Technical Architecture

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6 modules)
- **AI Model**: Qwen2-0.5B-Instruct (quantized GGUF format)
- **Runtime**: wllama (WebAssembly)
- **Hosting**: GitHub Pages
- **Model CDN**: Hugging Face
- **Threading**: coi-serviceworker for SharedArrayBuffer support

### Browser Requirements
- Modern browser with WASM + SIMD support
- Minimum 500MB RAM available
- JavaScript enabled
- Supported browsers:
  - Chrome 91+
  - Firefox 89+
  - Safari 16.4+
  - iOS 16.4+

## User Experience Flow

### 1. Landing Page
- Game title and brief description
- "Start Game" button
- Browser compatibility check
- Loading progress indicator

### 2. Loading Screen
- Model download progress (120MB)
- Initialization status
- Tips about the game while loading
- Error handling for failed downloads

### 3. Game Interface
- Chat window with conversation history
- Text input field for player messages
- "Send" button and Enter key support
- "Restart" button to clear history
- Character portrait/avatar (optional)

### 4. Error States
- Browser incompatibility message
- Model loading failure
- Memory/performance warnings

## Game Design Elements

### Character: Munch the Orc
- **Personality**: Angry, hungry, protective of his amulet
- **Behavior**: Hostile to humans unless offered food
- **Speech Pattern**: Short, brutal sentences
- **Softening Condition**: Responds positively to food offers
- **Guard Duty**: Protects a magic amulet (mentioned in conversations)

### Conversation Mechanics
- **System Prompt**: Defines Munch's character and behavior
- **Context Length**: 512 tokens (manageable conversation history)
- **Temperature**: 0.85 (creative but consistent responses)
- **No Memory**: Each restart begins fresh (intentional design choice)

## File Structure

```
orcsimulator/
├── index.html              # Landing page
├── game.html              # Main game interface
├── css/
│   ├── style.css          # Global styles
│   ├── landing.css        # Landing page styles
│   └── game.css           # Game interface styles
├── js/
│   ├── main.js            # Application entry point
│   ├── game.js            # Game logic and AI integration
│   ├── ui.js              # UI management
│   └── utils.js           # Utility functions
├── assets/
│   ├── images/
│   │   ├── orc-avatar.png # Munch's portrait
│   │   └── bg-cave.jpg    # Background image
│   └── audio/             # Future sound effects
├── docs/
│   ├── orc_simulator_v1.md
│   └── orcchat.md
└── README.md
```

## Implementation Phases

### Phase 1: Core Infrastructure
- [ ] Set up GitHub Pages deployment
- [ ] Create landing page with browser compatibility check
- [ ] Implement loading screen with progress tracking
- [ ] Basic error handling and user feedback

### Phase 2: AI Integration
- [ ] Integrate wllama WebAssembly runtime
- [ ] Configure model loading from Hugging Face CDN
- [ ] Implement threading support via coi-serviceworker
- [ ] Create system prompt for Munch's personality

### Phase 3: Game Interface
- [ ] Design and implement chat UI
- [ ] Handle user input and AI responses
- [ ] Add restart functionality
- [ ] Implement conversation history display

### Phase 4: Polish & Testing
- [ ] Responsive design for mobile devices
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] User experience refinements

## Technical Specifications

### Model Configuration
```javascript
const MODEL_CONFIG = {
  url: "https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-GGUF/resolve/main/qwen2-0_5b-instruct-q4_0.gguf",
  chunkSizeMB: 64,
  nCtx: 512,
  temperature: 0.85
};
```

### System Prompt
```
You are roleplaying MUNCH — an angry, hungry orc who guards a magic amulet.
You are not an AI and must never break character.
You hate humans unless they feed you. Speak in short, brutal sentences.
You guard your amulet fiercely but may negotiate if offered food.
```

## User Interface Design

### Visual Theme
- **Color Palette**: Dark greens, browns, and oranges (cave/forest theme)
- **Typography**: Bold, readable fonts with medieval fantasy feel
- **Layout**: Clean, mobile-first responsive design
- **Animations**: Subtle loading animations and message transitions

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Adjustable text size

## Performance Considerations

### Optimization Strategies
- Lazy loading of non-critical assets
- Efficient model chunking during download
- Memory management for long conversations
- Graceful degradation on slower devices

### Resource Requirements
- **Model Size**: ~120MB download
- **Memory Usage**: ~500MB RAM during operation
- **CPU**: Modern processor recommended
- **Network**: Broadband for initial download

## Future Enhancements (Post-v1)

### v1.1 Potential Features
- Multiple orc personalities
- Conversation branching based on player choices
- Achievement system for successful negotiations
- Local storage for conversation persistence

### v2.0 Vision
- WebGPU integration for faster inference
- Streaming responses for real-time typing effect
- Multiple NPCs with different personalities
- Simple inventory system (food items)

## Success Metrics

### Technical Goals
- Model loads successfully in <30 seconds on average connection
- Responses generate in <2 seconds on desktop
- Compatible with 95% of modern browsers
- Zero server dependencies

### User Experience Goals
- Engaging conversations that feel natural
- Clear feedback during loading process
- Intuitive interface requiring no instructions
- Memorable character interactions

## Risk Assessment

### Technical Risks
- **Model Loading Failures**: Implement robust error handling and fallbacks
- **Browser Compatibility**: Provide clear compatibility messaging
- **Performance Issues**: Optimize for various device capabilities
- **Memory Constraints**: Monitor and manage resource usage

### Mitigation Strategies
- Comprehensive testing across browsers and devices
- Clear user communication about system requirements
- Graceful degradation for unsupported features
- Alternative lightweight mode for older devices

## Conclusion

Orc Simulator v1 represents an innovative approach to browser-based gaming, combining modern AI technology with classic interactive fiction. By running entirely client-side, it offers a unique, private, and engaging experience that showcases the potential of WebAssembly-based AI applications in gaming.

The modular design allows for iterative development and future enhancements while maintaining a focused, achievable scope for the initial release. 