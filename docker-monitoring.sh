#!/bin/bash

# Docker Container Monitoring Script
# Surveille l'état des conteneurs et collecte les métriques

set -e

# Configuration
LOG_FILE="/var/log/docker-monitoring.log"
METRICS_FILE="/tmp/docker-metrics.json"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_DISK=90

# Services à surveiller
SERVICES=(
    "rncp-api-gateway"
    "rncp-user-service" 
    "rncp-auth-service"
    "rncp-order-service"
    "rncp-geo-service"
    "rncp-pwa-frontend"
    "redis"
)

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

# Vérifier si Docker est disponible
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé ou n'est pas dans le PATH"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        log_error "Docker daemon n'est pas en cours d'exécution"
        exit 1
    fi
}

# Vérifier l'état des conteneurs
check_container_status() {
    log "Vérification de l'état des conteneurs..."
    
    local all_healthy=true
    local status_report=""
    
    for service in "${SERVICES[@]}"; do
        local container_id=$(docker ps -q -f name="$service")
        
        if [ -z "$container_id" ]; then
            log_error "Conteneur $service non trouvé ou arrêté"
            status_report+="\n❌ $service: ARRÊTÉ"
            all_healthy=false
        else
            local status=$(docker inspect --format='{{.State.Status}}' "$container_id")
            local health=$(docker inspect --format='{{.State.Health.Status}}' "$container_id" 2>/dev/null || echo "no-healthcheck")
            
            if [ "$status" = "running" ]; then
                if [ "$health" = "healthy" ] || [ "$health" = "no-healthcheck" ]; then
                    log_success "Conteneur $service: EN COURS (${health})"
                    status_report+="\n✅ $service: EN COURS (${health})"
                else
                    log_warning "Conteneur $service: EN COURS mais santé=$health"
                    status_report+="\n⚠️ $service: EN COURS (${health})"
                fi
            else
                log_error "Conteneur $service: PROBLÈME (status=$status)"
                status_report+="\n❌ $service: PROBLÈME ($status)"
                all_healthy=false
            fi
        fi
    done
    
    echo -e "\n📊 RAPPORT D'ÉTAT DES CONTENEURS:$status_report\n"
    
    return $( [ "$all_healthy" = true ] && echo 0 || echo 1 )
}

# Collecter les métriques de performance
collect_metrics() {
    log "Collecte des métriques de performance..."
    
    local metrics_json="{"
    local first_service=true
    
    for service in "${SERVICES[@]}"; do
        local container_id=$(docker ps -q -f name="$service")
        
        if [ -n "$container_id" ]; then
            if [ "$first_service" = false ]; then
                metrics_json+=","
            fi
            first_service=false
            
            # Obtenir les stats du conteneur
            local stats=$(docker stats --no-stream --format "table {{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" "$container_id")
            local cpu_percent=$(echo "$stats" | tail -n 1 | awk '{print $1}' | sed 's/%//')
            local mem_usage=$(echo "$stats" | tail -n 1 | awk '{print $2}')
            local mem_percent=$(echo "$stats" | tail -n 1 | awk '{print $3}' | sed 's/%//')
            local net_io=$(echo "$stats" | tail -n 1 | awk '{print $4}')
            local block_io=$(echo "$stats" | tail -n 1 | awk '{print $5}')
            
            # Informations sur le conteneur
            local created=$(docker inspect --format='{{.Created}}' "$container_id")
            local uptime_seconds=$(docker inspect --format='{{.State.StartedAt}}' "$container_id" | xargs -I {} date -d {} +%s)
            local current_seconds=$(date +%s)
            local uptime=$((current_seconds - uptime_seconds))
            
            metrics_json+="\"$service\":{"
            metrics_json+="\"container_id\":\"$container_id\","
            metrics_json+="\"cpu_percent\":\"$cpu_percent\","
            metrics_json+="\"memory_usage\":\"$mem_usage\","
            metrics_json+="\"memory_percent\":\"$mem_percent\","
            metrics_json+="\"network_io\":\"$net_io\","
            metrics_json+="\"block_io\":\"$block_io\","
            metrics_json+="\"uptime_seconds\":$uptime,"
            metrics_json+="\"created\":\"$created\","
            metrics_json+="\"timestamp\":\"$(date -Iseconds)\""
            metrics_json+="}"
            
            # Vérifier les seuils d'alerte
            if [ "$cpu_percent" != "0.00" ] && (( $(echo "$cpu_percent > $ALERT_THRESHOLD_CPU" | bc -l) )); then
                log_warning "ALERTE: $service utilise ${cpu_percent}% du CPU (seuil: ${ALERT_THRESHOLD_CPU}%)"
            fi
            
            if [ "$mem_percent" != "0.00" ] && (( $(echo "$mem_percent > $ALERT_THRESHOLD_MEMORY" | bc -l) )); then
                log_warning "ALERTE: $service utilise ${mem_percent}% de la mémoire (seuil: ${ALERT_THRESHOLD_MEMORY}%)"
            fi
        fi
    done
    
    metrics_json+="}"
    
    # Sauvegarder les métriques
    echo "$metrics_json" > "$METRICS_FILE"
    log "Métriques sauvegardées dans $METRICS_FILE"
}

