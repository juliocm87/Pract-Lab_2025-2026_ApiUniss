# Instrucciones para Pruebas Locales

Este documento contiene las instrucciones paso a paso para poner a andar el backend y frontend localmente y realizar pruebas de integración.

## 📋 Requisitos Previos

- **Node.js** (v18 o superior)
- **PostgreSQL** (v14 o superior)
- **npm** o **yarn**

## 🔧 Configuración del Backend

### 1. Configurar archivo .env

El archivo `.env` está en el `.gitignore`, así que debes crearlo manualmente:

```bash
# En el directorio del backend
cd "d:\Universidad\3er Año\Prácticas Laborales\Pract-Lab_2025-2026_ApiUniss-main"
```

Copia el archivo `.env.example` como `.env`:

```bash
copy .env.example .env
```

O crea el archivo `.env` con el siguiente contenido:

```env
NODE_ENV=development

# Base de Datos - Desarrollo
DB_USER_DEV=postgres
PASSWORD_DEV=tu_contraseña_postgres
DB_NAME_DEV=pract_lab_2025_2026
DB_HOST_DEV=localhost
DB_PORT_DEV=5432
DIALECT=postgres

# Puerto del servidor API
PORT=3001

# JWT Secret
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_change_in_production
```

**IMPORTANTE:** Cambia `tu_contraseña_postgres` por tu contraseña real de PostgreSQL.

### 2. Verificar que PostgreSQL esté corriendo

Asegúrate de que PostgreSQL esté instalado y corriendo. Puedes verificarlo con:

```bash
# En Windows (PowerShell)
pg_ctl status

# O verifica que puedas conectarte
psql -U postgres -c "SELECT version();"
```

### 3. Instalar dependencias del backend

```bash
cd "d:\Universidad\3er Año\Prácticas Laborales\Pract-Lab_2025-2026_ApiUniss-main"
npm install
```

### 4. Ejecutar el script de datos de prueba

Este script creará todos los datos necesarios para probar el sistema:

```bash
node seed.js
```

Si todo sale bien, verás un mensaje como:

```
🌱 Iniciando seed de datos de prueba...
✅ Modelos sincronizados
📝 Insertando trabajadores...
✅ Trabajadores insertados
...
🎉 Seed completado exitosamente!

📋 Credenciales de prueba:
   ADMIN:
   - Usuario: ecardenas
   - CI: 12345678
   - Contraseña: admin123
   - Rol: administrador

   DOCENTE 1:
   - Usuario: crodriguez
   - CI: 87654321
   - Contraseña: docente123
   - Rol: docente

   DOCENTE 2:
   - Usuario: mgonzalez
   - CI: 11223344
   - Contraseña: docente123
   - Rol: docente
```

### 5. Iniciar el backend

```bash
npm start
```

O para desarrollo con auto-reload:

```bash
npm run dev
```

Verás un mensaje como:

```
Conexión establecida correctamente.
Servidor iniciado en el puerto 3001
http://localhost:3001
Documentacion de swagger: http://localhost:3001/api-docs
```

**Deja el servidor corriendo en esta terminal.**

## 🌐 Configuración del Frontend

### 1. Instalar dependencias del frontend

```bash
cd "d:\Universidad\3er Año\Prácticas Laborales\frontend-horarios-docentes"
npm install
```

### 2. Verificar configuración de nuxt.config.ts

El archivo `nuxt.config.ts` ya debería tener la configuración correcta:

```typescript
runtimeConfig: {
  public: {
    backend_url: 'http://localhost:3001'
  }
}
```

### 3. Iniciar el frontend

```bash
npm run dev
```

Verás un mensaje como:

```
Nuxt 3.x.x with Nitro 2.x.x
  ➜ Local: http://localhost:3000/
```

**Deja el servidor corriendo en esta terminal (abre una nueva terminal).**

## 🧪 Probar la Integración

### 1. Abrir el frontend en el navegador

Abre tu navegador y ve a: `http://localhost:3000`

### 2. Iniciar sesión como Administrador

Usa las credenciales del administrador:

- **Usuario:** `ecardenas`
- **Contraseña:** `admin123`

### 3. Probar funcionalidades

Como administrador puedes:
- Ver carreras
- Ver cursos
- Ver asignaturas
- Ver docentes
- Asignar turnos a docentes

### 4. Iniciar sesión como Docente

Cierra sesión e inicia sesión como docente:

- **Usuario:** `crodriguez`
- **Contraseña:** `docente123`

Como docente puedes:
- Ver tus asignaturas
- Ver tus turnos asignados
- Solicitar nuevos turnos

## 🔍 Verificar la API con Swagger

También puedes probar la API directamente usando Swagger:

1. Abre en tu navegador: `http://localhost:3001/api-docs`
2. Explora los endpoints disponibles
3. Prueba el endpoint de login:
   - POST `/auth/login`
   - Body:
     ```json
     {
       "ci": "12345678",
       "password": "admin123"
     }
     ```

## 📊 Verificar datos en PostgreSQL

Si quieres verificar que los datos se guardaron correctamente en la base de datos:

```bash
psql -U postgres -d pract_lab_2025_2026

# Ver trabajadores
SELECT * FROM trabajadores;

# Ver docentes
SELECT * FROM docentes;

# Ver carreras
SELECT * FROM carreras;

# Ver asignaturas
SELECT * FROM asignaturas;

# Ver turnos
SELECT * FROM turnos;

# Salir
\q
```

## 🛠️ Solución de Problemas

### Error: "Conexión rechazada" en PostgreSQL

- Verifica que PostgreSQL esté corriendo
- Verifica que el usuario y contraseña en `.env` sean correctos
- Verifica que la base de datos `pract_lab_2025_2026` exista

### Error: "No se puede conectar al backend"

- Verifica que el backend esté corriendo en el puerto 3001
- Verifica que el firewall no esté bloqueando el puerto
- Verifica que `nuxt.config.ts` tenga la URL correcta del backend

### Error: "Login fallido"

- Verifica que el usuario exista en la base de datos
- Verifica que la contraseña sea correcta
- Verifica que el rol del usuario sea correcto

### Error: "Module not found"

- Ejecuta `npm install` en el backend
- Ejecuta `npm install` en el frontend

## 📝 Datos de Prueba Creados

El script `seed.js` crea los siguientes datos:

### Trabajadores
- **Administrador:** Elena Cárdenas (CI: 12345678)
- **Docente 1:** Carlos Rodríguez (CI: 87654321)
- **Docente 2:** María González (CI: 11223344)

### Carreras
- Ingeniería Informática
- Ingeniería Industrial

### Asignaturas
- Programación I (Semestre 1)
- Estructuras de Datos (Semestre 2)
- Bases de Datos (Semestre 3)

### Cursos
- 2025-2026 (activo)

### Turnos
- 3 turnos de prueba disponibles para asignación

## 🚀 Siguientes Pasos

Una vez que todo esté funcionando correctamente:

1. Prueba crear nuevas carreras
2. Prueba crear nuevas asignaturas
3. Prueba asignar turnos a docentes
4. Prueba el flujo completo de un docente solicitando turnos
5. Verifica que los datos se guarden correctamente en PostgreSQL

## 📞 Necesitas Ayuda?

Si encuentras algún problema:
1. Revisa los logs del backend en la terminal
2. Revisa los logs del frontend en la terminal
3. Revisa la consola del navegador (F12)
4. Verifica que PostgreSQL esté corriendo
5. Verifica que ambos servidores estén corriendo
