#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║          DIAGNOSTIC COMPLET - APPLICATION                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check 1: Build
echo "📦 1. Vérification du build..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build réussi${NC}"
else
    echo -e "${RED}❌ Build échoué${NC}"
    echo "   Exécutez: npm run build"
fi
echo ""

# Check 2: TypeScript
echo "🔍 2. Vérification TypeScript..."
TS_ERRORS=$(npx tsc --noEmit 2>&1 | grep "error TS" | wc -l)
if [ "$TS_ERRORS" -eq 0 ]; then
    echo -e "${GREEN}✅ Aucune erreur TypeScript${NC}"
else
    echo -e "${RED}❌ $TS_ERRORS erreur(s) TypeScript${NC}"
    echo "   Exécutez: npx tsc --noEmit"
fi
echo ""

# Check 3: Routes
echo "🛣️  3. Vérification des routes..."
ROUTES=(
    "/login"
    "/dashboard"
    "/patients-enhanced"
    "/appointments"
)

for route in "${ROUTES[@]}"; do
    if grep -q "path=\"$route\"" src/main.tsx; then
        echo -e "${GREEN}✅${NC} Route $route déclarée"
    else
        echo -e "${RED}❌${NC} Route $route manquante"
    fi
done
echo ""

# Check 4: Composants critiques
echo "🧩 4. Vérification des composants..."
COMPONENTS=(
    "src/pages/PatientsViewPageEnhanced.tsx"
    "src/components/Common/SearchFilters.tsx"
    "src/components/Common/Pagination.tsx"
    "src/components/Common/UserMenu.tsx"
    "src/hooks/useAdvancedSearch.ts"
    "src/utils/dateHelpers.ts"
)

for comp in "${COMPONENTS[@]}"; do
    if [ -f "$comp" ]; then
        echo -e "${GREEN}✅${NC} $(basename $comp)"
    else
        echo -e "${RED}❌${NC} $(basename $comp) manquant"
    fi
done
echo ""

# Check 5: Base de données
echo "🗄️  5. Vérification base de données..."
if [ -f ".env" ]; then
    if grep -q "VITE_SUPABASE_URL" .env && grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        echo -e "${GREEN}✅ Variables Supabase configurées${NC}"
    else
        echo -e "${RED}❌ Variables Supabase manquantes${NC}"
    fi
else
    echo -e "${RED}❌ Fichier .env manquant${NC}"
fi
echo ""

# Check 6: Edge Functions
echo "⚡ 6. Vérification Edge Functions..."
FUNCTIONS=(
    "supabase/functions/get-patient-summary/index.ts"
)

for func in "${FUNCTIONS[@]}"; do
    if [ -f "$func" ]; then
        echo -e "${GREEN}✅${NC} $(basename $(dirname $func))"
    else
        echo -e "${YELLOW}⚠️${NC} $(basename $(dirname $func)) manquante"
    fi
done
echo ""

# Check 7: Package.json
echo "📦 7. Vérification dépendances..."
DEPS=(
    "@supabase/supabase-js"
    "@tanstack/react-query"
    "react-router-dom"
    "date-fns"
)

for dep in "${DEPS[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        echo -e "${GREEN}✅${NC} $dep"
    else
        echo -e "${RED}❌${NC} $dep manquant"
    fi
done
echo ""

# Summary
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                      RÉSUMÉ                              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "Pour tester l'application:"
echo "  1. npm run dev"
echo "  2. Ouvrir http://localhost:5173"
echo "  3. Se connecter: testdoc / password123"
echo "  4. Cliquer sur 'Patients' dans la sidebar"
echo ""
echo "Pour voir les logs détaillés:"
echo "  - Console navigateur: F12"
echo "  - Network tab: Vérifier requêtes Supabase"
echo ""
echo "Documentation disponible:"
echo "  - VISUAL_AUDIT_PATIENTS_PAGE.md"
echo "  - AGE_DISPLAY_FIX.md"
echo "  - DEBUG_APPOINTMENTS.md"
echo ""
