import { auth } from './firebase.js';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    const userNameSpan = document.getElementById('user-name');

    // Intentar obtener el nombre de localStorage inmediatamente al cargar la página
    const cachedFirstName = localStorage.getItem('firstName');
    const cachedLastName = localStorage.getItem('lastName');

    if (cachedFirstName && cachedLastName) {
        console.log('Nombre encontrado en localStorage (carga inicial):', cachedFirstName, cachedLastName);
        userNameSpan.textContent = `${cachedFirstName} ${cachedLastName}`.trim();
    }

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('Usuario autenticado en home.js:', user);
            const userId = user.uid;
            const db = getFirestore(app);
            const userDocRef = doc(db, 'users', userId);

            // Si no se encontró en la caché inicialmente o si quieres una actualización
            if (!cachedFirstName || !cachedLastName) {
                console.log('Obteniendo nombre de Firestore...');
                try {
                    const docSnap = await getDoc(userDocRef);
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        const firstName = userData.firstName || '';
                        const lastName = userData.lastName || '';
                        userNameSpan.textContent = `${firstName} ${lastName}`.trim();

                        localStorage.setItem('firstName', firstName);
                        localStorage.setItem('lastName', lastName);
                    } else {
                        userNameSpan.textContent = 'Usuario - Datos no encontrados';
                        console.log("No se encontraron los datos del usuario en Firestore.");
                    }
                } catch (error) {
                    console.error("Error al obtener los datos del usuario:", error);
                    userNameSpan.textContent = 'Usuario - Error al cargar';
                }
            }
        } else {
            userNameSpan.textContent = 'No autenticado';
            console.log("Usuario no autenticado en home.js.");
            // window.location.href = '../index.html';
        }
    });
});