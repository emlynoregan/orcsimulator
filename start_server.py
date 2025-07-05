#!/usr/bin/env python3
"""
Orc Simulator - Local Development Server
Starts a simple HTTP server to run the game locally.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import time
from pathlib import Path

# Configuration
PORT = 8000
HOST = "localhost"

def main():
    print("🧌 Orc Simulator - Starting Local Server")
    print("=" * 50)
    
    # Check if we're in the right directory
    current_dir = Path.cwd()
    if not (current_dir / "index.html").exists():
        print("❌ Error: index.html not found!")
        print("Please run this script from the orcsimulator directory.")
        return
    
    # Check if port is available
    try:
        with socketserver.TCPServer((HOST, PORT), http.server.SimpleHTTPRequestHandler) as httpd:
            print(f"✅ Server starting on {HOST}:{PORT}")
            print(f"📱 Game URL: http://{HOST}:{PORT}")
            print()
            print("🎮 The game will automatically open in your browser...")
            print("💡 If it doesn't open automatically, click the URL above")
            print()
            print("⚠️  Important Notes:")
            print("   • First load will download 120MB AI model")
            print("   • This may take 1-5 minutes depending on connection")
            print("   • Keep this terminal window open while playing")
            print("   • Press Ctrl+C to stop the server")
            print()
            print("🚀 Starting server...")
            print("-" * 50)
            
            # Wait a moment then open browser
            import threading
            def open_browser():
                time.sleep(2)
                try:
                    webbrowser.open(f"http://{HOST}:{PORT}")
                    print(f"🌐 Opened http://{HOST}:{PORT} in browser")
                except Exception as e:
                    print(f"⚠️  Could not auto-open browser: {e}")
                    print(f"   Please manually open: http://{HOST}:{PORT}")
            
            browser_thread = threading.Thread(target=open_browser)
            browser_thread.daemon = True
            browser_thread.start()
            
            # Start the server
            httpd.serve_forever()
            
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use!")
            print("   Try a different port or stop the existing server")
        else:
            print(f"❌ Error starting server: {e}")
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        print("👋 Thanks for playing Orc Simulator!")

if __name__ == "__main__":
    main() 