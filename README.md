# 🚌 Chofer App — PETROSAR

Aplicación web para choferes de transporte de personal. Permite cargar un archivo KML de recorrido y guiar al chofer parada por parada, mostrando los pasajeros que debe levantar en cada punto.

---

## 🌐 Uso

Accedé desde cualquier tablet o celular en:  
**`https://chofer-app-petrosar.vercel.app`**

No requiere instalación ni login.

---

## 📋 Cómo usar la app

1. **Abrí la app** en el navegador del tablet
2. **Tocá "Seleccionar KML"** y elegí el archivo del recorrido
3. Se muestra el **mapa general** con todas las paradas y el total de pasajeros
4. Tocá **▶ INICIAR** para comenzar la navegación
5. En cada parada:
   - El mapa se centra en la parada actual
   - Se lista cada pasajero con nombre, DNI y barrio
   - **Tocá el nombre** para marcar que subió ✓
6. Avanzá con **Siguiente ▶** hasta completar el recorrido
7. Al finalizar, tocá **📥 Descargar Excel** para exportar el registro de embarque

### Orientación landscape (horizontal)
Girá el tablet para ver el mapa a la izquierda y los pasajeros a la derecha simultáneamente.

---

## 📁 Formato del archivo KML

La app lee los archivos KML generados por el sistema de PETROSAR. El formato esperado es:

```
Nombre del documento: CD- COMODORO RIVADAVIA 01

Por cada parada:
  Placemark name:        "Parada 1: Parada 1"
  Placemark description: "2 pasajeros: NOMBRE (DNI), NOMBRE (DNI)"
  Point coordinates:     lng,lat,0

Por cada pasajero:
  Placemark name:        "APELLIDO NOMBRE"
  Placemark description: "Legajo: 12345678 | Barrio: B° Centro | Parada: Parada 1"
  Point coordinates:     lng,lat,0
```

---

## 🗂 Estructura del repositorio

```
/
└── index.html    ← app completa (único archivo necesario)
└── README.md
```

---

## ✏️ Cómo actualizar la app

1. Modificá `index.html` localmente
2. Subí el cambio al repo en GitHub
3. Vercel re-despliega automáticamente en ~30 segundos

---

## 🛠 Stack técnico

| Componente | Tecnología |
|---|---|
| Mapa base | OpenStreetMap (Leaflet.js) |
| Ruteo por calles | OSRM (router.project-osrm.org) |
| Geocodificación | Nominatim (OSM) |
| Export Excel | SheetJS (xlsx) |
| Hosting | Vercel (static) |

No requiere backend, base de datos ni API keys.

---

## 📞 Soporte

Área SSA/HSE — PETROSAR SA  
Comodoro Rivadavia, Chubut
