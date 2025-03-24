import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const registerBtn = document.getElementById('register-btn');

    registerBtn.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Registro inicial exitoso
                const user = userCredential.user;

                // Enviar correo de verificación
                sendEmailVerification(user)
                    .then(() => {
                        alert('Correo de verificación enviado. Por favor, verifica tu correo.');
                        // Redirigir al usuario o mostrar un mensaje de éxito
                        window.location.href = '/verify-email.html'; // Redirige a la página de verificación de correo
                    })
                    .catch((error) => {
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        alert('Error al enviar el correo de verificación: ' + errorMessage);
                    });
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(errorMessage);
            });
    });
});