import { auth } from './firebase.js'; // Importa la instancia de auth de Firebase
import { signOut } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {
    const logoHome = document.querySelector('.logo-icon');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const logoutLink = document.getElementById('logout-link');

    if (logoHome && sidebar && closeSidebarBtn && logoutLink) {
        logoHome.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('open');
        });

        logoutLink.addEventListener('click', (event) => {
            event.preventDefault(); // Evita la redirección por defecto del enlace
            signOut(auth)
                .then(() => {
                    // Cierre de sesión exitoso, redirige a la página de inicio de sesión
                    window.location.href = "../index.html";
                })
                .catch((error) => {
                    console.error("Error al cerrar sesión:", error);
                    alert("Error al cerrar sesión. Inténtalo de nuevo.");
                });
        });

        // Función para marcar el enlace activo como seleccionado (opcional)
        function markActiveLink() {
            const currentPage = window.location.pathname;
            const profileLink = document.querySelector('#sidebar a[href="profile.html"]');

            if (profileLink && logoutLink) { // Añade esta comprobación
                if (currentPage.includes("profile.html")) {
                    profileLink.classList.add('selected');
                    logoutLink.classList.remove('selected');
                } else {
                    profileLink.classList.remove('selected');
                    logoutLink.classList.remove('selected');
                    // Puedes añadir lógica para marcar otros enlaces si tienes más secciones
                }
            } else {
                console.warn("No se encontraron los elementos profileLink o logoutLink en esta página.");
            }
        }

        markActiveLink(); // Llama a la función al cargar la página
    }
});