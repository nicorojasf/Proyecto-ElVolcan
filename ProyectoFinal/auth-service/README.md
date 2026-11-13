# auth-service (Gas El Volcán)

Registro, login, roles (`CLIENTE` y `ADMIN`), tipo de cliente (`RESIDENCIAL` o `COMERCIAL`) y emisión de JWT. Puerto **8082**, base `db_usuarios`.

## Correr SIN Docker y SIN base de datos (perfil dev, H2 en memoria)
Requiere Java 17 o superior. Maven viene incluido (mvnw).

Windows (PowerShell), desde la carpeta donde está `pom.xml`:
    .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"

Mac / Linux:
    ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

El perfil dev crea el admin `admin@admin.cl` / `Gasvolcan26` (los mismos datos que usa hoy el frontend).

## Correr con Docker
    copy .env.example .env     (Windows)   |   cp .env.example .env   (Mac/Linux)
    # edita .env: JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
    docker compose up --build

## Probar
Swagger: http://localhost:8082/swagger-ui.html (botón **Authorize** para pegar el token)

    curl -X POST http://localhost:8082/api/auth/registro -H "Content-Type: application/json" \
      -d '{"nombre":"Ana Pérez","email":"ana@correo.cl","telefono":"912345678","password":"Clave1234"}'

    curl -X POST http://localhost:8082/api/auth/login -H "Content-Type: application/json" \
      -d '{"email":"ana@correo.cl","password":"Clave1234"}'

    curl http://localhost:8082/api/auth/perfil -H "Authorization: Bearer <token>"

## Endpoints
| Método | Ruta | Acceso | Uso |
|---|---|---|---|
| POST | /api/auth/registro | público | Crea un CLIENTE (`tipoCliente` opcional, por defecto RESIDENCIAL). Responde 201 |
| POST | /api/auth/login | público | Devuelve `{token, tipo, expiraEnSegundos, usuario}` |
| GET | /api/auth/perfil | token | Datos del dueño del token (incluye `tipoCliente`) |
| GET | /api/auth/usuarios | ADMIN | Lista de usuarios |
| DELETE | /api/auth/usuarios/{id} | ADMIN | Elimina un usuario. Responde 204. Un admin no puede eliminar su propia cuenta |

Errores: `{timestamp, status, error, mensaje, detalles}` (mismo formato que product-service).
401 = token ausente/inválido o credenciales malas, 403 = sin permisos, 404 = recurso no existe, 409 = correo repetido.

## El JWT (para gateway y order-service)
Firmado con **HS256** usando `JWT_SECRET`. Emisor: `gasvolcan-auth-service`.

| Claim | Contenido |
|---|---|
| `sub` | correo del usuario |
| `uid` | id del usuario |
| `nombre` | nombre |
| `rol` | `CLIENTE` o `ADMIN` |
| `tipoCliente` | `RESIDENCIAL` o `COMERCIAL` |
| `exp` | vencimiento (`JWT_EXPIRATION_MINUTES`, 120 por defecto) |

Nota: al eliminar un usuario, su token sigue siendo válido hasta que venza. `/api/auth/perfil` ya le responde 401 porque consulta la base, pero el gateway y otros servicios solo verifican la firma del token.

## Variables de entorno
| Variable | Obligatoria | Uso |
|---|---|---|
| JWT_SECRET | sí (≥ 32 caracteres) | Secreto de firma. Sin él el servicio no arranca |
| DB_URL / DB_USER / DB_PASSWORD | no | Conexión a PostgreSQL |
| JWT_EXPIRATION_MINUTES | no | Vigencia del token |
| ADMIN_EMAIL / ADMIN_PASSWORD | no | Si están definidas, se crea el admin al iniciar |
| CORS_ORIGINS | no | Orígenes permitidos (se quita al poner el Gateway) |

## Tests
Windows: `.\mvnw.cmd test`  |  Mac / Linux: `./mvnw test`

Los nombres de las clases de test deben terminar en `Test` para que Maven las ejecute.
