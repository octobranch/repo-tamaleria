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
    });

    // Cerrar menú al hacer clic en un enlace
    menuItems.addEventListener('click', (event) => {
      if (event.target.tagName === 'A') {
        nav.classList.remove('active');
        menuToggle.classList.remove('active');
      }
    });
  } else {
    console.error('❌ Error: Uno o más elementos del menú hamburguesa no se encontraron.');
  }

  // 📌 Carrusel de Logos
  const logos = document.querySelectorAll('.logo-carousel img');
  if (logos.length > 0) {
    let currentLogoIndex = 0;
    function cycleLogos() {
      logos.forEach(img => img.classList.remove('logo-active'));
      currentLogoIndex = (currentLogoIndex + 1) % logos.length;
      logos[currentLogoIndex].classList.add('logo-active');
    }
    setInterval(cycleLogos, 3000);
  }

  // 📌 Búsqueda en el blog
  const searchInput = document.querySelector('.busqueda input');
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
  }

  // 📌 Mostrar más artículos
  const articulosOcultos = Array.from(document.querySelectorAll('.articulo')).slice(3);

  if (articulosOcultos.length > 0) {
    articulosOcultos.forEach(articulo => articulo.style.display = 'none');

    const btnMostrarMas = document.createElement('button');
    btnMostrarMas.textContent = 'Mostrar más artículos';
    btnMostrarMas.classList.add('mostrar-mas-btn');

    const blogArticles = document.querySelector('.blog-articles');
    if (blogArticles) {
      blogArticles.appendChild(btnMostrarMas);

      btnMostrarMas.addEventListener('click', () => {
        articulosOcultos.forEach(articulo => articulo.style.display = 'block');
        btnMostrarMas.style.display = 'none';
      });
    }
  }
});
