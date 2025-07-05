# 🚀 Deployment Guide - Orc Simulator

## 🎯 **Universal Compatibility**

This game now uses a **smart CDN fallback mechanism** that works on both:
- 🏠 **Local Development** (localhost with proxy)
- 🌐 **GitHub Pages** (direct CDN access)

## 🔧 **How It Works**

### **Automatic Detection System**
The game automatically detects the environment and chooses the best loading method:

1. **First, tries CDN** (GitHub Pages compatible):
   ```javascript
   import("https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.2/esm/index.js")
   ```

2. **If CDN fails, uses local proxy** (localhost development):
   ```javascript
   import("http://localhost:8001/wllama/index.js")
   ```

### **Console Output**
You'll see these messages in browser console:
- ✅ `"Loaded wllama from CDN"` - GitHub Pages
- ❌ `"CDN failed, trying local proxy..."` - localhost
- ✅ `"Loaded wllama from local proxy"` - localhost fallback

## 📦 **GitHub Pages Deployment**

### **Simple 3-Step Process:**

1. **Push to GitHub** (no changes needed):
   ```bash
   git add .
   git commit -m "Add Orc Simulator with CDN fallback"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `(root)`

3. **Access your game**:
   - URL: `https://yourusername.github.io/your-repo-name/orcsimulator/`

### **What Happens on GitHub Pages:**
- ✅ **CDN loads directly** (no proxy needed)
- ✅ **coi-serviceworker.min.js** served locally
- ✅ **All files served over HTTPS**
- ✅ **Full WebAssembly support**

## 🏠 **Local Development**

### **Run Locally:**
```bash
cd orcsimulator
python run_game.py
```

### **What Happens Locally:**
- ❌ **CDN blocked** (localhost CORS issues)
- ✅ **Proxy fallback** kicks in automatically
- ✅ **Local CDN proxy** handles wllama files
- ✅ **Same functionality** as GitHub Pages

## 🔍 **Testing Both Environments**

### **Test CDN Fallback:**
1. **Local**: Visit `http://localhost:8000/game.html`
   - Should see: `"CDN failed, trying local proxy..."`
   - Should see: `"Loaded wllama from local proxy"`

2. **GitHub Pages**: Visit your deployed URL
   - Should see: `"Loaded wllama from CDN"`

## 🎉 **Benefits**

- 🌟 **Zero configuration** - works everywhere
- 🚀 **No build process** - just push to GitHub
- 🔄 **Automatic fallback** - handles environment differences
- 📱 **Mobile compatible** - works on all devices
- ⚡ **Fast loading** - uses CDN when available

## 📁 **Required Files for GitHub Pages**

Only these files are needed (no proxy required):
- `index.html` - Landing page
- `game.html` - Game interface
- `coi-serviceworker.min.js` - Local service worker
- `css/` - Stylesheets
- `js/` - Game logic
- `docs/` - Documentation

**Not needed on GitHub Pages:**
- `cdn_proxy.py` - Only for local development
- `run_game.py` - Only for local development
- `start_server.py` - Only for local development 