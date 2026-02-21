#!/bin/bash
# ============================================================
#  Test Rate Limiting — Headers de réponse
# ============================================================
# Affiche les headers de rate limit retournés par le serveur
# pour vérifier que les limites sont bien configurées
# ============================================================

BASE_URL="${1:-https://localhost:8443}"

echo "🔍 Vérification des headers de rate limit"
echo "==========================================="

echo ""
echo "📌 GET /api/listings/"
curl -sk -I "$BASE_URL/api/listings/" 2>&1 | grep -iE "(ratelimit|retry-after|HTTP)"

echo ""
echo "📌 GET /api/reservations/"
curl -sk -I "$BASE_URL/api/reservations/" 2>&1 | grep -iE "(ratelimit|retry-after|HTTP)"

echo ""
echo "📌 GET /api/credits/"
curl -sk -I "$BASE_URL/api/credits/" 2>&1 | grep -iE "(ratelimit|retry-after|HTTP)"

echo ""
echo "📌 GET /api/users/me"
curl -sk -I "$BASE_URL/api/users/me" 2>&1 | grep -iE "(ratelimit|retry-after|HTTP)"

echo ""
echo "📌 GET /api/ai/chat/"
curl -sk -I "$BASE_URL/api/ai/chat/" 2>&1 | grep -iE "(ratelimit|retry-after|HTTP)"

echo ""
echo "==========================================="
echo "x-ratelimit-limit     = limite max"
echo "x-ratelimit-remaining = requêtes restantes"
echo "x-ratelimit-reset     = reset dans N secondes"
