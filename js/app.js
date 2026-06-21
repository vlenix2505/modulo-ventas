/* ============================================================================
   Módulo de Ventas — prototipo (HTML/CSS/JS puro, persistencia en localStorage)
   ========================================================================== */
"use strict";

const LS_KEY = "modulo_ventas_db_v2";

/* ----------------------------- Estado / DB -------------------------------- */
let DB = null;             // { vendedores, clientes, productos, ventas }
let sesion = null;         // vendedor logueado
let clienteSel = null;     // cliente seleccionado
let carrito = [];          // [{codigo, nombre, precio, emoji, unidad, cantidad}]

const money = (n) => "S/ " + Number(n).toFixed(2);
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const esc = (s) => String(s).replace(/"/g, "&quot;");

/* Miniatura de producto: imagen real con emoji de respaldo si falla la carga */
function imgTile(p, cls) {
  const fb = p.emoji || "📦";
  if (!p.imagen) return `<div class="${cls}">${fb}</div>`;
  return `<div class="${cls}"><span class="pi-emoji">${fb}</span>` +
         `<img src="${esc(p.imagen)}" alt="${esc(p.nombre)}" loading="lazy" onerror="this.remove()"></div>`;
}

/* ----------------------------- Iconos SVG --------------------------------- */
const ICONS = {
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  chart: '<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
  clipboard: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  hand: '<path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/>',
};
function svg(name, cls = "") {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ""}</svg>`;
}

/* Encabezado estándar de cada vista */
function vistaHead(icono, titulo, subtitulo) {
  return `<div class="vista-head">
    ${svg(icono, "vista-head-ico")}
    <div><h2>${titulo}</h2><p>${subtitulo}</p></div>
  </div>`;
}

/* Caja de búsqueda con lupa */
function searchBox(id, ph) {
  return `<div class="search">${svg("search")}<input type="text" id="${id}" placeholder="${ph}"></div>`;
}

/* Color e iniciales para avatares (estable por texto) */
const AVATAR_COLORES = ["#6d4fd8", "#2d9d78", "#d6822b", "#c0497b", "#3a7bd5", "#8a5cd1", "#1aa3a3", "#c0392b"];
function avatarColor(txt) {
  let h = 0;
  for (let i = 0; i < txt.length; i++) h = (h * 31 + txt.charCodeAt(i)) >>> 0;
  return AVATAR_COLORES[h % AVATAR_COLORES.length];
}
function iniciales(nombre) {
  return nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

/* Carga DB desde localStorage; si no existe, clona los datos semilla. */
function cargarDB() {
  const guardado = localStorage.getItem(LS_KEY);
  if (guardado) {
    try { DB = JSON.parse(guardado); return; } catch (_) {}
  }
  DB = JSON.parse(JSON.stringify(window.SEED_DATA));
  guardarDB();
}
function guardarDB() { localStorage.setItem(LS_KEY, JSON.stringify(DB)); }

function resetDB() {
  if (!confirm("Esto restaura los datos originales y borra los pedidos creados en esta demo. ¿Continuar?")) return;
  DB = JSON.parse(JSON.stringify(window.SEED_DATA));
  guardarDB();
  toast("Datos restaurados", "ok");
  // Reinicia estado de cliente/carrito y refresca
  clienteSel = null; carrito = [];
  pintarTopbarCliente(); actualizarBadge();
  navegar("clientes");
}

/* ------------------------------ Toast ------------------------------------- */
let toastTimer = null;
function toast(msg, tipo = "") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast " + tipo;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

/* ============================================================================
   LOGIN
   ========================================================================== */
function initLogin() {
  // Pista de usuarios de prueba
  const hint = DB.vendedores
    .map((v) => `<code>${v.email}</code> / <code>${v.password}</code>`)
    .join("<br>");
  $("#login-hint-list").innerHTML = hint;

  $("#form-login").addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#login-email").value.trim().toLowerCase();
    const pass = $("#login-pass").value;
    const v = DB.vendedores.find(
      (u) => u.email.toLowerCase() === email && u.password === pass
    );
    const err = $("#login-error");
    if (!v) {
      err.textContent = "Correo o contraseña incorrectos.";
      err.hidden = false;
      return;
    }
    err.hidden = true;
    sesion = v;
    entrarApp();
  });
}

function entrarApp() {
  $("#vista-login").hidden = true;
  $("#app").hidden = false;
  $("#usuario-nombre").textContent = `${sesion.nombre} · ${sesion.zona}`;
  const av = $("#usuario-avatar");
  av.textContent = iniciales(sesion.nombre);
  av.style.background = avatarColor(sesion.nombre);
  clienteSel = null; carrito = [];
  pintarTopbarCliente(); actualizarBadge();
  navegar("clientes");
}

function logout() {
  sesion = null; clienteSel = null; carrito = [];
  $("#app").hidden = true;
  $("#vista-login").hidden = false;
  $("#login-pass").value = "";
}

/* ============================================================================
   NAVEGACIÓN
   ========================================================================== */
function navegar(vista) {
  $$(".menu-item").forEach((b) => b.classList.toggle("activo", b.dataset.vista === vista));
  $$(".vista").forEach((v) => v.classList.remove("activa"));
  $(`#vista-${vista}`).classList.add("activa");

  if (vista === "clientes") renderClientes();
  if (vista === "historial") renderHistorial();
  if (vista === "catalogo") renderCatalogo();
  if (vista === "pedidos") renderPedidos();
}

