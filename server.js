import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const types = { '.css':'text/css', '.html':'text/html', '.js':'text/javascript', '.svg':'image/svg+xml' };

createServer((request, response) => {
  const requestPath = request.url === '/' ? 'index.html' : request.url.split('?')[0].replace(/^\//, '');
  const filePath = normalize(join(root, requestPath));
  if (!filePath.startsWith(root) || !existsSync(filePath)) { response.writeHead(404); response.end(); return; }
  response.writeHead(200, { 'Content-Type':types[extname(filePath)] || 'application/octet-stream' });
  createReadStream(filePath).pipe(response);
}).listen(8080);
