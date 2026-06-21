# -*- coding: utf-8 -*-
"""
generar_datos.py — Fuente única de datos del prototipo "Módulo de Ventas".

Genera, de forma coherente:
  - data/vendedores.xlsx
  - data/clientes.xlsx
  - data/productos.xlsx
  - data/ventas.xlsx        (hoja "Ventas" cabecera + hoja "Detalle")
  - js/data.js              (mismos datos embebidos para que la web funcione sin servidor)

Editá este archivo o, más fácil, editá directamente los .xlsx y volvé a importarlos
desde la propia app (botón "Importar Excel").

Ejecutar:  python tools/generar_datos.py
"""
from __future__ import annotations

import json
import random
from datetime import date, timedelta
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

random.seed(42)

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
JS_DIR = ROOT / "js"
DATA_DIR.mkdir(exist_ok=True)
JS_DIR.mkdir(exist_ok=True)

# --------------------------------------------------------------------------- #
# 1) VENDEDORES  (editables: nombre, correo, contraseña, zona)
# --------------------------------------------------------------------------- #
VENDEDORES = [
    {"nombre": "Juan Ramírez",   "email": "juan@empresa.com",   "password": "1234", "zona": "Lima"},
    {"nombre": "Sofía Paredes",  "email": "sofia@empresa.com",  "password": "1234", "zona": "Arequipa"},
    {"nombre": "Carlos Ruiz",    "email": "carlos@empresa.com", "password": "1234", "zona": "Piura"},
    {"nombre": "Ana Flores",     "email": "ana@empresa.com",    "password": "1234", "zona": "Trujillo"},
    {"nombre": "María Andrade",  "email": "maria@empresa.com",  "password": "1234", "zona": "Cusco"},
]

# --------------------------------------------------------------------------- #
# 2) CLIENTES  (rubro / subrubro como en el dataset de referencia)
# --------------------------------------------------------------------------- #
CLIENTES = [
    {"id": "CL001", "nombre": "Bodega Don Pepe",        "rubro": "Bodega",      "subrubro1": "Tradicional", "subrubro2": "Esquina",      "sede": "Lima"},
    {"id": "CL002", "nombre": "Minimarket La Esquina",  "rubro": "Minimarket",  "subrubro1": "Independiente","subrubro2": "Barrio",       "sede": "Lima"},
    {"id": "CL003", "nombre": "Market Express SAC",     "rubro": "Minimarket",  "subrubro1": "Cadena",      "subrubro2": "Centro",       "sede": "Lima"},
    {"id": "CL004", "nombre": "Bodega Santa Rosa",      "rubro": "Bodega",      "subrubro1": "Tradicional", "subrubro2": "Residencial",  "sede": "Arequipa"},
    {"id": "CL005", "nombre": "Restaurante El Sabor",   "rubro": "Restaurante", "subrubro1": "Menú",        "subrubro2": "Familiar",     "sede": "Arequipa"},
    {"id": "CL006", "nombre": "Distribuidora Sur EIRL", "rubro": "Mayorista",   "subrubro1": "Abarrotes",   "subrubro2": "Zonal",        "sede": "Arequipa"},
    {"id": "CL007", "nombre": "Bodega El Ahorro",       "rubro": "Bodega",      "subrubro1": "Tradicional", "subrubro2": "Esquina",      "sede": "Piura"},
    {"id": "CL008", "nombre": "Minimarket Norteño",     "rubro": "Minimarket",  "subrubro1": "Independiente","subrubro2": "Avenida",      "sede": "Piura"},
    {"id": "CL009", "nombre": "Bodega La Económica",    "rubro": "Bodega",      "subrubro1": "Tradicional", "subrubro2": "Mercado",      "sede": "Trujillo"},
    {"id": "CL010", "nombre": "Pollería Brasa Roja",    "rubro": "Restaurante", "subrubro1": "Pollería",    "subrubro2": "Salón",        "sede": "Trujillo"},
    {"id": "CL011", "nombre": "Bodega Inka Wasi",       "rubro": "Bodega",      "subrubro1": "Tradicional", "subrubro2": "Turístico",    "sede": "Cusco"},
    {"id": "CL012", "nombre": "Mayorista Andes SAC",    "rubro": "Mayorista",   "subrubro1": "Abarrotes",   "subrubro2": "Regional",     "sede": "Cusco"},
]

# Asignar cada cliente al vendedor de su misma zona
zona_to_email = {v["zona"]: v["email"] for v in VENDEDORES}
for c in CLIENTES:
    c["vendedorEmail"] = zona_to_email.get(c["sede"], VENDEDORES[0]["email"])

