#!/bin/bash
set -euo pipefail

# =============================================================================
# Claude Code Docker Setup
# =============================================================================
# Cria um ambiente Docker com sessão persistente do Claude Code.
# Execute na raiz do seu projeto: bash setup-claude-docker.sh
# Para retomar depois: ./start-claude.sh
# =============================================================================

PROJECT_NAME=$(basename "$(pwd)")
# Docker exige nomes em minúsculas sem espaços ou caracteres especiais
PROJECT_NAME_SAFE=$(echo "${PROJECT_NAME}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9._-]/-/g')
PROJECT_DIR=$(pwd)
CLAUDE_HOST_DIR="${HOME}/.claude"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

step()    { echo -e "${BLUE}[→]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warn()    { echo -e "${YELLOW}[!]${NC} $1"; }
error()   { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# --- Verificações ---
command -v docker &>/dev/null || error "Docker não encontrado. Instale o Docker antes de continuar."
sudo docker info &>/dev/null       || error "Docker daemon não está rodando."

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║       Claude Code — Docker Setup         ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "  Projeto : ${PROJECT_NAME}"
echo "  Sessões : ${CLAUDE_HOST_DIR}"
echo ""

# =============================================================================
# 1. Dockerfile
# =============================================================================
step "Criando Dockerfile.claude..."
cat > Dockerfile.claude << 'DOCKERFILE'
FROM node:22-slim

RUN apt-get update && apt-get install -y \
    git curl bash ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instala Claude Code globalmente
RUN npm install -g @anthropic-ai/claude-code

# Script de entrada: tenta continuar a última sessão; se não existir, inicia nova
COPY claude-entrypoint.sh /usr/local/bin/claude-entrypoint
RUN chmod +x /usr/local/bin/claude-entrypoint

WORKDIR /workspace

ENTRYPOINT ["/usr/local/bin/claude-entrypoint"]
DOCKERFILE
success "Dockerfile.claude criado"

# =============================================================================
# 2. Entrypoint — lógica de sessão persistente
# =============================================================================
step "Criando claude-entrypoint.sh..."
cat > claude-entrypoint.sh << 'ENTRYPOINT'
#!/bin/bash
# Tenta continuar a conversa mais recente do projeto atual.
# Se não existir histórico, inicia uma sessão nova normalmente.

SESSIONS_DIR="${HOME}/.claude/projects"
PROJECT_HASH=$(echo -n "$(pwd)" | md5sum | awk '{print $1}')
PROJECT_SESSION_DIR="${SESSIONS_DIR}/${PROJECT_HASH}"

if [ -d "${PROJECT_SESSION_DIR}" ] && \
   ls "${PROJECT_SESSION_DIR}"/*.jsonl 2>/dev/null | head -1 &>/dev/null; then
    echo "[Claude Docker] Retomando sessão anterior do projeto..."
    exec claude --continue "$@"
else
    echo "[Claude Docker] Iniciando nova sessão..."
    exec claude "$@"
fi
ENTRYPOINT
success "claude-entrypoint.sh criado"

# =============================================================================
# 3. docker-compose
# =============================================================================
step "Criando docker-compose.claude.yml..."
cat > docker-compose.claude.yml << COMPOSE
services:
  claude:
    build:
      context: .
      dockerfile: Dockerfile.claude
    image: claude-code-${PROJECT_NAME_SAFE}
    container_name: claude-${PROJECT_NAME_SAFE}
    stdin_open: true
    tty: true
    volumes:
      # Sessões, autenticação e memória persistidas do host
      - ${CLAUDE_HOST_DIR}:/root/.claude
      # Código do projeto montado no container
      - ${PROJECT_DIR}:/workspace
    environment:
      # Passa ANTHROPIC_API_KEY do host se existir (opcional — OAuth do ~/.claude também funciona)
      - ANTHROPIC_API_KEY=\${ANTHROPIC_API_KEY:-}
    working_dir: /workspace
COMPOSE
success "docker-compose.claude.yml criado"

# =============================================================================
# 4. Script de início rápido para uso futuro
# =============================================================================
step "Criando start-claude.sh..."
cat > start-claude.sh << 'START'
#!/bin/bash
# Inicia o Claude Code no Docker, retomando a última sessão do projeto.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo ""
echo "Iniciando Claude Code (sessão persistente)..."
echo "  • Histórico salvo em ~/.claude"
echo "  • Projeto montado em /workspace"
echo ""

docker compose -f docker-compose.claude.yml run --rm claude "$@"
START
chmod +x start-claude.sh
success "start-claude.sh criado"

# =============================================================================
# 5. .dockerignore (evita copiar node_modules e arquivos pesados)
# =============================================================================
if [ ! -f .dockerignore ]; then
    step "Criando .dockerignore..."
    cat > .dockerignore << 'IGNORE'
node_modules
.git
.env
*.log
dist
build
__pycache__
.pytest_cache
IGNORE
    success ".dockerignore criado"
fi

# =============================================================================
# 6. Build da imagem
# =============================================================================
echo ""
step "Construindo imagem Docker (pode levar alguns minutos na primeira vez)..."
sudo docker compose -f docker-compose.claude.yml build
success "Imagem construída com sucesso"

# =============================================================================
# 7. Inicia o container
# =============================================================================
echo ""
echo "────────────────────────────────────────────"
echo "  Iniciando Claude Code..."
echo "  Para retomar depois: ./start-claude.sh"
echo "────────────────────────────────────────────"
echo ""

docker compose -f docker-compose.claude.yml run --rm claude
