import { auth } from './firebase.js';
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  sendPasswordResetEmail
} from 'firebase/auth';

document.addEventListener('DOMContentLoaded', () => {
    console.log('index.js loaded');

    const loginForm = document.getElementById('login-form');
    const resetForm = document.getElementById('reset-form');
    const showResetFormButton = document.getElementById('show-reset-form');
    const backToLoginButton = document.getElementById('back-to-login');
    const registerLink = document.getElementById('register-link');

    // Manejar formulario de recuperación de contraseña
    if (showResetFormButton) {
        showResetFormButton.addEventListener('click', (event) => {
            event.preventDefault();
            loginForm.style.display = 'none';
            showResetFormButton.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            resetForm.style.display = 'block';
        });
    }

    // Volver al formulario de login
    if (backToLoginButton) {
        backToLoginButton.addEventListener('click', (event) => {
            event.preventDefault();
            resetForm.style.display = 'none';
            loginForm.style.display = 'block';
            showResetFormButton.style.display = 'inline-block';
            if (registerLink) registerLink.style.display = 'inline-block';
        });
    }

    // Manejar formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await setPersistence(auth, browserLocalPersistence);
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                window.location.href = '/pages/home.html';
            } catch (error) {
                console.error('Error al iniciar sesión:', error);
                alert('Error al iniciar sesión. Verifica tus credenciales.');
            }
        });
    }
});
