#!/usr/bin/env bash
set -e

mkdir -p secrets/ai

openssl genrsa -out secrets/ai/ca.key 4096
openssl req -x509 -new -nodes \
	-key secrets/ai/ca.key \
	-sha256 -days 3650 \
	-subj "/CN=trust-estate-internal-ca" \
	-out secrets/ai/ca.crt

openssl genrsa -out secrets/ai/ai.key 2048
openssl req -new \
	-key secrets/ai/ai.key \
	-subj "/CN=ai-service" \
	-out secrets/ai/ai.csr

openssl x509 -req \
	-in secrets/ai/ai.csr \
	-CA secrets/ai/ca.crt \
	-CAkey secrets/ai/ca.key \
	-CAcreateserial \
	-out secrets/ai/ai.crt \
	-days 825 -sha256 \
	-extfile <(printf "subjectAltName=DNS:ai-service,DNS:localhost")

chmod 600 secrets/ai/ca.key secrets/ai/ai.key
chmod 644 secrets/ai/ca.crt secrets/ai/ai.crt