/* Clientes asignados al vendedor logueado */
function clientesDelVendedor() {
  return DB.clientes.filter((c) => c.vendedorEmail === sesion.email);
}

/* ============================================================================
   VISTA: SELECCIÓN DE CLIENTE
   ========================================================================== */
function renderClientes() {
  const cont = $("#vista-clientes");
  const clientes = clientesDelVendedor();

  cont.innerHTML = `
    ${vistaHead("users", "Selección de cliente", `${clientes.length} cliente(s) asignados a tu cartera`)}
    <div class="toolbar">
      ${searchBox("busca-cliente", "Buscar por nombre o código…")}
      <select id="filtro-rubro"><option value="">Todos los rubros</option></select>
    </div>
    <div id="grid-clientes" class="grid-clientes"></div>
  `;

  const sel = $("#filtro-rubro");
  [...new Set(clientes.map((c) => c.rubro))].sort().forEach((r) => {
    sel.insertAdjacentHTML("beforeend", `<option value="${r}">${r}</option>`);
  });

  const pintar = () => {
    const q = $("#busca-cliente").value.trim().toLowerCase();
    const rubro = $("#filtro-rubro").value;
    const filtrados = clientes.filter((c) => {
      const coincide = (c.nombre + " " + c.id).toLowerCase().includes(q);
      const rubroOk = !rubro || c.rubro === rubro;
      return coincide && rubroOk;
    });
    const grid = $("#grid-clientes");
    if (!filtrados.length) {
      grid.innerHTML = `<div class="vacio"><div class="ico">${svg("search")}</div>No se encontraron clientes.</div>`;
      return;
    }
    grid.innerHTML = filtrados.map((c) => `
      <div class="card-cliente ${clienteSel && clienteSel.id === c.id ? "sel" : ""}" data-id="${c.id}">
        <div class="cc-top">
          <span class="cc-avatar" style="background:${avatarColor(c.nombre)}">${iniciales(c.nombre)}</span>
          <div class="cc-name">
            <h3 title="${esc(c.nombre)}">${c.nombre}</h3>
            <span class="cc-id">${c.id}</span>
          </div>
        </div>
        <div class="chips">
          <span class="chip">${c.rubro}</span>
          ${c.subrubro1 ? `<span class="chip gris">${c.subrubro1}</span>` : ""}
          ${c.subrubro2 ? `<span class="chip gris">${c.subrubro2}</span>` : ""}
        </div>
        <div class="cc-sede">${svg("pin")} ${c.sede}</div>
      </div>
    `).join("");

    $$("#grid-clientes .card-cliente").forEach((card) => {
      card.addEventListener("click", () => seleccionarCliente(card.dataset.id));
    });
  };

  $("#busca-cliente").addEventListener("input", pintar);
  $("#filtro-rubro").addEventListener("change", pintar);
  pintar();
}

