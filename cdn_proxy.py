import http.server
import urllib.request
import urllib.parse

PORT = 8001

CDN_MAPPINGS = {
    '/wllama/': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.2/esm/',
    '/wllama/single-thread/': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.2/esm/single-thread/',
    '/wllama/multi-thread/': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.2/esm/multi-thread/'
}

class CDNProxyHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        request_path = self.path
        target_url = None
        
        for local_path, cdn_base in CDN_MAPPINGS.items():
            if request_path.startswith(local_path):
                remaining_path = request_path[len(local_path):]
                target_url = cdn_base + remaining_path
                break
        
        if not target_url:
            self.send_error(404, "CDN path not found")
            return
        
        try:
            req = urllib.request.Request(target_url)
            req.add_header('User-Agent', 'Mozilla/5.0')
            
            with urllib.request.urlopen(req, timeout=30) as response:
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
                self.send_header('Content-Type', response.headers.get('Content-Type', 'application/octet-stream'))
                self.end_headers()
                
                data = response.read()
                self.wfile.write(data)
                print(f"Proxied: {request_path} -> {target_url}")
                
        except Exception as e:
            print(f"Error: {e}")
            self.send_error(500, str(e))

def main():
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, CDNProxyHandler)
    print(f"CDN Proxy running on http://localhost:{PORT}")
    print("Available: /wllama/ (wllama AI library endpoints)")
    httpd.serve_forever()

if __name__ == "__main__":
    main() 