    # Root directory for static files
    root /usr/share/nginx/html;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;
    
    # ==============================================
    # API ROUTES - Auth Service
    # ==============================================

    # --------------------------------------------------
    # Vérification d'authentification (appel passif)
    # nginx intercepte les 4xx/5xx upstream → toujours
    # HTTP 200 vers le navigateur, erreur dans le JSON.
    # --------------------------------------------------
    location = /api/auth/status {
        proxy_pass http://auth_service/users/me;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_intercept_errors on;
        error_page 400 401 403 404 =200 @auth_status_unauth;
        error_page 500 502 503 504 =200 @auth_status_5xx;
    }
    location @auth_status_unauth {
        add_header Content-Type application/json always;
        return 200 '{"error":"invalid_or_expired_token"}';
    }
    location @auth_status_5xx {
        add_header Content-Type application/json always;
        return 200 '{"error":"service_unavailable"}';
    }

    # --------------------------------------------------
    # Login — erreurs attendues converties en 200 JSON
    # --------------------------------------------------
    location = /api/auth/login {
        proxy_pass http://auth_service/auth/login;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_intercept_errors on;
        error_page 400 401 422 =200 @auth_login_bad_credentials;
        error_page 403             =200 @auth_login_forbidden;
        error_page 500 502 503 504 =200 @auth_5xx;
    }
    location @auth_login_bad_credentials {
        add_header Content-Type application/json always;
        return 200 '{"error":"invalid_credentials","message":"auth.invalid_credentials"}';
    }
    location @auth_login_forbidden {
        add_header Content-Type application/json always;
        return 200 '{"error":"email_not_verified","message":"auth.email_verification_required"}';
    }

    # --------------------------------------------------
    # Logout
    # --------------------------------------------------
    location = /api/auth/logout {
        proxy_pass http://auth_service/auth/logout;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_intercept_errors on;
        error_page 400 401 403 =200 @auth_logout_ok;
        error_page 500 502 503 504 =200 @auth_5xx;
    }
    location @auth_logout_ok {
        add_header Content-Type application/json always;
        return 200 '{"error":"invalid_or_expired_token"}';
    }

    # --------------------------------------------------
    # Gestionnaire générique erreurs 5xx auth
    # --------------------------------------------------
    location @auth_5xx {
        add_header Content-Type application/json always;
        return 200 '{"error":"service_unavailable","message":"common.service_unavailable"}';
    }

    # Toutes les autres routes auth (register, forgot, reset, verify…)
    location /api/auth/ {
        proxy_pass http://auth_service/auth/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/users/ {
        proxy_pass http://auth_service/users/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Listings — api_limit (120r/m, burst 20)
    location /api/listings/ {

        client_max_body_size 55M;
        proxy_pass http://listings_service/listings/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/moderator/ {
        client_max_body_size 5M;
        proxy_pass http://listings_service/moderator/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/credits/ {
        proxy_pass http://credits_service/credits/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ai/chat/ {
        client_max_body_size 5M;

        # Apply rate limiting
        limit_req zone=chatbot_limit burst=5;
        limit_req_status 429;

        proxy_pass http://ai_service/ai/chat/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

				#========================================
				#           Config for the streaming
				#========================================
				proxy_buffering off;
				proxy_cache off;
				chunked_transfer_encoding on;
				proxy_read_timeout 180s;
    }

    location /api/reservations/ {
        client_max_body_size 5M;
        proxy_pass http://reservations_service/reservations/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

		
    location /api/ai/ {
        client_max_body_size 5M;
        
        # Apply rate limiting
        limit_req zone=chatbot_limit burst=5;
        limit_req_status 429;

        proxy_pass http://ai_service/ai/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

		}

    # Route interne — accessible uniquement depuis le réseau Docker (pas depuis l'extérieur)
    location /api/internal/ {
        allow 172.16.0.0/12;
        allow 10.0.0.0/8;
        allow 192.168.0.0/16;
        deny all;

        client_max_body_size 5M;
        proxy_pass http://credits_service/internal/credits/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }


    
    # ==============================================
    # STATIC FILES (UPLOADS)
    # ==============================================
    location ^~ /uploads/ {
        root /var/www;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # ==============================================
    # STATIC FILES (FRONTEND ASSETS)
    # ==============================================
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA fallback - all routes go to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
