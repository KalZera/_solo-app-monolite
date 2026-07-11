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
