
# Clínica La Huella API

Clínica La Huella API es una API Rest que utiliza node.js, Express y MySQL para ofrecer una solución para el backend de una clínica ficticia de veterinaria.

## Requisitos

Para utilizar esta API necesitas tener instalado lo siguiente: 

**Node.js:** v20.13.1 o superior.  
**NVM** (Recomendable)

## Instalación

1. Clona el repositorio.

```bash
  git clone https://github.com/Juanlu3095/clinicalahuellaAPI.git
```
2. Instala las dependencias.

```bash
  npm install
```
3. Crea tu archivo con las variables de entorno.

- Renombra el archivo .env.example a .env y rellénalo con tu configuración. Las variables con '' son strings y el resto números.
- Para las variables propias de la aplicación, rellena PORT, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE, DB_DATABASE_TEST, POOL_CONNECTIONLIMIT, FIRST_USER_EMAIL, FIRST_USER_PASS, BSALT y JWT_SECRET.
- GOOGLE_GEMINI_API_TOKEN es el token de la API de Gemini AI.
- Para nodemailer y Gmail API, MAIL_AUTH_USER, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET y GOOGLE_REFRESH_TOKEN se obtienen de OAuth2Client de la API de Google en https://console.developers.google.com/ y https://developers.google.com/oauthplayground/.
- GOOGLE_CLIENT_SERVICE_EMAIL, GOOGLE_CLIENT_SERVICE_PRIVATE_KEY y PROPERTY_ID para Google Analytics obtenibles también en https://console.developers.google.com/ con una cuenta de servicio.


4. Crea la base de datos.

```bash
  npm run migrate:mysql
```

5. Crea valores en las tablas.

```bash
  npm run seed:mysql
```

6. Ejecuta el servidor.

```bash
  npm run prod
```

o para desarrollo: 

```bash
  npm run dev
```

## Testing

La API utiliza Jest y Supertest para realizar las pruebas, además de valerse de las migraciones y los seeders para crear la base de datos, sus tablas y algunos valores con los que trabajar de forma automatizada. Para ejecutarlos:

```bash
  npm run test
```

o para uno en concreto:

```bash
  npm run test nombredeltest
```