import { auth } from './firebaseConfig.js'; // Ajusta la ruta según donde esté tu archivo
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    // Validar que los campos no estén vacíos
    if (!email || !password) {
        errorMessage.textContent = "Por favor, complete ambos campos.";
        return;
    }

    // Usar el servicio de autenticación para iniciar sesión
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            window.location.href = "dashboard.html"; // Redirigir al panel
        })
        .catch((error) => {
            let errorMsg = "Error desconocido";
            // Manejar errores específicos de Firebase
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMsg = "El correo electrónico no es válido.";
                    break;
                case 'auth/user-disabled':
                    errorMsg = "El usuario ha sido deshabilitado.";
                    break;
                case 'auth/user-not-found':
                    errorMsg = "No se encuentra un usuario con ese correo.";
                    break;
                case 'auth/wrong-password':
                    errorMsg = "La contraseña es incorrecta.";
                    break;
                default:
                    errorMsg = "Error: " + error.message;
            }
            errorMessage.textContent = errorMsg;
        });
});
