// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updatePassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

// Elementos del DOM
const menuBtn = document.querySelector('#menu-btn');
const closeBtn = document.querySelector('#close-btn');
const aside = document.querySelector('aside');
const themeToggler = document.querySelector('.theme-toggler');

// Modales
const inventoryModal = document.getElementById('inventoryModal');
const metricsModal = document.getElementById('metricsModal');
const adminsModal = document.getElementById('adminsModal');
const profileModal = document.getElementById('profileModal');
const changePasswordModal = document.getElementById('changePasswordModal');
const addItemModal = document.getElementById('addItemModal');
const addAdminModal = document.getElementById('addAdminModal');
const loginModal = document.getElementById('loginModal');

// Enlaces del menú
const inventoryLink = document.getElementById('inventory-link');
const metricsLink = document.getElementById('metrics-link');
const adminsLink = document.getElementById('admins-link');
const profileLink = document.getElementById('profile-link');
const logoutBtn = document.getElementById('logout-btn');

// Botones de los modales
const addItemButton = document.getElementById('add-item-button');
const addAdminButton = document.getElementById('add-admin-button');
const changePasswordButton = document.getElementById('change-password-button');
const exportInventoryButton = document.getElementById('export-inventory-button');

// Botones de cierre de los modales
const closeAddItemModal = document.getElementById('close-add-item-modal');
const closeAddAdminModal = document.getElementById('close-add-admin-modal');

// Formularios
const addItemForm = document.getElementById('add-item-form');
const addAdminForm = document.getElementById('add-admin-form');
const changePasswordForm = document.getElementById('change-password-form');
const loginForm = document.getElementById('login-form');

// Listas de datos
const inventoryList = document.getElementById('inventory-list');
const metricsData = document.getElementById('metrics-data');
const adminsList = document.getElementById('admins-list');

// Datos del perfil
const profileName = document.getElementById('profile-name');
const profileEmail = document.getElementById('profile-email');
const profileRole = document.getElementById('profile-role');

// Insights del Dashboard
const totalSalesElement = document.getElementById('total-sales');
const salesPercentageElement = document.getElementById('sales-percentage');
const totalExpensesElement = document.getElementById('total-expenses');
const expensesPercentageElement = document.getElementById('expenses-percentage');
const totalIncomeElement = document.getElementById('total-income');
const incomePercentageElement = document.getElementById('income-percentage');

let currentUserRole = null;

// Funciones de los modales
function openModal(modal) {
    modal.style.display = "block";
}

function closeModal(modal) {
    modal.style.display = "none";
}

// Funciones de autenticación
async function registerAdmin(email, password, name, role) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await addDoc(collection(db, 'admins'), {
            uid: user.uid,
            email: email,
            name: name,
            role: role
        });
        Swal.fire({
            icon: 'success',
            title: 'Administrador Creado!',
            text: 'El administrador ha sido creado correctamente.'
        });
        closeModal(addAdminModal);
        loadAdmins();
        addAdminForm.reset();
    } catch (error) {
        console.error("Error al registrar administrador: ", error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `Hubo un problema al registrar el administrador: ${error.message}`
        });
    }
}

async function login(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        closeModal(loginModal);
        Swal.fire({
            icon: 'success',
            title: 'Sesión Iniciada!',
            text: 'Sesión iniciada correctamente.'
        });
    } catch (error) {
        console.error("Error al iniciar sesión: ", error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `Hubo un problema al iniciar sesión: ${error.message}`
        });
    }
}

async function changePassword(newPassword) {
    try {
        await updatePassword(auth.currentUser, newPassword);
        Swal.fire({
            icon: 'success',
            title: 'Contraseña Cambiada!',
            text: 'La contraseña ha sido cambiada correctamente.'
        });
        closeModal(changePasswordModal);
        changePasswordForm.reset();
    } catch (error) {
        console.error("Error al cambiar la contraseña: ", error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `Hubo un problema al cambiar la contraseña: ${error.message}`
        });
    }
}

