#!/usr/bin/env bash
# Despliega Gas El Volcán en un servidor (EC2) con un solo comando:
#   ./desplegar-aws.sh IP_PUBLICA
# Crea el .env con secretos aleatorios (solo la primera vez), apunta el frontend y el CORS
# a la IP pública y levanta todo con Docker Compose.
set -euo pipefail

IP="${1:?Uso: ./desplegar-aws.sh IP_PUBLICA   (ejemplo: ./desplegar-aws.sh 3.85.10.20)}"
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  cp .env.example .env
  # El repositorio es público: los valores de ejemplo NO sirven como secretos reales.
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -hex 32)|" .env
  sed -i "s|^INTERNAL_API_KEY=.*|INTERNAL_API_KEY=$(openssl rand -hex 24)|" .env
  sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$(openssl rand -hex 16)|" .env
  echo ">> .env creado con secretos aleatorios"
else
  echo ">> Se mantiene el .env existente (y sus secretos)"
fi

# Direcciones que usa el NAVEGADOR: deben ser la IP pública, no localhost.
sed -i '/^CORS_ORIGINS=/d;/^VITE_PRODUCT_URL=/d;/^VITE_AUTH_URL=/d;/^VITE_ORDER_URL=/d' .env
cat >> .env <<EOT
CORS_ORIGINS=http://$IP:5173
VITE_PRODUCT_URL=http://$IP:8081
VITE_AUTH_URL=http://$IP:8082
VITE_ORDER_URL=http://$IP:8083
EOT

docker compose up --build -d
docker compose ps

echo
echo "Tienda:   http://$IP:5173"
echo "Swagger:  http://$IP:8081/swagger-ui.html  |  :8082  |  :8083"