# Vérifier l'utilisation du disque
check_disk_usage() {
    log "Vérification de l'utilisation du disque..."
    
    local disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if (( disk_usage > ALERT_THRESHOLD_DISK )); then
        log_error "ALERTE CRITIQUE: Utilisation du disque à ${disk_usage}% (seuil: ${ALERT_THRESHOLD_DISK}%)"
        return 1
    elif (( disk_usage > 70 )); then
        log_warning "Attention: Utilisation du disque à ${disk_usage}%"
    else
        log "Utilisation du disque: ${disk_usage}% - OK"
    fi
    
    return 0
}

# Vérifier les logs d'erreur récents
check_recent_errors() {
    log "Vérification des erreurs récentes dans les logs..."
    
    local error_count=0
    
    for service in "${SERVICES[@]}"; do
        local container_id=$(docker ps -q -f name="$service")
        
        if [ -n "$container_id" ]; then
            # Chercher les erreurs dans les 5 dernières minutes
            local recent_errors=$(docker logs --since=5m "$container_id" 2>&1 | grep -i -E "(error|exception|failed|fatal)" | wc -l)
            
            if [ "$recent_errors" -gt 0 ]; then
                log_warning "$service: $recent_errors erreurs dans les 5 dernières minutes"
                ((error_count += recent_errors))
            fi
        fi
    done
    
    if [ "$error_count" -gt 0 ]; then
        log_warning "Total: $error_count erreurs détectées dans les logs récents"
        return 1
    else
        log_success "Aucune erreur récente détectée dans les logs"
        return 0
    fi
}

# Nettoyer les ressources Docker
cleanup_docker() {
    log "Nettoyage des ressources Docker inutilisées..."
    
    # Supprimer les conteneurs arrêtés
    local stopped_containers=$(docker ps -a -q -f status=exited)
    if [ -n "$stopped_containers" ]; then
        echo "$stopped_containers" | xargs docker rm
        log "Conteneurs arrêtés supprimés"
    fi
    
    # Supprimer les images non utilisées
    docker image prune -f &> /dev/null
    log "Images non utilisées supprimées"
    
    # Supprimer les volumes non utilisés
    docker volume prune -f &> /dev/null
    log "Volumes non utilisés supprimés"
    
    # Supprimer les réseaux non utilisés
    docker network prune -f &> /dev/null
    log "Réseaux non utilisés supprimés"
}

# Fonction de test des endpoints de santé
test_health_endpoints() {
    log "Test des endpoints de santé..."
    
    local endpoints=(
        "http://localhost:3001/health"
        "http://localhost:3002/auth/health"
        "http://localhost:3002/users/health"
        "http://localhost:3003/orders/health"
        "http://localhost:3004/geo/health"
    )
    
    local failed_endpoints=()
    
    for endpoint in "${endpoints[@]}"; do
        if curl -s -f "$endpoint" > /dev/null; then
            log_success "✅ $endpoint"
        else
            log_error "❌ $endpoint"
            failed_endpoints+=("$endpoint")
        fi
    done
    
    if [ ${#failed_endpoints[@]} -gt 0 ]; then
        log_error "Endpoints en échec: ${failed_endpoints[*]}"
        return 1
    fi
    
    return 0
}

# Afficher un résumé
show_summary() {
    echo ""
    echo "=============================================="
    echo "         RÉSUMÉ DU MONITORING DOCKER"
    echo "=============================================="
    echo "Timestamp: $(date)"
    echo "Logs: $LOG_FILE"
    echo "Métriques: $METRICS_FILE"
    echo ""
    
    if [ -f "$METRICS_FILE" ]; then
        echo "Dernières métriques collectées:"
        cat "$METRICS_FILE" | jq '.' 2>/dev/null || cat "$METRICS_FILE"
    fi
    
    echo "=============================================="
}

# Fonction principale
main() {
    log "🚀 Démarrage du monitoring Docker..."
    
    check_docker
    
    local exit_code=0
    
    # Vérifications
    check_container_status || exit_code=1
    collect_metrics
    check_disk_usage || exit_code=1
    check_recent_errors || exit_code=1
    
    # Test des endpoints si les conteneurs sont en marche
    if [ $exit_code -eq 0 ]; then
        test_health_endpoints || exit_code=1
    fi
    
    # Nettoyage (optionnel)
    if [ "${1:-}" = "--cleanup" ]; then
        cleanup_docker
    fi
    
    show_summary
    
    if [ $exit_code -eq 0 ]; then
        log_success "✅ Monitoring terminé avec succès"
    else
        log_error "❌ Monitoring terminé avec des problèmes détectés"
    fi
    
    exit $exit_code
}

# Exécuter en mode daemon si demandé
if [ "${1:-}" = "--daemon" ]; then
    log "Mode daemon activé - surveillance continue..."
    while true; do
        main
        log "Attente de 60 secondes avant la prochaine vérification..."
        sleep 60
    done
else
    main "$@"
fi