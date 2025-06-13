#!/bin/bash

# MoMo Data Analysis API Test Script
# This script tests all the API endpoints with various parameters

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing MoMo Data Analysis API${NC}"
echo "========================================"

# Test 1: Health Check
echo -e "${GREEN}✅ Test 1: Health Check${NC}"
curl -s "$BASE_URL/health" | jq '.'
echo ""

# Test 2: API Root
echo -e "${GREEN}✅ Test 2: API Root Information${NC}"
curl -s "$BASE_URL/" | jq '.'
echo ""

# Test 3: Get All Transactions (Default)
echo -e "${GREEN}✅ Test 3: Get All Transactions (Default)${NC}"
curl -s "$BASE_URL/api/transactions" | jq '.pagination'
echo ""

# Test 4: Pagination Test
echo -e "${GREEN}✅ Test 4: Pagination (Page 1, Limit 5)${NC}"
curl -s "$BASE_URL/api/transactions?page=1&limit=5" | jq '.pagination'
echo ""

# Test 5: Pagination Test - Page 2
echo -e "${GREEN}✅ Test 5: Pagination (Page 2, Limit 3)${NC}"
curl -s "$BASE_URL/api/transactions?page=2&limit=3" | jq '.pagination'
echo ""

# Test 6: Filter by Transaction Type
echo -e "${GREEN}✅ Test 6: Filter by Transaction Type (INCOMING)${NC}"
curl -s "$BASE_URL/api/transactions?type=INCOMING&limit=3" | jq '.filters, .pagination'
echo ""

# Test 7: Filter by Amount Range
echo -e "${GREEN}✅ Test 7: Filter by Amount Range (1000-10000)${NC}"
curl -s "$BASE_URL/api/transactions?minAmount=1000&maxAmount=10000&limit=3" | jq '.filters, .pagination'
echo ""

# Test 8: Filter by Date Range
echo -e "${GREEN}✅ Test 8: Filter by Date Range${NC}"
curl -s "$BASE_URL/api/transactions?startDate=2024-01-01&endDate=2024-01-31&limit=3" | jq '.filters, .pagination'
echo ""

# Test 9: Filter by Exact Date
echo -e "${GREEN}✅ Test 9: Filter by Exact Date${NC}"
curl -s "$BASE_URL/api/transactions?date=2024-01-15&limit=3" | jq '.filters, .pagination'
echo ""

# Test 10: Combined Filters
echo -e "${GREEN}✅ Test 10: Combined Filters${NC}"
curl -s "$BASE_URL/api/transactions?type=INCOMING&minAmount=1000&startDate=2024-01-01&limit=2" | jq '.filters, .pagination'
echo ""

# Test 11: Get Available Transaction Types
echo -e "${GREEN}✅ Test 11: Get Available Transaction Types${NC}"
curl -s "$BASE_URL/api/transactions/types" | jq '.data'
echo ""

# Test 12: Get Transaction Statistics
echo -e "${GREEN}✅ Test 12: Get Transaction Statistics${NC}"
curl -s "$BASE_URL/api/transactions/stats" | jq '.data'
echo ""

# Test 13: Get Transaction Statistics with Filters
echo -e "${GREEN}✅ Test 13: Get Statistics with Filters${NC}"
curl -s "$BASE_URL/api/transactions/stats?type=INCOMING&startDate=2024-01-01" | jq '.data, .filters'
echo ""

# Test 14: Get Specific Transaction
echo -e "${GREEN}✅ Test 14: Get Specific Transaction by ID${NC}"
curl -s "$BASE_URL/api/transactions/MOCK123456" | jq '.data'
echo ""

# Test 15: Get Non-existent Transaction
echo -e "${GREEN}✅ Test 15: Get Non-existent Transaction (Should return 404)${NC}"
curl -s -w "HTTP Status: %{http_code}\\n" "$BASE_URL/api/transactions/NONEXISTENT123" | jq '.'
echo ""

# Test 16: Invalid Date Format
echo -e "${GREEN}✅ Test 16: Invalid Date Format (Should return 400)${NC}"
curl -s -w "HTTP Status: %{http_code}\\n" "$BASE_URL/api/transactions?date=invalid-date" | jq '.'
echo ""

# Test 17: Invalid Amount
echo -e "${GREEN}✅ Test 17: Invalid Amount (Should return 400)${NC}"
curl -s -w "HTTP Status: %{http_code}\\n" "$BASE_URL/api/transactions?minAmount=invalid" | jq '.'
echo ""

# Test 18: Large Limit (Should be capped at 100)
echo -e "${GREEN}✅ Test 18: Large Limit (Should be capped at 100)${NC}"
curl -s "$BASE_URL/api/transactions?limit=500" | jq '.pagination.limit'
echo ""

echo -e "${BLUE}🎉 API Testing Complete!${NC}"
echo "========================================"
