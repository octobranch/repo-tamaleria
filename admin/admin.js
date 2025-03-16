class AdminUI {
    static init() {
        this.bindEvents();
        this.checkAuthState();
    }

    static bindEvents() {
        // Autenticación
        document.getElementById('loginBtn').addEventListener('click', this.handleLogin);
        document.getElementById('logoutBtn').addEventListener('click', this.handleLogout);

        // Dashboard
        document.getElementById('profileBtn').addEventListener('click', this.showPasswordModal);

        //Inventario
        document.getElementById('addItemBtn').addEventListener('click', () => this.showModal());
        document.getElementById('itemForm').addEventListener('submit', this.saveItem);
        document.getElementById('searchInput').addEventListener('input', this.searchItems);

        // Modales
        document.getElementById('passwordForm').addEventListener('submit', this.changePassword);

        //Sidebar
        document.querySelectorAll('.admin-sidebar nav ul li').forEach(item => {
            item.addEventListener('click', this.handleSidebarClick);
        });

        //Reporte PDF
        document.getElementById('exportPdfBtn').addEventListener('click', this.exportInventoryToPdf);
    }

    static async checkAuthState() {
        try {
            const user = await new Promise((resolve, reject) => {
                const unsubscribe = firebase.auth.onAuthStateChanged(user => {
                    unsubscribe();
                    resolve(user);
                }, reject);
            });

            if (user) {
                const userDoc = await firebase.getDoc(firebase.doc(firebase.db, 'admins', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const role = userData.role;

                    this.showDashboard(role); // Pasar el rol a la función showDashboard
                    this.updateUserRoleDisplay(role);

                    // Cargar datos según el rol (ejemplo)
                    if (role === 'administrador' || role === 'CEO' || role === 'gerente') {
                        this.loadInventory();
                    } else if (role === 'cajero') {
                        // Cargar datos relacionados con ventas
                    }
                } else {
                    this.showAuthError('No tienes permisos.');
                    await firebase.auth.signOut();
                }
            } else {
                this.showAuth();
            }
        } catch (error) {
            console.error('Error verifying auth:', error);
        }
    }

    static async verifyAdminRole(uid) {
        const adminDoc = await firebase.getDoc(firebase.doc(firebase.db, 'admins', uid));
        return adminDoc.exists();
    }

    static async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            await firebase.signInWithEmailAndPassword(firebase.auth, email, password);
        } catch (error) {
            this.showAuthError(this.getErrorMessage(error.code));
        }
    }

    static async handleLogout() {
        try {
            await firebase.auth.signOut();
            this.showAuth();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    static async loadInventory() {
        try {
            this.showLoading();
            const q = firebase.query(firebase.collection(firebase.db, 'inventory'));

            const unsubscribe = firebase.onSnapshot(q, (snapshot) => {
                const items = [];
                snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
                this.renderInventory(items);
                this.hideLoading();
            });

            window.addEventListener('beforeunload', unsubscribe);
        } catch (error) {
            this.showError('Error al cargar inventario');
        }
    }

    static showModal(itemId = null) {
        const modal = document.getElementById('itemModal');
        modal.style.display = 'flex';

        // Limpiar el formulario
        const form = document.getElementById('itemForm');
        form.reset();
        form.dataset.itemId = itemId || ''; // Guardar el ID

        if (itemId) {
            this.loadItemData(itemId); // Cargar los datos si es una edición
        }
    }

    static closeModal() {
        const modal = document.getElementById('itemModal');
        modal.style.display = 'none';
    }

    static async loadItemData(itemId) {
        try {
            const docRef = firebase.doc(firebase.db, 'inventory', itemId);
            const docSnap = await firebase.getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                document.getElementById('itemName').value = data.name || '';
                document.getElementById('itemDescription').value = data.description || '';
                document.getElementById('itemQuantity').value = data.quantity || '';
                document.getElementById('itemUnit').value = data.unit || '';
                document.getElementById('itemCostPrice').value = data.costPrice || '';
                document.getElementById('itemSupplier').value = data.supplier || '';
                document.getElementById('itemExpirationDate').value = data.expirationDate || '';
                document.getElementById('itemCategory').value = data.category || '';
                document.getElementById('itemLocation').value = data.location || '';
                document.getElementById('itemNotes').value = data.notes || '';
            } else {
                this.showError("No se encontró el insumo.");
            }
        } catch (error) {
            console.error("Error al cargar datos del insumo:", error);
            this.showError("Error al cargar los datos.");
        }
    }


    static async saveItem(event) {
        event.preventDefault();

        const itemName = document.getElementById('itemName').value;
        const itemDescription = document.getElementById('itemDescription').value;
        const itemQuantity = parseFloat(document.getElementById('itemQuantity').value);
        const itemUnit = document.getElementById('itemUnit').value;
        const itemCostPrice = parseFloat(document.getElementById('itemCostPrice').value);
        const itemSupplier = document.getElementById('itemSupplier').value;
        const itemExpirationDate = document.getElementById('itemExpirationDate').value;
        const itemCategory = document.getElementById('itemCategory').value;
        const itemLocation = document.getElementById('itemLocation').value;
        const itemNotes = document.getElementById('itemNotes').value;

        // Validaciones
        if (!itemName || !itemQuantity || !itemUnit) {
            AdminUI.showError('Por favor, complete los campos obligatorios (Nombre, Cantidad, Unidad).');
            return;
        }

        if (isNaN(itemQuantity) || itemQuantity <= 0) {
            AdminUI.showError('La cantidad debe ser un número mayor que cero.');
            return;
        }

        const itemData = {
            name: itemName,
            description: itemDescription,
            quantity: itemQuantity,
            unit: itemUnit,
            costPrice: itemCostPrice,
            supplier: itemSupplier,
            expirationDate: itemExpirationDate,
            category: itemCategory,
            location: itemLocation,
            notes: itemNotes,
            lastUpdate: firebase.Timestamp.now()
        };

        try {
            const itemId = document.getElementById('itemForm').dataset.itemId;

            if (itemId) {
                // Update
                const itemRef = firebase.doc(firebase.db, 'inventory', itemId);
                await firebase.updateDoc(itemRef, itemData);
                AdminUI.showSuccess('Insumo actualizado correctamente.');
            } else {
                // Create
                await firebase.addDoc(firebase.collection(firebase.db, 'inventory'), itemData);
                AdminUI.showSuccess('Insumo guardado correctamente.');
            }

            AdminUI.closeModal();
            AdminUI.loadInventory(); // Recargar el inventario
        } catch (error) {
            console.error('Error al guardar/actualizar insumo:', error);
            AdminUI.showError('Error al guardar/actualizar el insumo.');
        }
    }


    static renderInventory(items) {
        const tbody = document.getElementById('inventoryList');
        tbody.innerHTML = items.map(item => `
            <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.unit}</td>
                <td>${item.costPrice}</td>
                <td>${item.supplier}</td>
                <td>${item.expirationDate}</td>
                <td>${item.category}</td>
                <td>${item.location}</td>
                <td>${item.notes}</td>
                <td>${item.lastUpdate ? new Date(item.lastUpdate.toDate()).toLocaleDateString() : 'N/A'}</td>
                <td>
                    <button class="edit-btn" data-id="${item.id}">✏️</button>
                    <button class="delete-btn" data-id="${item.id}">🗑️</button>
                </td>
            </tr>
        `).join('');

        // Bind edit/delete events
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showModal(btn.dataset.id));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleDelete(btn.dataset.id));
        });
    }


    static async handleDelete(itemId) {
        if (confirm("¿Estás seguro de que quieres eliminar este insumo?")) {
            try {
                await firebase.deleteDoc(firebase.doc(firebase.db, 'inventory', itemId));
                AdminUI.showSuccess('Insumo eliminado correctamente.');
                AdminUI.loadInventory();
            } catch (error) {
                console.error('Error al eliminar insumo:', error);
                AdminUI.showError('Error al eliminar el insumo.');
            }
        }
    }

    static searchItems(event) {
        const searchTerm = event.target.value.toLowerCase();
        // Aquí debes implementar la lógica de búsqueda.  Puedes filtrar los
        // elementos que ya están en la tabla (si la cantidad de datos es pequeña)
        // o realizar una nueva consulta a Firestore (si la cantidad de datos es grande).
        // Por ahora, lo dejaremos como un placeholder.
        console.log(`Buscando: ${searchTerm}`);
        // **TODO:** Implementar la lógica de búsqueda.
    }

    static showLoading() {
        document.getElementById('loadingIndicator').style.display = 'flex';
    }

    static hideLoading() {
        document.getElementById('loadingIndicator').style.display = 'none';
    }

    static showAuthError(message) {
        const authMessage = document.getElementById('authMessage');
        authMessage.textContent = message;
        authMessage.style.display = 'block';
    }

    static showError(message) {
        alert(`Error: ${message}`); // Usar un alert simple por ahora
    }

    static showSuccess(message) {
        alert(`Éxito: ${message}`); // Usar un alert simple por ahora
    }

    static getErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/wrong-password':
                return 'Contraseña incorrecta.';
            case 'auth/user-not-found':
                return 'Usuario no encontrado.';
            case 'auth/invalid-email':
                return 'Correo electrónico inválido.';
            case 'auth/user-disabled':
                return 'Este usuario ha sido deshabilitado.';
            default:
                return 'Error de autenticación.';
        }
    }

    static showAuth() {
        document.getElementById('dashboardContainer').style.display = 'none';
        document.getElementById('authContainer').style.display = 'flex';
    }

    static showDashboard(role) {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('dashboardContainer').style.display = 'flex';

        // Ocultar todas las secciones por defecto
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.display = 'none';
        });

        // Mostrar secciones específicas según el rol
        if (role === 'administrador' || role === 'CEO' || role === 'gerente') {
            document.getElementById('inventorySection').style.display = 'block';
            document.getElementById('promotionsSection').style.display = 'block';
            document.getElementById('reportsSection').style.display = 'block';
        } else if (role === 'cajero') {
            document.getElementById('ventasSection').style.display = 'block'; // Asumiendo que tienes una sección de ventas
        }
    }

    static showPasswordModal() {
        const modal = document.getElementById('passwordModal');
        modal.style.display = 'flex';
    }

    static closePasswordModal() {
        const modal = document.getElementById('passwordModal');
        modal.style.display = 'none';
    }

    static async changePassword(event) {
        event.preventDefault();

        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            AdminUI.showError('Las contraseñas no coinciden.');
            return;
        }

        if (newPassword.length < 6) {
            AdminUI.showError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        try {
            const user = firebase.auth.currentUser; //Obtenemos el usuario logeado

            await user.updatePassword(newPassword); //Funcion de firebase para cambiar la contraseña
            AdminUI.showSuccess('Contraseña actualizada correctamente.');
            AdminUI.closePasswordModal();
        } catch (error) {
            console.error('Error al cambiar la contraseña:', error);
            AdminUI.showError('Error al cambiar la contraseña.');
        }
    }

    static handleSidebarClick(event) {
        const section = event.target.dataset.section;
        AdminUI.showSection(section);
    }

    static showSection(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.display = 'none';
        });

        // Mostrar la sección seleccionada
        document.getElementById(sectionId + 'Section').style.display = 'block';
    }

    static updateUserRoleDisplay(role) {
        document.getElementById('userRole').textContent = `Rol: ${role}`;
    }

    static async exportInventoryToPdf() {
        try {
            const inventory = await AdminUI.getAllInventoryItems(); // Obtener todos los items del inventario

            if (!inventory || inventory.length === 0) {
                AdminUI.showError("No hay datos de inventario para exportar.");
                return;
            }

            // Configuración del documento PDF
            const doc = new jspdf.jsPDF();
            doc.text("Inventario", 10, 10);

            // Encabezados de la tabla
            const headers = ["Nombre", "Cantidad", "Unidad", "Precio", "Proveedor", "Caducidad", "Categoría", "Ubicación", "Notas"];

            // Data para la tabla
            const data = inventory.map(item => [
                item.name,
                item.quantity,
                item.unit,
                item.costPrice,
                item.supplier,
                item.expirationDate,
                item.category,
                item.location,
                item.notes
            ]);

            // Generar la tabla con autotable
            doc.autoTable({
                head: [headers],
                body: data,
            });

            // Guardar el PDF
            doc.save("inventario.pdf");

        } catch (error) {
            console.error("Error al exportar a PDF:", error);
            AdminUI.showError("Error al exportar el inventario a PDF.");
        }
    }

    static async getAllInventoryItems() {
        //Obtener el inventario sin los snapshot para el PDF
        try {
            const q = firebase.query(firebase.collection(firebase.db, 'inventory'));
            const querySnapshot = await firebase.getDocs(q);
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc.data());
            });
            return items;
        } catch (error) {
            console.error("Error al obtener el inventario:", error);
            AdminUI.showError("Error al obtener el inventario.");
            return null
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => AdminUI.init());
