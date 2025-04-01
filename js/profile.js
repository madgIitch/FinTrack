import { auth, onAuthStateChanged } from '../js/firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    const nombreSpan = document.getElementById('profile-nombre');
    const apellidosSpan = document.getElementById('profile-apellidos');
    const emailSpan = document.getElementById('profile-email');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuario autenticado, obtener y mostrar la información
            const { displayName, email } = user;
            let nombre = '';
            let apellidos = '';

            if (displayName) {
                // Intentar separar el nombre y los apellidos si están disponibles en displayName
                const parts = displayName.split(' ');
                nombre = parts[0] || '';
                apellidos = parts.slice(1).join(' ') || '';
            } else {
                // Si displayName no está disponible, puedes intentar obtenerlo de localStorage
                nombre = localStorage.getItem('firstName') || '';
                apellidos = localStorage.getItem('lastName') || '';
            }

            nombreSpan.textContent = nombre;
            apellidosSpan.textContent = apellidos;
            emailSpan.textContent = email || 'No disponible';

            console.log('Información del perfil cargada:', { nombre, apellidos, email });

        } else {
            // Usuario no autenticado, redirigir a la página de inicio de sesión
            console.log('Usuario no autenticado, redirigiendo a la página de inicio de sesión.');
            window.location.href = '../index.html';
        }
    });
});