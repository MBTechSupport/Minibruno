# MANUAL OPERATIVO: ADMINISTRACIÓN Y CONTROL CENTRALIZADO DE CORREOS AUTORIZADOS (STAFF IT / ADMIN)
## MINI BRUNO SUCESORES C.A. — TECHSUPPORT & PORTAL CORPORATIVO

> **Documento Maestro de Gestión de Accesos y Privilegios**  
> **Ubicación:** `/GUIA_CORREOS_AUTORIZADOS.md`  
> **Proyecto Firebase:** `mb-proyect` (ID Base de Datos: `(default)`)  
> **Módulo:** RBAC (Role-Based Access Control)  
> **Fecha de Emisión:** Octubre 2026  
> **Versión:** 1.0.0

---

## ÍNDICE

1. [Sección A. Arquitectura de Autorización y Flujo de Permisos](#sección-a-arquitectura-de-autorización-y-flujo-de-permisos)
2. [Sección B. Procedimiento Exacto para Autorizar un Correo Nuevo](#sección-b-procedimiento-exacto-para-autorizar-un-correo-nuevo)
3. [Sección C. Configuración en Firebase Console](#sección-c-configuración-en-firebase-console)
4. [Sección D. Matriz Integral de Privilegios Corporativos](#sección-d-matriz-integral-de-privilegios-corporativos)
5. [Sección E. Verificación, Pruebas y Diagnóstico de Errores](#sección-e-verificación-pruebas-y-diagnóstico-de-errores)
6. [Sección F. Protocolo de Revocación de Privilegios](#sección-f-protocolo-de-revocación-de-privilegios)

---

## SECCIÓN A. ARQUITECTURA DE AUTORIZACIÓN Y FLUJO DE PERMISOS

En la plataforma corporativa de **Mini Bruno Sucesores C.A.**, el rol de máxima jerarquía operativa es **`ADMIN` (Staff IT / Sistemas)**. El control de acceso opera bajo una arquitectura de **Defensa en Profundidad (Defense in Depth)** estructurada en 3 capas desacopladas:

```
[ Capa 1: Identidad ]          Firebase Authentication (Email/Password & Google Sign-In)
          │                                  │
          ▼                                  ▼
[ Capa 2: Frontend RBAC ]      js/auth-roles.js ──► Consulta Firestore /config/correos_autorizados
          │                                         Fallback 1: js/correos_Autorizados.json
          │                                         Fallback 2: FALLBACK_ADMINS en memoria
          │                                  │
          ▼                                  ▼
[ Capa 3: Persistencia Cloud ]  firestore.rules ──► Función declarativa isAuthorizedEmail()
                                                   Valida token JWT de request.auth.token.email
```

### 1. ¿Cómo se determina el Rol ADMIN en el Frontend?
El módulo central `js/auth-roles.js` evalúa la dirección de correo suministrada mediante la función `getUserRole(email)`:
1. Normaliza el correo electrónico a minúsculas y elimina espacios en blanco (`email.toLowerCase().trim()`).
2. Invoca `getAdminEmails()`:
   - **Fuente Primaria (Persistente en Nube):** Lee el documento de Firestore `config/correos_autorizados` y extrae el arreglo `autorizados`.
   - **Fuente Secundaria (Copia Local Estática):** Si la consulta a Firestore falla o el documento no existe, lee vía `fetch` el archivo `/js/correos_Autorizados.json`.
   - **Fuente Terciaria (Reserva en Memoria):** Si la red está desconectada, emplea la constante fija `FALLBACK_ADMINS`.
3. Si el correo figura en la lista de administradores, retorna `ROLES.ADMIN`.

### 2. ¿Cómo se protegen los Datos y Operaciones en Firestore?
El frontend únicamente controla la experiencia visual (mostrar botones de edición, pantallas de denegado y menús). **La seguridad estricta y vinculante la aplican las reglas declarativas de Firestore en `/firestore.rules`**:
```javascript
function isAuthorizedEmail() {
  return isSignedIn() && request.auth.token.email in [
    'lruiz@minibruno.com',
    'lguevara@minibruno.com',
    'mrodriguez@minibruno.com',
    'jnanez@minibruno.com',
    'dnavarro@minibruno.com',
    'darwin.navarro@minibruno.com',
    'bmontilla@minibruno.com',
    'alves.neri@minibruno.com',
    'jruiz@minibruno.com',
    'rcoronado@minibruno.com',
    'ruca.luijo@gmail.com'
  ];
}
```
Cualquier intento de consultar o escribir mensajes en el **Chat Interno de Tickets** (`/tickets/{ticketId}/internal_messages`) o modificar **vCards** (`/contacts/{contactId}`) emitido por un usuario que no coincida con `isAuthorizedEmail()` es bloqueado por el motor de Firebase con error `PERMISSION_DENIED` a nivel de servidor.

---

## SECCIÓN B. PROCEDIMIENTO EXACTO PARA AUTORIZAR UN CORREO NUEVO

Para conceder privilegios plenos de `ADMIN (Staff IT)` a un nuevo colaborador o técnico de sistemas, se deben sincronizar las cuatro fuentes del sistema:

### Paso 1: Requisitos de la Cuenta
- Debe ser un correo electrónico corporativo bajo el dominio `@minibruno.com` (o una cuenta autorizada por la Gerencia de Sistemas para mantenimiento).
- El usuario debe estar registrado en **Firebase Authentication** (puede crearse desde el panel de registro `register.html` o darse de alta manualmente en Firebase Console).

### Paso 2: Actualizar el Documento en Cloud Firestore
1. Accede a **Firebase Console** -> Proyecto `mb-proyect` -> **Firestore Database** -> Base de datos `(default)`.
2. Abre la colección `config`.
3. Selecciona el documento `correos_autorizados`.
4. En el campo `autorizados` (tipo `Array`), haz clic en **Add item** (o editar array).
5. Escribe la dirección de correo en minúsculas (ejemplo: `nuevo.analista@minibruno.com`).
6. Guarda los cambios.

### Paso 3: Actualizar el Archivo Local `/js/correos_Autorizados.json`
Abre el archivo `/js/correos_Autorizados.json` e incorpora la dirección al arreglo JSON:
```json
{
  "autorizados": [
    "lruiz@minibruno.com",
    "lguevara@minibruno.com",
    "mrodriguez@minibruno.com",
    "jnanez@minibruno.com",
    "dnavarro@minibruno.com",
    "darwin.navarro@minibruno.com",
    "bmontilla@minibruno.com",
    "alves.neri@minibruno.com",
    "jruiz@minibruno.com",
    "rcoronado@minibruno.com",
    "ruca.luijo@gmail.com",
    "nuevo.analista@minibruno.com"
  ]
}
```

### Paso 4: Actualizar la Lista de Respaldo en `/js/auth-roles.js`
Abre `/js/auth-roles.js` e incorpora el correo en el arreglo `FALLBACK_ADMINS`:
```javascript
const FALLBACK_ADMINS = [
  "lruiz@minibruno.com",
  "lguevara@minibruno.com",
  "mrodriguez@minibruno.com",
  "jnanez@minibruno.com",
  "dnavarro@minibruno.com",
  "darwin.navarro@minibruno.com",
  "bmontilla@minibruno.com",
  "alves.neri@minibruno.com",
  "jruiz@minibruno.com",
  "rcoronado@minibruno.com",
  "ruca.luijo@gmail.com",
  "nuevo.analista@minibruno.com"
];
```

### Paso 5: Actualizar las Reglas de Seguridad en `/firestore.rules`
Abre `/firestore.rules` y añade el correo a la función `isAuthorizedEmail()`:
```javascript
    function isAuthorizedEmail() {
      return isSignedIn() && request.auth.token.email in [
        'lruiz@minibruno.com',
        'lguevara@minibruno.com',
        'mrodriguez@minibruno.com',
        'jnanez@minibruno.com',
        'dnavarro@minibruno.com',
        'darwin.navarro@minibruno.com',
        'bmontilla@minibruno.com',
        'alves.neri@minibruno.com',
        'jruiz@minibruno.com',
        'rcoronado@minibruno.com',
        'ruca.luijo@gmail.com',
        'nuevo.analista@minibruno.com'
      ];
    }
```

### Paso 6: Desplegar las Reglas a Firebase
- Si utilizas el entorno de desarrollo asistido AI Studio, solicita el despliegue automático mediante la herramienta `deploy_firebase`.
- Si utilizas Firebase CLI desde tu terminal local:
  ```bash
  firebase deploy --only firestore:rules --project mb-proyect
  ```

### Paso 7: Validación de Sesión del Usuario
1. Pide al usuario que cierre sesión o ejecute:
   ```javascript
   sessionStorage.removeItem('mb_user_role');
   ```
2. Inicie sesión en `login.html`.
3. Verifique que la cabecera muestre el badge **Staff IT** en azul y el botón de acceso directo al **Panel Staff** (`admin_tickets.html`).

---

## SECCIÓN C. CONFIGURACIÓN EN FIREBASE CONSOLE

Para gestionar los correos autorizados directamente en la consola de Google Firebase:

### 1. Módulo Authentication
- **URL:** `https://console.firebase.google.com/project/mb-proyect/authentication/users`
- **Operaciones:**
  - Consulta de usuarios registrados.
  - Para dar de alta manualmente: Clic en **Add user** -> Ingresar correo y contraseña temporal.
  - Verificar que el estado del usuario no esté inhabilitado.

### 2. Módulo Firestore Database
- **URL:** `https://console.firebase.google.com/project/mb-proyect/firestore/databases/-default-/data`
- **Colección:** `config`
- **Documento:** `correos_autorizados`
- **Campo:** `autorizados` (Array de Strings).
- Si el documento no existiese, crearlo con:
  - Collection ID: `config`
  - Document ID: `correos_autorizados`
  - Field: `autorizados`, Type: `array`, Values: lista de correos.

### 3. Editor de Reglas de Seguridad (Firestore Rules)
- **URL:** `https://console.firebase.google.com/project/mb-proyect/firestore/databases/-default-/rules`
- Permite verificar el historial de versiones desplegadas de `firestore.rules`.
- Puedes editar en línea la lista `isAuthorizedEmail()` y hacer clic en **Publish**.

### 4. Servicio Firebase Storage
- El sistema actual utiliza almacenamiento de fotografías optimizado en memoria del navegador (Canvas HTML5) que almacena Data URIs en la propiedad `avatar` del documento del contacto (`/contacts/{contactId}`) o rutas relativas a recursos estáticos locales (`img_ref/`).
- No requiere bucket de Storage en la configuración básica, lo que evita costes de almacenamiento en planes gratuitos Spark.

---

## SECCIÓN D. MATRIZ INTEGRAL DE PRIVILEGIOS CORPORATIVOS

| Módulo / Capacidad | Rol ADMIN (Staff IT Autorizado) | Rol EMPLEADO (Colaborador) | Usuario No Autorizado (403) |
| :--- | :---: | :---: | :---: |
| **Acceso a Landing y Secciones Públicas** | Permitido | Permitido | Permitido |
| **Generación de Tickets Personales (`soporte.html`)** | Permitido | Permitido | Denegado |
| **Consulta de Tickets Propios** | Permitido | Solo donde `userId == auth.uid` | Denegado |
| **Supervisión Global de Tickets (`admin_tickets.html`)** | **Permitido** (Colección completa) | **Bloqueado (403)** | **Bloqueado (403)** |
| **Cambio de Estados y Prioridades de Tickets** | **Permitido** | Denegado | Denegado |
| **Eliminación de Tickets con Auditoría** | **Permitido** (`/deleted_tickets`) | Denegado | Denegado |
| **Chat Interno por Ticket en Tiempo Real** | **Permitido** (Lectura y envío live) | **Bloqueado por Reglas** | **Bloqueado por Reglas** |
| **Directorio de Contactos (`contactos.html`)** | Permitido (Lectura y Consulta) | Permitido (Lectura y Consulta) | Permitido (Lectura y Consulta) |
| **Administración y Edición de vCards y Fotos** | **Permitido** (Guardado en `/contacts`) | **Denegado** (Sin controles ni permisos) | **Denegado** |
| **Publicación y Edición de Noticias (`news.html`)** | **Permitido** | Solo Lectura | Solo Lectura |
| **Suite Ofimática y Utilidades TI (`servicio.html`)** | **Permitido** | Bloqueado | Bloqueado |
| **Exportación de Reportes CSV de Incidencias** | **Permitido** | Denegado | Denegado |

---

## SECCIÓN E. VERIFICACIÓN, PRUEBAS Y DIAGNÓSTICO DE ERRORES

### 1. Batería de Pruebas de Validación
1. **Prueba de Acceso al Panel Global:** Iniciar sesión con el correo autorizado y acceder a `admin_tickets.html`. Debe cargar la lista completa de tickets sin mostrar la pantalla de error 403.
2. **Prueba del Chat Interno:**
   - En la tabla de tickets de `admin_tickets.html`, hacer clic en el botón **Chat** de cualquier ticket.
   - Enviar un mensaje de prueba: *"Verificación técnica de canal interno"*.
   - El mensaje debe aparecer de inmediato a la derecha como *"Tú (Staff IT)"*.
   - Abrir una ventana de incógnito o pedir a otro técnico autorizado que abra el mismo ticket: el mensaje debe recibirse en tiempo real a la izquierda con el nombre del remitente.
3. **Prueba de Blindaje del Chat para Empleados:**
   - Iniciar sesión con una cuenta de rol `EMPLEADO` (ej. `empleado.sistemas@minibruno.com`).
   - Intentar acceder a `admin_tickets.html`: debe mostrar la pantalla de bloqueo 403.
   - Intentar consultar vía consola JavaScript la subcolección `/tickets/{ticketId}/internal_messages`: Firestore debe retornar error `Missing or insufficient permissions`.
4. **Prueba de Edición de vCards (`contactos.html`):**
   - Con la sesión de `ADMIN`, ingresar a `contactos.html`.
   - Verificar que aparece el banner superior *"Modo Administración vCards — Staff IT Autorizado"*.
   - Hacer clic en **Editar vCard** en cualquier contacto (ej. Luis Ruiz).
   - Modificar la extensión a `Ext. 306` o cambiar la foto mediante el selector de presets o subida local.
   - Hacer clic en **Guardar Cambios**.
   - Debe mostrarse el toast verde *"vCard Actualizada con Éxito"* y la tarjeta debe reflejar el cambio de inmediato.
   - Recargar la página: el cambio debe mantenerse intacto (persistido en Firestore).
5. **Prueba de Directorio para Usuarios Ordinarios:**
   - En modo incógnito o como usuario `EMPLEADO`, ingresar a `contactos.html`.
   - Verificar que **NO** aparece ningún botón de edición ni el banner administrativo.
   - Al hacer clic en un contacto, se visualiza la información y foto actualizada sin controles de modificación.

### 2. Diagnóstico de Errores Frecuentes

| Síntoma | Causa Raíz | Solución |
| :--- | :--- | :--- |
| El usuario inicia sesión pero ve el error 403 en `admin_tickets.html`. | El correo no fue agregado en minúsculas exactas o existe caché en `sessionStorage`. | Limpiar caché en el navegador (`sessionStorage.clear()`), verificar que el correo en Firestore no tenga espacios ni mayúsculas. |
| El botón de Chat Interno muestra error `PERMISSION_DENIED` al abrirse o enviar. | Las reglas en `firestore.rules` no fueron desplegadas o el correo no está en `isAuthorizedEmail()`. | Desplegar las reglas con `firebase deploy --only firestore:rules` y revisar que el array contenga el correo. |
| La edición de vCard no guarda y muestra alerta de error. | El usuario no tiene rol `ADMIN` en `firestore.rules` para la colección `/contacts`. | Verificar que la regla `match /contacts/{contactId}` tenga `allow create, update, delete: if isAuthorizedEmail();` y que las reglas estén publicadas. |
| La foto subida no se ve o da error. | El archivo subido no es una imagen válida o superó el límite de 5MB. | Seleccionar archivos PNG, JPG o WebP. El sistema comprime automáticamente la foto en un lienzo Canvas de 256x256 px antes de guardar. |

---

## SECCIÓN F. PROTOCOLO DE REVOCACIÓN DE PRIVILEGIOS

Cuando un técnico o analista deje de formar parte del departamento de Sistemas o requiera el cese de sus privilegios:

1. **Retirar de Cloud Firestore:**
   - Entrar a Firestore -> `config/correos_autorizados`.
   - Eliminar el correo del array `autorizados`.
2. **Retirar del archivo local `/js/correos_Autorizados.json`:**
   - Eliminar la línea correspondiente al correo en el arreglo.
3. **Retirar de `/js/auth-roles.js`:**
   - Eliminar el correo del arreglo `FALLBACK_ADMINS`.
4. **Retirar de `/firestore.rules`:**
   - Eliminar el correo de la función `isAuthorizedEmail()`.
   - Desplegar inmediatamente las reglas (`deploy_firebase` o CLI).
5. **Revocación de Sesión:**
   - En **Firebase Console** -> **Authentication**, buscar al usuario.
   - Opciones -> **Revoke tokens** (o restablecer contraseña / inhabilitar cuenta si ha salido de la empresa).
   - Inmediatamente, cualquier intento de enviar mensajes internos o alterar vCards será rechazado en tiempo real por el motor de reglas de Firestore.
