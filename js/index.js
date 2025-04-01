import { auth } from './firebase.js'; // Import the auth object from firebase.js
import { signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth'; // Import setPersistence y browserLocalPersistence

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Listener para el estado de autenticación
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // El usuario ya está autenticado
            if (user.emailVerified) {
                console.log('Usuario autenticado y correo verificado:', user);
                window.location.href = 'pages/home.html';
            } else {
                console.log('Usuario autenticado pero correo no verificado:', user);
                alert('Por favor, verifica tu dirección de correo electrónico antes de iniciar sesión.');
                // Opcionalmente, podrías ofrecer un botón para reenviar el correo de verificación aquí
                // sendEmailVerification(user).then(() => {
                //     alert('Se ha enviado un nuevo correo de verificación.');
                // });
            }
        } else {
            // El usuario no está autenticado, muestra el formulario de inicio de sesión
            console.log('Usuario no autenticado, mostrando formulario de inicio de sesión.');
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

                        if (user.emailVerified) {
                            console.log('Usuario logueado y correo verificado:', user);
                            window.location.href = 'pages/home.html';
                        } else {
                            console.log('Usuario logueado pero correo no verificado:', user);
                            alert('Por favor, verifica tu dirección de correo electrónico antes de continuar.');
                            // Opcionalmente, podrías ofrecer un botón para reenviar el correo de verificación aquí
                            // sendEmailVerification(user).then(() => {
                            //     alert('Se ha enviado un nuevo correo de verificación.');
                            // });
                        }

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