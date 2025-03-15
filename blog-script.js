document.addEventListener('DOMContentLoaded', () => {
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

    // Funcionalidad de búsqueda
    const searchInput = document.querySelector('.busqueda input[type="text"]');
    const articulos = Array.from(document.querySelectorAll('.articulo')); // Convertir a Array
    
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

    // Mostrar más artículos (inicialmente ocultos)
    const articulosOcultos = articulos.slice(3); // Ocultar artículos después del tercero
    articulosOcultos.forEach(articulo => articulo.classList.add('hidden'));

    const btnMostrarMas = document.createElement('button');
    btnMostrarMas.textContent = 'Mostrar más artículos';
    btnMostrarMas.classList.add('mostrar-mas-btn');

    const blogArticles = document.querySelector('.blog-articles');
    blogArticles.appendChild(btnMostrarMas);

    btnMostrarMas.addEventListener('click', () => {
        articulosOcultos.forEach(articulo => articulo.classList.remove('hidden'));
        btnMostrarMas.style.display = 'none'; // Ocultar el botón después de mostrar todos los artículos
    });

    // Paginación con JavaScript
    const articulosPorPagina = 3;
    let paginaActual = 1;
    const numPaginas = Math.ceil(articulos.length / articulosPorPagina);

    const btnAnterior = document.querySelector('.pagina-anterior');
    const btnSiguiente = document.querySelector('.pagina-siguiente');

    function mostrarPagina(pagina) {
        articulos.forEach((articulo, index) => {
            if (index >= (pagina - 1) * articulosPorPagina && index < pagina * articulosPorPagina) {
                articulo.style.display = 'block';
            } else {
                articulo.style.display = 'none';
            }
        });
    }

     function actualizarBotones() {
        btnAnterior.style.display = (numPaginas > 1 && paginaActual > 1) ? 'inline-block' : 'none';
        btnSiguiente.style.display = (numPaginas > 1 && paginaActual < numPaginas) ? 'inline-block' : 'none';
    }

    btnAnterior.addEventListener('click', (e) => {
         e.preventDefault(); // Evitar la navegación
        if (paginaActual > 1) {
            paginaActual--;
            mostrarPagina(paginaActual);
            actualizarBotones();
        }
    });

    btnSiguiente.addEventListener('click', (e) => {
        e.preventDefault(); // Evitar la navegación
        if (paginaActual < numPaginas) {
            paginaActual++;
            mostrarPagina(paginaActual);
            actualizarBotones();
        }
    });

    //Estilos para "Mostrar más" y clase oculta
    const style = document.createElement('style');
    style.textContent = `
    .mostrar-mas-btn {
        display: inline-block;
        background-color: var(--negro);
        color: var(--amarillo);
        padding: 12px 25px;
        border-radius: 30px;
        text-decoration: none;
        font-weight: bold;
        margin: 20px auto; /* Centrar el botón */
        transition: background-color 0.3s, color 0.3s;
        cursor: pointer;
        border: none;
        box-shadow: 0 4px 6px rgba(0,0,0,0.15);
        display:block;
        text-align:center;
    }

    .mostrar-mas-btn:hover {
        background-color: var(--amarillo);
        color: var(--negro);
    }
     .articulo.hidden {
            display: none;
        }
    `;
    document.head.appendChild(style);

    mostrarPagina(paginaActual);
    actualizarBotones();

    // Ajuste de desplazamiento para el header fijo
    const headerHeight = document.querySelector('header').offsetHeight;
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const targetOffsetTop = targetElement.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetOffsetTop,
                    behavior: 'smooth' // Opcional: para un desplazamiento suave
                });
            }
        });
    });
});
