#!/bin/bash
# Supabase Configuration Checker
# This script helps verify your Supabase configuration for auth callbacks

echo "╔════════════════════════════════════════════════════════╗"
echo "║     Supabase Auth Configuration Checker               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check required variables
echo -e "${BLUE}Checking environment variables...${NC}"
echo ""

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}✗ NEXT_PUBLIC_SUPABASE_URL is not set${NC}"
    exit 1
else
    echo -e "${GREEN}✓ NEXT_PUBLIC_SUPABASE_URL: $NEXT_PUBLIC_SUPABASE_URL${NC}"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}✗ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set${NC}"
    exit 1
else
    echo -e "${GREEN}✓ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}...${NC}"
fi

if [ -z "$NEXT_PUBLIC_APP_URL" ]; then
    echo -e "${YELLOW}⚠ NEXT_PUBLIC_APP_URL is not set (will use fallback)${NC}"
else
    echo -e "${GREEN}✓ NEXT_PUBLIC_APP_URL: $NEXT_PUBLIC_APP_URL${NC}"
fi

echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# Check Supabase auth settings
echo -e "${BLUE}Checking Supabase auth settings...${NC}"
echo ""

RESPONSE=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Successfully connected to Supabase${NC}"
    echo ""

    # Extract and display key settings
    echo "Auth Settings:"
    echo "$RESPONSE" | grep -o '"external_email_enabled":[^,]*' || true
    echo "$RESPONSE" | grep -o '"external_phone_enabled":[^,]*' || true
    echo "$RESPONSE" | grep -o '"autoconfirm":[^,]*' || true
    echo ""
else
    echo -e "${RED}✗ Failed to connect to Supabase${NC}"
    echo "Please check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
fi

echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# Configuration recommendations
echo -e "${BLUE}Configuration Checklist:${NC}"
echo ""

if [ ! -z "$NEXT_PUBLIC_APP_URL" ]; then
    if [[ "$NEXT_PUBLIC_APP_URL" == *"localhost"* ]] || [[ "$NEXT_PUBLIC_APP_URL" == *"0.0.0.0"* ]]; then
        echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_APP_URL is set to a development URL"
        echo "  For production, set to: https://tales.anejjar.com"
    else
        echo -e "${GREEN}✓${NC} NEXT_PUBLIC_APP_URL is set to production URL"
    fi
else
    echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_APP_URL not set (using hardcoded fallback)"
fi

echo ""
echo -e "${BLUE}Supabase Dashboard URLs to configure:${NC}"
echo ""
echo "1. Site URL:"
echo "   https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/url-configuration"
echo "   → Set to: https://tales.anejjar.com"
echo ""
echo "2. Redirect URLs (add these):"
echo "   → https://tales.anejjar.com/**"
echo "   → https://tales.anejjar.com/auth/callback"
echo "   → http://localhost:3000/** (for development)"
echo ""
echo "3. Email Templates:"
echo "   https://supabase.com/dashboard/project/qpdoemudsvfhnxaigrsd/auth/templates"
echo "   → Ensure 'Confirm signup' uses {{ .ConfirmationURL }}"
echo ""

echo "─────────────────────────────────────────────────────────"
echo ""

# Test callback URL
echo -e "${BLUE}Testing callback endpoint...${NC}"
echo ""

if [ ! -z "$NEXT_PUBLIC_APP_URL" ]; then
    CALLBACK_URL="${NEXT_PUBLIC_APP_URL}/auth/callback"
else
    CALLBACK_URL="https://tales.anejjar.com/auth/callback"
fi

echo "Testing: $CALLBACK_URL"
CALLBACK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${CALLBACK_URL}?test=1")

if [ "$CALLBACK_RESPONSE" == "302" ] || [ "$CALLBACK_RESPONSE" == "307" ]; then
    echo -e "${GREEN}✓ Callback endpoint is responding (redirect)${NC}"
elif [ "$CALLBACK_RESPONSE" == "200" ]; then
    echo -e "${YELLOW}⚠ Callback endpoint returned 200 (expected redirect)${NC}"
else
    echo -e "${RED}✗ Callback endpoint returned: $CALLBACK_RESPONSE${NC}"
fi

echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# Summary
echo -e "${BLUE}Summary:${NC}"
echo ""
echo "Environment: $(if [ -z "$NEXT_PUBLIC_APP_URL" ]; then echo "Using fallback"; else echo "$NEXT_PUBLIC_APP_URL"; fi)"
echo "Supabase Project: qpdoemudsvfhnxaigrsd"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Configure redirect URLs in Supabase dashboard (see URLs above)"
echo "2. Deploy your application with updated callback handler"
echo "3. Test email confirmation flow"
echo "4. Check server logs for detailed error messages"
echo ""

echo -e "${GREEN}For detailed troubleshooting, see:${NC}"
echo "  - AUTH_ERROR_TROUBLESHOOTING.md"
echo "  - DEPLOYMENT_FIX_URGENT.md"
echo ""

echo "╚════════════════════════════════════════════════════════╝"