function seleccionarCliente(id) {
  const c = DB.clientes.find((x) => x.id === id);
  if (!c) return;
  // Cambiar de cliente con carrito en curso: confirmar
  if (carrito.length && clienteSel && clienteSel.id !== id) {
    if (!confirm("Tenés un pedido en curso para otro cliente. ¿Cambiar de cliente y vaciar el pedido?")) return;
    carrito = []; actualizarBadge();
  }
  clienteSel = c;
  pintarTopbarCliente();
  toast(`Cliente seleccionado: ${c.nombre}`, "ok");
  navegar("catalogo");
}

function pintarTopbarCliente() {
  if (clienteSel) {
    $("#topbar-cliente-nombre").textContent = clienteSel.nombre;
    $("#topbar-cliente-info").textContent =
      `${clienteSel.id} · ${clienteSel.rubro} · ${clienteSel.sede}`;
  } else {
    $("#topbar-cliente-nombre").textContent = "— sin seleccionar —";
    $("#topbar-cliente-info").textContent = "";
  }
}

/* ============================================================================
   VISTA: HISTORIAL DE VENTAS (del cliente seleccionado)
   ========================================================================== */
function ventasDeCliente(id) {
  return DB.ventas
    .filter((v) => v.clienteId === id)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

function renderHistorial() {
  const cont = $("#vista-historial");
  if (!clienteSel) {
    cont.innerHTML = avisoSinCliente("ver su historial de ventas");
    return;
  }
  const ventas = ventasDeCliente(clienteSel.id);
  const totalHist = ventas.reduce((s, v) => s + v.total, 0);

  cont.innerHTML = `
    ${vistaHead("chart", "Historial de ventas", `${clienteSel.nombre} · ${ventas.length} pedido(s) · acumulado ${money(totalHist)}`)}
    <div id="lista-historial"></div>
  `;

  const lista = $("#lista-historial");
  if (!ventas.length) {
    lista.innerHTML = `<div class="vacio"><div class="ico">${svg("inbox")}</div>Este cliente aún no tiene ventas registradas.</div>`;
    return;
  }
  lista.innerHTML = ventas.map(ventaCardHTML).join("");
  enlazarAcordeon(lista);
}

function ventaCardHTML(v) {
  const filas = v.items.map((it) => `
    <tr>
      <td class="col-cod">${it.codigo}</td>
      <td>${it.nombre}</td>
      <td class="col-num">${it.cantidad}</td>
      <td class="col-num">${money(it.precio)}</td>
      <td class="col-num">${money(it.subtotal)}</td>
    </tr>`).join("");
  return `
    <div class="venta-card" data-id="${v.ventaId}">
      <div class="venta-head">
        <span class="venta-tag">${svg("receipt")}</span>
        <div class="venta-meta">
          <span class="venta-id">${v.ventaId}</span>
          <span class="venta-fecha">${v.fecha} · ${v.items.length} ítem(s)</span>
        </div>
        <div class="venta-right">
          <span class="venta-total">${money(v.total)}</span>
          <span class="caret">▾</span>
        </div>
      </div>
      <div class="venta-detalle">
        <table>
          <thead><tr><th>Código</th><th>Producto</th><th class="col-num">Cant.</th><th class="col-num">Precio</th><th class="col-num">Subtotal</th></tr></thead>
          <tbody>${filas}</tbody>
        </table>
      </div>
    </div>`;
}

function enlazarAcordeon(scope) {
  scope.querySelectorAll(".venta-head").forEach((h) => {
    h.addEventListener("click", () => h.parentElement.classList.toggle("abierto"));
  });
}

/* ============================================================================
   VISTA: CATÁLOGO / TOMA DE PEDIDOS
   ========================================================================== */
function renderCatalogo() {
  const cont = $("#vista-catalogo");
  cont.innerHTML = `
    ${vistaHead("clipboard", "Toma de pedidos", `${DB.productos.length} productos en catálogo`)}
    ${clienteSel ? "" : avisoSinClienteInline()}
    <div class="toolbar">
      ${searchBox("busca-prod", "Buscar por nombre o código…")}
      <select id="filtro-cat"><option value="">Todas las categorías</option></select>
    </div>
    <div class="tabla-wrap">
      <table>
        <thead>
          <tr>
            <th>Imagen</th><th>Código</th><th>Descripción</th><th>Categoría</th>
            <th>Unidad</th><th class="col-num">Precio</th><th class="col-num">Stock</th><th></th>
          </tr>
        </thead>
        <tbody id="tbody-prod"></tbody>
      </table>
    </div>
  `;

  const sel = $("#filtro-cat");
  [...new Set(DB.productos.map((p) => p.categoria))].sort().forEach((c) => {
    sel.insertAdjacentHTML("beforeend", `<option value="${c}">${c}</option>`);
  });

  const pintar = () => {
    const q = $("#busca-prod").value.trim().toLowerCase();
    const cat = $("#filtro-cat").value;
    const filtrados = DB.productos.filter((p) => {
      const coincide = (p.nombre + " " + p.codigo).toLowerCase().includes(q);
      return coincide && (!cat || p.categoria === cat);
    });
    const tb = $("#tbody-prod");
    if (!filtrados.length) {
      tb.innerHTML = `<tr><td colspan="8"><div class="vacio"><div class="ico">${svg("search")}</div>Sin resultados.</div></td></tr>`;
      return;
    }
    tb.innerHTML = filtrados.map((p) => {
      const bajo = p.stock <= 60;
      return `
      <tr>
        <td>${imgTile(p, "prod-img")}</td>
        <td class="col-cod">${p.codigo}</td>
        <td class="td-nombre">${p.nombre}</td>
        <td><span class="cat-tag">${p.categoria}</span></td>
        <td><span class="unidad">${p.unidad}</span></td>
        <td class="col-num precio">${money(p.precio)}</td>
        <td class="col-num"><span class="stock-pill ${bajo ? "bajo" : ""}">${p.stock}</span></td>
        <td class="col-num">
          <button class="btn-add" data-cod="${p.codigo}" ${clienteSel ? "" : "disabled title='Seleccioná un cliente primero'"}>${svg("plus")}</button>
        </td>
      </tr>`;
    }).join("");

    tb.querySelectorAll(".btn-add").forEach((btn) => {
      btn.addEventListener("click", () => agregarAlCarrito(btn.dataset.cod));
    });
  };

  $("#busca-prod").addEventListener("input", pintar);
  $("#filtro-cat").addEventListener("change", pintar);
  pintar();
}

/* ============================================================================
   CARRITO / PEDIDO
   ========================================================================== */
function agregarAlCarrito(codigo) {
  if (!clienteSel) { toast("Primero seleccioná un cliente", "err"); navegar("clientes"); return; }
  const p = DB.productos.find((x) => x.codigo === codigo);
  if (!p) return;
  const item = carrito.find((i) => i.codigo === codigo);
  if (item) item.cantidad += 1;
  else carrito.push({ codigo: p.codigo, nombre: p.nombre, precio: p.precio, emoji: p.emoji, imagen: p.imagen, unidad: p.unidad, cantidad: 1 });
  actualizarBadge();
  renderCarrito();
  toast(`Agregado: ${p.nombre}`, "ok");
}

function cambiarCantidad(codigo, delta) {
  const item = carrito.find((i) => i.codigo === codigo);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) carrito = carrito.filter((i) => i.codigo !== codigo);
  actualizarBadge();
  renderCarrito();
}

