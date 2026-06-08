---
status: complete
phase: 03-admin-crud
source: 03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md
started: 2026-06-08T00:00:00Z
updated: 2026-06-08T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Lista de certificados carga y muestra la tabla
expected: Navegá a /admin (con sesión activa). La página muestra una tabla con columnas: Código (en fira-code azul), Nombre del estudiante, Fecha de emisión (DD/MM/AAAA), Estado (badge verde "Activo" o rojo "Revocado") y Acciones (3 íconos de botón). Mientras carga aparecen 5 filas skeleton animadas. La barra superior sticky muestra "ANDESCODE", tu email y el botón "Cerrar sesión".
result: pass

### 2. Buscar y filtrar certificados
expected: Escribí en el campo de búsqueda (nombre o código). La lista se actualiza tras ~300ms mostrando solo los resultados que coinciden. Cambiá el filtro de estado a "Activo" o "Revocado" y la lista se filtra. Borrar la búsqueda vuelve a mostrar todos. Con filtros activos y sin resultados aparece el mensaje "Sin resultados".
result: pass

### 3. Crear un certificado nuevo
expected: Hacé click en "Nuevo certificado". Se abre un drawer desde la derecha (animación slide-in). El campo Código ya tiene un valor auto-generado (formato AC-AAAA-NNN). Completá los campos requeridos (Nombre, DNI, Universidad, Carrera, Supervisor, Código, Fecha de inicio, Fecha de fin, Fecha de emisión). Hacé click en "Guardar": el drawer se cierra y el certificado aparece en la lista.
result: pass

### 4. Validación de campos requeridos al crear
expected: Abrí el drawer de nuevo certificado y hacé click en "Guardar" sin completar campos obligatorios. Los campos faltantes se marcan con borde rojo y un mensaje de error. El formulario NO llama a PocketBase (no aparece spinner ni error de red).
result: pass

### 5. Editar un certificado existente
expected: Hacé click en el ícono de lápiz (✏️) en una fila. El drawer se abre pre-cargado con los datos actuales del certificado. Modificá un campo (por ej. el nombre del supervisor) y hacé click en "Guardar". El drawer se cierra y la lista refleja el cambio.
result: pass

### 6. Revocar un certificado activo
expected: En una fila con estado "Activo", hacé click en el toggle verde (FiToggleRight). Aparece un modal de confirmación con fondo oscurecido, el encabezado "¿Revocar este certificado?", el nombre del estudiante y el código del certificado, y un botón rojo "Revocar". Hacé click en "Revocar". El modal se cierra y el badge de la fila cambia a rojo "Revocado".
result: pass

### 7. Reactivar un certificado revocado
expected: En una fila con estado "Revocado", hacé click en el toggle gris. Aparece el modal con el encabezado "¿Reactivar este certificado?" y un botón verde "Reactivar". Confirmá. El badge cambia a verde "Activo".
result: pass

### 8. Cerrar el modal de confirmación con Escape
expected: Abrí el modal de revocar/reactivar. Presioná la tecla Escape. El modal se cierra sin cambiar el estado del certificado (el badge permanece igual).
result: pass

### 9. Descargar QR de un certificado
expected: Hacé click en el ícono de descarga (⬇️) en cualquier fila. El navegador descarga un archivo SVG con nombre QR-{código}.svg. El archivo es un QR válido que se puede escanear (si podés verificarlo) o al menos abre como imagen vectorial.
result: pass

## Summary

total: 9
passed: 9
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
