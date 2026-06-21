# Módulo de Ventas — Prototipo (validación del *as-is*)

Prototipo simple en **HTML + CSS + JavaScript puro**, sin base de datos: los datos
viven en memoria y se persisten en el **localStorage** del navegador. Sirve para
**emular el proceso actual** de toma de pedidos (estilo del módulo "Toma Pedidos Fast").

## Cómo abrirlo

1. Entrá a la carpeta `modulo-ventas`.
2. Doble clic en **`index.html`** (se abre en el navegador, no necesita servidor).
3. Iniciá sesión con un vendedor de prueba, por ejemplo:
   - `juan@empresa.com` / `1234`
   - (la lista completa está en el desplegable del login)

## Flujo del prototipo

1. **Login** — ingreso del vendedor.
2. **Selección de cliente** — muestra solo los clientes de la cartera del vendedor,
   con su **rubro** y **subrubros**. Se puede buscar y filtrar por rubro.
3. **Toma de pedidos (catálogo)** — tabla con imagen, código, descripción, categoría,
   unidad, precio y stock. Botón **＋** para agregar al pedido.
4. **Carrito / pedido** — ícono 🛒 arriba a la derecha: ajustar cantidades y **Confirmar pedido**.
5. **Historial de ventas** — ventas anteriores del cliente seleccionado (expandibles).
6. **Pedidos realizados** — pedidos que registraste en esta demo.

## Editar los datos (Excel)

Los datos de ejemplo están en la carpeta **`data/`** como Excel editables:

| Archivo            | Hojas                | Qué podés cambiar                                  |
|--------------------|----------------------|----------------------------------------------------|
| `vendedores.xlsx`  | `Vendedores`         | nombre, **email**, **password**, zona              |
| `clientes.xlsx`    | `Clientes`           | id, nombre, rubro, subrubro1/2, sede, vendedorEmail|
| `productos.xlsx`   | `Productos`          | codigo, nombre, categoria, unidad, precio, stock, emoji, **imagen** |
| `ventas.xlsx`      | `Ventas` + `Detalle` | historial de ventas y su detalle                   |

**Dos formas de aplicar tus cambios:**

- **Rápida (recomendada):** editá el `.xlsx`, entrá a la app y usá el botón
  **⬆️ Importar Excel** (abajo a la izquierda). Seleccioná el archivo editado y los
  datos se reemplazan al instante. *(Requiere internet la primera vez para cargar el lector de Excel.)*
- **Regenerar todo desde cero:** editá `tools/generar_datos.py` y ejecutá
  `python tools/generar_datos.py` — regenera los Excel y `js/data.js`.

> El botón **♻️ Restaurar datos** vuelve a los valores originales y borra los pedidos
> creados durante la demo.

### Notas
- La columna **`vendedorEmail`** de clientes define qué cliente ve cada vendedor.
  Debe coincidir con un `email` de la hoja de vendedores.
- La columna **`imagen`** de productos apunta a una foto real local (`data/img/<codigo>.jpg`).
  Podés reemplazar el archivo .jpg o poner otra ruta/URL. Si la imagen no carga, se muestra el
  **`emoji`** como respaldo.
- Si editás `vendedores`, asegurate de que los `vendedorEmail` de los clientes sigan existiendo.

## Estructura

```
modulo-ventas/
├── index.html              # app (login + módulos)
├── css/styles.css
├── js/
│   ├── data.js             # datos semilla (autogenerado)
│   └── app.js              # lógica + localStorage
├── data/                   # Excel editables
│   ├── vendedores.xlsx
│   ├── clientes.xlsx
│   ├── productos.xlsx
│   └── ventas.xlsx
├── tools/generar_datos.py  # fuente única que genera data/ y js/data.js
└── LEER_PRIMERO.md
```
