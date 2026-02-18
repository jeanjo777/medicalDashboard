#!/bin/bash

echo "🔍 Diagnostic RDV Session Login Page"
echo "===================================="
echo ""

echo "📦 1. Vérification du build..."
if [ -f "dist/index.html" ]; then
    echo "   ✅ dist/index.html existe"
else
    echo "   ❌ dist/index.html manquant - Build requis"
fi

echo ""
echo "📝 2. Vérification des fichiers source..."
if [ -f "src/pages/RDVSessionLoginPage.tsx" ]; then
    echo "   ✅ RDVSessionLoginPage.tsx existe"
    echo "   📊 Taille: $(wc -l < src/pages/RDVSessionLoginPage.tsx) lignes"
else
    echo "   ❌ RDVSessionLoginPage.tsx manquant"
fi

if [ -f "src/utils/secureAuth.ts" ]; then
    echo "   ✅ secureAuth.ts existe"
else
    echo "   ❌ secureAuth.ts manquant"
fi

echo ""
echo "🔗 3. Vérification des routes..."
if grep -q "rdv-login" src/main.tsx; then
    echo "   ✅ Route /rdv-login trouvée dans main.tsx"
    grep -n "rdv-login" src/main.tsx
else
    echo "   ❌ Route /rdv-login absente de main.tsx"
fi

echo ""
echo "🌐 4. Vérification des variables d'environnement..."
if [ -f ".env" ]; then
    echo "   ✅ .env existe"
    if grep -q "VITE_SUPABASE_URL" .env; then
        echo "   ✅ VITE_SUPABASE_URL défini"
    else
        echo "   ❌ VITE_SUPABASE_URL manquant"
    fi
    if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
        echo "   ✅ VITE_SUPABASE_ANON_KEY défini"
    else
        echo "   ❌ VITE_SUPABASE_ANON_KEY manquant"
    fi
else
    echo "   ❌ .env manquant"
fi

echo ""
echo "🔍 5. Vérification des imports date-fns..."
echo "   Recherche d'imports incorrects (date-fns/locale sans /fr):"
WRONG_IMPORTS=$(grep -r "from 'date-fns/locale'" src/ 2>/dev/null | grep -v "locale/fr" || true)
if [ -z "$WRONG_IMPORTS" ]; then
    echo "   ✅ Tous les imports date-fns sont corrects"
else
    echo "   ⚠️  Imports incorrects trouvés:"
    echo "$WRONG_IMPORTS"
fi

echo ""
echo "🧪 6. Test de compilation TypeScript..."
npx tsc --noEmit 2>&1 | head -20

echo ""
echo "📊 7. Résumé"
echo "   - Accès recommandé: http://localhost:5173/rdv-login"
echo "   - Vérifier la console DevTools pour les logs [RDV]"
echo "   - Si page blanche: vider le cache (Ctrl+Shift+R)"
echo "   - Si bannière verte visible: composant chargé ✅"
echo "   - Si pas de bannière: problème de routing/import"
echo ""
