(function() {
    document.addEventListener("DOMContentLoaded", () => {
        // Menú Hamburguesa
        const menuToggle = document.getElementById('menu-toggle');
        const menu = document.getElementById('menu');

        menuToggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            menuToggle.classList.toggle('active'); // Agrega esta línea
        });

        // Cerrar menú al hacer clic en un enlace
        document.querySelectorAll('#menu a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                menuToggle.classList.remove('active'); // Agrega esta línea
            });
        });

        // Cerrar menú al hacer clic fuera de él
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !menuToggle.contains(e.target) && menu.classList.contains('active')) {
                menu.classList.remove('active');
                menuToggle.classList.remove('active'); // Agrega esta línea
            }
        });

        // Rotación de Logos
        const logos = document.querySelectorAll('.logo-carousel img');
        let currentLogo = 0;

        const rotateLogo = () => {
            logos.forEach((logo, index) => {
                logo.classList.remove('logo-active');
                if (index === currentLogo) logo.classList.add('logo-active');
            });
            currentLogo = (currentLogo + 
