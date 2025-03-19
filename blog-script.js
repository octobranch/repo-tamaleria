document.addEventListener('DOMContentLoaded', () => {
    // 📌 MENÚ HAMBURGUESA  
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('nav');
    const menuItems = document.getElementById('menu-items');

    if (menuToggle && nav && menuItems) {
        menuToggle.addEventListener('click', (event) => {
            event.preventDefault();
            
            // Alternar clases  
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
            menuItems.classList.toggle('show');

            // Asegurar que el menú cambia su visibilidad correctamente  
            if (menuItems.classList.contains('show')) {
                menuItems.style.display = 'flex';
            } else {
                menuItems.style.display = 'none';
            }
        });

        // Cerrar menú al hacer clic en un enlace  
        menuItems.addEventListener('click', (event) => {
            if (event.target.tagName === 'A') {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
                menuItems.classList.remove('show');
                menuItems.style.display = 'none';
            }
        });
    } else {
        console.error('❌ Error: Uno o más elementos del menú hamburguesa no se encontraron.');
    }

    // 📌 FUNCIÓN DE BÚSQUEDA  
    const searchInput = document.querySelector('.busqueda input[type="text"]');
    const articulos = document.querySelectorAll('.articulo');

    if (searchInput && articulos.length > 0) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            articulos.forEach(articulo => {
                const titulo = articulo.querySelector('h3').textContent.toLowerCase();
                const contenido = articulo.querySelector('p').textContent.toLowerCase();

                if (titulo.includes(searchTerm) || contenido.includes(searchTerm)) {
                    articulo.style.display = 'block';
                } else {
                    articulo.style.display = 'none';
                }
            });
        });
    } else {
        console.warn('⚠️ Advertencia: No se encontraron artículos para la búsqueda.');
    }

    // 📌 FUNCIÓN "MOSTRAR MÁS ARTÍCULOS"  
    const articulosOcultos = Array.from(document.querySelectorAll('.articulo')).slice(3); // Obtener artículos después del tercero  

    if (articulosOcultos.length > 0) {
        articulosOcultos.forEach(articulo => {
            articulo.classList.add('oculto'); // Agregar clase 'oculto' en lugar de ocultar directamente
        });

        const btnMostrarMas = document.createElement('button');
        btnMostrarMas.textContent = 'Mostrar más artículos';
        btnMostrarMas.classList.add('mostrar-mas-btn');

        const blogArticles = document.querySelector('.blog-articles');
        if (blogArticles) {
            blogArticles.appendChild(btnMostrarMas);

            btnMostrarMas.addEventListener('click', () => {
                articulosOcultos.forEach(articulo => {
                    articulo.classList.remove('oculto'); // Mostrar artículos
                });
                btnMostrarMas.style.display = 'none'; // Ocultar el botón después de mostrar todos los artículos
            });
        }
    }
});
