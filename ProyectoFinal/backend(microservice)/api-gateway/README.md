# api-gateway

Punto de entrada único del backend (Spring Cloud Gateway, puerto **8080**). El frontend llama solo a esta dirección y el gateway reenvía cada petición al microservicio que corresponde:

| Si la ruta empieza con | Va a | Puerto |
|---|---|---|
| `/api/v1/productos/**`, `/api/v1/categorias/**` | product-service | 8081 |
| `/api/v1/auth/**` | auth-service | 8082 |
| `/api/v1/pedidos/**` | order-service | 8083 |

- Solo **enruta**. Cada microservicio sigue validando el JWT con el mismo `JWT_SECRET` y aplicando sus roles.
- El CORS lo responde cada microservicio (`CORS_ORIGINS`); el gateway reenvía el encabezado `Origin` tal cual.
- Direcciones de los servicios: variables `PRODUCT_SERVICE_URL`, `AUTH_SERVICE_URL` y `ORDER_SERVICE_URL`
  (por defecto `localhost` y su puerto; en Docker, el nombre del contenedor).
- Swagger sigue en cada servicio (8081, 8082 y 8083). El gateway no tiene base de datos.

## Probar
```
.\mvnw.cmd test
curl http://localhost:8080/api/v1/productos        # debe responder lo mismo que :8081
```
