#!/bin/bash

# Symtri AI Tenant ID
TENANT_ID="c48decc4-98f5-4fe8-971f-5461d3e6ae1a"

echo "Testing RAG-powered SmartChat..."
echo ""

curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"What does Symtri AI do?\",
    \"tenantId\": \"$TENANT_ID\",
    \"language\": \"en\"
  }"

echo ""
echo ""
echo "Testing Spanish..."
echo ""

curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"message\": \"¿Cuánto cuesta SmartChat?\",
    \"tenantId\": \"$TENANT_ID\",
    \"language\": \"es\"
  }"
