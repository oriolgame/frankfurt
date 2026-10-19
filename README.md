# Frankfurt · Comandas

App web para apuntar pedidos por mesa, optimizada para móvil. Los pedidos se comparten en directo entre todos los móviles.

- `index.html`: la app
- `server.js`: servidor Node sin dependencias (`npm start`)

## Variables de entorno
- `PORT`: lo pone Railway solo.
- `DATA_FILE`: ruta del archivo donde se guardan los pedidos. En Railway: `/data/data.json` (con un Volume montado en `/data`).
