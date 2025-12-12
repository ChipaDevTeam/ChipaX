#!/bin/bash

# ChipaX Exchange - API Integration Setup Script
# This script helps set up the environment for ChipaTrade API integration

echo "🚀 ChipaX Exchange - API Integration Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the apps/exchange directory"
    exit 1
fi

echo -e "${GREEN}✓${NC} Found package.json"
echo ""

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}📝 Creating .env.local file...${NC}"
    
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo -e "${GREEN}✓${NC} Created .env.local from template"
    else
        echo "NEXT_PUBLIC_API_BASE_URL=https://exchange-api.chipatrade.com" > .env.local
        echo -e "${GREEN}✓${NC} Created .env.local with default values"
    fi
    echo ""
else
    echo -e "${GREEN}✓${NC} .env.local already exists"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓${NC} Dependencies installed"
    echo ""
else
    echo -e "${GREEN}✓${NC} Dependencies already installed"
    echo ""
fi

# Display environment configuration
echo -e "${YELLOW}📋 Current Configuration:${NC}"
echo "-------------------------------------------"
if [ -f ".env.local" ]; then
    cat .env.local
else
    echo "No .env.local file found"
fi
echo "-------------------------------------------"
echo ""

# Test API connectivity
echo -e "${YELLOW}🔌 Testing API connectivity...${NC}"
API_URL=$(grep NEXT_PUBLIC_API_BASE_URL .env.local 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$API_URL" ]; then
    API_URL="https://exchange-api.chipatrade.com"
fi

if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓${NC} API is reachable at $API_URL"
        
        # Get API response
        API_RESPONSE=$(curl -s "$API_URL/health" 2>/dev/null)
        if [ ! -z "$API_RESPONSE" ]; then
            echo "  Response: $API_RESPONSE"
        fi
    else
        echo -e "${RED}❌${NC} API not reachable at $API_URL (HTTP $HTTP_CODE)"
        echo "  Please check your network connection or API URL"
    fi
else
    echo -e "${YELLOW}⚠${NC}  curl not found, skipping API connectivity test"
fi
echo ""

# Check for required files
echo -e "${YELLOW}📁 Checking integration files...${NC}"

FILES_TO_CHECK=(
    "src/types/api.ts"
    "src/services/api-client.ts"
    "src/contexts/AuthContext.tsx"
    "src/hooks/useTrading.ts"
    "src/lib/tradingview-datafeed-api.ts"
)

ALL_FILES_EXIST=true

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}❌${NC} $file (missing)"
        ALL_FILES_EXIST=false
    fi
done
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "=========================================="
echo ""

if [ "$ALL_FILES_EXIST" = true ]; then
    echo "✅ All integration files are in place"
else
    echo "⚠️  Some integration files are missing"
fi
echo ""

# Next steps
echo "📚 Next Steps:"
echo "-------------------------------------------"
echo "1. Review your .env.local configuration"
echo "2. Start the development server:"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "3. Open http://localhost:3000"
echo ""
echo "4. Test the integration:"
echo "   - Register a new account"
echo "   - Login with credentials"
echo "   - View real-time market data"
echo "   - Place test orders"
echo ""
echo "📖 Documentation:"
echo "   - API_INTEGRATION.md - Full integration guide"
echo "   - COMPONENT_MIGRATION.md - Component examples"
echo "   - API_INTEGRATION_SUMMARY.md - Quick reference"
echo ""
echo "🌐 API Documentation:"
echo "   ${API_URL}/docs"
echo "=========================================="