# --------------------------------------------------------------------------- #
# 3) PRODUCTOS  (con emoji para mostrar "imagen" siempre, online u offline)
# --------------------------------------------------------------------------- #
PRODUCTOS = [
    {"codigo": "LAC001", "nombre": "Leche Evaporada Entera 400g",        "categoria": "Lácteos",   "unidad": "UND",  "precio": 3.50,  "stock": 320, "emoji": "🥛"},
    {"codigo": "LAC002", "nombre": "Leche Condensada 397g",             "categoria": "Lácteos",   "unidad": "UND",  "precio": 4.80,  "stock": 210, "emoji": "🥫"},
    {"codigo": "LAC003", "nombre": "Yogurt Fresa 1L",                   "categoria": "Lácteos",   "unidad": "UND",  "precio": 6.20,  "stock": 95,  "emoji": "🥤"},
    {"codigo": "LAC004", "nombre": "Queso Fresco 500g",                 "categoria": "Lácteos",   "unidad": "UND",  "precio": 12.90, "stock": 48,  "emoji": "🧀"},
    {"codigo": "LAC005", "nombre": "Mantequilla con Sal 200g",          "categoria": "Lácteos",   "unidad": "UND",  "precio": 7.40,  "stock": 70,  "emoji": "🧈"},
    {"codigo": "ABA001", "nombre": "Fideos Spaghetti 500g",             "categoria": "Abarrotes", "unidad": "UND",  "precio": 2.90,  "stock": 540, "emoji": "🍝"},
    {"codigo": "ABA002", "nombre": "Arroz Extra 5kg",                   "categoria": "Abarrotes", "unidad": "BOLSA","precio": 23.50, "stock": 130, "emoji": "🍚"},
    {"codigo": "ABA003", "nombre": "Azúcar Rubia 1kg",                  "categoria": "Abarrotes", "unidad": "UND",  "precio": 4.10,  "stock": 260, "emoji": "🧂"},
    {"codigo": "ABA004", "nombre": "Aceite Vegetal 1L",                 "categoria": "Abarrotes", "unidad": "UND",  "precio": 8.90,  "stock": 180, "emoji": "🫗"},
    {"codigo": "ABA005", "nombre": "Atún en Aceite 170g",              "categoria": "Abarrotes", "unidad": "UND",  "precio": 5.60,  "stock": 300, "emoji": "🐟"},
    {"codigo": "ABA006", "nombre": "Harina sin Preparar 1kg",          "categoria": "Abarrotes", "unidad": "UND",  "precio": 3.80,  "stock": 150, "emoji": "🌾"},
    {"codigo": "GOL001", "nombre": "Chocolate Barra 90g",              "categoria": "Golosinas", "unidad": "UND",  "precio": 3.20,  "stock": 400, "emoji": "🍫"},
    {"codigo": "GOL002", "nombre": "Galletas Vainilla x6",             "categoria": "Golosinas", "unidad": "PACK", "precio": 4.50,  "stock": 220, "emoji": "🍪"},
    {"codigo": "GOL003", "nombre": "Caramelos Surtidos Bolsa 1kg",     "categoria": "Golosinas", "unidad": "BOLSA","precio": 9.90,  "stock": 85,  "emoji": "🍬"},
    {"codigo": "BEB001", "nombre": "Gaseosa Cola 3L",                  "categoria": "Bebidas",   "unidad": "UND",  "precio": 7.50,  "stock": 160, "emoji": "🥤"},
    {"codigo": "BEB002", "nombre": "Agua Mineral 625ml",               "categoria": "Bebidas",   "unidad": "UND",  "precio": 1.50,  "stock": 520, "emoji": "💧"},
    {"codigo": "BEB003", "nombre": "Jugo de Durazno 1L",               "categoria": "Bebidas",   "unidad": "UND",  "precio": 4.30,  "stock": 140, "emoji": "🧃"},
    {"codigo": "LIM001", "nombre": "Detergente en Polvo 900g",         "categoria": "Limpieza",  "unidad": "UND",  "precio": 8.20,  "stock": 110, "emoji": "🧼"},
    {"codigo": "LIM002", "nombre": "Jabón de Tocador 90g",             "categoria": "Limpieza",  "unidad": "UND",  "precio": 2.10,  "stock": 290, "emoji": "🧴"},
    {"codigo": "LIM003", "nombre": "Lejía 1L",                         "categoria": "Limpieza",  "unidad": "UND",  "precio": 3.60,  "stock": 175, "emoji": "🪣"},
]

# Imagen real local por producto (data/img/<codigo>.jpg). El emoji queda de respaldo.
for p in PRODUCTOS:
    p["imagen"] = f"data/img/{p['codigo']}.jpg"

