#!/bin/bash
# Quick deployment script to fix auth redirect issue
# Usage: ./deploy-fix.sh

set -e

echo "=================================="
echo "Auth Redirect Fix - Deployment"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if NEXT_PUBLIC_APP_URL is set
if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_APP_URL is not set${NC}"
    echo "Setting default: https://tales.anejjar.com"
    export NEXT_PUBLIC_APP_URL=https://tales.anejjar.com
else
    echo -e "${GREEN}✓ NEXT_PUBLIC_APP_URL is set: $NEXT_PUBLIC_APP_URL${NC}"
fi

echo ""
echo "Step 1: Cleaning previous build..."
rm -rf .next
echo -e "${GREEN}✓ Clean complete${NC}"

echo ""
echo "Step 2: Building application..."
npm run build
echo -e "${GREEN}✓ Build complete${NC}"

echo ""
echo "Step 3: Docker deployment options..."
echo ""
echo "Choose your deployment method:"
echo "1) Docker Compose"
echo "2) Docker Run"
echo "3) Manual (I'll deploy myself)"
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "Building with Docker Compose..."
        docker-compose down
        docker-compose build --no-cache --build-arg NEXT_PUBLIC_APP_URL=https://tales.anejjar.com
        docker-compose up -d
        echo -e "${GREEN}✓ Docker Compose deployment complete${NC}"
        ;;
    2)
        echo ""
        echo "Building with Docker..."
        docker stop ai-stories 2>/dev/null || true
        docker rm ai-stories 2>/dev/null || true
        docker build \
            --build-arg NEXT_PUBLIC_APP_URL=https://tales.anejjar.com \
            --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
            --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
            -t ai-stories .
        docker run -d \
            --name ai-stories \
            -p 3000:3000 \
            --env-file .env \
            -e NEXT_PUBLIC_APP_URL=https://tales.anejjar.com \
            ai-stories
        echo -e "${GREEN}✓ Docker deployment complete${NC}"
        ;;
    3)
        echo ""
        echo -e "${YELLOW}Manual deployment selected${NC}"
        echo "Remember to set NEXT_PUBLIC_APP_URL=https://tales.anejjar.com in your deployment platform"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "=================================="
echo "Deployment Summary"
echo "=================================="
echo ""
echo "Files modified:"
echo "  ✓ app/auth/callback/route.ts - Enhanced redirect logic"
echo "  ✓ .env - Updated NEXT_PUBLIC_APP_URL"
echo ""
echo "Environment variable:"
echo "  NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL"
echo ""
echo "Next steps:"
echo "  1. Test email confirmation: https://tales.anejjar.com/signup"
echo "  2. Check server logs for 'Auth callback redirect determination'"
echo "  3. Verify redirect goes to: https://tales.anejjar.com/library"
echo ""
echo "If issues persist:"
echo "  - Check DEPLOYMENT_FIX_URGENT.md for detailed instructions"
echo "  - Verify Supabase redirect URLs are configured"
echo "  - Check reverse proxy headers (if using one)"
echo ""
echo -e "${GREEN}✓ Deployment complete!${NC}"
echo "=================================="
