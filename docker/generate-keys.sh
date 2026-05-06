#!/bin/bash
# Generate JWT anon key for PostgREST (Supabase-compatible)
# Usage: ./docker/generate-keys.sh > .env.production

JWT_SECRET="medicare-pro-jwt-secret-2026-$(openssl rand -hex 8)"

# Generate anon key JWT (role: anon, no expiry)
# Header: {"alg":"HS256","typ":"JWT"}
HEADER=$(echo -n '{"alg":"HS256","typ":"JWT"}' | base64 -w0 | tr '+/' '-_' | tr -d '=')
PAYLOAD=$(echo -n '{"role":"anon","iss":"medicare-pro","iat":'"$(date +%s)"'}' | base64 -w0 | tr '+/' '-_' | tr -d '=')
SIGNATURE=$(echo -n "${HEADER}.${PAYLOAD}" | openssl dgst -sha256 -hmac "${JWT_SECRET}" -binary | base64 -w0 | tr '+/' '-_' | tr -d '=')
ANON_KEY="${HEADER}.${PAYLOAD}.${SIGNATURE}"

cat <<EOF
# MediCare Pro - Production Environment
# Generated on $(date -u +%Y-%m-%dT%H:%M:%SZ)

# Database
DB_PASSWORD=MediCare@Pg2026

# JWT (PostgREST)
JWT_SECRET=${JWT_SECRET}
ANON_KEY=${ANON_KEY}

# VPS
VPS_HOST=2.24.80.103

# N8N (optional)
VITE_N8N_WEBHOOK_URL=
EOF
