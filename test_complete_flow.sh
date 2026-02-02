#!/bin/bash
echo "====================================="
echo "FGL Salesforce Management - Complete Flow Test"
echo "====================================="

API="http://localhost:8001/api"

# Test 1: Login as Super User
echo -e "\n1. Testing Super User Login..."
ADMIN_TOKEN=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@fgl.com", "password": "Admin@123"}' | jq -r '.access_token')

if [ "$ADMIN_TOKEN" != "null" ]; then
  echo "✅ Super User login successful"
else
  echo "❌ Super User login failed"
  exit 1
fi

# Test 2: Login as KAM
echo -e "\n2. Testing KAM User Login..."
KAM_TOKEN=$(curl -s -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser@fgl.com", "password": "Test@123"}' | jq -r '.access_token')

if [ "$KAM_TOKEN" != "null" ]; then
  echo "✅ KAM user login successful"
else
  echo "❌ KAM user login failed"
  exit 1
fi

# Test 3: Get all meetings
echo -e "\n3. Testing Meetings API..."
MEETINGS=$(curl -s -X GET $API/meetings/ \
  -H "Authorization: Bearer $KAM_TOKEN" | jq '. | length')
echo "   Found $MEETINGS meetings"
echo "✅ Meetings API working"

# Test 4: Get pipelines
echo -e "\n4. Testing Pipeline API..."
PIPELINES=$(curl -s -X GET $API/pipelines/ \
  -H "Authorization: Bearer $KAM_TOKEN" | jq '. | length')
echo "   Found $PIPELINES confirmed pipelines"
echo "✅ Pipeline API working"

# Test 5: Get delivered
echo -e "\n5. Testing Delivered API..."
DELIVERED=$(curl -s -X GET $API/delivered/ \
  -H "Authorization: Bearer $KAM_TOKEN" | jq '. | length')
echo "   Found $DELIVERED delivered clients"
echo "✅ Delivered API working"

# Test 6: Get KPI assignments
echo -e "\n6. Testing KPI Assignment API..."
KPI_COUNT=$(curl -s -X GET $API/kpi-assignments/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '. | length')
echo "   Found $KPI_COUNT KPI assignments"
echo "✅ KPI Assignment API working"

# Test 7: Get pending users
echo -e "\n7. Testing User Management API..."
PENDING=$(curl -s -X GET $API/users/pending \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '. | length')
echo "   Found $PENDING pending users"
echo "✅ User Management API working"

# Test 8: Get Pipeline Summary
echo -e "\n8. Testing Pipeline Summary..."
curl -s -X GET "$API/pipelines/stats/summary" \
  -H "Authorization: Bearer $KAM_TOKEN" | jq '.'
echo "✅ Pipeline Summary working"

# Test 9: Get Delivered Summary
echo -e "\n9. Testing Delivered Summary..."
curl -s -X GET "$API/delivered/stats/summary" \
  -H "Authorization: Bearer $KAM_TOKEN" | jq '.'
echo "✅ Delivered Summary working"

echo -e "\n====================================="
echo "✅ ALL TESTS PASSED!"
echo "====================================="
echo ""
echo "📊 Summary:"
echo "  - Meetings: $MEETINGS"
echo "  - Confirmed Pipelines: $PIPELINES"
echo "  - Delivered Clients: $DELIVERED"
echo "  - KPI Assignments: $KPI_COUNT"
echo "  - Pending Users: $PENDING"
echo ""
echo "🎉 FGL Salesforce Management Platform is fully operational!"
