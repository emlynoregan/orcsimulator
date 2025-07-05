import subprocess
import time
import webbrowser
import sys

def main():
    print("🧌 Starting Orc Simulator with CDN Proxy...")
    
    processes = []
    
    try:
        # Start CDN proxy
        print("🔄 Starting CDN proxy...")
        cdn_process = subprocess.Popen(['python', 'cdn_proxy.py'])
        processes.append(cdn_process)
        time.sleep(2)
        
        # Start game server  
        print("🎮 Starting game server...")
        game_process = subprocess.Popen(['python', '-m', 'http.server', '8000'])
        processes.append(game_process)
        time.sleep(2)
        
        print("✅ Both servers started!")
        print("🌐 Opening game at http://localhost:8000")
        webbrowser.open('http://localhost:8000')
        
        print("Press Ctrl+C to stop servers...")
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        for process in processes:
            process.terminate()
        print("👋 Done!")

if __name__ == "__main__":
    main() 