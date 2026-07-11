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
