# ERP — Prototipo (validación del *as-is*)

Prototipo en **HTML + CSS + JavaScript puro**, sin base de datos: los datos viven en
memoria y se persisten en el **localStorage** del navegador. Sirve para **emular el
proceso actual** de toma de pedidos y validarlo con usuarios.

🔗 **Demo en vivo:** https://vlenix2505.github.io/modulo-ventas/

## Usuarios de prueba

| Correo               | Contraseña | Zona      |
|----------------------|------------|-----------|
| `juan@empresa.com`   | `1234`     | Lima      |
| `sofia@empresa.com`  | `1234`     | Arequipa  |
| `carlos@empresa.com` | `1234`     | Piura     |
| `ana@empresa.com`    | `1234`     | Trujillo  |
| `maria@empresa.com`  | `1234`     | Cusco     |

> Cada vendedor ve únicamente los clientes de su cartera (zona).

## Flujo

1. **Login** del vendedor.
2. **Selección de cliente** — clientes de su cartera, con **rubro** y **subrubros**; búsqueda y filtro.
3. **Toma de pedidos** — catálogo con imagen, código, descripción, categoría, unidad, precio y stock. Botón **＋** para agregar.
4. **Pedido actual** (ícono 🛒 arriba a la derecha) — ajustar cantidades y **Confirmar pedido**.
5. **Historial de ventas** — ventas anteriores del cliente seleccionado.
6. **Pedidos realizados** — pedidos registrados en la demo.

## Editar los datos (Excel)

Los datos están en **`data/`** como Excel editables:

| Archivo            | Hojas                | Campos                                              |
|--------------------|----------------------|----------------------------------------------------|
| `vendedores.xlsx`  | `Vendedores`         | nombre, **email**, **password**, zona              |
| `clientes.xlsx`    | `Clientes`           | id, nombre, rubro, subrubro1/2, sede, vendedorEmail|
| `productos.xlsx`   | `Productos`          | codigo, nombre, categoria, unidad, precio, stock, emoji, imagen |
| `ventas.xlsx`      | `Ventas` + `Detalle` | historial de ventas y su detalle                   |

**Aplicar cambios:**
- **Rápido:** editá el `.xlsx` y usá **⬆️ Importar Excel** dentro de la app (requiere internet la primera vez para cargar el lector).
- **Regenerar todo:** editá `tools/generar_datos.py` y ejecutá `python tools/generar_datos.py` (regenera `data/` y `js/data.js`).
- **♻️ Restaurar datos** vuelve a los valores originales y borra los pedidos de la demo.

Notas:
- `vendedorEmail` (clientes) define qué cliente ve cada vendedor; debe coincidir con un `email` de vendedores.
- `imagen` apunta a una foto local (`data/img/<codigo>.jpg`); si no carga, se muestra el `emoji` de respaldo.

## Estructura

```
modulo-ventas/
├── index.html              # app (login + módulos)
├── css/styles.css
├── js/
│   ├── data.js             # datos semilla (autogenerado)
│   └── app.js              # lógica + localStorage
├── data/                   # Excel editables + img/ (fotos de productos)
├── tools/generar_datos.py  # genera data/ y js/data.js desde una sola fuente
└── README.md
```

## Despliegue

Sitio estático servido con **GitHub Pages** (rama `main`, raíz). Cada `git push` lo redespliega
automáticamente en ~1-2 minutos.

---
Prototipo para validación. Los pedidos y datos importados se guardan en el `localStorage` de
cada navegador (no es una base compartida).
