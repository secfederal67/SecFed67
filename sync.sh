#!/bin/bash

# ========================================
# Script de Sincronización Automática - EDUQUIARMX VERSION
# Sincroniza cambios entre ShinerPunk y SecFederal67
# ========================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con color
print_message() {
    echo -e "${2}${1}${NC}"
}

# Función para mostrar el banner
show_banner() {
    print_message "╔══════════════════════════════════════════════╗" $CYAN
    print_message "║            SYNC EDUQUIARMX                   ║" $CYAN
    print_message "║         Sincronización Automática           ║" $CYAN
    print_message "║    ShinerPunk/SecFed67 → SecFederal67        ║" $CYAN
    print_message "╚══════════════════════════════════════════════╝" $CYAN
    echo
}

# Mostrar banner
show_banner

# Verificar si estamos en el directorio correcto
if [ ! -d ".git" ]; then
    print_message "❌ Error: No se encontró repositorio Git" $RED
    print_message "   Ejecuta este script desde la raíz del proyecto" $YELLOW
    exit 1
fi

# Verificar si hay cambios
print_message "🔍 Verificando cambios en el repositorio..." $BLUE
echo

# Mostrar status actual
git status --porcelain > /tmp/git_status
if [ -s /tmp/git_status ]; then
    print_message "📋 Archivos modificados:" $YELLOW
    while IFS= read -r line; do
        echo "   $line"
    done < /tmp/git_status
    echo
    HAS_CHANGES=true
else
    print_message "✅ No hay archivos modificados" $GREEN
    HAS_CHANGES=false
fi

# Verificar si hay commits sin sincronizar
PENDING_COMMITS=$(git log --oneline origin/main..HEAD 2>/dev/null | wc -l)
if [ "$PENDING_COMMITS" -gt 0 ]; then
    print_message "📦 Hay $PENDING_COMMITS commit(s) pendiente(s) de sincronizar" $YELLOW
    HAS_PENDING=true
else
    HAS_PENDING=false
fi

# Si no hay cambios ni commits pendientes, salir
if [ "$HAS_CHANGES" = false ] && [ "$HAS_PENDING" = false ]; then
    print_message "ℹ️  No hay nada que sincronizar" $BLUE
    print_message "🎯 Todo está actualizado" $GREEN
    exit 0
fi

# Pedir mensaje de commit si hay cambios
if [ "$HAS_CHANGES" = true ]; then
    echo
    print_message "💬 INGRESA EL MENSAJE DE COMMIT:" $CYAN
    print_message "   (Ejemplo: Add director dashboard and CT configuration)" $YELLOW
    echo -n "📝 Mensaje: "
    read -r COMMIT_MESSAGE
    
    # Verificar que se ingresó un mensaje
    if [ -z "$COMMIT_MESSAGE" ]; then
        print_message "❌ Error: Debes proporcionar un mensaje de commit" $RED
        exit 1
    fi
    
    echo
    print_message "🔄 Iniciando sincronización..." $BLUE
    print_message "📝 Mensaje: $COMMIT_MESSAGE" $BLUE
    echo
    
    # Agregar archivos
    print_message "📁 Agregando archivos..." $BLUE
    git add .
    
    # Hacer commit
    print_message "💾 Haciendo commit..." $BLUE
    if git commit -m "$COMMIT_MESSAGE"; then
        print_message "✅ Commit realizado exitosamente" $GREEN
    else
        print_message "❌ Error al hacer commit" $RED
        exit 1
    fi
    echo
else
    print_message "🔄 Sincronizando commits pendientes..." $BLUE
    echo
fi

# Push a repositorio personal (ShinerPunk)
print_message "📤 Subiendo a repositorio personal (ShinerPunk)..." $BLUE
if git push origin main; then
    print_message "✅ Push exitoso a ShinerPunk/SecFed67" $GREEN
else
    print_message "❌ Error al hacer push a repositorio personal" $RED
    exit 1
fi

echo

# Push a repositorio de SecFederal67
print_message "📤 Subiendo a repositorio de SecFederal67..." $BLUE
if git push secfederal67 main; then
    print_message "✅ Push exitoso a SecFederal67/SecFed67" $GREEN
else
    print_message "❌ Error al hacer push a repositorio de SecFederal67" $RED
    print_message "💡 Verifica que el remote 'secfederal67' esté configurado:" $YELLOW
    print_message "   git remote add secfederal67 https://github.com/secfederal67/SecFed67.git" $YELLOW
    exit 1
fi

echo
print_message "╔══════════════════════════════════════════════╗" $GREEN
print_message "║              ¡SINCRONIZACIÓN                 ║" $GREEN
print_message "║               COMPLETADA! 🎉                 ║" $GREEN
print_message "╚══════════════════════════════════════════════╝" $GREEN
echo
print_message "✅ EDUQUIARMX actualizado en ambas cuentas" $GREEN
print_message "🚀 Vercel debería hacer deploy automáticamente desde SecFederal67" $GREEN
print_message "🌐 Verifica el deploy en el dashboard de Vercel" $BLUE
echo
print_message "📁 Repositorios actualizados:" $BLUE
print_message "   • https://github.com/ShinerPunk/SecFed67" $CYAN
print_message "   • https://github.com/secfederal67/SecFed67" $CYAN
echo