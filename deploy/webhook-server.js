/**
 * Servidor de Webhook para Deploy Automático
 * Recebe webhooks do GitHub e executa o script de deploy
 * 
 * Uso: node webhook-server.js
 * Porta padrão: 9000
 */

const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');

// ========================================
// CONFIGURAÇÕES - AJUSTE CONFORME NECESSÁRIO
// ========================================
const CONFIG = {
  port: process.env.WEBHOOK_PORT || 9000,
  secret: process.env.WEBHOOK_SECRET || 'seu_secret_aqui', // Mesmo secret configurado no GitHub
  deployScript: '/var/www/pccr/deploy/deploy.sh',
  logFile: '/var/log/webhook-server.log',
  allowedBranch: 'main' // Só faz deploy para esta branch
};

// Função de log
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(CONFIG.logFile, logMessage);
}

// Verifica assinatura do GitHub
function verifySignature(payload, signature) {
  if (!signature) return false;
  
  const hmac = crypto.createHmac('sha256', CONFIG.secret);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

// Executa o deploy
function runDeploy() {
  log('Executando script de deploy...');
  
  exec(`bash ${CONFIG.deployScript}`, (error, stdout, stderr) => {
    if (error) {
      log(`ERRO no deploy: ${error.message}`);
      log(`stderr: ${stderr}`);
      return;
    }
    log(`Deploy executado com sucesso!`);
    log(`stdout: ${stdout}`);
  });
}

// Servidor HTTP
const server = http.createServer((req, res) => {
  // Health check
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // Apenas POST para webhook
  if (req.method !== 'POST' || req.url !== '/webhook') {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    const signature = req.headers['x-hub-signature-256'];
    
    // Verifica assinatura
    if (!verifySignature(body, signature)) {
      log('ERRO: Assinatura inválida');
      res.writeHead(401);
      res.end('Unauthorized');
      return;
    }

    try {
      const payload = JSON.parse(body);
      const event = req.headers['x-github-event'];
      
      log(`Evento recebido: ${event}`);
      
      // Só processa push events
      if (event !== 'push') {
        log(`Evento ${event} ignorado (não é push)`);
        res.writeHead(200);
        res.end('OK - Event ignored');
        return;
      }

      // Verifica se é a branch correta
      const branch = payload.ref?.replace('refs/heads/', '');
      if (branch !== CONFIG.allowedBranch) {
        log(`Branch ${branch} ignorada (esperado: ${CONFIG.allowedBranch})`);
        res.writeHead(200);
        res.end('OK - Branch ignored');
        return;
      }

      log(`Push detectado na branch ${branch} por ${payload.pusher?.name}`);
      log(`Commit: ${payload.head_commit?.message}`);
      
      // Responde imediatamente
      res.writeHead(200);
      res.end('OK - Deploy iniciado');
      
      // Executa deploy em background
      runDeploy();
      
    } catch (error) {
      log(`ERRO ao processar payload: ${error.message}`);
      res.writeHead(400);
      res.end('Bad Request');
    }
  });
});

server.listen(CONFIG.port, () => {
  log(`========================================`);
  log(`Webhook server iniciado na porta ${CONFIG.port}`);
  log(`Endpoint: http://localhost:${CONFIG.port}/webhook`);
  log(`Health check: http://localhost:${CONFIG.port}/health`);
  log(`========================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('Recebido SIGTERM, encerrando...');
  server.close(() => {
    log('Servidor encerrado');
    process.exit(0);
  });
});
