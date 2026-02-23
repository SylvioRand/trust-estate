#!/bin/bash
# ============================================================
#  Test Rate Limiting — Route /api/reservations/ (api_limit: 120r/m, burst 10)
# ============================================================

BASE_URL="${1:-https://localhost:8443}"
TOTAL="${2:-15}"
RESULTS_DIR=$(mktemp -d)

echo "🔍 Test rate limiting: GET $BASE_URL/api/reservations/"
echo "   Zone: api_limit (120r/m, burst=10)"
echo "   Envoi de $TOTAL requêtes en parallèle..."
echo "-------------------------------------------"

for i in $(seq 1 $TOTAL); do
  (
    STATUS=$(curl -sk -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL/api/reservations/")
    echo "$i $STATUS" > "$RESULTS_DIR/$i"
  ) &
done

wait

OK=0; BLOCKED=0
for i in $(seq 1 $TOTAL); do
  if [ -f "$RESULTS_DIR/$i" ]; then
    read -r NUM STATUS < "$RESULTS_DIR/$i"
    if [ "$STATUS" = "429" ]; then
      echo "❌ Req $i: $STATUS (RATE LIMITED)"
      ((BLOCKED++))
    else
      echo "✅ Req $i: $STATUS"
      ((OK++))
    fi
  else
    echo "⏱️ Req $i: TIMEOUT"
  fi
done

rm -rf "$RESULTS_DIR"
echo ""
echo "-------------------------------------------"
echo "✅ Passées: $OK | ❌ Bloquées: $BLOCKED"