function quitarDelCarrito(codigo) {
  carrito = carrito.filter((i) => i.codigo !== codigo);
  actualizarBadge();
  renderCarrito();
}

function totalCarrito() {
  return carrito.reduce((s, i) => s + i.precio * i.cantidad, 0);
}

function actualizarBadge() {
  const n = carrito.reduce((s, i) => s + i.cantidad, 0);
  $("#cart-count").textContent = n;
}

function abrirCarrito() { $("#cart-overlay").hidden = false; $("#cart-panel").hidden = false; renderCarrito(); }
function cerrarCarrito() { $("#cart-overlay").hidden = true; $("#cart-panel").hidden = true; }

function renderCarrito() {
  $("#cart-cliente").innerHTML = clienteSel
    ? `Pedido para <strong>${clienteSel.nombre}</strong> (${clienteSel.id})`
    : "Sin cliente seleccionado";

  const cont = $("#cart-items");
  if (!carrito.length) {
    cont.innerHTML = `<div class="cart-vacio">El pedido está vacío.<br>Agregá productos desde el catálogo.</div>`;
  } else {
    cont.innerHTML = carrito.map((i) => `
      <div class="cart-item">
        ${imgTile(i, "ci-img")}
        <div class="ci-info">
          <div class="ci-nombre">${i.nombre}</div>
          <div class="ci-precio">${money(i.precio)} · ${i.unidad}</div>
        </div>
        <div class="qty">
          <button data-cod="${i.codigo}" data-d="-1">${svg("minus")}</button>
          <span>${i.cantidad}</span>
          <button data-cod="${i.codigo}" data-d="1">${svg("plus")}</button>
        </div>
        <span class="ci-sub">${money(i.precio * i.cantidad)}</span>
        <button class="ci-del" data-del="${i.codigo}" title="Quitar">${svg("trash")}</button>
      </div>
    `).join("");

    cont.querySelectorAll(".qty button").forEach((b) =>
      b.addEventListener("click", () => cambiarCantidad(b.dataset.cod, Number(b.dataset.d))));
    cont.querySelectorAll(".ci-del").forEach((b) =>
      b.addEventListener("click", () => quitarDelCarrito(b.dataset.del)));
  }
  $("#cart-total").textContent = money(totalCarrito());
}

