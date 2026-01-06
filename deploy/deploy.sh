#!/bin/bash

# ==============================================
# Script de Deploy Automático - PCCR Calculator
# VPS: pccr.vikingtools.shop
# ==============================================

set -e

# Configurações - AJUSTE CONFORME SUA VPS
PROJECT_DIR="/var/www/pccr"
NGINX_DIR="/var/www/html"
BRANCH="main"
LOG_FILE="/var/log/pccr-deploy.log"

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "Iniciando deploy..."

# Navega para o diretório do projeto
cd "$PROJECT_DIR" || { log "ERRO: Diretório $PROJECT_DIR não encontrado"; exit 1; }

# Atualiza o código
log "Fazendo git pull..."
git fetch origin
git reset --hard origin/$BRANCH

# Instala dependências
log "Instalando dependências..."
npm install --legacy-peer-deps

# Build do projeto
log "Gerando build de produção..."
npm run build

# Copia para o Nginx
log "Copiando arquivos para $NGINX_DIR..."
sudo rm -rf "$NGINX_DIR"/*
sudo cp -r dist/* "$NGINX_DIR"/

# Ajusta permissões
sudo chown -R www-data:www-data "$NGINX_DIR"
sudo chmod -R 755 "$NGINX_DIR"

log "Deploy concluído com sucesso!"
log "=========================================="

exit 0
