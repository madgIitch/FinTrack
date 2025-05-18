// Importar funciones de autenticación desde Firebase
import { auth } from './firebase.js';
import { signOut } from "firebase/auth";

// Mensaje para confirmar que el script ha sido cargado
console.log('sidebar.js loaded');

// Esperar a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', () => {
    console.log('sidebar.js DOMContentLoaded');

    // Referencias a los elementos del DOM relacionados con la barra lateral
    const logoHome = document.querySelector('.logo-icon');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const logoutLink = document.getElementById('logout-link');

    // Imprimir los elementos encontrados en la consola para verificar que existen
    console.log('sidebar.js elements:', { logoHome, sidebar, closeSidebarBtn, logoutLink });

    // Verificar que todos los elementos necesarios estén presentes
    if (logoHome && sidebar && closeSidebarBtn && logoutLink) {
        console.log('sidebar.js All elements found.');

        // ===========================
        // Manejador del Logo (Abrir/Cerrar Sidebar)
        // ===========================
        logoHome.addEventListener('click', () => {
            console.log('sidebar.js logoHome clicked');
            // Alternar la clase "open" en el sidebar para mostrar/ocultar el menú
            sidebar.classList.toggle('open');
            console.log('sidebar.js sidebar.classList:', sidebar.classList);
        });

        // ===========================
        // Manejador del Botón de Cerrar Sidebar
        // ===========================
        closeSidebarBtn.addEventListener('click', () => {
            console.log('sidebar.js closeSidebarBtn clicked');
            // Cerrar el sidebar removiendo la clase "open"
            sidebar.classList.remove('open');
            console.log('sidebar.js sidebar.classList:', sidebar.classList);
        });

        // ===========================
        // Manejador del Cierre de Sesión
        // ===========================
        logoutLink.addEventListener('click', (event) => {
            console.log('sidebar.js logoutLink clicked');
            event.preventDefault(); // Evita la redirección por defecto del enlace

            // Intentar cerrar sesión en Firebase
            signOut(auth)
                .then(() => {
                    console.log('sidebar.js Cierre de sesión exitoso.');
                    // Redirigir a la página de inicio de sesión después del cierre de sesión exitoso
                    window.location.href = "../index.html";
                })
                .catch((error) => {
                    console.error("sidebar.js Error al cerrar sesión:", error);
                    alert("sidebar.js Error al cerrar sesión. Inténtalo de nuevo.");
                });
        });

        // ===========================
        // Función para marcar el enlace activo en la barra lateral
        // ===========================
        function markActiveLink() {
            console.log('sidebar.js markActiveLink called');

            // Obtener la página actual para marcar el enlace activo
            const currentPage = window.location.pathname;
            const profileLink = document.querySelector('#sidebar a[href="profile.html"]');

            console.log('sidebar.js markActiveLink elements:', { profileLink, logoutLink });

            // Verificar que los elementos existen antes de aplicar las clases
            if (profileLink && logoutLink) {
                console.log('sidebar.js profileLink and logoutLink found in markActiveLink');

                // Marcar "profile.html" como activo si es la página actual
                if (currentPage.includes("profile.html")) {
                    profileLink.classList.add('selected');
                    logoutLink.classList.remove('selected');
                    console.log('sidebar.js markActiveLink profile.html active');
                } else {
                    profileLink.classList.remove('selected');
                    logoutLink.classList.remove('selected');
                    console.log('sidebar.js markActiveLink profile.html not active');
                }
            } else {
                console.warn("sidebar.js No se encontraron los elementos profileLink o logoutLink en esta página.");
            }
        }

        // Llamar a la función para marcar el enlace activo al cargar la página
        markActiveLink();

    } else {
        // Imprimir advertencia si faltan elementos en el DOM
        console.log('sidebar.js One or more elements (logoHome, sidebar, closeSidebarBtn, logoutLink) are missing.');
    }
});
