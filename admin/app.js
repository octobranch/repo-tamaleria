// Importar Firebase y las funciones necesarias desde el archivo de configuración
import { auth } from './firebaseConfig.js'; // Ajusta la ruta según donde esté tu archivo
import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js';

document.getElementById("login-form").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");

    // Usar el servicio de autenticación para iniciar sesión
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            window.location.href = "dashboard.html"; // Redirigir al panel
        })
        .catch((error) => {
            errorMessage.textContent = "Error: " + error.message;
        });
});
