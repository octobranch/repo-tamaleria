document.addEventListener('DOMContentLoaded', () => {
    // Menu Hamburguesa
    const menuToggle = document.getElementById('menu-toggle');
    const nav = document.querySelector('nav');
    const menuItems = document.getElementById('menu-items');

    if (menuToggle && nav && menuItems) {
        menuToggle.addEventListener('click', (event) => {
            event.preventDefault(); // Evita comportamientos inesperados
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
            menuItems.classList.toggle('show');
        });

        // Cerrar menú al hacer clic en un enlace
        menuItems.addEventListener('click', (event) => {
            if (event.target.tagName === 'A') {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
                menuItems.classList.remove('show');
            }
        });
    } else {
        console.error('Uno o más elementos del menú hamburguesa no se encontraron.');
    }

    // Funcionalidad de búsqueda (sin cambios, asumiendo que funciona bien)
    const searchInput = document.querySelector('.busqueda input[type="text"]');
    const articulos = document.querySelectorAll('.articulo');

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

    // Mostrar más artículos (sin cambios, asumiendo que funciona bien)
    const articulosOcultos = Array.from(document.querySelectorAll('.articulo')).slice(3); // Obtener artículos después del tercero

    articulosOcultos.forEach(articulo => {
        articulo.classList.add('oculto'); // Agregar clase 'oculto' en lugar de ocultar directamente
    });

    const btnMostrarMas = document.createElement('button');
    btnMostrarMas.textContent = 'Mostrar más artículos';
    btnMostrarMas.classList.add('mostrar-mas-btn');

    const blogArticles = document.querySelector('.blog-articles');
    blogArticles.appendChild(btnMostrarMas);

    btnMostrarMas.addEventListener('click', () => {
        articulosOcultos.forEach(articulo => {
            articulo.classList.remove('oculto'); // Eliminar clase 'oculto' para mostrar
        });
        btnMostrarMas.style.display = 'none'; // Ocultar el botón después de mostrar todos los artículos
    });
});
