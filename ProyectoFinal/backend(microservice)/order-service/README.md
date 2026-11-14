# order-service (Gas El Volcán)

Crea pedidos, recalcula precios consultando a `product-service`, descuenta el stock y maneja los estados del pedido. Puerto **8083**, base `db_pedidos`.

Depende de dos cosas:
- **auth-service**: emite los JWT. Este servicio solo los verifica (mismo `JWT_SECRET`).
- **product-service** (puerto 8081): de ahí salen precios y stock.

## Correr SIN Docker y SIN base de datos (perfil dev, H2 en memoria)
Requiere Java 17 o superior. Maven viene incluido (mvnw).

Windows (PowerShell), desde la carpeta donde está `pom.xml`:
    .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"

Mac / Linux:
    ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

Para crear un pedido de verdad tienes que tener corriendo también:
1. `product-service` en el 8081 (perfil dev, trae el catálogo cargado).
2. `auth-service` en el 8082 (perfil dev), para obtener un token con `POST /api/v1/auth/login`.

El perfil dev de ambos servicios usa el mismo secreto de prueba, así que el token de uno sirve en el otro.

## Correr con Docker
    copy .env.example .env     (Windows)   |   cp .env.example .env   (Mac/Linux)
    # edita .env: JWT_SECRET (igual al de auth-service) y PRODUCT_SERVICE_URL
    docker compose up --build

## Probar
Swagger: http://localhost:8083/swagger-ui.html (botón **Authorize** para pegar el token, sin la palabra `Bearer`).

1. Inicia sesión en auth-service (`POST http://localhost:8082/api/v1/auth/login`) y copia el `token`.
2. `POST /api/v1/pedidos` con este cuerpo. **Solo código y cantidad**: el precio lo calcula el servidor.

```json
{
  "cliente": { "nombre": "Ana", "apellidos": "Pérez", "correo": "ana@correo.cl" },
  "direccion": {
    "calle": "Los Aromos", "numero": "123", "tipo": "casa", "depto": "",
    "region": "Metropolitana", "comuna": "Maipú", "indicaciones": "Portón verde"
  },
  "items": [ { "codigo": "CL001", "cantidad": 2 } ]
}
```

Debe responder **201** con el pedido en estado `PENDIENTE`, y el stock de `CL001` baja en `GET http://localhost:8081/api/v1/productos/CL001`.

## Endpoints
| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| POST | /api/v1/pedidos | con sesión | Crea el pedido y descuenta el stock. Responde 201 |
| GET | /api/v1/pedidos/mis-pedidos | con sesión | Historial del usuario del token |
| GET | /api/v1/pedidos/{id} | dueño, VENDEDOR o ADMIN | Detalle de un pedido (el de otra persona da 404) |
| GET | /api/v1/pedidos[?estado=PENDIENTE] | ADMIN o VENDEDOR | Todos los pedidos, con filtro opcional |
| PUT | /api/v1/pedidos/{id}/estado | ADMIN | Body `{"estado":"CONFIRMADO"}` |

Errores: `{timestamp, status, error, mensaje, detalles}` (mismo formato que los otros servicios).
400 = datos inválidos o producto inexistente, 401 = token ausente/inválido, 403 = sin permisos,
404 = no existe, 409 = sin stock o cambio de estado no permitido, 503 = product-service no responde.

## Cómo se arma un pedido
1. Del token salen el id del usuario (`uid`), su correo y su **tipo de cliente**: residencial paga `precioResidencial`, comercial paga `precioComercial`.
2. Por cada producto se consulta a product-service el precio y el stock actuales. Lo que mande el cliente como precio se ignora.
3. Se descuenta el stock (operación atómica en product-service). Si un producto falla a mitad de camino, se devuelve lo que ya se había descontado.
4. Se guarda el pedido con sus líneas en una sola transacción. Si la base falla, también se devuelve el stock.

Cada línea guarda el nombre y el precio cobrado en ese momento: el historial no cambia si el catálogo cambia después.

## Estados
    PENDIENTE -> CONFIRMADO -> EN_CAMINO -> ENTREGADO
    PENDIENTE o CONFIRMADO -> CANCELADO   (devuelve el stock)

No se puede saltar pasos ni retroceder. `ENTREGADO` y `CANCELADO` son finales. Un pedido ya `EN_CAMINO` no se cancela.
Si product-service no responde al cancelar, el pedido queda `CANCELADO` y la API avisa con 503: repite la cancelación y solo se reintenta el stock que faltó.

## Variables de entorno
| Variable | Obligatoria | Uso |
|---|---|---|
| JWT_SECRET | sí (≥ 32 caracteres) | Debe ser idéntico al de auth-service. Sin él el servicio no arranca |
| PRODUCT_SERVICE_URL | no | URL de product-service (por defecto http://localhost:8081) |
| DB_URL / DB_USER / DB_PASSWORD | no | Conexión a PostgreSQL |
| CORS_ORIGINS | no | Orígenes del frontend permitidos por CORS |

## Tests
Windows: `.\mvnw.cmd test`  |  Mac / Linux: `./mvnw test`

No necesitan los otros servicios: product-service se simula en los tests y los tokens se firman con el secreto de prueba.
Los nombres de las clases de test deben terminar en `Test` para que Maven las ejecute.
