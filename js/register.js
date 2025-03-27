import { app, auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, sendEmailVerification, fetchSignInMethodsForEmail } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    // Corregimos aquí:
    const steps = Array.from(document.querySelectorAll('.step'));
    const nextStepButtons = document.querySelectorAll('.next-step');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const visibilityIcons = document.querySelectorAll('.visibility-icon');
    const emailExistsAlert = document.getElementById('email-exists-alert');
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
                console.log("Enviando correo de verificación...");
                await sendEmailVerification(auth.currentUser);
                console.log("Correo de verificación enviado.");
                alert('Se ha enviado un correo de verificación a tu dirección de correo electrónico. Por favor, verifica tu correo.');
                console.log("Llamando a showStep(2)"); // Cambiado a 2
                showStep(2); // Ir al paso de contraseña
                console.log("showStep(2) ejecutado.");
            }
        } catch (error) {
            console.error("Error al verificar el correo:", error);
            alert("Error al verificar el correo. Inténtalo de nuevo.");
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
            // Creamos el usuario (el correo se verificará por el enlace del email)
            const userCredential = await createUserWithEmailAndPassword(auth, emailForVerification, password);
            const user = userCredential.user;

            const userData = {
                email: emailForVerification,
                firstName: nombre,
                lastName: apellidos
            };

            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, userData);

            alert('Registro completado. Por favor, verifica tu correo electrónico.');
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