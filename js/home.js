import { auth } from './firebase.js';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase.js'; // Importa la instancia de la aplicación

document.addEventListener('DOMContentLoaded', () => {
    const userNameSpan = document.getElementById('user-name');

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log('Usuario autenticado en home.js:', user);
            const userId = user.uid;
            // Obtén la instancia de db aquí, asegurándote de que app esté inicializada
            const db = getFirestore(app);
            const userDocRef = doc(db, 'users', userId);
            console.log('Referencia al documento:', userDocRef);

            try {
                const docSnap = await getDoc(userDocRef);
                console.log('docSnap:', docSnap);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const firstName = userData.firstName || ''; // Usa 'firstName' con 'F' mayúscula
                    const lastName = userData.lastName || '';   // Usa 'lastName' con 'L' mayúscula
                    userNameSpan.textContent = `${firstName} ${lastName}`.trim();
                } else {
                    userNameSpan.textContent = 'Usuario - Datos no encontrados';
                    console.log("No se encontraron los datos del usuario en Firestore.");
                }
            } catch (error) {
                console.error("Error al obtener los datos del usuario:", error);
                userNameSpan.textContent = 'Usuario - Error al cargar';
            }
        } else {
            userNameSpan.textContent = 'No autenticado';
            console.log("Usuario no autenticado en home.js.");
            // window.location.href = '../index.html';
        }
    });
});