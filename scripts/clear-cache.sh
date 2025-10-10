#!/bin/bash

echo "🧹 Clearing all caches for Temporal UI..."

# Kill and restart UI server
echo "🔄 Restarting UI server..."
pkill -f ui-server
sleep 2
cd server && ./ui-server --config ./config --env local start &
sleep 3

# Clear Keycloak cache
echo "🔑 Clearing Keycloak cache..."
export PATH=$PATH:~/Documents/office/tools/keycloak/keycloak-26.4.0/bin
~/Documents/office/tools/keycloak/keycloak-26.4.0/bin/kcadm.sh clear-cache -r temporal-ui

echo "✅ Cache clearing complete!"
echo ""
echo "📋 Next steps:"
echo "1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Open browser in incognito/private mode"
echo "3. Navigate to http://localhost:8088"
echo "4. Login with admin@temporal.local or limited@temporal.local"
echo "5. Check namespace dropdown and /namespaces page"
echo ""
echo "🔍 Expected results:"
echo "- Admin user: Should see all 20 namespaces"
echo "- Limited user: Should see only 2 namespaces (default, jio-herald-plt)"
echo "- ReadOnly user: Should see only 1 namespace (default)"
