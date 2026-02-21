#!/bin/bash
# ============================================================
#  Test Rate Limiting — Route /api/auth/forgot-password (Fastify: 1r/m)
# ============================================================
# ⚠️ Ce test est séquentiel car on veut prouver que la 2ème est bloquée
# ============================================================

BASE_URL="${1:-https://localhost:8443}"

echo "🔍 Test rate limiting: POST $BASE_URL/api/auth/forgot-password"
echo "   Limite: 1r/m par email+IP (Fastify)"
echo "   Envoi de 3 requêtes séquentielles..."
echo "-------------------------------------------"

for i in $(seq 1 3); do
  STATUS=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 10 \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"ratelimit-test@example.com"}' \
    "$BASE_URL/api/auth/forgot-password")

  if [ "$STATUS" = "429" ]; then
    echo "❌ Req $i: $STATUS (RATE LIMITED) ← attendu à partir de la req 2"
  else
    echo "✅ Req $i: $STATUS"
  fi
done

echo ""
echo "-------------------------------------------"
echo "⚠️  Attendez 1 minute avant de relancer ce test"
