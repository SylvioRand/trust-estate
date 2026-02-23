#!/bin/bash
# ============================================================
#  🚀 Lance TOUS les tests de rate limiting
# ============================================================
# Usage: bash run_all.sh [BASE_URL]
# Exemple: bash run_all.sh https://localhost:8443
# ============================================================

BASE_URL="${1:-https://localhost:8443}"
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Lancement de tous les tests de rate limiting"
echo "   URL: $BASE_URL"
echo "=============================================="

echo ""
echo "═══════════════════════════════════════════"
echo "  1/5 — Headers de rate limit"
echo "═══════════════════════════════════════════"
bash "$DIR/test_headers.sh" "$BASE_URL"

echo ""
echo "═══════════════════════════════════════════"
echo "  2/5 — Route /api/listings/"
echo "═══════════════════════════════════════════"
bash "$DIR/test_listings.sh" "$BASE_URL"

sleep 2

echo ""
echo "═══════════════════════════════════════════"
echo "  3/5 — Route /api/reservations/"
echo "═══════════════════════════════════════════"
bash "$DIR/test_reservations.sh" "$BASE_URL"

sleep 2

echo ""
echo "═══════════════════════════════════════════"
echo "  4/5 — Route /api/ai/chat/"
echo "═══════════════════════════════════════════"
bash "$DIR/test_ai_chat.sh" "$BASE_URL"

sleep 2

echo ""
echo "═══════════════════════════════════════════"
echo "  5/5 — Route /api/auth/forgot-password"
echo "═══════════════════════════════════════════"
bash "$DIR/test_forgot_password.sh" "$BASE_URL"

echo ""
echo "=============================================="
echo "✅ Tous les tests terminés"
echo "⚠️  Attendez ~1 minute avant de relancer"
