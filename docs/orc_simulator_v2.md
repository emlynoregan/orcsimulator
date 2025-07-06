# Orc Simulator v2 - Design Document

## Vision Statement

Orc Simulator v2 transforms the chat-based interface into a more immersive, game-like experience with visual elements, clear state management, and a dedicated game view that makes the interaction feel more like a proper RPG encounter.

## Major Changes from v1

### v1 → v2 Transformation
- **From**: Pure chat interface
- **To**: Game-like interface with visual elements and state management
- **Key Addition**: Tabbed interface separating active gameplay from conversation history
- **Visual Enhancement**: Prominent display of Munch's image and current status
- **State Management**: Clear visual indicators for user input vs. AI processing

## Core Design Principles

1. **Immersion**: Make the player feel like they're actually standing in a cave facing Munch
2. **Clarity**: Always show what state the game is in (waiting for user vs. processing)
3. **Accessibility**: Maintain keyboard navigation and screen reader support
4. **Separation of Concerns**: Active gameplay vs. historical reference

## User Interface Architecture

### Two-Tab System

#### Tab 1: "Game" (Default)
The primary gameplay interface where all interaction happens.

**Components:**
- **Munch's Portrait**: Visual representation of the orc (prominent placement)
- **Status Message**: Contextual description of the current situation
- **Munch's Last Words**: The most recent thing Munch said
- **User Input Area**: Where players type their responses
- **State Indicator**: Visual feedback for current game state

#### Tab 2: "History"
A read-only archive of the entire conversation for reference.

**Components:**
- **Conversation Log**: Complete chat history in chronological order
- **Timestamps**: When each exchange occurred
- **Navigation**: Scroll through past interactions
- **Search**: Find specific parts of the conversation (future enhancement)

### Game States

#### State 1: "Waiting for User"
- **Visual Indicators**: Input field is active and highlighted
- **Available Actions**: User can type and submit messages
- **Button State**: "Send" button is enabled
- **Cursor**: Focused on input field
- **Status**: "Your turn to speak..."

#### State 2: "Munch is Thinking"
- **Visual Indicators**: Loading spinner/animation
- **Available Actions**: No input allowed (input field disabled)
- **Button State**: "Send" button shows loading state
- **Cursor**: Standard cursor (not in input field)
- **Status**: "Munch is thinking..." with animated indicator

## Technical Implementation Plan

### HTML Structure Changes

```html
<div class="game-container">
    <!-- Tab Navigation -->
    <div class="tab-navigation">
        <button class="tab-button active" data-tab="game">Game</button>
        <button class="tab-button" data-tab="history">History</button>
    </div>
    
    <!-- Game Tab Content -->
    <div class="tab-content active" id="game-tab">
        <div class="game-main">
            <!-- Munch's Portrait -->
            <div class="munch-portrait">
                <img src="assets/images/munch-portrait.jpg" alt="Munch the Orc">
                <div class="state-overlay" id="state-indicator"></div>
            </div>
            
            <!-- Game Information Panel -->
            <div class="game-info-panel">
                <!-- Status Message -->
                <div class="status-message" id="status-message">
                    You are in a cave. Munch the orc stands before you. He has an amulet and a large axe. He looks very angry.
                </div>
                
                <!-- Munch's Last Words -->
                <div class="munch-speech" id="munch-speech">
                    <div class="speech-bubble">
                        <div class="speech-content" id="speech-content">
                            A human is in me cave! Me is MUNCH, the big strong orc!
                        </div>
                    </div>
                </div>
                
                <!-- User Input Area -->
                <div class="user-input-area">
                    <div class="input-container">
                        <textarea id="user-input" placeholder="What do you say to Munch?" rows="3"></textarea>
                        <button id="send-button" class="send-button">
                            <span class="send-text">Send</span>
                            <span class="thinking-text" style="display: none;">Thinking...</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- History Tab Content -->
    <div class="tab-content" id="history-tab">
        <div class="history-container">
            <div class="history-header">
                <h3>Conversation History</h3>
                <button id="clear-history" class="clear-button">Clear History</button>
            </div>
            <div class="history-content" id="history-content">
                <!-- Chat messages will be populated here -->
            </div>
        </div>
    </div>
</div>
```

