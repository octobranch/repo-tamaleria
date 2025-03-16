 class AdminUI {
    static init() {
        this.bindEvents();
        this.checkAuthState();
    }

    static bindEvents() {
        // Autenticación
        document.getElementById('loginBtn').addEventListener('click', this.handleLogin.bind(this));
        document.getElementById('logoutBtn').addEventListener('click', this.handleLogout.bind(this));

        // Dashboard
        document.getElementById('profileBtn').addEventListener('click', this.showProfileModal.bind(this));
        document.getElementById('profileForm').addEventListener('submit', this.validateProfileForm.bind(this));

        // Inventario
        document.getElementById('addItemBtn').addEventListener('click', () => this.showModal());
        document.getElementById('itemForm').addEventListener('submit', AdminInventory.validateItemForm.bind(AdminInventory));
        document.getElementById('searchInput').addEventListener('input', AdminInventory.searchItems.bind(AdminInventory));
        document.getElementById('exportPdfBtn').addEventListener('click', AdminInventory.exportInventoryToPdf.bind(AdminInventory));

        // Promociones
        document.getElementById('addPromotionBtn').addEventListener('click', () => this.showPromotionModal());
        document.getElementById('promotionForm').addEventListener('submit', AdminPromotions.validatePromotionForm.bind(AdminPromotions));

        // Reportes
        document.getElementById('generateReportBtn').addEventListener('click', this.generateReport.bind(this));

        // Modales
        document.getElementById('passwordForm').addEventListener('submit', this.validatePasswordForm.bind(this));

        // Sidebar
        document.querySelectorAll('.admin-sidebar nav ul li').forEach(item => {
            item.addEventListener('click', this.handleSidebarClick.bind(this));
        });
    }

    static async checkAuthState() {
        try {
            const user = await new Promise((resolve, reject) => {
                const unsubscribe = firebase.auth().onAuthStateChanged(user => {
                    unsubscribe();
                    resolve(user);
                }, reject);
            });

            if (user) {
                const userDoc = await firebase.getDoc(firebase.doc(firebase.db, 'admins', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const role = userData.role;

                    this.showDashboard(role);
                    this.updateUserRoleDisplay(role);

                    // Cargar datos según el rol
                    if (['administrador', 'CEO', 'gerente'].includes(role)) {
                        AdminInventory.loadItems();
                        AdminPromotions.loadPromotions();
                        this.loadWebsiteMetrics();
                    } else if (role === 'cajero') {
                        // TODO: Implementar la sección de ventas
                    }
                } else {
                    this.showAuthError('No tienes permisos.');
                    await firebase.auth().signOut();
                }
            } else {
                this.showAuth();
            }
        } catch (error) {
            console.error('Error verifying auth:', error);
        }
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
            await firebase.auth().signOut();
            this.showAuth();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    static showModal(itemId = null) {
        const modal = document.getElementById('itemModal');
        modal.style.display = 'flex';
        const form = document.getElementById('itemForm');
        form.reset();
        form.dataset.itemId = itemId || '';

        if (itemId) {
            AdminInventory.loadItemData(itemId);
        }
    }

    static closeModal() {
        const modal = document.getElementById('itemModal');
        modal.style.display = 'none';
    }

    static showAuthError(message) {
        const authMessage = document.getElementById('authMessage');
        authMessage.textContent = message;
        authMessage.style.display = 'block';
    }

    static showError(message) {
        alert(`Error: ${message}`);
    }

    static showSuccess(message) {
        alert(`Éxito: ${message}`);
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

        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.display = 'none';
        });

        // Mostrar secciones según el rol
        if (['administrador', 'CEO', 'gerente'].includes(role)) {
            document.getElementById('inventorySection').style.display = 'block';
            document.getElementById('promotionsSection').style.display = 'block';
            document.getElementById('reportsSection').style.display = 'block';
            document.getElementById('dashboardSection').style.display = 'block'; // Mostrar el Dashboard
        } else if (role === 'cajero') {
            // TODO: Implementar la sección de ventas
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

    static validatePasswordForm(event) {
        event.preventDefault();

        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!newPassword || newPassword.trim() === "") {
            AdminUI.showError('Por favor, ingrese la nueva contraseña.');
            return;
        }

        if (newPassword.length < 6) {
            AdminUI.showError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            AdminUI.showError('Las contraseñas no coinciden.');
            return;
        }

        AdminUI.changePassword(event);
    }

    static async changePassword(event) {
        event.preventDefault();

        const newPassword = document.getElementById('newPassword').value;

        try {
            const user = firebase.auth().currentUser;
            await user.updatePassword(newPassword);
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
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.display = 'none';
        });

        document.getElementById(sectionId + 'Section').style.display = 'block';
    }

    static updateUserRoleDisplay(role) {
        document.getElementById('userRole').textContent = `Rol: ${role}`;
    }

    // Métricas del sitio web
    static async loadWebsiteMetrics() {
        try {
            const visits = await this.getMetric('visits');
            const pageViews = await this.getMetric('pageViews');

            document.getElementById('totalVisits').textContent = visits;
            document.getElementById('totalPageViews').textContent = pageViews;
        } catch (error) {
            console.error("Error loading website metrics:", error);
            document.getElementById('totalVisits').textContent = 'Error';
            document.getElementById('totalPageViews').textContent = 'Error';
        }
    }

    static async getMetric(metricName) {
        try {
            const doc = await firebase.getDoc(firebase.doc(firebase.db, 'website_metrics', metricName));
            if (doc.exists()) {
                return doc.data().count || 0;
            } else {
                return 0;
            }
        } catch (error) {
            console.error(`Error getting ${metricName} metric:`, error);
            return 'Error';
        }
    }

    static showProfileModal() {
        document.getElementById('profileModal').style.display = 'flex';
    }

    static closeProfileModal() {
        document.getElementById('profileModal').style.display = 'none';
    }

    static validateProfileForm(e) {
        e.preventDefault();
        const newEmail = document.getElementById('newEmail').value;
        const newPassword = document.getElementById('newPassword').value;

        if (!newEmail && !newPassword) {
            alert('Por favor, introduce un nuevo correo electrónico o una nueva contraseña.');
            return;
        }

        const user = firebase.auth().currentUser;

        if (newEmail) {
            user.updateEmail(newEmail)
                .then(() => {
                    alert('Correo electrónico actualizado correctamente.');
                })
                .catch((error) => {
                    console.error('Error al actualizar el correo electrónico:', error);
                    alert('Error al actualizar el correo electrónico.');
                });
        }

        if (newPassword) {
            user.updatePassword(newPassword)
                .then(() => {
                    alert('Contraseña actualizada correctamente.');
                    AdminUI.closeProfileModal();
                })
                .catch((error) => {
                    console.error('Error al actualizar la contraseña:', error);
                    alert('Error al actualizar la contraseña.');
                });
        }
    }
    static generateReport() {
        const reportType = document.getElementById('reportType').value;
        const reportStartDate = document.getElementById('reportStartDate').value;
        const reportEndDate = document.getElementById('reportEndDate').value;

        // Aquí puedes agregar la lógica para generar diferentes tipos de reportes
        if (reportType === 'sales') {
            // Generar reporte de ventas
            console.log('Generando reporte de ventas desde', reportStartDate, 'hasta', reportEndDate);
        } else if (reportType === 'inventory') {
            // Generar reporte de inventario
            console.log('Generando reporte de inventario desde', reportStartDate, 'hasta', reportEndDate);
        }
    }

}

