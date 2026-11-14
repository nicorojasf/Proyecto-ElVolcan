# Etapa 1: compilar React con Vite
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Las URLs de los servicios se fijan al compilar (Vite las incrusta en el JS)
ARG VITE_PRODUCT_URL=http://localhost:8081
ARG VITE_AUTH_URL=http://localhost:8082
ARG VITE_ORDER_URL=http://localhost:8083
ENV VITE_PRODUCT_URL=$VITE_PRODUCT_URL VITE_AUTH_URL=$VITE_AUTH_URL VITE_ORDER_URL=$VITE_ORDER_URL
RUN npm run build

# Etapa 2: servir los archivos estáticos con nginx
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
