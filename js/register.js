// register.js
import { app } from './firebase.js';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const steps = document.querySelectorAll('.step');
    const nextStepButtons = document.querySelectorAll('.next-step');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const visibilityIcons = document.querySelectorAll('.password-field .material-icons');
    let currentStep = 0;

    nextStepButtons.forEach(button => {
        button.addEventListener('click', () => {
            steps[currentStep].classList.remove('active');
            currentStep++;
            steps[currentStep].classList.add('active');
        });
    });

    visibilityIcons.forEach(icon => {
        icon.addEventListener('click', () => {
            const input = icon.previousElementSibling; // Obtiene el campo de entrada
            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = 'visibility_off';
            } else {
                input.type = 'password';
                icon.textContent = 'visibility';
            }
        });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita la recarga de la página por defecto

        const nombre = document.getElementById('nombre').value;
        const apellidos = document.getElementById('apellidos').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }

        try {
            const auth = getAuth(app);
            const db = getFirestore(app);

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userData = {
                email: email,
                firstName: nombre,
                lastName: apellidos
            };

            const docRef = doc(db, "users", user.uid);
            await setDoc(docRef, userData);

            alert('Registro completado con éxito.');
            // Redirigir a la página de inicio o a donde desees
            window.location.href = "index.html";

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