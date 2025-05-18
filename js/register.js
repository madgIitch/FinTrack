// Importar funciones necesarias de Firebase
import { app, auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, sendEmailVerification, fetchSignInMethodsForEmail } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

// Evento que se ejecuta cuando el DOM está completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias a elementos del formulario de registro
    const form = document.getElementById('register-form');
    const steps = Array.from(document.querySelectorAll('.step'));
    const nextStepButtons = document.querySelectorAll('.next-step');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const visibilityIcons = document.querySelectorAll('.visibility-icon');
    const emailExistsAlert = document.getElementById('email-exists-alert');
    const progressBar = document.getElementById('progress-bar');

    // Variables para manejo del flujo del registro
    let currentStep = 0;
    let emailForVerification = '';

    // ===========================
    // Función: updateProgress
    // Actualiza la barra de progreso en función del paso actual
    // ===========================
    function updateProgress(stepIndex) {
        const totalSteps = steps.length;
        const progress = ((stepIndex + 1) / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Inicializar la barra de progreso en el primer paso
    updateProgress(0);

    // ===========================
    // Función: showStep
    // Muestra el paso actual y oculta los demás
    // ===========================
    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle('active', index === stepIndex);
        });
        currentStep = stepIndex;
        updateProgress(stepIndex);
    }

    // ===========================
    // Manejador de eventos para avanzar entre pasos
    // ===========================
    nextStepButtons.forEach(button => {
        button.addEventListener('click', () => {
            const nextStepId = button.dataset.next;
            if (nextStepId) {
                const nextIndex = steps.findIndex(step => step.id === nextStepId);
                if (nextIndex !== -1) showStep(nextIndex);
            }
        });
    });

    // ===========================
    // Verificación de email antes del registro
    // ===========================
    document.getElementById('check-email').addEventListener('click', async () => {
        const email = emailInput.value.trim();
        emailForVerification = email; // Almacenar el email para el registro

        try {
            // Verificar si el email ya está registrado
            const methods = await fetchSignInMethodsForEmail(auth, email);
            if (methods.length > 0) {
                // Mostrar mensaje de error si el email ya está en uso
                emailExistsAlert.style.display = 'block';
            } else {
                // Ocultar mensaje de error si el email es nuevo
                emailExistsAlert.style.display = 'none';
                console.log("Correo disponible.");
                // Pasar al siguiente paso (contraseña)
                showStep(2);
            }
        } catch (error) {
            console.error("Error al verificar el correo:", error);
            alert("Error al verificar el correo. Inténtalo de nuevo.");
        }
    });

    // ===========================
    // Manejadores para visibilidad de contraseña
    // ===========================
    visibilityIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const input = icon.previousElementSibling;
            const isPasswordVisible = input.type === 'password';
            input.type = isPasswordVisible ? 'text' : 'password';
            icon.textContent = isPasswordVisible ? 'visibility_off' : 'visibility';
        });
    });

    // ===========================
    // Manejador del envío del formulario de registro
    // ===========================
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Obtener datos del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const apellidos = document.getElementById('apellidos').value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Verificar que las contraseñas coincidan
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        try {
            // Crear el usuario en Firebase Auth
            console.log("Enviando correo de verificación...");
            const userCredential = await createUserWithEmailAndPassword(auth, emailForVerification, password);
            const user = userCredential.user;

            // Enviar correo de verificación
            await sendEmailVerification(user);
            console.log("Correo de verificación enviado.");

            // Guardar datos del usuario en Firestore
            const userData = {
                email: emailForVerification,
                firstName: nombre,
                lastName: apellidos
            };
            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, userData);

            // Notificar al usuario y redirigir al login
            alert('Registro completado. Por favor, verifica tu correo electrónico.');
            window.location.href = "../index.html";

        } catch (error) {
            console.error("Error durante el registro:", error);
            let errorMessage = 'Error durante el registro. Inténtalo de nuevo.';

            // Manejar errores específicos
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este correo electrónico ya está en uso.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Error de red. Por favor, inténtalo de nuevo.';
            } else {
                errorMessage = error.message; // Mostrar mensaje de error completo para depuración
            }

            alert(errorMessage);
        }
    });
});
