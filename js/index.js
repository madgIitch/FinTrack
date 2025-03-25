// index.js
import { app, auth, db } from './firebase.js'; // Ajusta la ruta si es necesario

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('Usuario logueado:', user);
            // Redirigir a la página principal
            window.location.href = 'homepage.html';
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            alert('Error al iniciar sesión. Verifica tu correo electrónico y contraseña.');
        }
    });
});