# --------------------------------------------------------------------------- #
# 4) VENTAS HISTÓRICAS  (varias por cliente, con su detalle)
# --------------------------------------------------------------------------- #
def generar_ventas() -> list[dict]:
    ventas = []
    nro = 1
    hoy = date(2026, 6, 20)
    for cli in CLIENTES:
        n_ventas = random.randint(2, 4)
        for _ in range(n_ventas):
            dias_atras = random.randint(5, 240)
            fecha = (hoy - timedelta(days=dias_atras)).isoformat()
            items = []
            for prod in random.sample(PRODUCTOS, random.randint(2, 5)):
                cant = random.randint(1, 12)
                subtotal = round(cant * prod["precio"], 2)
                items.append({
                    "codigo": prod["codigo"],
                    "nombre": prod["nombre"],
                    "cantidad": cant,
                    "precio": prod["precio"],
                    "subtotal": subtotal,
                })
            total = round(sum(i["subtotal"] for i in items), 2)
            ventas.append({
                "ventaId": f"V{nro:04d}",
                "clienteId": cli["id"],
                "fecha": fecha,
                "vendedorEmail": cli["vendedorEmail"],
                "items": items,
                "total": total,
            })
            nro += 1
    ventas.sort(key=lambda v: v["fecha"])
    return ventas

VENTAS = generar_ventas()

# --------------------------------------------------------------------------- #
# Helpers de estilo Excel
# --------------------------------------------------------------------------- #
HEADER_FILL = PatternFill("solid", fgColor="6C4FD8")
HEADER_FONT = Font(bold=True, color="FFFFFF")

def estilar_cabecera(ws, ncols: int) -> None:
    for col in range(1, ncols + 1):
        c = ws.cell(row=1, column=col)
        c.fill = HEADER_FILL
        c.font = HEADER_FONT
        c.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[1].height = 20

def autoancho(ws) -> None:
    for col in ws.columns:
        ancho = max((len(str(c.value)) for c in col if c.value is not None), default=10)
        ws.column_dimensions[col[0].column_letter].width = min(ancho + 4, 50)

# --------------------------------------------------------------------------- #
# Escribir Excel
# --------------------------------------------------------------------------- #
def excel_vendedores() -> None:
    wb = Workbook(); ws = wb.active; ws.title = "Vendedores"
    ws.append(["nombre", "email", "password", "zona"])
    for v in VENDEDORES:
        ws.append([v["nombre"], v["email"], v["password"], v["zona"]])
    estilar_cabecera(ws, 4); autoancho(ws)
    wb.save(DATA_DIR / "vendedores.xlsx")

def excel_clientes() -> None:
    wb = Workbook(); ws = wb.active; ws.title = "Clientes"
    ws.append(["id", "nombre", "rubro", "subrubro1", "subrubro2", "sede", "vendedorEmail"])
    for c in CLIENTES:
        ws.append([c["id"], c["nombre"], c["rubro"], c["subrubro1"], c["subrubro2"], c["sede"], c["vendedorEmail"]])
    estilar_cabecera(ws, 7); autoancho(ws)
    wb.save(DATA_DIR / "clientes.xlsx")

def excel_productos() -> None:
    wb = Workbook(); ws = wb.active; ws.title = "Productos"
    ws.append(["codigo", "nombre", "categoria", "unidad", "precio", "stock", "emoji", "imagen"])
    for p in PRODUCTOS:
        ws.append([p["codigo"], p["nombre"], p["categoria"], p["unidad"], p["precio"], p["stock"], p["emoji"], p["imagen"]])
    estilar_cabecera(ws, 8); autoancho(ws)
    wb.save(DATA_DIR / "productos.xlsx")

def excel_ventas() -> None:
    wb = Workbook()
    ws = wb.active; ws.title = "Ventas"
    ws.append(["ventaId", "clienteId", "fecha", "vendedorEmail", "total"])
    for v in VENTAS:
        ws.append([v["ventaId"], v["clienteId"], v["fecha"], v["vendedorEmail"], v["total"]])
    estilar_cabecera(ws, 5); autoancho(ws)

    wd = wb.create_sheet("Detalle")
    wd.append(["ventaId", "codigo", "nombre", "cantidad", "precio", "subtotal"])
    for v in VENTAS:
        for it in v["items"]:
            wd.append([v["ventaId"], it["codigo"], it["nombre"], it["cantidad"], it["precio"], it["subtotal"]])
    estilar_cabecera(wd, 6); autoancho(wd)
    wb.save(DATA_DIR / "ventas.xlsx")

# --------------------------------------------------------------------------- #
# Escribir js/data.js
# --------------------------------------------------------------------------- #
def escribir_data_js() -> None:
    payload = {
        "vendedores": VENDEDORES,
        "clientes": CLIENTES,
        "productos": PRODUCTOS,
        "ventas": VENTAS,
    }
    js = (
        "// AUTOGENERADO por tools/generar_datos.py — no editar a mano.\n"
        "// Datos semilla del prototipo. La app los copia a localStorage en el primer arranque.\n"
        "window.SEED_DATA = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n"
    )
    (JS_DIR / "data.js").write_text(js, encoding="utf-8")

def main() -> None:
    excel_vendedores()
    excel_clientes()
    excel_productos()
    excel_ventas()
    escribir_data_js()
    print("OK -> data/*.xlsx y js/data.js")
    print(f"   vendedores={len(VENDEDORES)}  clientes={len(CLIENTES)}  "
          f"productos={len(PRODUCTOS)}  ventas={len(VENTAS)}")

if __name__ == "__main__":
    main()
