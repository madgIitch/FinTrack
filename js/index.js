import { auth } from './firebase.js'; // Import the auth object from firebase.js
import { signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'; // Import setPersistence y browserLocalPersistence

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Listener para el estado de autenticación
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // El usuario ya está autenticado, redirige directamente a home.html
            console.log('Usuario ya autenticado:', user);
            window.location.href = 'pages/home.html';
        } else {
            // El usuario no está autenticado, muestra el formulario de inicio de sesión
            console.log('Usuario no autenticado, mostrando formulario de inicio de sesión.');
            // Aquí puedes dejar el código existente para el envío del formulario de login
            if (loginForm) {
                loginForm.addEventListener('submit', async (event) => {
                    event.preventDefault();

                    const email = emailInput.value;
                    const password = passwordInput.value;

                    try {
                        // Configura la persistencia antes de iniciar sesión
                        await setPersistence(auth, browserLocalPersistence);
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
            }
        }
    });
});