# Backend - Gestión de Residencia Universitaria

Este proyecto corresponde al backend del sistema de gestión de residencia universitaria para el curso 2024-2025. Está desarrollado en Node.js utilizando Express y Sequelize para la gestión de la base de datos.

## Características principales

- Gestión de estudiantes, trabajadores, becas, cuartos, pisos, torres e incidencias
- Autenticación y autorización de usuarios
- Integración con servicios externos (LDAP, correo electrónico, QR, etc.)
- Documentación de la API con Swagger
- Registro de logs y manejo de errores centralizado

## Requisitos previos

- Node.js (v16 o superior)
- PostgreSQL
- Yarn o npm

## Instalación

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/IngUniss/tesis_2024_2025_backend_gestion_residencia_universitaria.git
   cd tesis_2024_2025_backend_gestion_residencia_universitaria
   ```

2. **Instala las dependencias:**

   ```bash
   yarn install
   # o
   npm install
   ```

3. **Configura las variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

   ```env
   # Configuración de la base de datos
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=residencia_universitaria
   DB_USER=tu_usuario
   DB_PASSWORD=tu_password

   # Configuración del servidor
   PORT=3001
   NODE_ENV=development

   # JWT Secret
   JWT_SECRET=tu_jwt_secret_super_seguro

   # Configuración de servicios externos
   LDAP_URL=ldap://tu_servidor_ldap
   LDAP_BIND_DN=cn=admin,dc=ejemplo,dc=com
   LDAP_BIND_PASSWORD=tu_password_ldap

   # Configuración de correo electrónico
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=25
   SMTP_USER=tu_email@gmail.com
   SMTP_PASSWORD=tu_password_email

   # Configuración de Supabase (si se usa)
   SUPABASE_URL=tu_url_supabase
   SUPABASE_KEY=tu_key_supabase
   ```

4. **Inicia el servidor de desarrollo:**

   ```bash
   yarn dev
   # o
   npm run dev
   ```

5. **Abrir otro terminal en la carpeta del proyecto y ejecutar seeders:**

   ```bash
  npx sequelize-cli db:seed:all
   ```

El servidor estará disponible en `http://localhost:3000`
