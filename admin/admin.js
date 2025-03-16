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
        document.getElementById('profileBtn').addEventListener('click', this.showProfileModal); // Mostrar modal de perfil
        document.getElementById('profileForm').addEventListener('submit', this.validateProfileForm); // Guardar cambios del perfil

        //Inventario
        document.getElementById('addItemBtn').addEventListener('click', () => this.showModal());
        document.getElementById('itemForm').addEventListener('submit', this.validateItemForm); // Validar formulario antes de guardar
        document.getElementById('searchInput').addEventListener('input', this.searchItems);

        // Promociones
        document.getElementById('addPromotionBtn').addEventListener('click', () => this.showPromotionModal());
        document.getElementById('promotionForm').addEventListener('submit', this.validatePromotionForm);

        // Reportes
        document.getElementById('generateReportBtn').addEventListener('click', this.generateReport);

        // Modales
        document.getElementById('passwordForm').addEventListener('submit', this.validatePasswordForm); // Validar formulario antes de cambiar contraseña

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
                const unsubscribe = firebase.auth
