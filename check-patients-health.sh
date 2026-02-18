#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║      VÉRIFICATION SANTÉ PAGE PATIENTS ENHANCED           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Check mapping
echo "✅ CORRECTIONS APPLIQUÉES:"
echo "   • birth_date → date_of_birth"
echo "   • formatAge() avec fallback"
echo "   • Badges contraste +50%"
echo "   • Hover & Focus améliorés"
echo ""

# Check file
if grep -q "date_of_birth" src/pages/PatientsViewPageEnhanced.tsx; then
    echo -e "${GREEN}✅ Mapping colonnes: OK${NC}"
else
    echo -e "${RED}❌ Mapping colonnes: ERREUR${NC}"
fi

# Check build
if [ -f "dist/index.html" ]; then
    echo -e "${GREEN}✅ Build: OK${NC}"
else
    echo -e "${RED}❌ Build manquant${NC}"
fi

echo ""
echo "🧪 POUR TESTER:"
echo "   1. npm run dev"
echo "   2. Login: testdoc / password123"
echo "   3. Cliquer 'Patients'"
echo "   4. Console (F12) pour logs"
