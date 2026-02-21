#!/bin/bash
# ============================================================
#  Test Rate Limiting — Simulation Brute Force Login
# ============================================================
# Simule un attaquant qui essaie des mots de passe en boucle
# Double protection : nginx (auth_limit: 100r/m) + Fastify (600r/m)
# ============================================================

BASE_URL="${1:-https://localhost:8443}"
TOTAL="${2:-30}"
RESULTS_DIR=$(mktemp -d)

echo "🔍 Simulation brute force: POST $BASE_URL/api/auth/login"
echo "   Protection nginx: auth_limit (100r/m, burst=20)"
echo "   Protection Fastify: 600r/m global"
echo "   Envoi de $TOTAL tentatives en parallèle..."
echo "-------------------------------------------"

for i in $(seq 1 $TOTAL); do
  (
    STATUS=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 10 \
      -X POST \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"hacker@test.com\",\"password\":\"attempt_$i\"}" \
      "$BASE_URL/api/auth/login")
    echo "$i $STATUS" > "$RESULTS_DIR/$i"
  ) &
done

wait

OK=0; BLOCKED=0; AUTH_FAIL=0
for i in $(seq 1 $TOTAL); do
  if [ -f "$RESULTS_DIR/$i" ]; then
    read -r NUM STATUS < "$RESULTS_DIR/$i"
    if [ "$STATUS" = "429" ]; then
      echo "🛡️ Req $i: $STATUS (BLOQUÉ — rate limited)"
      ((BLOCKED++))
    elif [ "$STATUS" = "401" ] || [ "$STATUS" = "400" ]; then
      echo "🔑 Req $i: $STATUS (passé — mauvais identifiants)"
      ((AUTH_FAIL++))
    else
      echo "❓ Req $i: $STATUS"
      ((OK++))
    fi
  else
    echo "⏱️ Req $i: TIMEOUT"
  fi
done

rm -rf "$RESULTS_DIR"

echo ""
echo "-------------------------------------------"
echo "🔑 Tentatives passées: $AUTH_FAIL"
echo "🛡️ Bloquées par rate limit: $BLOCKED"
echo ""
if [ $BLOCKED -gt 0 ]; then
  echo "✅ Le brute force est bien bloqué par le rate limiting !"
else
  echo "⚠️  Aucune requête bloquée — augmentez le nombre de tentatives"
fi
