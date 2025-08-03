#!/bin/bash

# Career Transition Portfolio - Production Monitoring Script
# Monitors application health, performs backups, and sends alerts

set -e

# Configuration
DOMAIN=${DOMAIN:-"career-portfolio.yourdomain.com"}
BACKUP_DIR="/var/backups/career-portfolio"
LOG_FILE="/var/log/career-portfolio-monitor.log"
ALERT_EMAIL=${ALERT_EMAIL:-"your-email@gmail.com"}
SLACK_WEBHOOK=${SLACK_WEBHOOK:-""}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Health check function
check_health() {
    log "Performing health check..."
    
    # Check main application
    if curl -f -s "https://${DOMAIN}/health" > /dev/null; then
        log "✅ Application health check passed"
        return 0
    else
        log "❌ Application health check failed"
        return 1
    fi
}

# Check API health
check_api_health() {
    log "Checking API health..."
    
    if curl -f -s "https://${DOMAIN}/api/health" > /dev/null; then
        log "✅ API health check passed"
        return 0
    else
        log "❌ API health check failed"
        return 1
    fi
}

# Check Docker containers
check_containers() {
    log "Checking Docker containers..."
    
    local failed_containers=()
    
    # Check each container
    for container in career-portfolio-backend-prod career-portfolio-frontend-prod career-portfolio-nginx-prod career-portfolio-redis-prod; do
        if ! docker ps --filter "name=$container" --filter "status=running" | grep -q "$container"; then
            failed_containers+=("$container")
        fi
    done
    
    if [ ${#failed_containers[@]} -eq 0 ]; then
        log "✅ All containers are running"
        return 0
    else
        log "❌ Failed containers: ${failed_containers[*]}"
        return 1
    fi
}

# Check disk space
check_disk_space() {
    log "Checking disk space..."
    
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -lt 80 ]; then
        log "✅ Disk usage: ${usage}%"
        return 0
    elif [ "$usage" -lt 90 ]; then
        log "⚠️ Disk usage warning: ${usage}%"
        return 1
    else
        log "❌ Disk usage critical: ${usage}%"
        return 2
    fi
}

# Check memory usage
check_memory() {
    log "Checking memory usage..."
    
    local usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ "$usage" -lt 80 ]; then
        log "✅ Memory usage: ${usage}%"
        return 0
    elif [ "$usage" -lt 90 ]; then
        log "⚠️ Memory usage warning: ${usage}%"
        return 1
    else
        log "❌ Memory usage critical: ${usage}%"
        return 2
    fi
}

# Backup database
backup_database() {
    log "Starting database backup..."
    
    local backup_date=$(date +%Y%m%d_%H%M%S)
    local backup_file="${BACKUP_DIR}/db_backup_${backup_date}.db"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Copy SQLite database
    if docker exec career-portfolio-backend-prod cp /app/prisma/prod.db /tmp/backup.db; then
        docker cp career-portfolio-backend-prod:/tmp/backup.db "$backup_file"
        gzip "$backup_file"
        
        log "✅ Database backup completed: ${backup_file}.gz"
        
        # Clean up old backups (keep last 7 days)
        find "$BACKUP_DIR" -name "db_backup_*.db.gz" -mtime +7 -delete
        
        return 0
    else
        log "❌ Database backup failed"
        return 1
    fi
}

# Backup application files
backup_application() {
    log "Starting application backup..."
    
    local backup_date=$(date +%Y%m%d_%H%M%S)
    local backup_file="${BACKUP_DIR}/app_backup_${backup_date}.tar.gz"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Backup application files (excluding node_modules and logs)
    if tar -czf "$backup_file" \
        --exclude='node_modules' \
        --exclude='logs' \
        --exclude='.git' \
        --exclude='coverage' \
        --exclude='dist' \
        --exclude='build' \
        -C "$(dirname "$(pwd)")" "$(basename "$(pwd)")"; then
        
        log "✅ Application backup completed: $backup_file"
        
        # Clean up old backups (keep last 3 days)
        find "$BACKUP_DIR" -name "app_backup_*.tar.gz" -mtime +3 -delete
        
        return 0
    else
        log "❌ Application backup failed"
        return 1
    fi
}

