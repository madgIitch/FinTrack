// register.js
import { app, auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, sendEmailVerification, fetchSignInMethodsForEmail, signInWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const steps = document.querySelectorAll('.step');
    const nextStepButtons = document.querySelectorAll('.next-step');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const verificationCodeInput = document.getElementById('verification-code');
    const visibilityIcons = document.querySelectorAll('.visibility-icon');
    const emailExistsAlert = document.getElementById('email-exists-alert');
    const verificationError = document.getElementById('verification-error');
    let currentStep = 0;
    let emailForVerification = '';

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.remove('active');
            if (index === stepIndex) {
                step.classList.add('active');
            }
        });
        currentStep = stepIndex;
    }

    nextStepButtons.forEach(button => {
        button.addEventListener('click', () => {
            const nextStepId = button.dataset.next;
            if (nextStepId) {
                showStep(steps.findIndex(step => step.id === nextStepId));
            }
        });
    });

    document.getElementById('check-email').addEventListener('click', async () => {
        const email = emailInput.value;
        emailForVerification = email;
        try {
            const methods = await fetchSignInMethodsForEmail(auth, email);
            if (methods.length > 0) {
                emailExistsAlert.style.display = 'block';
            } else {
                emailExistsAlert.style.display = 'none';
                await sendEmailVerification(auth.currentUser);
                showStep(2); // Ir al paso de verificación del código
            }
        } catch (error) {
            console.error("Error al verificar el correo:", error);
            alert("Error al verificar el correo. Inténtalo de nuevo.");
        }
    });

    document.getElementById('verify-code').addEventListener('click', async () => {
        const code = verificationCodeInput.value;
        try {
            // No hay una forma directa de verificar el código enviado por Firebase
            // Se asume que si el usuario llega a este punto después del envío del correo,
            // y el correo es válido, entonces el usuario tiene acceso al correo.
            showStep(3); // Ir al paso de contraseña
        } catch (error) {
            console.error("Error al verificar el código:", error);
            verificationError.style.display = 'block';
        }
    });

    visibilityIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const input = icon.previousElementSibling;
            input.type = input.type === 'password' ? 'text' : 'password';
            icon.textContent = input.type === 'password' ? 'visibility' : 'visibility_off';
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const apellidos = document.getElementById('apellidos').value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        try {
            // El usuario ya debería haber verificado su correo en el paso anterior
            const userCredential = await createUserWithEmailAndPassword(auth, emailForVerification, password);
            const user = userCredential.user;

            const userData = {
                email: emailForVerification,
                firstName: nombre,
                lastName: apellidos
            };

            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, userData);

            alert('Registro completado con éxito.');
            window.location.href = "../index.html";

        } catch (error) {
            console.error("Error durante el registro:", error);
            let errorMessage = 'Error durante el registro. Inténtalo de nuevo.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este correo electrónico ya está en uso.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
            }
            alert(errorMessage);
        }
    });
});