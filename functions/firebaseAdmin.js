// Importar Dependencias

// Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// Importar el SDK de Firebase Admin para gestionar autenticación y Firestore
const admin = require('firebase-admin');

// Importar configuración de cliente de Plaid
const plaidClient = require('./plaidConfig'); 

// Inicialización de Firebase Admin

// Leer las credenciales del servicio desde el archivo JSON
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar la aplicación de Firebase Admin con las credenciales de servicio
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Crear instancias para interactuar con Firestore y el sistema de autenticación
const db = admin.firestore();   // Base de datos (Firestore)
const authAdmin = admin.auth(); // Autenticación (Auth)

module.exports = { admin, db, authAdmin, plaidClient };
