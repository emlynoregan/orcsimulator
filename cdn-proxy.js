const http = require('http');
const https = require('https');
const url = require('url');

const PORT = 8001;

const CDN_MAPPINGS = {
    '/wllama/': 'https://cdn.jsdelivr.net/npm/@wllama/wllama@2.3.1/dist/',
    '/coi-serviceworker/': 'https://cdn.jsdelivr.net/npm/coi-serviceworker@0.1.9/'
};

function forwardRequest(req, res, targetUrl) {
    const options = url.parse(targetUrl);
    options.headers = {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Accept': req.headers['accept'] || '*/*'
    };

    const protocol = options.protocol === 'https:' ? https : http;
    
    const proxyReq = protocol.request(options, (proxyRes) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        
        res.statusCode = proxyRes.statusCode;
        Object.keys(proxyRes.headers).forEach(key => {
            if (key.toLowerCase() !== 'access-control-allow-origin') {
                res.setHeader(key, proxyRes.headers[key]);
            }
        });

        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.error('Proxy error:', err.message);
        res.statusCode = 500;
        res.end('Proxy error: ' + err.message);
    });

    proxyReq.end();
}

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.statusCode = 200;
        res.end();
        return;
    }

    const requestPath = req.url;
    let targetUrl = null;

    for (const [localPath, cdnBase] of Object.entries(CDN_MAPPINGS)) {
        if (requestPath.startsWith(localPath)) {
            const remainingPath = requestPath.substring(localPath.length);
            targetUrl = cdnBase + remainingPath;
            break;
        }
    }

    if (targetUrl) {
        forwardRequest(req, res, targetUrl);
    } else {
        res.statusCode = 404;
        res.end('CDN path not found');
    }
});

server.listen(PORT, () => {
    console.log(`CDN Proxy running on http://localhost:${PORT}`);
    console.log('Available: /wllama/ and /coi-serviceworker/');
});

module.exports = server; 