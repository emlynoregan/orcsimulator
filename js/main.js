// Landing Page JavaScript
class LandingPage {
    constructor() {
        this.startButton = document.getElementById('start-game-btn');
        this.compatibilityStatus = document.getElementById('compatibility-status');
        this.compatibilityWarning = document.getElementById('compatibility-warning');
        
        this.init();
    }

    init() {
        this.checkBrowserCompatibility();
        this.bindEvents();
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
            <div class="status-compatible">
                ✅ Your browser is compatible!
            </div>
        `;
        this.compatibilityStatus.classList.add('status-compatible');
        this.startButton.disabled = false;
    }

    showIncompatibleStatus(issues) {
        this.compatibilityStatus.innerHTML = `
            <div class="status-incompatible">
                ❌ Browser compatibility issues detected
            </div>
        `;
        this.compatibilityStatus.classList.add('status-incompatible');
        
        this.compatibilityWarning.innerHTML = `
            <strong>Issues found:</strong><br>
            ${issues.map(issue => `• ${issue}`).join('<br>')}
        `;
        this.compatibilityWarning.style.display = 'block';
        
        this.startButton.disabled = true;
    }

    bindEvents() {
        this.startButton.addEventListener('click', () => {
            this.startGame();
        });
    }

    startGame() {
        this.startButton.classList.add('loading');
        this.startButton.disabled = true;
        
        setTimeout(() => {
            window.location.href = 'game.html';
        }, 500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LandingPage();
}); 