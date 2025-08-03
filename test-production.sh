#!/bin/bash

echo "🧪 YKS Mentor Production Test Script"

DOMAIN="https://yagmur.arslantash.com"

echo "1. Frontend test ediliyor..."
curl -s -o /dev/null -w "%{http_code}" $DOMAIN
if [ $? -eq 0 ]; then
    echo "✅ Frontend erişilebilir"
else
    echo "❌ Frontend erişim hatası"
fi

echo "2. API health check..."
curl -s "$DOMAIN/api/health" | jq .
if [ $? -eq 0 ]; then
    echo "✅ Backend API çalışıyor"
else
    echo "❌ Backend API hatası"
fi

echo "3. Register endpoint test..."
curl -X POST "$DOMAIN/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "TestPassword123",
    "role": "student",
    "grade_level": "12",
    "target_field": "sayisal"
  }' | jq .

echo "✅ Production test tamamlandı!"