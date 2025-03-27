// index.js
import { auth } from './firebase.js'; // Import the auth object from firebase.js
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import the signInWithEmailAndPassword function

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
            console.log('Intentando redirigir a home.html'); // <--- AÑADE ESTA LÍNEA
            window.location.href = 'pages/home.html';
            // Redirigir a la página principal
            window.location.href = 'pages/home.html';
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            let errorMessage = 'Error al iniciar sesión. Verifica tu correo electrónico y contraseña.';
            if (error.code === 'auth/wrong-password') {
                errorMessage = 'Contraseña incorrecta.';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'Usuario no encontrado.';
            }
            alert(errorMessage);
        }
    });
});