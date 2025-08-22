#!/bin/sh

# Use PORT environment variable or default to 80
PORT=${PORT:-80}

# Replace the port in nginx config
sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/nginx.conf

# Start nginx
nginx -g "daemon off;"