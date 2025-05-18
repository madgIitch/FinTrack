// Importar las funciones necesarias del SDK de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Configuración de Firebase para la app FinTrack
// Estas claves son específicas para este proyecto y se deben proteger en producción
const firebaseConfig = {
    apiKey: "AIzaSyCV05aIQnCR5803w-cWAKxc6U23bwF13-0",
    authDomain: "fintrack-1bced.firebaseapp.com",
    projectId: "fintrack-1bced",
    storageBucket: "fintrack-1bced.firebasestorage.app",
    messagingSenderId: "576236535723",
    appId: "1:576236535723:web:4276524c0c6a10a3391cee",
    measurementId: "G-J87Z3NZJ55"
};

// Inicialización de Firebase con la configuración especificada
const app = initializeApp(firebaseConfig);

// Inicialización de los servicios de autenticación y Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Exportar las instancias para ser usadas en otros módulos
export { app, auth, db, onAuthStateChanged, doc, getDoc, getFirestore };
