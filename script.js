(function() {
    document.addEventListener("DOMContentLoaded", () => {
        // Rotación de Logos
        const logos = document.querySelectorAll('.logo-carousel img');
        let currentLogo = 0;

        const rotateLogo = () => {
            logos.forEach((logo, index) => {
                logo.classList.remove('logo-active');
                if (index === currentLogo) logo.classList.add('logo-active');
            });
            currentLogo = (currentLogo + 1) % logos.length;
        };
        if (logos.length > 1) setInterval(rotateLogo, 5000);

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

        document.querySelectorAll('.producto-item').forEach(item => {
            const nombre = item.querySelector('p').textContent.trim();
            const contador = item.querySelector('.contador');

            pedido[nombre] = {
                cantidad: 0,
                precio: precios[nombre], // Usamos el precio directamente del nombre del producto
                elemento: item
            };

            item.querySelector('.sumar').addEventListener('click', () => {
                pedido[nombre].cantidad++;
                actualizarInterfaz();
            });

            item.querySelector('.restar').addEventListener('click', () => {
                if (pedido[nombre].cantidad > 0) {
                    pedido[nombre].cantidad--;
                    actualizarInterfaz();
                }
            });
        });

        function actualizarInterfaz() {
            total = 0;

            // Primero, actualizamos los contadores y el estilo de los productos
            document.querySelectorAll('.producto-item').forEach(item => {
                const nombre = item.querySelector('p').textContent.trim();
                const contador = item.querySelector('.contador');
                contador.textContent = pedido[nombre].cantidad; // Actualizar el contador en la interfaz

                if (pedido[nombre].cantidad > 0) {
                    item.style.backgroundColor = 'var(--negro)';
                    item.style.color = 'var(--amarillo)';
                } else {
                    item.style.backgroundColor = 'white';
                    item.style.color = 'var(--negro)';
                }
            });

            // Luego, recalculamos el total
            Object.keys(pedido).forEach(nombre => {
                const item = pedido[nombre];
                total += item.cantidad * item.precio;
            });

            // Actualizar el total en la interfaz
            document.getElementById('total').textContent = total;
        }

        // WhatsApp Pedidos
        document.getElementById('ordenar-btn').addEventListener('click', () => {
            enviarPedidoPorWhatsApp();
        });

        function enviarPedidoPorWhatsApp() {
            const items = Object.entries(pedido)
                .filter(([_, item]) => item.cantidad > 0)
                .map(([nombre, item]) => `• ${nombre} x${item.cantidad} - $${item.cantidad * item.precio}`)
                .join('\n');

            if (!items) {
                alert('Selecciona al menos un producto');
                return;
            }

            const mensaje = `📦 *ORDEN LA TAMALERÍA CANCÚN*\n\n${items}\n\n*Total: $${total}*\n\n📌 Gracias por tu compra!`;
            window.open(`https://wa.me/+529981901967?text=${encodeURIComponent(mensaje)}`);
        }

        // Contacto WhatsApp
        document.getElementById('enviar-contacto').addEventListener('click', () => {
            enviarMensajeContactoPorWhatsApp();
        });

        function enviarMensajeContactoPorWhatsApp() {
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const mensaje = document.getElementById('mensaje').value;

            if (!nombre || !email || !mensaje) {
                alert('Por favor, complete todos los campos del formulario.');
                return;
            }

            const texto = `Hola, soy ${nombre} (${email}).\n\n${mensaje}`;
            window.open(`https://wa.me/+529981901967?text=${encodeURIComponent(texto)}`);
        }
    });
})();
