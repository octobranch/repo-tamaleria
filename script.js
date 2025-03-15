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

        // Obtener los botones de sumar y restar dentro del producto-item
        const btnSumar = item.querySelector('.sumar');
        const btnRestar = item.querySelector('.restar');

        // Agregar event listeners a los botones de sumar y restar
        btnSumar.addEventListener('click', () => {
            pedido[nombre].cantidad++;
            actualizarInterfaz();
        });

        btnRestar.addEventListener('click', () => {
            if (pedido[nombre].cantidad > 0) {
                pedido[nombre].cantidad--;
                actualizarInterfaz();
            }
        });
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

    // Botón de Ordenar
    const ordenarBtn = document.getElementById('ordenar-btn');

    ordenarBtn.addEventListener('click', () => {
        let mensaje = '¡Hola! Quiero ordenar:\n';
        let itemsPedido = false; // Variable para verificar si hay items en el pedido

        for (const nombre in pedido) {
            if (pedido[nombre].cantidad > 0) {
                mensaje += `- ${nombre}: ${pedido[nombre].cantidad}\n`;
                itemsPedido = true; // Se encontraron items en el pedido
            }
        }

        if (!itemsPedido) {
            alert('Por favor, selecciona al menos un producto.');
            return; // No enviar el mensaje si no hay items
        }

        mensaje += `\nTotal: $${total}`;
        const telefono = '529981901967'; // Reemplaza con el número de teléfono real
        const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    });

    // Formulario de Contacto
    const enviarContactoBtn = document.getElementById('enviar-contacto');

    enviarContactoBtn.addEventListener('click', () => {
        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const mensaje = document.getElementById('mensaje').value.trim();

        if (!nombre || !email || !mensaje) {
            alert('Por favor, complete todos los campos del formulario.');
            return;
        }

        // Validación del formato del correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, ingrese un correo electrónico válido.');
            return;
        }

        let mensajeWhatsApp = `¡Hola! Soy ${nombre} (${email}) y quiero contactarlos con el siguiente mensaje:\n\n${mensaje}`;
        const telefono = '529981901967'; // Reemplaza con el número de teléfono real
        const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeWhatsApp)}`;
        window.open(url, '_blank');
    });

     // Ajuste de desplazamiento para el header fijo
     const headerHeight = document.querySelector('header').offsetHeight;

     document.querySelectorAll('a[href^="#"]').forEach(anchor => {
         anchor.addEventListener('click', function (e) {
             e.preventDefault();

             const targetId = this.getAttribute('href').substring(1);
             const targetElement = document.getElementById(targetId);

             if (targetElement) {
                 const targetOffsetTop = targetElement.offsetTop - headerHeight + 10; // Ajuste para el desplazamiento

                 window.scrollTo({
                     top: targetOffsetTop,
                     behavior: 'smooth'
                 });
             }
         });
     });

        // Ajuste del enlace de contacto en el footer
     const contactoFooter = document.querySelector('.footer-info a[href="tel:+529981901967"]');
     if (contactoFooter) {
         contactoFooter.addEventListener('click', function(event) {
             event.preventDefault(); // Evita la acción predeterminada del enlace
             window.location.href = "tel:+529981901967"; // Redirige directamente al número de teléfono
         });
     }

    // Inicializar ScrollReveal
    ScrollReveal({
        reset: false,
        distance: '60px',
        duration: 1000,
        delay: 200
    });

    ScrollReveal().reveal('.section h2, #nosotros .nosotros-content, #menu .menu-category, .contacto-content', { delay: 200, origin: 'top' });
    ScrollReveal().reveal('.footer-content', { delay: 200, origin: 'bottom' });
});
