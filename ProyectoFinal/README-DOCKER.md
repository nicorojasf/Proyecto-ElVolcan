# Levantar todo el proyecto con Docker

1. `cp .env.example .env` y cambia `DB_PASSWORD`, `JWT_SECRET` (mínimo 32 caracteres) e `INTERNAL_API_KEY`.
2. `docker compose up --build`
3. Abre http://localhost:5173

| Servicio | Puerto | Base de datos (puerto en tu PC) |
|---|---|---|
| frontend (nginx) | 5173 | - |
| product-service | 8081 | db-productos (5432) |
| auth-service | 8082 | db-usuarios (5433) |
| order-service | 8083 | db-pedidos (5434) |

Comunicación: el navegador llama a 8081/8082/8083. Dentro de Docker, order-service llama a
`http://product-service:8081`. auth-service y order-service comparten `JWT_SECRET`.
Para borrar también los datos: `docker compose down -v`.

## Seguridad entre servicios
- Todos validan el mismo JWT (`JWT_SECRET`) que firma auth-service.
- product-service: GET público; crear/editar/borrar productos solo ADMIN.
- Descontar/aumentar stock: ADMIN o la cabecera `X-Internal-Key` (= `INTERNAL_API_KEY`) que envía order-service.
- Los `docker-compose.yml` individuales se eliminaron: usa solo el de esta carpeta.

## Pruebas sin Docker
Perfil dev (H2 en memoria, claves de desarrollo ya definidas): en cada servicio
`./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` y en el frontend `npm run dev`.

## Roles, versionado y renovación de token (Evaluación 3)

| Rol | Cuenta de prueba (`.env`) | Qué puede hacer |
|---|---|---|
| ADMIN | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Todo el panel: dashboard, órdenes (cambiar estado), productos, categorías, usuarios, reportes |
| VENDEDOR | `VENDEDOR_EMAIL` / `VENDEDOR_PASSWORD` (por defecto `vendedor@volcan.cl` / `Vendedor26`) | Solo ve lista y detalle de **productos** y de **órdenes** (lectura) |
| CLIENTE | se registra en la tienda | Solo la tienda y sus propios pedidos |

- Todas las rutas están versionadas: `/api/v1/productos`, `/api/v1/categorias`, `/api/v1/auth/...`, `/api/v1/pedidos`.
- Renovación del token: `POST /api/v1/auth/refresh` (con el token vigente devuelve uno nuevo). El frontend lo pide solo, un minuto antes de que venza.
- **Si ya tenías datos de antes**, ejecuta una vez `docker compose down -v` para recrear las bases: la columna `rol` de la base de usuarios fue creada con una restricción que solo admite CLIENTE y ADMIN, y `ddl-auto=update` no la modifica.
