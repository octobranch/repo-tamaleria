class AdminUI {
    static init() {
        this.bindEvents();
        this.checkAuthState();
    }

    static bindEvents() {
        // Autenticación
        document.getElementById('loginBtn').addEventListener('click', this.handleLogin);
        document.getElementById('logoutBtn').addEventListener('click', this.handleLogout);
        document.getElementById('addItemBtn').addEventListener('click', () => this.showModal());
        document.getElementById('itemForm').addEventListener('submit', this.saveItem);
        document.getElementById('searchInput').addEventListener('input', this.searchItems);
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
                const isAdmin = await this.verifyAdminRole(user.uid);
                if (isAdmin) {
                    this.showInventory();
                    this.loadInventory();
                } else {
                    this.showAuthError('No tienes permisos de administrador');
                    await firebase.signOut(firebase.auth); // Usa firebase.auth aquí
                }
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
            await firebase.signInWithEmailAndPassword(firebase.auth, email, password); // Usa firebase.auth aquí
        } catch (error) {
            this.showAuthError(this.getErrorMessage(error.code));
        }
    }

    static async handleLogout() {
        try {
            await firebase.signOut(firebase.auth); // Usa firebase.auth aquí
            window.location.reload();
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
            lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
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

    static showInventory() {
        document.getElementById('authContainer').style.display = 'none';
        document.getElementById('inventoryContainer').style.display = 'block';
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => AdminUI.init());