class AdminInventory {
    static async loadItems() {
        try {
            AdminUI.showLoading();
            const q = firebase.query(firebase.collection(firebase.db, 'inventory'));

            const unsubscribe = firebase.onSnapshot(q, (snapshot) => {
                const items = [];
                snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
                this.renderInventory(items);
                AdminUI.hideLoading();
                this.updateTotalMetrics();
            });

            window.addEventListener('beforeunload', unsubscribe);
        } catch (error) {
            AdminUI.showError('Error al cargar inventario');
        }
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
                AdminUI.showError("No se encontró el insumo.");
            }
        } catch (error) {
            console.error("Error al cargar datos del insumo:", error);
            AdminUI.showError("Error al cargar los datos.");
        }
    }

    static validateItemForm(event) {
        event.preventDefault();

        const itemName = document.getElementById('itemName').value;
        const itemQuantity = document.getElementById('itemQuantity').value;
        const itemUnit = document.getElementById('itemUnit').value;
        const itemCostPrice = document.getElementById('itemCostPrice').value;

        if (!itemName || itemName.trim() === "") {
            AdminUI.showError('Por favor, ingrese el nombre del insumo.');
            return;
        }

        if (!itemQuantity || isNaN(itemQuantity) || parseFloat(itemQuantity) <= 0) {
            AdminUI.showError('Por favor, ingrese una cantidad válida mayor que cero.');
            return;
        }

        if (!itemUnit) {
            AdminUI.showError('Por favor, seleccione la unidad de medida.');
            return;
        }
        if (!itemCostPrice) {
             AdminUI.showError('Por favor, ingrese el precio del producto.');
             return;
         }
        AdminInventory.saveItem(event);
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
                const itemRef = firebase.doc(firebase.db, 'inventory', itemId);
                await firebase.updateDoc(itemRef, itemData);
                AdminUI.showSuccess('Insumo actualizado correctamente.');
            } else {
                await firebase.addDoc(firebase.collection(firebase.db, 'inventory'), itemData);
                AdminUI.showSuccess('Insumo guardado correctamente.');
            }

            AdminUI.closeModal();
            AdminInventory.loadItems();
        } catch (error) {
            console.error('Error al guardar/actualizar insumo:', error);
            AdminUI.showError('Error al guardar/actualizar el insumo.');
        }
    }

    static renderInventory(items) {
        const tbody = document.getElementById('inventoryList');
        tbody.innerHTML = '';

        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
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
                    <button class="icon-btn edit-btn" data-id="${item.id}" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </button>
                    <button class="icon-btn delete-btn" data-id="${item.id}" title="Eliminar">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                </td>
            `;
            tbody.appendChild(row);

            row.querySelector('.edit-btn').addEventListener('click', () => AdminUI.showModal(item.id));
            row.querySelector('.delete-btn').addEventListener('click', () => AdminInventory.handleDelete(item.id));
        });
    }

    static async handleDelete(itemId) {
        if (confirm("¿Estás seguro de que quieres eliminar este insumo?")) {
            try {
                await firebase.deleteDoc(firebase.doc(firebase.db, 'inventory', itemId));
                AdminUI.showSuccess('Insumo eliminado correctamente.');
                AdminInventory.loadItems();
            } catch (error) {
                console.error('Error al eliminar insumo:', error);
                AdminUI.showError('Error al eliminar el insumo.');
            }
        }
    }

    static searchItems(event) {
        const searchTerm = event.target.value.toLowerCase();
        AdminInventory.filterInventory(searchTerm);
    }

    static async filterInventory(searchTerm) {
        const q = firebase.query(firebase.collection(firebase.db, 'inventory'));

        const unsubscribe = firebase.onSnapshot(q, (snapshot) => {
            const items = [];
            snapshot.forEach(doc => {
                let item = doc.data()
                if (item.name.toLowerCase().includes(searchTerm) || item.category.toLowerCase().includes(searchTerm) || item.description.toLowerCase().includes(searchTerm)) {
                    items.push({ id: doc.id, ...doc.data() })
                }
            });
            this.renderInventory(items);
        });
    }
   static async exportInventoryToPdf() {
         try {
             const inventory = await AdminInventory.getAllInventoryItems(); // Obtener todos los items del inventario
 
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
 
     /**
      * Obtiene todos los items del inventario desde Firestore.
      * @returns {Promise<Array<Object>>} Un array de objetos que representan los insumos.
      */
     static async getAllInventoryItems() {
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
     static async updateTotalMetrics() {
         try {
             const snapshot = await firebase.db.collection('inventory').get();
             let totalItems = snapshot.size;
             let totalValue = 0;
 
             snapshot.forEach(doc => {
                 const item = doc.data();
                 totalValue += (item.quantity || 0) * (item.costPrice || 0);
             });
 
             document.getElementById('totalItems').textContent = totalItems;
             document.getElementById('totalValue').textContent = totalValue.toFixed(2);
         } catch (error) {
             console.error("Error updating total metrics:", error);
             document.getElementById('totalItems').textContent = 'Error';
             document.getElementById('totalValue').textContent = 'Error';
         }
     }
 }

class AdminPromotions {
    static async loadPromotions() {
        try {
            const promotionList = document.getElementById('promotionList');
            promotionList.innerHTML = '';

            const q = firebase.query(firebase.collection(firebase.db, 'promotions'));

            const unsubscribe = firebase.onSnapshot(q, (snapshot) => {
                const promotions = [];
                snapshot.forEach(doc => promotions.push({ id: doc.id, ...doc.data() }));
                this.renderPromotions(promotions);
            });

            window.addEventListener('beforeunload', unsubscribe);
        } catch (error) {
            AdminUI.showError('Error al cargar promociones');
        }
    }

    static renderPromotions(promotions) {
        const promotionList = document.getElementById('promotionList');
        promotionList.innerHTML = '';

        promotions.forEach(promotion => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${promotion.name}</td>
                <td>${promotion.description}</td>
                <td>${promotion.discount}</td>
                <td>${promotion.startDate}</td>
                <td>${promotion.endDate}</td>
                <td>${promotion.active ? 'Sí' : 'No'}</td>
                <td>
                    <button class="edit-btn" data-id="${promotion.id}">Editar</button>
                    <button class="delete-btn" data-id="${promotion.id}">Eliminar</button>
                </td>
            `;
            promotionList.appendChild(row);

            row.querySelector('.edit-btn').addEventListener('click', () => this.showModal(promotion.id));
            row.querySelector('.delete-btn').addEventListener('click', () => this.handleDelete(promotion.id));
        });
    }

    static validatePromotionForm(event) {
        event.preventDefault();

        const promotionName = document.getElementById('promotionName').value;
        const promotionDescription = document.getElementById('promotionDescription').value;
        const promotionDiscount = document.getElementById('promotionDiscount').value;
        const promotionStartDate = document.getElementById('promotionStartDate').value;
        const promotionEndDate = document.getElementById('promotionEndDate').value;

        if (!promotionName || !promotionDescription || !promotionDiscount || !promotionStartDate || !promotionEndDate) {
            AdminUI.showError('Por favor, complete todos los campos requeridos.');
            return;
        }

        AdminPromotions.savePromotion(event);
    }

    static async savePromotion(event) {
        event.preventDefault();

        const promotionName = document.getElementById('promotionName').value;
        const promotionDescription = document.getElementById('promotionDescription').value;
        const promotionDiscount = document.getElementById('promotionDiscount').value;
        const promotionStartDate = document.getElementById('promotionStartDate').value;
        const promotionEndDate = document.getElementById('promotionEndDate').value;

        const promotionData = {
            name: promotionName,
            description: promotionDescription,
            discount: promotionDiscount,
            startDate: promotionStartDate,
            endDate: promotionEndDate
        };

        try {
            const promotionId = document.getElementById('promotionForm').dataset.promotionId;

            if (promotionId) {
                const promotionRef = firebase.doc(firebase.db, 'promotions', promotionId);
                await firebase.updateDoc(promotionRef, promotionData);
                AdminUI.showSuccess('Promoción actualizada correctamente.');
            } else {
                await firebase.addDoc(firebase.collection(firebase.db, 'promotions'), promotionData);
                AdminUI.showSuccess('Promoción guardada correctamente.');
            }

            AdminUI.closeModal();
            AdminPromotions.loadPromotions();
        } catch (error) {
            console.error('Error al guardar/actualizar promoción:', error);
            AdminUI.showError('Error al guardar/actualizar la promoción.');
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => AdminUI.init());