### CSS Design System

#### Color Palette
- **Primary**: Dark cave browns (#2c1810, #1a0f08)
- **Accent**: Orc green (#4a5d23, #364416)
- **Warning**: Angry red (#cc3333, #992626)
- **UI**: Neutral grays (#404040, #606060)
- **Text**: Light cream (#f4f4f4, #e8e8e8)

#### Typography
- **Headers**: Bold, fantasy-style fonts
- **Body Text**: Readable sans-serif
- **Munch's Speech**: Slightly larger, more dramatic font
- **Status Messages**: Italic, atmospheric text

#### Layout Principles
- **Mobile-First**: Responsive design starting with mobile
- **Visual Hierarchy**: Clear importance levels
- **Breathing Room**: Adequate spacing for readability
- **Focus States**: Clear keyboard navigation indicators

### JavaScript Architecture Changes

#### State Management
```javascript
class GameState {
    constructor() {
        this.currentTab = 'game';
        this.gameState = 'waiting_for_user'; // or 'munch_thinking'
        this.statusMessage = "You are in a cave. Munch the orc stands before you. He has an amulet and a large axe. He looks very angry.";
        this.munchLastWords = "A human is in me cave! Me is MUNCH, the big strong orc!";
        this.conversationHistory = [];
    }
}
```

#### New Methods Required
- `switchTab(tabName)`: Handle tab navigation
- `updateGameState(newState)`: Manage game state transitions
- `updateStatusMessage(message)`: Update contextual status
- `updateMunchSpeech(speech)`: Update Munch's last words
- `addToHistory(userMessage, munchResponse)`: Add exchange to history
- `renderHistory()`: Display conversation history in history tab

#### Enhanced User Experience
- **Smooth Transitions**: Fade between states
- **Visual Feedback**: Button states, loading indicators
- **Keyboard Shortcuts**: Tab navigation, Enter to send
- **Auto-Focus**: Input field gets focus when switching to game tab

## Game Design Enhancements

### Status Message System
Dynamic messages that change based on game progression:

**Initial**: "You are in a cave. Munch the orc stands before you. He has an amulet and a large axe. He looks very angry."

**After First Exchange**: "Munch's eyes narrow as he evaluates your words. The amulet glows faintly on his chest."

**When Munch is Calm**: "The orc's stance relaxes slightly. He seems less hostile now."

**When Munch is Angry**: "Munch's grip tightens on his axe. His face contorts with rage."

### Visual Indicators for Munch's Mood
- **Angry**: Red overlay on portrait, intense glowing eyes
- **Neutral**: Standard portrait
- **Calm**: Green overlay, softer expression
- **Thinking**: Animated thought bubble or glow effect

### Conversation Context Preservation
- **History Tab**: Complete conversation available for reference
- **Game Tab**: Focus on current interaction
- **Context Clues**: Status messages hint at conversation progression

## Implementation Phases

### Phase 1: Core Structure (Week 1)
- [ ] Create tabbed interface HTML structure
- [ ] Implement basic tab switching functionality
- [ ] Create game state management system
- [ ] Design and implement new CSS layout

### Phase 2: Game Interface (Week 2)
- [ ] Implement Munch's portrait display
- [ ] Create status message system
- [ ] Build speech bubble for Munch's words
- [ ] Implement user input area with state management

### Phase 3: History System (Week 3)
- [ ] Create history tab layout
- [ ] Implement conversation history tracking
- [ ] Add history rendering and display
- [ ] Implement history search (optional)

### Phase 4: Polish & Enhancement (Week 4)
- [ ] Add visual state indicators
- [ ] Implement smooth transitions
- [ ] Add keyboard navigation
- [ ] Mobile responsive design
- [ ] Cross-browser testing

## Technical Specifications

### New Dependencies
- No new external dependencies required
- Leverages existing wllama and AI model infrastructure
- Uses CSS transitions for animations
- Vanilla JavaScript for state management

### Performance Considerations
- **Memory**: History tab may accumulate large conversation logs
- **Rendering**: Efficient DOM updates for state changes
- **Images**: Optimized portrait images with proper loading
- **Mobile**: Touch-friendly interface elements

### Browser Compatibility
- Same requirements as v1 (Chrome 91+, Firefox 89+, Safari 16.4+)
- Enhanced CSS features may require additional fallbacks
- JavaScript state management compatible with ES6+ browsers

## User Experience Flow

### 1. Game Loading (Unchanged)
- Model download and initialization
- Compatibility checking
- Progress indication

### 2. Game Interface (New)
- **Default View**: Game tab with Munch's portrait
- **Initial State**: Status message and Munch's greeting
- **User Action**: Type message and send
- **State Transition**: "Waiting for User" → "Munch is Thinking"
- **Response**: Update Munch's speech and status, return to "Waiting for User"

### 3. History Reference (New)
- **Switch to History**: Click history tab
- **View Past Exchanges**: Scroll through conversation
- **Return to Game**: Click game tab to continue playing

### 4. Game Progression (Enhanced)
- **Status Evolution**: Messages change based on conversation progress
- **Visual Feedback**: Munch's mood reflected in portrait
- **Contextual Awareness**: Status messages reference past interactions

## Success Metrics

### User Engagement
- **Time on Game Tab**: Primary interaction time
- **History Tab Usage**: Reference behavior
- **Session Length**: Longer conversations due to immersion
- **Return Visits**: Improved user retention

### Technical Performance
- **State Transitions**: <100ms response time
- **Tab Switching**: Smooth, lag-free experience
- **Memory Usage**: Efficient history management
- **Mobile Performance**: Responsive on all devices

## Future Enhancements (Post-v2)

### v2.1 Potential Features
- **Animated Portraits**: Facial expressions that change with mood
- **Sound Effects**: Audio cues for state changes
- **Gesture System**: Click on items in the cave
- **Quick Actions**: Preset responses for common actions

### v2.2 Advanced Features
- **Multiple Locations**: Different cave rooms
- **Inventory System**: Items to give to Munch
- **Achievement System**: Unlock different outcomes
- **Save/Load**: Persistent game states

### v3.0 Vision
- **3D Cave Environment**: WebGL-based visual environment
- **Voice Input**: Speech-to-text for hands-free play
- **Multiplayer**: Multiple players in the same cave
- **Procedural Content**: Randomly generated cave layouts

## Development Timeline

### Immediate (Next 2 Weeks)
1. **Week 1**: Core structure and game interface
2. **Week 2**: History system and polish

### Short-term (Next Month)
1. **Week 3**: User testing and feedback integration
2. **Week 4**: Performance optimization and bug fixes

### Medium-term (Next 3 Months)
1. **Month 2**: Advanced visual enhancements
2. **Month 3**: Mobile optimization and accessibility improvements

## Risk Assessment

### Technical Risks
- **Complexity**: More complex state management may introduce bugs
- **Performance**: Additional DOM elements may impact performance
- **Compatibility**: Enhanced CSS features may not work on older browsers

### Mitigation Strategies
- **Thorough Testing**: Comprehensive testing across browsers and devices
- **Progressive Enhancement**: Fallbacks for older browsers
- **Performance Monitoring**: Regular performance audits

### User Experience Risks
- **Confusion**: Users may not understand the tab system
- **Overwhelm**: Too many visual elements may distract from core gameplay

### Mitigation Strategies
- **Clear Navigation**: Obvious tab labels and visual indicators
- **Guided Experience**: Tooltips and help system
- **User Testing**: Regular feedback collection and iteration

## Conclusion

Orc Simulator v2 represents a significant evolution from a simple chat interface to a rich, immersive gaming experience. By maintaining the core AI interaction while adding visual elements and better state management, we create a more engaging and game-like experience that better serves the fantasy RPG aesthetic.

The two-tab system provides the perfect balance between focused gameplay and historical reference, while the enhanced visual design makes the interaction feel more like a real encounter with Munch the orc in his cave. 