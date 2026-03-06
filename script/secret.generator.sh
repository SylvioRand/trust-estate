#!/bin/bash

SECRET_DIR="./secret/jwtTokenService"

mkdir -p "$SECRET_DIR"

if (ls "$SECRET_DIR"/*.key 1> /dev/null 2>&1) || (ls "$SECRET_DIR"/*.pem 1> /dev/null 2>&1); then
	echo "Les secrets existent déjà dans le dossier $SECRET_DIR."
	exit 0
fi

openssl genpkey -algorithm RSA -out "$SECRET_DIR/jwt_auth_private.key" -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in "$SECRET_DIR/jwt_auth_private.key" -out "$SECRET_DIR/jwt_auth_public.pem"