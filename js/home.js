import { auth } from './firebase.js';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase.js';

console.log('home.js loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('home.js DOMContentLoaded');
    const userNameSpan = document.getElementById('user-name');
    const logoHome = document.querySelector('.logo-icon');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const logoutLink = document.getElementById('logout-link');

    console.log('home.js elements:', { userNameSpan, logoHome, sidebar, closeSidebarBtn, logoutLink });

    // Función para actualizar el saludo de bienvenida
    const updateWelcomeMessage = (firstName, lastName) => {
        userNameSpan.textContent = `${firstName} ${lastName}`.trim();
    };

    // Intentar obtener el nombre de localStorage al cargar la página
    const cachedFirstName = localStorage.getItem('firstName');
    const cachedLastName = localStorage.getItem('lastName');

    if (cachedFirstName && cachedLastName) {
        console.log('Nombre encontrado en localStorage (carga inicial):', cachedFirstName, cachedLastName);
        updateWelcomeMessage(cachedFirstName, cachedLastName);
    }

    onAuthStateChanged(auth, async (user) => {
        console.log('home.js onAuthStateChanged triggered');
        if (user) {
            console.log('Usuario autenticado en home.js:', user);
            const userId = user.uid;
            const db = getFirestore(app);
            const userDocRef = doc(db, 'users', userId);

            console.log('home.js Obteniendo nombre de Firestore...');
            try {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    const firstName = userData.firstName || '';
                    const lastName = userData.lastName || '';
                    console.log('home.js Datos del usuario obtenidos de Firestore:', firstName, lastName);
                    updateWelcomeMessage(firstName, lastName);

                    // Actualizar localStorage with the current data
                    localStorage.setItem('firstName', firstName);
                    localStorage.setItem('lastName', lastName);
                    console.log('home.js Nombre guardado en localStorage:', firstName, lastName);
                } else {
                    userNameSpan.textContent = 'Usuario - Datos no encontrados';
                    console.log("home.js No se encontraron los datos del usuario en Firestore.");
                    // Clear localStorage if no data is found in Firestore (potential inconsistency)
                    localStorage.removeItem('firstName');
                    localStorage.removeItem('lastName');
                }
            } catch (error) {
                console.error("home.js Error al obtener los datos del usuario:", error);
                userNameSpan.textContent = 'Usuario - Error al cargar';
            }
        } else {
            userNameSpan.textContent = 'No autenticado';
            console.log("home.js Usuario no autenticado.");
            // Clear localStorage if no user is authenticated
            localStorage.removeItem('firstName');
            localStorage.removeItem('lastName');
        }
    });

    if (logoHome && sidebar && closeSidebarBtn && logoutLink) {
        console.log('home.js logoHome, sidebar, closeSidebarBtn, logoutLink are present');
        // LOGO CLICK LISTENER REMOVED FROM HERE
        closeSidebarBtn.addEventListener('click', () => {
            console.log('home.js closeSidebarBtn clicked');
            sidebar.classList.remove('open');
            console.log('home.js sidebar.classList:', sidebar.classList);
        });

        logoutLink.addEventListener('click', (event) => {
            console.log('home.js logoutLink clicked');
            event.preventDefault(); // Evita la redirección por defecto del enlace
            signOut(auth)
                .then(() => {
                    console.log('home.js Cierre de sesión exitoso.');
                    // Clear localStorage on logout
                    localStorage.removeItem('firstName');
                    localStorage.removeItem('lastName');
                    console.log('home.js Caché limpiada al cerrar sesión.');
                    // Redirect to the login page
                    window.location.href = "../index.html";
                })
                .catch((error) => {
                    console.error("home.js Error al cerrar sesión:", error);
                    alert("home.js Error al cerrar sesión. Inténtalo de nuevo.");
                });
        });
    } else {
        console.log('home.js One or more elements (logoHome, sidebar, closeSidebarBtn, logoutLink) are missing.');
    }
});