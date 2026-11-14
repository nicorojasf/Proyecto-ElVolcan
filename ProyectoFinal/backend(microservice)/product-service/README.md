# product-service (Gas El Volcán)

Catálogo de productos, categorías y control de stock. Puerto **8081**.

## Levantar con Docker (recomendado)
    docker compose up --build

## Levantar sin Docker
1. Tener PostgreSQL con una base `db_productos`.
2. `mvn spring-boot:run` (usa DB_URL / DB_USER / DB_PASSWORD si las defines).

## Probar
- Swagger: http://localhost:8081/swagger-ui.html
- Catálogo: http://localhost:8081/api/v1/productos
- Por categoría: http://localhost:8081/api/v1/productos?categoria=cilindros
- Categorías: http://localhost:8081/api/v1/categorias

## Endpoints
| Método | Ruta | Uso |
|---|---|---|
| GET | /api/v1/productos[?categoria=slug] | Catálogo |
| GET | /api/v1/productos/{codigo} | Detalle |
| POST | /api/v1/productos | Crear (admin) |
| PUT | /api/v1/productos/{codigo} | Editar (admin) |
| DELETE | /api/v1/productos/{codigo} | Desactivar (admin) |
| PUT | /api/v1/productos/{codigo}/activar | Reactivar un producto desactivado (admin) |
| GET | /api/v1/productos/desactivados | Lista de desactivados (admin) |
| PUT | /api/v1/productos/{codigo}/stock/descontar | Body `{"cantidad": 2}` (order-service) |
| PUT | /api/v1/productos/{codigo}/stock/aumentar | Body `{"cantidad": 2}` |
| GET | /api/v1/categorias | Categorías |

## Tests
    mvn test

## Correr SIN Docker y SIN instalar base de datos (VS Code / terminal)
Requisito: Java 17 o superior (`java -version`).

Windows (PowerShell o terminal de VS Code):
    .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"

Mac/Linux:
    ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev

Cuando aparezca "Catálogo inicial cargado", abre http://localhost:8081/api/v1/productos

## Correr sin Docker (VS Code o terminal) con base de datos en memoria
Requiere solo Java 17 o superior (JDK). Maven viene incluido (mvnw).

Windows:
    mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"

Mac / Linux:
    ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