// Funciones de manejo de datos
async function loadInventory() {
    inventoryList.innerHTML = '';
    const inventoryCollection = collection(db, 'inventory');
    try {
        const snapshot = await getDocs(inventoryCollection);
        snapshot.forEach(doc => {
            const itemData = doc.data();
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('inventory-item');
            itemDiv.innerHTML = `
                <h3>${itemData.name}</h3>
                <p>Categoría: ${itemData.category}</p>
                <p>Cantidad: ${itemData.quantity} ${itemData.unit}</p>
                <p>Precio de Costo: $${itemData.costPrice}</p>
                <button data-id="${doc.id}" class="edit-item">Editar</button>
                <button data-id="${doc.id}" class="delete-item">Eliminar</button>
            `;
            inventoryList.appendChild(itemDiv);
        });
    } catch (error) {
        console.error("Error al cargar el inventario: ", error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Hubo un problema al cargar el inventario.'
        });
    }
}

async function loadMetrics() {
    metricsData.innerHTML = '<p>Cargando métricas...</p>';
    const metricsCollection = collection(db, 'website_metrics');
    try {
        const snapshot = await getDocs(metricsCollection);
        let metricsHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            metricsHTML += `
                <p>Visitas: ${data.visits}</p>
                <p>Vistas de Página: ${data.page_views}</p>
            `;
        });
        metricsData.innerHTML = metricsHTML;
    } catch (error) {
        console.error("Error al cargar las métricas: ", error);
        metricsData.innerHTML = '<p>Error al cargar las métricas.</p>';
    }
}

async function loadAdmins() {
    adminsList.innerHTML = '';
    const adminsCollection = collection(db, 'admins');
    try {
        const snapshot = await getDocs(adminsCollection);
        snapshot.forEach(doc => {
            const adminData = doc.data();
            const adminDiv = document.createElement('div');
            adminDiv.classList.add('admin-item');
            adminDiv.innerHTML = `
                <h3>${adminData.name}</h3>
                <p>Email: ${adminData.email}</p>
                <p>Rol: ${adminData.role}</p>
                <button data-id="${doc.id}" class="delete-admin">Eliminar</button>
            `;
            adminsList.appendChild(adminDiv);
        });
    } catch (error) {
        console.error("Error al cargar administradores: ", error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Hubo un problema al cargar los administradores.'
        });
    }
}

async function loadProfile() {
    if (auth.currentUser) {
        const userRef = doc(db, 'admins', auth.currentUser.uid);
        try {
            const docSnapshot = await getDoc(userRef);
            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                profileName.textContent = userData.name;
                profileEmail.textContent = userData.email;
                profileRole.textContent = userData.role;
            } else {
                console.log("No se encontró el perfil del usuario.");
            }
        } catch (error) {
            console.error("Error al cargar el perfil: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Hubo un problema al cargar el perfil.'
            });
        }
    }
}

async function loadDashboardInsights() {
    // Datos de ejemplo (reemplazar con datos reales de Firebase)
    const totalSales = 15000;
    const totalExpenses = 8000;
    const totalIncome = totalSales - totalExpenses;

    const salesPercentage = 65; // Ejemplo
    const expensesPercentage = 50; // Ejemplo
    const incomePercentage = 75; // Ejemplo

    totalSalesElement.textContent = `$${totalSales}`;
    salesPercentageElement.textContent = `${salesPercentage}%`;
    totalExpensesElement.textContent = `$${totalExpenses}`;
    expensesPercentageElement.textContent = `${expensesPercentage}%`;
    totalIncomeElement.textContent = `$${totalIncome}`;
    incomePercentageElement.textContent = `${incomePercentage}%`;
}

async function exportInventoryToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Reporte de Inventario", 10, 10);

    let y = 20;
    const inventoryCollection = collection(db, 'inventory');
    try {
        const snapshot = await getDocs(inventoryCollection);
        snapshot.forEach(doc => {
            const itemData = doc.data();
            doc.text(`Nombre: ${itemData.name}`, 10, y);
            y += 10;
            doc.text(`Categoría: ${itemData.category}`, 10, y);
            y += 10;
            doc.text(`Cantidad: ${itemData.quantity} ${itemData.unit}`, 10, y);
            y += 10;
            doc.text(`Precio de Costo: $${itemData.costPrice}`, 10, y);
            y += 15;
        });
        doc.save("reporte-inventario.pdf");
    } catch (error) {
        console.error("Error al exportar a PDF: ", error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Hubo un problema al exportar el inventario a PDF.'
        });
    }
}

// Eventos de los modales
inventoryLink.addEventListener('click', () => {
    openModal(inventoryModal);
    loadInventory();
});

metricsLink.addEventListener('click', () => {
    openModal(metricsModal);
    loadMetrics();
});

