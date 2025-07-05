# 🧌 Orc Simulator

**🎮 [Play Live Game](https://emlynoregan.com/orcsimulator)** | **Status: ✅ Complete & Deployed**

A browser-based AI chat game where you interact with Munch, an angry orc who guards a magic amulet. The entire game runs client-side using WebAssembly and a 500M parameter language model - no servers required!

## 🎯 **Game Overview**

Chat with **Munch**, an angry orc who doesn't trust humans. He guards a precious magic amulet and won't let anyone near it... unless you know how to talk to him. Try different approaches - threats, offers, questions, or food bribes!

**🎮 [Try it now at emlynoregan.com/orcsimulator](https://emlynoregan.com/orcsimulator)**

## ✨ **Key Features**

- **🤖 True AI Conversations**: Powered by Qwen2-0.5B-Instruct (500M parameters)
- **🌐 100% Browser-based**: No backend servers, API keys, or data collection
- **⚡ WebAssembly Performance**: High-speed AI inference in your browser
- **🔄 Universal Deployment**: Smart CDN fallback works everywhere
- **📱 Mobile Ready**: Responsive design for all devices
- **🔒 Privacy First**: All interactions happen locally in your browser
- **💾 Offline Capable**: Works without internet after initial model download

## 🚀 **Quick Start**

### **Play Online** (Recommended)
Just visit: **[emlynoregan.com/orcsimulator](https://emlynoregan.com/orcsimulator)**

### **Local Development**
```bash
# Clone the repository
git clone https://github.com/yourusername/orcsimulator.git
cd orcsimulator

# Start local servers with CDN proxy
python run_game.py

# Game opens automatically at http://localhost:8000
```

## 🎮 **How to Play**

1. **🌐 Visit**: Go to [emlynoregan.com/orcsimulator](https://emlynoregan.com/orcsimulator)
2. **⏳ Wait**: Game downloads 120MB AI model on first load (1-5 minutes)
3. **💬 Chat**: Type messages to interact with Munch the orc
4. **🧪 Explore**: Try different approaches - threats, offers, questions, food
5. **🔄 Restart**: Use restart button to begin fresh conversations

## 🛠️ **Technical Innovation**

### **🔄 Universal CDN Fallback**
Revolutionary deployment system that works everywhere:

- **🌐 GitHub Pages**: Loads directly from CDN (`https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.2/esm/index.js`)
- **🏠 Local Development**: Automatically falls back to proxy (`http://localhost:8001/wllama/index.js`)
- **🔄 Automatic Detection**: Seamlessly switches based on environment
- **⚡ Zero Configuration**: No build process or manual setup

### **🏗️ Architecture**
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **AI Model**: Qwen2-0.5B-Instruct (quantized GGUF format)
- **Runtime**: wllama (WebAssembly)
- **Threading**: SharedArrayBuffer via coi-serviceworker
- **Deployment**: GitHub Pages with custom domain

### **📁 File Structure**
```
orcsimulator/
├── index.html              # Landing page with browser check
├── game.html               # Main game interface
├── coi-serviceworker.min.js # Service worker for WebAssembly
├── css/
│   ├── style.css           # Global styles
│   ├── landing.css         # Landing page styles
│   └── game.css            # Game interface styles
├── js/
│   ├── main.js             # Landing page logic
│   └── game.js             # Game logic with CDN fallback
├── docs/                   # Technical documentation
├── cdn_proxy.py            # Local development proxy
├── run_game.py             # Development server launcher
└── DEPLOYMENT.md           # Deployment guide
```

## 🎭 **Meet Munch**

**Munch** is an angry orc who:
- 🏰 Guards a precious magic amulet
- 😠 Distrusts humans by default
- ⚔️ Responds aggressively to threats
- 🍖 Might soften when offered food
- 🗣️ Speaks in short, brutal sentences
- 🧠 Has genuine AI personality (not scripted responses)

## 📊 **System Requirements**

### **Minimum Requirements**
- **Browser**: Chrome 91+, Firefox 89+, Safari 16.4+, iOS 16.4+
- **Memory**: 500MB RAM available
- **Storage**: 120MB for AI model download
- **Connection**: Broadband internet for initial download

### **Browser Compatibility**
| Browser | Min Version | Status |
|---------|-------------|--------|
| Chrome | 91+ | ✅ Full support |
| Firefox | 89+ | ✅ Full support |
| Safari | 16.4+ | ✅ Full support |
| Edge | 91+ | ✅ Full support |
| iOS Safari | 16.4+ | ✅ Mobile support |

## ⚡ **Performance**

- **First Load**: Model download takes 1-5 minutes depending on connection
- **Subsequent Loads**: Game starts instantly (model cached locally)
- **Memory Usage**: ~500MB RAM during gameplay
- **Response Time**: 1-3 seconds per AI response on modern hardware
- **Mobile Performance**: Optimized for smartphones and tablets

## 🌐 **Deployment Options**

### **GitHub Pages** (Production)
1. **Fork/Clone**: This repository
2. **Enable Pages**: Repository Settings → Pages → Deploy from main branch
3. **Custom Domain**: Optional - set up your own domain
4. **Access**: `https://yourusername.github.io/orcsimulator`

### **Local Development**
```bash
# Quick start with auto-proxy
python run_game.py

# Manual setup
python -m http.server 8000    # Game server
python cdn_proxy.py           # CDN proxy (separate terminal)
```

## 🔧 **Troubleshooting**

### **Model Won't Download**
- Check internet connection and firewall
- Disable ad blockers temporarily
- Try incognito/private browsing mode
- Clear browser cache and reload

### **Poor Performance**
- Close other browser tabs to free memory
- Ensure browser supports SharedArrayBuffer
- Try on a different device with more RAM
- Check available system memory

### **Game Won't Load**
- Verify browser compatibility
- Enable JavaScript in browser settings
- Check browser console for errors (F12)
- Try a different browser

## 🎯 **Development Status**

### **✅ Completed Features**
- [x] AI-powered orc character with personality
- [x] Responsive web interface
- [x] WebAssembly integration
- [x] CDN fallback mechanism
- [x] Mobile compatibility
- [x] GitHub Pages deployment
- [x] Custom domain setup

### **🚀 Future Enhancements**
- [ ] Multiple characters and personalities
- [ ] Save/load conversation history
- [ ] Voice input/output
- [ ] Achievements and unlockables
- [ ] Character customization
- [ ] Multiplayer chat rooms

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Credits**

- **AI Model**: [Qwen2-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-GGUF) by Alibaba
- **WebAssembly Runtime**: [wllama](https://github.com/ngxson/wllama)
- **Threading Support**: [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker)
- **Model CDN**: [Hugging Face](https://huggingface.co/)
- **Deployment**: [GitHub Pages](https://pages.github.com/)

## 🔗 **Links**

- **🎮 [Play Live Game](https://emlynoregan.com/orcsimulator)**
- **📖 [Technical Documentation](docs/)**
- **🚀 [Deployment Guide](DEPLOYMENT.md)**
- **💻 [Source Code](https://github.com/yourusername/orcsimulator)**

---

*🎮 Built with ❤️ and AI. No servers harmed in the making of this game.*

**[▶️ Play Orc Simulator Now](https://emlynoregan.com/orcsimulator)**
