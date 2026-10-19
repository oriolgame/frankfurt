# Frankfurt · Comandas

App web (una sola página, `index.html`) para apuntar pedidos por mesa, optimizada para móvil.
Los pedidos se comparten en directo entre móviles mediante Firebase Realtime Database.
Se publica con GitHub Pages.

## Configuración
1. En `index.html`, rellena `DB_URL` con la URL de tu Realtime Database.
2. Reglas de la base de datos (el PIN actúa como "puerta" de los datos, la raíz no se puede leer):

```json
{ "rules": { ".read": false, ".write": false, "$pin": { ".read": true, ".write": true } } }
```

3. Abre el link con el PIN: `https://oriolgame.github.io/frankfurt/#TUPIN`
