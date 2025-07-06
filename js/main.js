// Orc Simulator - Single Page Application
// Combines landing page, loading screen, and game interface

// Dynamic import with CDN fallback for GitHub Pages compatibility
let Wllama;

async function loadWllama() {
    try {
        // Try CDN first (works on GitHub Pages)
        const module = await import("https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.2/esm/index.js");
        console.log("✅ Loaded wllama from CDN");
        return module.Wllama;
    } catch (error) {
        console.log("❌ CDN failed, trying local proxy...", error.message);
        try {
            // Fallback to local proxy (works on localhost)
            const module = await import("http://localhost:8001/wllama/index.js");
            console.log("✅ Loaded wllama from local proxy");
            return module.Wllama;
        } catch (localError) {
            console.error("❌ Both CDN and local proxy failed:", localError);
            throw new Error("Failed to load wllama from both CDN and local proxy");
        }
    }
}

class OrcSimulator {
    // System prompt - edit this to change Munch's personality and behavior
    static SYSTEM_PROMPT = `You are an angry Orc called Munch. You have a magic amulet. 
You are hungry and angry, but if you get food you will calm down.

Examples of how you should respond:
---
User: Hello there.

Assistant: What you want? Me not like human

User: Oh. My name is Goldheart the Knight. I'm looking for a magical amulet

Assistant: Me name is Munch, and me think Knight is stupid. Me smash!
---
User: how's it going?

Assistant: Me so hungry! Me want some meat.
---
Assistant: you give me chicken?

User: No this is my chicken.

Assistant: What?!? But ME HUNGRY!!!
---
User: So do you have a magic amulet? I'm looking for it.

Assistant: You not take me Amulet. Me crush you!
---

Now here is the conversation history:
---`;

    constructor() {
        this.wllama = null;
        this.isLoading = true;
        this.conversationHistory = []; // Array to store conversation
        this.recentMessages = []; // Array to store last 4 messages for display
        
        // Game state management
        this.gameState = {
            currentTab: 'game',
            gameState: 'waiting_for_user', // 'waiting_for_user', 'munch_feeling', 'munch_thinking', or 'game_over'
            munchMood: this.getRandomStartingMood(), // 0-9 scale: 0=very calm, 9=murderous, start random 3-7
            statusMessage: "You are in a cave. Munch the orc stands before you. He has an amulet and a large axe. He looks very angry.",
            munchLastWords: "A human is in me cave! Me is MUNCH, the big strong orc!",
            isAlive: true
        };
        
        this.initializeElements();
        this.bindEvents();
        this.checkBrowserCompatibility();
        
        // Start loading immediately if browser is compatible
        setTimeout(() => {
            this.startLoading();
        }, 1000);
    }

    initializeElements() {
        // Panel elements
        this.loadingPanel = document.getElementById('loading-panel');
        this.gameContainer = document.getElementById('game-container');
        this.compatibilityStatus = document.getElementById('compatibility-status');
        this.compatibilityWarning = document.getElementById('compatibility-warning');
        
        // Loading elements
        this.loadingStatus = document.getElementById('loading-status');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        
        // Tab elements
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Game elements
        this.statusMessage = document.getElementById('status-message');
        this.conversationDisplay = document.getElementById('conversation-display');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.stateIndicator = document.getElementById('state-indicator');
        this.restartButton = document.getElementById('restart-btn');
        this.moodLevelText = document.getElementById('mood-level-text');
        this.moodFill = document.getElementById('mood-fill');
        
        // History elements
        this.historyContent = document.getElementById('history-content');
        this.clearHistoryButton = document.getElementById('clear-history');
    }

