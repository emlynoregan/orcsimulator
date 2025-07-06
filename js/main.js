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
        
        // Game state management
        this.gameState = {
            currentTab: 'game',
            gameState: 'waiting_for_user', // 'waiting_for_user' or 'munch_thinking'
            statusMessage: "You are in a cave. Munch the orc stands before you. He has an amulet and a large axe. He looks very angry.",
            munchLastWords: "A human is in me cave! Me is MUNCH, the big strong orc!"
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
        this.speechContent = document.getElementById('speech-content');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.stateIndicator = document.getElementById('state-indicator');
        this.restartButton = document.getElementById('restart-btn');
        
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
            if (e.key === 'Enter' && !e.shiftKey && this.gameState.gameState !== 'munch_thinking') {
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
        
        // Initialize game state
        this.updateGameInterface();
        
        // Initialize conversation history with the initial message
        if (this.conversationHistory.length === 0) {
            this.conversationHistory = [
                { role: 'assistant', content: this.gameState.munchLastWords }
            ];
        }
        
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
        
        // Update Munch's speech
        this.speechContent.textContent = this.gameState.munchLastWords;
        
        // Update state indicator and controls
        if (this.gameState.gameState === 'munch_thinking') {
            this.stateIndicator.classList.add('thinking');
            this.userInput.disabled = true;
            this.sendButton.disabled = true;
            this.sendButton.querySelector('.send-text').style.display = 'none';
            this.sendButton.querySelector('.thinking-text').style.display = 'inline';
            this.userInput.placeholder = 'Munch is thinking...';
        } else {
            this.stateIndicator.classList.remove('thinking');
            this.userInput.disabled = false;
            this.sendButton.disabled = false;
            this.sendButton.querySelector('.send-text').style.display = 'inline';
            this.sendButton.querySelector('.thinking-text').style.display = 'none';
            this.userInput.placeholder = 'What do you say to Munch?';
        }
    }

    updateStatusMessage(message) {
        this.gameState.statusMessage = message;
        this.statusMessage.textContent = message;
    }

    updateMunchSpeech(speech) {
        this.gameState.munchLastWords = speech;
        this.speechContent.textContent = speech;
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

    async sendMessage() {
        if (this.isLoading || this.gameState.gameState === 'munch_thinking') return;
        
        const userMessage = this.userInput.value.trim();
        if (!userMessage) return;

        // Add user message to conversation history
        this.conversationHistory.push({ role: 'user', content: userMessage });
        this.userInput.value = '';
        
        // Update game state to thinking
        this.updateGameState('munch_thinking');
        
        try {
            const response = await this.generateResponse(userMessage);
            
            // Update Munch's speech and add to history
            this.updateMunchSpeech(response);
            this.addToHistory(userMessage, response);
            
            // Add assistant response to conversation history
            this.conversationHistory.push({ role: 'assistant', content: response });
        } catch (error) {
            console.error('Error generating response:', error);
            const errorMessage = 'GRRRR! Munch brain hurt! Try again!';
            this.updateMunchSpeech(errorMessage);
            this.addToHistory(userMessage, errorMessage);
            this.conversationHistory.push({ role: 'assistant', content: errorMessage });
        }
        
        // Update game state back to waiting
        this.updateGameState('waiting_for_user');
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
        
        const fullPrompt = `${OrcSimulator.SYSTEM_PROMPT}\n\n${conversationContext}`;

        console.log(fullPrompt);
        
        const completion = await this.wllama.createCompletion(fullPrompt, {
            nPredict: 50,
            sampling: {
                temp: 0.85,
                top_k: 40,
                top_p: 0.9,
            },
        });

        console.log(completion);
        
        // Clean the response: remove everything from any terminating string onward (case insensitive)
        let cleanedResponse = completion.trim();
        const terminatingStrings = ['user:', '---', 'assistant:', 'human:', 'munch:'];
        let earliestIndex = cleanedResponse.length;
        
        // Find the earliest occurrence of any terminating string
        for (const terminator of terminatingStrings) {
            const index = cleanedResponse.toLowerCase().indexOf(terminator);
            if (index !== -1 && index < earliestIndex) {
                earliestIndex = index;
            }
        }
        
        // If we found any terminating string, cut the response there
        if (earliestIndex < cleanedResponse.length) {
            cleanedResponse = cleanedResponse.substring(0, earliestIndex).trim();
        }

        console.log(cleanedResponse);
        
        return cleanedResponse;
    }



    restartConversation() {
        // Reset game state
        this.gameState.statusMessage = "You are in a cave. Munch the orc stands before you. He has an amulet and a large axe. He looks very angry.";
        this.gameState.munchLastWords = "A human is in me cave! Me is MUNCH, the big strong orc!";
        this.gameState.gameState = 'waiting_for_user';
        
        // Reset conversation history
        this.conversationHistory = [
            { role: 'assistant', content: this.gameState.munchLastWords }
        ];
        
        // Clear history tab
        this.clearHistory();
        
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