function confirmarPedido() {
  if (!clienteSel) { toast("Seleccioná un cliente", "err"); return; }
  if (!carrito.length) { toast("El pedido está vacío", "err"); return; }

  const nro = DB.ventas.length + 1;
  const venta = {
    ventaId: "V" + String(nro).padStart(4, "0"),
    clienteId: clienteSel.id,
    fecha: new Date().toISOString().slice(0, 10),
    vendedorEmail: sesion.email,
    items: carrito.map((i) => ({
      codigo: i.codigo, nombre: i.nombre, cantidad: i.cantidad,
      precio: i.precio, subtotal: Number((i.precio * i.cantidad).toFixed(2)),
    })),
    total: Number(totalCarrito().toFixed(2)),
  };
  DB.ventas.push(venta);
  guardarDB();

  carrito = [];
  actualizarBadge();
  cerrarCarrito();
  toast(`Pedido ${venta.ventaId} registrado por ${money(venta.total)}`, "ok");
  navegar("pedidos");
}

/* ============================================================================
   VISTA: PEDIDOS REALIZADOS (por este vendedor, en esta demo)
   ========================================================================== */
function renderPedidos() {
  const cont = $("#vista-pedidos");
  const mios = DB.ventas
    .filter((v) => v.vendedorEmail === sesion.email)
    .sort((a, b) => b.ventaId.localeCompare(a.ventaId));

  cont.innerHTML = `
    ${vistaHead("receipt", "Pedidos realizados", `${mios.length} pedido(s) asociados a ${sesion.nombre}`)}
    <div id="lista-pedidos"></div>
  `;
  const lista = $("#lista-pedidos");
  if (!mios.length) {
    lista.innerHTML = `<div class="vacio"><div class="ico">${svg("receipt")}</div>Todavía no registraste pedidos.</div>`;
    return;
  }
  const nombreCli = (id) => (DB.clientes.find((c) => c.id === id) || {}).nombre || id;
  lista.innerHTML = mios.map((v) => {
    const html = ventaCardHTML(v);
    // Insertar nombre del cliente en la línea de fecha
    return html.replace(
      `<span class="venta-fecha">${v.fecha}`,
      `<span class="venta-fecha">${nombreCli(v.clienteId)} · ${v.fecha}`
    );
  }).join("");
  enlazarAcordeon(lista);
}

/* ============================================================================
   AVISOS reutilizables
   ========================================================================== */
function avisoSinCliente(accion) {
  return `<div class="vacio">
    <div class="ico">${svg("users")}</div>
    Seleccioná un cliente para ${accion}.
    <div style="margin-top:16px"><button class="btn-primary" onclick="navegar('clientes')">Ir a selección de cliente</button></div>
  </div>`;
}
function avisoSinClienteInline() {
  return `<div class="aviso">⚠️ Seleccioná un cliente para poder agregar productos al pedido.
    <button class="link-btn" onclick="navegar('clientes')">Seleccionar ahora</button></div>`;
}

/* ============================================================================
   IMPORTAR / desde Excel  (SheetJS)
   ========================================================================== */
