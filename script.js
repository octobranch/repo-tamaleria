document.addEventListener("DOMContentLoaded", () => {
    // Rotación de Logos
    const logos = document.querySelectorAll('.logo-carousel img');
    let currentLogo = 0;
    
    function rotateLogo() {
        logos.forEach((logo, index) => {
            logo.classList.remove('logo-active');
            if (index === currentLogo) logo.classList.add('logo-active');
        });
        currentLogo = (currentLogo + 1) % logos.length;
    }
    if (logos.length > 0) setInterval(rotateLogo, 5000);

    // Sistema de Pedidos
    const productos = document.querySelectorAll('.producto');
    productos.forEach(producto => {
        producto.addEventListener('click', () => {
            producto.classList.toggle('seleccionado');
            producto.style.backgroundColor = producto.classList.contains('seleccionado') 
                ? 'var(--negro)' 
                : 'var(--gris)';
        });
    });

    // WhatsApp Orders
    document.getElementById('ordenar-btn').addEventListener('click', () => {
        const pedido = Array.from(document.querySelectorAll('.seleccionado'))
            .map(item => `• ${item.textContent.trim()}`)
            .join('\n');
        
        const mensaje = `📦 *Pedido para La Tamalería Cancún*:\n\n${pedido}\n\n📍 Zona Hotelera, Cancún`;
        window.open(`https://wa.me/+529981901967?text=${encodeURIComponent(mensaje)}`);
    });
});