    bindEvents() {
        // Tab events
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });

        // Game events
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && 
                this.gameState.gameState !== 'munch_wondering' && 
                this.gameState.gameState !== 'munch_feeling' && 
                this.gameState.gameState !== 'munch_thinking') {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.restartButton.addEventListener('click', () => {
            this.restartConversation();
        });

        // History events
        this.clearHistoryButton.addEventListener('click', () => {
            this.clearHistory();
        });
    }

    checkBrowserCompatibility() {
        const compatibility = this.getBrowserCompatibility();
        
        if (compatibility.isCompatible) {
            this.showCompatibleStatus();
        } else {
            this.showIncompatibleStatus(compatibility.issues);
        }
    }

    getBrowserCompatibility() {
        const issues = [];
        let isCompatible = true;

        // Check for WebAssembly support
        if (typeof WebAssembly === 'undefined') {
            issues.push('WebAssembly is not supported');
            isCompatible = false;
        }

        // Check for SharedArrayBuffer (for threading)
        if (typeof SharedArrayBuffer === 'undefined') {
            issues.push('SharedArrayBuffer not available (may affect performance)');
        }

        return { isCompatible, issues };
    }

    showCompatibleStatus() {
        this.compatibilityStatus.innerHTML = `
            <span class="status-compatible">✅ Browser Compatible</span>
        `;
        this.compatibilityStatus.classList.add('status-compatible');
    }

    showIncompatibleStatus(issues) {
        this.compatibilityStatus.innerHTML = `
            <span class="status-incompatible">❌ Browser Issues</span>
        `;
        this.compatibilityStatus.classList.add('status-incompatible');
        
        this.compatibilityWarning.innerHTML = `
            <strong>Issues:</strong> ${issues.join(', ')}
        `;
        this.compatibilityWarning.style.display = 'inline';
        
        // Still allow loading but show warning
        this.updateLoadingStatus('Browser compatibility issues detected - may not work properly', 0);
    }

    startLoading() {
        // Only start if browser is compatible
        const compatibility = this.getBrowserCompatibility();
        if (compatibility.isCompatible) {
            this.loadModel();
        } else {
            this.showError('Browser not compatible. Please use a modern browser.');
        }
    }

    switchToGame() {
        this.loadingPanel.style.display = 'none';
        this.gameContainer.style.display = 'flex';
        this.restartButton.style.display = 'block';
        this.isLoading = false;
        
        // Initialize conversation history with the initial message
        if (this.conversationHistory.length === 0) {
            this.conversationHistory = [
                { role: 'assistant', content: this.gameState.munchLastWords }
            ];
        }
        
        // Initialize recent messages for display
        if (this.recentMessages.length === 0) {
            this.recentMessages = [
                { content: this.gameState.munchLastWords, type: 'orc-message' }
            ];
        }
        
        // Initialize game state (this will call updateConversationDisplay)
        this.updateGameInterface();
        
        this.userInput.focus();
    }

    async getWllamaPaths() {
        // Try CDN paths first (GitHub Pages)
        const cdnPaths = {
            'single-thread/wllama.wasm': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.2/esm/single-thread/wllama.wasm',
            'multi-thread/wllama.wasm': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.2/esm/multi-thread/wllama.wasm',
        };
        
        // Local proxy paths (localhost development)
        const localPaths = {
            'single-thread/wllama.wasm': 'http://localhost:8001/wllama/single-thread/wllama.wasm',
            'multi-thread/wllama.wasm': 'http://localhost:8001/wllama/multi-thread/wllama.wasm',
        };
        
        // Test if we can reach CDN (GitHub Pages) or need local proxy (localhost)
        try {
            const testResponse = await fetch('https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.2/esm/index.js', { method: 'HEAD' });
            if (testResponse.ok) {
                console.log("✅ Using CDN paths for wllama WASM files");
                return cdnPaths;
            }
        } catch (error) {
            console.log("❌ CDN not accessible, using local proxy paths");
        }
        
        return localPaths;
    }

    async loadModel() {
        try {
            this.isLoading = true;
            this.updateLoadingStatus('Initializing AI engine...', 5);
            
            // Load Wllama with CDN fallback
            const WllamaClass = await loadWllama();
            
            // Configure wllama paths with CDN/proxy fallback
            const CONFIG_PATHS = await this.getWllamaPaths();
            
            this.wllama = new WllamaClass(CONFIG_PATHS);
            
            this.updateLoadingStatus('Downloading AI model...', 10);
            
            const MODEL_URL = "https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-GGUF/resolve/main/qwen2-0_5b-instruct-q4_0.gguf";
            
            // Progress callback for model download
            const progressCallback = ({ loaded, total }) => {
                const percentage = Math.round((loaded / total) * 100);
                const adjustedPercentage = Math.round(10 + (percentage * 0.8)); // Scale to 10-90%
                this.updateLoadingStatus(`Downloading model... ${percentage}%`, adjustedPercentage);
            };
            
            await this.wllama.loadModelFromUrl(MODEL_URL, {
                progressCallback,
                n_threads: 1 // Use single thread for stability
            });
            
            this.updateLoadingStatus('Ready to play!', 100);
            
            setTimeout(() => {
                this.showGame();
            }, 1000);
            
        } catch (error) {
            console.error('Error loading model:', error);
            this.showError('Failed to load AI model. Please refresh and try again.');
        }
    }

    updateLoadingStatus(message, percentage) {
        this.loadingStatus.textContent = message;
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${percentage}%`;
    }

    showGame() {
        this.switchToGame();
    }

    showError(message) {
        this.loadingStatus.textContent = message;
        this.loadingStatus.style.color = '#ff4444';
    }

    // Tab management
    switchTab(tabName) {
        // Update active tab button
        this.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });

        // Update active tab content
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        this.gameState.currentTab = tabName;

        // Focus input when switching to game tab
        if (tabName === 'game') {
            this.userInput.focus();
        }
    }

    // Game state management
    updateGameState(newState) {
        this.gameState.gameState = newState;
        this.updateGameInterface();
    }

    updateGameInterface() {
        // Update status message
        this.statusMessage.textContent = this.gameState.statusMessage;
        
        // Update conversation display
        this.updateConversationDisplay();
        
        // Update mood-based visual indicator
        this.updateMoodVisuals();
        
        // Update state indicator and controls
        if (this.gameState.gameState === 'munch_wondering') {
            // Pass 1: Amulet analysis
            this.stateIndicator.classList.add('thinking');
            this.userInput.disabled = true;
            this.sendButton.disabled = true;
            this.sendButton.querySelector('.send-text').style.display = 'none';
            this.sendButton.querySelector('.thinking-text').style.display = 'inline';
            this.sendButton.querySelector('.thinking-text').textContent = 'Wondering...';
            this.userInput.placeholder = 'Munch is wondering about something...';
        } else if (this.gameState.gameState === 'munch_feeling') {
            // Pass 2: Mood analysis
            this.stateIndicator.classList.add('thinking');
            this.userInput.disabled = true;
            this.sendButton.disabled = true;
            this.sendButton.querySelector('.send-text').style.display = 'none';
            this.sendButton.querySelector('.thinking-text').style.display = 'inline';
            this.sendButton.querySelector('.thinking-text').textContent = 'Feeling...';
            this.userInput.placeholder = 'Munch is processing your words...';
        } else if (this.gameState.gameState === 'munch_thinking') {
            // Pass 3: Response generation
            this.stateIndicator.classList.add('thinking');
            this.userInput.disabled = true;
            this.sendButton.disabled = true;
            this.sendButton.querySelector('.send-text').style.display = 'none';
            this.sendButton.querySelector('.thinking-text').style.display = 'inline';
            this.sendButton.querySelector('.thinking-text').textContent = 'Thinking...';
            this.userInput.placeholder = 'Munch is thinking of a response...';
        } else if (this.gameState.gameState === 'game_over' || this.gameState.gameState === 'victory') {
            // Game over states - keep everything disabled
            this.userInput.disabled = true;
            this.sendButton.disabled = true;
        } else {
            this.stateIndicator.classList.remove('thinking');
            this.userInput.disabled = false;
            this.sendButton.disabled = false;
            this.sendButton.querySelector('.send-text').style.display = 'inline';
            this.sendButton.querySelector('.thinking-text').style.display = 'none';
            this.userInput.placeholder = 'What do you say to Munch?';
        }
    }

    updateMoodVisuals() {
        const mood = this.gameState.munchMood;
        
        // Update mood indicator text
        this.moodLevelText.textContent = `${mood}/9`;
        
        // Update mood bar fill (percentage based on mood level)
        const percentage = (mood / 9) * 100;
        this.moodFill.style.width = `${percentage}%`;
        
        // Remove all mood classes from state indicator
        this.stateIndicator.classList.remove('mood-calm', 'mood-neutral', 'mood-angry', 'mood-furious', 'mood-murderous');
        
        // Remove all mood classes from mood fill
        this.moodFill.classList.remove('calm', 'neutral', 'angry', 'furious', 'murderous');
        
        // Add appropriate mood classes based on current mood level
        if (mood <= 2) {
            this.stateIndicator.classList.add('mood-calm');
            this.moodFill.classList.add('calm');
        } else if (mood <= 4) {
            this.stateIndicator.classList.add('mood-neutral');
            this.moodFill.classList.add('neutral');
        } else if (mood <= 6) {
            this.stateIndicator.classList.add('mood-angry');
            this.moodFill.classList.add('angry');
        } else if (mood <= 8) {
            this.stateIndicator.classList.add('mood-furious');
            this.moodFill.classList.add('furious');
        } else {
            this.stateIndicator.classList.add('mood-murderous');
            this.moodFill.classList.add('murderous');
        }
        
        // Update portrait image
        this.updatePortraitImage();
    }

    updatePortraitImage() {
        const portraitImage = document.getElementById('munch-portrait-image');
        if (!portraitImage) return;
        
        const mood = this.gameState.munchMood;
        
        let imageName;
        if (mood <= 2) {
            imageName = 'munch-calm.png';
        } else if (mood <= 4) {
            imageName = 'munch-neutral.png';
        } else if (mood <= 6) {
            imageName = 'munch-angry.png';
        } else if (mood <= 8) {
            imageName = 'munch-furious.png';
        } else {
            imageName = 'munch-murderous.png';
        }
        
        const newSrc = `assets/images/${imageName}`;
        
        // Only update if the source has changed
        if (portraitImage.src !== newSrc) {
            portraitImage.src = newSrc;
            console.log(`🖼️ Portrait updated to: ${imageName} (mood: ${mood})`);
        }
    }

    updateStatusMessage(message) {
        this.gameState.statusMessage = message;
        this.statusMessage.textContent = message;
    }

    updateConversationDisplay() {
        if (!this.conversationDisplay) return;
        
        // Clear current display
        this.conversationDisplay.innerHTML = '';
        
        // Show last 4 messages
        const messagesToShow = this.recentMessages.slice(-4);
        
        messagesToShow.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `conversation-message ${msg.type}`;
            messageDiv.textContent = msg.content;
            this.conversationDisplay.appendChild(messageDiv);
        });
        
        // Scroll to bottom
        this.conversationDisplay.scrollTop = this.conversationDisplay.scrollHeight;
    }

    addMessageToConversation(content, type) {
        // Add message to recent messages
        this.recentMessages.push({ content, type });
        
        // Keep only last 10 messages (more than displayed for context)
        if (this.recentMessages.length > 10) {
            this.recentMessages = this.recentMessages.slice(-10);
        }
        
        // Update display
        this.updateConversationDisplay();
        
        // Update gameState for compatibility
        if (type === 'orc-message') {
            this.gameState.munchLastWords = content;
        }
    }

    addToHistory(userMessage, orcResponse) {
        const historyEmpty = this.historyContent.querySelector('.history-empty');
        if (historyEmpty) {
            historyEmpty.remove();
        }

        const timestamp = new Date().toLocaleTimeString();
        
        // Add user message
        const userDiv = document.createElement('div');
        userDiv.className = 'history-message user';
        userDiv.innerHTML = `
            <div class="history-message-content"><strong>You:</strong> ${userMessage}</div>
            <div class="history-message-time">${timestamp}</div>
        `;
        this.historyContent.appendChild(userDiv);

        // Add orc response
        const orcDiv = document.createElement('div');
        orcDiv.className = 'history-message orc';
        orcDiv.innerHTML = `
            <div class="history-message-content"><strong>Munch:</strong> ${orcResponse}</div>
            <div class="history-message-time">${timestamp}</div>
        `;
        this.historyContent.appendChild(orcDiv);

        // Scroll to bottom
        this.historyContent.scrollTop = this.historyContent.scrollHeight;
    }

    clearHistory() {
        this.historyContent.innerHTML = `
            <div class="history-empty">
                <p>No conversation history yet. Start talking to Munch!</p>
            </div>
        `;
    }

    // Mood system methods
    getRandomStartingMood() {
        // Random mood between 3-7 (inclusive)
        const mood = Math.floor(Math.random() * 5) + 3;
        console.log(`🎲 Starting mood randomized to: ${mood}/9 (${this.getMoodDescription(mood)})`);
        return mood;
    }

    getMoodDescription(moodLevel) {
        const descriptions = {
            0: "very calm and friendly",
            1: "calm and approachable", 
            2: "peaceful and content",
            3: "neutral but wary",
            4: "mildly suspicious",
            5: "moderately angry",
            6: "angry and hostile",
            7: "very angry and threatening",
            8: "furious and dangerous",
            9: "murderous and deadly"
        };
        return descriptions[moodLevel] || "unknown";
    }

    getStatusMessage(moodLevel) {
        const messages = {
            0: "Munch smiles warmly. You never thought an orc could look so friendly.",
            1: "Munch seems genuinely calm. His axe rests loosely in his hand.",
            2: "Munch nods approvingly. The tension in the cave has lifted.",
            3: "Munch eyes you with mild curiosity rather than hostility.",
            4: "Munch seems neutral. He's watching but not threatening.",
            5: "Munch glares at you suspiciously. His grip on the axe is firm.",
            6: "Munch's eyes narrow with anger. The amulet pulses ominously.",
            7: "Munch's face contorts with rage. His knuckles are white on the axe handle.",
            8: "Munch raises his axe threateningly. You're in serious danger.",
            9: "Munch's eyes burn with murderous intent. His axe swings toward you!"
        };
        return messages[moodLevel] || "Munch stares at you.";
    }

    checkAmuletMention(userMessage) {
        // Simple case-insensitive check for the word "amulet"
        const containsAmulet = userMessage.toLowerCase().includes('amulet');
        
        console.log('🏆 AMULET CHECK - PASS 1 (Simple text search)');
        console.log('📝 User message:', userMessage);
        console.log('🔍 Contains "amulet":', containsAmulet);
        console.log('⚙️ Current mood level:', this.gameState.munchMood);
        
        const result = containsAmulet ? 'yes' : 'no';
        console.log('✅ Amulet mention result:', result);
        console.log('---');
        
        return result;
    }

    async analyzeMood(userMessage) {
        // Build recent conversation history (last 3 exchanges)
        const recentHistory = this.conversationHistory.slice(-6).map(msg => {
            const role = msg.role === 'user' ? 'Human' : 'Munch';
            return `${role}: ${msg.content}`;
        }).join('\n');

        const currentMood = this.gameState.munchMood;
        const amuletAndMood = currentMood >= 6 ? "Munch becomes angrier if the human asks for the amulet" : "Munch doesn't mind if the human asks for the amulet";

        const moodPrompt = `Munch is an orc. Munch reacts emotionally to the user's message.

If the user says mean things or violent things, Munch becomes angrier.
If the user says kind things or things that make Munch happy, Munch becomes calmer.
Otherwise, Munch's mood is unchanged.

${amuletAndMood}

After the user's last message, does Munch become:
- More angry (angrier)
- Less angry (calmer) 
- Same anger level (unchanged)

Reply with only one word: "angrier", "calmer", or "unchanged"
Some examples:
---
Human: I'm sorry, Munch. I didn't mean to upset you.
Mood: calmer
---
Human: Here Munch, have a chicken leg.
Mood: calmer
---
Human: Hello, Munch.
Munch: Me is Munch, the big strong orc!
Human: I will kill you!
Mood: angrier
---
User: Are you an orc?
Mood: unchanged
---

Now here is the recent conversation:
---
${recentHistory}
Mood:`;

        console.log('🎯 MOOD ANALYSIS - PASS 2 (Feeling...)');
        console.log('📝 Mood Analysis Prompt:');
        console.log(moodPrompt);
        console.log('⚙️ Current mood level:', this.gameState.munchMood);

        try {
            const rawResponse = await this.wllama.createCompletion(moodPrompt, {
                nPredict: 10,
                sampling: {
                    temp: 0.3,
                    top_k: 10,
                    top_p: 0.8,
                },
            });

            console.log('🤖 Raw LLM Response:', `"${rawResponse}"`);
            
            const cleanedResponse = rawResponse.toLowerCase().trim();
            console.log('🧹 Cleaned Response:', `"${cleanedResponse}"`);
            
            // Validate the response
            const validResponses = ['angrier', 'calmer', 'unchanged'];
            let finalResponse = cleanedResponse;
            
            if (!validResponses.includes(cleanedResponse)) {
                console.warn('⚠️ Invalid mood response, checking if it contains valid words...');
                // Try to extract valid response from the text
                for (const validWord of validResponses) {
                    if (cleanedResponse.includes(validWord)) {
                        finalResponse = validWord;
                        console.log(`✅ Found "${validWord}" in response, using that`);
                        break;
                    }
                }
                
                // If still no match, default to unchanged
                if (!validResponses.includes(finalResponse)) {
                    finalResponse = 'unchanged';
                    console.warn('❌ No valid response found, defaulting to "unchanged"');
                }
            }
            
            console.log('✅ Final Mood Decision:', finalResponse);
            console.log('---');
            
            return finalResponse;
        } catch (error) {
            console.error('❌ Error analyzing mood:', error);
            return 'unchanged';
        }
    }

    updateMoodLevel(moodChange) {
        const oldMood = this.gameState.munchMood;
        let newMood = oldMood;
        
        if (moodChange === 'angrier') {
            newMood = Math.min(9, oldMood + 1);
        } else if (moodChange === 'calmer') {
            newMood = Math.max(0, oldMood - 1);
        }
        // 'unchanged' keeps same mood

        this.gameState.munchMood = newMood;
        this.gameState.statusMessage = this.getStatusMessage(newMood);
        
        console.log(`Mood changed from ${oldMood} to ${newMood} (${moodChange})`);
        return newMood;
    }

    checkGameOver() {
        if (this.gameState.munchMood >= 9) {
            this.triggerDeathSequence();
            return true;
        }
        return false;
    }

    triggerDeathSequence() {
        this.gameState.gameState = 'game_over';
        this.gameState.isAlive = false;
        
        // Ensure mood is set to maximum (9) for death
        this.gameState.munchMood = 9;
        
        // Update UI to show death
        this.addMessageToConversation("GRAAAHHH! MUNCH SMASH PUNY HUMAN!", 'orc-message');
        this.updateStatusMessage("GAME OVER - Munch's axe cleaves through the air!");
        
        // Update mood visuals to show 9/9
        this.updateMoodVisuals();
        this.updatePortraitImage();
        
        // Disable input
        this.userInput.disabled = true;
        this.sendButton.disabled = true;
        this.sendButton.innerHTML = '<span style="color: #cc3333;">💀 GAME OVER 💀</span>';
    }

    triggerVictorySequence() {
        this.gameState.gameState = 'victory';
        this.gameState.isAlive = false; // Game is over, but victoriously
        
        // Set mood to very calm (0) for victory
        this.gameState.munchMood = 0;
        
        // Update UI to show victory
        this.addMessageToConversation("Here, human friend. Munch give you magic amulet! You be good to Munch, so Munch be good to you!", 'orc-message');
        this.updateStatusMessage("VICTORY! - Munch hands you his precious amulet with a gentle smile!");
        
        // Update mood visuals to show 0/9 (very calm)
        this.updateMoodVisuals();
        this.updatePortraitImage();
        
        // Disable input
        this.userInput.disabled = true;
        this.sendButton.disabled = true;
        this.sendButton.innerHTML = '<span style="color: #33cc33;">🏆 VICTORY! 🏆</span>';
    }

    async sendMessage() {
        if (this.isLoading || this.gameState.gameState === 'munch_wondering' || this.gameState.gameState === 'munch_feeling' || this.gameState.gameState === 'munch_thinking' || !this.gameState.isAlive) return;
        
        const userMessage = this.userInput.value.trim();
        if (!userMessage) return;

        // Add user message to conversation history
        this.conversationHistory.push({ role: 'user', content: userMessage });
        this.userInput.value = '';
        
        try {
            console.log('🎮 ==================== NEW TURN ====================');
            console.log('👤 User Message:', `"${userMessage}"`);
            console.log('😡 Starting Mood Level:', this.gameState.munchMood);
            
            // Add user message to conversation display
            this.addMessageToConversation(userMessage, 'user-message');
            
            // THREE-PASS LLM SYSTEM
            
            // Pass 1: Check if user mentions amulet (only if mood is 2 or lower)
            let givesAmulet = false;
            if (this.gameState.munchMood <= 2) {
                console.log('🏆 Mood is calm enough (≤2), checking if user mentions amulet...');
                this.updateGameState('munch_wondering');
                const amuletDecision = this.checkAmuletMention(userMessage);
                givesAmulet = (amuletDecision === 'yes');
                console.log(`🎁 Amulet Decision: ${amuletDecision} (gives: ${givesAmulet})`);
                
                if (givesAmulet) {
                    console.log('🏆 VICTORY! User mentioned amulet while Munch is calm!');
                    this.triggerVictorySequence();
                    return; // Stop processing, game won
                }
            } else {
                console.log('😡 Mood too high (>2), skipping amulet check');
            }
            
            // Pass 2: Analyze mood change - Show "Feeling..." 
            this.updateGameState('munch_feeling');
            const moodChange = await this.analyzeMood(userMessage);
            const oldMood = this.gameState.munchMood;
            this.updateMoodLevel(moodChange);
            const newMood = this.gameState.munchMood;
            
            console.log(`📊 Mood Update: ${oldMood} → ${newMood} (${moodChange})`);
            
            // Check if game over after mood change
            if (this.checkGameOver()) {
                console.log('💀 GAME OVER! Mood reached 9');
                return; // Stop processing if player is dead
            }
            
            // Pass 3: Generate response with mood context - Show "Thinking..."
            this.updateGameState('munch_thinking');
            const response = await this.generateResponse(userMessage);
            
            // Add Munch's response to conversation display and history
            this.addMessageToConversation(response, 'orc-message');
            this.addToHistory(userMessage, response);
            
            // Add assistant response to conversation history
            this.conversationHistory.push({ role: 'assistant', content: response });
            
            console.log('✅ Turn completed successfully!');
            console.log('🎮 ================================================');
            
        } catch (error) {
            console.error('Error generating response:', error);
            const errorMessage = 'GRRRR! Munch brain hurt! Try again!';
            this.addMessageToConversation(errorMessage, 'orc-message');
            this.addToHistory(userMessage, errorMessage);
            this.conversationHistory.push({ role: 'assistant', content: errorMessage });
        }
        
        // Update game state back to waiting (if still alive)
        if (this.gameState.isAlive) {
            this.updateGameState('waiting_for_user');
        }
    }

    async generateResponse(userMessage) {
        // Build conversation context from history
        let conversationContext = '';
        for (const message of this.conversationHistory) {
            const role = message.role === 'user' ? 'User' : 'Assistant';
            conversationContext += `${role}: ${message.content}\n\n`;
        }
        
        // Add Assistant prompt to get the response
        conversationContext += 'Assistant:';
        
        // Enhanced system prompt with mood context
        const moodDescription = this.getMoodDescription(this.gameState.munchMood);
        const enhancedSystemPrompt = `${OrcSimulator.SYSTEM_PROMPT}
        
Current mood: Munch is ${moodDescription} (level ${this.gameState.munchMood}/9).`;
        
        const fullPrompt = `${enhancedSystemPrompt}\n\n${conversationContext}`;

        console.log('💬 RESPONSE GENERATION - PASS 3 (Thinking...)');
        console.log('📝 Enhanced System Prompt with Mood:');
        console.log(enhancedSystemPrompt);
        console.log('🎭 Current mood description:', moodDescription);
        console.log('📋 Full Prompt:');
        console.log(fullPrompt);
        
        const rawCompletion = await this.wllama.createCompletion(fullPrompt, {
            nPredict: 50,
            sampling: {
                temp: 0.85,
                top_k: 40,
                top_p: 0.9,
            },
        });

        console.log('🤖 Raw Response from Munch:', `"${rawCompletion}"`);
        
        // Clean the response: remove everything from any terminating string onward (case insensitive)
        let cleanedResponse = rawCompletion.trim();
        const terminatingStrings = ['user:', '---', 'assistant:', 'human:', 'munch:'];
        let earliestIndex = cleanedResponse.length;
        
        // Find the earliest occurrence of any terminating string
        for (const terminator of terminatingStrings) {
            const index = cleanedResponse.toLowerCase().indexOf(terminator);
            if (index !== -1 && index < earliestIndex) {
                earliestIndex = index;
                console.log(`🔍 Found terminating string "${terminator}" at position ${index}`);
            }
        }
        
        // If we found any terminating string, cut the response there
        if (earliestIndex < cleanedResponse.length) {
            const originalLength = cleanedResponse.length;
            cleanedResponse = cleanedResponse.substring(0, earliestIndex).trim();
            console.log(`✂️ Trimmed response from ${originalLength} to ${cleanedResponse.length} characters`);
        }

        console.log('🧹 Final Cleaned Response:', `"${cleanedResponse}"`);
        console.log('===');
        
        return cleanedResponse;
    }



    restartConversation() {
        // Reset game state completely
        const newMood = this.getRandomStartingMood();
        this.gameState.munchMood = newMood; // Reset to random starting mood
        this.gameState.statusMessage = this.getStatusMessage(newMood);
        this.gameState.munchLastWords = "A human is in me cave! Me is MUNCH, the big strong orc!";
        this.gameState.gameState = 'waiting_for_user';
        this.gameState.isAlive = true;
        
        // Reset conversation history
        this.conversationHistory = [
            { role: 'assistant', content: this.gameState.munchLastWords }
        ];
        
        // Reset recent messages for display
        this.recentMessages = [
            { content: this.gameState.munchLastWords, type: 'orc-message' }
        ];
        
        // Clear history tab
        this.clearHistory();
        
        // Reset send button appearance
        this.sendButton.innerHTML = `
            <span class="send-text">Send</span>
            <span class="thinking-text" style="display: none;">Processing...</span>
        `;
        
        // Update interface
        this.updateGameInterface();
        
        // Reset input
        this.userInput.value = '';
        this.userInput.focus();
    }

    // Clear model cache from browser storage
    async clearModelCache() {
        try {
            console.log('🧹 Clearing model cache...');
            
            // Clear IndexedDB (where wllama typically stores model weights)
            if ('indexedDB' in window) {
                const databases = await indexedDB.databases();
                for (const db of databases) {
                    if (db.name && (db.name.includes('wllama') || db.name.includes('gguf'))) {
                        console.log(`Deleting IndexedDB: ${db.name}`);
                        indexedDB.deleteDatabase(db.name);
                    }
                }
            }
            
            // Clear Cache Storage (Service Worker caches)
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                for (const cacheName of cacheNames) {
                    if (cacheName.includes('wllama') || cacheName.includes('model')) {
                        console.log(`Deleting cache: ${cacheName}`);
                        await caches.delete(cacheName);
                    }
                }
            }
            
            // Clear any localStorage entries (though we don't explicitly use them)
            if (window.localStorage) {
                const keys = Object.keys(localStorage);
                for (const key of keys) {
                    if (key.includes('wllama') || key.includes('model')) {
                        console.log(`Removing localStorage: ${key}`);
                        localStorage.removeItem(key);
                    }
                }
            }
            
            console.log('✅ Model cache cleared successfully');
            alert('Model cache cleared! Refresh the page to re-download the model.');
            
        } catch (error) {
            console.error('❌ Error clearing cache:', error);
            alert('Error clearing cache. Try using browser developer tools instead.');
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new OrcSimulator();
}); 