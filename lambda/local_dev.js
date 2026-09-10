/**
 * Pixeva CRM — Local Lambda Development Server
 * ============================================
 * Runs all AWS Lambda microservices locally in a real HTTP server
 * matching AWS API Gateway & Lambda invocation protocols.
 * 
 * Usage:
 *   node lambda/local_dev.js
 *   OR npm run dev:lambda
 * 
 * Default URL: http://localhost:5001
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

// ─── 1. Load Environment Variables from .env.local or .env ───────────────────
function loadEnv() {
  const rootDir = path.resolve(__dirname, '..');
  const envFiles = ['.env.local', '.env', '.env.example'];

  for (const file of envFiles) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...rest] = trimmed.split('=');
          const value = rest.join('=').trim().replace(/^['"](.*)['"]$/, '$1');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      });
      console.log(`[local-lambda] Loaded environment from ${file}`);
      break;
    }
  }

  process.env.ENVIRONMENT = process.env.ENVIRONMENT || 'local';
  process.env.AWS_REGION = process.env.AWS_REGION || 'us-east-1';
  process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lmagwuarvxhhvoacezvl.supabase.co';
}

loadEnv();

// ─── 2. Auto-Discover Lambda Functions ────────────────────────────────────────
const FUNCTIONS_DIR = path.join(__dirname, 'functions');
const functionsMap = new Map();

function discoverFunctions() {
  if (!fs.existsSync(FUNCTIONS_DIR)) {
    console.error(`[local-lambda] Functions directory not found: ${FUNCTIONS_DIR}`);
    return;
  }

  const entries = fs.readdirSync(FUNCTIONS_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const funcName = entry.name;
      const indexPath = path.join(FUNCTIONS_DIR, funcName, 'index.js');
      if (fs.existsSync(indexPath)) {
        functionsMap.set(funcName, indexPath);
        // Also map standard route aliases (e.g. 'enquiries' -> 'enquiries-service')
        const routeAlias = funcName.replace(/-service$/, '');
        functionsMap.set(routeAlias, indexPath);
      }
    }
  }

  // Register domain aliases
  if (functionsMap.has('bookings')) {
    functionsMap.set('projects', functionsMap.get('bookings'));
  }
  if (functionsMap.has('studio-data')) {
    functionsMap.set('galleries', functionsMap.get('studio-data'));
    functionsMap.set('client-requests', functionsMap.get('studio-data'));
    functionsMap.set('finances', functionsMap.get('studio-data'));
    functionsMap.set('dashboard', functionsMap.get('studio-data'));
  }

  console.log('[local-lambda] Registered Lambda Functions:');
  const uniqueNames = new Set(Array.from(functionsMap.keys()));
  uniqueNames.forEach((name) => console.log(`  • /${name} -> ${path.basename(functionsMap.get(name))}`));
}

discoverFunctions();

// ─── 3. Function Executor with Hot-Reloading ─────────────────────────────────
async function invokeFunction(functionName, event) {
  const filePath = functionsMap.get(functionName);
  if (!filePath) {
    throw new Error(`Lambda function '${functionName}' not found.`);
  }

  // Clear module cache for instant hot-reloading during development
  delete require.cache[require.resolve(filePath)];
  const mod = require(filePath);

  if (typeof mod.handler !== 'function') {
    throw new Error(`Module at ${filePath} does not export a handler function.`);
  }

  return await mod.handler(event, {
    functionName,
    invokedFunctionArn: `arn:aws:lambda:us-east-1:123456789012:function:${functionName}`,
    getRemainingTimeInMillis: () => 30000,
    awsRequestId: `local-req-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  });
}

// ─── 4. Build API Gateway Event ──────────────────────────────────────────────
function buildApiGatewayEvent(req, bodyBuffer, parsedUrl) {
  const pathname = parsedUrl.pathname;
  const queryString = parsedUrl.query || '';
  const searchParams = new URLSearchParams(queryString);
  const queryParams = {};
  for (const [key, val] of searchParams.entries()) {
    queryParams[key] = val;
  }

  const isJson = (req.headers['content-type'] || '').includes('application/json');
  let body = bodyBuffer.length > 0 ? bodyBuffer.toString('utf-8') : null;

  return {
    version: '2.0',
    routeKey: '$default',
    rawPath: pathname,
    rawQueryString: queryString,
    headers: req.headers,
    queryStringParameters: Object.keys(queryParams).length > 0 ? queryParams : null,
    requestContext: {
      accountId: '123456789012',
      apiId: 'local-api-gateway',
      http: {
        method: req.method,
        path: pathname,
        protocol: 'HTTP/1.1',
        sourceIp: req.socket.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'local-dev-client',
      },
      stage: '$default',
      timeEpoch: Date.now(),
    },
    body: body,
    isBase64Encoded: false,
    httpMethod: req.method,
    path: pathname,
  };
}

// ─── 5. HTTP Request Handler ──────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token, X-Requested-With, x-account-id, X-Account-Id',
  'Access-Control-Max-Age': '86400',
};

const server = http.createServer(async (req, res) => {
  const startTime = Date.now();
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname.replace(/\/$/, '') || '/';

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, CORS_HEADERS);
    res.end();
    return;
  }

  // Collect Body
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', async () => {
    const bodyBuffer = Buffer.concat(chunks);
    const event = buildApiGatewayEvent(req, bodyBuffer, parsedUrl);

    // Root / Health Check
    if (pathname === '/' || pathname === '/health') {
      res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          status: 'online',
          service: 'Pixeva CRM Local Lambda Server',
          version: '1.0.0',
          environment: process.env.ENVIRONMENT,
          availableFunctions: Array.from(new Set(functionsMap.keys())),
          routes: [
            'GET/POST/PUT/DELETE /enquiries',
            'GET/POST/PUT/DELETE /bookings',
            'GET/POST/PUT/DELETE /contracts',
            'POST /pdf-generator',
            'POST /batch-email',
            'POST /2015-03-31/functions/{name}/invocations (AWS SDK)',
            'POST /invoke/{name}',
          ],
        }, null, 2)
      );
      return;
    }

    // Determine target function
    let targetFunction = null;

    // Pattern 1: AWS SDK / client-lambda standard invoke URL (/2015-03-31/functions/{name}/invocations)
    const awsSdkMatch = pathname.match(/^\/2015-03-31\/functions\/([^\/]+)\/invocations$/);
    if (awsSdkMatch) {
      targetFunction = awsSdkMatch[1];
    }

    // Pattern 2: /invoke/{name}
    const invokeMatch = pathname.match(/^\/invoke\/([^\/]+)$/);
    if (invokeMatch) {
      targetFunction = invokeMatch[1];
    }

    // Pattern 3: Direct route (e.g. /enquiries, /bookings, /contracts, /pdf-generator, /batch-email)
    if (!targetFunction) {
      const segment = pathname.split('/')[1];
      if (segment && functionsMap.has(segment)) {
        targetFunction = segment;
      }
    }

    if (!targetFunction || !functionsMap.has(targetFunction)) {
      res.writeHead(404, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'NotFound',
          message: `No Lambda function found matching path: ${pathname}`,
          availableFunctions: Array.from(new Set(functionsMap.keys())),
        })
      );
      return;
    }

    // Execute Function
    try {
      // If invoked directly through AWS SDK payload format
      let lambdaEvent = event;
      if (awsSdkMatch || invokeMatch) {
        try {
          const parsed = JSON.parse(bodyBuffer.toString('utf-8') || '{}');
          // If the payload already has event structure, use it; else merge
          lambdaEvent = parsed.httpMethod || parsed.requestContext ? parsed : { ...event, body: JSON.stringify(parsed), ...parsed };
        } catch {
          // Keep standard event
        }
      }

      const result = await invokeFunction(targetFunction, lambdaEvent);
      const duration = Date.now() - startTime;

      console.log(`[local-lambda] [${req.method}] ${pathname} -> ${targetFunction} | ${result.statusCode || 200} (${duration}ms)`);

      // If Lambda returned standard API Gateway format
      if (result && typeof result === 'object' && ('statusCode' in result || 'body' in result)) {
        const statusCode = result.statusCode || 200;
        const responseHeaders = { ...CORS_HEADERS, ...(result.headers || {}) };
        res.writeHead(statusCode, responseHeaders);

        if (typeof result.body === 'string') {
          res.end(result.body);
        } else if (result.body) {
          res.end(JSON.stringify(result.body));
        } else {
          res.end();
        }
      } else {
        // Direct object response
        res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result || { success: true }));
      }
    } catch (err) {
      const duration = Date.now() - startTime;
      console.error(`[local-lambda] ERROR in ${targetFunction} (${duration}ms):`, err);
      res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'LambdaExecutionError',
          function: targetFunction,
          message: err.message,
          stack: process.env.ENVIRONMENT === 'local' ? err.stack : undefined,
        })
      );
    }
  });
});

// ─── 6. Server Initialization ─────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || process.env.LAMBDA_PORT || '5001', 10);
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log('\n============================================================');
  console.log(`⚡ Pixeva Local Lambda Server is running!`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`🩺 Health & Routes: http://localhost:${PORT}/health`);
  console.log(`============================================================\n`);
});