# Send alert
send_alert() {
    local message="$1"
    local severity="$2"
    
    log "Sending alert: $message"
    
    # Send email alert if configured
    if command -v mail >/dev/null 2>&1 && [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "Career Portfolio Alert - $severity" "$ALERT_EMAIL"
    fi
    
    # Send Slack alert if configured
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 Career Portfolio Alert - $severity\\n$message\"}" \
            "$SLACK_WEBHOOK"
    fi
}

# Restart services if needed
restart_services() {
    log "Restarting services..."
    
    cd "$(dirname "$0")/.."
    
    if docker-compose -f docker-compose.prod.yml restart; then
        log "✅ Services restarted successfully"
        sleep 30  # Wait for services to start
        return 0
    else
        log "❌ Failed to restart services"
        return 1
    fi
}

# Main monitoring function
main_monitor() {
    log "Starting monitoring cycle..."
    
    local health_failed=false
    local critical_issues=false
    
    # Perform health checks
    if ! check_health; then
        health_failed=true
    fi
    
    if ! check_api_health; then
        health_failed=true
    fi
    
    if ! check_containers; then
        health_failed=true
        critical_issues=true
    fi
    
    # Check system resources
    local disk_status
    check_disk_space
    disk_status=$?
    
    local memory_status
    check_memory
    memory_status=$?
    
    if [ $disk_status -eq 2 ] || [ $memory_status -eq 2 ]; then
        critical_issues=true
    fi
    
    # Handle failures
    if [ "$critical_issues" = true ]; then
        send_alert "Critical issues detected. Attempting to restart services." "CRITICAL"
        
        if restart_services; then
            # Re-check health after restart
            sleep 30
            if check_health && check_api_health; then
                send_alert "Services restarted successfully. System is healthy." "RESOLVED"
            else
                send_alert "Services restarted but health checks still failing. Manual intervention required." "CRITICAL"
            fi
        else
            send_alert "Failed to restart services. Manual intervention required." "CRITICAL"
        fi
    elif [ "$health_failed" = true ]; then
        send_alert "Health checks failing but containers are running. Investigating..." "WARNING"
    fi
    
    log "Monitoring cycle completed"
}

# Backup function
run_backup() {
    log "Starting backup process..."
    
    local backup_failed=false
    
    if ! backup_database; then
        backup_failed=true
    fi
    
    if ! backup_application; then
        backup_failed=true
    fi
    
    if [ "$backup_failed" = true ]; then
        send_alert "Backup process failed. Check logs for details." "WARNING"
    else
        log "✅ Backup process completed successfully"
    fi
}

# Performance monitoring
check_performance() {
    log "Checking application performance..."
    
    # Check response time
    local response_time=$(curl -o /dev/null -s -w '%{time_total}' "https://${DOMAIN}/")
    local response_time_ms=$(echo "$response_time * 1000" | bc)
    
    log "Response time: ${response_time_ms}ms"
    
    if (( $(echo "$response_time > 5.0" | bc -l) )); then
        send_alert "Application response time is slow: ${response_time_ms}ms" "WARNING"
    fi
    
    # Check SSL certificate expiry
    local cert_days=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2 | xargs -I {} date -d {} +%s)
    local current_days=$(date +%s)
    local days_until_expiry=$(( (cert_days - current_days) / 86400 ))
    
    log "SSL certificate expires in $days_until_expiry days"
    
    if [ $days_until_expiry -lt 30 ]; then
        send_alert "SSL certificate expires in $days_until_expiry days. Renewal required." "WARNING"
    fi
}

# Usage information
usage() {
    echo "Usage: $0 [monitor|backup|performance|all]"
    echo "  monitor     - Run health checks and monitoring"
    echo "  backup      - Run backup process"
    echo "  performance - Check application performance"
    echo "  all         - Run all checks"
    exit 1
}

# Main execution
case "${1:-all}" in
    monitor)
        main_monitor
        ;;
    backup)
        run_backup
        ;;
    performance)
        check_performance
        ;;
    all)
        main_monitor
        run_backup
        check_performance
        ;;
    *)
        usage
        ;;
esac