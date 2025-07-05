# 🧌 Orc Simulator

A browser-based AI chat game where you interact with Munch, an angry orc who guards a magic amulet. The entire game runs client-side using WebAssembly and a small language model - no servers required!

## Features

- **100% Browser-based**: No backend servers or API keys needed
- **AI-Powered NPC**: Chat with Munch using Qwen2-0.5B-Instruct model
- **Offline-capable**: Works without internet after initial model download
- **Responsive Design**: Works on desktop and mobile devices
- **Privacy-focused**: All interactions happen locally in your browser

## How to Play

1. **Start**: Open `index.html` in a modern web browser
2. **Wait**: The game downloads a 120MB AI model on first load
3. **Chat**: Type messages to interact with Munch the orc
4. **Explore**: Try different approaches - threats, offers, questions
5. **Restart**: Use the restart button to begin a fresh conversation

## System Requirements

- **Browser**: Chrome 91+, Firefox 89+, Safari 16.4+, iOS 16.4+
- **Memory**: At least 500MB RAM available
- **Storage**: 120MB for AI model download
- **Connection**: Broadband internet for initial download

## Deployment

### GitHub Pages (Recommended)

1. Fork or clone this repository
2. Enable GitHub Pages in repository settings
3. Set source to main branch
4. Access via `https://yourusername.github.io/orcsimulator`

### Local Development

1. Clone the repository
2. Serve files using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

**Note**: Must be served over HTTP/HTTPS (not `file://`) due to CORS restrictions.

## Technical Details

### Architecture
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI Model**: Qwen2-0.5B-Instruct (quantized GGUF format)
- **Runtime**: wllama (WebAssembly)
- **Model Host**: Hugging Face CDN
- **Threading**: SharedArrayBuffer via coi-serviceworker

### File Structure
```
orcsimulator/
├── index.html          # Landing page
├── game.html           # Main game interface
├── css/
│   ├── style.css       # Global styles
│   ├── landing.css     # Landing page styles
│   └── game.css        # Game interface styles
├── js/
│   ├── main.js         # Landing page logic
│   └── game.js         # Game logic and AI integration
├── docs/               # Documentation
└── README.md
```

## Game Character

**Munch** is an angry orc who:
- Guards a precious magic amulet
- Distrusts humans by default
- Responds aggressively to threats
- Might soften when offered food
- Speaks in short, brutal sentences
- Has a simple but memorable personality

## Performance Tips

- **First Load**: Model download takes 1-5 minutes depending on connection
- **Subsequent Loads**: Game starts instantly (model cached locally)
- **Memory Usage**: ~500MB RAM during gameplay
- **Response Time**: 1-3 seconds per AI response on modern hardware

## Browser Compatibility

| Browser | Min Version | Status |
|---------|-------------|--------|
| Chrome | 91+ | ✅ Full support |
| Firefox | 89+ | ✅ Full support |
| Safari | 16.4+ | ✅ Full support |
| Edge | 91+ | ✅ Full support |
| iOS Safari | 16.4+ | ✅ Mobile support |

## Troubleshooting

### Model Won't Download
- Check internet connection
- Disable ad blockers temporarily
- Try incognito/private browsing mode
- Clear browser cache and reload

### Poor Performance
- Close other browser tabs
- Ensure browser supports SharedArrayBuffer
- Try on a different device
- Check available system memory

### Game Won't Load
- Verify browser compatibility
- Enable JavaScript
- Check browser console for errors
- Try a different browser

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- **AI Model**: Qwen2-0.5B-Instruct by Alibaba
- **WebAssembly Runtime**: wllama
- **Threading Support**: coi-serviceworker
- **Hosting**: GitHub Pages
- **Model CDN**: Hugging Face

## Version History

- **v1.0** (Current): Basic chat interface with Munch the orc
- **Planned**: Multiple characters, inventory system, achievements

---

*Built with ❤️ and AI. No servers harmed in the making of this game.*