function importarExcel(file) {
  if (typeof XLSX === "undefined") {
    toast("No se pudo cargar el lector de Excel (¿sin internet?)", "err");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const wb = XLSX.read(e.target.result, { type: "array" });
      const hojas = wb.SheetNames.map((s) => s.toLowerCase());
      const leer = (nombre) => {
        const idx = hojas.indexOf(nombre);
        if (idx < 0) return null;
        return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[idx]], { defval: "" });
      };

      let cambios = [];

      const vend = leer("vendedores");
      if (vend) {
        DB.vendedores = vend.map((r) => ({
          nombre: String(r.nombre), email: String(r.email).trim(),
          password: String(r.password), zona: String(r.zona),
        }));
        cambios.push(`${DB.vendedores.length} vendedores`);
      }

      const cli = leer("clientes");
      if (cli) {
        DB.clientes = cli.map((r) => ({
          id: String(r.id), nombre: String(r.nombre), rubro: String(r.rubro),
          subrubro1: String(r.subrubro1 || ""), subrubro2: String(r.subrubro2 || ""),
          sede: String(r.sede), vendedorEmail: String(r.vendedorEmail).trim(),
        }));
        cambios.push(`${DB.clientes.length} clientes`);
      }

      const prod = leer("productos");
      if (prod) {
        DB.productos = prod.map((r) => ({
          codigo: String(r.codigo), nombre: String(r.nombre), categoria: String(r.categoria),
          unidad: String(r.unidad), precio: Number(r.precio) || 0,
          stock: Number(r.stock) || 0, emoji: String(r.emoji || "📦"),
          imagen: String(r.imagen || ""),
        }));
        cambios.push(`${DB.productos.length} productos`);
      }

      // Ventas: cabecera "ventas" + "detalle"
      const cab = leer("ventas");
      const det = leer("detalle");
      if (cab && det) {
        const porVenta = {};
        det.forEach((d) => {
          const id = String(d.ventaId);
          (porVenta[id] = porVenta[id] || []).push({
            codigo: String(d.codigo), nombre: String(d.nombre),
            cantidad: Number(d.cantidad) || 0, precio: Number(d.precio) || 0,
            subtotal: Number(d.subtotal) || 0,
          });
        });
        DB.ventas = cab.map((v) => ({
          ventaId: String(v.ventaId), clienteId: String(v.clienteId),
          fecha: String(v.fecha), vendedorEmail: String(v.vendedorEmail).trim(),
          items: porVenta[String(v.ventaId)] || [], total: Number(v.total) || 0,
        }));
        cambios.push(`${DB.ventas.length} ventas`);
      }

      if (!cambios.length) {
        toast("El Excel no tiene hojas reconocidas (vendedores/clientes/productos/ventas)", "err");
        return;
      }
      guardarDB();
      clienteSel = null; carrito = []; pintarTopbarCliente(); actualizarBadge();
      // Refrescar pista de login y vista actual
      initLoginHint();
      navegar("clientes");
      toast("Importado: " + cambios.join(", "), "ok");
    } catch (err) {
      console.error(err);
      toast("No se pudo leer el archivo Excel", "err");
    }
  };
  reader.readAsArrayBuffer(file);
}

function initLoginHint() {
  if (!$("#login-hint-list")) return;
  $("#login-hint-list").innerHTML = DB.vendedores
    .map((v) => `<code>${v.email}</code> / <code>${v.password}</code>`).join("<br>");
}

/* ============================================================================
   ARRANQUE
   ========================================================================== */
function init() {
  cargarDB();
  initLogin();

  // Menú lateral
  $$(".menu-item").forEach((b) => b.addEventListener("click", () => navegar(b.dataset.vista)));
  $("#btn-logout").addEventListener("click", logout);

  // Carrito
  $("#btn-carrito").addEventListener("click", abrirCarrito);
  $("#btn-cerrar-carrito").addEventListener("click", cerrarCarrito);
  $("#cart-overlay").addEventListener("click", cerrarCarrito);
  $("#btn-confirmar").addEventListener("click", confirmarPedido);

  // Importar / reset
  $("#btn-importar").addEventListener("click", () => $("#file-importar").click());
  $("#file-importar").addEventListener("change", (e) => {
    if (e.target.files[0]) importarExcel(e.target.files[0]);
    e.target.value = "";
  });
  $("#btn-reset").addEventListener("click", resetDB);
}

// Exponer navegar para los onclick inline de avisos
window.navegar = navegar;

document.addEventListener("DOMContentLoaded", init);
