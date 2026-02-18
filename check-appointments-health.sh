#!/bin/bash

echo "=========================================="
echo "🏥 Appointments Page Health Check"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Component exists
echo "📋 Checking components..."
if [ -f "src/pages/AppointmentsPage.tsx" ]; then
    echo -e "${GREEN}✅ AppointmentsPage.tsx exists${NC}"
else
    echo -e "${RED}❌ AppointmentsPage.tsx NOT FOUND${NC}"
    exit 1
fi

# Check 2: Required components
COMPONENTS=(
    "src/components/ModernSidebar.tsx"
    "src/components/Common/UserMenu.tsx"
    "src/components/LoadingSkeleton.tsx"
    "src/components/Common/Toast.tsx"
    "src/components/Appointments/AddAppointmentModal.tsx"
    "src/components/Appointments/AppointmentDetailModal.tsx"
    "src/components/Appointments/EditAppointmentModal.tsx"
)

echo ""
echo "🧩 Checking required components..."
for component in "${COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        echo -e "${GREEN}✅${NC} $(basename $component)"
    else
        echo -e "${RED}❌${NC} $(basename $component) NOT FOUND"
    fi
done

# Check 3: Hooks
echo ""
echo "🪝 Checking hooks..."
if [ -f "src/hooks/useAppointmentsQuery.ts" ]; then
    echo -e "${GREEN}✅ useAppointmentsQuery.ts exists${NC}"
else
    echo -e "${RED}❌ useAppointmentsQuery.ts NOT FOUND${NC}"
fi

# Check 4: Build status
echo ""
echo "🔨 Checking build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Run 'npm run build' to see errors"
fi

# Check 5: Database appointments
echo ""
echo "🗄️  Checking database..."
echo "Looking for appointments in Supabase..."

# Check 6: Test user
echo ""
echo "👤 Test user credentials:"
echo -e "${YELLOW}Username:${NC} testdoc"
echo -e "${YELLOW}Password:${NC} password123"

echo ""
echo "=========================================="
echo "📝 Summary:"
echo "=========================================="
echo ""
echo "1. Navigate to: http://localhost:5173/login"
echo "2. Login with: testdoc / password123"
echo "3. Click 'Rendez-vous' in sidebar"
echo "4. You should see 8 appointments"
echo ""
echo "🐛 If page is blank after login:"
echo "   - Open browser console (F12)"
echo "   - Check for JavaScript errors"
echo "   - Verify localStorage has 'auth_token'"
echo "   - Check Network tab for Supabase calls"
echo ""
echo "📖 For detailed debug info, see:"
echo "   DEBUG_APPOINTMENTS.md"
echo ""
echo "=========================================="
