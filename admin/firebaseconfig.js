// firebaseConfig.js

// Importar los módulos necesarios de Firebase (si estás usando Firebase 9.x o posterior)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC8yt-0Ha8igI_vEXhybu0wNs5th-mnWK0",
  authDomain: "la-tamaleria-cancun-47590.firebaseapp.com",
  projectId: "la-tamaleria-cancun-47590",
  storageBucket: "la-tamaleria-cancun-47590.firebasestorage.app",
  messagingSenderId: "130225049824",
  appId: "1:130225049824:web:5d361078bcf42e7c20c085"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar los servicios que necesitas
const auth = getAuth(app);
const firestore = getFirestore(app);

// Exportar los servicios para su uso en otras partes de la aplicación
export { auth, firestore };