adminsLink.addEventListener('click', () => {
    openModal(adminsModal);
    loadAdmins();
});

profileLink.addEventListener('click', () => {
    openModal(profileModal);
    loadProfile();
});

changePasswordButton.addEventListener('click', () => {
    closeModal(profileModal);
    openModal(changePasswordModal);
});

addItemButton.addEventListener('click', () => {
    openModal(addItemModal);
});

addAdminButton.addEventListener('click', () => {
    openModal(addAdminModal);
});

exportInventoryButton.addEventListener('click', () => {
    exportInventoryToPDF();
});

// Eventos de los formularios
addItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newItem = {
        name: document.getElementById('name').value,
        category: document.getElementById('category').value,
        costPrice: parseFloat(document.getElementById('costPrice').value),
        description: document.getElementById('description').value,
        expirationDate: document.getElementById('expirationDate').value,
        location: document.getElementById('location').value,
        quantity: parseInt(document.getElementById('quantity').value),
        supplier: document.getElementById('supplier').value,
        unit: document.getElementById('unit').value,
        notes: document.getElementById('notes').value
    };

    try {
        await addDoc(collection(db, 'inventory'), newItem);
        closeModal(addItemModal);
        loadInventory();
        Swal.fire({
            icon: 'success',
            title: 'Éxito!',
            text: 'Insumo agregado correctamente.'
        });
        addItemForm.reset();
    } catch (error) {
        console.error("Error al agregar el insumo: ", error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `Hubo un problema al agregar el insumo: ${error.message}`
        });
    }
});

addAdminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const adminName = document.getElementById('admin-name').value;
    const adminEmail = document.getElementById('admin-email').value;
    const adminPassword = document.getElementById('admin-password').value;
    const adminRole = document.getElementById('admin-role').value;

    registerAdmin(adminEmail, adminPassword, adminName, adminRole);
});

changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword === confirmPassword) {
        changePassword(newPassword);
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Las contraseñas no coinciden.'
        });
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const loginEmail = document.getElementById('login-email').value;
    const loginPassword = document.getElementById('login-password').value;

    login(loginEmail, loginPassword);
});

// Eventos de los botones de cierre
document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', function() {
        const modal = this.closest('.modal');
        closeModal(modal);
    });
});

closeAddItemModal.addEventListener('click', () => {
    closeModal(addItemModal);
});

closeAddAdminModal.addEventListener('click', () => {
    closeModal(addAdminModal);
});

// Cierre de los modales al hacer clic fuera del contenido
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        closeModal(event.target);
    }
});

// Eventos del menú
menuBtn.addEventListener('click', () => {
    aside.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    aside.style.display = 'none';
});

themeToggler.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode-variables');
    themeToggler.querySelector('span:nth-child(1)').classList.toggle('active');
    themeToggler.querySelector('span:nth-child(2)').classList.toggle('active');
});

adminsList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('delete-admin')) {
        const idToDelete = e.target.dataset.id;
        try {
            await deleteDoc(doc(db, 'admins', idToDelete));
            loadAdmins();
            Swal.fire({
                icon: 'success',
                title: 'Éxito!',
                text: 'Administrador eliminado correctamente.'
            });
        } catch (error) {
            console.error("Error al eliminar el administrador: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Hubo un problema al eliminar el administrador.'
            });
        }
    }
});

// Escucha el estado de autenticación
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // El usuario ha iniciado sesión
        const userRef = doc(db, 'admins', user.uid);
        try {
            const docSnapshot = await getDoc(userRef);
            if (docSnapshot.exists()) {
                const userData = docSnapshot.data();
                currentUserRole = userData.role;

                // Muestra el contenido solo si el usuario tiene un rol asignado
                document.querySelector('.container').style.display = 'grid';

                // Carga datos iniciales
                loadDashboardInsights();
            } else {
                console.log("No se encontró el perfil del usuario.");
                // Si no se encuentra el perfil, cerrar sesión y mostrar el modal de inicio de sesión
                await signOut(auth);
                openModal(loginModal);
            }
        } catch (error) {
            console.error("Error al obtener el rol del usuario: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Hubo un problema al obtener el rol del usuario.'
            });
            await signOut(auth);
            openModal(loginModal);
        }
    } else {
        // El usuario no ha iniciado sesión, muestra el modal de inicio de sesión
        document.querySelector('.container').style.display = 'none';
        openModal(loginModal);
    }
});
