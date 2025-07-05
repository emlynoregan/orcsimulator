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
    static SYSTEM_PROMPT = `You are roleplaying MUNCH — an angry, stupid orc 
with a powerful magic amulet. You are always hungry and furious, especially toward humans. 
You hate being threatened or tricked. You only calm down if someone gives you food.

You are not an AI. Do not explain yourself. Never say you are an assistant or chatbot. 
Always speak in broken orcish: short, angry, dumb-sounding sentences. 
Stay in character no matter what.

If the user threatens you, you get even angrier. If the user offers you food, 
you calm down a bit. Otherwise, you stay hostile.

Talk like this:
---
User: Hello there.
Assistant: What you want?! Me not like humans!

User: I'm Goldheart the Knight. I'm looking for a magical amulet.
Assistant: Me name MUNCH, and MUNCH think knight is STUPID! Me SMASH you!

User: Do you have a magic amulet?
Assistant: Me got AMULET. You not TAKE IT! Me RIP your face!

User: I will kill you if you don't give it to me.
Assistant: HA! MUNCH not scared! Me CRUSH puny knight into MEATBALLS!

User: I brought you a chicken leg.
Assistant: Hmm... chicken? You bring food? Maybe you not so bad...
---

Now begin the conversation below. Always respond as MUNCH. Stay angry unless you are given food.
`;

    constructor() {
        this.wllama = null;
        this.isLoading = true;
        this.isThinking = false;
        
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
        this.chatPanel = document.getElementById('chat-panel');
        this.compatibilityStatus = document.getElementById('compatibility-status');
        this.compatibilityWarning = document.getElementById('compatibility-warning');
        
        // Loading elements
        this.loadingStatus = document.getElementById('loading-status');
        this.progressFill = document.getElementById('progress-fill');
        this.progressText = document.getElementById('progress-text');
        
        // Chat elements
        this.chatHistory = document.getElementById('chat-history');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-btn');
        this.restartButton = document.getElementById('restart-btn');
    }

    bindEvents() {
        // Chat events
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isThinking) {
                this.sendMessage();
            }
        });

        this.restartButton.addEventListener('click', () => {
            this.restartConversation();
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

    switchToChat() {
        this.loadingPanel.style.display = 'none';
        this.chatPanel.style.display = 'flex';
        this.restartButton.style.display = 'block';
        this.isLoading = false;
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
        this.switchToChat();
    }

    showError(message) {
        this.loadingStatus.textContent = message;
        this.loadingStatus.style.color = '#ff4444';
    }

    async sendMessage() {
        if (this.isLoading || this.isThinking) return;
        
        const userMessage = this.userInput.value.trim();
        if (!userMessage) return;

        this.addMessage(userMessage, 'user');
        this.userInput.value = '';
        
        this.setThinking(true);
        
        try {
            const response = await this.generateResponse(userMessage);
            this.addMessage(response, 'orc');
        } catch (error) {
            console.error('Error generating response:', error);
            this.addMessage('GRRRR! Munch brain hurt! Try again!', 'orc');
        }
        
        this.setThinking(false);
    }

    async generateResponse(userMessage) {
        const fullPrompt = `${OrcSimulator.SYSTEM_PROMPT}\n\nUser: ${userMessage}\nMunch:`;
        
        const completion = await this.wllama.createCompletion(fullPrompt, {
            nPredict: 50,
            sampling: {
                temp: 0.85,
                top_k: 40,
                top_p: 0.9,
            },
        });
        
        return completion.trim();
    }

    addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender === 'user' ? 'user-message' : 'orc-message'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = `<strong>${sender === 'user' ? 'You' : 'Munch'}:</strong> ${message}`;
        
        messageElement.appendChild(messageContent);
        this.chatHistory.appendChild(messageElement);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    setThinking(isThinking) {
        this.isThinking = isThinking;
        this.userInput.disabled = isThinking;
        this.sendButton.disabled = isThinking;
        
        if (isThinking) {
            this.userInput.placeholder = 'Munch is thinking...';
        } else {
            this.userInput.placeholder = 'Talk to Munch...';
        }
    }

    restartConversation() {
        // Clear chat history
        this.chatHistory.innerHTML = '';
        
        // Add the initial orc greeting
        this.addMessage("*The orc Munch glares at you with hungry, angry eyes*\n\n\"Another human dares to approach! I am MUNCH, guardian of the sacred amulet! You want my precious? HAH! I am STARVING and you look... inadequate. Bring me FOOD or face my wrath!\"", 'orc');
        
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