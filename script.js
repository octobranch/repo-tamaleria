document.addEventListener('DOMContentLoaded', function() {
    // Menu Hamburguesa
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('nav');
    const menuItems = document.getElementById('menu-items');

    menuToggle.addEventListener('click', () => {
        const expanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', !expanded);
    });

    // Cerrar menú al hacer clic en un enlace
    menuItems.addEventListener('click', (event) => {
        if (event.target.tagName === 'A') {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', false);
        }
    });

    // Carrusel de Logos
    const logos = document.querySelectorAll('.logo-carousel img');
    let currentLogoIndex = 0;

    function cycleLogos() {
        logos[currentLogoIndex].classList.remove('logo-active');
        currentLogoIndex = (currentLogoIndex + 1) % logos.length;
        logos[currentLogoIndex].classList.add('logo-active');
    }

    setInterval(cycleLogos, 3000);

   // Sistema de Pedidos
    const pedido = {};
    const precios = {
        'Salsa Verde con Pollo': 40,
        'Mole con Pollo': 40,
        'Rajas con Queso': 40,
        'Tamal Ranchero': 40,
        'Guajolota (Tamal + $5)': 5,
        'Chocolate Artesanal': 60,
        'Arroz con Leche': 60,
        'Atole de Fresa': 60
    };

    let total = 0;

    // Inicializar el pedido con la cantidad en 0
    document.querySelectorAll('.producto-item').forEach(item => {
        const nombre = item.querySelector('p').textContent.trim();
        pedido[nombre] = {
            cantidad: 0,
            precio: precios[nombre],
            elemento: item
        };
    });

    // Función para actualizar la interfaz de usuario
    function actualizarInterfaz() {
        total = 0;
        document.querySelectorAll('.producto-item').forEach(item => {
            const nombre = item.querySelector('p').textContent.trim();
            const contador = item.querySelector('.contador');
            contador.textContent = pedido[nombre].cantidad;

            if (pedido[nombre].cantidad > 0) {
                item.style.backgroundColor = 'var(--negro)';
                item.style.color = 'var(--amarillo)';
            } else {
                item.style.backgroundColor = 'white';
                item.style.color = 'var(--negro)';
            }

            total += pedido[nombre].cantidad * pedido[nombre].precio;
        });

        document.getElementById('total').textContent = total;
    }

    // Eventos para los botones de sumar y restar
    document.querySelectorAll('.btn-cantidad').forEach(boton => {
        boton.addEventListener('click', () => {
            const nombreProducto = boton.dataset.producto;
            if (boton.classList.contains('sumar')) {
                pedido[nombreProducto].cantidad++;
            } else if (boton.classList.contains('restar') && pedido[nombreProducto].cantidad > 0) {
                pedido[nombreProducto].cantidad--;
            }
            actualizarInterfaz();
        });
    });


    // Botón de Ordenar
    const ordenarBtn = document.getElementById('ordenar-btn');

    ordenarBtn.addEventListener('click', () => {
        let mensaje = '¡Hola! Quiero ordenar:\n';
        let itemsPedido = false; // Variable para verificar si hay items en el pedido

        for (const nombre in pedido) {
            if (pedido[nombre].cantidad > 0) {
