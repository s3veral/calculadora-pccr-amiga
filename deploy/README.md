# Deploy Automático com Webhook do GitHub

Este guia configura deploy automático: quando você faz push no GitHub, a VPS atualiza automaticamente.

## 📁 Arquivos

- `deploy.sh` - Script que faz o deploy
- `webhook-server.js` - Servidor que recebe webhooks do GitHub
- `pccr-webhook.service` - Serviço systemd para rodar o webhook

---

## 🚀 Instalação na VPS

### 1. Copie os arquivos para a VPS

```bash
# Na VPS, crie o diretório
mkdir -p /var/www/pccr/deploy

# Copie os arquivos (ou faça git pull se já tem o repo)
cd /var/www/pccr
git pull origin main
```

### 2. Configure o script de deploy

```bash
# Dê permissão de execução
chmod +x /var/www/pccr/deploy/deploy.sh

# Edite as configurações se necessário
nano /var/www/pccr/deploy/deploy.sh
```

Ajuste as variáveis no início do arquivo:
- `PROJECT_DIR` - Diretório do projeto
- `NGINX_DIR` - Diretório onde o Nginx serve os arquivos
- `BRANCH` - Branch para deploy (geralmente `main`)

### 3. Configure o serviço do webhook

```bash
# Gere um secret seguro
openssl rand -hex 32
# Copie o resultado, você vai usar no GitHub também

# Edite o arquivo de serviço
nano /var/www/pccr/deploy/pccr-webhook.service
# Altere WEBHOOK_SECRET para o secret gerado

# Copie para systemd
sudo cp /var/www/pccr/deploy/pccr-webhook.service /etc/systemd/system/

# Recarregue o systemd
sudo systemctl daemon-reload

# Inicie o serviço
sudo systemctl start pccr-webhook

# Habilite para iniciar no boot
sudo systemctl enable pccr-webhook

# Verifique se está rodando
sudo systemctl status pccr-webhook
```

### 4. Configure o Nginx para proxy do webhook

Adicione ao seu arquivo de configuração do Nginx:

```nginx
# /etc/nginx/sites-available/pccr
server {
    listen 443 ssl;
    server_name pccr.vikingtools.shop;
    
    # ... suas configurações SSL existentes ...
    
    # Proxy para o webhook
    location /webhook {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Hub-Signature-256 $http_x_hub_signature_256;
        proxy_set_header X-GitHub-Event $http_x_github_event;
    }
    
    # Health check do webhook
    location /webhook/health {
        proxy_pass http://127.0.0.1:9000/health;
    }
    
    # ... resto da configuração ...
}
```

```bash
# Teste a configuração
sudo nginx -t

# Recarregue o Nginx
sudo systemctl reload nginx
```

### 5. Abra a porta no Oracle Cloud (se necessário)

Se o webhook não passar pelo Nginx (porta direta), abra a porta 9000:

```bash
# iptables
sudo iptables -I INPUT -p tcp --dport 9000 -j ACCEPT
sudo netfilter-persistent save
```

E também no painel do Oracle Cloud: 
- Networking → Virtual Cloud Networks → Security Lists → Adicionar regra para porta 9000

---

## 🔗 Configuração no GitHub

1. Vá para seu repositório no GitHub
2. Clique em **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - **Payload URL**: `https://pccr.vikingtools.shop/webhook`
   - **Content type**: `application/json`
   - **Secret**: O mesmo secret que você configurou no serviço
   - **Events**: Selecione "Just the push event"
4. Clique em **Add webhook**

---

## ✅ Testando

### Teste manual do webhook:

```bash
curl -X POST https://pccr.vikingtools.shop/webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: ping" \
  -d '{"zen": "test"}'
```

### Verificar logs:

```bash
# Logs do webhook server
sudo journalctl -u pccr-webhook -f

# Logs do deploy
tail -f /var/log/pccr-deploy.log

# Logs do webhook
tail -f /var/log/webhook-server.log
```

### Teste completo:

1. Faça uma alteração no Lovable
2. Aguarde o sync para o GitHub
3. Verifique os logs na VPS
4. Acesse o site para ver a atualização

---

## 🔧 Comandos Úteis

```bash
# Reiniciar o serviço de webhook
sudo systemctl restart pccr-webhook

# Ver status
sudo systemctl status pccr-webhook

# Deploy manual
/var/www/pccr/deploy/deploy.sh

# Ver últimos webhooks recebidos
tail -100 /var/log/webhook-server.log
```

---

## ⚠️ Troubleshooting

**Webhook não recebe eventos:**
- Verifique se a porta está aberta
- Verifique os logs do Nginx: `sudo tail -f /var/log/nginx/error.log`
- Teste o health check: `curl https://pccr.vikingtools.shop/webhook/health`

**Deploy falha:**
- Verifique permissões: `ls -la /var/www/pccr/deploy/`
- Verifique se npm está instalado: `which npm`
- Execute o script manualmente para ver erros: `bash -x /var/www/pccr/deploy/deploy.sh`

**Assinatura inválida:**
- Verifique se o secret é o mesmo no GitHub e no serviço
- Regenere o secret se necessário
