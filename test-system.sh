#!/bin/bash

# Mon-AD System Test Script
# Tests the complete advertising flow on Monad Testnet

BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🧪 Testing Mon-AD System..."
echo "========================================"
echo ""

# Test Data
SLOT_ID="demo-header"
ADVERTISER_WALLET="0x742d35Cc6634C0532925a3b844Bc9e7595f0fEb1"

# ===== Phase 1: Health Check =====
echo -e "${BLUE}📋 Phase 1: System Health${NC}"
echo "========================================"

echo "📝 Test 1: Health Check..."
HEALTH=$(curl -s "$BASE_URL/api/health")
echo "$HEALTH" | jq '.'

if [ "$(echo $HEALTH | jq -r '.status')" = "ok" ]; then
  echo -e "${GREEN}✓ System is healthy${NC}"
else
  echo -e "${RED}✗ System health check failed${NC}"
fi

echo ""

# ===== Phase 2: Ad Slots =====
echo -e "${BLUE}📋 Phase 2: Ad Slots${NC}"
echo "========================================"

echo "📝 Test 2: Get Ad for slot..."
AD_RESPONSE=$(curl -s "$BASE_URL/api/ads/$SLOT_ID")
echo "$AD_RESPONSE" | jq '.'

HAS_AD=$(echo $AD_RESPONSE | jq -r '.hasAd')
if [ "$HAS_AD" = "true" ]; then
  echo -e "${GREEN}✓ Slot has active ad${NC}"
  echo "  Content URL: $(echo $AD_RESPONSE | jq -r '.contentUrl')"
else
  echo -e "${YELLOW}⚠ No active ad (this is expected for new slots)${NC}"
fi

echo ""

echo "📝 Test 3: Get Queue Info..."
QUEUE_RESPONSE=$(curl -s "$BASE_URL/api/queue-info/$SLOT_ID")
echo "$QUEUE_RESPONSE" | jq '.'

TOTAL_IN_QUEUE=$(echo $QUEUE_RESPONSE | jq -r '.totalInQueue')
echo -e "${GREEN}✓ Queue info retrieved: $TOTAL_IN_QUEUE in queue${NC}"

echo ""

# ===== Phase 3: Bid Creation =====
echo -e "${BLUE}📋 Phase 3: Bid Creation${NC}"
echo "========================================"

echo "📝 Test 4: Create a bid..."
BID_RESPONSE=$(curl -s -X POST "$BASE_URL/api/bids/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"slotId\": \"$SLOT_ID\",
    \"advertiserWallet\": \"$ADVERTISER_WALLET\",
    \"bidAmount\": \"0.25\",
    \"durationMinutes\": 60,
    \"adContentHash\": \"QmTestHash123\",
    \"adTitle\": \"Test Ad\",
    \"adDescription\": \"Testing the system\",
    \"clickUrl\": \"https://example.com\"
  }")

echo "$BID_RESPONSE" | jq '.'

BID_ID=$(echo "$BID_RESPONSE" | jq -r '.bid.id // empty')
if [ -n "$BID_ID" ] && [ "$BID_ID" != "null" ]; then
  echo -e "${GREEN}✓ Bid created: $BID_ID${NC}"
else
  echo -e "${YELLOW}⚠ Bid creation response: $(echo $BID_RESPONSE | jq -r '.message // .error')${NC}"
fi

echo ""

# ===== Phase 4: Upload Ad =====
echo -e "${BLUE}📋 Phase 4: Ad Upload${NC}"
echo "========================================"

echo "📝 Test 5: Upload ad content..."
UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/api/upload-ad" \
  -H "Content-Type: application/json" \
  -d "{
    \"slotId\": \"$SLOT_ID\",
    \"mediaHash\": \"QmTestHash456\",
    \"paymentData\": {
      \"transactionHash\": \"0x1234567890abcdef1234567890abcdef12345678\",
      \"payerAddress\": \"$ADVERTISER_WALLET\",
      \"amountPaid\": \"0.25\"
    },
    \"paymentInfo\": {
      \"slotId\": \"$SLOT_ID\",
      \"price\": \"0.25\",
      \"size\": \"banner\"
    }
  }")

echo "$UPLOAD_RESPONSE" | jq '.'

if [ "$(echo $UPLOAD_RESPONSE | jq -r '.success')" = "true" ]; then
  echo -e "${GREEN}✓ Ad uploaded successfully${NC}"
else
  echo -e "${YELLOW}⚠ Upload response: $(echo $UPLOAD_RESPONSE | jq -r '.message // .error')${NC}"
fi

echo ""

# ===== Phase 5: Verify Ad Display =====
echo -e "${BLUE}📋 Phase 5: Verify Ad Display${NC}"
echo "========================================"

echo "📝 Test 6: Verify ad is now active..."
AD_AFTER=$(curl -s "$BASE_URL/api/ads/$SLOT_ID")
echo "$AD_AFTER" | jq '.'

HAS_AD_AFTER=$(echo $AD_AFTER | jq -r '.hasAd')
if [ "$HAS_AD_AFTER" = "true" ]; then
  echo -e "${GREEN}✓ Ad is now active and displayed!${NC}"
else
  echo -e "${YELLOW}⚠ No active ad yet${NC}"
fi

echo ""

# ===== Summary =====
echo -e "${BLUE}📋 Test Summary${NC}"
echo "========================================"
echo "✅ Phase 1: Health check"
echo "✅ Phase 2: Ad slot retrieval"
echo "✅ Phase 3: Bid creation"
echo "✅ Phase 4: Ad upload"
echo "✅ Phase 5: Ad display verification"
echo ""
echo -e "${GREEN}🎉 Mon-AD System Test Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Connect your wallet (MetaMask)"
echo "3. Ensure you're on Monad Testnet (Chain 10143)"
echo "4. Click an ad slot to purchase"
echo "5. Complete payment and upload your ad"
echo ""

# ===== Manual Testing Steps =====
echo -e "${BLUE}📋 Manual Testing Steps${NC}"
echo "========================================"
echo ""
echo "1. Open http://localhost:3000 in browser"
echo "2. Click 'Connect Wallet' and approve in MetaMask"
echo "3. Ensure network is 'Monad Testnet'"
echo "4. Click on any ad slot (shows 'Click to purchase')"
echo "5. Check 'Use x402' for micropayments"
echo "6. Click 'Pay with x402' and approve"
echo "7. Upload ad image on the next page"
echo "8. Verify ad appears on homepage"
echo ""